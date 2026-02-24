"use server";

import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection"; 
import Note from "@/lib/models/Note"; 
import User from "@/lib/models/User"; 
import { revalidatePath } from "next/cache";

// 🚀 IMPORT GOOGLE & INDEXNOW HELPERS
import { indexNewContent, removeContentFromIndex } from "@/lib/googleIndexing"; 
import { pingIndexNow } from "@/lib/indexnow";

const APP_URL = process.env.NEXTAUTH_URL || "https://www.stuhive.in";

/**
 * 1. FETCH ALL USER COLLECTIONS
 */
export async function getUserCollections(userId) {
  await connectDB();
  try {
    const collections = await Collection.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

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
 * 2. FETCH SINGLE COLLECTION WITH NOTES (BY ID)
 */
export async function getCollectionById(collectionId) {
  await connectDB();
  try {
    const collection = await Collection.findById(collectionId)
      .populate({
        path: 'notes',
        populate: { path: 'user', select: 'name avatar' }
      })
      .lean();

    if (!collection) return null;
    return JSON.parse(JSON.stringify(collection));
  } catch (error) {
    console.error("Error fetching collection details:", error);
    return null;
  }
}

/**
 * 3. FETCH SINGLE COLLECTION BY SLUG (Includes Description for SEO)
 */
export async function getCollectionBySlug(slug) {
  await connectDB();
  try {
    const collection = await Collection.findOne({ slug, visibility: 'public' })
      .populate('user', 'name avatar role')
      .populate({
        path: 'notes',
        populate: { path: 'user', select: 'name avatar' }
      })
      .lean();

    if (!collection) return null;
    return JSON.parse(JSON.stringify(collection));
  } catch (error) {
    console.error("Error fetching collection by slug:", error);
    return null;
  }
}

/**
 * 4. FETCH PUBLIC COLLECTIONS (Optimized for Load More Pagination)
 */
export async function getPublicCollections({ page = 1, limit = 12 } = {}) {
  await connectDB();
  try {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const collections = await Collection.find({ visibility: 'public' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Collection.countDocuments({ visibility: 'public' });

    const serializedCollections = collections.map(col => ({
        ...col,
        _id: col._id.toString(),
        user: col.user ? {
            ...col.user,
            _id: col.user._id.toString()
        } : null,
        notes: col.notes ? col.notes.map(n => n.toString()) : [],
        createdAt: col.createdAt?.toISOString(),
        updatedAt: col.updatedAt?.toISOString(),
    }));

    return {
      collections: serializedCollections,
      totalPages: Math.ceil(total / limitNum),
      totalCount: total
    };
  } catch (error) {
    console.error("Error fetching public collections:", error);
    return { collections: [], totalPages: 0, totalCount: 0 };
  }
}

/**
 * 5. CREATE COLLECTION
 */
export async function createCollection(name, userId) {
  await connectDB();
  try {
    const newCollection = await Collection.create({
      name,
      user: userId,
      notes: [],
      visibility: 'private', // Defaults to private, no indexing needed yet.
      description: "" 
    });

    revalidatePath('/profile');
    return { 
      success: true, 
      collection: JSON.parse(JSON.stringify(newCollection)) 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 6. UPDATE COLLECTION (Handles Rename, Visibility, and Description)
 */
export async function updateCollection(collectionId, data, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOne({ _id: collectionId, user: userId });
    
    if (!collection) return { success: false, error: "Not found or unauthorized" };

    if (data.name !== undefined) collection.name = data.name;
    if (data.visibility !== undefined) collection.visibility = data.visibility;
    if (data.description !== undefined) collection.description = data.description;

    await collection.save(); // Pre-save hooks handle slug generation

    // 🚀 SEO INDEXING LOGIC (GOOGLE + INDEXNOW)
    if (collection.slug) {
        const url = `${APP_URL}/shared-collections/${collection.slug}`;
        
        if (collection.visibility === 'public') {
            await indexNewContent(collection.slug, "collection");
            await pingIndexNow(url);
        } else if (collection.visibility === 'private' && data.visibility === 'private') {
            await removeContentFromIndex(collection.slug, "collection");
            await pingIndexNow(url); // Pinging IndexNow with a 404/Private URL tells it to remove it
        }
    }

    // 🚀 CACHE BUSTING: Ensures main archive page updates instantly to prevent 404s
    revalidatePath('/profile');
    revalidatePath('/shared-collections'); 
    revalidatePath(`/collections/${collectionId}`);
    if (collection.slug) revalidatePath(`/shared-collections/${collection.slug}`);
    
    return { 
      success: true, 
      collection: JSON.parse(JSON.stringify(collection.toObject())) 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 7. RENAME COLLECTION
 */
export async function renameCollection(collectionId, newName, userId) {
  return await updateCollection(collectionId, { name: newName }, userId);
}

/**
 * 8. DELETE COLLECTION
 */
export async function deleteCollection(collectionId, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOneAndDelete({ _id: collectionId, user: userId });
    if (!collection) return { success: false, error: "Not found or unauthorized" };

    // 🚀 REMOVE FROM GOOGLE & INDEXNOW IF IT WAS PUBLIC
    if (collection.visibility === 'public' && collection.slug) {
        const url = `${APP_URL}/shared-collections/${collection.slug}`;
        await removeContentFromIndex(collection.slug, "collection");
        await pingIndexNow(url);
    }

    revalidatePath('/profile');
    revalidatePath('/shared-collections');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 9. ADD NOTE TO COLLECTION
 */
export async function addNoteToCollection(collectionId, noteId, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId },
      { $addToSet: { notes: noteId } },
      { new: true }
    );

    if (!collection) return { success: false, error: "Not found or unauthorized" };

    // 🚀 PING GOOGLE & INDEXNOW: Content updated, recrawl the new items!
    if (collection.visibility === 'public' && collection.slug) {
        const url = `${APP_URL}/shared-collections/${collection.slug}`;
        await indexNewContent(collection.slug, "collection");
        await pingIndexNow(url);
    }

    // 🚀 CACHE BUSTING: Updates note count on the main page
    revalidatePath('/profile');
    revalidatePath('/shared-collections'); 
    if (collection.slug) revalidatePath(`/shared-collections/${collection.slug}`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 10. REMOVE NOTE FROM COLLECTION
 */
export async function removeNoteFromCollection(collectionId, noteId, userId) {
  await connectDB();
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId },
      { $pull: { notes: noteId } },
      { new: true }
    );

    if (!collection) return { success: false, error: "Not found or unauthorized" };

    // 🚀 PING GOOGLE & INDEXNOW: Content updated (removed item)
    if (collection.visibility === 'public' && collection.slug) {
        const url = `${APP_URL}/shared-collections/${collection.slug}`;
        await indexNewContent(collection.slug, "collection");
        await pingIndexNow(url);
    }

    // 🚀 CACHE BUSTING: Updates note count on the main page
    revalidatePath('/profile');
    revalidatePath('/shared-collections'); 
    if (collection.slug) revalidatePath(`/shared-collections/${collection.slug}`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}