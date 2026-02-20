"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; 
import { useToast } from "@/hooks/use-toast";
import { addBlogReview, deleteBlogReview } from "@/actions/blog.actions";
import { Trash2, MessageSquare, Star } from "lucide-react"; 
import StarRating from "@/components/common/StarRating";
import { formatDate } from "@/lib/utils";

export default function BlogInteractions({ blogId, initialComments = [] }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState(initialComments);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0); 
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
    
    // Logic: rating is sent as 0 for replies, same as your Notes logic
    const res = await addBlogReview(
        blogId, 
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
          setRating(0);
      }
      toast({ title: parentId ? "Reply posted" : "Review posted" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Delete this comment?")) return;
    const res = await deleteBlogReview(blogId, reviewId);
    if (res.success) {
      setReviews(res.reviews);
      toast({ title: "Deleted" });
    }
  };

  const topLevelReviews = reviews.filter(r => !r.parentReviewId);
  const replies = reviews.filter(r => r.parentReviewId);

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold">Comments ({topLevelReviews.length})</h3>

      {/* Main Comment Form */}
      <form onSubmit={(e) => handleSubmit(e, null)} className="space-y-4">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 mt-1">
            <AvatarImage src={session?.user?.image || session?.user?.avatar} />
            <AvatarFallback>{session?.user?.name?.charAt(0) || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Your Rating:</span>
                <StarRating 
                    rating={rating} 
                    onRatingChange={setRating} 
                    interactive={true} 
                    size="md" 
                />
            </div>
            <Textarea 
              placeholder="Write a review..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
            <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                {isSubmitting ? "Posting..." : "Post Review"}
            </Button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {topLevelReviews.map((review) => {
          const childReplies = replies.filter(r => r.parentReviewId === review._id);

          return (
            <div key={review._id} className="flex gap-4 group">
              <Avatar className="w-10 h-10">
                <AvatarImage src={getAvatarUrl(review.user)} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{review.user?.name || "Deleted User"}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  {(session?.user?.id === (review.user?._id || review.user) || session?.user?.role === 'admin') && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(review._id)} 
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {review.rating > 0 && (
                    <div className="flex mb-1">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} 
                            />
                        ))}
                    </div>
                )}
                <p className="text-sm mt-1">{review.comment}</p>

                <button 
                  onClick={() => {
                    setReplyingTo(replyingTo === review._id ? null : review._id);
                    setReplyComment(`@${review.user?.name || 'User'} `);
                  }}
                  className="text-xs text-muted-foreground font-semibold hover:text-primary mt-2 flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" /> Reply
                </button>

                {/* Reply Form */}
                {replyingTo === review._id && (
                    <form onSubmit={(e) => handleSubmit(e, review._id)} className="flex gap-3 mt-4">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={session?.user?.image || session?.user?.avatar} />
                            <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                            <Input 
                              value={replyComment}
                              onChange={(e) => setReplyComment(e.target.value)}
                              className="h-9 text-sm"
                              autoFocus
                            />
                            <Button type="submit" size="sm" disabled={isSubmitting || !replyComment.trim()}>
                                {isSubmitting ? "..." : "Reply"}
                            </Button>
                        </div>
                    </form>
                )}

                {/* YouTube Style Thread */}
                {childReplies.length > 0 && (
                  <div className="mt-4 space-y-4 pl-4 sm:pl-10 border-l-2 border-secondary/20">
                    {childReplies.map(reply => (
                      <div key={reply._id} className="flex gap-3 relative group/reply">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={getAvatarUrl(reply.user)} />
                            <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-xs">{reply.user?.name || "Deleted User"}</span>
                                <span className="text-[10px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
                            </div>
                            {(session?.user?.id === (reply.user?._id || reply.user) || session?.user?.role === 'admin') && (
                              <button onClick={() => handleDelete(reply._id)} className="text-destructive opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm mt-0.5">
                             <span className="text-primary font-medium text-xs mr-1">@{review.user?.name || 'User'}</span>
                             {reply.comment}
                          </p>
                          
                          <button 
                            onClick={() => {
                                setReplyingTo(review._id); 
                                setReplyComment(`@${reply.user?.name || 'User'} `); 
                            }}
                            className="text-[10px] text-muted-foreground font-bold hover:text-primary mt-1"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {topLevelReviews.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10 border border-dashed rounded-xl">
            No discussions yet. Start the conversation!
        </p>
      )}
    </div>
  );
}