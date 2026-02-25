"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus, Plus, Check, Loader2, Globe, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserCollections, createCollection, addNoteToCollection, updateCollection } from "@/actions/collection.actions";

export default function AddToCollectionModal({ noteId }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New Collection Form State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColVisibility, setNewColVisibility] = useState("private");
  const [creating, setCreating] = useState(false);

  // Fetch collections when modal opens
  useEffect(() => {
    if (open && session?.user?.id) {
      const timer = setTimeout(() => {
        setLoading(true);
        getUserCollections(session.user.id)
          .then((cols) => setCollections(cols))
          .catch(() => toast({ title: "Error", description: "Failed to load collections", variant: "destructive" }))
          .finally(() => setLoading(false));
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [open, session, toast]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setCreating(true);
    
    // 1. Create base collection
    const res = await createCollection(newColName, session.user.id);
    
    if (res.success) {
      // 2. Immediately update it with Description & Visibility if they changed the defaults
      let finalCollection = res.collection;
      if (newColDesc.trim() || newColVisibility === 'public') {
         const updateRes = await updateCollection(
            res.collection._id, 
            { description: newColDesc, visibility: newColVisibility }, 
            session.user.id
         );
         if (updateRes.success) finalCollection = updateRes.collection;
      }

      setCollections([finalCollection, ...collections]);
      
      // Auto-add the current note to this newly created collection
      if (noteId) {
         await addNoteToCollection(finalCollection._id, noteId, session.user.id);
      }
      
      // Reset State
      setNewColName("");
      setNewColDesc("");
      setNewColVisibility("private");
      setIsCreatingNew(false);
      setOpen(false);
      
      toast({ title: "Success", description: "Collection created and note added!" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setCreating(false);
  };

  const handleAdd = async (collectionId) => {
    const res = await addNoteToCollection(collectionId, noteId, session.user.id);
    if (res.success) {
      toast({ title: "Saved!", description: "Note added to collection." });
      setOpen(false); 
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
        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
          <FolderPlus className="w-4 h-4 mr-2 text-cyan-400" /> Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0c0c10] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Save to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
            {!isCreatingNew ? (
                <>
                    <Button 
                        variant="outline" 
                        className="w-full border-dashed border-white/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                        onClick={() => setIsCreatingNew(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create New Archive
                    </Button>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-8 text-cyan-400"><Loader2 className="animate-spin" /></div>
                        ) : collections.length === 0 ? (
                            <p className="text-center text-sm text-gray-500 py-8">No collections found. Create your first one!</p>
                        ) : (
                            collections.map((col) => {
                                const isAdded = col.notes.includes(noteId);
                                return (
                                    <div 
                                        key={col._id} 
                                        onClick={() => !isAdded && handleAdd(col._id)}
                                        className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all duration-300 ${isAdded ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' : 'bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-cyan-500/30'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-white/90">{col.name}</span>
                                                {col.visibility === 'public' ? <Globe className="w-3 h-3 text-cyan-400" /> : <Lock className="w-3 h-3 text-gray-500" />}
                                            </div>
                                            {isAdded ? <Check className="w-4 h-4 text-green-500" /> : <Plus className="w-4 h-4 text-gray-400" />}
                                        </div>
                                        {col.description && (
                                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{col.description}</p>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </>
            ) : (
                <form onSubmit={handleCreate} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Archive Name</label>
                        <Input 
                            placeholder="e.g. Exam Prep 2026..." 
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            className="bg-black/40 border-white/10 focus-visible:ring-cyan-500"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description (Optional)</label>
                        <Textarea 
                            placeholder="What is this bundle about?" 
                            value={newColDesc}
                            onChange={(e) => setNewColDesc(e.target.value)}
                            className="bg-black/40 border-white/10 focus-visible:ring-cyan-500 resize-none min-h-[80px] text-sm"
                            maxLength={200}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visibility</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button 
                                type="button" 
                                variant={newColVisibility === 'private' ? 'default' : 'outline'}
                                className={newColVisibility === 'private' ? 'bg-white text-black font-bold' : 'border-white/10 text-gray-400 hover:text-white'}
                                onClick={() => setNewColVisibility('private')}
                            >
                                <Lock className="w-4 h-4 mr-2" /> Private
                            </Button>
                            <Button 
                                type="button" 
                                variant={newColVisibility === 'public' ? 'default' : 'outline'}
                                className={newColVisibility === 'public' ? 'bg-cyan-500 text-black font-bold hover:bg-cyan-400' : 'border-white/10 text-gray-400 hover:text-white'}
                                onClick={() => setNewColVisibility('public')}
                            >
                                <Globe className="w-4 h-4 mr-2" /> Public
                            </Button>
                        </div>
                        {newColVisibility === 'public' && (
                            <p className="text-[10px] text-cyan-400 mt-1 italic">Public collections are indexed by Google and can be shared.</p>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="button" variant="ghost" className="flex-1 text-gray-400 hover:text-white" onClick={() => setIsCreatingNew(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1 bg-cyan-500 text-black font-bold hover:bg-cyan-400" disabled={creating || !newColName.trim()}>
                            {creating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />} Create & Add
                        </Button>
                    </div>
                </form>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}