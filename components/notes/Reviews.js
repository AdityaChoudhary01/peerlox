"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; 
import { useToast } from "@/hooks/use-toast";
import { addReview, deleteReview } from "@/actions/note.actions";
import { Trash2, MessageSquare, Star, Reply, Loader2 } from "lucide-react"; 
import StarRating from "@/components/common/StarRating";
import { formatDate } from "@/lib/utils";

export default function NoteReviews({ noteId, initialReviews = [] }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState(initialReviews);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState(null); 
  const [replyComment, setReplyComment] = useState("");

  const getAvatarUrl = (user) => {
    if (!user || !user.name) return `https://ui-avatars.com/api/?name=Deleted+User&background=random`;
    return user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
  };

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const textToSubmit = parentId ? replyComment : comment;
    
    if (!session) return toast({ title: "Please login to comment", variant: "destructive" });
    if (!textToSubmit.trim()) return;

    if (!parentId && rating === 0) {
      return toast({ 
        title: "Rating Required", 
        description: "Please select a star rating for your review.", 
        variant: "destructive" 
      });
    }

    setIsSubmitting(true);
    
    // Logic: rating is sent as 0 for replies
    const res = await addReview(
        noteId, 
        session.user.id, 
        parentId ? 0 : rating, 
        textToSubmit, 
        parentId
    );
    
    if (res.success) {
      setReviews(res.reviews);
      if (parentId) {
          setReplyComment("");
          setReplyingTo(null);
      } else {
          setComment("");
          setRating(5);
      }
      toast({ title: parentId ? "Reply posted" : "Review posted" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    const res = await deleteReview(noteId, reviewId);
    if (res.success) {
      setReviews(res.reviews);
      toast({ title: "Deleted" });
    }
  };

  const topLevelReviews = reviews.filter(r => !r.parentReviewId);
  const replies = reviews.filter(r => r.parentReviewId);

  return (
    <div className="space-y-8 mt-10">
      <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-cyan-400" />
        Community <span className="text-cyan-400">Feedback</span> ({topLevelReviews.length})
      </h3>

      {/* Main Comment Form */}
      {session ? (
        <form onSubmit={(e) => handleSubmit(e, null)} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Rating</span>
                <StarRating 
                    rating={rating} 
                    onRatingChange={setRating} 
                    interactive={true} 
                    size="md" 
                />
            </div>
            <Textarea 
              placeholder="What do you think of these notes?..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-black/20 border-white/10 rounded-xl focus:border-cyan-500/50 min-h-[100px] resize-none"
            />
            <Button 
                type="submit" 
                disabled={isSubmitting || !comment.trim()}
                className="bg-cyan-500 text-black font-black uppercase tracking-widest text-xs h-11 px-8 rounded-xl hover:bg-cyan-400"
            >
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Post Review"}
            </Button>
        </form>
      ) : (
        <div className="bg-white/5 border border-dashed border-white/10 p-8 rounded-2xl text-center">
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Login to join the discussion</p>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-6">
        {topLevelReviews.map((review) => {
          const childReplies = replies.filter(r => r.parentReviewId === review._id);

          return (
            <div key={review._id} className="space-y-4">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl group relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-white/10">
                      <AvatarImage src={getAvatarUrl(review.user)} />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-black text-white">{review.user?.name || "Deleted User"}</h4>
                      <p className="text-[10px] text-white/30 font-bold uppercase">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="xs" />
                </div>
                
                <p className="text-white/70 text-sm leading-relaxed mb-4">{review.comment}</p>

                <div className="flex gap-4">
                    <button 
                    onClick={() => {
                        setReplyingTo(replyingTo === review._id ? null : review._id);
                        setReplyComment(`@${review.user?.name || 'User'} `);
                    }}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                    <Reply className="w-3 h-3" /> Reply
                    </button>

                    {(session?.user?.id === (review.user?._id || review.user) || session?.user?.role === 'admin') && (
                    <button 
                        onClick={() => handleDelete(review._id)} 
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" /> Delete
                    </button>
                    )}
                </div>

                {/* Inline Reply Form */}
                {replyingTo === review._id && (
                    <form onSubmit={(e) => handleSubmit(e, review._id)} className="flex gap-3 mt-4 animate-in slide-in-from-top-2 duration-200">
                        <Input 
                            value={replyComment}
                            onChange={(e) => setReplyComment(e.target.value)}
                            className="h-9 text-sm bg-black/40 border-white/10 focus:border-cyan-500/50"
                            autoFocus
                        />
                        <Button type="submit" size="sm" disabled={isSubmitting || !replyComment.trim()} className="bg-cyan-500 text-black font-bold h-9">
                            {isSubmitting ? "..." : "Reply"}
                        </Button>
                    </form>
                )}
              </div>

              {/* Threaded Replies */}
              {childReplies.length > 0 && (
                <div className="ml-10 space-y-3 border-l-2 border-white/5 pl-6">
                  {childReplies.map(reply => (
                    <div key={reply._id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group/reply">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={getAvatarUrl(reply.user)} />
                                <AvatarFallback>?</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-white/80">{reply.user?.name || "Deleted User"}</span>
                            <span className="text-[9px] text-white/20 uppercase font-medium">{formatDate(reply.createdAt)}</span>
                        </div>
                        {(session?.user?.id === (reply.user?._id || reply.user) || session?.user?.role === 'admin') && (
                          <button onClick={() => handleDelete(reply._id)} className="text-red-500/40 hover:text-red-500 transition-opacity opacity-0 group-hover/reply:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-white/60">
                         <span className="text-cyan-400 font-bold text-xs mr-1">@{review.user?.name || 'User'}</span>
                         {reply.comment}
                      </p>
                      <button 
                        onClick={() => {
                            setReplyingTo(review._id); 
                            setReplyComment(`@${reply.user?.name || 'User'} `); 
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-cyan-400 mt-2 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {topLevelReviews.length === 0 && (
        <div className="bg-white/[0.02] border border-dashed border-white/10 p-12 rounded-2xl text-center">
            <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No feedback yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
}