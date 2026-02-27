"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { incrementDownloadCount } from "@/actions/note.actions";
import { useToast } from "@/hooks/use-toast";

export default function DownloadButton({ signedUrl, fileName, noteId }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    try {
      // 1. Trigger the download
      // Since our R2 Signed URL already contains the 'Content-Disposition' header 
      // with the filename, the browser will automatically handle the naming.
      const link = document.createElement("a");
      link.href = signedUrl;
      
      // We keep these as a fallback, but the R2 header does the heavy lifting
      link.setAttribute("download", fileName || "document");
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Increment count in Database (Fire and forget)
      incrementDownloadCount(noteId).catch(err => 
        console.error("Failed to increment stats:", err)
      );

      toast({
        title: "Starting Download",
        description: `Downloading ${fileName}...`,
      });
      
    } catch (error) {
      console.error("Download execution failed:", error);
      toast({
        title: "Download Error",
        description: "Could not initiate download. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Small delay to prevent double-clicking while the browser starts the stream
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <Button 
      size="lg" 
      onClick={handleDownload} 
      disabled={isDownloading}
      className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 border-0 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20 px-8 h-10 rounded-xl transition-all active:scale-95"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Preparing...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download Note
        </>
      )}
    </Button>
  );
}