
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
    }
  }, [user]);

  // Calculate streak whenever study sessions change
  useEffect(() => {
    if (studySessions.length > 0) {
      calculateStreak();
    } else {
      setStreak(0);
    }
  }, [studySessions]);

  const fetchStudySessions = async () => {
    if (!user) return;

    try {
      console.log('Fetching study sessions for user:', user.id);
      
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched study sessions:', data);
      setStudySessions(data || []);
      
      // Calculate and log total study time
      const totalMinutes = (data || []).reduce((sum, session) => sum + (session.minutes_studied || 0), 0);
      const totalHours = Math.floor(totalMinutes / 60);
      console.log('Total study time:', totalMinutes, 'minutes =', totalHours, 'hours');
      
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      setStudySessions([]);
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

  const calculateStreak = () => {
    try {
      console.log('Calculating streak with sessions:', studySessions.length);
      
      if (studySessions.length === 0) {
        console.log('No study sessions found, streak = 0');
        setStreak(0);
        return;
      }

      // Sort sessions by date (most recent first)
      const sortedSessions = [...studySessions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      console.log('Sorted sessions:', sortedSessions.map(s => s.date));

      // Get unique dates (in case there are multiple sessions per day)
      const uniqueDates = [...new Set(sortedSessions.map(session => session.date))];
      console.log('Unique study dates:', uniqueDates);

      if (uniqueDates.length === 0) {
        setStreak(0);
        return;
      }

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      console.log('Today:', todayString, 'Yesterday:', yesterdayString);
      console.log('Most recent study date:', uniqueDates[0]);

      // Check if the most recent session is today or yesterday
      const mostRecentDate = uniqueDates[0];
      if (mostRecentDate !== todayString && mostRecentDate !== yesterdayString) {
        console.log('Most recent session is too old, streak broken');
        setStreak(0);
        return;
      }

      // Count consecutive days starting from the most recent
      let currentStreak = 0;
      let checkDate = new Date(mostRecentDate);
      
      for (const dateString of uniqueDates) {
        const sessionDate = new Date(dateString);
        const expectedDateString = checkDate.toISOString().split('T')[0];
        
        console.log('Checking date:', dateString, 'Expected:', expectedDateString);
        
        if (dateString === expectedDateString) {
          currentStreak++;
          console.log('Streak continues, current:', currentStreak);
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Gap found, break the streak
          console.log('Gap found, breaking streak');
          break;
        }
      }

      console.log('Final calculated streak:', currentStreak);
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
      
      console.log('Logging study session:', minutes, 'minutes for date:', today);
      
      const { error } = await supabase.rpc('increment_study_minutes', {
        p_user_id: user.id,
        p_date: today,
        p_minutes: minutes
      });

      if (error) throw error;

      console.log('Study session logged successfully');
      
      // Refresh data after logging
      await fetchStudySessions();
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

  // Helper function to get total study hours
  const getTotalStudyHours = () => {
    const totalMinutes = studySessions.reduce((sum, session) => sum + (session.minutes_studied || 0), 0);
    return Math.floor(totalMinutes / 60);
  };

  // Helper function to get total study minutes
  const getTotalStudyMinutes = () => {
    return studySessions.reduce((sum, session) => sum + (session.minutes_studied || 0), 0);
  };

  // Helper function to get weekly study progress
  const getWeeklyStudyProgress = () => {
    if (!studySessions.length) return { hours: 0, minutes: 0 };

    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    
    const thisWeekSessions = studySessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart;
    });

    const totalMinutes = thisWeekSessions.reduce((sum, session) => sum + (session.minutes_studied || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    console.log('Weekly study progress:', { totalMinutes, hours, minutes, sessionsCount: thisWeekSessions.length });
    
    return { hours, minutes };
  };

  const refetchProgress = async () => {
    await fetchStudySessions();
    await fetchCurrentGoals();
  };

  return {
    studySessions,
    currentGoals,
    streak,
    loading,
    logStudySession,
    updateWeeklyGoals,
    refetchProgress,
    getTotalStudyHours,
    getTotalStudyMinutes,
    getWeeklyStudyProgress
  };
};
