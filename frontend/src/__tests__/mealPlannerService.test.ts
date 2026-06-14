import {
  parsePreferences,
  buildMathPlan,
  swapMeal,
  generateMealPlan,
  loadPrefs,
  savePrefs,
  loadLastPlan,
  saveLastPlan,
  PlanParams,
  MealPlan,
} from '../services/mealPlannerService';
import RECIPES from '../data/recipes';

const BASE_PARAMS: PlanParams = {
  targetCalories: 2200,
  targetProtein: 150,
  goal: 'gain',
  diet: 'nveg',
  preferences: '',
  seed: 0,
};

// ── parsePreferences ──────────────────────────────────────────────────────────

describe('parsePreferences', () => {
  test('empty string returns empty arrays', () => {
    const r = parsePreferences('');
    expect(r.include).toEqual([]);
    expect(r.exclude).toEqual([]);
  });

  test('"no paneer" → exclude paneer', () => {
    const r = parsePreferences('no paneer');
    expect(r.exclude).toContain('paneer');
    expect(r.include).toHaveLength(0);
  });

  test('"love dosa" → include dosa', () => {
    const r = parsePreferences('love dosa');
    expect(r.include).toContain('dosa');
    expect(r.exclude).toHaveLength(0);
  });

  test('"no paneer, love dosa" → both populated', () => {
    const r = parsePreferences('no paneer, love dosa');
    expect(r.exclude).toContain('paneer');
    expect(r.include).toContain('dosa');
  });

  test('"avoid eggs and dairy" → splits on "and"', () => {
    const r = parsePreferences('avoid eggs and dairy');
    expect(r.exclude).toContain('eggs');
    expect(r.exclude).toContain('dairy');
  });

  test('period acts like comma separator', () => {
    const r = parsePreferences('no paneer. love dosa');
    expect(r.exclude).toContain('paneer');
    expect(r.include).toContain('dosa');
  });

  test('semicolon acts like comma separator', () => {
    const r = parsePreferences('no paneer; love dosa');
    expect(r.exclude).toContain('paneer');
    expect(r.include).toContain('dosa');
  });

  test('"hate chicken, skip rice" → both excluded', () => {
    const r = parsePreferences('hate chicken, skip rice');
    expect(r.exclude).toContain('chicken');
    expect(r.exclude).toContain('rice');
  });

  test('"i love paneer and dosa" → splits on "and"', () => {
    const r = parsePreferences('i love paneer and dosa');
    expect(r.include).toContain('paneer');
    expect(r.include).toContain('dosa');
  });

  test('"prefer south indian" → strips prefix', () => {
    const r = parsePreferences('prefer south indian');
    expect(r.include).toContain('south indian');
  });

  test('"allergic to nuts" → excludes nuts', () => {
    const r = parsePreferences('allergic to nuts');
    expect(r.exclude).toContain('nuts');
  });

  test('"enjoy oats, no sugar" → include + exclude', () => {
    const r = parsePreferences('enjoy oats, no sugar');
    expect(r.include).toContain('oats');
    expect(r.exclude).toContain('sugar');
  });
});

// ── buildMathPlan ─────────────────────────────────────────────────────────────

