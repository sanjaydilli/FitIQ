/**
 * Sprint 5 — Warning engine W05–W15 rule coverage.
 *
 * The existing useWarnings.test.ts only exercises W01–W04. This file covers the
 * remaining 11 rules directly against checkAllWarnings, deriving each assertion
 * from the *intended* behavior described in the rule's science/comment — not from
 * what the code happens to do today. A red test here is a found bug.
 *
 * Strategy: start from a fully-healthy baseline where NO warning should fire,
 * then flip the minimum fields needed to trigger exactly one rule, asserting it
 * appears (and that the just-below-threshold case does not).
 */

import { checkAllWarnings } from '../utils/warnings/warningEngine';
import type { UserStats } from '../utils/warnings/warningTypes';

/** A baseline where every rule's trigger condition is false. */
function healthy(overrides: Partial<UserStats> = {}): UserStats {
  return {
    gender: 'male',
    weight: 75,
    goal: 'muscle',
    dietType: 'nonveg',

    calories: 2500,
    targetCalories: 2500,
    protein: 160,
    targetProtein: 150,
    carbs: 300,
    fat: 70,
    fiber: 30,
    water: 3,
    targetWater: 3,
    mealCount: 4,
    lastMealMinutesAgo: 60,

    ironIntake: 20,
    magnesiumIntake: 400,
    omega3Intake: 2,
    zincIntake: 15,

    teaLoggedMinutesAgo: 999,
    ironRichMealLogged: false,
    postWorkoutMealLogged: true,
    oilTracked: true,
    takingB12: true,
    takingVitaminD: true,
    muscleCramps: false,
    sleepQuality: 'good',

    consecutiveLowIronDays: 0,
    consecutiveLowMagDays: 0,
    consecutiveLowOmega3Days: 0,
    consecutiveLowZincDays: 0,

    steps: 10000,
    targetSteps: 8000,
    workoutMinutesAgo: 0,
    nextWorkoutMinutes: 0,
    consecutiveWorkoutDays: 2,
    weeksSinceDeload: 1,

    lastNightSleep: 8,
    strengthTrend: 'stable',

    currentHour: 12,
    currentMonth: 6, // June — no Vitamin-D season trigger
    ...overrides,
  };
}

const fires = (id: string, s: UserStats) =>
  checkAllWarnings(s).some((w) => w.id === id);

describe('warning engine — healthy baseline', () => {
  test('a fully-healthy day produces zero warnings', () => {
    expect(checkAllWarnings(healthy())).toEqual([]);
  });
});

// ─── W05: Protein target missed (evening) ─────────────────────────────────────
describe('W05 — protein target missed', () => {
  test('fires after 20:00 when protein < 80% of target', () => {
    // target 150 → 80% = 120; 100 is below
    expect(fires('W05', healthy({ currentHour: 21, protein: 100 }))).toBe(true);
  });

  test('does not fire before 20:00 even if protein is low', () => {
    expect(fires('W05', healthy({ currentHour: 19, protein: 100 }))).toBe(false);
  });

  test('does not fire when protein is at 80% of target', () => {
    // exactly 80% (120) is NOT < 80%
    expect(fires('W05', healthy({ currentHour: 21, protein: 120 }))).toBe(false);
  });

  test('hour 20 is the inclusive lower boundary', () => {
    expect(fires('W05', healthy({ currentHour: 20, protein: 50 }))).toBe(true);
  });
});

// ─── W06: Steps too low (evening) ─────────────────────────────────────────────
describe('W06 — steps too low', () => {
  test('fires after 19:00 when steps < 50% of target', () => {
    // target 8000 → 50% = 4000; 3000 below
    expect(fires('W06', healthy({ currentHour: 20, steps: 3000 }))).toBe(true);
  });

  test('does not fire before 19:00', () => {
    expect(fires('W06', healthy({ currentHour: 18, steps: 1000 }))).toBe(false);
  });

  test('does not fire at exactly 50% of target', () => {
    expect(fires('W06', healthy({ currentHour: 20, steps: 4000 }))).toBe(false);
  });
});

