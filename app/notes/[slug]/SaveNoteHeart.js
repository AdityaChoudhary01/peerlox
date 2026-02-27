"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { toggleSaveNote } from "@/actions/user.actions";

export default function SaveNoteHeart({ noteId }) {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  
  const [isSaved, setIsSaved] = useState(false);

  // Sync state with session
  useEffect(() => {
    // 🚀 FIX: Wrapped in setTimeout to make the state update asynchronous, avoiding the cascading render warning
    const timer = setTimeout(() => {
      if (session?.user?.savedNotes) {
        setIsSaved(session.user.savedNotes.includes(noteId));
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [session, noteId]);

  const handleSave = async () => {
    if (!session) {
      return toast({ title: "Login required", description: "Please sign in to save notes.", variant: "destructive" });
    }
    
    // Optimistic UI update
    const previousState = isSaved;
    setIsSaved(!isSaved);
    
    const res = await toggleSaveNote(session.user.id, noteId);
    
    if (res.success) {
      toast({ title: res.isSaved ? "Saved to Collection" : "Removed from Collection" });
      
      const currentSavedNotes = session.user.savedNotes || [];
      const updatedSavedNotes = res.isSaved 
          ? [...currentSavedNotes, noteId]
          : currentSavedNotes.filter(id => id !== noteId);
          
      await updateSession({
          ...session,
          user: { ...session.user, savedNotes: updatedSavedNotes }
      });
    } else {
      setIsSaved(previousState); 
      toast({ title: "Error", description: "Failed to update saved notes.", variant: "destructive" });
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleSave}
      className={`rounded-full transition-colors ${isSaved ? "border-red-500 bg-red-500/10" : ""}`}
      title={isSaved ? "Remove from Saved" : "Save Note"}
    >
      <Heart className={`h-5 w-5 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
    </Button>
  );
}