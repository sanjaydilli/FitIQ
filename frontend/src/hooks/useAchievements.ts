import { useMemo } from 'react';
import { localDateStr, formatLocalDate } from '../utils/date';
import { useWorkoutLog } from './useWorkoutLog';
import { useFoodLog } from './useFoodLog';
import { useBodyComp } from './useBodyComp';
import { useUser } from '../context/UserContext';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'workout' | 'nutrition' | 'consistency' | 'body' | 'level';
  unlocked: boolean;
  progress?: number;   // 0-100
  progressLabel?: string;
  xpReward: number;
}

export function useAchievements(): Achievement[] {
  const { user } = useUser();
  const { sessions, personalRecords } = useWorkoutLog();
  const { entries, activeDays } = useFoodLog();
  const { measurements } = useBodyComp();

  return useMemo((): Achievement[] => {
    const sessionCount = sessions.length;
    const prCount = Object.keys(personalRecords).length;
    const foodDays = activeDays.size;
    const measureCount = measurements.length;
    const totalVolume = sessions.reduce((s, sess) => s + sess.totalVolume, 0);

    // Consecutive streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = formatLocalDate(d);
      if (activeDays.has(ds) || sessions.some(s => s.date === ds)) streak++;
      else if (i > 0) break;
    }

    return [
      // Workout
      {
        id: 'first_workout', icon: '🏋️', title: 'First Rep', description: 'Complete your first workout',
        category: 'workout', unlocked: sessionCount >= 1, xpReward: 50,
        progress: Math.min(100, sessionCount * 100), progressLabel: `${sessionCount}/1`,
      },
      {
        id: 'workouts_5', icon: '💪', title: 'Getting Serious', description: '5 workouts logged',
        category: 'workout', unlocked: sessionCount >= 5, xpReward: 100,
        progress: Math.min(100, (sessionCount / 5) * 100), progressLabel: `${sessionCount}/5`,
      },
      {
        id: 'workouts_10', icon: '🔥', title: 'On a Roll', description: '10 workouts completed',
        category: 'workout', unlocked: sessionCount >= 10, xpReward: 200,
        progress: Math.min(100, (sessionCount / 10) * 100), progressLabel: `${sessionCount}/10`,
      },
      {
        id: 'workouts_25', icon: '⚡', title: 'Committed', description: '25 workouts — you mean business',
        category: 'workout', unlocked: sessionCount >= 25, xpReward: 500,
        progress: Math.min(100, (sessionCount / 25) * 100), progressLabel: `${sessionCount}/25`,
      },
      {
        id: 'volume_1000', icon: '🏆', title: 'Ton Club', description: 'Lift 1,000kg total volume',
        category: 'workout', unlocked: totalVolume >= 1000, xpReward: 150,
        progress: Math.min(100, (totalVolume / 1000) * 100),
        progressLabel: `${(totalVolume / 1000).toFixed(1)}/1t`,
      },
      {
        id: 'first_pr', icon: '🥇', title: 'Personal Best', description: 'Set your first personal record',
        category: 'workout', unlocked: prCount >= 1, xpReward: 75,
        progress: Math.min(100, prCount * 100), progressLabel: `${prCount}/1`,
      },
      {
        id: 'pr_5', icon: '🏅', title: 'PR Machine', description: '5 personal records across exercises',
        category: 'workout', unlocked: prCount >= 5, xpReward: 200,
        progress: Math.min(100, (prCount / 5) * 100), progressLabel: `${prCount}/5`,
      },
      // Nutrition
      {
        id: 'first_log', icon: '🍽', title: 'Food Tracker', description: 'Log your first meal',
        category: 'nutrition', unlocked: entries.length >= 1, xpReward: 30,
        progress: Math.min(100, entries.length * 100), progressLabel: `${entries.length}/1`,
      },
      {
        id: 'log_7days', icon: '📋', title: 'Macro Mindful', description: 'Log food for 7 different days',
        category: 'nutrition', unlocked: foodDays >= 7, xpReward: 150,
        progress: Math.min(100, (foodDays / 7) * 100), progressLabel: `${foodDays}/7 days`,
      },
      {
        id: 'log_30days', icon: '🥗', title: 'Nutrition Master', description: 'Log food for 30 days',
        category: 'nutrition', unlocked: foodDays >= 30, xpReward: 400,
        progress: Math.min(100, (foodDays / 30) * 100), progressLabel: `${foodDays}/30 days`,
      },
      // Body
      {
        id: 'first_measure', icon: '📊', title: 'Body Aware', description: 'Log your first body measurement',
        category: 'body', unlocked: measureCount >= 1, xpReward: 50,
        progress: Math.min(100, measureCount * 100), progressLabel: `${measureCount}/1`,
      },
      {
        id: 'measure_4', icon: '📈', title: 'Tracking Progress', description: '4 body comp measurements',
        category: 'body', unlocked: measureCount >= 4, xpReward: 150,
        progress: Math.min(100, (measureCount / 4) * 100), progressLabel: `${measureCount}/4`,
      },
      // Consistency
      {
        id: 'streak_3', icon: '🔆', title: 'Starting Streak', description: '3-day active streak',
        category: 'consistency', unlocked: streak >= 3, xpReward: 75,
        progress: Math.min(100, (streak / 3) * 100), progressLabel: `${streak}/3 days`,
      },
      {
        id: 'streak_7', icon: '🌟', title: 'Week Warrior', description: '7-day streak — full week',
        category: 'consistency', unlocked: streak >= 7, xpReward: 200,
        progress: Math.min(100, (streak / 7) * 100), progressLabel: `${streak}/7 days`,
      },
      {
        id: 'streak_30', icon: '💎', title: 'Unstoppable', description: '30-day streak',
        category: 'consistency', unlocked: streak >= 30, xpReward: 1000,
        progress: Math.min(100, (streak / 30) * 100), progressLabel: `${streak}/30 days`,
      },
      // Level
      {
        id: 'level_2', icon: '🌱', title: 'Rising', description: 'Reach Level 2',
        category: 'level', unlocked: user.level >= 2, xpReward: 0,
        progress: Math.min(100, ((user.xp - 0) / 1000) * 100), progressLabel: `${user.xp}/1000 XP`,
      },
      {
        id: 'level_5', icon: '🚀', title: 'Athlete', description: 'Reach Level 5',
        category: 'level', unlocked: user.level >= 5, xpReward: 0,
        progress: Math.min(100, (user.xp / 4000) * 100), progressLabel: `${user.xp}/4000 XP`,
      },
      {
        id: 'level_10', icon: '👑', title: 'Legend', description: 'Reach Level 10',
        category: 'level', unlocked: user.level >= 10, xpReward: 0,
        progress: Math.min(100, (user.xp / 9000) * 100), progressLabel: `${user.xp}/9000 XP`,
      },
    ];
  }, [sessions, personalRecords, entries, activeDays, measurements, user.level, user.xp]);
}
