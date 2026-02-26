export const dynamic = 'force-dynamic';
import connectDB from "@/lib/db";
import Blog from "@/lib/models/Blog";
import Note from "@/lib/models/Note";
import User from "@/lib/models/User";
import Collection from "@/lib/models/Collection"; 
import StudyEvent from "@/lib/models/StudyEvent"; // 🚀 ADDED: For Public Roadmaps

const BASE_URL = 'https://www.stuhive.in';

const formatDate = (date) => {
  try {
    return new Date(date).toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export async function GET() {
  try {
    await connectDB();

    // 🚀 Fetch all models in parallel for maximum speed
    const blogsPromise = Blog.find({}).select("slug updatedAt").lean();
    const notesPromise = Note.find({}).select("_id updatedAt").lean();
    const usersPromise = User.find({}).select("_id updatedAt").lean();
    const collectionsPromise = Collection.find({ visibility: 'public' }).select("slug updatedAt").lean();
    const roadmapsPromise = StudyEvent.find({ isPublic: true }).select("slug updatedAt").lean(); // 🚀 ADDED
    
    // Get all unique universities and their latest update time directly from Notes
    const universitiesPromise = Note.aggregate([
      { $match: { university: { $ne: null, $ne: "" } } },
      { $group: { 
          _id: "$university", 
          updatedAt: { $max: "$updatedAt" } 
      }}
    ]);

    const [blogs, notes, users, collections, universities, roadmaps] = await Promise.all([
      blogsPromise,
      notesPromise,
      usersPromise,
      collectionsPromise,
      universitiesPromise,
      roadmapsPromise
    ]);

    // 🚀 STATIC ROUTES
    const staticRoutes = [
      "", "/about", "/contact", "/blogs", "/search", "/shared-collections", "/requests",
      "/login","/signup", "/roadmaps", // 🚀 ADDED: Main roadmaps hub
      "/donate", "/supporters", "/terms", "/privacy", "/dmca", "/hive-points"
    ].map(route => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date().toISOString(),
      priority: route === "" ? "1.0" : route === "/requests" || route === "/roadmaps" ? "0.9" : "0.5",
      changefreq: route === "/requests" || route === "/roadmaps" ? "daily" : "monthly",
    }));

    const blogPages = blogs
      .filter(blog => blog.slug) 
      .map(blog => ({
        url: `${BASE_URL}/blogs/${blog.slug}`,
        lastModified: formatDate(blog.updatedAt),
        priority: "0.8",
        changefreq: "weekly",
      }));

    const notePages = notes.map(note => ({
      url: `${BASE_URL}/notes/${note._id.toString()}`,
      lastModified: formatDate(note.updatedAt),
      priority: "0.9",
      changefreq: "daily",
    }));

    const profilePages = users.map(user => ({
      url: `${BASE_URL}/profile/${user._id.toString()}`,
      lastModified: formatDate(user.updatedAt),
      priority: "0.6",
      changefreq: "weekly",
    }));

    const collectionPages = collections
      .filter(col => col.slug) 
      .map(col => ({
        url: `${BASE_URL}/shared-collections/${col.slug}`,
        lastModified: formatDate(col.updatedAt),
        priority: "0.8",
        changefreq: "weekly",
      }));

    // 🚀 DYNAMIC ROADMAP PAGES
    const roadmapPages = roadmaps
      .filter(rm => rm.slug)
      .map(rm => ({
        url: `${BASE_URL}/roadmaps/${rm.slug}`,
        lastModified: formatDate(rm.updatedAt),
        priority: "0.8",
        changefreq: "weekly",
      }));

    // DYNAMIC UNIVERSITY HUB PAGES
    const universityPages = universities.map(univ => {
      const slug = univ._id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return {
        url: `${BASE_URL}/univ/${slug}`,
        lastModified: formatDate(univ.updatedAt),
        priority: "0.9",
        changefreq: "daily",
      };
    });

    // 🚀 MERGE EVERYTHING TOGETHER
    const allPages = [
      ...staticRoutes, 
      ...universityPages, 
      ...blogPages, 
      ...notePages, 
      ...profilePages, 
      ...collectionPages,
      ...roadmapPages // 🚀 ADDED
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map((page) => `<url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  .join("")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200", 
      },
    });
  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${BASE_URL}</loc></url></urlset>`, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}