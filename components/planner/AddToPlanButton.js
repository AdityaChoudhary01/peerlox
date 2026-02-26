"use client";

import { useState, useRef, useEffect } from "react"; // 🚀 Added useRef and useEffect
import { CalendarPlus, Loader2, CheckCircle2 } from "lucide-react";
import { addResourceToPlan, getUserStudyPlans } from "@/actions/planner.actions";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

export default function AddToPlanButton({ resourceId, resourceType }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const menuRef = useRef(null); // 🚀 1. Create a reference for the dropdown

  // 🚀 2. Add the global click listener to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the menu is open, and the click happened outside of our referenced div, close it!
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Only attach the listener if the menu is actually open (saves performance)
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside); // Catches mobile taps
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const loadPlans = async () => {
    // If it's already open, clicking the button again should close it
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (!session) return toast({ title: "Please login first" });
    setLoading(true);
    setIsOpen(true); // Open immediately to show the loading spinner
    const res = await getUserStudyPlans(session.user.id);
    setPlans(res.plans);
    setLoading(false);
  };

  const handleAdd = async (planId) => {
    const res = await addResourceToPlan(session.user.id, planId, {
      id: resourceId,
      type: resourceType
    });
    if (res.success) {
      toast({ title: "Resource added to your study plan!" });
      setIsOpen(false);
    } else {
      toast({ title: res.error, variant: "destructive" });
    }
  };

  return (
    // 🚀 3. Attach the ref to the outermost wrapper
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => {
          e.preventDefault(); // Stop event bubbling
          e.stopPropagation();
          loadPlans();
        }}
        className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all text-gray-400"
        title="Add to Study Plan"
      >
        <CalendarPlus size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#0a0118] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-in slide-in-from-bottom-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 px-1">Choose Exam</p>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto my-2 text-cyan-400" />
          ) : plans.length === 0 ? (
            <div className="text-[11px] text-gray-400 p-2 text-center">
              No active exams. Create one in your profile!
            </div>
          ) : (
            plans.map(plan => (
              <button
                key={plan._id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd(plan._id);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-white/5 text-xs text-white font-medium flex items-center justify-between group"
              >
                {plan.title}
                <CheckCircle2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-cyan-400" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}