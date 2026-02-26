"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Plus, Calendar as CalIcon, BookOpen, ExternalLink, Clock, Globe, Lock, Share2, Trash2 } from "lucide-react";
import { createStudyEvent, togglePlanVisibility, deleteStudyPlan, removeResourceFromPlan } from "@/actions/planner.actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function PlannerClient({ initialPlans, userId }) {
  const [plans, setPlans] = useState(initialPlans);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", examDate: "", category: "Exam" });
  const [loadingId, setLoadingId] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createStudyEvent(userId, formData);
    if (res.success) {
      setPlans([res.event, ...plans].sort((a, b) => new Date(a.examDate) - new Date(b.examDate)));
      setShowModal(false);
      setFormData({ title: "", examDate: "", category: "Exam" });
      toast({ title: "Study Goal Set!", description: "Now start pinning resources to this exam." });
    }
  };

  const handleTogglePublish = async (plan) => {
    setLoadingId(plan._id);
    const newStatus = !plan.isPublic;
    const res = await togglePlanVisibility(userId, plan._id, newStatus);
    
    if (res.success) {
      setPlans(plans.map(p => p._id === plan._id ? { ...p, isPublic: newStatus, slug: res.slug || p.slug } : p));
      toast({ title: newStatus ? "Roadmap Published!" : "Roadmap is now Private." });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setLoadingId(null);
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Are you sure you want to permanently delete this study plan?")) return;
    setLoadingId(planId);
    const res = await deleteStudyPlan(userId, planId);
    
    if (res.success) {
      setPlans(plans.filter(p => p._id !== planId));
      toast({ title: "Study Plan Deleted" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setLoadingId(null);
  };

  const handleRemoveResource = async (planId, resourceId) => {
    const res = await removeResourceFromPlan(userId, planId, resourceId);
    if (res.success) {
      setPlans(plans.map(p => {
        if (p._id === planId) {
          return { ...p, resources: p.resources.filter(r => r.resourceId !== resourceId) };
        }
        return p;
      }));
      toast({ title: "Resource removed from plan." });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  // 🚀 NATIVE SHARE API LOGIC
  const handleShare = async (plan) => {
    const url = `${window.location.origin}/roadmaps/${plan.slug}`;
    const shareData = {
      title: `Study Roadmap: ${plan.title}`,
      text: `Check out this study roadmap I'm using for my exams!`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // If the user cancelled the share menu, don't show an error.
        if (err.name !== "AbortError") {
           fallbackCopy(url);
        }
      }
    } else {
      // Fallback for Desktop browsers that don't support native share yet
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (url) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "Share your roadmap with friends." });
  };

  return (
    <div className="space-y-10">
      
      <div className="flex justify-end">
        <Link href="/roadmaps">
          <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-full">
            <Globe className="w-4 h-4 mr-2" /> Browse Community Roadmaps
          </Button>
        </Link>
      </div>

      <button 
        onClick={() => setShowModal(true)}
        className="group relative w-full py-8 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-500"
      >
        <div className="p-4 rounded-full bg-white/5 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500">
          <Plus size={24} />
        </div>
        <span className="mt-4 font-bold text-gray-400 group-hover:text-white transition-colors">Add New Exam or Deadline</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col h-full relative overflow-hidden group">
            
            {/* Publish / Share Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              
              {/* 🚀 UPDATED SHARE BUTTON */}
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all" 
                onClick={() => handleShare(plan)} 
                title={plan.isPublic ? "Share Roadmap" : "Publish to share"}
                disabled={!plan.isPublic || !plan.slug} // Disabled if private
              >
                <Share2 className="w-3.5 h-3.5" />
              </Button>

              <Button 
                variant="secondary" 
                className={`h-8 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 transition-colors ${plan.isPublic ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" : "bg-black text-gray-400 hover:bg-white/10"}`}
                onClick={() => handleTogglePublish(plan)}
                disabled={loadingId === plan._id}
              >
                {plan.isPublic ? <Globe className="w-3 h-3 mr-1.5" /> : <Lock className="w-3 h-3 mr-1.5" />}
                {plan.isPublic ? "Public" : "Private"}
              </Button>
            </div>

            <div className="flex items-start mb-4 pr-24">
              <div className="flex items-center gap-2 text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                <Clock size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {formatDistanceToNow(new Date(plan.examDate), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-black text-white">{plan.title}</h2>
              <button 
                onClick={() => handleDeletePlan(plan._id)}
                disabled={loadingId === plan._id}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Delete Plan"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <p className="text-gray-500 text-sm font-bold flex items-center gap-2 mb-6">
              <CalIcon size={14} /> {format(new Date(plan.examDate), "PPP")}
            </p>

            <div className="flex-1 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5 pb-2">Linked Study Pack</h4>
              {plan.resources.length === 0 ? (
                <p className="text-xs text-gray-600 italic py-4">No resources linked yet.</p>
              ) : (
                plan.resources.map((res, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/res">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-black text-gray-400 group-hover/res:text-cyan-400 transition-colors">
                        <BookOpen size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-300">View {res.resourceType}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={res.resourceType === 'Note' ? `/notes/${res.resourceId}` : `/blogs/${res.resourceId}`}>
                          <ExternalLink size={14} className="text-gray-600 hover:text-white transition-colors" />
                      </Link>
                      <button 
                        onClick={() => handleRemoveResource(plan._id, res.resourceId)}
                        className="text-gray-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover/res:opacity-100"
                        title="Remove from plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-white mb-6">Set Study Goal</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Exam Title</label>
                <input required type="text" placeholder="e.g. Finals: Advanced Calculus" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-colors" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Exam Date</label>
                <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-colors invert-calendar-icon" value={formData.examDate} onChange={(e) => setFormData({...formData, examDate: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" className="flex-1 rounded-2xl" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-black font-black">Set Goal</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}