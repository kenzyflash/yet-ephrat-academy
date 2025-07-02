
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  earned_at?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  isEarned?: boolean;
}

const AchievementCard = ({ achievement, isEarned = false }: AchievementCardProps) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="h-8 w-8" />;
      case 'star':
        return <Star className="h-8 w-8" />;
      default:
        return <Trophy className="h-8 w-8" />;
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isEarned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-full ${isEarned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
            {getIcon(achievement.icon)}
          </div>
          <Badge variant={isEarned ? "default" : "secondary"}>
            {achievement.points} pts
          </Badge>
        </div>
        <CardTitle className="text-lg">{achievement.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">
          {achievement.description}
        </CardDescription>
        {isEarned && achievement.earned_at && (
          <p className="text-xs text-green-600 mt-2">
            Earned on {new Date(achievement.earned_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
