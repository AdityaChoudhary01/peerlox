"use server";

import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Note from "@/lib/models/Note";
import Blog from "@/lib/models/Blog";
import Collection from "@/lib/models/Collection";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFileFromR2 } from "@/lib/r2"; // ✅ Imported R2 Helper

// Helper to check admin status
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

/**
 * FETCH SYSTEM STATS
 */
export async function getAdminStats() {
  await connectDB();
  try {
    const [userCount, noteCount, blogCount] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Blog.countDocuments(),
    ]);
    return { userCount, noteCount, blogCount };
  } catch (error) {
    return { userCount: 0, noteCount: 0, blogCount: 0 };
  }
}

export async function getAllUsers() {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  // Use aggregation to get exact, real-time counts from Note and Blog collections
  const users = await User.aggregate([
    {
      $lookup: {
        from: "notes", 
        localField: "_id",
        foreignField: "user",
        as: "userNotes"
      }
    },
    {
      $lookup: {
        from: "blogs", 
        localField: "_id",
        foreignField: "author",
        as: "userBlogs"
      }
    },
    {
      $addFields: {
        exactNoteCount: { $size: "$userNotes" },
        exactBlogCount: { $size: "$userBlogs" }
      }
    },
    {
      $project: {
        password: 0,
        userNotes: 0, 
        userBlogs: 0  
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
  
  // Safe Serialization
  return JSON.parse(JSON.stringify(users));
}

/**
 * TOGGLE USER ROLE
 */
export async function toggleUserRole(userId, newRole) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };

  try {
    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, error: "User not found" };

    // MAIN ADMIN PROTECTION
    if (targetUser.email === process.env.NEXT_PUBLIC_MAIN_ADMIN_EMAIL) {
      return { success: false, error: "Action Denied: You cannot demote the Main Admin." };
    }

    targetUser.role = newRole;
    await targetUser.save();
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * DELETE USER (Secured + R2 Cleanup)
 */
export async function deleteUser(userId) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  try {
    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, error: "User not found" };

    // MAIN ADMIN PROTECTION
    if (targetUser.email === process.env.NEXT_PUBLIC_MAIN_ADMIN_EMAIL) {
      return { success: false, error: "Action Denied: You cannot delete the Main Admin." };
    }

    // ✅ NEW: Fetch all user's content to delete files from R2 BEFORE deleting the DB records
    const userNotes = await Note.find({ user: userId }, 'fileKey thumbnailKey');
    const userBlogs = await Blog.find({ author: userId }, 'coverImageKey');

    const r2DeletionPromises = [];

    // Queue Avatar Deletion
    if (targetUser.avatarKey) r2DeletionPromises.push(deleteFileFromR2(targetUser.avatarKey));

    // Queue Note Files Deletion
    userNotes.forEach(note => {
        if (note.fileKey) r2DeletionPromises.push(deleteFileFromR2(note.fileKey));
        if (note.thumbnailKey) r2DeletionPromises.push(deleteFileFromR2(note.thumbnailKey));
    });

    // Queue Blog Cover Image Deletion
    userBlogs.forEach(blog => {
        if (blog.coverImageKey) r2DeletionPromises.push(deleteFileFromR2(blog.coverImageKey));
    });

    // Execute all R2 deletions in parallel
    await Promise.all(r2DeletionPromises);

    // Cleanup user content to prevent orphaned data in MongoDB
    await Promise.all([
      Note.deleteMany({ user: userId }),
      Blog.deleteMany({ author: userId }),
      Collection.deleteMany({ user: userId }),
      User.updateMany({ savedNotes: userId }, { $pull: { savedNotes: userId } }),
      User.updateMany({ followers: userId }, { $pull: { followers: userId } }),
      User.updateMany({ following: userId }, { $pull: { following: userId } }),
      User.findByIdAndDelete(userId)
    ]);
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * CONTENT MODERATION - NOTES
 */
export async function getAllNotes(page = 1, limit = 20) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  const skip = (page - 1) * limit;
  const notes = await Note.find()
    .populate('user', 'name email avatar')
    .sort({ uploadDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await Note.countDocuments();
  
  const safeNotes = notes.map(n => ({
    ...n,
    reviews: [], 
  }));

  return { 
    notes: JSON.parse(JSON.stringify(safeNotes)), 
    total, 
    totalPages: Math.ceil(total / limit) 
  };
}

export async function toggleNoteFeatured(noteId, currentState) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  await Note.findByIdAndUpdate(noteId, { isFeatured: !currentState });
  revalidatePath("/admin");
  revalidatePath("/"); 
  return { success: true };
}

export async function adminUpdateNote(noteId, updateData) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  try {
    const updatedNote = await Note.findByIdAndUpdate(noteId, updateData, { new: true }).lean();
    revalidatePath("/admin");
    revalidatePath(`/notes/${noteId}`);
    revalidatePath("/search");
    
    return { success: true, note: JSON.parse(JSON.stringify(updatedNote)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteNote(noteId) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  try {
    const note = await Note.findById(noteId);
    if (!note) return { success: false, error: "Note not found" };
    
    // ✅ NEW: Delete files from R2
    if (note.fileKey) await deleteFileFromR2(note.fileKey);
    if (note.thumbnailKey) await deleteFileFromR2(note.thumbnailKey);

    // Cleanup MongoDB references
    await Promise.all([
      User.updateMany({ savedNotes: noteId }, { $pull: { savedNotes: noteId } }),
      Collection.updateMany({ notes: noteId }, { $pull: { notes: noteId } }),
      User.findByIdAndUpdate(note.user, { $inc: { noteCount: -1 } }),
      Note.findByIdAndDelete(noteId)
    ]);
    
    revalidatePath("/admin");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * CONTENT MODERATION - BLOGS
 */
export async function getAllBlogs(page = 1, limit = 20) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  const skip = (page - 1) * limit;
  const blogs = await Blog.find()
    .populate('author', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await Blog.countDocuments();
  
  const safeBlogs = blogs.map(b => ({
    ...b,
    content: "", 
    reviews: [], 
  }));

  return { 
    blogs: JSON.parse(JSON.stringify(safeBlogs)), 
    total, 
    totalPages: Math.ceil(total / limit) 
  };
}

export async function toggleBlogFeatured(blogId, currentState) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  await Blog.findByIdAndUpdate(blogId, { isFeatured: !currentState });
  revalidatePath("/admin");
  revalidatePath("/blogs");
  return { success: true };
}

export async function adminUpdateBlog(blogId, updateData) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, { new: true }).lean();
    revalidatePath("/admin");
    revalidatePath(`/blogs/${updatedBlog.slug}`);
    revalidatePath("/blogs");
    
    return { success: true, blog: JSON.parse(JSON.stringify(updatedBlog)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteBlog(blogId) {
  await connectDB();
  if (!(await isAdmin())) return { error: "Unauthorized" };
  
  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return { success: false, error: "Blog not found" };
    
    // ✅ NEW: Delete cover image from R2
    if (blog.coverImageKey) await deleteFileFromR2(blog.coverImageKey);

    await Promise.all([
      User.findByIdAndUpdate(blog.author, { $inc: { blogCount: -1 } }),
      Blog.findByIdAndDelete(blogId)
    ]);
    
    revalidatePath("/admin");
    revalidatePath("/blogs");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}