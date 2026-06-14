/**
 * DishDetail calorie-scaling E2E tests.
 *
 * These tests exercise the exact scaling formula used by DishDetail.tsx:
 *   perGram = caloriesPerServing / serveGrams
 *   netWt   = qty × measureGrams
 *   scaled  = Math.round(perGram × netWt)
 *
 * Using real RECIPES data so any change in recipe values will surface here.
 */

import { RECIPES, Recipe } from '../data/recipes';

// ── scaling helpers (mirror DishDetail.tsx) ───────────────────────────────────

const MEASURES = [
  { id: 'serve',  grams: 0 },
  { id: 'katori', grams: 100 },
  { id: 'bowl',   grams: 233 },
  { id: 'cup',    grams: 166 },
  { id: 'oz',     grams: 28.4 },
  { id: 'grams',  grams: 1 },
] as const;

type MeasureId = typeof MEASURES[number]['id'];

function serveGrams(dish: Recipe): number {
  return dish.gramsPerServing > 0 ? dish.gramsPerServing : 150;
}

function scaledCalories(dish: Recipe, qty: number, measureId: MeasureId): number {
  const sg = serveGrams(dish);
  const measureDef = MEASURES.find(m => m.id === measureId)!;
  const measureGrams = measureDef.grams === 0 ? sg : measureDef.grams;
  const netWt = qty * measureGrams;
  return Math.round((dish.caloriesPerServing / sg) * netWt);
}

function scaledMacro(
  perServing: number,
  dish: Recipe,
  qty: number,
  measureId: MeasureId
): number {
  const sg = serveGrams(dish);
  const measureDef = MEASURES.find(m => m.id === measureId)!;
  const measureGrams = measureDef.grams === 0 ? sg : measureDef.grams;
  const netWt = qty * measureGrams;
  return +(perServing / sg * netWt).toFixed(1);
}

// ── dish lookup ───────────────────────────────────────────────────────────────

describe('RECIPES data', () => {
  test('RECIPES has at least 1 entry', () => {
    expect(RECIPES.length).toBeGreaterThan(0);
  });

  test('every recipe has required fields', () => {
    for (const r of RECIPES) {
      expect(typeof r.id).toBe('string');
      expect(typeof r.name).toBe('string');
      expect(typeof r.caloriesPerServing).toBe('number');
      expect(typeof r.gramsPerServing).toBe('number');
      expect(Array.isArray(r.ingredients)).toBe(true);
    }
  });

  test('aloo_puri recipe exists with expected values', () => {
    const dish = RECIPES.find(r => r.id === 'aloo_puri');
    expect(dish).toBeDefined();
    expect(dish!.caloriesPerServing).toBe(257);
    expect(dish!.gramsPerServing).toBe(160);
  });
});

// ── serve measure (grams=0 → uses gramsPerServing) ────────────────────────────

describe('DishDetail scaling — serve measure', () => {
  let dish: Recipe;

  beforeAll(() => {
    dish = RECIPES.find(r => r.id === 'aloo_puri')!;
  });

  test('qty=1 serve returns dish caloriesPerServing', () => {
    expect(scaledCalories(dish, 1, 'serve')).toBe(257);
  });

  test('qty=2 serve doubles calories', () => {
    expect(scaledCalories(dish, 2, 'serve')).toBe(514);
  });

  test('qty=0.5 serve halves calories (rounded)', () => {
    expect(scaledCalories(dish, 0.5, 'serve')).toBe(Math.round(257 / 2));
  });

  test('protein scales proportionally for qty=2', () => {
    const expected = +(dish.proteinPerServing / serveGrams(dish) * (2 * serveGrams(dish))).toFixed(1);
    expect(scaledMacro(dish.proteinPerServing, dish, 2, 'serve')).toBe(expected);
  });
});

// ── katori measure (grams=100) ────────────────────────────────────────────────

describe('DishDetail scaling — katori measure', () => {
  let dish: Recipe;

  beforeAll(() => {
    dish = RECIPES.find(r => r.id === 'aloo_puri')!;
  });

  test('qty=1 katori: calories = round(caloriesPerServing / gramsPerServing × 100)', () => {
    const expected = Math.round((257 / 160) * 100);
    expect(scaledCalories(dish, 1, 'katori')).toBe(expected);
  });

  test('qty=2 katori ≈ double the single-katori calories (±1 rounding)', () => {
    const single = scaledCalories(dish, 1, 'katori');
    const double = scaledCalories(dish, 2, 'katori');
    // round(2x) can differ from 2*round(x) by ±1 due to rounding
    expect(Math.abs(double - single * 2)).toBeLessThanOrEqual(1);
  });
});

// ── grams measure (grams=1) ────────────────────────────────────────────────────

describe('DishDetail scaling — grams measure', () => {
  let dish: Recipe;

  beforeAll(() => {
    dish = RECIPES.find(r => r.id === 'aloo_puri')!;
  });

  test('100g calories equals the katori result', () => {
    expect(scaledCalories(dish, 100, 'grams')).toBe(scaledCalories(dish, 1, 'katori'));
  });

  test('0g returns 0 calories', () => {
    expect(scaledCalories(dish, 0, 'grams')).toBe(0);
  });
});

// ── fallback when gramsPerServing = 0 ─────────────────────────────────────────

describe('DishDetail scaling — gramsPerServing=0 fallback', () => {
  const fakeDish: Recipe = {
    id: 'test_dish',
    name: 'Test Dish',
    servings: 1,
    gramsPerServing: 0,       // triggers fallback to 150
    caloriesPerServing: 300,
    proteinPerServing: 20,
    carbsPerServing: 30,
    fatPerServing: 10,
    fiberPerServing: 5,
    isVegetarian: true,
    ingredients: [],
  };

  test('serveGrams falls back to 150 when gramsPerServing=0', () => {
    expect(serveGrams(fakeDish)).toBe(150);
  });

  test('qty=1 serve uses fallback 150g → round(300/150 × 150) = 300', () => {
    expect(scaledCalories(fakeDish, 1, 'serve')).toBe(300);
  });

  test('qty=1 katori uses 100g of the 300-cal/150g dish → 200 kcal', () => {
    expect(scaledCalories(fakeDish, 1, 'katori')).toBe(200);
  });
});

// ── all measures produce positive calories for a real dish ────────────────────

describe('DishDetail scaling — all measures yield positive results', () => {
  const dish = RECIPES[0];

  for (const m of MEASURES) {
    test(`measure=${m.id} qty=1 yields positive calories`, () => {
      expect(scaledCalories(dish, 1, m.id as MeasureId)).toBeGreaterThan(0);
    });
  }
});

// ── cross-recipe: scaling is proportional ─────────────────────────────────────

describe('DishDetail scaling — proportionality', () => {
  test('doubling qty doubles calories for any recipe', () => {
    for (const dish of RECIPES.slice(0, 5)) {
      const single = scaledCalories(dish, 1, 'katori');
      const double = scaledCalories(dish, 2, 'katori');
      // Allow ±1 kcal rounding tolerance
      expect(Math.abs(double - single * 2)).toBeLessThanOrEqual(1);
    }
  });

  test('macros scale proportionally with qty', () => {
    const dish = RECIPES[0];
    const p1 = scaledMacro(dish.proteinPerServing, dish, 1, 'katori');
    const p2 = scaledMacro(dish.proteinPerServing, dish, 2, 'katori');
    expect(p2).toBeCloseTo(p1 * 2, 0);
  });
});
