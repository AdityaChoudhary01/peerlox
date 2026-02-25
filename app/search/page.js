import { getNotes } from "@/actions/note.actions";
import NoteCard from "@/components/notes/NoteCard";
import NoteFilter from "@/components/notes/NoteFilter";
import NoteSortBar from "@/components/notes/NoteSortBar";
import Pagination from "@/components/common/Pagination";
import { FaSearch, FaRegFolderOpen, FaArrowLeft, FaFilter } from "react-icons/fa";
import Link from "next/link";

// 🚀 ENFORCED WWW DOMAIN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.stuhive.in";

// ✅ 1. ULTRA DYNAMIC METADATA ENGINE
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const { search, university, subject, course, page } = params;
  
  let dynamicTitle = "Search Academic Notes";
  if (subject) dynamicTitle = `${subject} Notes`;
  if (course) dynamicTitle = `${course} Study Material`;
  if (university) dynamicTitle += ` at ${university}`;
  if (search) dynamicTitle = `Results for "${search}"`;
  
  const pageSuffix = page > 1 ? ` - Page ${page}` : "";
  const description = `Access verified ${subject || 'academic'} notes and ${course || 'course'} materials ${university ? `at ${university}` : ''}. Join StuHive to download high-quality PDFs and exam guides.`;

  return {
    title: `${dynamicTitle} | StuHive Library${pageSuffix}`,
    description,
    alternates: { canonical: `${APP_URL}/search` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${dynamicTitle} | StuHive`,
      description,
      url: `${APP_URL}/search`,
      siteName: "StuHive",
      type: "website",
    },
  };
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams; 
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const university = params.university || "";
  const course = params.course || "";
  const subject = params.subject || "";
  const year = params.year || "";
  const sort = params.sort || "newest";

  const { notes, totalPages, totalCount } = await getNotes({
    page,
    limit: 12,
    search,
    university,
    course,
    subject,
    year,
    sort
  });

  // 🚀 2. FIX: ITEMLIST SCHEMA FOR REVIEW SNIPPETS
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": search ? `Study notes for ${search}` : "StuHive Academic Library",
    "description": "A curated collection of university notes and study guides.",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_URL },
        { "@type": "ListItem", "position": 2, "name": "Library", "item": `${APP_URL}/search` }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": notes.length,
      "itemListElement": notes.map((note, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": ["LearningResource", "Course", "CreativeWork"],
          "name": note.title,
          "url": `${APP_URL}/notes/${note._id}`,
          "image": note.thumbnailKey ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${note.thumbnailKey}` : undefined,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": note.rating || "5.0",
            "reviewCount": note.numReviews || "1"
          }
        }
      }))
    }
  };

  const styles = {
    wrapper: { 
      paddingTop: '5rem', paddingBottom: '6rem', minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.03), transparent)'
    },
    headerBox: {
      background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '1.5rem', 
      padding: '1.25rem', marginBottom: '1.5rem'
    }
  };

  return (
    <div className="w-full bg-background selection:bg-primary/30" style={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-7xl px-2 sm:px-4">
        <nav className="flex items-center gap-3 mb-6 pl-1" aria-label="Breadcrumb navigation">
            <Link href="/" title="Back to Home" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/50 hover:text-white shrink-0">
                <FaArrowLeft size={12} aria-hidden="true" />
            </Link>
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary">Library</span>
               <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mt-1">Open Archive</h2>
            </div>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <aside className="w-full lg:w-1/4">
            <div className="lg:sticky lg:top-24 space-y-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-primary text-[10px]" aria-hidden="true" />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white">Refine Search</h2>
                    </div>
                    {totalCount > 0 && <span className="text-[8px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-white/60">{totalCount} Found</span>}
                </div>
                <div className="p-1 rounded-[1.8rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl">
                    <NoteFilter />
                </div>
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            <header style={styles.headerBox} className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 ring-1 ring-primary/20">
                                    <FaSearch size={18} aria-hidden="true" />
                                </div>
                                <span className="truncate">{search ? `Results for: ${search}` : "Discovery Engine"}</span>
                            </h1>
                            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" aria-hidden="true"></span>
                                {totalCount.toLocaleString()} Educational Assets Indexed
                            </p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <NoteSortBar currentSort={sort} />
                    </div>
                </div>
            </header>

            <section aria-labelledby="search-results-heading">
              <h2 id="search-results-heading" className="sr-only">Search Results Grid</h2>
              
              {notes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  {notes.map((note, index) => (
                    <article key={note._id} className="w-full h-full transform-gpu transition-all duration-500 hover:-translate-y-1">
                        <NoteCard note={note} priority={index < 3} />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 sm:py-32 rounded-[2.5rem] bg-secondary/5 border border-dashed border-white/10 mx-1">
                    <div className="relative inline-block mb-6">
                      <FaRegFolderOpen className="h-16 w-16 text-white/10" aria-hidden="true" />
                      <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full" aria-hidden="true"></div>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Archive Empty</h3>
                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto mt-2 font-medium leading-relaxed">
                      We couldn&apos;t find any resources matching your current filter criteria.
                    </p>
                    <Link href="/search" className="inline-flex items-center mt-8 px-6 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-95">
                      Reset Discovery Engine
                    </Link>
                </div>
              )}
            </section>

            {totalPages > 1 && (
                <footer className="mt-16 sm:mt-24 p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 flex justify-center mx-1 shadow-inner" aria-label="Pagination Navigation">
                    {/* 🚀 Pagination Component */}
                    <Pagination currentPage={page} totalPages={totalPages} />
                </footer>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}