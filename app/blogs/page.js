import Link from "next/link";
import { Suspense } from "react";
import { getBlogs, getUniqueBlogTags } from "@/actions/blog.actions";
import BlogCard from "@/components/blog/BlogCard"; 
import Pagination from "@/components/common/Pagination";
import BlogSearchClient from "@/components/blog/BlogSearchClient"; 
import { PenTool, Hash, Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";

const APP_URL = process.env.NEXTAUTH_URL || "https://stuhive.in";

export const revalidate = 60;

// ✅ 1. DYNAMIC METADATA (Handles Pagination SEO)
export async function generateMetadata({ searchParams }) {
  const params = await searchParams; 
  
  const page = params.page || 1;
  const tag = params.tag || "All";
  
  return {
    title: page > 1 ? `Articles - Page ${page} | StuHive` : "Insights & Stories | Academic Blog",
    description: `Browse ${tag !== "All" ? tag : ""} academic articles, tech journeys, and study tips from the StuHive student community. Page ${page}.`,
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
}

// 🚀 THE STATIC SHELL: Loads instantly
export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  
  // Create a unique key based on URL parameters to trigger the loading spinner when navigating
  const suspenseKey = JSON.stringify(params);

  return (
    <main className="container py-12 pt-24 min-h-screen">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header Section (Renders Instantly) */}
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

      {/* 🚀 SUSPENSE BOUNDARY: Streams the heavy database content in the background */}
      <Suspense key={suspenseKey} fallback={<BlogGridLoader />}>
        <BlogContent params={params} />
      </Suspense>

    </main>
  );
}

// 🚀 THE DYNAMIC CONTENT: Fetches data asynchronously
async function BlogContent({ params }) {
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const tag = params.tag || "All";

  const [blogsData, dynamicTags] = await Promise.all([
      getBlogs({ page, search, tag }),
      getUniqueBlogTags()
  ]);

  const { blogs, totalPages } = blogsData;
  const categories = ["All", ...dynamicTags]; 

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Search & Filter Section */}
      <section className="max-w-4xl mx-auto mb-12 space-y-6" aria-label="Search and Filters">
        <BlogSearchClient initialSearch={search} />

        {/* Dynamic Tags Navigation */}
        <nav className="relative w-full" aria-label="Blog Categories">
            <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            
            <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar snap-x px-4 md:justify-center">
                {categories.map((cat) => {
                    const searchParams = new URLSearchParams();
                    if (search) searchParams.set("search", search);
                    if (cat !== "All") searchParams.set("tag", cat);
                    
                    const queryString = searchParams.toString();
                    const tagUrl = `/blogs${queryString ? `?${queryString}` : ""}`;

                    return (
                        <Link 
                            key={cat} 
                            href={tagUrl}
                            title={`View posts in ${cat}`}
                            className={`snap-start whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                                tag === cat 
                                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)] border-transparent" 
                                : "bg-secondary/20 hover:bg-secondary/40 text-muted-foreground border border-border/50 hover:text-foreground"
                            }`}
                        >
                            {cat}
                        </Link>
                    );
                })}
            </div>
        </nav>
      </section>

      {/* Blog Grid Section */}
      <section aria-label="Blog posts grid">
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map(blog => (
                  <article key={blog._id} className="h-full transform transition-all duration-300 hover:-translate-y-2">
                      <BlogCard blog={blog} />
                  </article>
              ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-secondary/5 rounded-[2.5rem] border border-dashed border-border/60 shadow-inner">
              <Hash className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" aria-hidden="true" />
              <h3 className="text-2xl font-bold text-foreground mb-2">No articles found</h3>
              <p className="text-base text-muted-foreground">Be the first to share your experience with the community!</p>
              
              {(search || tag !== "All") && (
                <Link href="/blogs" className="inline-block mt-6">
                  <Button variant="outline" className="rounded-full">Clear Filters</Button>
                </Link>
              )}
          </div>
        )}
      </section>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <footer className="mt-16" aria-label="Pagination">
            <Pagination currentPage={page} totalPages={totalPages} />
        </footer>
      )}
    </>
  );
}

// 🚀 LOCAL LOADER: Shows instantly while tags and blogs fetch
function BlogGridLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center mt-12">
      <Loader2 className="h-12 w-12 animate-spin text-pink-500 mb-6 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
      <h2 className="text-lg font-black text-foreground tracking-[0.2em] uppercase animate-pulse">
        Curating Archive...
      </h2>
    </div>
  );
}