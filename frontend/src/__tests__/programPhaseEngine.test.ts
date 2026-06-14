import {
  buildPhaseSpecs, calcPhaseNutrition, ProgramConfig,
} from '../services/programPhaseEngine';

const BASE_CONFIG: ProgramConfig = {
  id: 'test-program',
  type: 'muscle_gain',
  durationMonths: 3,
  startDate: '2026-01-01',
  startWeight: 70,
  startLeanMass: 56,
  startBodyFatPct: 20,
  startTDEE: 2200,
  sex: 'male',
  heightCm: 175,
  age: 25,
  activity: 'moderate',
};

describe('buildPhaseSpecs', () => {
  test('returns exactly 3 phases for a 3-month program', () => {
    expect(buildPhaseSpecs(BASE_CONFIG)).toHaveLength(3);
  });

  test('phases are numbered 1, 2, 3', () => {
    const phases = buildPhaseSpecs(BASE_CONFIG);
    expect(phases.map(p => p.phase)).toEqual([1, 2, 3]);
  });

  test('phase startDate and endDate are valid YYYY-MM-DD strings', () => {
    const phases = buildPhaseSpecs(BASE_CONFIG);
    phases.forEach(p => {
      expect(p.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test('each phase endDate equals next phase startDate', () => {
    const phases = buildPhaseSpecs(BASE_CONFIG);
    expect(phases[0].endDate).toBe(phases[1].startDate);
    expect(phases[1].endDate).toBe(phases[2].startDate);
  });

  test('phase 1 starts on the program startDate', () => {
    const phases = buildPhaseSpecs(BASE_CONFIG);
    expect(phases[0].startDate).toBe(BASE_CONFIG.startDate);
  });

  test('works for all 4 program types', () => {
    (['muscle_gain', 'body_recomp', 'fat_loss', 'strength'] as const).forEach(type => {
      const phases = buildPhaseSpecs({ ...BASE_CONFIG, type });
      expect(phases).toHaveLength(3);
    });
  });

  test('fat_loss phase 1 has negative calorieOffset', () => {
    const phases = buildPhaseSpecs({ ...BASE_CONFIG, type: 'fat_loss' });
    expect(phases[0].calorieOffset).toBeLessThan(0);
  });

  test('muscle_gain phase 1 has positive calorieOffset', () => {
    const phases = buildPhaseSpecs({ ...BASE_CONFIG, type: 'muscle_gain' });
    expect(phases[0].calorieOffset).toBeGreaterThan(0);
  });
});

describe('calcPhaseNutrition', () => {
  const phase = buildPhaseSpecs(BASE_CONFIG)[0]; // muscle_gain phase 1
  const tdee = 2200;
  const leanMassKg = 56;

  test('calories = TDEE + calorieOffset (above 1200 floor)', () => {
    const { calories } = calcPhaseNutrition(phase, tdee, leanMassKg);
    expect(calories).toBe(Math.max(1200, tdee + phase.calorieOffset));
  });

  test('protein = leanMass × proteinMultiplier (rounded)', () => {
    const { protein } = calcPhaseNutrition(phase, tdee, leanMassKg);
    expect(protein).toBe(Math.round(leanMassKg * phase.proteinMultiplier));
  });

  test('all macro values are positive integers', () => {
    const n = calcPhaseNutrition(phase, tdee, leanMassKg);
    expect(n.calories).toBeGreaterThan(0);
    expect(n.protein).toBeGreaterThan(0);
    expect(n.carbs).toBeGreaterThan(0);
    expect(n.fat).toBeGreaterThan(0);
    expect(Number.isInteger(n.calories)).toBe(true);
    expect(Number.isInteger(n.protein)).toBe(true);
  });

  test('1200 kcal floor is respected for extreme deficit', () => {
    // Simulate TDEE 1400 with a -500 offset phase
    const deficitPhase = { ...phase, calorieOffset: -500 };
    const { calories } = calcPhaseNutrition(deficitPhase, 1400, leanMassKg);
    expect(calories).toBe(1200);
  });

  test('higher TDEE gives more calories', () => {
    const low  = calcPhaseNutrition(phase, 2000, leanMassKg);
    const high = calcPhaseNutrition(phase, 2800, leanMassKg);
    expect(high.calories).toBeGreaterThan(low.calories);
  });

  test('more lean mass gives more protein', () => {
    const light = calcPhaseNutrition(phase, tdee, 50);
    const heavy = calcPhaseNutrition(phase, tdee, 70);
    expect(heavy.protein).toBeGreaterThan(light.protein);
  });
});
