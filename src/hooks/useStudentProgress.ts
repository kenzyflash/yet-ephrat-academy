
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudySession {
  id: string;
  user_id: string;
  date: string;
  minutes_studied: number;
  created_at: string;
}

export interface WeeklyGoal {
  id: string;
  user_id: string;
  study_hours_goal: number;
  lessons_goal: number;
  assignments_goal: number;
  week_start_date: string;
  created_at: string;
}

export const useStudentProgress = () => {
  const { user } = useAuth();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [currentGoals, setCurrentGoals] = useState<WeeklyGoal | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStudySessions();
      fetchCurrentGoals();
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
      calculateStreak(data || []);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    }
  };

  const calculateStreak = (sessions: StudySession[]) => {
    if (sessions.length === 0) {
      setStreak(0);
      return;
    }

    let streakCount = 0;
    const today = new Date();
    let currentDate = new Date(today);

    // Start from today and go backwards
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].date);
      const currentDateStr = currentDate.toISOString().split('T')[0];
      const sessionDateStr = sessionDate.toISOString().split('T')[0];

      if (currentDateStr === sessionDateStr) {
        streakCount++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // If we find a gap, break the streak
        break;
      }
    }

    setStreak(streakCount);
  };

  const logStudySession = async (minutesStudied: number) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase
        .from('study_sessions')
        .upsert({
          user_id: user.id,
          date: today,
          minutes_studied: minutesStudied
        });

      if (error) throw error;
      await fetchStudySessions();
    } catch (error) {
      console.error('Error logging study session:', error);
    }
  };

  const fetchCurrentGoals = async () => {
    if (!user) return;

    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentGoals(data);
    } catch (error) {
      console.error('Error fetching current goals:', error);
    }
  };

  const updateWeeklyGoals = async (goals: Partial<WeeklyGoal>) => {
    if (!user) return;

    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    try {
      const { error } = await supabase
        .from('weekly_goals')
        .upsert({
          user_id: user.id,
          week_start_date: weekStartStr,
          study_hours_goal: goals.study_hours_goal || 15,
          lessons_goal: goals.lessons_goal || 10,
          assignments_goal: goals.assignments_goal || 3
        });

      if (error) throw error;
      await fetchCurrentGoals();
    } catch (error) {
      console.error('Error updating weekly goals:', error);
    }
  };

  return {
    studySessions,
    currentGoals,
    streak,
    logStudySession,
    updateWeeklyGoals,
    refetchProgress: fetchStudySessions
  };
};
