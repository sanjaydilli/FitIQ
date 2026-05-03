export interface UserStats {
  // Basic
  gender: 'male' | 'female';
  weight: number;
  goal: 'fatLoss' | 'muscle' | 'recomp' | 'maintain';
  dietType: 'vegetarian' | 'vegan' | 'nonveg' | 'eggetarian' | 'jain';

  // Today nutrition
  calories: number;
  targetCalories: number;
  protein: number;
  targetProtein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  targetWater: number;
  mealCount: number;
  lastMealMinutesAgo: number;

  // Micronutrients
  ironIntake: number;
  magnesiumIntake: number;
  omega3Intake: number;
  zincIntake: number;

  // Flags
  teaLoggedMinutesAgo: number;
  ironRichMealLogged: boolean;
  postWorkoutMealLogged: boolean;
  oilTracked: boolean;
  takingB12: boolean;
  takingVitaminD: boolean;
  muscleCramps: boolean;
  sleepQuality: 'good' | 'average' | 'poor';

  // Consecutive day counters
  consecutiveLowIronDays: number;
  consecutiveLowMagDays: number;
  consecutiveLowOmega3Days: number;
  consecutiveLowZincDays: number;

  // Activity
  steps: number;
  targetSteps: number;
  workoutMinutesAgo: number;
  nextWorkoutMinutes: number;
  consecutiveWorkoutDays: number;
  weeksSinceDeload: number;

  // Recovery
  lastNightSleep: number;
  strengthTrend: 'up' | 'stable' | 'down';

  // Time
  currentHour: number;
  currentMonth: number;
}

export interface Warning {
  id: string;
  priority: number;
  type: 'critical' | 'daily' | 'timing' | 'weekly' | 'micro';
  title: string;
  shortMessage: string;
  science: string;
  action: string;
  indianFoods?: string[];
  tip?: string;
  xpReward: number;
  cooldownHours: number;
}
