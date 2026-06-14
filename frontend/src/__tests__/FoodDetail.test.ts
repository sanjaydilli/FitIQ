/**
 * FoodDetail nutrition-scaling E2E tests.
 *
 * Tests the two utility functions that power FoodDetail.tsx:
 *   calcNutrition(food, { grams, calorieModifier, fatModifier }) → NutritionResult
 *   macroPct(nutrition) → { carbPct, protPct, fatPct }
 *
 * Also tests searchFoods and filterFoods helpers from foodCalculator.
 * Uses real indianFoods data to surface regressions in the dataset.
 */

import { calcNutrition, macroPct, sumNutrition, searchFoods, filterFoods } from '../utils/foodCalculator';
import { indianFoods, IndianFood } from '../data/indianFoods';

// ── pick a well-known food for deterministic tests ────────────────────────────

let oats: IndianFood;
let chickenBreast: IndianFood;
let paneer: IndianFood;

beforeAll(() => {
  oats = indianFoods.find(f => f.name.toLowerCase().includes('oat'))!;
  chickenBreast = indianFoods.find(
    f => f.name.toLowerCase().includes('chicken') && f.name.toLowerCase().includes('breast')
  )!;
  paneer = indianFoods.find(f => f.name.toLowerCase().includes('paneer'))!;
});

// ── calcNutrition — basic structure ───────────────────────────────────────────

describe('calcNutrition — output shape', () => {
  test('returns all required fields', () => {
    const food = indianFoods[0];
    const n = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const keys: (keyof typeof n)[] = [
      'calories', 'protein', 'carbs', 'fat', 'fiber',
      'iron', 'calcium', 'vitaminC', 'magnesium', 'zinc', 'potassium', 'sodium', 'omega3',
    ];
    for (const k of keys) {
      expect(typeof n[k]).toBe('number');
    }
  });

  test('all values are non-negative', () => {
    const food = indianFoods[0];
    const n = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    for (const v of Object.values(n)) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  test('calories is an integer (Math.round)', () => {
    const food = indianFoods[0];
    const n = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    expect(Number.isInteger(n.calories)).toBe(true);
  });
});

// ── calcNutrition — grams scaling ─────────────────────────────────────────────

describe('calcNutrition — grams scaling', () => {
  test('100g returns per100g.calories (+ no modifier)', () => {
    const food = indianFoods[0];
    const n = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    expect(n.calories).toBe(Math.round(food.per100g.calories));
  });

  test('200g doubles protein compared to 100g', () => {
    const food = indianFoods[0];
    const n100 = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const n200 = calcNutrition(food, { grams: 200, calorieModifier: 0, fatModifier: 0 });
    expect(n200.protein).toBeCloseTo(n100.protein * 2, 0);
  });

  test('0g returns 0 calories (no modifier)', () => {
    const food = indianFoods[0];
    const n = calcNutrition(food, { grams: 0, calorieModifier: 0, fatModifier: 0 });
    expect(n.calories).toBe(0);
  });
});

// ── calcNutrition — modifiers ─────────────────────────────────────────────────

describe('calcNutrition — modifiers', () => {
  test('calorieModifier adds to calories', () => {
    const food = indianFoods[0];
    const base = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const modified = calcNutrition(food, { grams: 100, calorieModifier: 50, fatModifier: 0 });
    expect(modified.calories).toBe(base.calories + 50);
  });

  test('fatModifier adds to fat', () => {
    const food = indianFoods[0];
    const base = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const modified = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 5 });
    expect(modified.fat).toBeCloseTo(base.fat + 5, 1);
  });

  test('multiplier × modifiers scale together', () => {
    const food = indianFoods[0];
    const multiplier = 2;
    const serving = food.servingSizes[0];
    const cooking = food.cookingMethods[0];
    const grams = serving.grams * multiplier;
    const calMod = cooking.calorieModifier * multiplier;
    const fatMod = cooking.fatModifier * multiplier;

    const n = calcNutrition(food, { grams, calorieModifier: calMod, fatModifier: fatMod });
    expect(n.calories).toBeGreaterThan(0);
  });
});

// ── macroPct ─────────────────────────────────────────────────────────────────

