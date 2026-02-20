"use client";

import { useState } from "react";
import Link from "next/link";
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

  return (
    <div className="animate-in fade-in duration-700">
        {/* --- Header Card --- */}
        <div className="bg-secondary/10 border border-white/5 rounded-[2.5rem] p-8 mb-12 relative overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
            
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                {/* Avatar with R2 Compatibility */}
                <div className="flex-shrink-0 group">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <img 
                            src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&color=fff&size=256`} 
                            alt={profile.name} 
                            referrerPolicy="no-referrer" // ✅ Essential for R2 loading
                            className="relative w-44 h-44 rounded-full border-[6px] border-background shadow-2xl object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                    </div>
                </div>

                {/* Profile Information */}
                <div className="flex-grow text-center md:text-left space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-4 justify-center md:justify-start">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">{profile.name}</h1>
                                <RoleBadge role={profile.role} />
                            </div>
                            <p className="text-cyan-400 text-sm font-black uppercase tracking-[0.2em]">Verified Contributor</p>
                        </div>

                        {!isOwnProfile && (
                            <div className="flex gap-3">
                                <Button onClick={handleMessage} variant="outline" className="rounded-full gap-2 px-6 border-white/10 hover:bg-white/5 font-bold">
                                    <FaEnvelope className="text-cyan-400" /> Message
                                </Button>
                                <Button 
                                    onClick={handleFollow} 
                                    disabled={followLoading}
                                    className={`rounded-full gap-2 px-8 font-black uppercase tracking-wider transition-all ${isFollowing ? 'bg-white/10 hover:bg-white/20 border-transparent text-white' : 'bg-gradient-to-r from-cyan-500 to-purple-600 border-0 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                                >
                                    {isFollowing ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow</>}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Bio & Badges */}
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        {profile.noteCount > 5 && (
                             <Badge variant="outline" className="gap-2 border-yellow-500/30 text-yellow-500 bg-yellow-500/5 px-4 py-1 font-bold">
                                <FaStar className="animate-pulse" /> PeerNotez Star
                             </Badge>
                        )}
                    </div>

                    {profile.bio && (
                        <p className="text-white/60 text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed font-medium italic">
                            "{profile.bio}"
                        </p>
                    )}

                    {/* Meta Info Grid */}
                    <div className="flex flex-wrap gap-6 text-sm font-bold uppercase tracking-widest text-white/40 justify-center md:justify-start">
                        {profile.university && <span className="flex items-center gap-2 text-white/60"><FaUniversity className="text-cyan-400" /> {profile.university}</span>}
                        {profile.location && <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-purple-400" /> {profile.location}</span>}
                        <span className="flex items-center gap-2"><FaCalendarAlt /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                    </div>
                    
                    {/* Stats Section with Modals */}
                    <div className="flex gap-12 pt-6 border-t border-white/5 justify-center md:justify-start">
                        <div className="text-center">
                            <span className="block text-3xl font-black text-white">{notes.length}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Notes</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-3xl font-black text-white">{blogs.length}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Blogs</span>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="text-center cursor-pointer group">
                                    <span className="block text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{followerCount}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-white/40 group-hover:text-cyan-400 transition-colors">Followers</span>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0d0d0d] border-white/10 text-white sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Followers</DialogTitle>
                                </DialogHeader>
                                <UserList users={profile.followers} emptyMessage="No followers yet." />
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="text-center cursor-pointer group">
                                    <span className="block text-3xl font-black text-white group-hover:text-purple-400 transition-colors">{profile.following.length}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-white/40 group-hover:text-purple-400 transition-colors">Following</span>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0d0d0d] border-white/10 text-white sm:max-w-md">
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
        <div className="flex gap-8 mb-10 border-b border-white/5 overflow-x-auto hide-scrollbar">
            <button 
                onClick={() => setActiveTab('notes')} 
                className={`pb-4 px-2 text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${activeTab === 'notes' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}
            >
                <FaBook /> Notes
                {activeTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 rounded-t-full shadow-[0_0_10px_#22d3ee]"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('blogs')} 
                className={`pb-4 px-2 text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative ${activeTab === 'blogs' ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}
            >
                <FaRss /> Blogs
                {activeTab === 'blogs' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-t-full shadow-[0_0_10px_#a855f7]"></div>}
            </button>
        </div>

        {/* --- Content Grid --- */}
        <div className="min-h-[400px] animate-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'notes' ? (
                notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {notes.map(note => <NoteCard key={note._id} note={{...note, user: profile}} />)}
                    </div>
                ) : (
                    <EmptyState msg="No notes shared yet." />
                )
            ) : (
                blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => <BlogCard key={blog._id} blog={{...blog, author: profile}} />)}
                    </div>
                ) : (
                    <EmptyState msg="No blog posts yet." />
                )
            )}
        </div>
    </div>
  );
}

function EmptyState({ msg }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-white/30 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02]">
            <p className="text-xl font-bold uppercase tracking-widest">{msg}</p>
        </div>
    );
}