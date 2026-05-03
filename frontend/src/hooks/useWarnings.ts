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

// Build a UserStats snapshot from the UserContext + hardcoded demo values
// In production these would come from tracked daily data
function buildStats(user: ReturnType<typeof useUser>['user']): UserStats {
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

  // Demo nutrition values — in production these come from food tracking
  const targetCal = user.sex === 'male' ? 2340 : 1900;
  const targetProt = user.sex === 'male' ? 142 : 115;

  return {
    gender: genderMap[user.sex],
    weight: user.weightKg,
    goal: goalMap[user.goal],
    dietType: dietMap[user.diet],

    calories: 1847,
    targetCalories: targetCal,
    protein: 102,
    targetProtein: targetProt,
    carbs: 210,
    fat: 58,
    fiber: 18,
    water: waterLiters,
    targetWater: 3.5,
    mealCount: 3,
    lastMealMinutesAgo: 95,

    ironIntake: user.diet === 'veg' || user.diet === 'vegan' ? 5 : 10,
    magnesiumIntake: 240,
    omega3Intake: 0.6,
    zincIntake: user.diet === 'veg' || user.diet === 'vegan' ? 6 : 9,

    teaLoggedMinutesAgo: 40,
    ironRichMealLogged: true,
    postWorkoutMealLogged: false,
    oilTracked: true,
    takingB12: false,
    takingVitaminD: false,
    muscleCramps: false,
    sleepQuality: 'average',

    consecutiveLowIronDays: user.diet === 'veg' || user.diet === 'vegan' ? 4 : 0,
    consecutiveLowMagDays: 3,
    consecutiveLowOmega3Days: user.diet === 'veg' || user.diet === 'vegan' ? 6 : 2,
    consecutiveLowZincDays: user.diet === 'veg' || user.diet === 'vegan' ? 6 : 1,

    steps: 7420,
    targetSteps: 10000,
    workoutMinutesAgo: 75,
    nextWorkoutMinutes: 0,
    consecutiveWorkoutDays: user.streak > 6 ? 6 : user.streak,
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
  const [activeWarning, setActiveWarning] = useState<Warning | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stats = useMemo(() => buildStats(user), [user]);

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
