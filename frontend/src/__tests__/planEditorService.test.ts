import {
  sanitizeWeeklyPlan,
  estimateMinutes,
  makeExercise,
  weeklyVolume,
} from '../services/planEditorService';
import { EXERCISE_DB } from '../data/exercises';
import { PlannedExercise, DayPlan } from '../services/programPlannerService';

// ── helpers ───────────────────────────────────────────────────────────────────

const benchTmpl = EXERCISE_DB.find(e => e.id === 'bench_bb')!;
const squatTmpl = EXERCISE_DB.find(e => e.id === 'squat')!;
const deadliftTmpl = EXERCISE_DB.find(e => e.id === 'deadlift')!;
const latRaiseTmpl = EXERCISE_DB.find(e => e.id === 'lat_raise')!;

function makePlannedExercise(overrides: Partial<PlannedExercise> = {}): PlannedExercise {
  return {
    exerciseId: 'bench_bb',
    name: 'Barbell Bench Press',
    sets: 4,
    repsDisplay: '8-10',
    restSeconds: 90,
    cue: 'Press hard',
    ...overrides,
  };
}

function makeDayPlan(exercises: PlannedExercise[] = [makePlannedExercise()]): DayPlan {
  return {
    day: 'Monday',
    focus: 'Chest',
    estimatedMinutes: 60,
    exercises,
  };
}

// ── estimateMinutes ───────────────────────────────────────────────────────────

describe('estimateMinutes', () => {
  test('empty array returns 0', () => {
    expect(estimateMinutes([])).toBe(0);
  });

  test('enforces 20-minute minimum', () => {
    // Single exercise, 1 set, short rest → still ≥ 20 min
    const ex = makePlannedExercise({ sets: 1, restSeconds: 15 });
    expect(estimateMinutes([ex])).toBeGreaterThanOrEqual(20);
  });

  test('result is always a multiple of 5', () => {
    const exs = [
      makePlannedExercise({ sets: 4, restSeconds: 90 }),
      makePlannedExercise({ sets: 3, restSeconds: 60 }),
      makePlannedExercise({ sets: 3, restSeconds: 75 }),
    ];
    const mins = estimateMinutes(exs);
    expect(mins % 5).toBe(0);
  });

  test('formula: 3 exercises, all sets=4 rest=90 → 50 min', () => {
    // sec = 600 + 3×4×(45+90) + 3×90 = 600 + 1620 + 270 = 2490
    // round(2490/300)*5 = 8*5 = 40 → max(20,40) = 40
    // Actually: 600 + 3*4*(45+90) + 3*90 = 600 + 12*135 + 270 = 600+1620+270=2490
    // round(2490/300)=round(8.3)=8 → 8*5=40
    const exs = Array.from({ length: 3 }, () => makePlannedExercise({ sets: 4, restSeconds: 90 }));
    expect(estimateMinutes(exs)).toBe(40);
  });

  test('more exercises takes more time', () => {
    const few = Array.from({ length: 2 }, () => makePlannedExercise({ sets: 4, restSeconds: 90 }));
    const many = Array.from({ length: 8 }, () => makePlannedExercise({ sets: 4, restSeconds: 90 }));
    expect(estimateMinutes(many)).toBeGreaterThan(estimateMinutes(few));
  });

  test('higher rest seconds increases time', () => {
    const short = [makePlannedExercise({ sets: 4, restSeconds: 30 })];
    const long  = [makePlannedExercise({ sets: 4, restSeconds: 180 })];
    expect(estimateMinutes(long)).toBeGreaterThanOrEqual(estimateMinutes(short));
  });

  test('more sets increases time', () => {
    const light = [makePlannedExercise({ sets: 2, restSeconds: 90 })];
    const heavy = [makePlannedExercise({ sets: 8, restSeconds: 90 })];
    expect(estimateMinutes(heavy)).toBeGreaterThan(estimateMinutes(light));
  });
});

// ── makeExercise ──────────────────────────────────────────────────────────────

describe('makeExercise', () => {
  test('returns correct exerciseId and name from template', () => {
    const ex = makeExercise(benchTmpl);
    expect(ex.exerciseId).toBe('bench_bb');
    expect(ex.name).toBe('Barbell Bench Press');
  });

  test('uses defaultSets, restSeconds from template', () => {
    const ex = makeExercise(benchTmpl);
    expect(ex.sets).toBe(benchTmpl.defaultSets);
    expect(ex.restSeconds).toBe(benchTmpl.restSeconds);
  });

  test('repsDisplay is the default reps as a string', () => {
    const ex = makeExercise(benchTmpl);
    expect(ex.repsDisplay).toBe(String(benchTmpl.defaultReps));
  });

  test('cue is the first sentence of the why field', () => {
    const ex = makeExercise(benchTmpl);
    expect(ex.cue).toBe(benchTmpl.why.split('.')[0]);
  });

  test('works for all exercises in EXERCISE_DB', () => {
    for (const tmpl of EXERCISE_DB) {
      const ex = makeExercise(tmpl);
      expect(ex.exerciseId).toBe(tmpl.id);
      expect(typeof ex.cue).toBe('string');
    }
  });
});

