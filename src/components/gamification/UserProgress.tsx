
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy } from "lucide-react";

interface UserProgressProps {
  totalPoints: number;
  level: number;
  achievements: number;
}

const UserProgress = ({ totalPoints, level, achievements }: UserProgressProps) => {
  const getLevelProgress = () => {
    const levelThresholds = [0, 50, 150, 300, 500];
    const currentThreshold = levelThresholds[level - 1] || 0;
    const nextThreshold = levelThresholds[level] || 1000;
    const progress = ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getNextLevelPoints = () => {
    const levelThresholds = [0, 50, 150, 300, 500];
    return levelThresholds[level] || 1000;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your Progress
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-800">
            Level {level}
          </Badge>
        </div>
        <CardDescription>
          Keep learning to unlock new achievements!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Points: {totalPoints}</span>
            <span>Next Level: {getNextLevelPoints()}</span>
          </div>
          <Progress value={getLevelProgress()} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{achievements}</p>
            <p className="text-xs text-gray-600">Achievements</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <Star className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{totalPoints}</p>
            <p className="text-xs text-gray-600">Total Points</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProgress;
