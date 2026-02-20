"use client";

import { useState } from "react";
import { toggleNoteFeatured, adminDeleteNote } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, ExternalLink, FileText, Loader2, ShieldAlert, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NoteModerationTable({ initialNotes }) {
  const [notes, setNotes] = useState(initialNotes);
  const [loadingId, setLoadingId] = useState(null);
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

  return (
    <div className="border rounded-3xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-black tracking-[0.2em] border-b border-white/5">
            <tr>
              <th className="px-8 py-5">Document Vault</th>
              <th className="px-6 py-5">Uploader</th>
              <th className="px-6 py-5 hidden sm:table-cell text-center">Institution Info</th>
              <th className="px-8 py-5 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {notes.map((note) => {
              // ✅ R2 THUMBNAIL LOGIC
              const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
              const thumbnailUrl = note.thumbnailKey ? `${r2Base}/${note.thumbnailKey}` : null;

              return (
                <tr key={note._id} className="hover:bg-white/[0.02] transition-all group">
                  
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
                        <span className="font-bold text-white text-base truncate max-w-[200px]" title={note.title}>
                          {note.title}
                        </span>
                        <div className="flex gap-2 items-center mt-1">
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
                      <Avatar className="h-8 w-8 border border-white/10 shadow-lg">
                        <AvatarImage src={note.user?.avatar} referrerPolicy="no-referrer" />
                        <AvatarFallback className="text-[10px] bg-secondary font-bold">
                          {note.user?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/80">{note.user?.name || "Unknown"}</span>
                          <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Student</span>
                      </div>
                    </div>
                  </td>

                  {/* 3. Institution Details (Center) */}
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xs font-bold text-white/60 truncate max-w-[150px]">
                        {note.university}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] text-white/30 uppercase font-black tracking-tighter">
                          {note.subject} • YR {note.year}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 4. Action Buttons */}
                  <td className="px-8 py-5 text-right space-x-3 whitespace-nowrap">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-9 w-9 rounded-xl transition-all ${note.isFeatured ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20" : "text-white/20 hover:text-white hover:bg-white/5"}`}
                      onClick={() => handleToggleFeatured(note._id, note.isFeatured)}
                      disabled={loadingId === note._id}
                    >
                      <Star className={`w-4 h-4 ${note.isFeatured ? "fill-current" : ""}`} />
                    </Button>
                    
                    <Link href={`/notes/${note._id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white/20 hover:text-white hover:bg-white/5">
                          <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
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

      {notes.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-white/20">
            <ShieldAlert size={48} className="mb-4 opacity-10" />
            <p className="font-bold uppercase tracking-[0.4em] text-[10px]">Vault is currently empty</p>
        </div>
      )}
    </div>
  );
}