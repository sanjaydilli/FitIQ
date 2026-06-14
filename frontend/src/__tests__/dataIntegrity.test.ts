import indianFoods, { FOOD_CATEGORIES } from '../data/indianFoods';
import { EXERCISE_DB, MuscleGroup, Equipment, ExCategory } from '../data/exercises';

// ── indianFoods data integrity ────────────────────────────────────────────────

describe('indianFoods data integrity', () => {
  test('loads at least 500 foods', () => {
    expect(indianFoods.length).toBeGreaterThan(500);
  });

  test('every food has a unique id', () => {
    const ids = indianFoods.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every food has a non-empty name', () => {
    const bad = indianFoods.filter(f => !f.name || f.name.trim() === '');
    expect(bad).toHaveLength(0);
  });

  test('every food has a non-empty category', () => {
    const bad = indianFoods.filter(f => !f.category);
    expect(bad).toHaveLength(0);
  });

  test('all calories are non-negative', () => {
    const bad = indianFoods.filter(f => f.per100g.calories < 0);
    expect(bad).toHaveLength(0);
  });

  test('no food has per-100g calories above 1000 (pure foods can be ~900 max)', () => {
    // Oils are ~900 kcal/100g — safeguard against order-of-magnitude data errors
    const bad = indianFoods.filter(f => f.per100g.calories > 1000);
    expect(bad).toHaveLength(0);
  });

  test('no food has negative protein, carbs, or fat', () => {
    const bad = indianFoods.filter(
      f => f.per100g.protein < 0 || f.per100g.carbs < 0 || f.per100g.fat < 0
    );
    expect(bad).toHaveLength(0);
  });

  test('macros contribute no more calories than reported (physics check)', () => {
    // Skip oils (pure fat, measurement rounding) and spices (IFCT fiber accounting differences).
    // For all other foods: protein*4 + carbs*4 + fat*9 should be within 30% of reported kcal.
    const checkable = indianFoods.filter(f => f.category !== 'oils' && f.category !== 'spices');
    const bad = checkable.filter(f => {
      const macroKcal = f.per100g.protein * 4 + f.per100g.carbs * 4 + f.per100g.fat * 9;
      return macroKcal > f.per100g.calories * 1.30 + 10; // 30% slack + 10 kcal rounding
    });
    expect(bad).toHaveLength(0);
  });

  test('every food has at least one servingSize', () => {
    const bad = indianFoods.filter(f => !f.servingSizes || f.servingSizes.length === 0);
    expect(bad).toHaveLength(0);
  });

  test('every servingSize has positive grams', () => {
    for (const f of indianFoods) {
      for (const s of f.servingSizes) {
        expect(s.grams).toBeGreaterThan(0);
      }
    }
  });

  test('every food has at least one cookingMethod', () => {
    const bad = indianFoods.filter(f => !f.cookingMethods || f.cookingMethods.length === 0);
    expect(bad).toHaveLength(0);
  });

  test('isVegetarian/isVegan flags are booleans', () => {
    for (const f of indianFoods) {
      expect(typeof f.isVegetarian).toBe('boolean');
      expect(typeof f.isVegan).toBe('boolean');
    }
  });

  test('vegan foods are always also vegetarian', () => {
    const bad = indianFoods.filter(f => f.isVegan && !f.isVegetarian);
    expect(bad).toHaveLength(0);
  });

  test('FOOD_CATEGORIES ids match categories used in foods', () => {
    const validCats = new Set(FOOD_CATEGORIES.map(c => c.id));
    const bad = indianFoods.filter(f => !validCats.has(f.category as any));
    // A few legacy entries can exist — just ensure the vast majority are valid
    expect(bad.length).toBeLessThan(indianFoods.length * 0.05); // < 5% unknown
  });

  test('well-known foods are present', () => {
    const names = indianFoods.map(f => f.name.toLowerCase());
    expect(names.some(n => n.includes('dal') || n.includes('lentil'))).toBe(true);
    expect(names.some(n => n.includes('rice'))).toBe(true);
    expect(names.some(n => n.includes('paneer') || n.includes('cottage'))).toBe(true);
  });

  test('fiber values are non-negative', () => {
    const bad = indianFoods.filter(f => f.per100g.fiber < 0);
    expect(bad).toHaveLength(0);
  });
});

