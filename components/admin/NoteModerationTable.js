"use client";

import { useState } from "react";
import { toggleNoteFeatured, adminDeleteNote, getAllNotes } from "@/actions/admin.actions"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; 
import { Star, Trash2, ExternalLink, FileText, Loader2, ShieldAlert, BookOpen, Search, ChevronDown } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NoteModerationTable({ initialNotes }) {
  const [notes, setNotes] = useState(initialNotes);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loadingId, setLoadingId] = useState(null);

  // 🚀 REAL PAGINATION STATE
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialNotes.length === 20); 

  const { toast } = useToast();

  const handleToggleFeatured = async (noteId, currentState) => {
    setLoadingId(noteId);
    const res = await toggleNoteFeatured(noteId, currentState);
    if (res.success) {
      setNotes(notes.map(n => n._id === noteId ? { ...n, isFeatured: !currentState } : n));
      toast({ title: !currentState ? "Note Featured!" : "Feature Removed" });
    } else {
      toast({ title: "Error", description: res.error || "Failed to update", variant: "destructive" });
    }
    setLoadingId(null);
  };

  const handleDelete = async (noteId) => {
    if (!confirm("Permanently delete this note?")) return;
    setLoadingId(noteId);
    const res = await adminDeleteNote(noteId);
    if (res.success) {
      setNotes(notes.filter(n => n._id !== noteId));
      toast({ title: "Note & Data Deleted", variant: "destructive" });
    } else {
      toast({ title: "Error", description: res.error || "Failed to delete", variant: "destructive" });
    }
    setLoadingId(null);
  };

  // 🚀 REAL DB FETCH FOR LOAD MORE
  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await getAllNotes(nextPage, 20);
    
    if (res?.notes?.length > 0) {
      setNotes((prev) => [...prev, ...res.notes]);
      setPage(nextPage);
      if (res.notes.length < 20) setHasMore(false); // No more pages left
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  // INSTANT SEARCH ENGINE
  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.university?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border border-white/10 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-xl">
      
      {/* 🚀 SEARCH & UTILITY BAR */}
      <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.01]">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search loaded notes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-black/40 border-white/10 text-sm focus-visible:ring-cyan-500 text-white placeholder:text-gray-600 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1.5 h-auto text-xs font-bold uppercase tracking-widest">
            {filteredNotes.length} Loaded
          </Badge>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead className="bg-white/[0.02] text-white/40 uppercase text-[10px] font-black tracking-[0.2em] border-b border-white/5">
            <tr>
              <th className="px-8 py-5">Document Vault</th>
              <th className="px-6 py-5">Uploader</th>
              <th className="px-6 py-5 hidden sm:table-cell text-center">Institution Info</th>
              <th className="px-8 py-5 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredNotes.map((note) => {
              // ✅ R2 THUMBNAIL LOGIC
              const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
              const thumbnailUrl = note.thumbnailKey ? `${r2Base}/${note.thumbnailKey}` : null;

              return (
                <tr key={note._id} className="hover:bg-white/[0.03] transition-all group">
                  
                  {/* 1. Document Preview & Title */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                        {thumbnailUrl ? (
                          <img 
                            src={thumbnailUrl} 
                            alt={note.title} 
                            referrerPolicy="no-referrer"
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <FileText className="w-6 h-6 text-white/20" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white text-base truncate max-w-[200px] lg:max-w-[250px]" title={note.title}>
                          {note.title}
                        </span>
                        <div className="flex gap-2 items-center mt-1.5">
                          {note.isFeatured && (
                            <Badge className="h-4 text-[9px] bg-cyan-500 hover:bg-cyan-400 text-black px-2 font-black uppercase tracking-tighter border-0">
                              Featured
                            </Badge>
                          )}
                          <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                            {note.fileType?.split('/')[1] || "PDF"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Author Column */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-white/10 shadow-lg">
                        <AvatarImage src={note.user?.avatar} referrerPolicy="no-referrer" />
                        <AvatarFallback className="text-[10px] bg-secondary font-bold text-cyan-400">
                          {note.user?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                          <span className="text-sm font-bold text-white/90 group-hover:text-cyan-400 transition-colors">{note.user?.name || "Unknown"}</span>
                          <span className="text-[9px] text-white/40 uppercase font-black tracking-widest mt-0.5">Student</span>
                      </div>
                    </div>
                  </td>

                  {/* 3. Institution Details (Center) */}
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xs font-bold text-white/80 truncate max-w-[150px] group-hover:text-white transition-colors" title={note.university}>
                        {note.university || "Global"}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-tighter">
                          {note.subject} {note.year ? `• YR ${note.year}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 4. Action Buttons */}
                  <td className="px-8 py-5 text-right space-x-2 whitespace-nowrap">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title={note.isFeatured ? "Remove Feature" : "Feature Note"}
                      className={`h-9 w-9 rounded-xl transition-all ${note.isFeatured ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]" : "text-white/30 hover:text-cyan-400 hover:bg-white/5"}`}
                      onClick={() => handleToggleFeatured(note._id, note.isFeatured)}
                      disabled={loadingId === note._id}
                    >
                      <Star className={`w-4 h-4 ${note.isFeatured ? "fill-current" : ""}`} />
                    </Button>
                    
                    {/* 🚀 FIXED: Now uses SEO Slug! */}
                    <Link href={`/notes/${note.slug || note._id}`} target="_blank" title="View Public Note">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all">
                          <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Delete Note"
                      className="h-9 w-9 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      onClick={() => handleDelete(note._id)}
                      disabled={loadingId === note._id}
                    >
                      {loadingId === note._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🚀 TRUE BACKEND LOAD MORE BUTTON */}
      {hasMore && !searchTerm && (
        <div className="p-4 flex justify-center border-t border-white/5 bg-white/[0.01]">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-full border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px] h-10 px-6 transition-all"
          >
             {loadingMore ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Loading...</>
            ) : (
                <>Load More Notes <ChevronDown className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      )}

      {filteredNotes.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-white/20 bg-black/20">
            <ShieldAlert size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-[0.2em] text-sm text-white/40">
              {searchTerm ? "No notes match your search" : "Vault is currently empty"}
            </p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-cyan-400">
                Clear Search
              </Button>
            )}
        </div>
      )}
    </div>
  );
}