// ─── W07: Pre-workout fuel ────────────────────────────────────────────────────
describe('W07 — pre-workout fuel', () => {
  test('fires when workout < 90min away and last meal > 180min ago', () => {
    expect(
      fires('W07', healthy({ nextWorkoutMinutes: 45, lastMealMinutesAgo: 200 })),
    ).toBe(true);
  });

  test('does not fire when nextWorkoutMinutes is 0 (no workout scheduled)', () => {
    // The >0 guard protects the no-data sentinel.
    expect(
      fires('W07', healthy({ nextWorkoutMinutes: 0, lastMealMinutesAgo: 500 })),
    ).toBe(false);
  });

  test('does not fire when a meal was eaten recently (< 180min)', () => {
    expect(
      fires('W07', healthy({ nextWorkoutMinutes: 45, lastMealMinutesAgo: 120 })),
    ).toBe(false);
  });

  test('does not fire when workout is far away (>= 90min)', () => {
    expect(
      fires('W07', healthy({ nextWorkoutMinutes: 120, lastMealMinutesAgo: 300 })),
    ).toBe(false);
  });
});

// ─── W08: Post-workout protein ────────────────────────────────────────────────
describe('W08 — post-workout protein window', () => {
  test('fires within 120min post-workout when meal not logged', () => {
    expect(
      fires('W08', healthy({ workoutMinutesAgo: 30, postWorkoutMealLogged: false })),
    ).toBe(true);
  });

  test('does not fire when workoutMinutesAgo is 0 (no workout done)', () => {
    // The >0 guard protects the no-data sentinel.
    expect(
      fires('W08', healthy({ workoutMinutesAgo: 0, postWorkoutMealLogged: false })),
    ).toBe(false);
  });

  test('does not fire when post-workout meal already logged', () => {
    expect(
      fires('W08', healthy({ workoutMinutesAgo: 30, postWorkoutMealLogged: true })),
    ).toBe(false);
  });

  test('does not fire once the 120min window has closed', () => {
    expect(
      fires('W08', healthy({ workoutMinutesAgo: 150, postWorkoutMealLogged: false })),
    ).toBe(false);
  });
});

// ─── W09: Deload needed ───────────────────────────────────────────────────────
describe('W09 — deload needed', () => {
  test('fires at 6+ weeks since deload', () => {
    expect(fires('W09', healthy({ weeksSinceDeload: 6 }))).toBe(true);
  });

  test('does not fire at 5 weeks with stable strength', () => {
    expect(fires('W09', healthy({ weeksSinceDeload: 5 }))).toBe(false);
  });

  test('fires early (4 weeks) when strength is trending down', () => {
    expect(
      fires('W09', healthy({ weeksSinceDeload: 4, strengthTrend: 'down' })),
    ).toBe(true);
  });

  test('does not fire at 3 weeks even with strength down', () => {
    expect(
      fires('W09', healthy({ weeksSinceDeload: 3, strengthTrend: 'down' })),
    ).toBe(false);
  });
});

// ─── W10: Supplement reminder (B12 / Vitamin D) ───────────────────────────────
describe('W10 — supplement reminder', () => {
  test('fires for vegetarians not taking B12', () => {
    expect(
      fires('W10', healthy({ dietType: 'vegetarian', takingB12: false })),
    ).toBe(true);
  });

  test('fires for vegans not taking B12', () => {
    expect(fires('W10', healthy({ dietType: 'vegan', takingB12: false }))).toBe(true);
  });

  test('does not fire for non-veg taking supplements in summer', () => {
    expect(fires('W10', healthy({ dietType: 'nonveg' }))).toBe(false);
  });

  test('fires in winter months for someone not taking Vitamin D', () => {
    // currentMonth is 1-indexed (hook passes getMonth()+1). Oct(10)–Jan(1) window.
    expect(fires('W10', healthy({ currentMonth: 12, takingVitaminD: false }))).toBe(true);
    expect(fires('W10', healthy({ currentMonth: 1, takingVitaminD: false }))).toBe(true);
  });

  test('does not fire in mid-summer when supplements are taken', () => {
    expect(
      fires('W10', healthy({ currentMonth: 6, takingVitaminD: true, takingB12: true })),
    ).toBe(false);
  });
});

// ─── W11: Iron deficiency ─────────────────────────────────────────────────────
describe('W11 — iron deficiency', () => {
  test('fires for a man with 3+ low-iron days below 8mg', () => {
    expect(
      fires('W11', healthy({ gender: 'male', consecutiveLowIronDays: 3, ironIntake: 5 })),
    ).toBe(true);
  });

  test('uses the higher 18mg target for women', () => {
    // 10mg is fine for a man (>=8) but deficient for a woman (<18)
    expect(
      fires('W11', healthy({ gender: 'female', consecutiveLowIronDays: 3, ironIntake: 10 })),
    ).toBe(true);
    expect(
      fires('W11', healthy({ gender: 'male', consecutiveLowIronDays: 3, ironIntake: 10 })),
    ).toBe(false);
  });

  test('does not fire below the 3-day streak', () => {
    expect(
      fires('W11', healthy({ consecutiveLowIronDays: 2, ironIntake: 1 })),
    ).toBe(false);
  });
});

