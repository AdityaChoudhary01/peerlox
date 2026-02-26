"use server";

import connectDB from "@/lib/db";
import StudyEvent from "@/lib/models/StudyEvent";
import { revalidatePath } from "next/cache";

// 1. Create a new Exam/Study Goal
export async function createStudyEvent(userId, data) {
  await connectDB();
  try {
    const newEvent = await StudyEvent.create({
      user: userId,
      title: data.title,
      examDate: new Date(data.examDate),
      category: data.category || "General",
    });
    revalidatePath("/profile");
    return { success: true, event: JSON.parse(JSON.stringify(newEvent)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. Add a Note/Blog to an existing Exam Plan
export async function addResourceToPlan(userId, eventId, resourceData) {
  await connectDB();
  try {
    const event = await StudyEvent.findOne({ _id: eventId, user: userId });
    if (!event) return { success: false, error: "Plan not found" };

    // Prevent duplicates
    const exists = event.resources.some(r => r.resourceId.toString() === resourceData.id);
    if (exists) return { success: false, error: "Already in your study plan!" };

    event.resources.push({
      resourceId: resourceData.id,
      resourceType: resourceData.type
    });

    await event.save();
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 3. Get User's Active Plans (with countdown logic)
export async function getUserStudyPlans(userId) {
  await connectDB();
  try {
    const plans = await StudyEvent.find({ user: userId, isCompleted: false })
      .sort({ examDate: 1 })
      .lean();
    return { success: true, plans: JSON.parse(JSON.stringify(plans)) };
  } catch (error) {
    return { success: false, plans: [] };
  }
}

// Add these to actions/planner.actions.js

export async function getStudyPlanBySlug(slug) {
  await connectDB();
  try {
    const plan = await StudyEvent.findOne({ slug, isPublic: true })
      .populate("user", "name avatar")
      .lean();
    return { success: true, plan: JSON.parse(JSON.stringify(plan)) };
  } catch (error) {
    return { success: false, plan: null };
  }
}

export async function cloneStudyPlan(userId, originalPlanId) {
  await connectDB();
  try {
    const original = await StudyEvent.findById(originalPlanId);
    if (!original) return { success: false, error: "Original plan not found" };

    // Create a copy for the current user
    const clonedPlan = await StudyEvent.create({
      user: userId,
      title: `Copy of ${original.title}`,
      examDate: original.examDate,
      category: original.category,
      resources: original.resources, // Copies all linked Note/Blog IDs
      isPublic: false, // New copy starts as private
    });

    // Increment clone count on original
    original.clones = (original.clones || 0) + 1;
    await original.save();

    revalidatePath("/planner");
    return { success: true, newId: clonedPlan._id.toString() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Add this import at the top if not present
// import crypto from 'crypto';

// 4. Toggle Plan Visibility (Publish / Unpublish)
export async function togglePlanVisibility(userId, planId, makePublic) {
  await connectDB();
  try {
    const plan = await StudyEvent.findOne({ _id: planId, user: userId });
    if (!plan) return { success: false, error: "Plan not found" };

    plan.isPublic = makePublic;

    // Generate a unique slug if publishing for the first time
    if (makePublic && !plan.slug) {
      const baseSlug = plan.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const randomString = Math.random().toString(36).substring(2, 7);
      plan.slug = `${baseSlug}-${randomString}`;
    }

    await plan.save();
    revalidatePath("/planner");
    return { success: true, slug: plan.slug, isPublic: plan.isPublic };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 5. Get All Public Roadmaps (For the Community Directory)
export async function getPublicStudyPlans(searchQuery = "") {
  await connectDB();
  try {
    let query = { isPublic: true };
    
    // Add search functionality
    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }

    const plans = await StudyEvent.find(query)
      .populate("user", "name avatar")
      .sort({ clones: -1, createdAt: -1 }) // Sort by most cloned, then newest
      .lean();

    return { success: true, plans: JSON.parse(JSON.stringify(plans)) };
  } catch (error) {
    return { success: false, plans: [] };
  }
}

// 6. Delete a Study Plan
export async function deleteStudyPlan(userId, planId) {
  await connectDB();
  try {
    const deleted = await StudyEvent.findOneAndDelete({ _id: planId, user: userId });
    if (!deleted) return { success: false, error: "Plan not found or unauthorized" };
    
    revalidatePath("/planner");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 7. Remove a Resource from a Plan
export async function removeResourceFromPlan(userId, planId, resourceId) {
  await connectDB();
  try {
    const plan = await StudyEvent.findOne({ _id: planId, user: userId });
    if (!plan) return { success: false, error: "Plan not found" };

    // Filter out the specific resource
    plan.resources = plan.resources.filter(r => r.resourceId.toString() !== resourceId.toString());
    await plan.save();

    revalidatePath("/planner");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}