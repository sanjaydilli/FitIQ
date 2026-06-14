import RECIPES from '../data/recipes';

describe('recipes data integrity', () => {
  test('loads at least 3000 recipes', () => {
    expect(RECIPES.length).toBeGreaterThan(3000);
  });

  test('every recipe has a unique id', () => {
    const ids = RECIPES.map(r => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('every recipe has a non-empty name', () => {
    const bad = RECIPES.filter(r => !r.name || r.name.trim() === '');
    expect(bad).toHaveLength(0);
  });

  test('all servings are 1 (macro fields already divided)', () => {
    const bad = RECIPES.filter(r => r.servings !== 1);
    expect(bad).toHaveLength(0);
  });

  test('no recipe has > 1000 caloriesPerServing (batch-calorie bug check)', () => {
    // Highest legitimate single-serve dish is ~900 kcal (Donut).
    // The old bug inflated multi-serving batches to 2000-3000 kcal.
    const bad = RECIPES.filter(r => r.caloriesPerServing > 1000);
    expect(bad).toHaveLength(0);
  });

  test('no recipe has negative calories', () => {
    const bad = RECIPES.filter(r => r.caloriesPerServing < 0);
    expect(bad).toHaveLength(0);
  });

  test('no recipe has more protein than calories (physics check)', () => {
    // protein * 4 kcal/g can't exceed total calories
    const bad = RECIPES.filter(r => r.proteinPerServing * 4 > r.caloriesPerServing + 5); // +5 rounding slack
    expect(bad).toHaveLength(0);
  });

  test('masala dosa is ~200 kcal per serving (regression)', () => {
    const dosa = RECIPES.find(r => r.id === 'masala_dosa');
    expect(dosa).toBeDefined();
    expect(dosa!.caloriesPerServing).toBeGreaterThan(150);
    expect(dosa!.caloriesPerServing).toBeLessThan(300);
  });

  test('every recipe has at least one ingredient', () => {
    const bad = RECIPES.filter(r => !r.ingredients || r.ingredients.length === 0);
    expect(bad).toHaveLength(0);
  });

  test('gramsPerServing is positive for all recipes', () => {
    const bad = RECIPES.filter(r => r.gramsPerServing <= 0);
    expect(bad).toHaveLength(0);
  });
});
