"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Note from "@/lib/models/Note";
import User from "@/lib/models/User";
import Collection from "@/lib/models/Collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFileFromR2 } from "@/lib/r2"; 
import { generateReadUrl } from "@/lib/r2";
import { indexNewContent, removeContentFromIndex } from "@/lib/googleIndexing";

/**
 * FETCH NOTES (Pagination + Search + Filtering)
 */
export async function getNotes({ page = 1, limit = 12, search, university, course, subject, year, sort, isFeatured }) {
  await connectDB();

  try {
    const skip = (page - 1) * limit;
    let query = {};
    const conditions = [];

    // Search Logic
    if (search) {
      const s = search.trim();
      const safeSearch = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = { $regex: safeSearch, $options: 'i' };
      conditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { university: searchRegex },
          { course: searchRegex },
          { subject: searchRegex }
        ]
      });
    }

    // Filter Logic
    if (university) conditions.push({ university: { $regex: university, $options: 'i' } });
    if (course) conditions.push({ course: { $regex: course, $options: 'i' } });
    if (subject) conditions.push({ subject: { $regex: subject, $options: 'i' } });
    if (year) conditions.push({ year: Number(year) });
    if (isFeatured) conditions.push({ isFeatured: true });

    if (conditions.length > 0) {
      query = { $and: conditions };
    }

    // Sorting
    let sortOptions = { uploadDate: -1 }; 
    if (sort === 'highestRated') sortOptions = { rating: -1 };
    if (sort === 'mostDownloaded') sortOptions = { downloadCount: -1 };
    if (sort === 'oldest') sortOptions = { uploadDate: 1 };

    // Execution
    const notes = await Note.find(query)
      .populate('user', 'name avatar role email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalNotes = await Note.countDocuments(query);
    const totalPages = Math.ceil(totalNotes / limit);

    // Serialization
    const safeNotes = notes.map(note => ({
      ...note,
      _id: note._id.toString(),
      user: note.user ? {
        ...note.user,
        _id: note.user._id.toString()
      } : null,
      uploadDate: note.uploadDate ? note.uploadDate.toISOString() : new Date().toISOString(),
      createdAt: note.createdAt ? note.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: note.updatedAt ? note.updatedAt.toISOString() : new Date().toISOString(),
      reviews: note.reviews ? note.reviews.map(r => ({
        ...r,
        _id: r._id ? r._id.toString() : Date.now().toString(),
        user: r.user ? r.user.toString() : null,
        parentReviewId: r.parentReviewId ? r.parentReviewId.toString() : null,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
      })) : []
    }));

    return { notes: safeNotes, totalPages, currentPage: page, totalCount: totalNotes };

  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return { notes: [], totalPages: 0, currentPage: 1, totalCount: 0 };
  }
}

/**
 * GET SINGLE NOTE
 */
