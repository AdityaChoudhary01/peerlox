"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // 🚀 IMPORTED NEXT/IMAGE
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaCalendarAlt, FaBook, FaRss, FaStar, FaUserPlus, FaUserCheck, FaUniversity, FaEnvelope } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import NoteCard from "@/components/notes/NoteCard";
import BlogCard from "@/components/blog/BlogCard"; 
import RoleBadge from "@/components/common/RoleBadge";
import { toggleFollow } from "@/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Dialog Components for Modals
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const UserList = ({ users, emptyMessage }) => {
    if (!users || users.length === 0) {
        return <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>;
    }
    return (
        <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
                {users.map((user) => (
                    <Link href={`/profile/${user._id}`} key={user._id}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer border border-transparent hover:border-border">
                            <Avatar className="h-10 w-10 border shadow-sm">
                                <AvatarImage src={user.avatar} referrerPolicy="no-referrer" />
                                <AvatarFallback className="font-black text-xs uppercase">{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm leading-tight text-foreground">{user.name}</span>
                                {user.role === 'admin' && <span className="text-[10px] text-primary font-bold uppercase mt-0.5">Admin</span>}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </ScrollArea>
    );
};

export default function PublicProfileView({ profile, notes, blogs, currentUser, isOwnProfile, initialIsFollowing }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('notes');
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.followers.length);

  const handleFollow = async () => {
    if (!currentUser) {
        toast({ title: "Login Required", description: "Please login to follow users." });
        return;
    }
    setFollowLoading(true);
    const res = await toggleFollow(currentUser.id, profile._id);
    
    if (res.success) {
        setIsFollowing(res.isFollowing);
        setFollowerCount(prev => res.isFollowing ? prev + 1 : prev - 1);
        toast({ title: res.isFollowing ? "Following" : "Unfollowed", description: res.isFollowing ? `You are now following ${profile.name}` : `You unfollowed ${profile.name}` });
    } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setFollowLoading(false);
  };

  const handleMessage = () => {
    if (!currentUser) {
        router.push("/login");
        return;
    }
    router.push(`/chat/${profile._id}`);
  };

  return (
    <div className="animate-in fade-in duration-700 px-2 sm:px-0">
        {/* --- Header Card --- */}
        {/* ✅ MOBILE FIX: Reduced p-8 to p-5 for smaller screens, removed mb-12 for tighter mobile spacing */}
        <div className="bg-secondary/10 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 mb-8 sm:mb-12 relative overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
            
            <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-center md:items-start relative z-10">
                
                {/* Avatar */}
                <div className="flex-shrink-0 group mt-2 sm:mt-0">
                    <div className="relative w-32 h-32 sm:w-44 sm:h-44">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        {profile.avatar ? (
                          <Image 
                              src={profile.avatar} 
                              alt={profile.name} 
                              fill
                              unoptimized // Assuming you handle optimization externally for avatars too
                              className="rounded-full border-[4px] sm:border-[6px] border-background shadow-2xl object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&color=fff&size=256`} 
                              alt={profile.name} 
                              className="relative w-full h-full rounded-full border-[4px] sm:border-[6px] border-background shadow-2xl object-cover"
                          />
                        )}
                    </div>
                </div>

                {/* Profile Information */}
                <div className="flex-grow text-center md:text-left space-y-5 sm:space-y-6 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white">{profile.name}</h1>
                                <RoleBadge role={profile.role} />
                            </div>
                            <p className="text-cyan-400 text-xs sm:text-sm font-black uppercase tracking-[0.2em]">Verified Contributor</p>
                        </div>

                        {!isOwnProfile && (
                            <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
                                <Button onClick={handleMessage} variant="outline" className="rounded-full gap-2 px-6 border-white/10 hover:bg-white/5 font-bold flex-1 md:flex-auto">
                                    <FaEnvelope className="text-cyan-400" /> Message
                                </Button>
                                <Button 
                                    onClick={handleFollow} 
                                    disabled={followLoading}
                                    className={`rounded-full gap-2 px-8 font-black uppercase tracking-wider transition-all flex-1 md:flex-auto ${isFollowing ? 'bg-white/10 hover:bg-white/20 border-transparent text-white' : 'bg-gradient-to-r from-cyan-500 to-purple-600 border-0 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                                >
                                    {isFollowing ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow</>}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        {profile.noteCount > 5 && (
                             <Badge variant="outline" className="gap-2 border-yellow-500/30 text-yellow-500 bg-yellow-500/5 px-4 py-1 font-bold">
                                <FaStar className="animate-pulse" /> StuHive Star
                             </Badge>
                        )}
                    </div>

                    {profile.bio && (
                        <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed font-medium italic">
                            &quot;{profile.bio}&quot;
                        </p>
                    )}

                    {/* Meta Info Grid */}
                    {/* ✅ ACCESSIBILITY FIX: Changed text-white/40 to text-gray-300 to pass color contrast ratio */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-300 justify-center md:justify-start">
                        {profile.university && <span className="flex items-center gap-2"><FaUniversity className="text-cyan-400" /> {profile.university}</span>}
                        {profile.location && <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-purple-400" /> {profile.location}</span>}
                        <span className="flex items-center gap-2"><FaCalendarAlt /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                    </div>
                    
                    {/* Stats Section with Modals */}
                    <div className="flex justify-center md:justify-start gap-8 sm:gap-12 pt-6 border-t border-white/5">
                        <div className="text-center">
                            <span className="block text-2xl sm:text-3xl font-black text-white">{notes.length}</span>
                            {/* ✅ ACCESSIBILITY FIX: Changed text-white/40 to text-gray-300 */}
                            <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-gray-300">Notes</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-2xl sm:text-3xl font-black text-white">{blogs.length}</span>
                            {/* ✅ ACCESSIBILITY FIX: Changed text-white/40 to text-gray-300 */}
                            <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-gray-300">Blogs</span>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                {/* ✅ ACCESSIBILITY FIX: Changed <div> to <button> since it triggers a modal */}
                                <button className="text-center cursor-pointer group appearance-none bg-transparent border-none p-0 m-0">
                                    <span className="block text-2xl sm:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{followerCount}</span>
                                    {/* ✅ ACCESSIBILITY FIX: Changed text-white/40 to text-gray-300 */}
                                    <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-gray-300 group-hover:text-cyan-400 transition-colors">Followers</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0d0d0d] border-white/10 text-white sm:max-w-md w-[95vw] rounded-2xl p-4 sm:p-6">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Followers</DialogTitle>
                                </DialogHeader>
                                <UserList users={profile.followers} emptyMessage="No followers yet." />
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                {/* ✅ ACCESSIBILITY FIX: Changed <div> to <button> since it triggers a modal */}
                                <button className="text-center cursor-pointer group appearance-none bg-transparent border-none p-0 m-0">
                                    <span className="block text-2xl sm:text-3xl font-black text-white group-hover:text-purple-400 transition-colors">{profile.following.length}</span>
                                    {/* ✅ ACCESSIBILITY FIX: Changed text-white/40 to text-gray-300 */}
                                    <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-gray-300 group-hover:text-purple-400 transition-colors">Following</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0d0d0d] border-white/10 text-white sm:max-w-md w-[95vw] rounded-2xl p-4 sm:p-6">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Following</DialogTitle>
                                </DialogHeader>
                                <UserList users={profile.following} emptyMessage="Not following anyone yet." />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </div>

        {/* --- Content Tabs --- */}
        <div className="flex gap-6 sm:gap-8 mb-8 sm:mb-10 border-b border-white/5 overflow-x-auto hide-scrollbar px-1">
            <button 
                onClick={() => setActiveTab('notes')} 
                // ✅ ACCESSIBILITY FIX: Changed text-white/40 to text-gray-400
                className={`pb-4 px-2 text-xs sm:text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3 transition-all relative ${activeTab === 'notes' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            >
                <FaBook /> Notes
                {activeTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 rounded-t-full shadow-[0_0_10px_#22d3ee]"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('blogs')} 
                // ✅ ACCESSIBILITY FIX: Changed text-white/40 to text-gray-400
                className={`pb-4 px-2 text-xs sm:text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3 transition-all relative ${activeTab === 'blogs' ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
                <FaRss /> Blogs
                {activeTab === 'blogs' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-t-full shadow-[0_0_10px_#a855f7]"></div>}
            </button>
        </div>

        {/* --- Content Grid --- */}
        {/* ✅ ACCESSIBILITY FIX: Wrapped in an aria-labelledby section with a hidden H2 to fix the H3 sequence in NoteCards */}
        <section aria-labelledby="portfolio-heading" className="min-h-[400px] animate-in slide-in-from-bottom-4 duration-500 pb-12">
            <h2 id="portfolio-heading" className="sr-only">{activeTab === 'notes' ? 'Notes Portfolio' : 'Blog Portfolio'}</h2>
            
            {activeTab === 'notes' ? (
                notes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {notes.map(note => <NoteCard key={note._id} note={{...note, user: profile}} />)}
                    </div>
                ) : (
                    <EmptyState msg="No notes shared yet." />
                )
            ) : (
                blogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {blogs.map(blog => <BlogCard key={blog._id} blog={{...blog, author: profile}} />)}
                    </div>
                ) : (
                    <EmptyState msg="No blog posts yet." />
                )
            )}
        </section>
    </div>
  );
}

function EmptyState({ msg }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-gray-500 border-2 border-dashed border-white/5 rounded-[2rem] sm:rounded-[2.5rem] bg-white/[0.02]">
            <p className="text-lg sm:text-xl font-bold uppercase tracking-widest text-center px-4">{msg}</p>
        </div>
    );
}