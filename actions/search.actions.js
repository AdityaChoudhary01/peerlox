"use server";

import connectDB from "@/lib/db";
import Note from "@/lib/models/Note";
import Blog from "@/lib/models/Blog";
import User from "@/lib/models/User";

export async function performGlobalSearch(query) {
  if (!query) return { notes: [], blogs: [], users: [] };

  await connectDB();

  try {
    // Make it safe for Regex so special characters don't crash the database
    const safeSearch = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = { $regex: safeSearch, $options: 'i' };

    // Run all 3 queries at the same time
    const [notes, blogs, users] = await Promise.all([
      
      // 1. Search Notes
      Note.find({
        $or: [{ title: searchRegex }, { subject: searchRegex }, { course: searchRegex }]
      })
      // 🚀 THE FIX: Added uploadDate, numReviews, viewCount, and downloadCount
      .select('title subject course fileType thumbnailKey fileKey rating numReviews uploadDate viewCount downloadCount')
      .populate('user', 'name avatar role')
      .limit(6)
      .lean(),

      // 2. Search Blogs
      Blog.find({
        $or: [{ title: searchRegex }, { summary: searchRegex }, { tags: searchRegex }]
      })
      // 🚀 THE FIX: Added createdAt, numReviews, viewCount, and readTime
      .select('title slug summary coverImage tags rating numReviews createdAt viewCount readTime')
      .populate('author', 'name avatar role')
      .limit(6)
      .lean(),

      // 3. Search Users
      User.find({
        $or: [{ name: searchRegex }, { role: searchRegex }] // ✅ PRIVACY: Removed email search
      })
      .select('name avatar role noteCount blogCount')
      .limit(6)
      .lean()
    ]);

    // Serialize data so Next.js doesn't throw Client Component errors
    return {
      notes: notes.map(n => ({
        ...n, 
        _id: n._id.toString(),
        user: n.user ? { ...n.user, _id: n.user._id.toString() } : null,
        // 🚀 THE FIX: Safely serialize the Date object to an ISO string
        uploadDate: n.uploadDate ? n.uploadDate.toISOString() : new Date().toISOString()
      })),
      
      blogs: blogs.map(b => ({
        ...b, 
        _id: b._id.toString(),
        author: b.author ? { ...b.author, _id: b.author._id.toString() } : null,
        tags: b.tags ? Array.from(b.tags) : [], 
        // 🚀 THE FIX: Safely serialize the Date object to an ISO string
        createdAt: b.createdAt ? b.createdAt.toISOString() : new Date().toISOString()
      })),
      
      users: users.map(u => ({ 
          ...u, 
          _id: u._id.toString() 
      }))
    };
    
  } catch (error) {
    console.error("Global search error:", error);
    return { notes: [], blogs: [], users: [] };
  }
}