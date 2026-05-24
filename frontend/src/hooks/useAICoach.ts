import { useState, useCallback, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useFoodLog } from './useFoodLog';
import { useBodyComp } from './useBodyComp';
import { useWorkoutLog } from './useWorkoutLog';
import { askFitIQCoach, FoodLogItem } from '../services/aiService';
import { UserStats } from '../utils/warnings/warningTypes';
import { goalCalorieAdjust } from '../utils/bodyComposition';
import { WATER_DROP_ML, WATER_SLOT_CAPACITY } from '../context/UserContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  error?: boolean;
}

const STORAGE_KEY = 'fitiq.coach.history';

const GOAL_MAP: Record<string, UserStats['goal']> = {
  lose: 'fatLoss', gain: 'muscle', endur: 'maintain', main: 'maintain',
};
const DIET_MAP: Record<string, UserStats['dietType']> = {
  veg: 'vegetarian', eggetarian: 'eggetarian', nveg: 'nonveg', vegan: 'vegan', jain: 'jain',
};
const MAX_HISTORY = 50;

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)));
  } catch { /* ignore quota errors */ }
}

const EMPTY_FOOD_LOG: FoodLogItem[] = [];

export function useAICoach(liveStats?: Partial<UserStats>) {
  const { user } = useUser();
  const { todayTotals } = useFoodLog();
  const { tdee } = useBodyComp();
  const { sessions } = useWorkoutLog();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo((): UserStats => {
    const now = new Date();
    const targetCalories = (tdee || Math.round(user.weightKg * 30)) + goalCalorieAdjust(user.goal);
    const targetProtein = Math.round(user.weightKg * 2);
    const totalWaterCups = WATER_SLOT_CAPACITY.reduce((a, b) => a + b, 0);
    const filledCups = user.waterDrops.reduce((a, b) => a + b, 0);
    const waterLitres = Math.round((filledCups * WATER_DROP_ML) / 100) / 10;
    const targetWater = Math.round((user.weightKg * 35) / 100) / 10; // ~35ml/kg
    const mealCount = new Set(todayTotals.entries.map(e => e.meal)).size;

    // Estimate minutes since last meal from most recent food log entry timestamp
    const lastMealMs = todayTotals.entries.reduce((max, e) => {
      const ts = (e as { timestamp?: number }).timestamp;
      return ts && ts > max ? ts : max;
    }, 0);
    const lastMealMinutesAgo = lastMealMs > 0
      ? Math.round((Date.now() - lastMealMs) / 60000)
      : 120;

    const todayISO = now.toISOString().slice(0, 10);
    const lastSession = sessions.filter(s => s.date === todayISO)[0];
    const workoutMinutesAgo = lastSession
      ? Math.round((Date.now() - new Date(lastSession.date + 'T12:00:00').getTime()) / 60000)
      : 0;

    return {
      gender: user.sex,
      weight: user.weightKg,
      goal: GOAL_MAP[user.goal] ?? 'maintain',
      dietType: DIET_MAP[user.diet] ?? 'vegetarian',
      calories: todayTotals.calories,
      targetCalories,
      protein: todayTotals.protein,
      targetProtein,
      carbs: todayTotals.carbs,
      fat: todayTotals.fat,
      fiber: 0,
      water: waterLitres,
      targetWater,
      mealCount,
      lastMealMinutesAgo,
      ironIntake: 0,
      magnesiumIntake: 0,
      omega3Intake: 0,
      zincIntake: 0,
      teaLoggedMinutesAgo: 0,
      ironRichMealLogged: false,
      postWorkoutMealLogged: false,
      oilTracked: false,
      takingB12: false,
      takingVitaminD: false,
      muscleCramps: false,
      sleepQuality: 'good',
      consecutiveLowIronDays: 0,
      consecutiveLowMagDays: 0,
      consecutiveLowOmega3Days: 0,
      consecutiveLowZincDays: 0,
      steps: user.steps,
      targetSteps: user.stepGoal,
      workoutMinutesAgo,
      nextWorkoutMinutes: 480,
      consecutiveWorkoutDays: user.streak,
      weeksSinceDeload: 4,
      lastNightSleep: 7,
      strengthTrend: 'up',
      currentHour: now.getHours(),
      currentMonth: now.getMonth() + 1,
      ...liveStats,
    };
  }, [user, todayTotals, tdee, sessions, liveStats]);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages(prev => {
        const next = [...prev, userMsg];
        saveHistory(next);
        return next;
      });
      setLoading(true);
      setError(null);

      try {
        const reply = await askFitIQCoach(stats, EMPTY_FOOD_LOG, trimmed);

        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        };
        setMessages(prev => {
          const next = [...prev, aiMsg];
          saveHistory(next);
          return next;
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        const errMsg: ChatMessage = {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content:
            'Unable to reach FitIQ server. Please check your internet connection and try again.',
          timestamp: Date.now(),
          error: true,
        };
        setMessages(prev => {
          const next = [...prev, errMsg];
          saveHistory(next);
          return next;
        });
      } finally {
        setLoading(false);
      }
    },
    [stats, loading]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, sendMessage, loading, error, clearHistory };
}
