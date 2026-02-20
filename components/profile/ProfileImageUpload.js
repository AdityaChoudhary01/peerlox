"use client";

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAvatarUploadUrlAction } from '@/actions/upload.actions'; // ✅ NEW R2 Action
import { optimizeAvatar } from '@/utils/imageOptimizer'; // ✅ NEW Utility we built earlier

export default function ProfileImageUpload({ currentImage, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max size is 5MB", variant: "destructive" });
        return;
    }

    setUploading(true);

    try {
      // 1. Optimize Image (Crop to square, resize to 256px, convert to WebP)
      // This happens on the user's device for ₹0 compute cost.
      const optimizedImage = await optimizeAvatar(file);

      // 2. Get Presigned URL from Cloudflare R2 via Server Action
      const { success, uploadUrl, fileKey, error: urlError } = await getAvatarUploadUrlAction();
      
      if (!success) throw new Error(urlError);

      // 3. Upload directly to Cloudflare R2
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
        body: optimizedImage,
      });

      if (!res.ok) throw new Error("Cloud storage upload failed");

      // 4. Generate the new public URL
      const newAvatarUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileKey}`;

      // 5. Pass BOTH the URL and the Key back to the parent
      // Note: Passing the key is vital so updateUserAvatarAction can delete old R2 files!
      onUploadComplete(newAvatarUrl, fileKey);
      
      toast({ title: "Image Uploaded", description: "Don't forget to save your profile changes." });
    } catch (error) {
      console.error("R2 Upload Error:", error);
      toast({ title: "Upload Failed", description: "Could not upload image to R2. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group cursor-pointer">
        
        {/* Avatar Display */}
        <Avatar className="w-32 h-32 border-4 border-white/10 shadow-2xl transition-all group-hover:border-primary/50">
          <AvatarImage 
            src={currentImage} 
            className="object-cover" 
            referrerPolicy="no-referrer" // ✅ Essential for R2 loading
          />
          <AvatarFallback className="text-4xl bg-secondary font-bold text-muted-foreground">
            ?
          </AvatarFallback>
        </Avatar>
        
        {/* Loading Spinner Overlay */}
        {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-full z-20 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-[10px] text-white font-bold uppercase mt-2">Uploading</span>
            </div>
        )}

        {/* Hover Overlay with File Input */}
        {!uploading && (
            <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white z-10 cursor-pointer backdrop-blur-[2px]"
            >
                <Camera className="w-8 h-8 text-primary" />
                <input 
                    id="avatar-upload"
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden" 
                />
            </label>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-secondary/30 px-3 py-1 rounded-full border border-white/5">
        Click to change
      </p>
    </div>
  );
}