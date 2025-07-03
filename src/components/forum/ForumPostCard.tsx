
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle, Clock } from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  reply_count?: number;
  author_name?: string;
}

interface ForumPostCardProps {
  post: ForumPost;
  onClick: () => void;
}

const ForumPostCard = ({ post, onClick }: ForumPostCardProps) => {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300 bg-white/90 backdrop-blur-sm"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-800 mb-1">{post.title}</CardTitle>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>by {post.author_name || 'Anonymous'}</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm mb-4 line-clamp-3">
          {post.content}
        </CardDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-green-600">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">{post.upvotes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <ThumbsDown className="h-4 w-4" />
              <span className="text-sm">{post.downvotes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.reply_count || 0} replies</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumPostCard;
