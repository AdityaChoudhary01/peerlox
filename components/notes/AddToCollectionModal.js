"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Plus, Check, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserCollections, createCollection, addNoteToCollection } from "@/actions/collection.actions";

export default function AddToCollectionModal({ noteId }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch collections when modal opens
  useEffect(() => {
    if (open && session?.user?.id) {
      setLoading(true);
      getUserCollections(session.user.id)
        .then((cols) => setCollections(cols))
        .catch(() => toast({ title: "Error", description: "Failed to load collections", variant: "destructive" }))
        .finally(() => setLoading(false));
    }
  }, [open, session, toast]);

  const handleCreate = async () => {
    if (!newColName.trim()) return;
    setCreating(true);
    const res = await createCollection(newColName, session.user.id);
    if (res.success) {
      setCollections([res.collection, ...collections]);
      setNewColName("");
      toast({ title: "Created", description: "New collection ready." });
    } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setCreating(false);
  };

  const handleAdd = async (collectionId) => {
    const res = await addNoteToCollection(collectionId, noteId, session.user.id);
    if (res.success) {
      toast({ title: "Saved!", description: "Note added to collection." });
      setOpen(false); // Close modal on success
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  if (!session) {
    return (
      <Button variant="outline" size="sm" onClick={() => toast({ title: "Login Required", description: "Please login to save notes." })}>
         <FolderPlus className="w-4 h-4 mr-2" /> Save
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="w-4 h-4 mr-2" /> Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            {/* Create New Input */}
            <div className="flex gap-2 items-center">
                <Input 
                    placeholder="New Collection Name..." 
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="flex-1"
                />
                <Button size="icon" onClick={handleCreate} disabled={creating || !newColName.trim()}>
                    {creating ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {loading ? (
                    <div className="flex justify-center py-4 text-muted-foreground"><Loader2 className="animate-spin" /></div>
                ) : collections.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No collections found. Create one!</p>
                ) : (
                    collections.map((col) => {
                        const isAdded = col.notes.includes(noteId);
                        return (
                            <div 
                                key={col._id} 
                                onClick={() => !isAdded && handleAdd(col._id)}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isAdded ? 'bg-secondary/20 opacity-70' : 'hover:bg-secondary/10'}`}
                            >
                                <span className="font-medium truncate">{col.name}</span>
                                {isAdded ? <Check className="w-4 h-4 text-green-500" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}