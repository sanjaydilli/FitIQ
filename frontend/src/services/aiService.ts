import { UserStats } from '../utils/warnings/warningTypes';

export interface FoodLogItem {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const API_KEY = 'fitiq.server.api';
const DEFAULT_API = process.env.REACT_APP_API_URL || 'https://fitiq-production-60af.up.railway.app';

export function getApiUrl(): string {
  return localStorage.getItem(API_KEY)?.replace(/\/$/, '') || DEFAULT_API;
}

export function setApiUrl(url: string): void {
  localStorage.setItem(API_KEY, url.replace(/\/$/, ''));
}

const GOAL_LABEL: Record<UserStats['goal'], string> = {
  fatLoss: 'Fat Loss', muscle: 'Muscle Gain',
  recomp: 'Body Recomposition', maintain: 'Weight Maintenance',
};

export async function askFitIQCoach(
  userStats: UserStats,
  _foodLog: FoodLogItem[],
  question: string,
  userName?: string,
): Promise<string> {
  const trimmedName = (userName ?? '').trim();
  const res = await fetch(`${getApiUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: question,
      userStats: {
        name:                   trimmedName || 'User',
        gender:                 userStats.gender,
        weightKg:               userStats.weight,
        goal:                   GOAL_LABEL[userStats.goal],
        dietType:               userStats.dietType,
        calories:               userStats.calories,
        targetCalories:         userStats.targetCalories,
        protein:                userStats.protein,
        targetProtein:          userStats.targetProtein,
        carbs:                  userStats.carbs,
        fat:                    userStats.fat,
        water:                  userStats.water,
        targetWater:            userStats.targetWater,
        steps:                  userStats.steps,
        workoutMinutesAgo:      userStats.workoutMinutesAgo,
        consecutiveWorkoutDays: userStats.consecutiveWorkoutDays,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const data = await res.json() as { reply: string };
  return data.reply;
}
