export const dynamic = 'force-dynamic';
import connectDB from "@/lib/db";
import Blog from "@/lib/models/Blog";
import Note from "@/lib/models/Note";
import User from "@/lib/models/User";

const BASE_URL = 'https://peerlox.in';

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

    // 🚀 THE FIX: Added logging and error handling specifically for blogs
    const blogsPromise = Blog.find({}).select("slug updatedAt").lean();
    const notesPromise = Note.find({}).select("_id updatedAt").lean();
    const usersPromise = User.find({}).select("_id updatedAt").lean();

    const [blogs, notes, users] = await Promise.all([
      blogsPromise,
      notesPromise,
      usersPromise,
    ]);

    // DEBUG: See what is actually being returned
    console.log(`[SITEMAP] Found ${blogs.length} blogs, ${notes.length} notes, ${users.length} users.`);
    if (blogs.length === 0) {
      console.warn("[SITEMAP] WARNING: No blogs found in the database. Are they published?");
    } else {
        console.log("[SITEMAP] Sample blog slug:", blogs[0]?.slug);
    }

    const staticRoutes = [
      "", "/about", "/contact", "/blogs", "/search",
      "/login","/signup", 
      "/donate", "/supporters", "/terms", "/privacy", "/dmca"
    ].map(route => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date().toISOString(),
      priority: route === "" ? "1.0" : "0.5",
      changefreq: "monthly",
    }));

    // Filter out any blogs that somehow don't have a slug to prevent malformed URLs
    const blogPages = blogs
      .filter(blog => blog.slug) // 🚀 Prevent undefined slugs
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

    const allPages = [...staticRoutes, ...blogPages, ...notePages, ...profilePages];

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

    // 🚀 THE CACHE FIX: To test changes immediately, temporarily remove the Cache-Control header
    // so Cloudflare doesn't serve you a stale version. Put it back once it's working.
    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        // "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200", 
      },
    });
  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${BASE_URL}</loc></url></urlset>`, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}