export async function getNoteById(id) {
  await connectDB();
  try {
    const note = await Note.findById(id)
      .populate('user', 'name avatar role email')
      .populate({
        path: 'reviews.user',
        select: 'name avatar role email'
      })
      .lean();

    if (!note) return null;

    return {
      ...note,
      _id: note._id.toString(),
      user: note.user ? { ...note.user, _id: note.user._id.toString() } : null,
      reviews: note.reviews ? note.reviews.map(r => ({
        ...r,
        _id: r._id.toString(),
        user: r.user ? { ...r.user, _id: r.user._id.toString() } : null,
        parentReviewId: r.parentReviewId ? r.parentReviewId.toString() : null,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
      })) : [],
      uploadDate: note.uploadDate ? note.uploadDate.toISOString() : new Date().toISOString(),
      createdAt: note.createdAt ? note.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: note.updatedAt ? note.updatedAt.toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching note ${id}:`, error);
    return null;
  }
}

/**
 * GET RELATED NOTES
 */
export async function getRelatedNotes(noteId) {
  await connectDB();
  try {
    const currentNote = await Note.findById(noteId).select('subject course').lean();
    if (!currentNote) return [];

    const relatedNotes = await Note.find({
      _id: { $ne: noteId },
      $or: [
        { subject: currentNote.subject },
        { course: currentNote.course }
      ]
    })
    .select('title university course subject year rating numReviews downloadCount uploadDate fileType fileName isFeatured fileKey thumbnailKey')
    .populate('user', 'name avatar role')
    .limit(4)
    .sort({ rating: -1, downloadCount: -1 })
    .lean();

    return relatedNotes.map(n => ({
      ...n,
      _id: n._id.toString(),
      user: n.user ? { ...n.user, _id: n.user._id.toString() } : null,
      uploadDate: n.uploadDate?.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching related notes:', error);
    return [];
  }
}

/**
 * CREATE NOTE
 */
export async function createNote({ title, description, university, course, subject, year, fileData, userId }) {
  await connectDB();
  console.log("🚀 Server Action Triggered: createNote was just called!"); // Add this!
  try {
    const newNote = new Note({
      title,
      description,
      university,
      course,
      subject,
      year: Number(year),
      fileName: fileData.fileName,
      fileKey: fileData.fileKey,           
      thumbnailKey: fileData.thumbnailKey, 
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
      user: userId,
    });

    await newNote.save();
    
    // Increment User Note Count
    await User.findByIdAndUpdate(userId, { $inc: { noteCount: 1 } });

    const seoStatus = await indexNewContent(newNote._id.toString(), 'note');
    
    // 👇 MAKE THE LOG LOUD
    console.warn("\n=============================================");
    console.warn(`🚀 SEO STATUS: Google Indexing Ping was ${seoStatus ? 'DELIVERED' : 'FAILED'}`);
    console.warn(`📝 NOTE ID: ${newNote._id.toString()}`);
    console.warn("=============================================\n");
    
    revalidatePath('/'); 
    revalidatePath('/search');
    
    return { success: true, noteId: newNote._id.toString() };
  } catch (error) {
    console.error("Create Note Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * UPDATE NOTE
 */
export async function updateNote(noteId, data, userId) {
  await connectDB();
  try {
    const note = await Note.findById(noteId);
    if (!note) return { success: false, error: "Note not found" };
    
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";
    
    // Authorization Check
    if (note.user.toString() !== userId && !isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    // Update fields
    note.title = data.title || note.title;
    note.description = data.description || note.description;
    note.university = data.university || note.university;
    note.course = data.course || note.course;
    note.subject = data.subject || note.subject;
    note.year = data.year || note.year;

    await note.save();

    // ✅ SEO: Await Google confirmation
    const seoStatus = await indexNewContent(noteId, 'note');
    console.log(`[ACTION LOG] Note updated. Google Indexing ping: ${seoStatus ? 'DELIVERED' : 'FAILED'}`);

    revalidatePath(`/notes/${noteId}`);
    revalidatePath('/profile');
    revalidatePath('/search');
    
    return { success: true, note: JSON.parse(JSON.stringify(note)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * DELETE NOTE
 */
export async function deleteNote(noteId, userId) {
  await connectDB();
  
  try {
    const note = await Note.findById(noteId);
    if (!note) return { success: false, error: "Note not found" };

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    // Authorization Check: User must own the note OR be an admin
    if (note.user.toString() !== userId && !isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    // R2 CLEANUP: Delete the actual files from Cloudflare before wiping DB
    if (note.fileKey) {
        await deleteFileFromR2(note.fileKey);
    }
    if (note.thumbnailKey) {
        await deleteFileFromR2(note.thumbnailKey);
    }

    // Delete from Database and cleanup references
    await Promise.all([
      Note.findByIdAndDelete(noteId),
      User.findByIdAndUpdate(note.user, { $inc: { noteCount: -1 } }),
      User.updateMany({ savedNotes: noteId }, { $pull: { savedNotes: noteId } }),
      Collection.updateMany({ notes: noteId }, { $pull: { notes: noteId } })
    ]);

    // ✅ SEO: Await Google removal confirmation
    const seoStatus = await removeContentFromIndex(noteId, 'note');
    console.log(`[ACTION LOG] Note deleted. Google Removal ping: ${seoStatus ? 'DELIVERED' : 'FAILED'}`);

    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath('/profile');

    return { success: true };
  } catch (error) {
    console.error("Delete Note Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * INCREMENT DOWNLOAD COUNT
 */
export async function incrementDownloadCount(noteId) {
  await connectDB();
  try {
    await Note.findByIdAndUpdate(noteId, { $inc: { downloadCount: 1 } });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * INCREMENT VIEW COUNT
 */
export async function incrementViewCount(noteId) {
  await connectDB();
  try {
    await Note.findByIdAndUpdate(noteId, { $inc: { viewCount: 1 } });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addReview(noteId, userId, rating, comment, parentReviewId = null) {
  await connectDB();
  try {
    const note = await Note.findById(noteId);
    if (!note) return { success: false, error: "Note not found" };

    const review = {
      user: userId,
      rating: parentReviewId ? 0 : rating,
      comment,
      parentReviewId, 
    };

    note.reviews.push(review);
    
    // Recalculate stats
    const ratedReviews = note.reviews.filter(r => r.rating > 0);
    if (ratedReviews.length > 0) {
      note.rating = ratedReviews.reduce((acc, item) => item.rating + acc, 0) / ratedReviews.length;
    }
    note.numReviews = note.reviews.filter(r => !r.parentReviewId).length;
    
    await note.save();

    // TRIGGER REVALIDATION
    revalidatePath(`/notes/${noteId}`);

    const updatedNote = await Note.findById(noteId).populate("reviews.user", "name avatar").lean();
    
    const safeReviews = updatedNote.reviews.map(r => ({
       ...r,
       _id: r._id.toString(),
       parentReviewId: r.parentReviewId ? r.parentReviewId.toString() : null,
       user: r.user ? { ...r.user, _id: r.user._id.toString() } : null,
       createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
    }));

    return { success: true, reviews: safeReviews };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * GET USER NOTES (Fixed Serialization)
 */
export async function getUserNotes(userId, page = 1, limit = 10) {
  await connectDB();
  try {
    const skip = (page - 1) * limit;
    const notes = await Note.find({ user: userId })
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Note.countDocuments({ user: userId });

    const safeNotes = notes.map(n => ({
      ...n, 
      _id: n._id.toString(), 
      user: n.user.toString(),
      uploadDate: n.uploadDate ? n.uploadDate.toISOString() : new Date().toISOString(),
      createdAt: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: n.updatedAt ? n.updatedAt.toISOString() : new Date().toISOString(),
      reviews: n.reviews ? n.reviews.map(r => ({
        ...r,
        _id: r._id ? r._id.toString() : Date.now().toString(),
        user: r.user ? r.user.toString() : null,
        parentReviewId: r.parentReviewId ? r.parentReviewId.toString() : null,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
      })) : []
    }));

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

export async function deleteReview(noteId, reviewId) {
  await connectDB();
  try {
    const note = await Note.findById(noteId);
    if (!note) return { success: false, error: "Note not found" };

    note.reviews = note.reviews.filter(
      (r) => r._id.toString() !== reviewId && r.parentReviewId?.toString() !== reviewId
    );

    // Recalculate stats...
    const ratedReviews = note.reviews.filter((r) => r.rating > 0);
    note.numReviews = note.reviews.length;
    note.rating = ratedReviews.length > 0 
      ? ratedReviews.reduce((acc, item) => item.rating + acc, 0) / ratedReviews.length 
      : 0;

    await note.save();

    const updatedNote = await Note.findById(noteId)
      .populate("reviews.user", "name avatar")
      .lean();

    // SERIALIZE BEFORE RETURNING
    const safeReviews = updatedNote.reviews.map(r => ({
      ...r,
      _id: r._id.toString(),
      parentReviewId: r.parentReviewId ? r.parentReviewId.toString() : null,
      user: r.user ? { ...r.user, _id: r.user._id.toString() } : null,
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
    }));

    return { success: true, reviews: safeReviews };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getNoteDownloadUrl(fileKey, fileName) {
  try {
    const url = await generateReadUrl(fileKey, fileName);
    return url;
  } catch (error) {
    console.error("Failed to generate R2 link:", error);
    throw new Error("Could not get download link");
  }
}