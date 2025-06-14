import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StudySession {
  id: string;
  date: string;
  minutes_studied: number;
  created_at: string;
}

interface WeeklyGoals {
  study_hours_goal: number;
  lessons_goal: number;
  assignments_goal: number;
}

export const useStudentProgress = () => {
  const { user } = useAuth();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [currentGoals, setCurrentGoals] = useState<WeeklyGoals | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudySessions();
      fetchCurrentGoals();
      calculateStreak();
    }
  }, [user]);

  const fetchStudySessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setStudySessions(data || []);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    }
  };

  const fetchCurrentGoals = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const weekStartString = weekStart.toISOString().split('T')[0];

      // First, try to get existing goals
      const { data: existingGoals, error: selectError } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartString)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (existingGoals) {
        setCurrentGoals(existingGoals);
      } else {
        // Create default goals if none exist
        const defaultGoals = {
          study_hours_goal: 15,
          lessons_goal: 10,
          assignments_goal: 3
        };
        
        // Use upsert to handle potential race conditions
        const { data: newGoals, error: upsertError } = await supabase
          .from('weekly_goals')
          .upsert({
            user_id: user.id,
            week_start_date: weekStartString,
            ...defaultGoals
          }, {
            onConflict: 'user_id,week_start_date'
          })
          .select()
          .single();

        if (upsertError) {
          console.error('Error creating weekly goals:', upsertError);
          // If upsert fails due to constraint, try to fetch existing record
          const { data: fallbackGoals } = await supabase
            .from('weekly_goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('week_start_date', weekStartString)
            .single();
          
          setCurrentGoals(fallbackGoals || defaultGoals);
        } else {
          setCurrentGoals(newGoals);
        }
      }
    } catch (error) {
      console.error('Error fetching current goals:', error);
      // Set default goals on error
      setCurrentGoals({
        study_hours_goal: 15,
        lessons_goal: 10,
        assignments_goal: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = async () => {
    if (!user) return;

    try {
      const sessions = studySessions;
      if (sessions.length === 0) {
        setStreak(0);
        return;
      }

      // Sort sessions by date
      const sortedSessions = sessions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      let currentStreak = 0;
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Check if there's a session today or yesterday
      const latestSession = sortedSessions[0];
      const latestDate = new Date(latestSession.date);
      const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        setStreak(0);
        return;
      }

      // Count consecutive days
      let checkDate = new Date(latestSession.date);
      for (const session of sortedSessions) {
        const sessionDate = new Date(session.date);
        const expectedDateString = checkDate.toISOString().split('T')[0];
        const sessionDateString = sessionDate.toISOString().split('T')[0];
        
        if (sessionDateString === expectedDateString) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
      setStreak(0);
    }
  };

  const logStudySession = async (minutes: number) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase.rpc('increment_study_minutes', {
        p_user_id: user.id,
        p_date: today,
        p_minutes: minutes
      });

      if (error) throw error;

      await fetchStudySessions();
      await calculateStreak();
    } catch (error) {
      console.error('Error logging study session:', error);
    }
  };

  const updateWeeklyGoals = async (goals: WeeklyGoals) => {
    if (!user) return;

    try {
      const today = new Date();
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const weekStartString = weekStart.toISOString().split('T')[0];

      const { error } = await supabase
        .from('weekly_goals')
        .upsert({
          user_id: user.id,
          week_start_date: weekStartString,
          ...goals
        }, {
          onConflict: 'user_id,week_start_date'
        });

      if (error) throw error;

      setCurrentGoals(goals);
    } catch (error) {
      console.error('Error updating weekly goals:', error);
      throw error;
    }
  };

  const refetchProgress = async () => {
    await fetchStudySessions();
    await fetchCurrentGoals();
    await calculateStreak();
  };

  return {
    studySessions,
    currentGoals,
    streak,
    loading,
    logStudySession,
    updateWeeklyGoals,
    refetchProgress
  };
};
