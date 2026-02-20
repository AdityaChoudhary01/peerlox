"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateCollection } from "@/actions/collection.actions";

export default function EditCollectionModal({ collection }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(collection.name);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const res = await updateCollection(collection._id, name, session.user.id);
    
    if (res.success) {
      toast({ title: "Updated", description: "Collection renamed successfully." });
      setOpen(false);
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Collection Name</Label>
                <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. My Favorite Notes"
                />
            </div>
            
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading || !name.trim()}>
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}