"use server";

import connectDB from "@/lib/db";
import Note from "@/lib/models/Note";
import User from "@/lib/models/User";
import Blog from "@/lib/models/Blog";

export async function getHomeData() {
  await connectDB();

  try {
    // ⚡ PERFORMANCE BOOST: Run all database queries in parallel
    const [
      totalNotes,
      totalUsers,
      totalDownloadsRes,
      contributors,
      blogs
    ] = await Promise.all([
      // 1. Fetch Stats
      Note.countDocuments(),
      User.countDocuments(),
      Note.aggregate([{ $group: { _id: null, total: { $sum: "$downloadCount" } } }]),

      // 2. Fetch Top Contributors
      User.find({ noteCount: { $gt: 0 } })
        .sort({ noteCount: -1 })
        .limit(5)
        .select("name avatar image role noteCount")
        .lean(),

      // 3. Fetch Featured Blogs (Latest 3)
      Blog.find({}) 
        .populate("author", "name avatar image role") // Added 'role' for the Admin Badge check
        .sort({ createdAt: -1 }) 
        .limit(3)
        .lean()
        .catch(e => {
            console.error("Error fetching blogs for homepage:", e);
            return []; // Fallback to empty array if blog fetch fails, preventing whole page crash
        })
    ]);

    const totalDownloads = totalDownloadsRes[0]?.total || 0;

    return {
      stats: { totalNotes, totalUsers, totalDownloads },
      
      // Serialize Contributors
      contributors: contributors.map(c => ({ 
          ...c, 
          _id: c._id.toString() 
      })),
      
      // Serialize Blogs strictly for Client Components
      blogs: blogs.map(b => ({
        ...b,
        _id: b._id.toString(),
        author: b.author ? { ...b.author, _id: b.author._id.toString() } : null,
        summary: b.summary || b.excerpt || "",
        coverImage: b.coverImage || null, // Cloudflare R2 Public URL
        tags: b.tags ? Array.from(b.tags) : [],
        rating: b.rating || 0,
        numReviews: b.numReviews || 0,
        viewCount: b.viewCount || 0,
        createdAt: b.createdAt ? b.createdAt.toISOString() : new Date().toISOString()
      }))
    };
    
  } catch (error) {
    console.error("Failed to fetch home data:", error);
    return { 
        stats: { totalNotes: 0, totalUsers: 0, totalDownloads: 0 }, 
        contributors: [], 
        blogs: [] 
    };
  }
}