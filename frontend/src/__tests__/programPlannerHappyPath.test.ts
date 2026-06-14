/**
 * Sprint 8 — generateProgramPhase AI happy path.
 *
 * programFallback.test.ts covers the buildFallback() path (fetch rejects).
 * This file covers the *success* path: the JSON extraction from the model
 * reply (indexOf('{') → lastIndexOf('}') → slice → JSON.parse) and the merge
 * with the locally-calculated nutrition. That extraction/merge is real
 * deterministic code with no prior coverage.
 *
 * It also DOCUMENTS a known gap (it does not assert desired-but-absent
 * behavior as a bug): unlike planEditorService.sanitizeExercise, the happy
 * path performs NO validation on the AI-returned weeklyPlan — bogus
 * exerciseIds and out-of-range sets/restSeconds flow straight through. These
 * are characterization tests pinning today's behavior; see the FINDING note.
 */

import { generateProgramPhase } from '../services/programPlannerService';
import { buildPhaseSpecs, ProgramConfig, PhaseSpec, calcPhaseNutrition } from '../services/programPhaseEngine';

const baseConfig: ProgramConfig = {
  id: 'test', type: 'muscle_gain', durationMonths: 3, startDate: '2026-01-01',
  startWeight: 75, startLeanMass: 60, startBodyFatPct: 18, startTDEE: 2500,
  sex: 'male', heightCm: 178, age: 28, activity: 'moderate',
};

function pplPhase(): PhaseSpec {
  const phase = buildPhaseSpecs(baseConfig).find((p) => p.split === 'PPL');
  if (!phase) throw new Error('no PPL phase');
  return phase;
}

/** A minimal but valid AI payload shape. */
const aiPlan = {
  weeklyPlan: [
    { day: 'Monday', focus: 'Push', estimatedMinutes: 65, exercises: [
      { exerciseId: 'bench_bb', name: 'Barbell Bench Press', sets: 4, repsDisplay: '8-10', restSeconds: 90, cue: 'Brace' },
    ]},
  ],
  nutritionNotes: 'Eat your protein.',
  trainingRationale: 'Because hypertrophy.',
  keyFocus: 'Progressive overload.',
};

/** Mock the chat endpoint to return `reply`. */
function mockReply(reply: string) {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ reply }) }),
  ) as unknown as typeof fetch;
}

const run = () => generateProgramPhase({
  config: baseConfig, phase: pplPhase(), tdee: 2500, leanMassKg: 60, bodyFatPct: 18, diet: 'nonveg',
});

afterEach(() => jest.restoreAllMocks());

// ── JSON extraction ───────────────────────────────────────────────────────────

describe('AI reply JSON extraction', () => {
  test('parses a clean JSON reply', async () => {
    mockReply(JSON.stringify(aiPlan));
    const result = await run();
    expect(result.weeklyPlan).toHaveLength(1);
    expect(result.keyFocus).toBe('Progressive overload.');
  });

  test('extracts JSON wrapped in markdown fences + prose', async () => {
    mockReply('Sure! Here is your plan:\n```json\n' + JSON.stringify(aiPlan) + '\n```\nEnjoy.');
    const result = await run();
    expect(result.weeklyPlan[0].focus).toBe('Push');
    expect(result.nutritionNotes).toBe('Eat your protein.');
  });

  test('falls back when the reply contains no JSON object', async () => {
    mockReply('I cannot help with that.');
    const result = await run();
    // buildFallback emits the full hand-written PPL split (6 days).
    expect(result.weeklyPlan.length).toBeGreaterThan(1);
  });

  test('falls back on malformed JSON between the braces', async () => {
    mockReply('{ "weeklyPlan": [ , broken }');
    const result = await run();
    expect(result.weeklyPlan.length).toBeGreaterThan(1);
  });
});

// ── nutrition merge (local calc wins, not the AI) ─────────────────────────────

describe('nutrition merge', () => {
  test('macros come from calcPhaseNutrition, never from the AI reply', async () => {
    const expected = calcPhaseNutrition(pplPhase(), 2500, 60);
    // AI tries to inject its own (wrong) macros — they must be ignored.
    mockReply(JSON.stringify({ ...aiPlan, calories: 99999, protein: 1, carbs: 1, fat: 1 }));
    const result = await run();
    expect(result.calories).toBe(expected.calories);
    expect(result.protein).toBe(expected.protein);
    expect(result.calories).not.toBe(99999);
  });

  test('echoes phase number/name and stamps generatedAt', async () => {
    mockReply(JSON.stringify(aiPlan));
    const result = await run();
    expect(result.phaseNumber).toBe(pplPhase().phase);
    expect(result.phaseName).toBe(pplPhase().label);
    expect(new Date(result.generatedAt).toISOString()).toBe(result.generatedAt);
  });
});

// ── FINDING: happy path does NOT validate the AI weeklyPlan ────────────────────
//
// These are CHARACTERIZATION tests. They pin current behavior, not desired
// behavior. Today the success path trusts the model's weeklyPlan verbatim,
// whereas planEditorService.sanitizeExercise() clamps sets (1-10) / restSeconds
// and drops unknown exerciseIds. The consequence: an AI-hallucinated exerciseId
// silently breaks weeklyVolume()/the logger (BY_ID.get → undefined drops it),
// and out-of-range sets reach the UI unclamped. Whether to add sanitization
// here is a product decision (it would drop/rename AI exercises) — surfaced to
// the user, NOT fixed inside this sprint.
describe('FINDING — AI weeklyPlan is passed through unsanitized', () => {
  test('a bogus exerciseId is NOT dropped (no validation)', async () => {
    mockReply(JSON.stringify({
      ...aiPlan,
      weeklyPlan: [{ day: 'Monday', focus: 'Push', estimatedMinutes: 60, exercises: [
        { exerciseId: 'does_not_exist', name: 'Made Up Lift', sets: 4, repsDisplay: '8', restSeconds: 90, cue: '' },
      ]}],
    }));
    const result = await run();
    const ids = result.weeklyPlan.flatMap((d) => d.exercises.map((e) => e.exerciseId));
    // Gap: this id will NOT resolve in EXERCISE_DB downstream, yet it survives here.
    expect(ids).toContain('does_not_exist');
  });

  test('out-of-range sets are NOT clamped (planEditor clamps to 1-10)', async () => {
    mockReply(JSON.stringify({
      ...aiPlan,
      weeklyPlan: [{ day: 'Monday', focus: 'Push', estimatedMinutes: 60, exercises: [
        { exerciseId: 'bench_bb', name: 'Barbell Bench Press', sets: 999, repsDisplay: '8', restSeconds: 5000, cue: '' },
      ]}],
    }));
    const result = await run();
    expect(result.weeklyPlan[0].exercises[0].sets).toBe(999);
    expect(result.weeklyPlan[0].exercises[0].restSeconds).toBe(5000);
  });
});
