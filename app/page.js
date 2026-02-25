import Link from "next/link";
import { getNotes } from "@/actions/note.actions";
import { getHomeData } from "@/actions/home.actions";
import { getPublicCollections } from "@/actions/collection.actions"; 

// Components
import HeroSection from "@/components/home/HeroSection";
import PaginatedNotesFeed from "@/components/home/PaginatedNotesFeed";
import NoteCard from "@/components/notes/NoteCard";
import BlogCard from "@/components/blog/BlogCard"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

// Icons
import { ArrowRight, Users, FileText, Download, Trophy, Sparkles, Flame, PenTool, FolderHeart, Library } from "lucide-react";

export const revalidate = 30; // 🚀 ISR Cache at Edge

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.stuhive.in";

// 🚀 ULTRA HYPER SEO METADATA MATRIX (app/page.js)
export const metadata = {
  title: {
    // 🚀 FIXED: 'absolute' forces Next.js to ignore the "%s | StuHive" template in layout.js
    // This prevents the duplicate title issue (e.g., "StuHive | Notes | StuHive")
    absolute: "StuHive | Free Academic Notes, Study Materials & Peer Collections", 
  },
  description: "Join a global network of top-tier students. Download free handwritten notes, access curated academic collections, read peer blogs, and ace your university exams.",
  keywords: [
    "academic notes", "StuHive", "peer notez", "university study tips", 
    "free PDF notes", "student collaboration", "study material bundles",
    "exam preparation", "college resources", "handwritten lecture notes",
    "download study guides", "academic community"
  ],
  authors: [{ name: "StuHive Organization", url: process.env.NEXT_PUBLIC_APP_URL || "https://www.stuhive.in" }],
  creator: "StuHive",
  publisher: "StuHive Academic Network",
  category: "Education",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: APP_URL,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "StuHive | The Global Academic Knowledge Hub",
    description: "Access high-quality study materials, curated note collections, and academic blogs for free.",
    url: "/", // Next.js auto-resolves this via metadataBase
    siteName: "StuHive",
    type: "website",
    locale: "en_US",
    images: [
      { 
        url: "/logo512.png", // Next.js auto-resolves this via metadataBase
        width: 1200,
        height: 630,
        alt: "StuHive - Learn Better Together",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "StuHive | Free Study Materials & Notes",
    description: "Join thousands of students sharing handwritten notes and academic blogs.",
    images: ["/logo512.png"],
  }
};

export default async function HomePage() {
  // 🚀 PARALLEL DATA FETCHING FOR MAXIMUM SPEED
  const [featuredNotesRes, allNotesRes, homeData, collectionsRes] = await Promise.all([
    getNotes({ limit: 3, sort: 'highestRated' }),
    getNotes({ page: 1, limit: 12 }),
    getHomeData(),
    getPublicCollections({ page: 1, limit: 3 }) // Fetch 3 most recent collections
  ]);

  const { stats, contributors, blogs } = homeData;
  const collections = collectionsRes?.collections || [];

  // 🚀 MASSIVE INTERCONNECTED JSON-LD KNOWLEDGE GRAPH
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
        "name": "StuHive",
        "url": APP_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${APP_URL}/logo512.png`
        },
        "description": "A collaborative ecosystem for academic success and free study materials."
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        "url": APP_URL,
        "name": "StuHive",
        "publisher": { "@id": `${APP_URL}/#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${APP_URL}/global-search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${APP_URL}/#webpage`,
        "url": APP_URL,
        "inLanguage": "en-US",
        "name": "StuHive | Free Academic Notes & Study Materials",
        "isPartOf": { "@id": `${APP_URL}/#website` },
        "about": { "@id": `${APP_URL}/#organization` }
      }
    ]
  };

  const statCardClass = "relative group flex flex-col items-center p-3 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden h-full justify-center";

  return (
    <main className="flex flex-col w-full overflow-hidden bg-background">
      {/* INJECT KNOWLEDGE GRAPH */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroSection />

      {/* --- PLATFORM STATS --- */}
      <section className="relative z-20 -mt-16 sm:-mt-24 container max-w-7xl px-2 sm:px-6 pt-10" aria-label="StuHive Platform Statistics">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          <div className={statCardClass}>
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-3 sm:p-5 bg-cyan-500/10 rounded-xl sm:rounded-2xl text-cyan-400 mb-2 sm:mb-6 shadow-[0_0_30px_rgba(34,211,238,0.15)] group-hover:-translate-y-1 transition-transform">
              <FileText className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <div className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
              {stats?.totalNotes?.toLocaleString() || 0}
            </div>
            <h2 className="text-[9px] sm:text-[13px] font-bold text-cyan-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-2 text-center">Total Notes</h2>
          </div>
          
          <div className={statCardClass}>
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-3 sm:p-5 bg-purple-500/10 rounded-xl sm:rounded-2xl text-purple-400 mb-2 sm:mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] group-hover:-translate-y-1 transition-transform">
              <Users className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <div className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
              {stats?.totalUsers?.toLocaleString() || 0}
            </div>
            <h2 className="text-[9px] sm:text-[13px] font-bold text-purple-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-2 text-center">Active Students</h2>
          </div>

          <div className={`${statCardClass} col-span-2 lg:col-span-1 py-4 sm:py-10`}>
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-3 sm:p-5 bg-green-500/10 rounded-xl sm:rounded-2xl text-green-400 mb-2 sm:mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)] group-hover:-translate-y-1 transition-transform">
              <Download className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <div className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
              {stats?.totalDownloads?.toLocaleString() || 0}
            </div>
            <h2 className="text-[9px] sm:text-[13px] font-bold text-green-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-2 text-center">Resources Saved</h2>
          </div>
        </div>
      </section>

      {/* --- FEATURED COLLECTIONS (NEW) --- */}
      {collections.length > 0 && (
        <section className="relative container max-w-7xl py-12 sm:py-20 px-2 sm:px-6" aria-label="Curated Study Collections">
          <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-14 gap-5 px-1 relative z-10">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="relative w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30 shrink-0 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <FolderHeart className="w-5 h-5 sm:w-8 sm:h-8 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-5xl font-black text-white uppercase tracking-tight drop-shadow-xl">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Curated</span> Archives
                </h2>
                <p className="text-muted-foreground text-[10px] sm:text-sm font-bold uppercase tracking-widest mt-1">Premium note bundles for specific courses</p>
              </div>
            </div>
            
            <Link 
              href="/shared-collections" 
              title="Browse all collections"
              aria-label="Explore all curated academic collections" 
              className="group relative flex items-center justify-center gap-2 sm:gap-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 h-10 sm:h-14 px-6 sm:px-10 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider w-full sm:w-auto overflow-hidden transition-all shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            >
              Browse Archives <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          {/* 🚀 SEO: ItemList Schema for Collections + grid-cols-2 on Mobile */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 relative z-10" itemScope itemType="https://schema.org/ItemList">
            {collections.map((col, index) => (
              <div key={col._id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="h-full">
                <meta itemProp="position" content={index + 1} />
                <Link 
                  href={`/shared-collections/${col.slug}`} 
                  className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-[1.2rem] sm:rounded-[2rem]"
                >
                  <article 
                    // 🚀 Highly responsive padding and border radius for the 2-column mobile layout
                    className="relative flex flex-col justify-between h-full p-4 sm:p-8 rounded-[1.2rem] sm:rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-cyan-500/40 transition-all duration-500 overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(34,211,238,0.15)]"
                    itemProp="item" itemScope itemType="https://schema.org/CollectionPage"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="relative z-10">
                      {/* Responsive Title */}
                      <h3 className="text-sm sm:text-2xl font-black text-white/95 mb-2 sm:mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug sm:leading-tight tracking-tight" itemProp="name">
                        {col.name}
                      </h3>
                      {/* Responsive Description (Smaller on mobile) */}
                      <p className="text-[10px] sm:text-sm text-gray-400 line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-8 leading-relaxed font-medium" itemProp="description">
                        {col.description || 'Access this premium curated bundle of academic resources tailored for specific coursework.'}
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mt-auto pt-3 sm:pt-5 border-t border-white/10">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
                        <Avatar className="w-5 h-5 sm:w-8 sm:h-8 border border-white/20 shrink-0">
                          <AvatarImage src={col.user?.avatar} alt={col.user?.name} />
                          <AvatarFallback className="bg-cyan-900 text-cyan-400 font-bold text-[8px] sm:text-xs">{col.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-[9px] sm:text-xs font-bold text-gray-300 truncate group-hover:text-white transition-colors">
                          {col.user?.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-xs font-black text-cyan-400 bg-cyan-500/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-cyan-500/20 shrink-0">
                        <Library size={10} className="sm:w-3 sm:h-3" aria-hidden="true" /> 
                        <span>{col.notes?.length || 0} <span className="hidden sm:inline">Docs</span></span>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- HIGHEST RATED --- */}
      <section className="relative container max-w-7xl py-12 sm:py-24 px-2 sm:px-6" aria-label="Featured highest rated materials">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative flex items-center gap-3 sm:gap-5 mb-8 sm:mb-14 pl-1">
          <div className="relative w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center text-yellow-400 border border-yellow-500/30 shrink-0 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
            <Trophy className="w-5 h-5 sm:w-8 sm:h-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" aria-hidden="true" />
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-yellow-400/20 animate-ping opacity-20" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-5xl font-black text-white uppercase tracking-tight drop-shadow-xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Highest Rated</span> Notes
            </h2>
            <p className="text-muted-foreground text-[10px] sm:text-sm font-bold uppercase tracking-widest mt-1">Curated work from top-performing students</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8 relative z-10" itemScope itemType="https://schema.org/ItemList">
          {featuredNotesRes?.notes?.map((note, idx) => (
            <article key={note._id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="w-full transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(250,204,21,0.15)] rounded-[28px]">
                <meta itemProp="position" content={idx + 1} />
                <NoteCard note={note} priority={idx === 0} />
            </article>
          ))}
        </div>
      </section>

      {/* --- LIVE REPOSITORY --- */}
      <section className="relative bg-white/[0.01] py-12 sm:py-24 border-t border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" aria-label="Recent uploaded notes repository">
        <div className="container max-w-7xl px-2 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-16 gap-4 px-1">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                <Sparkles size={14} className="animate-pulse" aria-hidden="true" /> Live Repository
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg">Recent Materials</h2>
            </div>
            
            <Link 
              href="/search" 
              title="Browse all materials"
              aria-label="Explore all recent academic materials" 
              className="group relative flex items-center justify-center gap-2 sm:gap-3 bg-white hover:bg-gray-100 text-black h-10 sm:h-14 px-6 sm:px-10 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider w-full sm:w-auto overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-12" />
              Explore All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
          
          <PaginatedNotesFeed 
            initialNotes={allNotesRes?.notes || []} 
            initialTotalPages={allNotesRes?.totalPages || 1} 
          />
        </div>
      </section>

      {/* --- HALL OF FAME & STORIES --- */}
      <section className="relative container max-w-7xl py-12 sm:py-24 px-2 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-14" aria-label="Hall of fame and student stories">
        
        <aside className="col-span-1 space-y-4 sm:space-y-8" aria-labelledby="leaderboard-heading">
          <h2 id="leaderboard-heading" className="text-xl sm:text-3xl font-black text-white uppercase italic flex items-center gap-2 sm:gap-3 pl-1 drop-shadow-md">
            <Flame className="text-orange-500 w-5 h-5 sm:w-8 sm:h-8 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" aria-hidden="true" /> Hall of Fame
          </h2>
          <Card className="bg-[#0a0118]/80 backdrop-blur-2xl border-white/10 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <CardContent className="p-3 sm:p-5 space-y-2 sm:space-y-3">
              {contributors && contributors.length > 0 ? contributors.map((user, index) => (
                <Link 
                  key={user._id} 
                  href={`/profile/${user._id}`} 
                  title={`View ${user.name}'s verified profile`}
                  aria-label={`View ${user.name}'s profile, ranked number ${index + 1}`} 
                  className="relative flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r 
                    ${index === 0 ? 'from-yellow-500/40' : 
                      index === 1 ? 'from-slate-400/40' : 
                      index === 2 ? 'from-amber-600/40' : 
                      'from-cyan-500/20'} via-transparent to-transparent`} 
                  />
                  
                  <div className="relative flex items-center gap-3 sm:gap-4 z-10 flex-1 min-w-0">
                    <span className={`text-lg sm:text-2xl font-black w-6 sm:w-8 text-center shrink-0
                      ${index === 0 ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" : 
                        index === 1 ? "text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.8)]" : 
                        index === 2 ? "text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]" : 
                        "text-gray-500 group-hover:text-gray-300 transition-colors"}`}
                    >
                      #{index + 1}
                    </span>

                    <Avatar className={`w-10 h-10 sm:w-12 sm:h-12 border-2 shrink-0 ${index === 0 ? "border-yellow-400" : index === 1 ? "border-slate-300" : index === 2 ? "border-amber-600" : "border-white/20 group-hover:border-cyan-400/50 transition-colors"}`}>
                      <AvatarImage src={user.avatar || user.image} referrerPolicy="no-referrer" alt={`${user.name}'s Avatar`} />
                      <AvatarFallback className="text-xs bg-white/10">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-sm sm:text-base text-white truncate group-hover:text-cyan-400 transition-colors">{user.name}</p>
                      <p className="text-[9px] sm:text-[11px] text-gray-400 uppercase tracking-[0.15em] font-bold truncate mt-0.5">{user.role || 'Top Scholar'}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="flex flex-col items-center justify-center bg-black/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-white/5 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-colors duration-300 w-12 sm:w-14" title={`${user.noteCount} Uploaded Notes`}>
                      <p className="font-black text-white text-xs sm:text-sm leading-none">{user.noteCount || 0}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <FileText className="w-2 h-2 text-cyan-400" aria-hidden="true" />
                        <span className="text-[6px] sm:text-[8px] text-cyan-400 uppercase tracking-widest font-bold leading-none">Notes</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-black/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-white/5 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-colors duration-300 w-12 sm:w-14" title={`${user.blogCount} Published Blogs`}>
                      <p className="font-black text-white text-xs sm:text-sm leading-none">{user.blogCount || 0}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <PenTool className="w-2 h-2 text-purple-400" aria-hidden="true" />
                        <span className="text-[6px] sm:text-[8px] text-purple-400 uppercase tracking-widest font-bold leading-none">Blogs</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 opacity-50">
                   <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white/20 mb-2 sm:mb-3" aria-hidden="true" />
                   <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-widest font-bold">Calculating Ranks...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="col-span-1 lg:col-span-2 space-y-4 sm:space-y-8" aria-labelledby="peer-stories-heading">
          <div className="flex justify-between items-center px-1 border-b border-white/5 pb-3 sm:pb-4">
            <h2 id="peer-stories-heading" className="text-xl sm:text-3xl font-black text-white uppercase italic flex items-center gap-2 sm:gap-3 drop-shadow-md">
              <FileText className="text-purple-400 w-5 h-5 sm:w-8 sm:h-8 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]" aria-hidden="true" /> Peer Stories
            </h2>
            <Link 
              href="/blogs" 
              title="Read all student blogs" 
              aria-label="Read all student peer stories and blogs" 
              className="group text-[9px] sm:text-[12px] font-black uppercase tracking-widest text-purple-400 hover:text-white flex items-center gap-1 sm:gap-2 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-purple-500/20"
            >
              Read All <ArrowRight size={10} className="sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6" itemScope itemType="https://schema.org/ItemList">
            {blogs && blogs.length > 0 ? blogs.slice(0, 2).map((blog, idx) => (
              <article key={blog._id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.15)] rounded-[1.5rem]">
                <meta itemProp="position" content={idx + 1} />
                <BlogCard blog={blog} />
              </article>
            )) : (
              <div className="col-span-2 flex flex-col items-center justify-center p-8 sm:p-20 border border-dashed border-white/10 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.01]">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white/10 mb-3 sm:mb-4" aria-hidden="true" />
                <p className="text-white/60 text-[10px] sm:text-sm font-bold uppercase tracking-widest text-center">Student stories are being drafted...</p>
              </div>
            )}
          </div>
        </section>

      </section>
    </main>
  );
}