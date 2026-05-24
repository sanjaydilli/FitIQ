import { useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { askFitIQCoach, FoodLogItem } from '../services/aiService';
import { UserStats } from '../utils/warnings/warningTypes';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  error?: boolean;
}

const STORAGE_KEY = 'fitiq.coach.history';

// Module-scoped maps — never recreated on hook calls
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

type UserState = ReturnType<typeof useUser>['user'];

function buildUserStats(user: UserState): UserStats {
  const now = new Date();
  return {
    gender: user.sex,
    weight: user.weightKg,
    goal: GOAL_MAP[user.goal] ?? 'maintain',
    dietType: DIET_MAP[user.diet] ?? 'vegetarian',
    // Placeholder nutrition until food log is wired up
    calories: 1847,
    targetCalories: 2340,
    protein: 102,
    targetProtein: 142,
    carbs: 210,
    fat: 58,
    fiber: 22,
    water: 1.75,
    targetWater: 3.5,
    mealCount: 3,
    lastMealMinutesAgo: 90,
    ironIntake: 12,
    magnesiumIntake: 280,
    omega3Intake: 0.8,
    zincIntake: 7,
    teaLoggedMinutesAgo: 0,
    ironRichMealLogged: true,
    postWorkoutMealLogged: false,
    oilTracked: true,
    takingB12: false,
    takingVitaminD: false,
    muscleCramps: false,
    sleepQuality: 'good',
    consecutiveLowIronDays: 0,
    consecutiveLowMagDays: 0,
    consecutiveLowOmega3Days: 2,
    consecutiveLowZincDays: 1,
    steps: 7420,
    targetSteps: 10000,
    workoutMinutesAgo: 0,
    nextWorkoutMinutes: 480,
    consecutiveWorkoutDays: 3,
    weeksSinceDeload: 4,
    lastNightSleep: 7,
    strengthTrend: 'up',
    currentHour: now.getHours(),
    currentMonth: now.getMonth() + 1,
  };
}

const EMPTY_FOOD_LOG: FoodLogItem[] = [];

export function useAICoach(liveStats?: Partial<UserStats>) {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const stats = { ...buildUserStats(user), ...liveStats };
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
            'Unable to reach AI Coach. Please check your internet connection and try again.',
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
    [user, loading, liveStats]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, sendMessage, loading, error, clearHistory };
}
