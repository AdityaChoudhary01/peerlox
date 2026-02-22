import Link from "next/link";
import { getBlogs, getUniqueBlogTags } from "@/actions/blog.actions";
import BlogListClient from "./BlogListClient"; // 🚀 Import the new Client Component
import { PenTool } from "lucide-react"; 
import { Button } from "@/components/ui/button";

const APP_URL = process.env.NEXTAUTH_URL || "https://stuhive.in";

// 🚀 THE FIX: Cache this page for 60 seconds at the Edge. No more searchParams blocking it!
export const revalidate = 60;

// ✅ 1. STATIC METADATA (SEO is now pre-rendered and lightning fast)
export const metadata = {
  title: "Insights & Stories | Academic Blog | StuHive",
  description: "Browse academic articles, tech journeys, and study tips from the StuHive student community.",
  alternates: {
    canonical: `${APP_URL}/blogs`,
  },
  openGraph: {
    title: "StuHive Insights | The Student Blog",
    description: "Knowledge sharing and experiences from students worldwide.",
    url: `${APP_URL}/blogs`,
    siteName: "StuHive",
    type: "website",
  },
};

export default async function BlogPage() {
  // 🚀 HIGH-SPEED FETCHING: Fetch the latest 100 blogs once every 60 seconds.
  // The client will handle filtering them instantly.
  const [blogsData, dynamicTags] = await Promise.all([
      getBlogs({ page: 1, limit: 100 }),
      getUniqueBlogTags()
  ]);

  const { blogs } = blogsData;
  const categories = ["All", ...dynamicTags]; 

  // ✅ 2. COLLECTION SCHEMA (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "StuHive Academic Blogs",
    "description": "A collection of student-written articles about education, technology, and university life.",
    "url": `${APP_URL}/blogs`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": blogs.map((b, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `${APP_URL}/blogs/${b.slug}`
      }))
    }
  };

  return (
    <main className="container py-12 pt-24 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header Section */}
      <header className="text-center mb-12 space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 tracking-tight pb-2">
            Insights & Stories
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Explore peer-contributed articles on exam prep, technology journeys, and student life.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/blogs/post" title="Write a new article">
                <Button className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 border-0 shadow-lg hover:shadow-pink-500/25 transition-all text-white font-bold h-12 px-6">
                    <PenTool className="mr-2.5 h-4 w-4" aria-hidden="true" /> Write a Blog
                </Button>
            </Link>
            <Link href="/blogs/my-blogs" title="View my articles">
                 <Button variant="outline" className="rounded-full h-12 px-6 border-white/10 hover:bg-white/5 font-bold text-foreground">
                    My Articles
                 </Button>
            </Link>
        </div>
      </header>
      
      {/* 🚀 Pass the data to the interactive client component */}
      <BlogListClient initialBlogs={blogs} categories={categories} />
      
    </main>
  );
}