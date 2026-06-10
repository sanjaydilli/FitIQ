import { UserStats } from '../utils/warnings/warningTypes';

export interface FoodLogItem {
  name: string;
  grams?: number;
  meal?: string;
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
  foodLog: FoodLogItem[],
  question: string,
  userName?: string,
): Promise<string> {
  const trimmedName = (userName ?? '').trim();

  // Inline the day's actual meals so the model can reason about WHAT was
  // eaten, not just the totals. Works with the existing server unchanged.
  const logBlock = foodLog.length > 0
    ? `TODAY'S FOOD LOG (already eaten):\n${foodLog
        .map(f => `- ${f.meal ? `[${f.meal}] ` : ''}${f.name}: ${f.calories} kcal, ${f.protein}g protein, ${f.carbs}g carbs, ${f.fat}g fat`)
        .join('\n')}\n\n`
    : `TODAY'S FOOD LOG: nothing logged yet.\n\n`;

  const res = await fetch(`${getApiUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `${logBlock}USER QUESTION: ${question}`,
      foodLog,
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
