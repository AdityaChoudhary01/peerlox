import { getNotes } from "@/actions/note.actions";
import NoteCard from "@/components/notes/NoteCard";
import NoteFilter from "@/components/notes/NoteFilter";
import NoteSortBar from "@/components/notes/NoteSortBar";
import Pagination from "@/components/common/Pagination";
import { FaSearch, FaRegFolderOpen, FaArrowLeft, FaFilter } from "react-icons/fa";
import Link from "next/link";

// 🚀 ENFORCED WWW DOMAIN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.stuhive.in";

// ✅ 1. HIGH-OCTANE DYNAMIC METADATA
export async function generateMetadata({ searchParams }) {
  // Await the params object FIRST before destructuring (Next.js 15 requirement)
  const params = await searchParams;
  const { search, university, subject, course, page } = params;
  
  let dynamicTitle = "Search Academic Notes";
  if (subject) dynamicTitle = `${subject} Notes`;
  if (course) dynamicTitle = `${course} Study Material`;
  if (university) dynamicTitle += ` at ${university}`;
  if (search) dynamicTitle = `Results for "${search}"`;
  
  const pageSuffix = page > 1 ? ` - Page ${page}` : "";

  // Build canonical URL to prevent duplicate parameter indexing
  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (university) queryParams.set("university", university);
  if (course) queryParams.set("course", course);
  if (subject) queryParams.set("subject", subject);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return {
    title: `${dynamicTitle} | StuHive Library${pageSuffix}`,
    description: `Explore verified academic notes, course materials, and exam guides. Filter by university, subject, and course level.`,
    alternates: {
      canonical: `${APP_URL}/search${queryString}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${dynamicTitle} | StuHive Archive`,
      description: `Access a comprehensive library of student-led academic resources.`,
      url: `${APP_URL}/search${queryString}`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_URL },
      { "@type": "ListItem", "position": 2, "name": "Library", "item": `${APP_URL}/search` }
    ]
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
    <div className="w-full bg-background" style={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-7xl px-2 sm:px-4">
        <nav className="flex items-center gap-3 mb-6 pl-1" aria-label="Breadcrumb navigation">
            <Link href="/" title="Back to Home" aria-label="Return to Homepage" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/50 hover:text-white shrink-0">
                <FaArrowLeft size={12} aria-hidden="true" />
            </Link>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Library Archive</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <aside className="w-full lg:w-1/4">
            <div className="lg:sticky lg:top-24 space-y-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <FaFilter className="text-primary text-[10px]" aria-hidden="true" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-white">Refine Search</h2>
                </div>
                <div className="p-1 rounded-[1.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-sm">
                    <NoteFilter />
                </div>
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            <header style={styles.headerBox}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                                    <FaSearch size={18} aria-hidden="true" />
                                </div>
                                <span className="truncate">{search ? `Results for: ${search}` : "Discovery Engine"}</span>
                            </h1>
                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></span>
                                {totalCount.toLocaleString()} Materials Indexed
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
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 justify-items-center">
                  {notes.map((note, index) => (
                    <article key={note._id} className="w-full h-full">
                        <NoteCard note={note} priority={index < 4} />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 sm:py-32 rounded-[2rem] bg-white/[0.01] border border-dashed border-white/10 mx-1">
                    <div className="relative inline-block mb-4">
                      <FaRegFolderOpen className="h-14 w-14 sm:h-20 sm:w-20 text-white/10" aria-hidden="true" />
                      <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full" aria-hidden="true"></div>
                    </div>
                    <h3 className="text-xl font-black text-white/60 tracking-tight">Archive Empty</h3>
                    <p className="text-xs text-white/30 max-w-[200px] mx-auto mt-2 italic">
                      The requested materials haven&apos;t been indexed yet.
                    </p>
                    <Link href="/search" title="Clear Search Filters" className="inline-block mt-6 text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors underline underline-offset-8">
                      Clear all filters
                    </Link>
                </div>
              )}
            </section>

            {totalPages > 1 && (
                <footer className="mt-12 sm:mt-20 p-4 sm:p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/10 flex justify-center mx-1" aria-label="Pagination Navigation">
                    <Pagination currentPage={page} totalPages={totalPages} />
                </footer>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}