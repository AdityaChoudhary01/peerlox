// components/home/PaginatedNotesFeed.js
"use client";

import { useState } from "react";
import NoteCard from "@/components/notes/NoteCard";
import { Button } from "@/components/ui/button";
import { getNotes } from "@/actions/note.actions";
import { Loader2, ChevronDown } from "lucide-react";

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
      {/* BUG FIX: Changed grid-cols-1 to grid-cols-2 for mobile side-by-side */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 justify-items-center">
        {notes.map((note) => (
          <div key={note._id} className="w-full">
            <NoteCard note={note} />
          </div>
        ))}
      </div>

      {page < totalPages && (
        <div className="flex justify-center pt-8">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={loadMore} 
            disabled={loading}
            className="w-full sm:w-auto h-12 rounded-full px-8 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-cyan-500/50 text-white font-black uppercase tracking-widest text-[11px] transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] group"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-2 text-cyan-400 group-hover:translate-y-1 transition-transform" />
            )}
            {loading ? "Fetching Materials..." : "Load More Notes"}
          </Button>
        </div>
      )}
    </div>
  );
}