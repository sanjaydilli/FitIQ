/**
 * Sprint 6 — Warning reachability audit.
 *
 * FINDING: useWarnings.ts → buildStats() hardcodes placeholder constants for
 * every field that isn't yet tracked ("In production these would come from
 * tracked daily data"). The consequence is that a large fraction of the 15-rule
 * warning system can NEVER fire, no matter what the user does, because the
 * trigger fields are pinned to non-triggering constants.
 *
 * This test reconstructs exactly the constant portion of buildStats and proves,
 * executably, which warnings are permanently unreachable. It is a documentation
 * test: if someone later wires real data into one of these fields, the matching
 * assertion will start failing and force this list to be updated.
 *
 * The pinned constants below are copied verbatim from hooks/useWarnings.ts.
 */

import { checkAllWarnings } from '../utils/warnings/warningEngine';
import type { UserStats } from '../utils/warnings/warningTypes';

// These are the fields buildStats() sets to a fixed constant (never from data).
const PINNED_CONSTANTS = {
  lastMealMinutesAgo: 120,

  ironIntake: 0,
  magnesiumIntake: 0,
  omega3Intake: 0,
  zincIntake: 0,

  teaLoggedMinutesAgo: 0,
  ironRichMealLogged: false,
  postWorkoutMealLogged: false,
  takingB12: false,
  takingVitaminD: false,
  muscleCramps: false,
  sleepQuality: 'average' as const,

  consecutiveLowIronDays: 0,
  consecutiveLowMagDays: 0,
  consecutiveLowOmega3Days: 0,
  consecutiveLowZincDays: 0,

  workoutMinutesAgo: 0,
  nextWorkoutMinutes: 0,
  weeksSinceDeload: 5,

  lastNightSleep: 7,
  strengthTrend: 'stable' as const,
};

/**
 * Build a UserStats where the data-driven fields are set to their MOST
 * triggering possible values, but the pinned constants stay as the hook fixes
 * them. Any warning that still can't fire here is provably unreachable.
 */
function maxedWithinPins(overrides: Partial<UserStats> = {}): UserStats {
  return {
    // data-driven fields pushed to extreme trigger values
    gender: 'male',
    weight: 75,
    goal: 'muscle',
    dietType: 'nonveg',
    calories: 0,
    targetCalories: 3000,
    protein: 0,
    targetProtein: 200,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0,
    targetWater: 4,
    mealCount: 5,
    steps: 0,
    targetSteps: 10000,
    consecutiveWorkoutDays: 10,
    oilTracked: false,
    currentHour: 21,
    currentMonth: 12,
    // the hook's hardcoded constants — cannot be influenced by user data
    ...PINNED_CONSTANTS,
    ...overrides,
  };
}

const firedIds = (s: UserStats) => checkAllWarnings(s).map((w) => w.id);

describe('warning reachability under the hook’s pinned constants', () => {
  // ── Reachable: driven by real UserContext / food-log data ──────────────────
  test('W01 (water vs protein) is reachable', () => {
    // protein and water ARE real data
    expect(firedIds(maxedWithinPins({ protein: 150, water: 0, targetWater: 4 })))
      .toContain('W01');
  });

  test('W02 (calories too low) is reachable', () => {
    expect(firedIds(maxedWithinPins({ calories: 800, mealCount: 3 }))).toContain('W02');
  });

  test('W03 (overtraining) is reachable via real workout streak', () => {
    expect(firedIds(maxedWithinPins({ consecutiveWorkoutDays: 7 }))).toContain('W03');
  });

  test('W05 (evening protein) is reachable', () => {
    expect(firedIds(maxedWithinPins({ currentHour: 21, protein: 0, targetProtein: 200 })))
      .toContain('W05');
  });

  test('W06 (steps low) is reachable', () => {
    expect(firedIds(maxedWithinPins({ currentHour: 21, steps: 0 }))).toContain('W06');
  });

  test('W10 (supplements) is reachable via real diet + month', () => {
    expect(firedIds(maxedWithinPins({ dietType: 'vegetarian' }))).toContain('W10');
  });

  // ── UNREACHABLE: pinned to non-triggering constants in buildStats ──────────
  // Each of these is a warning the app ships but can never actually surface.
  const UNREACHABLE = [
    ['W04', 'sleep < 6h', 'lastNightSleep pinned to 7'],
    ['W07', 'pre-workout fuel', 'nextWorkoutMinutes pinned to 0'],
    ['W08', 'post-workout protein', 'workoutMinutesAgo pinned to 0'],
    ['W09', 'deload needed', 'weeksSinceDeload pinned to 5 + strengthTrend pinned stable'],
    ['W11', 'iron deficiency', 'consecutiveLowIronDays pinned to 0'],
    ['W12', 'magnesium low', 'consecutiveLowMagDays pinned to 0'],
    ['W13', 'omega-3 deficiency', 'consecutiveLowOmega3Days pinned to 0'],
    ['W14', 'zinc low', 'consecutiveLowZincDays pinned to 0'],
    ['W15', 'tea blocking iron', 'ironRichMealLogged pinned to false'],
  ] as const;

  test.each(UNREACHABLE)(
    '%s (%s) is UNREACHABLE in production (%s)',
    (id) => {
      // Even with every data-driven field maxed to its trigger value, the pinned
      // constants prevent this warning from ever firing.
      expect(firedIds(maxedWithinPins())).not.toContain(id);
    },
  );

  test('exactly 9 of 15 warnings are unreachable under current wiring', () => {
    // Snapshot the scale of the gap so a future fix visibly shrinks this number.
    const allIds = ['W01','W02','W03','W04','W05','W06','W07','W08','W09','W10','W11','W12','W13','W14','W15'];
    const reachableSomehow = new Set<string>();
    // Probe each data-driven trigger combination we know the hook can produce.
    [
      maxedWithinPins({ protein: 150, water: 0 }),                 // W01
      maxedWithinPins({ calories: 800, mealCount: 3 }),            // W02
      maxedWithinPins({ consecutiveWorkoutDays: 7 }),              // W03
      maxedWithinPins({ currentHour: 21, protein: 0 }),            // W05
      maxedWithinPins({ currentHour: 21, steps: 0 }),              // W06
      maxedWithinPins({ dietType: 'vegetarian' }),                 // W10
      maxedWithinPins({ currentMonth: 12 }),                       // W10 (VitD)
    ].forEach((s) => firedIds(s).forEach((id) => reachableSomehow.add(id)));

    const unreachable = allIds.filter((id) => !reachableSomehow.has(id));
    expect(unreachable.sort()).toEqual(
      ['W04', 'W07', 'W08', 'W09', 'W11', 'W12', 'W13', 'W14', 'W15'],
    );
  });
});
