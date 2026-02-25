import BlogCard from "@/components/blog/BlogCard"; // Adjust path as needed

export default function RelatedBlog({ blogs }) {
  if (!blogs || blogs.length === 0) return null;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.stuhive.in";

  // 🚀 SUPERCHARGED JSON-LD: Tells Google exactly what this list contains
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "More articles from this author",
    "itemListElement": blogs.map((blog, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "BlogPosting",
        "headline": blog.title,
        "url": `${APP_URL}/blogs/${blog.slug}`,
        "image": blog.coverImage || `${APP_URL}/default-blog.png`,
        "datePublished": blog.createdAt,
        "author": {
          "@type": "Person",
          "name": blog.author?.name || "StuHive Contributor"
        }
      }
    }))
  };

  return (
    // 🚀 SEMANTIC HTML: Changed <div> to <section> and linked it to the heading via ARIA
    <section className="space-y-6" aria-labelledby="related-blogs-heading">
      
      {/* 🚀 INJECT SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
        <h3 id="related-blogs-heading" className="text-xl font-bold tracking-tight text-foreground">
          More from this Author
        </h3>
      </div>

      {/* GRID ADJUSTMENT: 
         - sm:grid-cols-2 (2 cards per row)
         - md:grid-cols-3 (3 cards per row)
         - lg:grid-cols-4 (4 cards per row)
         
         This grid layout forces the cards to be narrower (smaller) 
         than the standard 2-column layout.
      */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        itemScope 
        itemType="https://schema.org/ItemList" // 🚀 MICRODATA: Defines the list container
      >
        {blogs.map((blog, index) => (
          <div 
            key={blog._id} 
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem" // 🚀 MICRODATA: Defines each item in the list
            className="h-full"
          >
            {/* 🚀 MICRODATA: Provides the exact position for Google's carousel ranking */}
            <meta itemProp="position" content={index + 1} />
            <BlogCard blog={blog} />
          </div>
        ))}
      </div>
    </section>
  );
}