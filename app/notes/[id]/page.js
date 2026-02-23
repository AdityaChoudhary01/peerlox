import { getNoteById, getRelatedNotes } from "@/actions/note.actions"; 
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

// Components
import ClientPDFLoader from "@/components/notes/ClientPDFLoader";
import Reviews from "@/components/notes/Reviews";
import RelatedNotes from "@/components/notes/RelatedNotes";
import AuthorInfoBlock from "@/components/common/AuthorInfoBlock";
import NotePageActions from "@/components/notes/NotePageActions"; 
import AddToCollectionModal from "@/components/notes/AddToCollectionModal";
import DownloadButton from "./DownloadButton"; 
import SaveNoteHeart from "./SaveNoteHeart"; 
import ViewCounter from "./ViewCounter";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Calendar, Eye, ShieldCheck, Info, HeartHandshake } from "lucide-react"; 

// Utils
import { formatDate } from "@/lib/utils";
import { generateReadUrl } from "@/lib/r2";

const APP_URL = process.env.NEXTAUTH_URL || "https://stuhive.in";

// 🚀 1. ULTRA HYPER SEO METADATA
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  
  const note = await getNoteById(resolvedParams.id);
  if (!note) return { title: "Note Not Found | StuHive", robots: "noindex, nofollow" };

  const ogImage = note.thumbnailUrl || `${APP_URL}/default-note-og.jpg`;
  
  // Dynamic Long-Tail Keyword Generation Matrix
  const dynamicKeywords = [
    note.subject, note.course, note.university,
    `${note.subject} notes`, `${note.course} study material`, 
    `${note.university} ${note.course} notes`, "PDF download",
    "exam preparation", "lecture notes", "university notes",
    note.year ? `${note.year} year notes` : "",
    "free study guide", "StuHive documents"
  ].filter(Boolean);

  return {
    title: `${note.title} | ${note.subject} Notes - ${note.university} | StuHive`,
    description: `Free PDF Download: ${note.title} for ${note.course} at ${note.university}. Comprehensive study material, lecture notes, and exam prep for ${note.subject}. ${note.description?.substring(0, 80)}...`,
    keywords: dynamicKeywords,
    authors: [{ name: note.user?.name || "StuHive Contributor", url: `${APP_URL}/profile/${note.user?._id}` }],
    creator: note.user?.name || "StuHive Contributor",
    publisher: "StuHive",
    category: "Education",
    applicationName: "StuHive",
    alternates: {
        canonical: `${APP_URL}/notes/${resolvedParams.id}`,
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
      title: `${note.title} - ${note.subject} Notes (${note.university})`,
      description: `Access high-quality ${note.course} study materials. Read and download ${note.title} for free on StuHive.`,
      url: `${APP_URL}/notes/${resolvedParams.id}`,
      siteName: "StuHive",
      type: "article",
      publishedTime: note.uploadDate || new Date().toISOString(),
      authors: [note.user?.name || "StuHive Contributor"],
      section: note.subject,
      tags: dynamicKeywords.slice(0, 6),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${note.title} - ${note.course} Study Notes`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${note.title} | ${note.subject} Notes`,
      description: `Download free ${note.course} notes for ${note.university}.`,
      images: [ogImage],
    }
  };
}

