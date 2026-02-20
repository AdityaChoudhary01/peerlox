"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home, Search, ShieldAlert,FileText } from "lucide-react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // ✅ SEO/DevOps: In production, this ensures you track why users are bouncing
    console.error("Critical System Interruption:", error);
  }, [error]);

  const styles = {
    wrapper: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        padding: '2rem', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden',
    },
    container: { 
        background: 'rgba(255, 255, 255, 0.02)', 
        backdropFilter: 'blur(25px)', 
        borderRadius: '40px', 
        border: '1px solid rgba(255, 255, 255, 0.08)', 
        padding: '4rem 2rem', 
        maxWidth: '650px', 
        width: '100%', 
        boxShadow: '0 0 100px rgba(239, 68, 68, 0.1)', 
        position: 'relative', 
        zIndex: 1 
    },
    errorTitle: { 
        fontSize: 'clamp(2rem, 8vw, 4rem)', 
        fontWeight: '950', 
        background: 'linear-gradient(to bottom, #ff4d4d, #991b1b)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent', 
        margin: '0', 
        lineHeight: 1, 
        letterSpacing: '-2px',
    },
    blobRed: { position: 'absolute', top: '20%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1), transparent 70%)', filter: 'blur(80px)', zIndex: 0 },
  };

  return (
    <main style={styles.wrapper} className="isolate">
      {/* Background Cinematic Flare */}
      <div style={styles.blobRed}></div>
      
      <div style={styles.container}>
        {/* Animated Warning Icon */}
        <div className="flex justify-center mb-8">
            <div className="relative">
                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative p-5 bg-red-500/10 rounded-3xl border border-red-500/20 text-red-500">
                    <ShieldAlert size={48} strokeWidth={1.5} />
                </div>
            </div>
        </div>

        <h1 style={styles.errorTitle}>SYSTEM ERROR</h1>
        
        <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-white/90 tracking-tight">
                An unexpected interruption occurred
            </h2>
            <p className="text-white/40 text-sm sm:text-base max-w-sm mx-auto font-medium leading-relaxed">
                The PeerNotez core encountered a runtime exception. This usually happens during high-traffic synchronization.
            </p>
        </div>

        {/* RECOVERY ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Button 
                onClick={() => reset()} 
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-red-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95 gap-2"
            >
                <RefreshCcw className="w-4 h-4" /> Try Recovery
            </Button>
            
            <Link href="/" className="w-full sm:w-auto">
                <Button 
                    variant="outline" 
                    className="w-full h-12 px-8 rounded-full border-white/10 bg-white/[0.03] text-white/60 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all gap-2"
                >
                    <Home className="w-4 h-4" /> Return Home
                </Button>
            </Link>
        </div>

        {/* QUICK NAVIGATION (SEO/UX Safety Net) */}
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-6">
            <Link href="/search" className="text-[10px] font-bold text-white/20 hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest">
                <Search size={12} /> Search Notes
            </Link>
            <Link href="/blogs" className="text-[10px] font-bold text-white/20 hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest">
                <FileText size={12} /> Academic Blog
            </Link>
        </div>
      </div>
    </main>
  );
}