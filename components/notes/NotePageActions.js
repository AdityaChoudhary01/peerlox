"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Share2, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteNote } from "@/actions/note.actions";
import EditNoteModal from "@/components/notes/EditNoteModal"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function NotePageActions({ note, canEdit, userId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: note?.title || "Note", url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Copied!", description: "Link copied to clipboard." });
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      // The deleteNote Server Action now handles R2 file deletion automatically
      const res = await deleteNote(note._id, userId);

      if (res.success) {
        toast({ title: "Deleted", description: "Note and cloud files removed." });
        setShowDeleteAlert(false);
        router.push("/search"); 
        router.refresh();
      } else {
        toast({ 
          title: "Error", 
          description: res.error || "Failed to delete note", 
          variant: "destructive" 
        });
        setIsDeleting(false);
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred.", 
        variant: "destructive" 
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
        >
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>

        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0d0d0d] border-white/10 text-white">
              <DropdownMenuItem onClick={() => setShowEditModal(true)} className="focus:bg-white/5 cursor-pointer">
                <Edit className="w-4 h-4 mr-2 text-blue-400" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteAlert(true)} 
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Edit Modal (R2 Integrated) */}
      {showEditModal && (
        <EditNoteModal note={note} onClose={() => setShowEditModal(false)} />
      )}

      {/* Delete Confirmation (Themed) */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-[#0d0d0d] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-500">Permanently delete?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will erase <span className="font-bold text-white">"{note?.title}"</span> and its associated files from Cloudflare R2. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); 
                handleDelete();
              }} 
              className="bg-red-600 hover:bg-red-500 text-white border-0 shadow-lg shadow-red-600/20"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wiping...</>
              ) : (
                "Yes, Delete Everything"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}