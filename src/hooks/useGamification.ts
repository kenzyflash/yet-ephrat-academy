
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useGamification = () => {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    if (user) {
      fetchUserPoints();
      
      // Listen for real-time updates
      const channel = supabase
        .channel('user-points-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_points',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('User points updated:', payload);
            if (payload.new && typeof payload.new === 'object') {
              const newData = payload.new as any;
              setUserPoints(newData.total_points || 0);
              setUserLevel(newData.level || 1);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (!user) return;

    try {
      // Try direct table access since types might not be updated yet
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points' as any)
        .select('total_points, level')
        .eq('user_id', user.id)
        .single();
      
      if (pointsData && !pointsError) {
        setUserPoints(pointsData.total_points || 0);
        setUserLevel(pointsData.level || 1);
        return;
      }

      // If no user_points record exists, create one
      if (pointsError && pointsError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_points' as any)
          .insert({
            user_id: user.id,
            total_points: 0,
            level: 1
          });
        
        if (!insertError) {
          setUserPoints(0);
          setUserLevel(1);
        }
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const awardAchievement = async (achievementName: string) => {
    if (!user) return false;

    try {
      // Direct SQL query since function might not exist yet
      const { data: achievement } = await supabase
        .from('achievements' as any)
        .select('*')
        .eq('name', achievementName)
        .single();

      if (!achievement) return false;

      // Check if user already has this achievement
      const { data: existingAward } = await supabase
        .from('user_achievements' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('achievement_id', achievement.id)
        .single();

      if (existingAward) return false; // Already has achievement

      // Award the achievement
      const { error: awardError } = await supabase
        .from('user_achievements' as any)
        .insert({
          user_id: user.id,
          achievement_id: achievement.id
        });

      if (awardError) {
        console.error('Error awarding achievement:', awardError);
        return false;
      }

      // Update user points
      const { error: pointsError } = await supabase
        .from('user_points' as any)
        .upsert({
          user_id: user.id,
          total_points: userPoints + achievement.points,
          level: Math.floor((userPoints + achievement.points) / 50) + 1
        });

      if (!pointsError) {
        setUserPoints(prev => prev + achievement.points);
        setUserLevel(Math.floor((userPoints + achievement.points) / 50) + 1);
      }

      return true;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  };

  return {
    userPoints,
    userLevel,
    awardAchievement,
    refreshPoints: fetchUserPoints
  };
};