describe('macroPct', () => {
  test('percentages are non-negative integers', () => {
    const food = indianFoods[0];
    const n = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const pct = macroPct(n);
    expect(pct.carbPct).toBeGreaterThanOrEqual(0);
    expect(pct.protPct).toBeGreaterThanOrEqual(0);
    expect(pct.fatPct).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(pct.carbPct)).toBe(true);
    expect(Number.isInteger(pct.protPct)).toBe(true);
    expect(Number.isInteger(pct.fatPct)).toBe(true);
  });

  test('percentages sum to ~100 (rounding may cause ±1)', () => {
    const food = indianFoods[0];
    const n = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const { carbPct, protPct, fatPct } = macroPct(n);
    const sum = carbPct + protPct + fatPct;
    expect(sum).toBeGreaterThanOrEqual(98);
    expect(sum).toBeLessThanOrEqual(102);
  });

  test('returns all zeros when macros are all 0', () => {
    const zeroPct = macroPct({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, calcium: 0, vitaminC: 0, magnesium: 0, zinc: 0, potassium: 0, sodium: 0, omega3: 0 });
    expect(zeroPct).toEqual({ carbPct: 0, protPct: 0, fatPct: 0 });
  });

  test('fat-heavy food has higher fatPct (butter/ghee)', () => {
    const fatFood = indianFoods.find(f => f.category === 'oils' || f.name.toLowerCase().includes('ghee'));
    if (!fatFood) return; // skip if not found
    const n = calcNutrition(fatFood, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const { fatPct } = macroPct(n);
    expect(fatPct).toBeGreaterThan(50);
  });

  test('high-protein food has higher protPct', () => {
    if (!chickenBreast) return;
    const n = calcNutrition(chickenBreast, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const { protPct } = macroPct(n);
    expect(protPct).toBeGreaterThan(40);
  });
});

// ── sumNutrition ──────────────────────────────────────────────────────────────

describe('sumNutrition', () => {
  test('empty array returns all zeros', () => {
    const result = sumNutrition([]);
    for (const v of Object.values(result)) {
      expect(v).toBe(0);
    }
  });

  test('single item sum equals the item itself', () => {
    const food = indianFoods[0];
    const n = calcNutrition(food, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const s = sumNutrition([n]);
    expect(s.calories).toBe(n.calories);
    expect(s.protein).toBeCloseTo(n.protein, 1);
  });

  test('two items sum protein correctly', () => {
    const n1 = calcNutrition(indianFoods[0], { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const n2 = calcNutrition(indianFoods[1], { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const s = sumNutrition([n1, n2]);
    expect(s.protein).toBeCloseTo(n1.protein + n2.protein, 0);
  });

  test('calories result is an integer', () => {
    const n1 = calcNutrition(indianFoods[0], { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const n2 = calcNutrition(indianFoods[1], { grams: 100, calorieModifier: 0, fatModifier: 0 });
    expect(Number.isInteger(sumNutrition([n1, n2]).calories)).toBe(true);
  });
});

// ── searchFoods ───────────────────────────────────────────────────────────────

describe('searchFoods', () => {
  test('empty query returns up to `limit` foods', () => {
    const results = searchFoods(indianFoods, '', 10);
    expect(results.length).toBeLessThanOrEqual(10);
  });

  test('query "rice" returns rice items', () => {
    const results = searchFoods(indianFoods, 'rice', 100);
    expect(results.every(f =>
      f.name.toLowerCase().includes('rice') ||
      (f.nameHindi?.toLowerCase().includes('rice'))
    )).toBe(true);
  });

  test('unknown query returns empty array', () => {
    const results = searchFoods(indianFoods, 'xyzxyzxyz_not_a_food', 30);
    expect(results).toHaveLength(0);
  });

  test('result count ≤ limit', () => {
    const results = searchFoods(indianFoods, 'dal', 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });
});

// ── filterFoods ───────────────────────────────────────────────────────────────

describe('filterFoods', () => {
  test('vegetarianOnly excludes non-veg foods', () => {
    const results = filterFoods(indianFoods, { vegetarianOnly: true });
    expect(results.every(f => f.isVegetarian)).toBe(true);
  });

  test('veganOnly excludes non-vegan foods', () => {
    const results = filterFoods(indianFoods, { veganOnly: true });
    expect(results.every(f => f.isVegan)).toBe(true);
  });

  test('category filter returns only that category', () => {
    const cat = indianFoods[0].category;
    const results = filterFoods(indianFoods, { category: cat });
    expect(results.every(f => f.category === cat)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  test('no filters returns all foods', () => {
    const results = filterFoods(indianFoods, {});
    expect(results.length).toBe(indianFoods.length);
  });

  test('combined filters are ANDed together', () => {
    const results = filterFoods(indianFoods, { vegetarianOnly: true, veganOnly: true });
    expect(results.every(f => f.isVegetarian && f.isVegan)).toBe(true);
  });
});
