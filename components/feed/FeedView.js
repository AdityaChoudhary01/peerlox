"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FaBook, FaPenNib, FaFilter, FaSearch, FaUsers, FaUserMinus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NoteCard from "@/components/notes/NoteCard";
import BlogCard from "@/components/blog/BlogCard";
import Pagination from "@/components/common/Pagination";
import { toggleFollow } from "@/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function FeedView({ initialContent, initialFollowing, currentUserId }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState('all');
  const [showFollowing, setShowFollowing] = useState(false);
  const [loadingUnfollowId, setLoadingUnfollowId] = useState(null); // Add loading state
  
  const [unfollowedIds, setUnfollowedIds] = useState([]);

  const visibleFollowingUsers = (initialFollowing || []).filter(
    user => !unfollowedIds.includes(user._id)
  );

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 6;

  const filteredContent = initialContent.filter(item => {
    const itemOwner = item.user || item.author;
    if (!itemOwner) return false;

    const ownerId = itemOwner._id || itemOwner;
    const isStillFollowing = visibleFollowingUsers.some(u => u._id === ownerId);

    if (!isStillFollowing) return false;
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const activePage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedContent = filteredContent.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleUnfollow = async (targetId) => {
    setLoadingUnfollowId(targetId);
    setUnfollowedIds(prev => [...prev, targetId]);

    const res = await toggleFollow(currentUserId, targetId);

    if (res.success) {
        toast({ title: "Unfollowed user successfully" });
        // 🚀 FORCE NEXT.JS TO RE-FETCH SERVER PROPS
        router.refresh(); 
    } else {
        setUnfollowedIds(prev => prev.filter(id => id !== targetId));
        toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setLoadingUnfollowId(null);
  };

  if (initialContent.length === 0 && visibleFollowingUsers.length === 0) {
    return (
      <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-3xl border-dashed">
        <h2 className="text-2xl font-bold mb-4">Your Feed is Quiet... 😴</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          You haven&apos;t followed any users yet.
        </p>
        <Link href="/search">
          <Button className="rounded-full gap-2 px-8 bg-cyan-500 text-black hover:bg-cyan-400 font-bold">
            <FaSearch /> Discover Authors
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Following Management Section */}
      {visibleFollowingUsers.length > 0 && (
          <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => setShowFollowing(!showFollowing)}
                className="w-full flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl p-4 h-auto group"
              >
                  <div className="flex items-center gap-3">
                      <div className="bg-cyan-500/10 p-3 rounded-full text-cyan-400 group-hover:scale-110 transition-transform">
                        <FaUsers />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-sm text-white">Following {visibleFollowingUsers.length} Creators</h3>
                          <p className="text-xs text-gray-400">Manage your subscription list</p>
                      </div>
                  </div>
                  {showFollowing ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
              </Button>

              {showFollowing && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {visibleFollowingUsers.map(user => (
                          <div key={user._id} className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-2xl shadow-sm">
                              <Link href={`/profile/${user._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
                                  <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback className="bg-cyan-900 text-cyan-400">{user.name?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-bold truncate">{user.name}</span>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-full px-3 shrink-0 ml-2"
                                onClick={() => handleUnfollow(user._id)}
                                disabled={loadingUnfollowId === user._id}
                              >
                                  {loadingUnfollowId === user._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><FaUserMinus className="mr-1.5" /> Unfollow</>}
                              </Button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 sticky top-20 z-40 py-2.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 mx-auto max-w-fit px-5 shadow-2xl">
        <span className="flex items-center gap-2 text-gray-400 font-semibold mr-2 text-sm uppercase tracking-widest">
          <FaFilter className="text-cyan-400" /> Filter
        </span>
        <Button 
          size="sm"
          variant={filter === 'all' ? 'default' : 'ghost'} 
          onClick={() => handleFilterChange('all')} 
          className={`rounded-full h-8 px-5 ${filter === 'all' ? 'bg-cyan-500 text-black hover:bg-cyan-400 font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          All
        </Button>
        <Button 
          size="sm"
          variant={filter === 'note' ? 'default' : 'ghost'} 
          onClick={() => handleFilterChange('note')} 
          className={`rounded-full gap-2 h-8 px-5 ${filter === 'note' ? 'bg-cyan-500 text-black hover:bg-cyan-400 font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          <FaBook className="w-3 h-3"/> Notes
        </Button>
        <Button 
          size="sm"
          variant={filter === 'blog' ? 'default' : 'ghost'} 
          onClick={() => handleFilterChange('blog')} 
          className={`rounded-full gap-2 h-8 px-5 ${filter === 'blog' ? 'bg-cyan-500 text-black hover:bg-cyan-400 font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          <FaPenNib className="w-3 h-3"/> Blogs
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedContent.map((item) => (
          <div key={`${item.type}-${item._id}`} className="relative group h-full">
            <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-black uppercase tracking-widest shadow-xl">
              {item.type === 'note' ? <><FaBook className="w-3 h-3 text-cyan-400"/> Note</> : <><FaPenNib className="w-3 h-3 text-purple-400"/> Blog</>}
            </div>
            
            {item.type === 'note' ? (
              <NoteCard note={item} />
            ) : (
              <div className="h-full">
                <BlogCard blog={item} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State for Filters */}
      {filteredContent.length === 0 && (
        <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/5 mt-6">
          <p className="text-gray-400 font-medium mb-4">No updates found for this filter.</p>
          <Button variant="outline" onClick={() => handleFilterChange('all')} className="rounded-full border-white/10 hover:bg-white/5">
              Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination Component */}
      {totalPages > 1 && (
        <div className="mt-16">
          <Pagination 
            currentPage={activePage} 
            totalPages={totalPages} 
          />
        </div>
      )}
    </div>
  );
}