describe('buildMathPlan', () => {
  test('returns an object with required keys', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    expect(plan).toHaveProperty('meals');
    expect(plan).toHaveProperty('totalCalories');
    expect(plan).toHaveProperty('totalProtein');
    expect(plan).toHaveProperty('notes');
    expect(plan).toHaveProperty('aiPowered');
  });

  test('aiPowered is always false (no API call)', () => {
    expect(buildMathPlan(BASE_PARAMS).aiPowered).toBe(false);
  });

  test('returns at most 4 meals (one per slot)', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    expect(plan.meals.length).toBeLessThanOrEqual(4);
    expect(plan.meals.length).toBeGreaterThan(0);
  });

  test('every meal has all required fields', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    for (const m of plan.meals) {
      expect(m).toHaveProperty('meal');
      expect(m).toHaveProperty('recipeId');
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('servings');
      expect(m).toHaveProperty('calories');
      expect(m).toHaveProperty('protein');
      expect(m).toHaveProperty('carbs');
      expect(m).toHaveProperty('fat');
      expect(m).toHaveProperty('ingredients');
      expect(m).toHaveProperty('why');
      expect(m).toHaveProperty('prep');
    }
  });

  test('prep is always empty array (math plan has no AI steps)', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    plan.meals.forEach(m => expect(m.prep).toEqual([]));
  });

  test('totalCalories equals sum of meal calories', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    const sum = plan.meals.reduce((s, m) => s + m.calories, 0);
    expect(plan.totalCalories).toBe(sum);
  });

  test('all calories are positive numbers', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    plan.meals.forEach(m => expect(m.calories).toBeGreaterThan(0));
  });

  test('veg diet: all selected recipes are vegetarian', () => {
    const plan = buildMathPlan({ ...BASE_PARAMS, diet: 'veg' });
    const byId = new Map(RECIPES.map(r => [r.id, r]));
    plan.meals.forEach(m => {
      if (m.recipeId) {
        const recipe = byId.get(m.recipeId);
        expect(recipe?.isVegetarian).toBe(true);
      }
    });
  });

  test('excludeIds: excluded recipe does not appear in plan', () => {
    // Build a reference plan and get the first recipe ID
    const ref = buildMathPlan(BASE_PARAMS);
    const excludedId = ref.meals[0]?.recipeId;
    if (!excludedId) return; // skip if no meals

    const plan = buildMathPlan({ ...BASE_PARAMS, excludeIds: [excludedId] });
    const ids = plan.meals.map(m => m.recipeId);
    expect(ids).not.toContain(excludedId);
  });

  test('different seeds produce different plans (or at least run without error)', () => {
    const p0 = buildMathPlan({ ...BASE_PARAMS, seed: 0 });
    const p1 = buildMathPlan({ ...BASE_PARAMS, seed: 5 });
    // Both should be valid plans; seeds vary picks
    expect(p0.aiPowered).toBe(false);
    expect(p1.aiPowered).toBe(false);
  });

  test('slot assignments match expected MealSlot values', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    const validSlots = new Set(['breakfast', 'lunch', 'snack', 'dinner']);
    plan.meals.forEach(m => expect(validSlots.has(m.meal)).toBe(true));
  });

  test('no two meals share the same recipeId', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    const ids = plan.meals.map(m => m.recipeId).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('each meal has at least one ingredient', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    plan.meals.forEach(m => expect(m.ingredients.length).toBeGreaterThan(0));
  });

  test('gain goal: why mentions protein or muscle gain', () => {
    const plan = buildMathPlan({ ...BASE_PARAMS, goal: 'gain' });
    const whys = plan.meals.map(m => m.why.toLowerCase()).join(' ');
    expect(whys).toMatch(/protein|gain|muscle/);
  });

  test('lose goal: why mentions fat loss or calorie', () => {
    const plan = buildMathPlan({ ...BASE_PARAMS, goal: 'lose' });
    const whys = plan.meals.map(m => m.why.toLowerCase()).join(' ');
    expect(whys).toMatch(/fat|loss|calorie|filling/);
  });

  test('preference hit: why mentions matched term', () => {
    const plan = buildMathPlan({ ...BASE_PARAMS, preferences: 'love dosa' });
    // If dosa is included in any meal, its why should mention it
    const dosaMeal = plan.meals.find(m => m.name.toLowerCase().includes('dosa'));
    if (dosaMeal) {
      expect(dosaMeal.why.toLowerCase()).toMatch(/dosa/);
    }
  });
});

// ── swapMeal ─────────────────────────────────────────────────────────────────