// ─── W12: Magnesium low ───────────────────────────────────────────────────────
describe('W12 — magnesium low', () => {
  test('fires with 3+ low days, <300mg, and poor sleep', () => {
    expect(
      fires('W12', healthy({ consecutiveLowMagDays: 3, magnesiumIntake: 200, sleepQuality: 'poor' })),
    ).toBe(true);
  });

  test('fires with 3+ low days, <300mg, and muscle cramps', () => {
    expect(
      fires('W12', healthy({ consecutiveLowMagDays: 3, magnesiumIntake: 200, muscleCramps: true })),
    ).toBe(true);
  });

  test('does not fire without a symptom (good sleep, no cramps)', () => {
    expect(
      fires('W12', healthy({ consecutiveLowMagDays: 5, magnesiumIntake: 100, sleepQuality: 'good', muscleCramps: false })),
    ).toBe(false);
  });

  test('does not fire when magnesium is adequate (>=300)', () => {
    expect(
      fires('W12', healthy({ consecutiveLowMagDays: 5, magnesiumIntake: 300, sleepQuality: 'poor' })),
    ).toBe(false);
  });
});

// ─── W13: Omega-3 deficiency ──────────────────────────────────────────────────
describe('W13 — omega-3 deficiency', () => {
  test('fires with 5+ low days below 1.0g', () => {
    expect(
      fires('W13', healthy({ consecutiveLowOmega3Days: 5, omega3Intake: 0.5 })),
    ).toBe(true);
  });

  test('does not fire at 4 days', () => {
    expect(
      fires('W13', healthy({ consecutiveLowOmega3Days: 4, omega3Intake: 0 })),
    ).toBe(false);
  });

  test('does not fire at exactly 1.0g intake', () => {
    expect(
      fires('W13', healthy({ consecutiveLowOmega3Days: 7, omega3Intake: 1.0 })),
    ).toBe(false);
  });
});

// ─── W14: Zinc low (muscle goal only) ─────────────────────────────────────────
describe('W14 — zinc low', () => {
  test('fires for a muscle-goal man with 5+ low days below 11mg', () => {
    expect(
      fires('W14', healthy({ goal: 'muscle', gender: 'male', consecutiveLowZincDays: 5, zincIntake: 8 })),
    ).toBe(true);
  });

  test('does not fire when goal is not muscle', () => {
    expect(
      fires('W14', healthy({ goal: 'fatLoss', consecutiveLowZincDays: 5, zincIntake: 2 })),
    ).toBe(false);
  });

  test('uses the lower 8mg target for women', () => {
    // 9mg deficient for a man (<11) but fine for a woman (>=8)
    expect(
      fires('W14', healthy({ goal: 'muscle', gender: 'female', consecutiveLowZincDays: 5, zincIntake: 9 })),
    ).toBe(false);
    expect(
      fires('W14', healthy({ goal: 'muscle', gender: 'male', consecutiveLowZincDays: 5, zincIntake: 9 })),
    ).toBe(true);
  });
});

// ─── W15: Tea blocking iron ───────────────────────────────────────────────────
describe('W15 — tea blocking iron', () => {
  test('fires when chai was logged within an hour of an iron-rich, low-iron meal', () => {
    expect(
      fires('W15', healthy({ teaLoggedMinutesAgo: 30, ironRichMealLogged: true, gender: 'male', ironIntake: 5 })),
    ).toBe(true);
  });

  test('does not fire when no tea was logged (sentinel 0)', () => {
    // BUG PROBE: W07/W08 guard "minutesAgo" fields with > 0 to reject the no-data
    // sentinel. W15 must do the same — otherwise it false-fires "chai blocking
    // iron!" at someone who drank no chai. The hook seeds teaLoggedMinutesAgo: 0.
    expect(
      fires('W15', healthy({ teaLoggedMinutesAgo: 0, ironRichMealLogged: true, gender: 'male', ironIntake: 5 })),
    ).toBe(false);
  });

  test('does not fire when no iron-rich meal was logged', () => {
    expect(
      fires('W15', healthy({ teaLoggedMinutesAgo: 30, ironRichMealLogged: false, ironIntake: 5 })),
    ).toBe(false);
  });

  test('does not fire when tea was more than an hour ago', () => {
    expect(
      fires('W15', healthy({ teaLoggedMinutesAgo: 90, ironRichMealLogged: true, ironIntake: 5 })),
    ).toBe(false);
  });
});
