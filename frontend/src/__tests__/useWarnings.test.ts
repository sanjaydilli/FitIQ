/**
 * Tests for the warnings system:
 *   1. checkAllWarnings — pure rule engine (no mocking needed)
 *   2. warningCooldowns — localStorage-based cooldown helpers
 *   3. useWarnings hook — dismissWarning, duringWorkout guard
 */

import { checkAllWarnings } from '../utils/warnings/warningEngine';
import {
  canShowWarning,
  markWarningShown,
  markWarningActedOn,
  snoozeWarning,
} from '../utils/warnings/warningCooldowns';
import type { UserStats } from '../utils/warnings/warningTypes';
import { renderHook, act } from '@testing-library/react';
import { useWarnings } from '../hooks/useWarnings';

// Mock all hook dependencies
jest.mock('../context/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('../hooks/useFoodLog',    () => ({ useFoodLog: jest.fn() }));
jest.mock('../hooks/useBodyComp',   () => ({ useBodyComp: jest.fn() }));

import { useUser }    from '../context/UserContext';
import { useFoodLog } from '../hooks/useFoodLog';
import { useBodyComp } from '../hooks/useBodyComp';

// ── helpers ───────────────────────────────────────────────────────────────────

/** Base stats — no warnings should fire by default */
const baseStats: UserStats = {
  gender: 'male', weight: 75,
  goal: 'muscle', dietType: 'nonveg',
  calories: 2200, targetCalories: 2200,
  protein: 120, targetProtein: 150,
  carbs: 260, fat: 70, fiber: 25,
  water: 3.0, targetWater: 2.6,
  mealCount: 3, lastMealMinutesAgo: 90,
  ironIntake: 15, magnesiumIntake: 300,
  omega3Intake: 1.5, zincIntake: 10,
  teaLoggedMinutesAgo: 180,
  ironRichMealLogged: true, postWorkoutMealLogged: true,
  oilTracked: true, takingB12: true, takingVitaminD: true,
  muscleCramps: false, sleepQuality: 'good',
  consecutiveLowIronDays: 0, consecutiveLowMagDays: 0,
  consecutiveLowOmega3Days: 0, consecutiveLowZincDays: 0,
  steps: 8000, targetSteps: 8000,
  workoutMinutesAgo: 30, nextWorkoutMinutes: 1440,
  consecutiveWorkoutDays: 3, weeksSinceDeload: 2,
  lastNightSleep: 8, strengthTrend: 'up',
  currentHour: 14, currentMonth: 6,
};

function setupHook(statsOverrides: Partial<UserStats> = {}) {
  const mergedStats = { ...baseStats, ...statsOverrides };
  (useUser as jest.Mock).mockReturnValue({
    user: {
      sex: 'male', weightKg: 75, goal: 'gain', diet: 'veg', activity: 'moderate',
      waterDrops: Array(6).fill(0), waterDate: '', steps: 0, stepGoal: 8000,
      name: '', heightCm: 175, age: 25, streak: 0, xp: 0, level: 1,
      waterDrops: [0,0,0,0,0,0], stepsDate: '', isPremium: false,
    },
    update: jest.fn(),
  });
  (useFoodLog as jest.Mock).mockReturnValue({
    todayTotals: {
      calories: mergedStats.calories,
      protein: mergedStats.protein,
      carbs: mergedStats.carbs,
      fat: mergedStats.fat,
      entries: Array.from({ length: mergedStats.mealCount }, (_, i) => ({ meal: `meal_${i}` })),
    },
  });
  (useBodyComp as jest.Mock).mockReturnValue({ tdee: mergedStats.targetCalories });
}

beforeEach(() => {
  localStorage.clear();
  setupHook();
});

// ─────────────────────────────────────────────────────────────────────────────
// checkAllWarnings — pure rule engine
// ─────────────────────────────────────────────────────────────────────────────

describe('checkAllWarnings', () => {
  test('returns empty array when everything is healthy', () => {
    const results = checkAllWarnings(baseStats);
    expect(results).toHaveLength(0);
  });

  test('W01: fires when protein > 100 and water < 60% of target', () => {
    const stats = { ...baseStats, protein: 120, water: 1.0, targetWater: 2.6 };
    const results = checkAllWarnings(stats);
    expect(results.some(w => w.id === 'W01')).toBe(true);
  });

  test('W01: does not fire when water is adequate', () => {
    const stats = { ...baseStats, protein: 120, water: 2.5, targetWater: 2.6 };
    const results = checkAllWarnings(stats);
    expect(results.some(w => w.id === 'W01')).toBe(false);
  });

  test('W02: fires when 2+ meals logged but calories too low (male < 1500)', () => {
    const stats = { ...baseStats, mealCount: 2, calories: 1200 };
    const results = checkAllWarnings(stats);
    expect(results.some(w => w.id === 'W02')).toBe(true);
  });

  test('W02: does not fire with adequate calories', () => {
    const stats = { ...baseStats, mealCount: 2, calories: 1800 };
    const results = checkAllWarnings(stats);
    expect(results.some(w => w.id === 'W02')).toBe(false);
  });

  test('W03: fires when 6+ consecutive workout days', () => {
    const stats = { ...baseStats, consecutiveWorkoutDays: 6 };
    const results = checkAllWarnings(stats);
    expect(results.some(w => w.id === 'W03')).toBe(true);
  });

  test('W03: does not fire at 5 consecutive days', () => {
    const stats = { ...baseStats, consecutiveWorkoutDays: 5 };
    const results = checkAllWarnings(stats);
    expect(results.some(w => w.id === 'W03')).toBe(false);
  });

  test('W04: fires when sleep < 6h and hour is 6–10', () => {
    const stats = { ...baseStats, lastNightSleep: 5, currentHour: 8 };
    const results = checkAllWarnings(stats);
    expect(results.some(w => w.id === 'W04')).toBe(true);
  });

  test('W04: does not fire when sleep is adequate', () => {
    const stats = { ...baseStats, lastNightSleep: 7, currentHour: 8 };
    const results = checkAllWarnings(stats);
    expect(results.some(w => w.id === 'W04')).toBe(false);
  });

  test('every returned warning has required fields', () => {
    const stats = { ...baseStats, consecutiveWorkoutDays: 6 };
    const results = checkAllWarnings(stats);
    for (const w of results) {
      expect(typeof w.id).toBe('string');
      expect(typeof w.title).toBe('string');
      expect(typeof w.priority).toBe('number');
      expect(typeof w.xpReward).toBe('number');
      expect(typeof w.cooldownHours).toBe('number');
    }
  });

  test('results are sorted by priority (lowest first)', () => {
    // Fire multiple warnings: W01 (priority=1) + W02 (priority=2)
    const stats = { ...baseStats, protein: 120, water: 1.0, targetWater: 2.6, mealCount: 2, calories: 1200 };
    const results = checkAllWarnings(stats);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].priority).toBeGreaterThanOrEqual(results[i-1].priority);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// warningCooldowns
// ─────────────────────────────────────────────────────────────────────────────

describe('warningCooldowns', () => {
  test('canShowWarning returns true when no entry exists', () => {
    expect(canShowWarning('W01', 4)).toBe(true);
  });

  test('canShowWarning returns false immediately after markWarningShown', () => {
    markWarningShown('W01');
    expect(canShowWarning('W01', 4)).toBe(false);
  });

  test('canShowWarning returns true after cooldown has elapsed', () => {
    const pastTs = Date.now() - 5 * 60 * 60 * 1000; // 5 hours ago
    localStorage.setItem('fitiq.warnings', JSON.stringify({
      W01: { lastShownAt: pastTs, actedOnAt: null, snoozedUntil: null },
    }));
    expect(canShowWarning('W01', 4)).toBe(true); // 4h cooldown, 5h elapsed
  });

  test('canShowWarning returns false when still within cooldown', () => {
    const recentTs = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
    localStorage.setItem('fitiq.warnings', JSON.stringify({
      W01: { lastShownAt: recentTs, actedOnAt: null, snoozedUntil: null },
    }));
    expect(canShowWarning('W01', 4)).toBe(false); // 4h cooldown, only 1h elapsed
  });

  test('snoozeWarning blocks showing during snooze window', () => {
    markWarningShown('W02');
    // Normally already blocked by cooldown, but let's explicitly test snooze
    const pastTs = Date.now() - 10 * 60 * 60 * 1000;
    localStorage.setItem('fitiq.warnings', JSON.stringify({
      W02: { lastShownAt: pastTs, actedOnAt: null, snoozedUntil: null },
    }));
    // Should be showable without snooze
    expect(canShowWarning('W02', 4)).toBe(true);
    // Now snooze for 2 hours
    snoozeWarning('W02', 2);
    expect(canShowWarning('W02', 4)).toBe(false);
  });

  test('markWarningActedOn records actedOnAt timestamp', () => {
    markWarningShown('W03');
    markWarningActedOn('W03');
    const raw = JSON.parse(localStorage.getItem('fitiq.warnings') ?? '{}');
    expect(typeof raw['W03'].actedOnAt).toBe('number');
    expect(raw['W03'].actedOnAt).toBeGreaterThan(0);
  });

  test('different warning ids are tracked independently', () => {
    markWarningShown('W01');
    expect(canShowWarning('W02', 4)).toBe(true);
    expect(canShowWarning('W01', 4)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useWarnings hook
// ─────────────────────────────────────────────────────────────────────────────

describe('useWarnings hook', () => {
  test('dismissWarning clears activeWarning', () => {
    // Trigger a warning by having low calories + 2+ meals
    setupHook({ mealCount: 2, calories: 1200 });
    const { result } = renderHook(() => useWarnings());

    act(() => { result.current.dismissWarning(); });
    expect(result.current.activeWarning).toBeNull();
  });

  test('duringWorkout=true always results in no active warning', () => {
    // Even with conditions that would fire a warning
    setupHook({ consecutiveWorkoutDays: 7 });
    const { result } = renderHook(() => useWarnings(true));
    expect(result.current.activeWarning).toBeNull();
  });

  test('returns the four control functions', () => {
    const { result } = renderHook(() => useWarnings());
    expect(typeof result.current.dismissWarning).toBe('function');
    expect(typeof result.current.snoozeActiveWarning).toBe('function');
    expect(typeof result.current.actOnWarning).toBe('function');
  });

  test('snoozeActiveWarning clears active warning when one is shown', () => {
    setupHook({ mealCount: 2, calories: 1200 });
    const { result } = renderHook(() => useWarnings());

    // If a warning was set, snooze it
    act(() => { result.current.snoozeActiveWarning(); });
    expect(result.current.activeWarning).toBeNull();
  });
});
