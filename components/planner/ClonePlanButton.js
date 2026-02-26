"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, CheckCircle2 } from "lucide-react";
import { cloneStudyPlan } from "@/actions/planner.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ClonePlanButton({ planId, userId }) {
  const [loading, setLoading] = useState(false);
  const [cloned, setCloned] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleClone = async () => {
    if (!userId) {
      return toast({ title: "Login Required", description: "You must be logged in to clone roadmaps.", variant: "destructive" });
    }

    setLoading(true);
    const res = await cloneStudyPlan(userId, planId);
    
    if (res.success) {
      setCloned(true);
      toast({ title: "Roadmap Cloned!", description: "It is now available in your personal planner." });
      setTimeout(() => router.push("/planner"), 1500); // Redirect them to their planner
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Button 
      onClick={handleClone}
      disabled={loading || cloned}
      className={`h-12 px-8 rounded-full font-black uppercase tracking-widest transition-all ${
        cloned ? "bg-emerald-500 text-black hover:bg-emerald-600" : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
      }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : cloned ? (
        <><CheckCircle2 className="w-5 h-5 mr-2" /> Cloned to Planner</>
      ) : (
        <><Copy className="w-5 h-5 mr-2" /> Clone Roadmap</>
      )}
    </Button>
  );
}