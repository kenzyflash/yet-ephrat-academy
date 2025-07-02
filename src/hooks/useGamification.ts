
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
            if (payload.new) {
              setUserPoints(payload.new.total_points);
              setUserLevel(payload.new.level);
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
      const { data, error } = await supabase
        .from('user_points')
        .select('total_points, level')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user points:', error);
        return;
      }

      if (data) {
        setUserPoints(data.total_points);
        setUserLevel(data.level);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const awardAchievement = async (achievementName: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('award_achievement', {
        user_id_param: user.id,
        achievement_name_param: achievementName
      });

      if (error) {
        console.error('Error awarding achievement:', error);
        return false;
      }

      return data;
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
