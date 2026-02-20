"use client";

import { useState } from "react";
import { toggleBlogFeatured, adminDeleteBlog } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Trash2, ExternalLink, MessageSquare, Eye, Loader2, FileText, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BlogModerationTable({ initialBlogs }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [loadingId, setLoadingId] = useState(null);
  const { toast } = useToast();

  const handleToggleFeatured = async (blogId, currentState) => {
    setLoadingId(blogId);
    const res = await toggleBlogFeatured(blogId, currentState);
    if (res.success) {
      setBlogs(blogs.map(b => b._id === blogId ? { ...b, isFeatured: !currentState } : b));
      toast({ title: !currentState ? "Blog Featured" : "Feature Removed" });
    } else {
      toast({ title: "Error", description: res.error || "Failed to update", variant: "destructive" });
    }
    setLoadingId(null);
  };

  const handleDelete = async (blogId) => {
    if (!confirm("Are you sure? This will permanently delete the article and is cover image.")) return;
    setLoadingId(blogId);
    const res = await adminDeleteBlog(blogId);
    if (res.success) {
      setBlogs(blogs.filter(b => b._id !== blogId));
      toast({ title: "Blog &  Assets Deleted", variant: "destructive" });
    } else {
      toast({ title: "Error", description: res.error || "Failed to delete", variant: "destructive" });
    }
    setLoadingId(null);
  };

  return (
    <div className="border rounded-3xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-black tracking-[0.2em] border-b border-white/5">
            <tr>
              <th className="px-8 py-5">Article Content</th>
              <th className="px-6 py-5">Author</th>
              <th className="px-6 py-5 hidden sm:table-cell text-center">Engagement</th>
              <th className="px-8 py-5 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {blogs.map((blog) => (
              <tr key={blog._id} className="hover:bg-white/[0.02] transition-all group">
                
                {/* 1. Article Preview Column */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      {blog.coverImage ? (
                        <img 
                          src={blog.coverImage} 
                          alt={blog.title} 
                          referrerPolicy="no-referrer"
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <FileText className="w-5 h-5 text-white/20 absolute inset-0 m-auto" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white text-base truncate max-w-[200px]" title={blog.title}>
                        {blog.title}
                      </span>
                      <div className="flex gap-2 items-center mt-1">
                        {blog.isFeatured && (
                          <Badge className="h-4 text-[9px] bg-cyan-500 hover:bg-cyan-400 text-black px-2 font-black uppercase tracking-tighter border-0">
                            Featured
                          </Badge>
                        )}
                        <span className="text-[10px] text-white/30 font-mono uppercase truncate max-w-[120px]">
                          /{blog.slug}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Author Column */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-white/10 shadow-lg">
                      <AvatarImage src={blog.author?.avatar} referrerPolicy="no-referrer" />
                      <AvatarFallback className="text-[10px] bg-secondary font-bold">{blog.author?.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/80">{blog.author?.name || "Anonymous"}</span>
                        <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">{blog.author?.role || "User"}</span>
                    </div>
                  </div>
                </td>

                {/* 3. Stats Column */}
                <td className="px-6 py-5 hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-6 text-white/40 font-bold">
                    <div className="flex flex-col items-center gap-0.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-400"/>
                        <span className="text-[10px]">{blog.viewCount || 0}</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400"/>
                        <span className="text-[10px]">{blog.numReviews || 0}</span>
                    </div>
                  </div>
                </td>

                {/* 4. Action Buttons */}
                <td className="px-8 py-5 text-right space-x-3 whitespace-nowrap">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-9 w-9 rounded-xl transition-all ${blog.isFeatured ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20" : "text-white/20 hover:text-white hover:bg-white/5"}`}
                    onClick={() => handleToggleFeatured(blog._id, blog.isFeatured)}
                    disabled={loadingId === blog._id}
                  >
                    <Star className={`w-4 h-4 ${blog.isFeatured ? "fill-current" : ""}`} />
                  </Button>
                  
                  <Link href={`/blogs/${blog.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white/20 hover:text-white hover:bg-white/5">
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDelete(blog._id)}
                    disabled={loadingId === blog._id}
                  >
                    {loadingId === blog._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blogs.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-white/20">
            <ShieldAlert size={40} className="mb-4 opacity-10" />
            <p className="font-bold uppercase tracking-[0.3em] text-xs">No articles pending moderation</p>
        </div>
      )}
    </div>
  );
}