import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container min-h-[80vh] flex flex-col items-center justify-center pt-24">
      <Loader2 className="h-14 w-14 animate-spin text-pink-500 mb-6 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]" />
      <h2 className="text-xl font-black text-foreground tracking-[0.2em] uppercase animate-pulse">
        Loading Articles...
      </h2>
      <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent mt-4 rounded-full" />
    </div>
  );
}