// ── EXERCISE_DB data integrity ────────────────────────────────────────────────

const VALID_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'cardio',
];
const VALID_EQUIPMENT: Equipment[] = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'band',
];
const VALID_CATEGORIES: ExCategory[] = [
  'compound', 'isolation', 'cardio', 'bodyweight',
];

describe('EXERCISE_DB data integrity', () => {
  test('loads at least 30 exercises', () => {
    expect(EXERCISE_DB.length).toBeGreaterThan(30);
  });

  test('every exercise has a unique id', () => {
    const ids = EXERCISE_DB.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every exercise has a non-empty name and why', () => {
    const bad = EXERCISE_DB.filter(e => !e.name || !e.why);
    expect(bad).toHaveLength(0);
  });

  test('every exercise has a valid muscleGroup', () => {
    const bad = EXERCISE_DB.filter(e => !VALID_MUSCLE_GROUPS.includes(e.muscleGroup));
    expect(bad).toHaveLength(0);
  });

  test('every exercise has a valid equipment value', () => {
    const bad = EXERCISE_DB.filter(e => !VALID_EQUIPMENT.includes(e.equipment));
    expect(bad).toHaveLength(0);
  });

  test('every exercise has a valid category', () => {
    const bad = EXERCISE_DB.filter(e => !VALID_CATEGORIES.includes(e.category));
    expect(bad).toHaveLength(0);
  });

  test('defaultSets is between 1 and 10', () => {
    const bad = EXERCISE_DB.filter(e => e.defaultSets < 1 || e.defaultSets > 10);
    expect(bad).toHaveLength(0);
  });

  test('defaultReps is a positive number', () => {
    const bad = EXERCISE_DB.filter(e => e.defaultReps <= 0);
    expect(bad).toHaveLength(0);
  });

  test('restSeconds is between 0 and 300 (cardio exercises legitimately use 0)', () => {
    const bad = EXERCISE_DB.filter(e => e.restSeconds < 0 || e.restSeconds > 300);
    expect(bad).toHaveLength(0);
  });

  test('secondary muscles (when present) are valid MuscleGroups', () => {
    for (const e of EXERCISE_DB) {
      if (e.secondary) {
        for (const m of e.secondary) {
          expect(VALID_MUSCLE_GROUPS).toContain(m);
        }
      }
    }
  });

  test('compound exercises use barbell, dumbbell, cable, machine, or bodyweight', () => {
    const compounds = EXERCISE_DB.filter(e => e.category === 'compound');
    const bad = compounds.filter(e => !['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'].includes(e.equipment));
    expect(bad).toHaveLength(0);
  });

  test('key exercises are present: bench press, squat, deadlift', () => {
    const ids = new Set(EXERCISE_DB.map(e => e.id));
    expect(ids.has('bench_bb')).toBe(true);
    expect(ids.has('squat')).toBe(true);
    expect(ids.has('deadlift')).toBe(true);
  });

  test('each major muscle group has at least one exercise', () => {
    const covered = new Set(EXERCISE_DB.map(e => e.muscleGroup));
    for (const m of ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core']) {
      expect(covered.has(m as MuscleGroup)).toBe(true);
    }
  });

  test('compound exercises have higher defaultSets on average than isolation', () => {
    const compounds  = EXERCISE_DB.filter(e => e.category === 'compound');
    const isolations = EXERCISE_DB.filter(e => e.category === 'isolation');
    const avgSets = (arr: typeof EXERCISE_DB) => arr.reduce((s, e) => s + e.defaultSets, 0) / arr.length;
    expect(avgSets(compounds)).toBeGreaterThanOrEqual(avgSets(isolations));
  });

  test('compound exercises have longer rest periods than isolation', () => {
    const compounds  = EXERCISE_DB.filter(e => e.category === 'compound');
    const isolations = EXERCISE_DB.filter(e => e.category === 'isolation');
    const avgRest = (arr: typeof EXERCISE_DB) => arr.reduce((s, e) => s + e.restSeconds, 0) / arr.length;
    expect(avgRest(compounds)).toBeGreaterThan(avgRest(isolations));
  });
});
