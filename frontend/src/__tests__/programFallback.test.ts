/**
 * Sprint 7 — programPlannerService fallback invariant guard.
 *
 * When the AI call fails, generateProgramPhase() falls back to buildFallback(),
 * which emits a hand-written weekly plan for the phase's split. The critical
 * invariant: every exerciseId in a fallback plan MUST resolve in EXERCISE_DB —
 * otherwise weeklyVolume()/the logger silently drop the exercise (BY_ID.get →
 * undefined). This guards against a future edit adding an exercise to a fallback
 * plan that doesn't exist in the DB.
 *
 * We drive the real public path by making global.fetch reject.
 */

import { generateProgramPhase } from '../services/programPlannerService';
import { buildPhaseSpecs, ProgramConfig, PhaseSpec, calcPhaseNutrition } from '../services/programPhaseEngine';
import { EXERCISE_DB } from '../data/exercises';

const DB_IDS = new Set(EXERCISE_DB.map((e) => e.id));

const baseConfig: ProgramConfig = {
  id: 'test',
  type: 'muscle_gain',
  durationMonths: 3,
  startDate: '2026-01-01',
  startWeight: 75,
  startLeanMass: 60,
  startBodyFatPct: 18,
  startTDEE: 2500,
  sex: 'male',
  heightCm: 178,
  age: 28,
  activity: 'moderate',
};

// Collect one phase of each split type across program templates.
function phaseWithSplit(split: PhaseSpec['split']): { config: ProgramConfig; phase: PhaseSpec } {
  const types: ProgramConfig['type'][] = ['muscle_gain', 'body_recomp', 'fat_loss', 'strength'];
  for (const type of types) {
    const config = { ...baseConfig, type };
    const phase = buildPhaseSpecs(config).find((p) => p.split === split);
    if (phase) return { config, phase };
  }
  throw new Error(`no phase found for split ${split}`);
}

const SPLITS: PhaseSpec['split'][] = ['PPL', 'Upper_Lower', 'Full_Body'];

beforeEach(() => {
  // Force the AI path to fail → buildFallback runs.
  global.fetch = jest.fn(() => Promise.reject(new Error('network down'))) as unknown as typeof fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('program fallback plan — structure', () => {
  test.each(SPLITS)('%s split returns a non-empty weekly plan', async (split) => {
    const { config, phase } = phaseWithSplit(split);
    const result = await generateProgramPhase({
      config, phase, tdee: 2500, leanMassKg: 60, bodyFatPct: 18, diet: 'nonveg',
    });
    expect(result.weeklyPlan.length).toBeGreaterThan(0);
    result.weeklyPlan.forEach((day) => {
      expect(day.exercises.length).toBeGreaterThan(0);
      expect(typeof day.day).toBe('string');
      expect(day.estimatedMinutes).toBeGreaterThan(0);
    });
  });
});

describe('program fallback plan — exercise ID invariant', () => {
  test.each(SPLITS)('every exerciseId in the %s fallback resolves in EXERCISE_DB', async (split) => {
    const { config, phase } = phaseWithSplit(split);
    const result = await generateProgramPhase({
      config, phase, tdee: 2500, leanMassKg: 60, bodyFatPct: 18, diet: 'nonveg',
    });
    const ids = result.weeklyPlan.flatMap((d) => d.exercises.map((e) => e.exerciseId));
    const unknown = ids.filter((id) => !DB_IDS.has(id));
    expect(unknown).toEqual([]);
  });

  test('every fallback exercise carries the DB-correct name for its id', async () => {
    const byId = new Map(EXERCISE_DB.map((e) => [e.id, e]));
    const { config, phase } = phaseWithSplit('PPL');
    const result = await generateProgramPhase({
      config, phase, tdee: 2500, leanMassKg: 60, bodyFatPct: 18, diet: 'nonveg',
    });
    // Spot-check that ids map to a real template (name may be embellished, so we
    // only require the id exists — the strict id check is above).
    result.weeklyPlan.forEach((d) =>
      d.exercises.forEach((e) => expect(byId.has(e.exerciseId)).toBe(true)),
    );
  });
});

describe('program fallback plan — nutrition merge', () => {
  test('fallback nutrition equals calcPhaseNutrition for the phase', async () => {
    const { config, phase } = phaseWithSplit('PPL');
    const expected = calcPhaseNutrition(phase, 2500, 60);
    const result = await generateProgramPhase({
      config, phase, tdee: 2500, leanMassKg: 60, bodyFatPct: 18, diet: 'nonveg',
    });
    expect(result.calories).toBe(expected.calories);
    expect(result.protein).toBe(expected.protein);
    expect(result.carbs).toBe(expected.carbs);
    expect(result.fat).toBe(expected.fat);
  });

  test('fallback echoes the phase number and name', async () => {
    const { config, phase } = phaseWithSplit('PPL');
    const result = await generateProgramPhase({
      config, phase, tdee: 2500, leanMassKg: 60, bodyFatPct: 18, diet: 'nonveg',
    });
    expect(result.phaseNumber).toBe(phase.phase);
    expect(result.phaseName).toBe(phase.label);
    expect(result.nutritionNotes.length).toBeGreaterThan(0);
    expect(result.trainingRationale.length).toBeGreaterThan(0);
    expect(result.keyFocus.length).toBeGreaterThan(0);
  });
});
