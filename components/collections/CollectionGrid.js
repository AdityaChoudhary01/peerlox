"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FolderHeart, ArrowRight, BookOpen, Loader2, ArrowDown, Globe, User, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getPublicCollections, getUserCollections } from "@/actions/collection.actions";

export default function CollectionGrid({ initialCollections, totalCount, initialPage = 1 }) {
  const { data: session } = useSession();
  
  // Tab State
  const [activeTab, setActiveTab] = useState("community"); // "community" | "my"

  // Community Collections State
  const [collections, setCollections] = useState(initialCollections);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const hasMore = collections.length < totalCount;

  // My Collections State
  const [myCollections, setMyCollections] = useState([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myLoaded, setMyLoaded] = useState(false);

  // Fetch My Collections when tab is switched
  useEffect(() => {
    if (activeTab === "my" && session?.user?.id && !myLoaded) {
      setMyLoading(true);
      getUserCollections(session.user.id)
        .then((res) => {
          setMyCollections(res || []);
          setMyLoaded(true);
        })
        .catch((err) => console.error("Failed to fetch my collections", err))
        .finally(() => setMyLoading(false));
    }
  }, [activeTab, session, myLoaded]);

  // 🚀 HYBRID LOAD MORE FOR SEO & UX
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

  return (
    <div className="space-y-8 md:space-y-12">
      
      {/* 🚀 TAB NAVIGATION */}
      <div className="flex justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Button 
          onClick={() => setActiveTab("community")}
          className={`rounded-full px-5 sm:px-6 h-11 sm:h-12 text-xs sm:text-sm font-bold tracking-wide transition-all ${activeTab === "community" ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}
        >
          <Globe size={16} className="mr-2 sm:w-[18px] sm:h-[18px]" aria-hidden="true" /> Community
        </Button>
        <Button 
          onClick={() => setActiveTab("my")}
          className={`rounded-full px-5 sm:px-6 h-11 sm:h-12 text-xs sm:text-sm font-bold tracking-wide transition-all ${activeTab === "my" ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}
        >
          <User size={16} className="mr-2 sm:w-[18px] sm:h-[18px]" aria-hidden="true" /> My Archives
        </Button>
      </div>

      {/* 🚀 TAB CONTENT: COMMUNITY ARCHIVES */}
      {activeTab === "community" && (
        <div className="space-y-12">
          {collections.length === 0 ? (
            <EmptyState msg="No public archives found at the moment. Check back soon." />
          ) : (
            <>
              {/* 🚀 SEO: ItemList Schema & Mobile 2-Column Grid */}
              <div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-in fade-in duration-700 delay-150"
                itemScope 
                itemType="https://schema.org/ItemList"
              >
                {collections.map((col, index) => (
                  <CollectionCard key={col._id} col={col} index={index} isPersonal={false} />
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
                      <>Load More Bundles <ArrowDown className="w-4 h-4 ml-2 text-cyan-400 group-hover:translate-y-1 transition-transform" aria-hidden="true" /></>
                    )}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 🚀 TAB CONTENT: MY ARCHIVES */}
      {activeTab === "my" && (
        <div className="animate-in fade-in duration-500">
          {!session ? (
            <EmptyState 
              msg="You must be logged in to view your personal archives." 
              action={
                <Link href="/login">
                  <Button className="mt-4 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold px-8">Login</Button>
                </Link>
              } 
            />
          ) : myLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" aria-hidden="true" />
            </div>
          ) : myCollections.length === 0 ? (
            <EmptyState 
              msg="You haven't created any collections yet." 
              action={
                <Link href="/profile">
                  <Button className="mt-4 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold px-8">Go to Dashboard</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {myCollections.map((col, index) => (
                <CollectionCard key={col._id} col={col} index={index} isPersonal={true} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 🚀 REUSABLE 2-COLUMN RESPONSIVE CARD
function CollectionCard({ col, index, isPersonal }) {
  // 🚀 FIXED: Personal collections now route to their specific management page (/collections/[id])
  const targetUrl = isPersonal ? `/collections/${col._id}` : `/shared-collections/${col.slug}`;

  return (
    <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="h-full">
      <meta itemProp="position" content={index + 1} />
      
      <Link 
        href={targetUrl} 
        className="group outline-none block h-full focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-[1.2rem] sm:rounded-3xl"
        title={isPersonal ? `Manage ${col.name}` : `Access ${col.name}`}
      >
        <article 
          className="flex flex-col justify-between h-full p-4 sm:p-8 bg-white/[0.02] border border-white/10 rounded-[1.2rem] sm:rounded-3xl transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
          itemProp="item" itemScope itemType="https://schema.org/CollectionPage"
        >
          
          {/* Subtle Hover Glow inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

          <div className="relative z-10">
            <header className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-white/5 rounded-xl text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-300 flex items-center justify-center">
                <FolderHeart size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} aria-hidden="true" />
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
                  {col.user?.name || "Me"}
                </span>
                
                {/* Visual Indicator if personal and private */}
                {isPersonal && col.visibility === 'private' ? (
                  <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-0.5 mt-0.5">
                    <Lock size={8} aria-hidden="true" /> Private
                  </span>
                ) : (
                  <span className="text-[7px] sm:text-[9px] font-medium uppercase tracking-widest text-gray-500 mt-0.5">
                    Curator
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/5 text-gray-400 group-hover:bg-cyan-500 group-hover:text-black transition-all shrink-0">
              <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            </div>
          </footer>
        </article>
      </Link>
    </div>
  );
}

// 🚀 REUSABLE EMPTY STATE
function EmptyState({ msg, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 sm:py-32 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/10 text-center px-4">
      <div className="p-6 bg-white/5 rounded-full mb-6">
        <BookOpen size={40} className="text-gray-500" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">It&apos;s quiet here.</h3>
      <p className="text-gray-400 text-sm sm:text-base max-w-sm leading-relaxed mb-4">
        {msg}
      </p>
      {action}
    </div>
  );
}