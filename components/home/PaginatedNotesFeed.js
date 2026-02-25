"use client";

import { useState } from "react";
import NoteCard from "@/components/notes/NoteCard";
import { Button } from "@/components/ui/button";
import { getNotes } from "@/actions/note.actions";
import { Loader2, ChevronDown, Compass } from "lucide-react";
import Link from "next/link";

export default function PaginatedNotesFeed({ initialNotes, initialTotalPages }) {
  const [notes, setNotes] = useState(initialNotes);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const loadMore = async () => {
    if (page >= totalPages) return;
    setLoading(true);
    
    try {
      const nextPage = page + 1;
      const res = await getNotes({ page: nextPage, limit: 12 });
      
      setNotes((prev) => [...prev, ...res.notes]);
      setPage(res.currentPage);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Error loading more notes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* 🚀 SEO: ItemList Schema directly injected via Microdata for dynamic client content */}
      <div 
        className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 justify-items-center" 
        aria-live="polite" 
        aria-busy={loading}
        itemScope 
        itemType="https://schema.org/ItemList"
      >
        {notes.map((note, index) => (
          <div 
            key={note._id} 
            className="w-full"
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            {/* 🚀 SEO: Tracks the position of the dynamic element in the grid */}
            <meta itemProp="position" content={index + 1} />
            <div itemProp="item" itemScope itemType="https://schema.org/LearningResource">
              <NoteCard note={note} priority={index < 6 && page === 1} />
            </div>
          </div>
        ))}
      </div>

      {page < totalPages && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8 relative">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={loadMore} 
            disabled={loading}
            aria-label={loading ? "Loading more notes..." : "Load more notes"}
            className="w-full sm:w-auto h-12 rounded-full px-8 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-cyan-500/50 text-white font-black uppercase tracking-widest text-[11px] transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] group"
          >
            {loading ? (
              <Loader2 aria-hidden="true" className="w-4 h-4 mr-2 animate-spin text-cyan-400" />
            ) : (
              <ChevronDown aria-hidden="true" className="w-4 h-4 mr-2 text-cyan-400 group-hover:translate-y-1 transition-transform" />
            )}
            {loading ? "Fetching Materials..." : "Load More Notes"}
          </Button>

          {/* 🚀 SEO BOT TRAP: Hidden from users, but ensures Googlebot can index older content */}
          <noscript>
            <Link 
              href={`/search?page=${page + 1}`} 
              title="Next page of notes"
              className="text-[10px] text-cyan-400 underline"
            >
              Browse page {page + 1} of academic notes
            </Link>
          </noscript>
        </div>
      )}

      {/* 🚀 SEO DEEP LINK: Keep crawlers moving once they reach the end of the feed */}
      {page >= totalPages && totalPages > 0 && (
        <div className="flex justify-center pt-8 animate-in fade-in duration-700">
           <Link 
             href="/search" 
             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-cyan-400 transition-colors bg-white/5 px-6 py-2.5 rounded-full hover:bg-white/10"
           >
              <Compass size={14} aria-hidden="true" /> Discover the full archive
           </Link>
        </div>
      )}
    </div>
  );
}