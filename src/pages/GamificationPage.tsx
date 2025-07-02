
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AchievementCard from "@/components/gamification/AchievementCard";
import UserProgress from "@/components/gamification/UserProgress";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Trophy, Award } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  earned_at?: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  achievementCount: number;
}

const GamificationPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalPoints: 0, level: 1, achievementCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements' as any)
        .select('*')
        .order('category', { ascending: true });

      if (!achievementsError && allAchievements && Array.isArray(allAchievements)) {
        setAchievements(allAchievements as Achievement[]);
      } else {
        console.log('Achievements table not ready yet');
        setAchievements([]);
      }

      // Fetch user achievements
      const { data: userAchievementData, error: userAchievementsError } = await supabase
        .from('user_achievements' as any)
        .select(`
          earned_at,
          achievement_id
        `)
        .eq('user_id', user?.id);

      if (!userAchievementsError && userAchievementData && Array.isArray(userAchievementData) && Array.isArray(allAchievements)) {
        // Match user achievements with achievement details
        const earnedAchievements = userAchievementData
          .map((userAch: any) => {
            if (userAch && typeof userAch === 'object' && 'achievement_id' in userAch) {
              const achievement = allAchievements.find((ach: any) => ach && typeof ach === 'object' && ach.id === userAch.achievement_id);
              return achievement ? { ...achievement, earned_at: userAch.earned_at } : null;
            }
            return null;
          })
          .filter(Boolean) as Achievement[];
        
        setUserAchievements(earnedAchievements);
      } else {
        setUserAchievements([]);
      }

      // Fetch user points
      const { data: userPoints, error: pointsError } = await supabase
        .from('user_points' as any)
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (!pointsError && userPoints && typeof userPoints === 'object' && 'total_points' in userPoints) {
        setUserStats({
          totalPoints: (userPoints as any).total_points || 0,
          level: (userPoints as any).level || 1,
          achievementCount: userAchievements.length
        });
      } else {
        // Create initial user points record
        await supabase
          .from('user_points' as any)
          .insert({
            user_id: user?.id,
            total_points: 0,
            level: 1
          });
        
        setUserStats({
          totalPoints: 0,
          level: 1,
          achievementCount: 0
        });
      }

    } catch (error) {
      console.error('Error fetching gamification data:', error);
      // Set default values when database isn't ready
      setAchievements([]);
      setUserAchievements([]);
      setUserStats({ totalPoints: 0, level: 1, achievementCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.id === achievementId);
  };

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(a => a.category === category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <DashboardHeader title="SafHub - Achievements" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading achievements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <DashboardHeader title="SafHub - Achievements" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Achievements</h1>
          <p className="text-gray-600">Track your progress and unlock new achievements as you learn!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <UserProgress 
              totalPoints={userStats.totalPoints}
              level={userStats.level}
              achievements={userStats.achievementCount}
            />
          </div>
          
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                {userAchievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userAchievements.slice(0, 4).map((achievement) => (
                      <AchievementCard 
                        key={achievement.id} 
                        achievement={achievement} 
                        isEarned={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No achievements yet. Start learning to earn your first achievement!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="milestone">Milestones</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="consistency">Consistency</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement}
                  isEarned={isAchievementEarned(achievement.id)}
                />
              ))}
            </div>
          </TabsContent>

          {['milestone', 'learning', 'consistency', 'community'].map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAchievementsByCategory(category).map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    isEarned={isAchievementEarned(achievement.id)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default GamificationPage;
