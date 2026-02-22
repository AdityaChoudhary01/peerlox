"use client";

import { useState, useMemo } from "react";
import BlogCard from "@/components/blog/BlogCard";
import { Hash, Search } from "lucide-react"; // 🚀 Swapped react-icons for lucide-react to save 2MB of JS
import { Button } from "@/components/ui/button";

export default function BlogListClient({ initialBlogs, categories }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  // 🚀 INSTANT CLIENT-SIDE FILTERING (Zero Database Hits!)
  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((blog) => {
      const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) || 
                            blog.summary.toLowerCase().includes(search.toLowerCase());
      const matchesTag = activeTag === "All" || blog.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [initialBlogs, search, activeTag]);

  return (
    <section className="max-w-4xl mx-auto mb-12 space-y-6" aria-label="Search and Filters">
      
      {/* Search Bar */}
      <div className="relative w-full max-w-xl mx-auto mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-secondary/10 border border-border/50 rounded-full focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-foreground"
        />
      </div>

      {/* Category Tabs */}
      <nav className="relative w-full" aria-label="Blog Categories">
        <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        
        <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar snap-x px-4 md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTag(cat)}
              className={`snap-start whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTag === cat
                  ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)] border-transparent"
                  : "bg-secondary/20 hover:bg-secondary/40 text-muted-foreground border border-border/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Blog Grid */}
      <div className="mt-12" aria-label="Blog posts grid">
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <article key={blog._id} className="h-full transform transition-all duration-300 hover:-translate-y-2">
                <BlogCard blog={blog} />
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-secondary/5 rounded-[2.5rem] border border-dashed border-border/60 shadow-inner">
            <Hash className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" aria-hidden="true" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No articles found</h3>
            <p className="text-base text-muted-foreground">Try adjusting your search or filters.</p>
            <Button onClick={() => { setSearch(""); setActiveTag("All"); }} variant="outline" className="mt-6 rounded-full">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}