export default async function ViewNotePage({ params }) {
  const resolvedParams = await params;
  
  // 🚀 PARALLEL FETCHING
  const [session, note] = await Promise.all([
    getServerSession(authOptions),
    getNoteById(resolvedParams.id)
  ]);
  
  if (!note) notFound();

  const isOwner = session?.user?.id === (note.user?._id?.toString() || note.user?.toString());
  const canEdit = isOwner || session?.user?.role === 'admin';

  // 🚀 FIXED: Using smart getRelatedNotes and Concurrent R2 fetch
  const [relatedNotes, signedUrl] = await Promise.all([
    getRelatedNotes(note._id), // Uses the smart algorithm we built earlier
    generateReadUrl(note.fileKey, note.fileName)
  ]);
  
  // Calculate Ratings for Google Rich Snippets
  const reviewCount = note.reviews?.length || 0;
  const avgRating = reviewCount > 0
      ? (note.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1)
      : null;

  // 🚀 2. HYPER-OPTIMIZED MULTI-SCHEMA JSON-LD INJECTION
  // ✅ FIXED: Breadcrumb schema updated to reflect the new global-search structure
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_URL },
      { "@type": "ListItem", "position": 2, "name": "Search", "item": `${APP_URL}/global-search` },
      { "@type": "ListItem", "position": 3, "name": note.university, "item": `${APP_URL}/global-search?q=${encodeURIComponent(note.university)}` },
      { "@type": "ListItem", "position": 4, "name": note.course, "item": `${APP_URL}/global-search?q=${encodeURIComponent(note.course)}` },
      { "@type": "ListItem", "position": 5, "name": note.title, "item": `${APP_URL}/notes/${note._id}` }
    ]
  };

  const resourceSchema = {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "Course", "CreativeWork"],
    "name": note.title,
    "description": note.description,
    "learningResourceType": ["Study Guide", "Lecture Notes"],
    "educationalLevel": "University",
    "teaches": note.subject,
    "courseCode": note.course,
    "isAccessibleForFree": true, // 🚀 SEO GOLD: Tells Google this is free educational material
    "provider": {
      "@type": "CollegeOrUniversity",
      "name": note.university
    },
    "creator": {
      "@type": "Person",
      "name": note.user?.name || "StuHive Contributor",
      "url": `${APP_URL}/profile/${note.user?._id || ''}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "StuHive",
      "logo": { "@type": "ImageObject", "url": `${APP_URL}/logo192.png` }
    },
    "datePublished": note.uploadDate,
    "inLanguage": "en",
    ...(avgRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating,
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    })
  };

  // 🚀 SERIALIZATION
  const serializedNote = {
    ...note,
    _id: note._id.toString(),
    user: note.user ? { ...note.user, _id: note.user._id?.toString() || note.user.toString() } : null,
    reviews: note.reviews ? note.reviews.map(rev => ({
      ...rev,
      _id: rev._id.toString(),
      parentReviewId: rev.parentReviewId?.toString() || null,
      user: rev.user ? { ...rev.user, _id: rev.user._id?.toString() || rev.user.toString() } : null,
      date: rev.date ? new Date(rev.date).toISOString() : new Date().toISOString()
    })) : []
  };

  return (
    <main className="w-full px-3 md:px-8 mx-auto py-8 md:py-12 pt-24 md:pt-32 max-w-7xl relative">
      {/* INJECT STRUCTURED DATA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(resourceSchema) }} />
      
      <ViewCounter noteId={serializedNote._id} />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />

      <article className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-12 relative z-10">
        
        {/* --- LEFT COLUMN --- */}
        <div className="xl:col-span-8 space-y-8 md:space-y-10">
          
          <header className="space-y-6">
            {/* 🚀 INTERNAL LINKING SEO: Badges updated to use Global Search endpoint */}
            <nav className="flex flex-wrap items-center gap-2 md:gap-3" aria-label="Breadcrumb">
                <Link href={`/global-search?q=${encodeURIComponent(note.university)}`} title={`Search notes from ${note.university}`}>
                  <Badge variant="secondary" className="px-2.5 py-1 text-[10px] md:text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest hover:bg-blue-500/20 transition-colors cursor-pointer">
                    {note.university}
                  </Badge>
                </Link>

                <Link href={`/global-search?q=${encodeURIComponent(note.course)}`} title={`Search notes for ${note.course}`}>
                  <Badge variant="outline" className="px-2.5 py-1 text-[10px] md:text-xs font-bold border-white/10 text-muted-foreground uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    {note.course}
                  </Badge>
                </Link>
                
                {note.subject && (
                  <Link href={`/global-search?q=${encodeURIComponent(note.subject)}`} title={`Search notes about ${note.subject}`}>
                    <Badge variant="outline" className="px-2.5 py-1 text-[10px] md:text-xs font-bold border-pink-500/20 text-pink-400 uppercase tracking-widest bg-pink-500/5 hover:bg-pink-500/10 transition-colors cursor-pointer">
                      {note.subject}
                    </Badge>
                  </Link>
                )}
                
                {note.year && (
                  <Badge variant="outline" className="px-2.5 py-1 text-[10px] md:text-xs font-bold border-emerald-500/20 text-emerald-400 uppercase tracking-widest bg-emerald-500/5">
                    {note.year}
                  </Badge>
                )}
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                    {note.title}
                  </h1>
                  <div className="mt-1.5 md:mt-2 shrink-0">
                    <SaveNoteHeart noteId={serializedNote._id} />
                  </div>
                </div>
                
                <div className="shrink-0">
                  <NotePageActions note={serializedNote} canEdit={canEdit} userId={session?.user?.id} />
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-[11px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary/20 p-3 md:p-4 rounded-2xl border border-border w-fit">
                <span className="flex items-center gap-1.5 md:gap-2" title="Upload Date">
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" aria-hidden="true" /> 
                  <time dateTime={note.uploadDate}>{formatDate(note.uploadDate)}</time>
                </span>
                <span className="flex items-center gap-1.5 md:gap-2" title="Total Views">
                  <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400" aria-hidden="true" /> 
                  <span className="text-foreground">{note.viewCount || 0}</span> Views
                </span>
                <span className="flex items-center gap-1.5 md:gap-2" title="Total Downloads">
                  <Download className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" aria-hidden="true" /> 
                  <span className="text-foreground">{note.downloadCount || 0}</span> Downloads
                </span>
            </div>
          </header>

          <section className="rounded-[1.5rem] md:rounded-[2rem] border border-white/10 bg-background/50 backdrop-blur-xl overflow-hidden shadow-2xl relative group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-80" />
             
             <div className="min-h-[400px] md:min-h-[700px] bg-black/40">
               <ClientPDFLoader url={signedUrl} fileType={note.fileType} title={note.title} />
             </div>
             
             <div className="p-4 md:p-6 bg-secondary/30 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-5">
                <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                    <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
                    <span>Secure R2 Encrypted Stream</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                    <AddToCollectionModal noteId={serializedNote._id} />
                    <DownloadButton signedUrl={signedUrl} fileName={note.fileName} noteId={serializedNote._id} />
                </div>
             </div>
          </section>

          <section className="bg-gradient-to-br from-secondary/30 to-background border border-border p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-lg">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
                <Info className="w-5 h-5 text-cyan-400" />
                About this material
            </h2>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-medium text-sm md:text-base">
                {note.description}
            </p>
          </section>

          <Separator className="bg-border/50" />

          <section id="reviews" className="pt-2">
            <Reviews noteId={serializedNote._id} initialReviews={serializedNote.reviews} />
          </section>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <aside className="xl:col-span-4 space-y-6 md:space-y-8">
            <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/10 bg-gradient-to-b from-secondary/20 to-background p-5 md:p-8 shadow-xl backdrop-blur-md">
                <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-5 md:mb-6">
                  Contributor
                </h2>
                {/* 🚀 SEO FIX: Added Semantic Address tag for authorship */}
                <address className="not-italic">
                  <AuthorInfoBlock user={serializedNote.user} />
                </address>
            </div>

            <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/10 bg-secondary/10 p-5 md:p-8 shadow-xl backdrop-blur-md">
                <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-5 md:mb-6">
                  Similar Materials
                </h2>
                {/* 🚀 Passes the intelligently fetched related notes */}
                <RelatedNotes notes={relatedNotes} />
            </div>

            <section className="rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-b from-cyan-500/20 via-background to-background border border-cyan-500/30 p-6 md:p-8 text-center relative overflow-hidden group shadow-[0_0_40px_-10px_rgba(34,211,238,0.25)]">
                <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />
                
                <div className="bg-cyan-500/20 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-5 border border-cyan-500/30 group-hover:scale-110 transition-transform duration-500">
                   <HeartHandshake className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </div>

                <h3 className="text-lg md:text-xl font-black text-foreground tracking-tight mb-2">Keep StuHive Free</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground font-medium mb-6 leading-relaxed">
                  We rely on your support to maintain high-speed cloud storage and ad-free studying for everyone.
                </p>

                <Link href="/donate" title="Support StuHive">
                    <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:-translate-y-1 border-0">
                        Support the Platform
                    </Button>
                </Link>
            </section>
        </aside>
      </article>
    </main>
  );
}