describe('swapMeal', () => {
  test('returns a PlannedMeal object for a valid slot', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    const result = swapMeal(plan, 'breakfast', BASE_PARAMS, 0);
    // May be null if no further candidates, but with nveg + 2200kcal there should be many
    if (result !== null) {
      expect(result).toHaveProperty('meal', 'breakfast');
      expect(result).toHaveProperty('recipeId');
      expect(result).toHaveProperty('calories');
      expect(result.calories).toBeGreaterThan(0);
    }
  });

  test('swapped meal has a different recipeId from current plan meals', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    const existingIds = new Set(plan.meals.map(m => m.recipeId).filter(Boolean));
    const result = swapMeal(plan, 'breakfast', BASE_PARAMS, 0);
    if (result !== null) {
      expect(existingIds.has(result.recipeId)).toBe(false);
    }
  });

  test('different bump values can yield different swaps', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    const r0 = swapMeal(plan, 'lunch', BASE_PARAMS, 0);
    const r1 = swapMeal(plan, 'lunch', BASE_PARAMS, 1);
    // Both valid (or null if no candidates) — just ensure no crash
    expect(r0 === null || typeof r0.recipeId === 'string').toBe(true);
    expect(r1 === null || typeof r1.recipeId === 'string').toBe(true);
  });

  test('prep is always empty array in math swap', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    const result = swapMeal(plan, 'dinner', BASE_PARAMS, 0);
    if (result !== null) {
      expect(result.prep).toEqual([]);
    }
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe('loadPrefs / savePrefs', () => {
  beforeEach(() => localStorage.clear());

  test('loadPrefs returns empty string when nothing saved', () => {
    expect(loadPrefs()).toBe('');
  });

  test('savePrefs + loadPrefs round-trips a string', () => {
    savePrefs('love dosa, no paneer');
    expect(loadPrefs()).toBe('love dosa, no paneer');
  });

  test('overwrites previous preference', () => {
    savePrefs('old pref');
    savePrefs('new pref');
    expect(loadPrefs()).toBe('new pref');
  });

  test('empty string can be saved and retrieved', () => {
    savePrefs('something');
    savePrefs('');
    expect(loadPrefs()).toBe('');
  });
});

describe('loadLastPlan / saveLastPlan', () => {
  beforeEach(() => localStorage.clear());

  test('loadLastPlan returns null when nothing saved', () => {
    expect(loadLastPlan()).toBeNull();
  });

  test('saveLastPlan + loadLastPlan round-trips a plan', () => {
    const plan = buildMathPlan(BASE_PARAMS);
    saveLastPlan(plan);
    const loaded = loadLastPlan();
    expect(loaded).not.toBeNull();
    expect(loaded!.aiPowered).toBe(plan.aiPowered);
    expect(loaded!.totalCalories).toBe(plan.totalCalories);
    expect(loaded!.meals.length).toBe(plan.meals.length);
  });

  test('overwrites previous plan', () => {
    const p0 = buildMathPlan({ ...BASE_PARAMS, seed: 0 });
    const p1 = buildMathPlan({ ...BASE_PARAMS, seed: 9 });
    saveLastPlan(p0);
    saveLastPlan(p1);
    const loaded = loadLastPlan();
    expect(loaded!.totalCalories).toBe(p1.totalCalories);
  });
});

// ── generateMealPlan fallback ─────────────────────────────────────────────────

describe('generateMealPlan', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('falls back to math plan when fetch fails', async () => {
    const plan = await generateMealPlan(BASE_PARAMS);
    expect(plan.aiPowered).toBe(false);
  });

  test('fallback plan has required structure', async () => {
    const plan = await generateMealPlan(BASE_PARAMS);
    expect(plan.meals.length).toBeGreaterThan(0);
    expect(typeof plan.totalCalories).toBe('number');
    expect(typeof plan.notes).toBe('string');
  });

  test('fallback respects diet filter', async () => {
    const plan = await generateMealPlan({ ...BASE_PARAMS, diet: 'veg' });
    const byId = new Map(RECIPES.map(r => [r.id, r]));
    plan.meals.forEach(m => {
      if (m.recipeId) {
        expect(byId.get(m.recipeId)?.isVegetarian).toBe(true);
      }
    });
  });

  test('falls back when fetch returns non-ok status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn(),
    } as any);
    const plan = await generateMealPlan(BASE_PARAMS);
    expect(plan.aiPowered).toBe(false);
  });
});
