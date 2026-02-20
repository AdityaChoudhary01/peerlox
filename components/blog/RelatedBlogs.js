import BlogCard from "@/components/blog/BlogCard"; // Adjust path as needed

export default function RelatedBlog({ blogs }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
        <h3 className="text-xl font-bold tracking-tight text-foreground">More from this Author</h3>
      </div>

      {/* GRID ADJUSTMENT: 
         - sm:grid-cols-2 (2 cards per row)
         - md:grid-cols-3 (3 cards per row)
         - lg:grid-cols-4 (4 cards per row)
         
         This grid layout forces the cards to be narrower (smaller) 
         than the standard 2-column layout.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {blogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </div>
  );
}