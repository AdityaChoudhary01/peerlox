"use server";

import connectDB from "@/lib/db";
import Note from "@/lib/models/Note";
import { revalidatePath } from "next/cache";

export async function addReview({ noteId, rating, comment, userId, parentReviewId = null }) {
  await connectDB();
  
  try {
    const note = await Note.findById(noteId);
    if (!note) return { success: false, error: "Note not found" };

    // 1. Check if user already reviewed (ONLY check for main reviews, not replies)
    if (!parentReviewId) {
        const alreadyReviewed = note.reviews.find(
          (r) => r.user.toString() === userId.toString() && !r.parentReviewId
        );

        if (alreadyReviewed) {
          return { success: false, error: "You have already reviewed this note." };
        }
    }

    // 2. Create the new review/reply object
    const review = {
      user: userId,
      rating: parentReviewId ? 0 : Number(rating), // Replies don't get a rating
      comment,
      parentReviewId: parentReviewId || null,
      createdAt: new Date()
    };

    note.reviews.push(review);

    // 3. Recalculate stats based ONLY on main reviews
    const mainReviews = note.reviews.filter(r => !r.parentReviewId);
    note.numReviews = mainReviews.length;
    
    if (mainReviews.length > 0) {
      note.rating = mainReviews.reduce((acc, item) => item.rating + acc, 0) / mainReviews.length;
    } else {
      note.rating = 0;
    }

    await note.save();
    
    // 4. Clear the cache for this specific note page
    revalidatePath(`/notes/${noteId}`);

    // 5. Fetch and serialize the new reviews so the frontend can update instantly without a refresh
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
    console.error("Add Review Error:", error);
    return { success: false, error: "Server error while submitting your review." };
  }
}