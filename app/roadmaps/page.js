import { getPublicStudyPlans } from "@/actions/planner.actions";
import Link from "next/link";
import { Globe, Search, User, Layers, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = {
  title: "Community Roadmaps | StuHive",
  description: "Discover and clone study roadmaps created by top students.",
};

export default async function RoadmapsDirectoryPage({ searchParams }) {
  const query = (await searchParams)?.q || "";
  const { plans } = await getPublicStudyPlans(query);

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header & Search */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
            <Globe size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Directory</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Roadmaps</span>
          </h1>
          <p className="text-gray-400 font-medium mb-8">Discover study paths curated by peers. Clone them to your personal planner and follow their exact study strategy.</p>

          <form action="/roadmaps" method="GET" className="relative w-full max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search subjects, exams, or courses..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </form>
        </header>

        {/* Grid of Roadmaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-3xl">
              No public roadmaps found. Be the first to publish yours!
            </div>
          ) : (
            plans.map(plan => (
              <Link key={plan._id} href={`/roadmaps/${plan.slug}`} className="group block">
                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border border-white/10">
                        <AvatarImage src={plan.user?.avatar} />
                        <AvatarFallback className="bg-purple-900 text-[10px] font-bold text-white">{plan.user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{plan.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      <Share2 size={12} /> {plan.clones || 0}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-purple-300 transition-colors line-clamp-2">
                    {plan.title}
                  </h3>
                  
                  <div className="mt-auto pt-6 flex items-center gap-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Layers size={14} /> {plan.resources?.length || 0} Modules</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </main>
  );
}