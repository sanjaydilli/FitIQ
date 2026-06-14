import { renderHook, act } from '@testing-library/react';
import { useCustomRecipes, SavedRecipe } from '../hooks/useCustomRecipes';

beforeEach(() => localStorage.clear());

const recipe = (overrides = {}) => ({
  name: 'My Oats Bowl',
  servings: 1,
  perServing: { calories: 350, protein: 12, carbs: 55, fat: 8, fiber: 5 },
  ingredientCount: 4,
  ...overrides,
});

// ── addRecipe ─────────────────────────────────────────────────────────────────

describe('addRecipe', () => {
  test('prepends the recipe to the list', () => {
    const { result } = renderHook(() => useCustomRecipes());
    act(() => { result.current.addRecipe(recipe()); });
    expect(result.current.recipes).toHaveLength(1);
    expect(result.current.recipes[0].name).toBe('My Oats Bowl');
  });

  test('auto-generates an id with recipe_ prefix', () => {
    const { result } = renderHook(() => useCustomRecipes());
    act(() => { result.current.addRecipe(recipe()); });
    expect(result.current.recipes[0].id).toMatch(/^recipe_/);
  });

  test('auto-sets createdAt as a number', () => {
    const { result } = renderHook(() => useCustomRecipes());
    act(() => { result.current.addRecipe(recipe()); });
    expect(typeof result.current.recipes[0].createdAt).toBe('number');
    expect(result.current.recipes[0].createdAt).toBeGreaterThan(0);
  });

  test('preserves all provided fields', () => {
    const { result } = renderHook(() => useCustomRecipes());
    act(() => { result.current.addRecipe(recipe()); });
    const r = result.current.recipes[0];
    expect(r.name).toBe('My Oats Bowl');
    expect(r.servings).toBe(1);
    expect(r.perServing.calories).toBe(350);
    expect(r.perServing.protein).toBe(12);
    expect(r.ingredientCount).toBe(4);
  });

  test('returns the full saved recipe with id and createdAt', () => {
    const { result } = renderHook(() => useCustomRecipes());
    let saved: SavedRecipe | undefined;
    act(() => { saved = result.current.addRecipe(recipe()); });
    expect(saved?.id).toMatch(/^recipe_/);
    expect(typeof saved?.createdAt).toBe('number');
  });

  test('new recipe appears first (prepend order)', () => {
    const { result } = renderHook(() => useCustomRecipes());
    act(() => { result.current.addRecipe(recipe({ name: 'First' })); });
    act(() => { result.current.addRecipe(recipe({ name: 'Second' })); });
    expect(result.current.recipes[0].name).toBe('Second');
    expect(result.current.recipes[1].name).toBe('First');
  });

  test('multiple adds accumulate', () => {
    const { result } = renderHook(() => useCustomRecipes());
    act(() => { result.current.addRecipe(recipe({ name: 'A' })); });
    act(() => { result.current.addRecipe(recipe({ name: 'B' })); });
    expect(result.current.recipes).toHaveLength(2);
  });
});

// ── removeRecipe ──────────────────────────────────────────────────────────────

describe('removeRecipe', () => {
  test('removes recipe by id', () => {
    const { result } = renderHook(() => useCustomRecipes());
    let id: string;
    act(() => { id = result.current.addRecipe(recipe()).id; });
    act(() => { result.current.removeRecipe(id); });
    expect(result.current.recipes).toHaveLength(0);
  });

  test('removes only the matching recipe', () => {
    // Pre-seed with known ids to avoid Date.now() collisions in Jest
    const rA: SavedRecipe = { id: 'recipe_001', name: 'A', servings: 1, perServing: { calories: 100, protein: 5, carbs: 15, fat: 3, fiber: 1 }, ingredientCount: 2, createdAt: 1 };
    const rB: SavedRecipe = { id: 'recipe_002', name: 'B', servings: 1, perServing: { calories: 200, protein: 8, carbs: 25, fat: 5, fiber: 2 }, ingredientCount: 3, createdAt: 2 };
    localStorage.setItem('fitiq.customRecipes', JSON.stringify([rA, rB]));

    const { result } = renderHook(() => useCustomRecipes());
    act(() => { result.current.removeRecipe('recipe_001'); });
    expect(result.current.recipes).toHaveLength(1);
    expect(result.current.recipes[0].name).toBe('B');
  });

  test('removing non-existent id leaves list unchanged', () => {
    const { result } = renderHook(() => useCustomRecipes());
    act(() => { result.current.addRecipe(recipe()); });
    act(() => { result.current.removeRecipe('nonexistent'); });
    expect(result.current.recipes).toHaveLength(1);
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe('localStorage persistence', () => {
  test('recipes survive unmount and remount', () => {
    const { result: r1 } = renderHook(() => useCustomRecipes());
    act(() => { r1.current.addRecipe(recipe({ name: 'Dosa Bowl' })); });

    const { result: r2 } = renderHook(() => useCustomRecipes());
    expect(r2.current.recipes).toHaveLength(1);
    expect(r2.current.recipes[0].name).toBe('Dosa Bowl');
  });

  test('starts empty when storage is clear', () => {
    const { result } = renderHook(() => useCustomRecipes());
    expect(result.current.recipes).toHaveLength(0);
  });

  test('deletion persists after remount', () => {
    const { result: r1 } = renderHook(() => useCustomRecipes());
    let id: string;
    act(() => { r1.current.addRecipe(recipe({ name: 'Keep' })); });
    act(() => { id = r1.current.addRecipe(recipe({ name: 'Delete' })).id; });
    act(() => { r1.current.removeRecipe(id); });

    const { result: r2 } = renderHook(() => useCustomRecipes());
    expect(r2.current.recipes.some(r => r.name === 'Delete')).toBe(false);
  });
});
