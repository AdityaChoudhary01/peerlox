import { Loader2, Sparkles } from "lucide-react";

export default function Loader({ size = "md", text = "Loading awesome content...", className = "" }) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-6 p-10 ${className}`}>
      {/* --- CINEMATIC SPINNER CORE --- */}
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse ${sizeClasses[size]}`} />
        
        {/* Spinning Outer Orbit - Using Tailwind for animation to avoid styled-jsx errors */}
        <div className={`absolute rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]}`} />
        
        {/* The Main Spinner */}
        <Loader2 
          className={`text-primary animate-spin opacity-80 ${sizeClasses[size]}`} 
          strokeWidth={1.5}
        />
        
        {/* Center Core Sparkle */}
        <Sparkles className="absolute w-1/3 h-1/3 text-cyan-400 animate-pulse" />
      </div>

      {/* --- SYSTEM TEXT --- */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          {text}
        </p>
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
}