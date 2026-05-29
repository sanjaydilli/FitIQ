import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Warning, UserStats } from '../utils/warnings/warningTypes';
import { checkAllWarnings } from '../utils/warnings/warningEngine';
import {
  canShowWarning,
  markWarningShown,
  markWarningActedOn,
  snoozeWarning,
} from '../utils/warnings/warningCooldowns';
import { useUser } from '../context/UserContext';
import { useFoodLog } from './useFoodLog';
import { useBodyComp } from './useBodyComp';
import { goalCalorieAdjust } from '../utils/bodyComposition';

// Build a UserStats snapshot from the UserContext + hardcoded demo values
// In production these would come from tracked daily data
function buildStats(
  user: ReturnType<typeof useUser>['user'],
  todayTotals: { calories: number; protein: number; carbs: number; fat: number; entries: { meal: string }[] },
  tdee: number,
): UserStats {
  const now = new Date();
  const waterLiters =
    (user.waterDrops.reduce((a, b) => a + b, 0) * 250) / 1000;

  // Map UserContext types → UserStats types
  const genderMap: Record<typeof user.sex, UserStats['gender']> = {
    male: 'male',
    female: 'female',
  };
  const goalMap: Record<typeof user.goal, UserStats['goal']> = {
    lose: 'fatLoss',
    gain: 'muscle',
    endur: 'maintain',
    main: 'maintain',
  };
  const dietMap: Record<typeof user.diet, UserStats['dietType']> = {
    veg: 'vegetarian',
    eggetarian: 'eggetarian',
    nveg: 'nonveg',
    vegan: 'vegan',
    jain: 'jain',
  };

  const targetCal = tdee + goalCalorieAdjust(user.goal);
  const targetProt = Math.round(user.weightKg * 2);

  return {
    gender: genderMap[user.sex],
    weight: user.weightKg,
    goal: goalMap[user.goal],
    dietType: dietMap[user.diet],

    calories: todayTotals.calories,
    targetCalories: targetCal,
    protein: todayTotals.protein,
    targetProtein: targetProt,
    carbs: todayTotals.carbs,
    fat: todayTotals.fat,
    fiber: 0,
    water: waterLiters,
    targetWater: Math.round(user.weightKg * 35) / 1000,
    mealCount: new Set(todayTotals.entries.map(e => e.meal)).size,
    lastMealMinutesAgo: 120,

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
    sleepQuality: 'average',

    consecutiveLowIronDays: 0,
    consecutiveLowMagDays: 0,
    consecutiveLowOmega3Days: 0,
    consecutiveLowZincDays: 0,

    steps: user.steps,
    targetSteps: user.stepGoal,
    workoutMinutesAgo: 0,
    nextWorkoutMinutes: 0,
    consecutiveWorkoutDays: user.streak,
    weeksSinceDeload: 5,

    lastNightSleep: 7,
    strengthTrend: 'stable',

    currentHour: now.getHours(),
    currentMonth: now.getMonth() + 1,
  };
}

interface UseWarningsResult {
  activeWarning: Warning | null;
  dismissWarning: () => void;
  snoozeActiveWarning: () => void;
  actOnWarning: () => void;
}

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function useWarnings(duringWorkout = false): UseWarningsResult {
  const { user, update } = useUser();
  const { todayTotals } = useFoodLog();
  const { tdee } = useBodyComp();
  const [activeWarning, setActiveWarning] = useState<Warning | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stats = useMemo(
    () => buildStats(user, todayTotals, tdee || Math.round(user.weightKg * 30)),
    [user, todayTotals, tdee],
  );

  const evaluate = useCallback(() => {
    if (duringWorkout) {
      setActiveWarning(null);
      return;
    }
    const all = checkAllWarnings(stats);
    const eligible = all.find((w) => canShowWarning(w.id, w.cooldownHours));
    if (eligible) {
      markWarningShown(eligible.id);
      setActiveWarning(eligible);
    } else {
      setActiveWarning(null);
    }
  }, [stats, duringWorkout]);

  // Run on mount and whenever stats change
  useEffect(() => {
    evaluate();
  }, [evaluate]);

  // Re-check every 30 minutes
  useEffect(() => {
    timerRef.current = setInterval(evaluate, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [evaluate]);

  const dismissWarning = useCallback(() => {
    setActiveWarning(null);
  }, []);

  const snoozeActiveWarning = useCallback(() => {
    if (activeWarning) {
      snoozeWarning(activeWarning.id, 2);
      setActiveWarning(null);
      // Find next eligible warning
      setTimeout(() => evaluate(), 50);
    }
  }, [activeWarning, evaluate]);

  const actOnWarning = useCallback(() => {
    if (activeWarning) {
      markWarningActedOn(activeWarning.id);
      // Award XP
      update({ xp: user.xp + activeWarning.xpReward });
      setActiveWarning(null);
    }
  }, [activeWarning, user.xp, update]);

  return { activeWarning, dismissWarning, snoozeActiveWarning, actOnWarning };
}
