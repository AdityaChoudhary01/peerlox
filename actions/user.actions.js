"use server";

import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Note from "@/lib/models/Note";
import Blog from "@/lib/models/Blog";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFileFromR2 } from "@/lib/r2";

/**
 * GET USER PROFILE
 */
export async function getUserProfile(userId) {
  await connectDB();
  try {
    const user = await User.findById(userId)
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar')
      .select('-password')
      .lean();

    if (!user) return null;

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    return null;
  }
}

/**
 * GET USER NOTES (For Profile Page)
 */
export async function getUserNotes(userId, page = 1, limit = 10) {
  await connectDB();
  try {
    const skip = (page - 1) * limit;

    const notes = await Note.find({ user: userId }) 
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar') 
      .lean();

    const total = await Note.countDocuments({ user: userId });

    const safeNotes = JSON.parse(JSON.stringify(notes));

    return {
      notes: safeNotes,
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error("Error in getUserNotes:", error);
    return { notes: [], total: 0 };
  }
}

/**
 * UPDATE USER AVATAR ONLY (With R2 Auto-Delete)
 */
export async function updateUserAvatar(userId, avatarUrl, avatarKey) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session || session.user.id !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const currentUser = await User.findById(userId);
    
    // ✅ R2 CLEANUP: If the user already has an avatarKey, delete the old file from R2
    if (currentUser.avatarKey && currentUser.avatarKey !== avatarKey) {
        console.log(`Deleting old avatar from R2: ${currentUser.avatarKey}`);
        await deleteFileFromR2(currentUser.avatarKey);
    }

    // Save the new public URL and the secret R2 Key to the database
    await User.findByIdAndUpdate(userId, { 
        avatar: avatarUrl,
        avatarKey: avatarKey 
    });
    
    revalidatePath('/profile');
    revalidatePath(`/profile/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Update Avatar Error:", error);
    return { success: false, error: "Failed to update avatar" };
  }
}

/**
 * UPDATE USER BIO ONLY (🚀 NEW: For SEO and Profile enrichment)
 */
export async function updateUserBio(userId, newBio) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Sanitize and limit the bio length securely on the server
    const sanitizedBio = newBio ? newBio.trim().substring(0, 300) : "";

    await User.findByIdAndUpdate(userId, { bio: sanitizedBio });

    // Instantly clear cache for SEO indexing and UI updates
    revalidatePath('/profile');
    revalidatePath(`/profile/${userId}`);
    
    return { success: true, bio: sanitizedBio };
  } catch (error) {
    console.error("Failed to update bio:", error);
    return { success: false, error: "Failed to update bio" };
  }
}

/**
 * GET SAVED NOTES
 */
export async function getSavedNotes(userId, page = 1, limit = 10) {
  await connectDB();
  try {
    const user = await User.findById(userId).populate({
      path: 'savedNotes',
      options: { sort: { uploadDate: -1 }, skip: (page - 1) * limit, limit: limit },
      populate: { path: 'user', select: 'name avatar role' }
    }).lean();

    if (!user || !user.savedNotes) return { notes: [], total: 0 };

    const userDoc = await User.findById(userId);
    const total = userDoc.savedNotes.length;

    const safeNotes = JSON.parse(JSON.stringify(user.savedNotes));

    return {
      notes: safeNotes,
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error("getSavedNotes error:", error);
    return { notes: [], total: 0 };
  }
}

/**
 * UPDATE PROFILE (With R2 Auto-Delete for Avatar)
 */
export async function updateProfile(userId, data) {
  await connectDB();
  try {
    // ✅ R2 CLEANUP: If profile update includes a new avatarKey, delete the old one
    if (data.avatarKey) {
        const currentUser = await User.findById(userId);
        if (currentUser.avatarKey && currentUser.avatarKey !== data.avatarKey) {
            await deleteFileFromR2(currentUser.avatarKey);
        }
    }

    const user = await User.findByIdAndUpdate(userId, data, { new: true }).select('-password').lean();
    
    revalidatePath('/profile');
    revalidatePath(`/profile/${userId}`);
    
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * TOGGLE FOLLOW
 */
export async function toggleFollow(currentUserId, targetUserId) {
  await connectDB();
  try {
    if (currentUserId === targetUserId) return { success: false, error: "Cannot follow yourself" };

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) return { success: false, error: "User not found" };

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    revalidatePath(`/profile/${targetUserId}`);
    return { success: true, isFollowing: !isFollowing };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * GET USER FEED
 */
export async function getUserFeed(userId) {
  await connectDB();
  try {
    const user = await User.findById(userId);
    if (!user || !user.following.length) return [];

    const notes = await Note.find({ user: { $in: user.following } })
      .sort({ uploadDate: -1 })
      .limit(20)
      .populate('user', 'name avatar role')
      .lean();

    const blogs = await Blog.find({ author: { $in: user.following } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'name avatar role')
      .lean();

    const feed = [
      ...notes.map(n => ({ ...n, type: 'note', date: n.uploadDate })),
      ...blogs.map(b => ({ ...b, type: 'blog', date: b.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return JSON.parse(JSON.stringify(feed));

  } catch (error) {
    console.error("Feed Error:", error);
    return [];
  }
}

/**
 * SAVE/UNSAVE NOTE
 */
export async function toggleSaveNote(userId, noteId) {
  await connectDB();
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, error: "User not found" };

    const index = user.savedNotes.indexOf(noteId);
    let isSaved = false;

    if (index === -1) {
      user.savedNotes.push(noteId);
      isSaved = true;
    } else {
      user.savedNotes.splice(index, 1);
      isSaved = false;
    }

    await user.save();
    
    revalidatePath('/profile');
    revalidatePath('/search');
    
    return { success: true, isSaved };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * UPDATE LAST SEEN
 */
export async function updateLastSeen(userId) {
  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, { 
      lastSeen: new Date() 
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to update last seen:", error);
    return { success: false };
  }
}