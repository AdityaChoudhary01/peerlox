import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Star, Eye, ShieldCheck } from "lucide-react"; 
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BlogCard({ blog }) {
  const readTime = blog.readTime || 3; 
  const rating = blog.rating || 0;
  const views = blog.viewCount || 0;
  const isAdmin = blog.author?.role === 'admin';

  // FIXED GSC ERROR: Removed aggregateRating which is not supported for BlogPosting
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
      "name": "StuHive",
      "logo": {
        "@type": "ImageObject",
        "url": "https://stuhive.in/logo512.png"
      }
    },
    "description": blog.summary || blog.excerpt || ""
  };

  return (
    <article className="h-full"> 
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      
      <Link href={`/blogs/${blog.slug}`} title={`Read: ${blog.title}`} className="block h-full group">
        <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(102,126,234,0.15)] hover:border-primary/40 flex flex-col bg-[#0a0a0a] border border-white/10 hover:-translate-y-1">
          
          {/* Cover Image */}
          <div className="relative h-44 w-full overflow-hidden bg-secondary/20 shrink-0">
            {blog.coverImage ? (
              <img 
                src={blog.coverImage} 
                alt={`Cover for ${blog.title}`} 
                loading="lazy" 
                decoding="async"
                width={600}
                height={400}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/5">
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-black">StuHive</span>
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10" aria-label="Blog Categories">
              {blog.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-black/80 text-white backdrop-blur-md border border-white/20 text-[9px] uppercase font-bold px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80" aria-hidden="true" />
          </div>

          <CardContent className="flex flex-col flex-grow p-4 sm:p-5">
            
            {/* Metadata Row */}
            <div className="flex items-center gap-x-3 text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">
              <span className="flex items-center gap-1" aria-label={`Published on ${formatDate(blog.createdAt)}`}>
                <Calendar className="w-3 h-3 text-cyan-400" aria-hidden="true" /> {formatDate(blog.createdAt)}
              </span>
              <span className="flex items-center gap-1" aria-label={`${readTime} minute read time`}>
                <Clock className="w-3 h-3 text-pink-400" aria-hidden="true" /> {readTime} min
              </span>
              <span className="flex items-center gap-1" aria-label={`${views} views`}>
                <Eye className="w-3 h-3 text-purple-400" aria-hidden="true" /> {views}
              </span>
            </div>

            <h3 className="text-lg font-extrabold tracking-tight leading-snug mb-2 line-clamp-2 text-white group-hover:text-cyan-400 transition-colors duration-300">
              {blog.title}
            </h3>
            
            {/* Star Ratings */}
            <div className="flex items-center gap-2 mb-3" aria-label={`Rated ${rating.toFixed(1)} out of 5 stars by ${blog.numReviews || 0} reviewers`}>
              <div className="flex gap-0.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-3 h-3 ${star <= Math.round(rating) ? "fill-yellow-500 text-yellow-500" : "text-white/20"}`} 
                  />
                ))}
              </div>
              <span className="text-[9px] font-bold text-gray-400">
                {rating.toFixed(1)} ({blog.numReviews || 0})
              </span>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 mb-4 flex-grow font-medium">
              {blog.summary || blog.excerpt || "Click to read the full article on StuHive..."}
            </p>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Avatar className="w-7 h-7 border border-white/20 shrink-0">
                  <AvatarImage src={blog.author?.avatar} alt={`${blog.author?.name} avatar`} />
                  <AvatarFallback className="bg-secondary text-[10px] font-black">{blog.author?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-[11px] font-bold text-gray-200 flex items-center gap-1">
                    {blog.author?.name} 
                    {isAdmin && <ShieldCheck className="w-3 h-3 text-emerald-400" aria-label="Verified Admin" />}
                </span>
              </div>
              
              <div className="text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform" aria-hidden="true">
                Read <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </article>
  );
}