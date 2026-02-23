"use client";

import { useState } from "react";
import Link from "next/link";
import { FaUpload, FaBookmark, FaList, FaPenNib, FaEdit, FaRss, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NoteCard from "@/components/notes/NoteCard";
import BlogCard from "@/components/blog/BlogCard";
import RoleBadge from "@/components/common/RoleBadge";
import dynamic from 'next/dynamic'; 
import { updateProfile, updateUserAvatar } from "@/actions/user.actions";
import { deleteCollection, renameCollection, createCollection } from "@/actions/collection.actions"; 
import { deleteBlog } from "@/actions/blog.actions";
import { deleteNote } from "@/actions/note.actions"; 
import { useToast } from '@/hooks/use-toast';
import { useSession } from "next-auth/react";
import { Trash2, Loader2, MoreVertical, Search } from "lucide-react"; 
import ProfileImageUpload from "@/components/profile/ProfileImageUpload";
import EditBio from "@/components/profile/EditBio"; // ✅ IMPORTED EDIT BIO
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EditNoteModal = dynamic(() => import('@/components/notes/EditNoteModal'), { 
  ssr: false, 
  loading: () => <Loader2 className="animate-spin text-cyan-400 mx-auto mt-4" /> 
});

export default function ProfileDashboard({ user, initialMyNotes, initialSavedNotes, initialCollections, initialMyBlogs }) {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("uploads");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [editingNote, setEditingNote] = useState(null);
  const [isDeletingNoteId, setIsDeletingNoteId] = useState(null); 
  
  const [editingColId, setEditingColId] = useState(null);
  const [editColName, setEditColName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  // ✅ OPTIMISTIC STATE: We no longer sync with useEffect. 
  // We use this state strictly to show a temporary image during an active upload sequence.
  const [optimisticAvatar, setOptimisticAvatar] = useState(null); 
  
  const [myNotes, setMyNotes] = useState(initialMyNotes || []);
  const [collections, setCollections] = useState(initialCollections || []);
  const [myBlogs, setMyBlogs] = useState(initialMyBlogs || []); 

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    const res = await updateProfile(user._id, { name: newName });
    if (res.success) {
      toast({ title: "Profile Updated" });
      setIsEditingName(false);
      await updateSession({ ...session, user: { ...session.user, name: newName } });
    }
  };

  const handleAvatarUpdate = async (newUrl, avatarKey) => {
    // 1. Immediately show the new image (Optimistic UI) to make it feel fast
    setOptimisticAvatar(newUrl);

    // 2. Process the background update
    const res = await updateUserAvatar(user._id, newUrl, avatarKey);
    
    if (res.success) {
      toast({ title: "Profile updated!" });
      await updateSession({ 
        ...session, 
        user: { ...session?.user, image: newUrl, avatar: newUrl } 
      });
    } else {
      // 3. Revert if it fails
      setOptimisticAvatar(null);
      toast({ title: "Update Failed", description: res.error, variant: "destructive" });
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to permanently delete this note?")) return;
    setIsDeletingNoteId(noteId);
    
    const res = await deleteNote(noteId, user._id);
    
    if (res.success) {
      setMyNotes(prev => prev.filter(n => n._id !== noteId));
      toast({ title: "Note Deleted", description: "Document removed from cloud storage." });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setIsDeletingNoteId(null);
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    const res = await createCollection(newCollectionName, user._id);
    if (res.success) {
      setCollections([res.collection, ...collections]);
      setNewCollectionName("");
      setIsCreatingCollection(false);
      toast({ title: "Collection Created" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  const handleDeleteCollection = async (id) => {
    if(!confirm("Delete this collection? This won't delete the notes inside it.")) return;
    const res = await deleteCollection(id, user._id);
    if(res.success) {
        setCollections(prev => prev.filter(c => c._id !== id));
        toast({ title: "Deleted" });
    } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  const handleRenameCollection = async (id) => {
    if (!editColName.trim()) return toast({ title: "Name cannot be empty", variant: "destructive" });
    const res = await renameCollection(id, editColName, user._id);
    if (res.success) {
      setCollections(prev => prev.map(c => c._id === id ? { ...c, name: editColName } : c));
      setEditingColId(null);
      toast({ title: "Collection Renamed" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!confirm("Are you sure you want to permanently delete this blog?")) return;
    const res = await deleteBlog(blogId, user._id);
    if (res.success) {
      setMyBlogs(prev => prev.filter(b => b._id !== blogId));
      toast({ title: "Blog Deleted" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // ✅ Fallback chain: Optimistic state -> Server prop -> Default placeholder
  const displayAvatar = optimisticAvatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Student')}`;

  return (
    <div className="container py-8 max-w-6xl">
        <div className="bg-secondary/10 border rounded-3xl p-8 mb-8 flex flex-col items-center text-center shadow-lg backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-600"></div>
            <div className="mb-4 relative z-10">
              <ProfileImageUpload currentImage={displayAvatar} onUploadComplete={handleAvatarUpdate} />
            </div>
            {!isEditingName ? (
                <div className="flex items-center gap-2 mb-2 relative z-10">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <button onClick={() => setIsEditingName(true)} className="text-muted-foreground hover:text-primary transition"><FaEdit /></button>
                </div>
            ) : (
                <form onSubmit={handleNameSave} className="flex gap-2 mb-2 relative z-10">
                    <Input value={newName} onChange={e => setNewName(e.target.value)} className="h-8 w-48 text-center" autoFocus />
                    <Button size="sm" type="submit">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>Cancel</Button>
                </form>
            )}
            <p className="text-muted-foreground mb-4 relative z-10">{user.email}</p>
            <div className="flex gap-2 mb-4 relative z-10">
                <RoleBadge role={user.role} />
            </div>

            {/* ✅ INJECTED EDIT BIO SECTION HERE */}
            <div className="relative z-10 w-full mb-6">
                <EditBio user={user} />
            </div>

            <Link href="/feed" className="relative z-10">
                <Button className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all">
                    <FaRss className="mr-2" /> My Personalized Feed
                </Button>
            </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
            <TabButton active={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} icon={<FaUpload />}>Uploads ({myNotes.length})</TabButton>
            <TabButton active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} icon={<FaBookmark />}>Saved ({initialSavedNotes?.length || 0})</TabButton>
            <TabButton active={activeTab === 'collections'} onClick={() => setActiveTab('collections')} icon={<FaList />}>Collections ({collections.length})</TabButton>
            <TabButton active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} icon={<FaPenNib />}>My Blogs ({myBlogs.length})</TabButton>
        </div>

        <div className="min-h-[400px]">
            {activeTab === 'uploads' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myNotes.map((note, index) => (
                        <div key={note._id} className="relative group">
                            {/* Passed priority to first 3 items to help with LCP if needed */}
                            <NoteCard note={{...note, user}} priority={index < 3} /> 
                            <div className="absolute top-2 left-2 flex gap-2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-full shadow-md bg-blue-600 text-white hover:bg-blue-700 border-0 active:scale-90" 
                                  onClick={(e) => { e.preventDefault(); setEditingNote(note); }}
                                >
                                    <FaEdit className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-full shadow-md border-0 active:scale-90" 
                                  disabled={isDeletingNoteId === note._id}
                                  onClick={(e) => { e.preventDefault(); handleDeleteNote(note._id); }}
                                >
                                    {isDeletingNoteId === note._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                        </div>
                    ))}
                    {myNotes.length === 0 && (
                      <EmptyState 
                        msg="You haven't uploaded any notes yet." 
                        action={<Link href="/notes/upload"><Button><FaUpload className="mr-2"/> Upload Note</Button></Link>} 
                      />
                    )}
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialSavedNotes?.map((note, index) => <NoteCard key={note._id} note={note} priority={index < 3} />)}
                    {(!initialSavedNotes || initialSavedNotes.length === 0) && (
                      <EmptyState 
                        msg="You haven't saved any notes to your collection." 
                        action={<Link href="/search"><Button variant="outline"><Search className="mr-2 w-4 h-4"/> Browse Notes</Button></Link>} 
                      />
                    )}
                </div>
            )}

            {activeTab === 'blogs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myBlogs.map((blog, index) => (
                        <div key={blog._id} className="relative group h-full">
                          <BlogCard blog={{...blog, author: user}} priority={index < 2} />
                          <div className="absolute top-3 right-3 z-20">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur-md hover:bg-background">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/blogs/edit/${blog.slug}`} className="cursor-pointer">
                                    <FaEdit className="w-4 h-4 mr-2" /> Edit Blog
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteBlog(blog._id)} className="text-destructive focus:text-destructive cursor-pointer">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                    ))}
                    {myBlogs.length === 0 && (
                      <EmptyState 
                        msg="You haven't written any blogs yet." 
                        action={<Link href="/blogs/post"><Button className="rounded-full font-bold px-6 bg-purple-500 text-white hover:bg-purple-400"><FaPenNib className="mr-2"/> Write a Blog</Button></Link>} 
                      />
                    )}
                </div>
            )}

            {activeTab === 'collections' && (
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-primary/20 shadow-sm mb-6">
                        {isCreatingCollection ? (
                          <form onSubmit={handleCreateCollection} className="flex gap-2 w-full">
                            <Input placeholder="New collection name..." value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} autoFocus />
                            <Button type="submit">Create</Button>
                            <Button variant="ghost" onClick={() => setIsCreatingCollection(false)}>Cancel</Button>
                          </form>
                        ) : (
                          <Button variant="outline" className="w-full border-dashed" onClick={() => setIsCreatingCollection(true)}>
                            <FaPlus className="mr-2" /> Create New Collection
                          </Button>
                        )}
                    </div>
                    {collections.map(col => (
                        <div key={col._id} className="flex items-center justify-between p-4 bg-secondary/5 rounded-xl border hover:bg-secondary/10 transition">
                            {editingColId === col._id ? (
                                <div className="flex items-center gap-2 w-full">
                                    <FaList className="text-primary w-5 h-5 opacity-50 hidden sm:block" />
                                    <Input value={editColName} onChange={(e) => setEditColName(e.target.value)} className="h-8 flex-1" autoFocus />
                                    <Button size="sm" onClick={() => handleRenameCollection(col._id)}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingColId(null)}>Cancel</Button>
                                </div>
                            ) : (
                                <>
                                    <Link href={`/collections/${col._id}`} className="flex items-center gap-4 flex-1">
                                        <FaList className="text-primary w-5 h-5" />
                                        <div>
                                            <h3 className="font-bold">{col.name}</h3>
                                            <p className="text-xs text-muted-foreground">{col.notes?.length || 0} notes</p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingColId(col._id); setEditColName(col.name); }} className="text-muted-foreground hover:text-primary">
                                            <FaEdit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCollection(col._id)} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {editingNote && <EditNoteModal note={editingNote} onClose={() => setEditingNote(null)} />}
    </div>
  );
}

function TabButton({ active, onClick, children, icon }) {
    return (
        <Button variant={active ? "default" : "outline"} onClick={onClick} className={`rounded-full transition-all ${active ? "shadow-md scale-105" : "border-transparent bg-secondary/20 hover:bg-secondary/30"}`}>
            <span className="mr-2">{icon}</span> {children}
        </Button>
    )
}

function EmptyState({ msg, action }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-white/10 rounded-3xl gap-4 bg-secondary/5">
            <p className="text-lg font-medium">{msg}</p>
            {action}
        </div>
    )
}