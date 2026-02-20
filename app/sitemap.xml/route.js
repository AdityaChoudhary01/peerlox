import connectDB from "@/lib/db";
import Blog from "@/lib/models/Blog";
import Note from "@/lib/models/Note";
import User from "@/lib/models/User";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://peernotez.netlify.app';

// Helper to safely format dates for XML (W3C format)
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

    // 1. Fetch data with extreme efficiency
    // select() only the fields needed to keep the memory footprint low
    const [blogs, notes, users] = await Promise.all([
      Blog.find({}).select("slug updatedAt").lean(),
      Note.find({}).select("_id updatedAt").lean(),
      User.find({}).select("_id updatedAt").lean(),
    ]);

    // 2. Static Routes
    const staticRoutes = [
      "", "/about", "/contact", "/blogs", "/search", 
      "/login", "/signup", "/donate", "/supporters", 
      "/terms", "/privacy", "/dmca"
    ].map(route => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date().toISOString(),
      priority: route === "" ? "1.0" : "0.5",
      changefreq: "monthly",
    }));

    // 3. Dynamic Blogs
    const blogPages = blogs.map(blog => ({
      url: `${BASE_URL}/blogs/${blog.slug}`,
      lastModified: formatDate(blog.updatedAt),
      priority: "0.8",
      changefreq: "weekly",
    }));

    // 4. Dynamic Notes
    const notePages = notes.map(note => ({
      url: `${BASE_URL}/notes/${note._id.toString()}`,
      lastModified: formatDate(note.updatedAt),
      priority: "0.9",
      changefreq: "daily", // Notes change often with ratings/comments
    }));

    // 5. Public User Profiles
    const profilePages = users.map(user => ({
      url: `${BASE_URL}/profile/${user._id.toString()}`,
      lastModified: formatDate(user.updatedAt),
      priority: "0.6", // Increased priority slightly for E-E-A-T
      changefreq: "weekly",
    }));

    const allPages = [...staticRoutes, ...blogPages, ...notePages, ...profilePages];

    // 6. Construct XML with minimal whitespace to save bandwidth
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map((page) => `  <url>
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
        // Cache-Control is key for performance: 
        // s-maxage=86400 (CDN caches for 24h), stale-while-revalidate (serves old while updating)
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