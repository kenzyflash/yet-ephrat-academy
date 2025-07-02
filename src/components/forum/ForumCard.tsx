
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Clock } from "lucide-react";

interface Forum {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  post_count?: number;
}

interface ForumCardProps {
  forum: Forum;
  onClick: () => void;
}

const ForumCard = ({ forum, onClick }: ForumCardProps) => {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-300 bg-white/80 backdrop-blur-sm"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-800 mb-1">{forum.title}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {forum.category}
            </Badge>
          </div>
          <MessageSquare className="h-5 w-5 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm mb-3">
          {forum.description}
        </CardDescription>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{forum.post_count || 0} posts</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(forum.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumCard;
