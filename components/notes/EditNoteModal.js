"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; 
import { updateNote } from "@/actions/note.actions"; 
import { getUploadUrl } from "@/actions/upload.actions"; 
import { generatePdfThumbnail } from "@/utils/generateThumbnail"; 
import { Loader2, Save, UploadCloud, FileText, School, GraduationCap, BookOpen, CalendarDays } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; 

export default function EditNoteModal({ note, onClose }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  
  // --- Form State ---
  const [newFile, setNewFile] = useState(null); 
  const [formData, setFormData] = useState({
    title: note?.title || "",
    description: note?.description || "",
    university: note?.university || "",
    course: note?.course || "",
    subject: note?.subject || "",
    year: note?.year || ""
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        toast({ title: "File too large", description: "Limit is 15MB", variant: "destructive" });
        return;
      }
      setNewFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        let fileData = null;

        // --- 1. HANDLE NEW FILE UPLOAD IF SELECTED ---
        if (newFile) {
            setUploadStatus("Processing file...");
            let thumbnailFile = null;
            if (newFile.type === "application/pdf") {
                thumbnailFile = await generatePdfThumbnail(newFile);
            }

            setUploadStatus("Uploading to R2...");
            const { success, uploadUrl, fileKey, thumbUrl, thumbKey, error: urlError } = 
                await getUploadUrl(newFile.name, newFile.type, !!thumbnailFile);
            
            if (!success) throw new Error(urlError);

            // Upload Main File
            await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": newFile.type }, body: newFile });

            // Upload Thumbnail (if exists)
            if (thumbnailFile && thumbUrl) {
                await fetch(thumbUrl, { method: "PUT", headers: { "Content-Type": "image/webp" }, body: thumbnailFile });
            }

            fileData = {
                fileName: newFile.name,
                fileType: newFile.type,
                fileSize: newFile.size,
                fileKey: fileKey,
                thumbnailKey: thumbKey || null,
            };
        }

        // --- 2. UPDATE DATABASE ---
        setUploadStatus("Saving changes...");
        const dataToSubmit = {
            ...formData,
            year: Number(formData.year),
            ...(fileData && { fileData }) // Only include fileData if a new file was uploaded
        };

        const res = await updateNote(note._id, dataToSubmit, session?.user?.id);
        
        if (res.success) {
            toast({ title: "Note Updated", description: "Changes saved successfully." });
            onClose(); 
            router.refresh(); 
        } else {
            toast({ title: "Update Failed", description: res.error, variant: "destructive" });
        }
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Something went wrong during upload.", variant: "destructive" });
    } finally {
        setLoading(false);
        setUploadStatus("");
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar rounded-2xl md:rounded-[2rem]">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Edit Material
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Update your note details or replace the attached document.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Metadata Fields */}
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-foreground/90">Note Title</Label>
                    <Input className="h-11 rounded-xl bg-secondary/30 border-secondary focus-visible:ring-blue-500/30 transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-foreground/90">Description</Label>
                    <Textarea className="min-h-[100px] rounded-xl bg-secondary/30 border-secondary focus-visible:ring-blue-500/30 transition-all resize-y" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90"><School className="w-3.5 h-3.5 text-blue-400"/> University</Label>
                  <Input className="h-11 rounded-xl bg-secondary/30 border-secondary focus-visible:ring-blue-500/30 transition-all" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90"><GraduationCap className="w-3.5 h-3.5 text-purple-400"/> Course</Label>
                  <Input className="h-11 rounded-xl bg-secondary/30 border-secondary focus-visible:ring-purple-500/30 transition-all" value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90"><BookOpen className="w-3.5 h-3.5 text-pink-400"/> Subject</Label>
                  <Input className="h-11 rounded-xl bg-secondary/30 border-secondary focus-visible:ring-pink-500/30 transition-all" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90"><CalendarDays className="w-3.5 h-3.5 text-orange-400"/> Year</Label>
                  <Input className="h-11 rounded-xl bg-secondary/30 border-secondary focus-visible:ring-orange-500/30 transition-all" type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required />
                </div>
            </div>

            {/* --- FILE REPLACEMENT SECTION --- */}
            <div className="pt-4 border-t border-border">
                <Label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-3 block">
                  Replace Document (Optional)
                </Label>
                <div className="relative group border-2 border-dashed border-border rounded-2xl p-6 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 bg-secondary/20 text-center cursor-pointer overflow-hidden">
                    <input type="file" accept=".pdf,.docx,.pptx,.xlsx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {newFile ? (
                        <div className="flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                            <div className="p-2 bg-emerald-500/20 rounded-full">
                                <FileText className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-emerald-500 text-sm font-bold truncate max-w-[250px]">{newFile.name}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 transform transition-transform group-hover:-translate-y-1">
                            <div className="p-3 bg-secondary/50 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                                <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-foreground/80">Tap to upload a new version</span>
                        </div>
                    )}
                </div>
                {!newFile && <p className="text-[11px] text-muted-foreground mt-2 text-center">Leave this empty to keep the currently attached file.</p>}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-11">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl h-11 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg shadow-blue-500/25 transition-all">
                    {loading ? (
                        <><Loader2 className="animate-spin mr-2 w-4 h-4" /> {uploadStatus}</>
                    ) : (
                        <><Save className="mr-2 w-4 h-4" /> Save Changes</>
                    )}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}