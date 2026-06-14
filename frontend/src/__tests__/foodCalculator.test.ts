import { calcNutrition, sumNutrition, searchFoods, filterFoods, macroPct } from '../utils/foodCalculator';
import { IndianFood } from '../data/indianFoods';

const mockFood: IndianFood = {
  id: 'test_dal',
  name: 'Test Dal',
  nameHindi: 'टेस्ट दाल',
  nameTamil: null,
  nameKannada: null,
  grup: 'Pulses',
  category: 'pulses',
  region: 'Pan India',
  isVegetarian: true,
  isVegan: true,
  isGlutenFree: true,
  servingSizes: [{ name: '1 katori (100g)', grams: 100 }],
  cookingMethods: [{ method: 'Boiled', calorieModifier: 0, fatModifier: 0 }],
  per100g: {
    calories: 100, protein: 8, carbs: 14, fat: 2, fiber: 4,
    iron: 2, calcium: 50, vitaminC: 0, magnesium: 30, zinc: 1,
    potassium: 300, sodium: 10, omega3: 0.05,
  },
};

describe('calcNutrition', () => {
  test('100g serving with no modifiers', () => {
    const n = calcNutrition(mockFood, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    expect(n.calories).toBe(100);
    expect(n.protein).toBe(8);
    expect(n.carbs).toBe(14);
    expect(n.fat).toBe(2);
    expect(n.fiber).toBe(4);
  });

  test('200g serving doubles all values', () => {
    const n = calcNutrition(mockFood, { grams: 200, calorieModifier: 0, fatModifier: 0 });
    expect(n.calories).toBe(200);
    expect(n.protein).toBe(16);
    expect(n.carbs).toBe(28);
    expect(n.fat).toBe(4);
  });

  test('50g serving halves all values', () => {
    const n = calcNutrition(mockFood, { grams: 50, calorieModifier: 0, fatModifier: 0 });
    expect(n.calories).toBe(50);
    expect(n.protein).toBe(4);
    expect(n.fat).toBe(1);
  });

  test('calorieModifier adds to calories', () => {
    const n = calcNutrition(mockFood, { grams: 100, calorieModifier: 50, fatModifier: 0 });
    expect(n.calories).toBe(150);
  });

  test('fatModifier adds to fat', () => {
    const n = calcNutrition(mockFood, { grams: 100, calorieModifier: 0, fatModifier: 3 });
    expect(n.fat).toBe(5);
  });

  test('zero grams returns all zeros', () => {
    const n = calcNutrition(mockFood, { grams: 0, calorieModifier: 0, fatModifier: 0 });
    expect(n.calories).toBe(0);
    expect(n.protein).toBe(0);
  });
});

describe('sumNutrition', () => {
  const n1 = calcNutrition(mockFood, { grams: 100, calorieModifier: 0, fatModifier: 0 });
  const n2 = calcNutrition(mockFood, { grams: 100, calorieModifier: 0, fatModifier: 0 });

  test('sums two identical servings', () => {
    const total = sumNutrition([n1, n2]);
    expect(total.calories).toBe(200);
    expect(total.protein).toBe(16);
    expect(total.carbs).toBe(28);
    expect(total.fat).toBe(4);
  });

  test('empty array returns zeros', () => {
    const total = sumNutrition([]);
    expect(total.calories).toBe(0);
    expect(total.protein).toBe(0);
  });
});

describe('macroPct', () => {
  test('pcts add up to ~100', () => {
    const n = calcNutrition(mockFood, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const pct = macroPct(n);
    expect(pct.carbPct + pct.protPct + pct.fatPct).toBeCloseTo(100, 0);
  });

  test('returns all zeros for zero-macro food', () => {
    const pct = macroPct({ ...calcNutrition(mockFood, { grams: 0, calorieModifier: 0, fatModifier: 0 }) });
    expect(pct.carbPct).toBe(0);
    expect(pct.protPct).toBe(0);
    expect(pct.fatPct).toBe(0);
  });

  test('high-carb food has highest carbPct', () => {
    const highCarb = { ...mockFood, per100g: { ...mockFood.per100g, carbs: 80, protein: 5, fat: 1 } };
    const n = calcNutrition(highCarb, { grams: 100, calorieModifier: 0, fatModifier: 0 });
    const pct = macroPct(n);
    expect(pct.carbPct).toBeGreaterThan(pct.protPct);
    expect(pct.carbPct).toBeGreaterThan(pct.fatPct);
  });
});

describe('searchFoods', () => {
  const foods = [mockFood, { ...mockFood, id: 'paneer', name: 'Paneer', nameHindi: 'पनीर' }];

  test('empty query returns up to limit', () => {
    expect(searchFoods(foods, '', 10).length).toBe(2);
  });

  test('matches by English name', () => {
    const r = searchFoods(foods, 'paneer');
    expect(r.length).toBe(1);
    expect(r[0].name).toBe('Paneer');
  });

  test('matches by Hindi name', () => {
    const r = searchFoods(foods, 'पनीर');
    expect(r[0].name).toBe('Paneer');
  });

  test('case-insensitive match', () => {
    expect(searchFoods(foods, 'PANEER').length).toBe(1);
  });

  test('no match returns empty', () => {
    expect(searchFoods(foods, 'xyz123').length).toBe(0);
  });

  test('respects limit', () => {
    expect(searchFoods(foods, '', 1).length).toBe(1);
  });
});

describe('filterFoods', () => {
  const veg   = { ...mockFood, id: 'veg',   isVegetarian: true,  isVegan: false, isGlutenFree: true,  category: 'pulses' };
  const vegan = { ...mockFood, id: 'vegan', isVegetarian: true,  isVegan: true,  isGlutenFree: false, category: 'grains' };
  const nonv  = { ...mockFood, id: 'nonv',  isVegetarian: false, isVegan: false, isGlutenFree: false, category: 'pulses' };
  const foods = [veg, vegan, nonv];

  test('no filter returns all', () => {
    expect(filterFoods(foods, {}).length).toBe(3);
  });

  test('vegetarianOnly excludes non-veg', () => {
    const r = filterFoods(foods, { vegetarianOnly: true });
    expect(r.every(f => f.isVegetarian)).toBe(true);
    expect(r.length).toBe(2);
  });

  test('veganOnly returns only vegan', () => {
    const r = filterFoods(foods, { veganOnly: true });
    expect(r.every(f => f.isVegan)).toBe(true);
    expect(r.length).toBe(1);
  });

  test('glutenFreeOnly filters correctly', () => {
    expect(filterFoods(foods, { glutenFreeOnly: true }).length).toBe(1);
  });

  test('category filter works', () => {
    expect(filterFoods(foods, { category: 'pulses' }).length).toBe(2);
    expect(filterFoods(foods, { category: 'grains' }).length).toBe(1);
  });

  test('combined filters narrow results', () => {
    const r = filterFoods(foods, { category: 'pulses', vegetarianOnly: true });
    expect(r.length).toBe(1);
    expect(r[0].id).toBe('veg');
  });
});
