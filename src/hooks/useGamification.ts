
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
      // Use a raw SQL query since the table might not be in types yet
      const { data, error } = await supabase
        .rpc('get_user_points', { user_id_param: user.id })
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user points:', error);
        // Try direct table access as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_points' as any)
          .select('total_points, level')
          .eq('user_id', user.id)
          .single();
        
        if (fallbackData && !fallbackError) {
          setUserPoints(fallbackData.total_points || 0);
          setUserLevel(fallbackData.level || 1);
        }
        return;
      }

      if (data) {
        setUserPoints(data.total_points || 0);
        setUserLevel(data.level || 1);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const awardAchievement = async (achievementName: string) => {
    if (!user) return false;

    try {
      // Use direct function call for now
      const { data, error } = await supabase.rpc('award_achievement', {
        user_id_param: user.id,
        achievement_name_param: achievementName
      });

      if (error) {
        console.error('Error awarding achievement:', error);
        return false;
      }

      // Refresh points after awarding achievement
      fetchUserPoints();
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