// ── sanitizeWeeklyPlan ────────────────────────────────────────────────────────

describe('sanitizeWeeklyPlan', () => {
  const validRawEx = {
    exerciseId: 'bench_bb',
    name: 'Barbell Bench Press',
    sets: 4,
    repsDisplay: '8',
    restSeconds: 90,
    cue: '',
  };
  const validRawDay = { day: 'Monday', focus: 'Chest', exercises: [validRawEx] };

  test('null → null', () => {
    expect(sanitizeWeeklyPlan(null)).toBeNull();
  });

  test('non-array → null', () => {
    expect(sanitizeWeeklyPlan({ exercises: [] })).toBeNull();
    expect(sanitizeWeeklyPlan('bad')).toBeNull();
    expect(sanitizeWeeklyPlan(42)).toBeNull();
  });

  test('empty array → null', () => {
    expect(sanitizeWeeklyPlan([])).toBeNull();
  });

  test('day with zero valid exercises is dropped', () => {
    const raw = [{ day: 'Mon', exercises: [{ exerciseId: 'nonexistent_id' }] }];
    expect(sanitizeWeeklyPlan(raw)).toBeNull();
  });

  test('valid input returns DayPlan array', () => {
    const result = sanitizeWeeklyPlan([validRawDay]);
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBe(1);
  });

  test('returned DayPlan has correct shape', () => {
    const result = sanitizeWeeklyPlan([validRawDay]);
    const day = result![0];
    expect(day.day).toBe('Monday');
    expect(day.focus).toBe('Chest');
    expect(typeof day.estimatedMinutes).toBe('number');
    expect(Array.isArray(day.exercises)).toBe(true);
    expect(day.exercises.length).toBe(1);
  });

  test('resolved exercise has correct exerciseId', () => {
    const result = sanitizeWeeklyPlan([validRawDay]);
    expect(result![0].exercises[0].exerciseId).toBe('bench_bb');
  });

  test('max 7 days enforced', () => {
    const days = Array.from({ length: 10 }, (_, i) => ({
      day: `Day ${i + 1}`,
      focus: 'Training',
      exercises: [validRawEx],
    }));
    const result = sanitizeWeeklyPlan(days);
    expect(result!.length).toBeLessThanOrEqual(7);
  });

  test('max 10 exercises per day enforced', () => {
    const manyExercises = Array.from({ length: 15 }, () => validRawEx);
    const result = sanitizeWeeklyPlan([{ day: 'Mon', focus: 'All', exercises: manyExercises }]);
    expect(result![0].exercises.length).toBeLessThanOrEqual(10);
  });

  test('fuzzy name match: "bench press" resolves to Barbell Bench Press', () => {
    const rawWithPartialName = {
      day: 'Monday',
      focus: 'Chest',
      exercises: [{ name: 'bench press', sets: 3, repsDisplay: '8', restSeconds: 90 }],
    };
    const result = sanitizeWeeklyPlan([rawWithPartialName]);
    expect(result).not.toBeNull();
    expect(result![0].exercises[0].name).toBe('Barbell Bench Press');
  });

  test('sets are clamped to [1, 10]', () => {
    const raw = [{ day: 'Mon', focus: 'X', exercises: [{ ...validRawEx, sets: 99 }] }];
    const result = sanitizeWeeklyPlan(raw);
    expect(result![0].exercises[0].sets).toBeLessThanOrEqual(10);
  });

  test('restSeconds clamped to [15, 300]', () => {
    const rawLow = [{ day: 'Mon', focus: 'X', exercises: [{ ...validRawEx, restSeconds: 0 }] }];
    const rawHigh = [{ day: 'Mon', focus: 'X', exercises: [{ ...validRawEx, restSeconds: 9999 }] }];
    expect(sanitizeWeeklyPlan(rawLow)![0].exercises[0].restSeconds).toBeGreaterThanOrEqual(15);
    expect(sanitizeWeeklyPlan(rawHigh)![0].exercises[0].restSeconds).toBeLessThanOrEqual(300);
  });

  test('estimatedMinutes is derived from math (not AI value)', () => {
    const raw = [{ day: 'Mon', focus: 'X', estimatedMinutes: 999, exercises: [validRawEx] }];
    const result = sanitizeWeeklyPlan(raw);
    // Our formula: not 999 — it's always recalculated
    expect(result![0].estimatedMinutes).not.toBe(999);
    expect(result![0].estimatedMinutes % 5).toBe(0);
  });

  test('multiple valid days are all included', () => {
    const days = [
      { day: 'Monday', focus: 'Chest', exercises: [validRawEx] },
      { day: 'Wednesday', focus: 'Back', exercises: [{ exerciseId: 'deadlift', ...validRawEx }] },
    ];
    const result = sanitizeWeeklyPlan(days);
    expect(result!.length).toBe(2);
  });
});

