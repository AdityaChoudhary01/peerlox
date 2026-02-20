import Link from "next/link";
import { getNotes } from "@/actions/note.actions";
import { getHomeData } from "@/actions/home.actions";

// Components
import HeroSection from "@/components/home/HeroSection";
import PaginatedNotesFeed from "@/components/home/PaginatedNotesFeed";
import NoteCard from "@/components/notes/NoteCard";
import BlogCard from "@/components/blog/BlogCard"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, FileText, Download, Trophy, Sparkles } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://peernotez.netlify.app";

// ✅ 1. CONCISE SEO METADATA (Inherits Template from Layout)
export const metadata = {
  title: "PeerNotez | Free Academic Notes & Study Materials",
  description: "Join thousands of students sharing handwritten notes, university PDFs, and academic blogs. Access high-quality study materials for free and ace your exams.",
  keywords: ["academic notes", "peernotez","peer notez", "university study tips", "free PDF notes", "student collaboration"],
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: "PeerNotez | Learn Better Together",
    description: "The global hub for students to find and share study materials.",
    url: APP_URL,
    siteName: "PeerNotez",
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

  // ✅ 2. BREADCRUMB & SEARCH SCHEMA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PeerNotez",
    "url": APP_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${APP_URL}/search?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "description": "A collaborative ecosystem for academic success."
  };

  const statCardClass = "flex flex-col items-center p-3 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all h-full justify-center";

  return (
    <main className="flex flex-col w-full overflow-hidden bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroSection />

      {/* 2. STATS SECTION */}
      <section className="relative z-10 -mt-12 sm:-mt-16 container max-w-7xl px-2 sm:px-4" aria-label="PeerNotez Stats">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          <div className={statCardClass}>
            <div className="p-2 sm:p-4 bg-cyan-400/10 rounded-xl sm:rounded-2xl text-cyan-400 mb-1 sm:mb-4 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <FileText className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-4xl font-black text-white">{stats?.totalNotes?.toLocaleString() || 0}</h3>
            <p className="text-[9px] sm:text-[12px] font-bold text-muted-foreground uppercase tracking-tighter text-center">Total Notes</p>
          </div>
          
          <div className={statCardClass}>
            <div className="p-2 sm:p-4 bg-purple-500/10 rounded-xl sm:rounded-2xl text-purple-400 mb-1 sm:mb-4 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <Users className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-4xl font-black text-white">{stats?.totalUsers?.toLocaleString() || 0}</h3>
            <p className="text-[9px] sm:text-[12px] font-bold text-muted-foreground uppercase tracking-tighter text-center">Active Students</p>
          </div>

          <div className={`${statCardClass} col-span-2 lg:col-span-1 py-4 sm:py-8`}>
            <div className="p-2 sm:p-4 bg-green-500/10 rounded-xl sm:rounded-2xl text-green-400 mb-1 sm:mb-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              <Download className="w-5 h-5 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-4xl font-black text-white">{stats?.totalDownloads?.toLocaleString() || 0}</h3>
            <p className="text-[9px] sm:text-[12px] font-bold text-muted-foreground uppercase tracking-tighter text-center">Resources Saved</p>
          </div>
        </div>
      </section>

      {/* 3. BEST NOTES SECTION */}
      <section className="container max-w-7xl py-10 sm:py-16 px-2 sm:px-4" aria-label="Featured materials">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10 pl-1">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 shrink-0">
            <Trophy size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">Best Rated Notes</h2>
            <p className="text-muted-foreground text-[10px] sm:text-sm font-medium">Curated work from top-performing students</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-8">
          {featuredNotesRes?.notes?.map((note) => (
            <article key={note._id} className="w-full">
                <NoteCard note={note} />
            </article>
          ))}
        </div>
      </section>

      {/* 4. ALL NOTES FEED */}
      <section className="bg-secondary/5 py-10 sm:py-16 border-y border-white/5" aria-label="Latest notes">
        <div className="container max-w-7xl px-2 sm:px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-5 px-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] sm:text-xs uppercase">
                <Sparkles size={12} aria-hidden="true" /> Live Repository
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Recent Materials</h2>
            </div>
            <Link href="/search" title="Browse all materials" className="flex items-center gap-2 bg-white text-black h-11 sm:h-12 px-5 sm:px-8 rounded-full font-black text-xs sm:text-sm w-full sm:w-auto justify-center transition-transform active:scale-95">
              Explore All <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          
          <PaginatedNotesFeed 
            initialNotes={allNotesRes?.notes || []} 
            initialTotalPages={allNotesRes?.totalPages || 1} 
          />
        </div>
      </section>

      {/* 5. LEADERS & BLOGS SECTION */}
      <section className="container max-w-7xl py-10 sm:py-16 px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12" aria-label="Hall of fame and stories">
        <aside className="col-span-1 space-y-6 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic flex items-center gap-2 pl-1">
            <Users className="text-primary w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" /> Top Contributors
          </h2>
          <Card className="bg-white/[0.02] border-white/10 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-xl">
            <CardContent className="p-1 sm:p-4 space-y-0.5">
              {contributors && contributors.length > 0 ? contributors.map((user, index) => (
                <Link 
                  key={user._id} 
                  href={`/profile/${user._id}`} 
                  title={`View ${user.name}'s profile`}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[10px] sm:text-[12px] font-black text-white/20 group-hover:text-primary w-4">{index + 1}</span>
                    <Avatar className="w-8 h-8 sm:w-11 sm:h-11 border border-primary/20 shrink-0">
                      <AvatarImage src={user.avatar || user.image} referrerPolicy="no-referrer" alt={user.name} />
                      <AvatarFallback className="text-xs">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-white truncate">{user.name}</p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-tighter">{user.role || 'Student'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-primary text-xs sm:text-sm">{user.noteCount}</p>
                    <p className="text-[7px] sm:text-[8px] text-muted-foreground uppercase font-bold">Uploads</p>
                  </div>
                </Link>
              )) : (
                <p className="text-muted-foreground text-xs text-center py-8 italic">Analyzing community impact...</p>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="col-span-1 lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic flex items-center gap-2">
              <FileText className="text-primary w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" /> Peer Stories
            </h2>
            <Link href="/blogs" title="Read all student blogs" className="text-[9px] sm:text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1">
              Read All Stories <ArrowRight size={10} aria-hidden="true" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {blogs && blogs.length > 0 ? blogs.slice(0, 2).map((blog) => (
              <article key={blog._id}>
                <BlogCard blog={blog} />
              </article>
            )) : (
              <div className="col-span-2 text-center p-8 sm:p-12 border border-dashed border-white/10 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.01]">
                <p className="text-muted-foreground text-xs italic">Student stories are being drafted...</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}