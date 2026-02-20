"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon, FileType, Heart, Eye, Presentation, Table as TableIcon, Loader2, School } from "lucide-react"; 
import { formatDate } from "@/lib/utils";
import StarRating from "@/components/common/StarRating";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

import { incrementDownloadCount, getNoteDownloadUrl } from "@/actions/note.actions";
import { toggleSaveNote } from "@/actions/user.actions"; 

const FileIcon = ({ type, className }) => {
  if (type?.includes("pdf")) return <FileText className={className} />;
  if (type?.includes("image")) return <ImageIcon className={className} />;
  if (type?.includes("presentation") || type?.includes("powerpoint")) return <Presentation className={className} />;
  if (type?.includes("spreadsheet") || type?.includes("excel")) return <TableIcon className={className} />;
  return <FileType className={className} />;
};

export default function NoteCard({ note }) {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  
  const [isSaved, setIsSaved] = useState(false); 
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (session?.user?.savedNotes?.includes(note._id)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [session?.user?.savedNotes, note._id]);

  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  const thumbnailUrl = note.thumbnailKey 
    ? `${r2PublicUrl}/${note.thumbnailKey}` 
    : (note.fileType?.startsWith("image/") ? `${r2PublicUrl}/${note.fileKey}` : null);

  // ✅ 1. SEO: Educational Schema Data
  // This turns a simple div into an "EducationalOccupationalCredential" or "Article" for Google
  const noteSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": note.title,
    "educationalLevel": note.course,
    "author": {
      "@type": "Person",
      "name": note.user?.name || "PeerNotez Contributor"
    },
    "datePublished": note.uploadDate,
    "educationalUse": "Study Material",
    "image": thumbnailUrl,
    "provider": {
      "@type": "Organization",
      "name": "PeerNotez"
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": note.viewCount || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/DownloadAction",
        "userInteractionCount": note.downloadCount || 0
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": note.rating || 5,
      "reviewCount": note.numReviews || 1
    }
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (!session) return toast({ title: "Login required", description: "Please sign in to save notes.", variant: "destructive" });
    
    const previousState = isSaved;
    setIsSaved(!isSaved);
    const res = await toggleSaveNote(session.user.id, note._id);
    
    if (res.success) {
      toast({ title: res.isSaved ? "Saved to Collection" : "Removed from Collection" });
      const currentSavedNotes = session.user.savedNotes || [];
      const updatedSavedNotes = res.isSaved ? [...currentSavedNotes, note._id] : currentSavedNotes.filter(id => id !== note._id);
      await updateSession({ ...session, user: { ...session.user, savedNotes: updatedSavedNotes } });
    } else {
      setIsSaved(previousState); 
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (!note.fileKey) return toast({ title: "Error", description: "File missing.", variant: "destructive" });

    setIsDownloading(true);
    try {
      const downloadUrl = await getNoteDownloadUrl(note.fileKey, note.fileName);
      if (!downloadUrl) throw new Error();
      window.open(downloadUrl, "_blank");
      incrementDownloadCount(note._id).catch(() => {});
      toast({ title: "Starting Download" });
    } catch {
      toast({ title: "Error", description: "Failed to get link.", variant: "destructive" });
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <Card 
      className="w-full max-w-[400px] mx-auto h-full flex flex-col group relative bg-[#050505] border border-white/10 rounded-[28px] overflow-hidden transition-all duration-500 hover:translate-y-[-6px] hover:shadow-[0_20px_50px_-15px_rgba(34,211,238,0.3)] hover:border-cyan-500/40 isolate"
      style={{ transform: "translateZ(0)" }}
    >
      {/* ✅ 2. SEO: Inject JSON-LD Schema (Hidden) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(noteSchema) }}
      />

      {/* Cinematic Top Flare */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-50 pointer-events-none" />

      {/* --- WRAPPER FOR BOTH SECTIONS --- */}
      <div className="flex flex-col h-full bg-[#050505]">
        
        {/* --- TOP SECTION (IMAGE) --- */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 transform-gpu overflow-hidden bottom-[-2px]">
          {/* Animated Save Heart */}
          <button onClick={handleSave} className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:scale-110 transition-all duration-300 shadow-2xl">
            <Heart className={`h-4 w-4 transition-colors duration-300 ${isSaved ? "fill-pink-500 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" : "text-white/80"}`} />
          </button>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 z-40 flex flex-col items-start gap-2.5 max-w-[70%]">
              {note.isFeatured && (
                <Badge className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 border-0 text-[9px] font-black uppercase tracking-widest text-white px-3 py-1 shadow-lg">
                  <span className="relative z-10">Featured</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 skew-x-12 animate-[shimmer_2.5s_infinite]" />
                </Badge>
              )}
              <Badge className="bg-black/60 backdrop-blur-xl border border-white/10 text-cyan-300 text-[9px] font-black uppercase tracking-widest px-3 py-1 shadow-xl truncate max-w-full">
                  {note.subject}
              </Badge>
          </div>

          <Link href={`/notes/${note._id}`} title={`View ${note.title}`} className="block w-full h-full relative z-10">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={note.title} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.08] opacity-85 group-hover:opacity-100" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/30 group-hover:text-cyan-400 transition-all duration-700 bg-white/[0.02]">
                  <FileIcon type={note.fileType} className="h-16 w-16 group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/50 px-4 py-1.5 rounded-full border border-white/5">
                     {note.fileType?.split('/')[1]?.split('.').pop() || 'DOC'}
                  </span>
              </div>
            )}
          </Link>

          {/* Seamless Deep Fade */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-30 pointer-events-none" />
        </div>

        {/* --- BOTTOM SECTION (TEXT) --- */}
        <div className="flex flex-col flex-grow p-5 sm:p-6 pt-5 relative z-40 bg-[#050505] -mt-[1px]">
          <Link href={`/notes/${note._id}`} title={`Download notes for ${note.course}`} className="flex-grow space-y-3 block mb-6">
            <h3 className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight line-clamp-2 text-white/95 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-500">
              {note.title}
            </h3>
            <div className="text-xs text-white/50 font-semibold flex items-center gap-2 truncate uppercase tracking-wider">
               <School className="w-3.5 h-3.5 text-white/30 shrink-0" /> 
               <span className="truncate">{note.course}</span> <span className="text-white/20">•</span> <span className="truncate">{note.university}</span>
            </div>
          </Link>

          {/* Stats Pills */}
          <div className="flex items-center justify-between text-sm mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-white/[0.03] shadow-inner px-3.5 py-1.5 rounded-full border border-white/5">
                <StarRating rating={note.rating} size="sm" />
                <span className="text-[10px] font-bold text-white/50 ml-1">({note.numReviews})</span>
              </div>
              <div className="flex items-center text-white/50 text-[10px] gap-3.5 uppercase tracking-widest font-bold bg-white/[0.03] shadow-inner px-3.5 py-1.5 rounded-full border border-white/5">
                <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-cyan-400/80" /> {note.viewCount || 0}</span>
                <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-emerald-400/80" /> {note.downloadCount || 0}</span>
              </div>
          </div>

          {/* User Info & Get Button */}
          <div className="flex items-center justify-between gap-4 mt-auto pt-2">
              <div className="flex items-center gap-3 overflow-hidden pr-2 flex-1 min-w-0">
                <img src={note.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(note.user?.name || 'U')}&background=random&color=fff`} alt={note.user?.name} className="w-9 h-9 rounded-full border border-white/10 shrink-0 object-cover" />
                <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-extrabold truncate text-white/80">{note.user?.name || "Unknown"}</span>
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5 truncate">{formatDate(note.uploadDate)}</span>
                </div>
              </div>

              <Button disabled={isDownloading} onClick={handleDownload} className="h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black uppercase tracking-widest text-[10px] hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300 active:scale-95 px-5 gap-2 shrink-0">
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Download className="h-4 w-4" /> <span>Get</span></>}
              </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Card>
  );
}