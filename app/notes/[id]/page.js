import { getNoteById, getNotes } from "@/actions/note.actions"; 
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
import { Download, Calendar, Eye, ShieldCheck, Info } from "lucide-react";

// Utils
import { formatDate } from "@/lib/utils";
import { generateReadUrl } from "@/lib/r2";

const APP_URL = process.env.NEXTAUTH_URL || "https://peerlox.in";

// ✅ 1. HIGH-OCTANE DYNAMIC SEO METADATA
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  
  const note = await getNoteById(resolvedParams.id);
  if (!note) return { title: "Note Not Found" };

  const ogImage = note.thumbnailUrl || `${APP_URL}/default-note-og.jpg`;

  return {
    title: `${note.title} - ${note.subject} | PeerLox`,
    description: `Download ${note.title} for ${note.course} at ${note.university}. ${note.description?.substring(0, 120)}...`,
    keywords: [note.subject, note.course, note.university, "study notes", "academic material", "PDF notes"],
    alternates: {
        canonical: `${APP_URL}/notes/${resolvedParams.id}`,
    },
    openGraph: {
      title: note.title,
      description: `Academic material for ${note.course}`,
      url: `${APP_URL}/notes/${resolvedParams.id}`,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      images: [ogImage],
    }
  };
}

export default async function ViewNotePage({ params }) {
  const resolvedParams = await params;
  
  // 🚀 PARALLEL FETCHING: Fetch the session and the main note at the same time to cut load times in half
  const [session, note] = await Promise.all([
    getServerSession(authOptions),
    getNoteById(resolvedParams.id)
  ]);
  
  if (!note) notFound();

  const isOwner = session?.user?.id === (note.user?._id?.toString() || note.user?.toString());
  const canEdit = isOwner || session?.user?.role === 'admin';

  // Fetch related notes and R2 URL concurrently
  const [relatedNotesData, signedUrl] = await Promise.all([
    getNotes({ subject: note.subject, limit: 4, page: 1 }),
    generateReadUrl(note.fileKey, note.fileName)
  ]);
  
  const { notes: relatedNotes } = relatedNotesData;
  const filteredRelated = relatedNotes.filter(n => n._id.toString() !== note._id.toString());

  // ✅ 2. EDUCATIONAL SCHEMA (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": note.subject,
    "description": note.description,
    "provider": {
      "@type": "Organization",
      "name": note.university,
      "sameAs": APP_URL
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "instructor": {
        "@type": "Person",
        "name": note.user?.name || "PeerLox Contributor"
      }
    },
    "educationalLevel": "University",
    "about": {
        "@type": "Thing",
        "name": note.title
    }
  };

  // 🚀 SERIALIZATION: Even if .lean() is used, MongoDB ObjectIds must be strings for Client Components
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
    <main className="container py-8 md:py-12 pt-24 md:pt-32 max-w-7xl relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Non-blocking View Counter */}
      <ViewCounter noteId={serializedNote._id} />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />

      <article className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* --- LEFT COLUMN --- */}
        <div className="xl:col-span-8 space-y-8 md:space-y-10">
          
          <header className="space-y-6">
            <nav className="flex flex-wrap items-center gap-3" aria-label="Breadcrumb">
                <Badge variant="secondary" className="px-3 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                  {note.university}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-xs font-bold border-white/10 text-muted-foreground uppercase tracking-widest bg-white/5">
                  {note.course}
                </Badge>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div className="flex items-start gap-4">
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
            
            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary/20 p-4 rounded-2xl border border-border w-fit">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" aria-hidden="true" /> 
                  <time dateTime={note.uploadDate}>{formatDate(note.uploadDate)}</time>
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" aria-hidden="true" /> 
                  <span className="text-foreground">{note.viewCount || 0}</span> Views
                </span>
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" aria-hidden="true" /> 
                  <span className="text-foreground">{note.downloadCount || 0}</span> Downloads
                </span>
            </div>
          </header>

          <section className="rounded-[2rem] border border-white/10 bg-background/50 backdrop-blur-xl overflow-hidden shadow-2xl relative group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-80" />
             
             <div className="min-h-[500px] md:min-h-[700px] bg-black/40">
               <ClientPDFLoader url={signedUrl} fileType={note.fileType} title={note.title} />
             </div>
             
             <div className="p-4 md:p-6 bg-secondary/30 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Secure R2 Encrypted Stream</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                    <AddToCollectionModal noteId={serializedNote._id} />
                    <DownloadButton signedUrl={signedUrl} fileName={note.fileName} noteId={serializedNote._id} />
                </div>
             </div>
          </section>

          <section className="bg-gradient-to-br from-secondary/30 to-background border border-border p-6 md:p-8 rounded-[2rem] shadow-lg">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
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
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-secondary/20 to-background p-6 md:p-8 shadow-xl backdrop-blur-md">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-6">
                  Contributor
                </h3>
                <AuthorInfoBlock user={serializedNote.user} />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-secondary/10 p-6 md:p-8 shadow-xl backdrop-blur-md">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-6">
                  Similar Materials
                </h3>
                <RelatedNotes notes={filteredRelated} />
            </div>

            <section className="rounded-[2rem] bg-gradient-to-br from-cyan-500/10 via-background to-purple-500/10 border border-cyan-500/20 p-8 text-center relative overflow-hidden group shadow-[0_0_30px_-10px_rgba(34,211,238,0.2)]">
                <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />
                <h4 className="text-lg font-black text-foreground tracking-tight mb-2">KEEP PeerLox FREE</h4>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-6 leading-relaxed">
                  Help us maintain high-speed cloud storage for everyone.
                </p>
                <Link href="/donate" title="Support PeerLox">
                    <Button variant="outline" className="w-full h-12 rounded-xl border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black font-black uppercase tracking-widest text-xs transition-all">
                        Support the Platform
                    </Button>
                </Link>
            </section>
        </aside>
      </article>
    </main>
  );
}