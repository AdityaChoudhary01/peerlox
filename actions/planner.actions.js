"use server";

import connectDB from "@/lib/db";
import StudyEvent from "@/lib/models/StudyEvent";
import Note from "@/lib/models/Note";   // 🚀 ADDED: Needed to lookup Note Slugs
import Blog from "@/lib/models/Blog";   // 🚀 ADDED: Needed to lookup Blog Slugs
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

// 🚀 Helper Function: Hydrate resources with their SEO slugs
async function hydratePlanResources(plan) {
  if (!plan.resources || plan.resources.length === 0) return plan;

  const enrichedResources = await Promise.all(plan.resources.map(async (res) => {
    let slug = null;
    try {
      if (res.resourceType === 'Note') {
        const note = await Note.findById(res.resourceId).select('slug').lean();
        if (note) slug = note.slug;
      } else if (res.resourceType === 'Blog') {
        const blog = await Blog.findById(res.resourceId).select('slug').lean();
        if (blog) slug = blog.slug;
      }
    } catch (e) {
      console.error(`Failed to fetch slug for resource ${res.resourceId}`);
    }
    
    return {
      ...res,
      resourceSlug: slug || null // 🚀 INJECTED!
    };
  }));

  return { ...plan, resources: enrichedResources };
}

// 3. Get User's Active Plans (with countdown logic)
export async function getUserStudyPlans(userId) {
  await connectDB();
  try {
    const plans = await StudyEvent.find({ user: userId, isCompleted: false })
      .sort({ examDate: 1 })
      .lean();
      
    // 🚀 Hydrate all plans with slugs before returning to client!
    const hydratedPlans = await Promise.all(plans.map(p => hydratePlanResources(p)));
      
    return { success: true, plans: JSON.parse(JSON.stringify(hydratedPlans)) };
  } catch (error) {
    return { success: false, plans: [] };
  }
}

export async function getStudyPlanBySlug(slug) {
  await connectDB();
  try {
    const plan = await StudyEvent.findOne({ slug, isPublic: true })
      .populate("user", "name avatar")
      .lean();
      
    if (!plan) return { success: false, plan: null };

    // 🚀 Hydrate the plan with slugs!
    const hydratedPlan = await hydratePlanResources(plan);

    return { success: true, plan: JSON.parse(JSON.stringify(hydratedPlan)) };
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

    // 🚀 Hydrate all plans with slugs before returning
    const hydratedPlans = await Promise.all(plans.map(p => hydratePlanResources(p)));

    return { success: true, plans: JSON.parse(JSON.stringify(hydratedPlans)) };
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