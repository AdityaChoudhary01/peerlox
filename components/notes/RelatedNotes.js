import Link from "next/link";
import Image from "next/image";
import { FileText, Download, Star, Image as ImageIcon, Presentation, Table as TableIcon, FileType } from "lucide-react";

// Helper for dynamic file icons if thumbnail is missing
const FileIcon = ({ type, className }) => {
  if (type?.includes("pdf")) return <FileText className={className} aria-hidden="true" />;
  if (type?.includes("image")) return <ImageIcon className={className} aria-hidden="true" />;
  if (type?.includes("presentation") || type?.includes("powerpoint")) return <Presentation className={className} aria-hidden="true" />;
  if (type?.includes("spreadsheet") || type?.includes("excel")) return <TableIcon className={className} aria-hidden="true" />;
  return <FileType className={className} aria-hidden="true" />;
};

export default function RelatedNotes({ notes }) {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center p-8 bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">No similar archives found</p>
      </div>
    );
  }

  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.stuhive.in";

  // 🚀 FIXED: GSC valid aggregateRating for Course & LearningResource
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": notes.map((note, index) => {
        const thumbnailUrl = note.thumbnailKey 
            ? `${r2PublicUrl}/${note.thumbnailKey}` 
            : (note.fileType?.startsWith("image/") && note.fileKey ? `${r2PublicUrl}/${note.fileKey}` : null);
            
        return {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                // ✅ FIX: Multiple types ensure Google reads the Star Rating safely
                "@type": ["LearningResource", "Course", "CreativeWork"], 
                "description": note.description || `Academic notes and study material for ${note.course}.`,
                "name": note.title,
                "url": `${APP_URL}/notes/${note._id}`,
                "image": thumbnailUrl || undefined,
                "educationalLevel": "University",
                "learningResourceType": "Study Guide",
                "provider": {
                    "@type": "Organization",
                    "name": note.university || "Aktu"
                },
                // Only include rating if it exists to avoid null errors
                ...(note.rating > 0 && {
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": note.rating.toFixed(1),
                        "bestRating": "5",
                        "worstRating": "1",
                        "reviewCount": note.numReviews || 1
                    }
                })
            }
        };
    })
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* 🚀 Inject Schema Here */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      
      {notes.map((note) => {
        // Construct Thumbnail
        const thumbnailUrl = note.thumbnailKey 
          ? `${r2PublicUrl}/${note.thumbnailKey}` 
          : (note.fileType?.startsWith("image/") && note.fileKey ? `${r2PublicUrl}/${note.fileKey}` : null);

        // Safe Ratings Calculation
        const rating = note.rating || 0;
        
        return (
          <div key={note._id}>
            <Link 
              href={`/notes/${note._id}`} 
              className="group block outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-2xl"
            >
              <article 
                className="flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-300"
              >
                {/* --- THUMBNAIL SECTION --- */}
                <div className="relative w-14 h-16 sm:w-16 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10 group-hover:border-cyan-500/50 transition-colors transform-gpu">
                  {thumbnailUrl ? (
                    <Image 
                      src={thumbnailUrl} 
                      alt={`Study material preview for ${note.title}`} 
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 group-hover:text-cyan-400 transition-colors">
                      <FileIcon type={note.fileType} className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                  )}
                  {/* Subtle glass overlay to make it look premium */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none" />
                </div>

                {/* --- TEXT CONTENT SECTION --- */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-2">
                  <div>
                    <h4 
                      className="font-bold text-sm text-white/90 line-clamp-2 group-hover:text-cyan-400 transition-colors leading-snug tracking-tight"
                    >
                      {note.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span 
                      className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest truncate max-w-[60%]"
                    >
                      <FileText className="w-3 h-3 shrink-0" aria-hidden="true" /> 
                      <span className="truncate">{note.university || "University Notes"}</span>
                    </span>
                    
                    <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1 group-hover:text-emerald-400 transition-colors" title={`${note.downloadCount || 0} Downloads`}>
                        <Download className="w-3 h-3" aria-hidden="true" /> 
                        {note.downloadCount || 0}
                      </span>
                      
                      {rating > 0 && (
                        <span 
                            className="flex items-center gap-1 text-yellow-500" 
                            title={`Rated ${rating.toFixed(1)} stars out of 5`}
                        >
                          <Star className="w-3 h-3 fill-current drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" aria-hidden="true" /> 
                          {rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        );
      })}
    </div>
  );
}