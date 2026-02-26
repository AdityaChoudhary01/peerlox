import { getUserStudyPlans } from "@/actions/planner.actions";
import { Clock, ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function StudyCountdown({ userId }) {
  const { plans } = await getUserStudyPlans(userId);
  const nextExam = plans[0]; // Sorted by date in action

  if (!nextExam) return null;

  return (
    <div className="p-5 rounded-[32px] bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Target size={60} className="text-cyan-400" />
      </div>
      
      <div className="relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Next Target</span>
        <h3 className="text-xl font-black text-white mt-1 leading-tight">{nextExam.title}</h3>
        
        <div className="flex items-center gap-2 mt-3 text-gray-400">
          <Clock size={14} className="text-pink-500" />
          <span className="text-sm font-bold">
            {formatDistanceToNow(new Date(nextExam.examDate), { addSuffix: true })}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resources</span>
            <span className="text-white font-black">{nextExam.resources.length} Linked Items</span>
          </div>
          <Link href={`/planner/${nextExam._id}`}>
            <button className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}