import { useCallback, useState } from 'react';

export interface SavedRecipe {
  id: string;
  name: string;
  servings: number;
  perServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  ingredientCount: number;
  createdAt: number;
}

const STORAGE_KEY = 'fitiq.customRecipes';

function load(): SavedRecipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedRecipe[]) : [];
  } catch { return []; }
}

function save(recipes: SavedRecipe[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)); } catch { /* quota */ }
}

export function useCustomRecipes() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>(load);

  const addRecipe = useCallback((recipe: Omit<SavedRecipe, 'id' | 'createdAt'>) => {
    const full: SavedRecipe = {
      ...recipe,
      id: `recipe_${Date.now()}`,
      createdAt: Date.now(),
    };
    setRecipes(prev => {
      const next = [full, ...prev];
      save(next);
      return next;
    });
    return full;
  }, []);

  const removeRecipe = useCallback((id: string) => {
    setRecipes(prev => {
      const next = prev.filter(r => r.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { recipes, addRecipe, removeRecipe };
}
