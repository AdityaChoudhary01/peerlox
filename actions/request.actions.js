"use server";

import connectDB from "@/lib/db";
import Request from "@/lib/models/Request";
import Note from "@/lib/models/Note";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notification.actions";
import mongoose from "mongoose";

/**
 * 1. CREATE A REQUEST
 */
export async function createRequest(data, userId) {
  await connectDB();
  try {
    const newRequest = await Request.create({
      ...data,
      requester: userId,
    });
    
    revalidatePath("/requests");
    return { success: true, request: JSON.parse(JSON.stringify(newRequest)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 2. GET ALL REQUESTS (With Pagination & Filters)
 */
export async function getRequests({ page = 1, limit = 12, filter = "all" } = {}) {
  await connectDB();
  try {
    const skip = (page - 1) * limit;
    const query = {};

    if (filter === "pending") query.status = "pending";
    if (filter === "fulfilled") query.status = "fulfilled";

    const requests = await Request.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate("requester", "name avatar")
      .populate("fulfillmentNote", "title slug") // 🚀 Already perfectly pulling the slug!
      .lean();

    const total = await Request.countDocuments(query);

    return {
      requests: JSON.parse(JSON.stringify(requests)),
      totalPages: Math.ceil(total / limit),
      totalCount: total,
    };
  } catch (error) {
    console.error("Error fetching requests:", error);
    return { requests: [], totalCount: 0 };
  }
}

/**
 * 3. FULFILL A REQUEST
 * Links an existing Note (by ID or Slug) to the Request and notifies the requester
 */
export async function fulfillRequest(requestId, noteUrlOrId, userId) {
  await connectDB();
  try {
    // 🚀 Extract identifier from URL if user pastes a link like "stuhive.in/notes/data-structures-123"
    let identifier = noteUrlOrId.trim();
    if (noteUrlOrId.includes("/notes/")) {
        const parts = noteUrlOrId.split("/notes/");
        // Get whatever comes after /notes/, remove query params (?), and remove trailing slashes
        identifier = parts[1].split("?")[0].replace(/\/$/, ""); 
    }

    // 🚀 Smart Search: Check if the identifier is a valid MongoDB ID or a Slug
    let query = { slug: identifier };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        query = { $or: [{ _id: identifier }, { slug: identifier }] };
    }

    // 1. Verify Note Exists
    const note = await Note.findOne(query);
    if (!note) return { success: false, error: "Note not found. Check the link and try again." };

    // 2. Update Request
    const request = await Request.findByIdAndUpdate(
      requestId,
      {
        status: "fulfilled",
        fulfilledBy: userId,
        fulfillmentNote: note._id, // Keep the actual reference ID for the database
      },
      { new: true }
    );

    // 3. 🚀 TRIGGER NOTIFICATION TO THE ORIGINAL REQUESTER
    // (Check to ensure we don't notify a user if they somehow fulfill their own request)
    if (request && request.requester.toString() !== userId.toString()) {
      await createNotification({
        recipientId: request.requester,
        actorId: userId,
        type: 'REQUEST_FULFILLED',
        message: `Good news! Your community request "${request.title}" has been fulfilled!`,
        link: `/notes/${note.slug || note._id}` // 🚀 Clicking the notification uses the new SEO slug
      });
    }

    revalidatePath("/requests");
    return { success: true };
  } catch (error) {
    console.error("Fulfill Request Error:", error);
    return { success: false, error: "An error occurred while linking the note." };
  }
}