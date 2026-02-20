import Link from "next/link";
import { getBlogs, getUniqueBlogTags } from "@/actions/blog.actions";
import BlogCard from "@/components/blog/BlogCard"; 
import Pagination from "@/components/common/Pagination";
import BlogSearchClient from "@/components/blog/BlogSearchClient"; 
import { FaPenNib, FaHashtag } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const APP_URL = process.env.NEXTAUTH_URL || "https://peernotez.netlify.app";

// ✅ 1. DYNAMIC METADATA (Handles Pagination SEO)
export async function generateMetadata({ searchParams }) {
  const page = searchParams.page || 1;
  const tag = searchParams.tag || "All";
  
  return {
    title: page > 1 ? `Articles - Page ${page} | PeerNotez` : "Insights & Stories | Academic Blog",
    description: `Browse ${tag !== "All" ? tag : ""} academic articles, tech journeys, and study tips from the PeerNotez student community. Page ${page}.`,
    alternates: {
      canonical: `${APP_URL}/blogs`,
    },
    openGraph: {
      title: "PeerNotez Insights | The Student Blog",
      description: "Knowledge sharing and experiences from students worldwide.",
      url: `${APP_URL}/blogs`,
      siteName: "PeerNotez",
      type: "website",
    },
  };
}

export default async function BlogPage({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const tag = searchParams.tag || "All";

  // Fetch Data in parallel
  const [blogsData, dynamicTags] = await Promise.all([
      getBlogs({ page, search, tag }),
      getUniqueBlogTags()
  ]);

  const { blogs, totalPages } = blogsData;
  const categories = [...new Set(["All", ...dynamicTags])];

  // ✅ 2. COLLECTION SCHEMA (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "PeerNotez Academic Blogs",
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
    <main className="container py-12 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header Section */}
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 tracking-tight">
            Insights & Stories
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore peer-contributed articles on exam prep, technology journeys, and student life.
        </p>
        
        <div className="flex justify-center gap-4 pt-4">
            <Link href="/blogs/post" title="Write a new article">
                <Button className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 border-0 shadow-lg hover:shadow-pink-500/25 transition-all">
                    <FaPenNib className="mr-2" aria-hidden="true" /> Write a Blog
                </Button>
            </Link>
            <Link href="/blogs/my-blogs" title="View my articles">
                 <Button variant="outline" className="rounded-full">
                    My Articles
                 </Button>
            </Link>
        </div>
      </header>
      
      {/* Search & Filter Section */}
      <section className="max-w-4xl mx-auto mb-10 space-y-6" aria-label="Search and Filters">
        <BlogSearchClient initialSearch={search} />

        {/* Dynamic Tags Navigation */}
        <nav className="relative w-full" aria-label="Blog Categories">
            <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            
            <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar snap-x px-4">
                {categories.map((cat) => {
                    const tagUrl = cat === "All" 
                        ? `/blogs${search ? `?search=${search}` : ''}`
                        : `/blogs?tag=${cat}${search ? `&search=${search}` : ''}`;

                    return (
                        <Link 
                            key={cat} 
                            href={tagUrl}
                            title={`View posts in ${cat}`}
                            className={`snap-start whitespace-nowrap flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                                tag === cat 
                                ? "bg-pink-500 text-white shadow-md" 
                                : "bg-secondary/20 hover:bg-secondary/40 text-muted-foreground border border-border/50"
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
                  <article key={blog._id} className="h-full">
                      <BlogCard blog={blog} />
                  </article>
              ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/5 rounded-3xl border border-dashed border-border/60">
              <FaHashtag className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-muted-foreground">No articles found</h3>
              <p className="text-sm text-muted-foreground/70">Be the first to share your experience with the community!</p>
          </div>
        )}
      </section>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <footer className="mt-12" aria-label="Pagination">
            <Pagination currentPage={page} totalPages={totalPages} />
        </footer>
      )}
    </main>
  );
}