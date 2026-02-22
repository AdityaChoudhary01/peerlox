import Link from "next/link";
import { getNotes } from "@/actions/note.actions";
import { getHomeData } from "@/actions/home.actions";

// Components
import HeroSection from "@/components/home/HeroSection";
import PaginatedNotesFeed from "@/components/home/PaginatedNotesFeed";
export const revalidate = 30;
import NoteCard from "@/components/notes/NoteCard";
import BlogCard from "@/components/blog/BlogCard"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, FileText, Download, Trophy, Sparkles, Flame } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://stuhive.in";

export const metadata = {
  title: "StuHive | Free Academic Notes & Study Materials",
  description: "Join thousands of students sharing handwritten notes, university PDFs, and academic blogs. Access high-quality study materials for free and ace your exams.",
  keywords: ["academic notes", "StuHive","peer notez", "university study tips", "free PDF notes", "student collaboration"],
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: "StuHive | Learn Better Together",
    description: "The global hub for students to find and share study materials.",
    url: APP_URL,
    siteName: "StuHive",
    type: "website",
    images: [{ url: `${APP_URL}/logo512.png` }]
  },
};

export default async function HomePage() {
  const [featuredNotesRes, allNotesRes, homeData] = await Promise.all([
    getNotes({ limit: 3, sort: 'highestRated' }),
    getNotes({ page: 1, limit: 12 }),
    getHomeData()
  ]);

  const { stats, contributors, blogs } = homeData;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StuHive",
    "url": APP_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${APP_URL}/search?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "description": "A collaborative ecosystem for academic success."
  };

  const statCardClass = "relative group flex flex-col items-center p-3 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden h-full justify-center";

  return (
    <main className="flex flex-col w-full overflow-hidden bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroSection />

      <section className="relative z-20 -mt-16 sm:-mt-24 container max-w-7xl px-2 sm:px-6 pt-10" aria-label="StuHive Stats">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          
          <div className={statCardClass}>
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-3 sm:p-5 bg-cyan-500/10 rounded-xl sm:rounded-2xl text-cyan-400 mb-2 sm:mb-6 shadow-[0_0_30px_rgba(34,211,238,0.15)] group-hover:-translate-y-1">
              <FileText className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            {/* FIXED: Changed from h3 to div to fix sequential heading order accessibility error */}
            <div className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
              {stats?.totalNotes?.toLocaleString() || 0}
            </div>
            {/* FIXED: Increased opacity from /80 to full for better contrast */}
            <p className="text-[9px] sm:text-[13px] font-bold text-cyan-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-2 text-center">Total Notes</p>
          </div>
          
          <div className={statCardClass}>
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-3 sm:p-5 bg-purple-500/10 rounded-xl sm:rounded-2xl text-purple-400 mb-2 sm:mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] group-hover:-translate-y-1">
              <Users className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <div className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
              {stats?.totalUsers?.toLocaleString() || 0}
            </div>
            <p className="text-[9px] sm:text-[13px] font-bold text-purple-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-2 text-center">Active Students</p>
          </div>

          <div className={`${statCardClass} col-span-2 lg:col-span-1 py-4 sm:py-10`}>
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-3 sm:p-5 bg-green-500/10 rounded-xl sm:rounded-2xl text-green-400 mb-2 sm:mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)] group-hover:-translate-y-1">
              <Download className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <div className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
              {stats?.totalDownloads?.toLocaleString() || 0}
            </div>
            <p className="text-[9px] sm:text-[13px] font-bold text-green-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-2 text-center">Resources Saved</p>
          </div>

        </div>
      </section>

      <section className="relative container max-w-7xl py-12 sm:py-24 px-2 sm:px-6" aria-label="Featured materials">
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
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8 relative z-10">
          {featuredNotesRes?.notes?.map((note) => (
            <article key={note._id} className="w-full transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(250,204,21,0.15)] rounded-xl">
                <NoteCard note={note} />
            </article>
          ))}
        </div>
      </section>

      <section className="relative bg-white/[0.01] py-12 sm:py-24 border-t border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" aria-label="Latest notes">
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
              aria-label="Explore all recent academic materials" // FIXED: Added ARIA label
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

      <section className="relative container max-w-7xl py-12 sm:py-24 px-2 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-14" aria-label="Hall of fame and stories">
        
        <aside className="col-span-1 space-y-4 sm:space-y-8">
          <h2 className="text-xl sm:text-3xl font-black text-white uppercase italic flex items-center gap-2 sm:gap-3 pl-1 drop-shadow-md">
            <Flame className="text-orange-500 w-5 h-5 sm:w-8 sm:h-8 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" aria-hidden="true" /> Hall of Fame
          </h2>
          <Card className="bg-[#0a0118]/80 backdrop-blur-2xl border-white/10 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <CardContent className="p-2 sm:p-5 space-y-1 sm:space-y-2">
              {contributors && contributors.length > 0 ? contributors.map((user, index) => (
                <Link 
                  key={user._id} 
                  href={`/profile/${user._id}`} 
                  title={`View ${user.name}'s profile`}
                  aria-label={`View ${user.name}'s profile, ranked number ${index + 1}`} // FIXED: Added specific ARIA label
                  className="relative flex items-center justify-between p-2 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all duration-300 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex items-center gap-2 sm:gap-4 z-10">
                    <span className={`text-base sm:text-xl font-black w-5 sm:w-6 text-center
                      ${index === 0 ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" : 
                        index === 1 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)]" : 
                        index === 2 ? "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]" : 
                        "text-white/40 group-hover:text-white/80 transition-colors"}`} // FIXED: Contrast
                    >
                      #{index + 1}
                    </span>

                    <Avatar className={`w-8 h-8 sm:w-12 sm:h-12 border-2 shrink-0 ${index === 0 ? "border-yellow-400" : index === 1 ? "border-slate-300" : index === 2 ? "border-amber-600" : "border-white/20"}`}>
                      <AvatarImage src={user.avatar || user.image} referrerPolicy="no-referrer" alt={`${user.name}'s Avatar`} />
                      <AvatarFallback className="text-xs bg-white/10">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-base text-white truncate group-hover:text-cyan-400 transition-colors">{user.name}</p>
                      <p className="text-[8px] sm:text-[11px] text-muted-foreground uppercase tracking-[0.1em] sm:tracking-[0.15em] font-bold">{user.role || 'Top Scholar'}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 text-right shrink-0 bg-white/5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                    <p className="font-black text-white text-xs sm:text-base">{user.noteCount}</p>
                    <p className="text-[6px] sm:text-[9px] text-cyan-400 uppercase tracking-widest font-black">Uploads</p>
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

        <section className="col-span-1 lg:col-span-2 space-y-4 sm:space-y-8">
          <div className="flex justify-between items-center px-1 border-b border-white/5 pb-3 sm:pb-4">
            <h2 className="text-xl sm:text-3xl font-black text-white uppercase italic flex items-center gap-2 sm:gap-3 drop-shadow-md">
              <FileText className="text-purple-400 w-5 h-5 sm:w-8 sm:h-8 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]" aria-hidden="true" /> Peer Stories
            </h2>
            <Link 
              href="/blogs" 
              title="Read all student blogs" 
              aria-label="Read all student peer stories and blogs" // FIXED: Added ARIA label
              className="group text-[9px] sm:text-[12px] font-black uppercase tracking-widest text-purple-400 hover:text-white flex items-center gap-1 sm:gap-2 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-purple-500/20"
            >
              Read All <ArrowRight size={10} className="sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {blogs && blogs.length > 0 ? blogs.slice(0, 2).map((blog) => (
              <article key={blog._id} className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.15)] rounded-2xl">
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