// ── weeklyVolume ──────────────────────────────────────────────────────────────

describe('weeklyVolume', () => {
  test('empty days returns empty array', () => {
    expect(weeklyVolume([])).toEqual([]);
  });

  test('returns MuscleVolume entries only for trained muscles', () => {
    const day = makeDayPlan([makePlannedExercise()]);
    const vol = weeklyVolume([day]);
    const muscles = vol.map(v => v.muscle);
    expect(muscles).toContain('chest'); // bench_bb primary
    expect(muscles).toContain('triceps'); // bench_bb secondary
    expect(muscles).toContain('shoulders'); // bench_bb secondary
  });

  test('primary muscle gets full set count', () => {
    const day = makeDayPlan([makePlannedExercise({ sets: 4 })]);
    const vol = weeklyVolume([day]);
    const chest = vol.find(v => v.muscle === 'chest')!;
    expect(chest.sets).toBe(4);
  });

  test('secondary muscles get half set count', () => {
    const day = makeDayPlan([makePlannedExercise({ sets: 4 })]);
    // bench_bb secondary: triceps, shoulders
    const vol = weeklyVolume([day]);
    const triceps = vol.find(v => v.muscle === 'triceps')!;
    expect(triceps.sets).toBe(2); // 4 * 0.5
  });

  test('status is "low" when sets < 10', () => {
    const day = makeDayPlan([makePlannedExercise({ sets: 4 })]);
    const vol = weeklyVolume([day]);
    const chest = vol.find(v => v.muscle === 'chest')!;
    expect(chest.status).toBe('low');
  });

  test('status is "optimal" when sets 10–20', () => {
    // Need 10+ chest sets: 3 days × bench_bb 4 sets = 12
    const days: DayPlan[] = Array.from({ length: 3 }, (_, i) => ({
      day: `Day ${i + 1}`,
      focus: 'Chest',
      estimatedMinutes: 60,
      exercises: [makePlannedExercise({ sets: 4 })],
    }));
    const vol = weeklyVolume(days);
    const chest = vol.find(v => v.muscle === 'chest')!;
    expect(chest.sets).toBe(12);
    expect(chest.status).toBe('optimal');
  });

  test('status is "high" when sets > 20', () => {
    const days: DayPlan[] = Array.from({ length: 6 }, (_, i) => ({
      day: `Day ${i + 1}`,
      focus: 'Chest',
      estimatedMinutes: 60,
      exercises: [makePlannedExercise({ sets: 4 })],
    }));
    const vol = weeklyVolume(days);
    const chest = vol.find(v => v.muscle === 'chest')!;
    expect(chest.sets).toBe(24);
    expect(chest.status).toBe('high');
  });

  test('sets accumulate across multiple days', () => {
    const days: DayPlan[] = [
      makeDayPlan([makePlannedExercise({ sets: 4 })]),
      makeDayPlan([makePlannedExercise({ sets: 3 })]),
    ];
    const vol = weeklyVolume(days);
    const chest = vol.find(v => v.muscle === 'chest')!;
    expect(chest.sets).toBe(7);
  });

  test('unknown exerciseId is ignored (no crash)', () => {
    const day = makeDayPlan([makePlannedExercise({ exerciseId: 'does_not_exist' })]);
    expect(() => weeklyVolume([day])).not.toThrow();
  });

  test('multiple muscle groups tracked independently', () => {
    const squatEx: PlannedExercise = {
      exerciseId: 'squat',
      name: 'Barbell Back Squat',
      sets: 4,
      repsDisplay: '8',
      restSeconds: 180,
      cue: '',
    };
    const day = makeDayPlan([makePlannedExercise({ sets: 4 }), squatEx]);
    const vol = weeklyVolume([day]);
    const muscles = vol.map(v => v.muscle);
    expect(muscles).toContain('chest');
    expect(muscles).toContain('legs');
  });
});
