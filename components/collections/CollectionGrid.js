"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderHeart, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPublicCollections } from "@/actions/collection.actions";

export default function CollectionGrid({ initialCollections, totalCount }) {
  const [collections, setCollections] = useState(initialCollections);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = collections.length < totalCount;

  // 🚀 HYBRID LOAD MORE: 
  // Intercepts the click for users (smooth JS fetch) but acts as a real link for crawlers.
  const handleLoadMore = async (e) => {
    e.preventDefault(); // Prevents full page reload
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await getPublicCollections({ page: nextPage, limit: 12 });
      
      if (res?.collections) {
        setCollections((prev) => [...prev, ...res.collections]);
        setPage(nextPage);
        
        // Shallowly update the URL so sharing the link works, without triggering a full page reload
        window.history.replaceState(null, "", `?page=${nextPage}`);
      }
    } catch (error) {
      console.error("Failed to load more collections", error);
    } finally {
      setLoading(false);
    }
  };

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 animate-in fade-in duration-700">
        <div className="p-6 bg-white/5 rounded-full mb-6">
          <BookOpen size={40} className="text-gray-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white mb-2">No Archives Found</h3>
        <p className="text-gray-400 text-base max-w-sm text-center leading-relaxed">
          Our contributors are currently indexing new semester bundles. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 🚀 SEO: ItemList Schema & Mobile 2-Column Grid */}
      <div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-in fade-in duration-700 delay-150"
        itemScope 
        itemType="https://schema.org/ItemList"
      >
        {collections.map((col, index) => (
          <div key={`${col._id}-${index}`} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="h-full">
            <meta itemProp="position" content={index + 1} />
            
            <Link 
              href={`/shared-collections/${col.slug}`} 
              className="group outline-none block h-full focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-[1.2rem] sm:rounded-3xl"
              title={`Access ${col.name} curated materials`}
            >
              <article 
                className="flex flex-col justify-between h-full p-4 sm:p-8 bg-white/[0.02] border border-white/10 rounded-[1.2rem] sm:rounded-3xl transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
                itemProp="item" itemScope itemType="https://schema.org/CollectionPage"
              >
                
                {/* Subtle Hover Glow inside card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

                <div className="relative z-10">
                  <header className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 bg-white/5 rounded-xl text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-300">
                      <FolderHeart size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 bg-white/5 border border-white/10 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                      <span className="text-[8px] sm:text-[10px] font-bold text-gray-300">{col.notes?.length || 0} <span className="hidden sm:inline">Files</span></span>
                    </div>
                  </header>

                  <h3 className="text-sm sm:text-xl font-bold mb-2 sm:mb-3 leading-snug tracking-tight text-white group-hover:text-cyan-400 transition-colors line-clamp-2" itemProp="name">
                    {col.name}
                  </h3>
                  
                  <p className="text-[10px] sm:text-sm text-gray-400 line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4 sm:mb-8" itemProp="description">
                     {col.description || `Optimized academic collection for ${col.name}. Expertly organized for your exam readiness.`}
                  </p>
                </div>

                <footer className="pt-3 sm:pt-5 border-t border-white/10 flex items-center justify-between mt-auto relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
                     <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border border-white/20 shrink-0">
                        <AvatarImage src={col.user?.avatar} alt={col.user?.name || "User"} />
                        <AvatarFallback className="bg-gray-800 text-gray-300 text-[8px] sm:text-xs font-bold">
                          {col.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                     </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-300 truncate max-w-[80px] sm:max-w-[100px] group-hover:text-white transition-colors">
                        {col.user?.name}
                      </span>
                      <span className="text-[7px] sm:text-[9px] font-medium uppercase tracking-widest text-gray-500">
                        Curator
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/5 text-gray-400 group-hover:bg-cyan-500 group-hover:text-black transition-all shrink-0">
                    <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                  </div>
                </footer>
              </article>
            </Link>
          </div>
        ))}
      </div>

      {/* 🚀 SEO-FRIENDLY LOAD MORE BUTTON */}
      {hasMore && (
        <div className="mt-12 sm:mt-16 flex justify-center animate-in fade-in duration-500">
          <Link 
            href={`?page=${page + 1}`} 
            onClick={handleLoadMore}
            className="inline-flex items-center justify-center rounded-full px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold uppercase tracking-widest border border-white/10 hover:bg-white/5 hover:border-cyan-400/50 hover:text-white text-gray-300 transition-all duration-300 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin text-cyan-400" aria-hidden="true" /> Fetching Archives...</>
            ) : (
              "Load More Bundles"
            )}
          </Link>
        </div>
      )}
    </div>
  );
}