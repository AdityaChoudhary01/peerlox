import Link from "next/link";
import Image from "next/image"; 
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Star, Eye, ShieldCheck } from "lucide-react"; 
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BlogCard({ blog, priority = false }) {
  const readTime = blog.readTime || 3; 
  const rating = blog.rating || 0;
  const views = blog.viewCount || 0;
  const isAdmin = blog.author?.role === 'admin';

  // 🚀 SUPERCHARGED JSON-LD: Added interaction statistics for Google's Knowledge Graph
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.coverImage || "https://www.stuhive.in/default-blog.png",
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt, // Freshness signal
    "author": {
      "@type": "Person",
      "name": blog.author?.name || "StuHive Contributor",
      "jobTitle": isAdmin ? "Admin" : "Contributor"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StuHive",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.stuhive.in/logo512.png"
      }
    },
    "description": blog.summary || blog.excerpt || `Read this academic article about ${blog.tags?.[0] || 'education'}.`,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": views
      }
    ]
  };

  // Safe date parsing for the <time> element's machine-readable attribute
  const machineReadableDate = blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString();

  return (
    // 🚀 MICRODATA: Identifies this specific wrapper as a BlogPosting
    <article className="h-full" itemScope itemType="https://schema.org/BlogPosting"> 
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      
      <Link href={`/blogs/${blog.slug}`} title={`Read: ${blog.title}`} className="block h-full group" itemProp="url">
        <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(102,126,234,0.15)] hover:border-primary/40 flex flex-col bg-[#0a0a0a] border border-white/10 hover:-translate-y-1 transform-gpu">
          
          <div className="relative h-44 w-full overflow-hidden bg-secondary/20 shrink-0 -mb-[1px] z-0">
            {blog.coverImage ? (
              <Image 
                src={blog.coverImage} 
                alt={`Cover for ${blog.title}`} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"} 
                unoptimized={true}
                className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform transform-gpu"
                itemProp="image" // 🚀 MICRODATA: Image explicit tagging
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/5">
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-black">StuHive</span>
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10" aria-label="Blog Categories">
              {blog.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-black/80 text-white backdrop-blur-md border border-white/20 text-[9px] uppercase font-bold px-2 py-0.5">
                  <span itemProp="keywords">{tag}</span> {/* 🚀 MICRODATA: Tag tracking */}
                </Badge>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-90 z-10" aria-hidden="true" />
          </div>

          <CardContent className="flex flex-col flex-grow p-4 sm:p-5 relative z-10 bg-[#0a0a0a]">
            <div className="flex items-center gap-x-3 text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">
              {/* 🚀 SEMANTIC HTML: Replaced span with <time> for accurate date parsing */}
              <time dateTime={machineReadableDate} itemProp="datePublished" className="flex items-center gap-1" title={`Published on ${formatDate(blog.createdAt)}`}>
                <Calendar className="w-3 h-3 text-cyan-400" aria-hidden="true" /> {formatDate(blog.createdAt)}
              </time>
              <span className="flex items-center gap-1" aria-label={`${readTime} minute read time`}>
                <Clock className="w-3 h-3 text-pink-400" aria-hidden="true" /> {readTime} min
              </span>
              <span className="flex items-center gap-1" aria-label={`${views} views`}>
                <Eye className="w-3 h-3 text-purple-400" aria-hidden="true" /> {views}
              </span>
            </div>

            <h3 
              className="text-lg font-extrabold tracking-tight leading-snug mb-2 line-clamp-2 text-white group-hover:text-cyan-400 transition-colors duration-300"
              itemProp="headline" // 🚀 MICRODATA: Headline explicit tagging
            >
              {blog.title}
            </h3>
            
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
            
            <p 
              className="text-gray-300 text-xs leading-relaxed line-clamp-2 mb-4 flex-grow font-medium"
              itemProp="description" // 🚀 MICRODATA: Description explicit tagging
            >
              {blog.summary || blog.excerpt || "Click to read the full article on StuHive..."}
            </p>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
              
              {/* 🚀 MICRODATA: Person & Author hierarchy */}
              <div className="flex items-center gap-2.5" itemProp="author" itemScope itemType="https://schema.org/Person">
                <div className="relative">
                  <Avatar className="w-8 h-8 border border-white/20 shrink-0">
                    <AvatarImage src={blog.author?.avatar} alt={`${blog.author?.name} avatar`} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-[10px] font-black">{blog.author?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isAdmin && (
                    <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] rounded-full p-0.5 z-10" aria-hidden="true" title="Verified Admin">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-200 truncate max-w-[120px]" itemProp="name">
                      {blog.author?.name || "StuHive Contributor"} 
                  </span>
                  {isAdmin ? (
                    <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold mt-0.5" itemProp="jobTitle">Admin</span>
                  ) : (
                    <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mt-0.5" itemProp="jobTitle">Contributor</span>
                  )}
                </div>
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