"use client";

import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ShareCollectionButton() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: "Check out this curated study bundle on StuHive!",
      url: window.location.href,
    };

    try {
      // 🚀 Native Share API for Mobile/Modern Browsers
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({ title: "Shared successfully!" });
      } else {
        // 📋 Fallback for desktop: Copy to Clipboard
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast({
          title: "Link Copied!",
          description: "Ready to share with your peers.",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <Button 
      onClick={handleShare}
      aria-label={copied ? "Link Copied" : "Share Archive"}
      className="rounded-full gap-2 font-bold text-sm px-8 h-12 bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95" 
    >
      {copied ? (
        <Check size={18} className="animate-in zoom-in duration-300" />
      ) : (
        <Share2 size={18} className="transition-transform group-hover:scale-110" />
      )}
      <span>{copied ? "Link Copied" : "Share Archive"}</span>
    </Button>
  );
}