import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Note from "@/lib/models/Note";
import Blog from "@/lib/models/Blog";
import User from "@/lib/models/User";
import Collection from "@/lib/models/Collection";
import StudyEvent from "@/lib/models/StudyEvent";

const APP_URL = process.env.NEXTAUTH_URL || "https://www.stuhive.in";
const INDEXNOW_KEY = "363d05a6f7284bcf8b9060f495d58655";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  if (secret !== "my-super-secret-trigger") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // 1. Static & Main Hub Pages
    let urls = [
      `${APP_URL}/`,
      `${APP_URL}/search`,
      `${APP_URL}/global-search`,
      `${APP_URL}/blogs`,
      `${APP_URL}/roadmaps`,
      `${APP_URL}/shared-collections`,
      `${APP_URL}/requests`,
      `${APP_URL}/donate`,
      `${APP_URL}/supporters`,
      `${APP_URL}/about`,
      `${APP_URL}/contact`,
      `${APP_URL}/privacy`,
      `${APP_URL}/terms`,
      `${APP_URL}/dmca`,
      `${APP_URL}/login`,
      `${APP_URL}/register`,
    ];

    // 🚀 Parallel Fetching (Added University Aggregation)
    const [blogs, notes, users, collections, roadmaps, universities] = await Promise.all([
      Blog.find({}).select('slug').lean(),
      Note.find({}).select('_id').lean(),
      User.find({}).select('_id').lean(),
      Collection.find({ visibility: 'public' }).select('slug').lean(),
      StudyEvent.find({ isPublic: true }).select('slug').lean(),
      // 🚀 Pull unique university list for hub pages
      Note.distinct("university", { university: { $ne: null, $ne: "" } })
    ]);

    // 2. Add Dynamic Blogs
    blogs.forEach(b => {
        if (b.slug) urls.push(`${APP_URL}/blogs/${b.slug}`);
    });

    // 3. Add Dynamic Notes
    notes.forEach(n => urls.push(`${APP_URL}/notes/${n._id.toString()}`));

    // 4. Add Dynamic Public Profiles
    users.forEach(u => urls.push(`${APP_URL}/profile/${u._id.toString()}`));

    // 5. Add Dynamic Public Collections
    collections.forEach(c => {
        if (c.slug) urls.push(`${APP_URL}/shared-collections/${c.slug}`);
    });

    // 6. Add Dynamic Public Roadmaps
    roadmaps.forEach(r => {
        if (r.slug) urls.push(`${APP_URL}/roadmaps/${r.slug}`);
    });

    // 7. 🚀 Add Dynamic University Hub Pages
    universities.forEach(univ => {
      const slug = univ.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      urls.push(`${APP_URL}/univ/${slug}`);
    });

    // 🚀 Submit to IndexNow API
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host: "www.stuhive.in",
        key: INDEXNOW_KEY,
        keyLocation: `${APP_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok || response.status === 202) {
      return NextResponse.json({ 
        success: true, 
        message: `Hyper-SEO Boost! Submitted ${urls.length} URLs including Universities.`,
        urlsSubmitted: urls.length
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({ success: false, error: errorText }, { status: 400 });
    }

  } catch (error) {
    console.error("IndexNow Submission Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}