import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Streamdown } from "streamdown";
import { Calendar, Clock, Tag, Heart, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type BlogPostItem = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: "DevOps" | "IoT" | "Full Stack" | "Architecture";
  tags: string;
  coverImage?: string | null;
  readTime: string;
  likes: number;
  createdAt: Date | string;
};

interface BlogPostModalProps {
  post: BlogPostItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogPostModal({ post, isOpen, onClose }: BlogPostModalProps) {
  const [localLikes, setLocalLikes] = useState(post?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  
  const utils = trpc.useUtils();
  
  const { data: comments, refetch: refetchComments } = trpc.portfolio.getBlogComments.useQuery(
    { blogId: post?.id || 0 },
    { enabled: !!post?.id && isOpen }
  );
  
  const likeMutation = trpc.portfolio.likeBlogPost.useMutation({
    onSuccess: (data) => {
      setLocalLikes(data.likes);
      utils.portfolio.getBlogPosts.invalidate();
    }
  });
  
  const commentMutation = trpc.portfolio.addBlogComment.useMutation({
    onSuccess: () => {
      setCommentName("");
      setCommentBody("");
      refetchComments();
    }
  });

  useEffect(() => {
    if (post && isOpen) {
      setLocalLikes(post.likes);
      setHasLiked(false);
    }
  }, [post, isOpen]);

  const handleLike = () => {
    if (post && !hasLiked) {
      setHasLiked(true);
      setLocalLikes(prev => prev + 1);
      likeMutation.mutate({ id: post.id });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (post && commentName.trim() && commentBody.trim()) {
      commentMutation.mutate({
        blogId: post.id,
        name: commentName.trim(),
        content: commentBody.trim(),
      });
    }
  };

  if (!post) return null;

  const tagList = post.tags.split(",").map(t => t.trim()).filter(Boolean);
  const dateFormatted = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider">
              {post.category}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Calendar className="w-3.5 h-3.5" /> {dateFormatted}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
          </div>
          <DialogTitle className="text-3xl font-serif font-bold tracking-tight text-left">
            {post.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base pt-2 text-left">
            {post.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {post.coverImage && (
            <div className="rounded-lg overflow-hidden border border-border shadow-md aspect-[21/9] relative">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article markdown content */}
          <div className="prose dark:prose-invert max-w-none pt-4 border-t border-border text-foreground">
            <Streamdown>{post.content}</Streamdown>
          </div>

          {/* Tags footer */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-border">
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1 mr-2">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {tagList.map((tag, i) => (
              <Badge key={i} variant="secondary" className="font-mono text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Interaction Section */}
          <div className="pt-6 mt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                disabled={hasLiked}
                className={`gap-2 ${hasLiked ? 'text-red-500 border-red-500/50 bg-red-500/10' : ''}`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                {localLikes} {localLikes === 1 ? 'Like' : 'Likes'}
              </Button>
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                {comments?.length || 0} Comments
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-8">
            <h3 className="text-xl font-serif font-semibold mb-6">Discussion</h3>
            
            <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8 bg-muted/30 p-4 sm:p-6 rounded-lg border border-border">
              <div className="space-y-2">
                <Input
                  placeholder="Your Name"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  maxLength={50}
                  required
                  className="max-w-xs bg-background"
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  maxLength={1000}
                  required
                  rows={3}
                  className="bg-background resize-none"
                />
              </div>
              <Button type="submit" disabled={commentMutation.isPending || !commentName.trim() || !commentBody.trim()}>
                {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>

            <div className="space-y-6">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-border/50 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{comment.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic">No comments yet. Be the first to start the discussion!</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
