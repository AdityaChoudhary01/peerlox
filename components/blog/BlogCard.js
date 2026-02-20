import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Star, Eye, ShieldCheck } from "lucide-react"; 
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BlogCard({ blog }) {
  const readTime = Math.ceil((blog.content?.split(/\s+/).length || 0) / 200);
  const rating = blog.rating || 0;
  const views = blog.viewCount || 0;
  const isAdmin = blog.author?.role === 'admin';

  // ✅ 1. SEO: Structured Data (JSON-LD)
  // This helps Google identify this as a specific blog post in a list
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.coverImage || "/default-blog.png",
    "datePublished": blog.createdAt,
    "author": {
      "@type": "Person",
      "name": blog.author?.name,
      "jobTitle": isAdmin ? "Admin" : "Contributor"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PeerNotez",
      "logo": {
        "@type": "ImageObject",
        "url": "https://peernotez.netlify.app/logo512.png"
      }
    },
    "description": blog.summary || blog.excerpt || "",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating || 5,
      "reviewCount": blog.numReviews || 1
    }
  };

  return (
    <article className="h-full"> {/* ✅ 2. Use <article> tag for semantic SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      
      <Link href={`/blogs/${blog.slug}`} title={`Read: ${blog.title}`} className="block h-full group">
        <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(102,126,234,0.15)] hover:border-primary/40 flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/10 hover:-translate-y-1">
          
          {/* Cover Image */}
          <div className="relative h-48 w-full overflow-hidden bg-secondary/20">
            {blog.coverImage ? (
              <img 
                src={blog.coverImage} 
                alt={blog.title} 
                loading="lazy" // ✅ 3. Lazy loading for performance
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium">
                No Cover Image
              </div>
            )}
            
            {/* Tags overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {blog.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <CardContent className="flex flex-col flex-grow p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <time dateTime={blog.createdAt} className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(blog.createdAt)}
                </time>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readTime} min read</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {views} views</span>
              </div>
            </div>

            {/* ✅ 4. Use h3 for consistent heading hierarchy */}
            <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {blog.title}
            </h3>
            
            {/* Star Ratings Section */}
            <div className="flex items-center gap-2 mb-3" aria-label={`Rated ${rating.toFixed(1)} stars`}>
              <div className="flex" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {rating.toFixed(1)} ({blog.numReviews || 0} reviews)
              </span>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
              {blog.summary || blog.excerpt || blog.content?.substring(0, 120) + "..."}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6 border">
                  <AvatarImage src={blog.author?.avatar} alt={blog.author?.name} />
                  <AvatarFallback className="text-[10px]">{blog.author?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground line-clamp-1 flex items-center gap-1">
                      {blog.author?.name} 
                      {isAdmin && (
                          <ShieldCheck className="w-3 h-3 text-yellow-500" />
                      )}
                  </span>
                </div>
              </div>
              
              <footer className="text-primary text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read More <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </footer>
            </div>
          </CardContent>
        </Card>
      </Link>
    </article>
  );
}