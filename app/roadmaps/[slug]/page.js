import { getStudyPlanBySlug } from "@/actions/planner.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, BookOpen, Share2, Layers } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import ClonePlanButton from "@/components/planner/ClonePlanButton";

// 🚀 NEW IMPORTS FOR FETCHING TITLES & SLUGS
import connectDB from "@/lib/db";
import Blog from "@/lib/models/Blog";
import Note from "@/lib/models/Note";

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { plan } = await getStudyPlanBySlug(slug);
  
  if (!plan) return { title: "Roadmap Not Found | StuHive" };
  
  return {
    title: `${plan.title} | Community Roadmaps`,
    description: `A study roadmap created by ${plan.user?.name || 'a student'}. Clone this exact path to ace your exams.`,
  };
}

export default async function RoadmapPage({ params }) {
  // In Next.js 14+, params is a promise that must be awaited
  const { slug } = await params;
  
  const session = await getServerSession(authOptions);
  const { plan } = await getStudyPlanBySlug(slug);

  // If the plan doesn't exist or isn't public, throw a 404 page
  if (!plan) notFound();

  await connectDB();

  // 🚀 FIX: ENRICH RESOURCES WITH REAL TITLES AND BLOG SLUGS
  const enrichedResources = await Promise.all(
    plan.resources.map(async (res) => {
      let displayTitle = "Unknown Resource";
      let resourceLink = "#";

      try {
        if (res.resourceType === 'Note') {
          const note = await Note.findById(res.resourceId).select('title').lean();
          if (note) {
            displayTitle = note.title;
            resourceLink = `/notes/${res.resourceId}`;
          }
        } else if (res.resourceType === 'Blog') {
          const blog = await Blog.findById(res.resourceId).select('title slug').lean();
          if (blog) {
            displayTitle = blog.title;
            resourceLink = `/blogs/${blog.slug}`; // 🚀 FIXED: Now uses the actual slug!
          }
        }
      } catch (error) {
        console.error("Error fetching resource:", error);
      }

      return { ...res, displayTitle, resourceLink };
    })
  );

  return (
    <main className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Background Glow */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-full h-[400px] bg-cyan-500/10 blur-[120px] pointer-events-none" />

        {/* 🚀 HEADER SECTION */}
        <div className="relative z-10 text-center mb-16">
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 mb-6 uppercase tracking-[0.2em] px-4 py-1">
            Community Roadmap
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
            {plan.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <User size={14} className="text-purple-400" />
              <span className="text-sm font-bold text-gray-300">By {plan.user?.name || "Anonymous"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <Calendar size={14} className="text-cyan-400" />
              <span className="text-sm font-bold text-gray-300">
                {plan.examDate ? format(new Date(plan.examDate), "MMMM dd, yyyy") : "No Date Set"}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400">
              <Share2 size={14} />
              <span className="text-sm font-black">{plan.clones || 0} Clones</span>
            </div>
          </div>

          <div className="mt-10">
            {/* The Clone Button checks for session internally or prompts login */}
            <ClonePlanButton planId={plan._id.toString()} userId={session?.user?.id} />
          </div>
        </div>

        {/* 🚀 TIMELINE SECTION */}
        <div className="relative max-w-2xl mx-auto mt-12">
          {/* Vertical Line Container */}
          {enrichedResources.length > 0 && (
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500/50 to-transparent" />
          )}

          <div className="space-y-12 relative z-10">
            {enrichedResources.length === 0 ? (
              <div className="text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] py-16">
                <Layers size={48} className="mx-auto mb-4 text-white/10" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No resources linked yet.</p>
              </div>
            ) : (
              enrichedResources.map((res, index) => (
                <div key={index} className="relative flex items-start md:items-center">
                  
                  {/* Timeline Node (The dot on the line) */}
                  <div className="absolute left-[9px] md:left-[calc(50%-7px)] w-4 h-4 rounded-full bg-black border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-20" />

                  {/* Card Container (Alternates left and right on Desktop) */}
                  <div className={`ml-12 md:ml-0 w-full md:w-[45%] ${index % 2 === 0 ? 'md:mr-auto md:text-right md:pr-12' : 'md:ml-auto md:text-left md:pl-12'}`}>
                    <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all group backdrop-blur-sm shadow-xl">
                      
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-2 block">
                        Step {index + 1}: {res.resourceType}
                      </span>
                      
                      {/* 🚀 FIXED: Shows the real title now! */}
                      <h3 className="text-lg font-bold text-white mb-5 group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {res.displayTitle}
                      </h3>
                      
                      {/* 🚀 FIXED: Uses the enriched correct link! */}
                      <Link href={res.resourceLink}>
                        <button className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-white/10">
                          Open Resource <BookOpen size={14} />
                        </button>
                      </Link>
                      
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </main>
  );
}