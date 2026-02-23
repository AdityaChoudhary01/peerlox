"use server";

import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection"; 
import Note from "@/lib/models/Note"; // Needed to load notes inside a collection
import User from "@/lib/models/User"; // Needed to load the authors of those notes
import { revalidatePath } from "next/cache";

/**
 * 1. FETCH ALL USER COLLECTIONS
 * Gets the list of folders a user has created.
 */
export async function getUserCollections(userId) {
  await connectDB();
  try {
    const collections = await Collection.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Serialize for the Client Component
    return collections.map(col => ({
      ...col,
      _id: col._id.toString(),
      user: col.user.toString(),
      notes: col.notes ? col.notes.map(id => id.toString()) : [],
      createdAt: col.createdAt?.toISOString(),
      updatedAt: col.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

/**
 * 2. FETCH SINGLE COLLECTION WITH NOTES
 * Gets a specific collection and loads all the Note data inside it.
 */
export async function getCollectionById(collectionId) { // 🚀 FIX: Removed userId parameter
  await connectDB();
  try {
    // 🚀 FIX: Removed the 'user: userId' filter so it fetches purely by the Collection ID
    const collection = await Collection.findOne({ _id: collectionId })
      .populate({
        path: 'notes',
        populate: { path: 'user', select: 'name avatar' } // Load the author details for each note
      })
      .lean();

    if (!collection) return null;

    // Deep stringify to ensure safe passing to Client Components
    return JSON.parse(JSON.stringify(collection));
  } catch (error) {
    console.error("Error fetching collection details:", error);
    return null;
  }
}

/**
 * 3. CREATE COLLECTION
 */
export async function createCollection(name, userId) {
  await connectDB();
  try {
    const newCollection = await Collection.create({
      name,
      user: userId,
      notes: []
    });

    revalidatePath('/profile');
    return { 
      success: true, 
      collection: { 
        ...newCollection.toObject(), 
        _id: newCollection._id.toString(),
        user: newCollection.user.toString()
      } 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 4. RENAME COLLECTION
 */
export async function renameCollection(collectionId, newName, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId }, // Security: Ensure user owns it
      { name: newName },
      { new: true }
    ).lean();

    if (!collection) return { success: false, error: "Not found or unauthorized" };

    revalidatePath('/profile');
    revalidatePath(`/collections/${collectionId}`);
    return { success: true, collection: { ...collection, _id: collection._id.toString() } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 5. DELETE COLLECTION
 */
export async function deleteCollection(collectionId, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOneAndDelete({ 
      _id: collectionId, 
      user: userId // Security check
    });

    if (!collection) return { success: false, error: "Not found or unauthorized" };

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 6. ADD NOTE TO COLLECTION
 */
export async function addNoteToCollection(collectionId, noteId, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId },
      { $addToSet: { notes: noteId } }, // $addToSet prevents duplicate notes in the same folder
      { new: true }
    ).lean();

    if (!collection) return { success: false, error: "Not found or unauthorized" };

    revalidatePath('/profile');
    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 7. REMOVE NOTE FROM COLLECTION
 */
export async function removeNoteFromCollection(collectionId, noteId, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId },
      { $pull: { notes: noteId } }, // $pull removes the specific note ID
      { new: true }
    ).lean();

    if (!collection) return { success: false, error: "Not found or unauthorized" };

    revalidatePath('/profile');
    revalidatePath(`/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 8. UPDATE COLLECTION (✨ ADDED TO FIX THE BUILD ERROR)
 * This handles updates from the EditCollectionModal.
 * It uses $set so it can safely update the name, description, or any other field.
 */
export async function updateCollection(collectionId, data, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId }, // Security: Ensure user owns it
      { $set: data }, // Dynamically updates whatever fields the modal sends
      { new: true }
    ).lean();

    if (!collection) return { success: false, error: "Not found or unauthorized" };

    revalidatePath('/profile');
    revalidatePath(`/collections/${collectionId}`);
    return { success: true, collection: { ...collection, _id: collection._id.toString() } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}