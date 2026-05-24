import { getApiUrl } from './aiService';


export interface PlannedMeal {
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
}

export interface MealPlan {
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  notes: string;
}

export async function generateMealPlan(params: {
  tdee: number;
  goal: string;
  diet: string;
  weightKg: number;
  targetCalories: number;
  targetProtein: number;
}): Promise<MealPlan> {
  const goalLabel: Record<string, string> = {
    lose: 'fat loss (calorie deficit)',
    gain: 'muscle gain (calorie surplus)',
    main: 'maintenance',
    endur: 'endurance training',
  };
  const dietLabel: Record<string, string> = {
    veg: 'vegetarian',
    eggetarian: 'eggetarian (eggs ok, no meat)',
    nveg: 'non-vegetarian',
    vegan: 'vegan',
    jain: 'Jain (no root vegetables)',
  };

  try {
    const res = await fetch(`${getApiUrl()}/api/meal-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: params.goal,
        diet: params.diet,
        targetCalories: params.targetCalories,
        targetProtein: params.targetProtein,
        weightKg: params.weightKg,
      }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json() as MealPlan;
  } catch {
    return buildFallbackPlan(params);
  }
}

function buildFallbackPlan(params: { targetCalories: number; targetProtein: number; diet: string }): MealPlan {
  const isVeg = params.diet !== 'nveg';
  const meals: PlannedMeal[] = [
    {
      meal: 'breakfast',
      name: 'Moong Dal Chilla + Curd',
      description: 'High-protein savoury crepes made with moong dal batter.',
      calories: Math.round(params.targetCalories * 0.25),
      protein: Math.round(params.targetProtein * 0.25),
      carbs: 35, fat: 8,
      ingredients: ['moong dal', 'onion', 'green chilli', 'coriander', 'low-fat curd'],
    },
    {
      meal: 'lunch',
      name: isVeg ? 'Rajma Chawal + Salad' : 'Chicken Curry + Brown Rice',
      description: isVeg ? 'Classic kidney bean curry with rice — complete protein combo.' : 'Lean chicken in tomato-onion gravy with fibre-rich brown rice.',
      calories: Math.round(params.targetCalories * 0.35),
      protein: Math.round(params.targetProtein * 0.35),
      carbs: 55, fat: 10,
      ingredients: isVeg ? ['rajma', 'brown rice', 'tomato', 'onion', 'cucumber salad'] : ['chicken breast', 'brown rice', 'tomato', 'onion', 'spinach'],
    },
    {
      meal: 'snack',
      name: 'Roasted Chana + Buttermilk',
      description: 'Fibre-rich snack that keeps hunger away until dinner.',
      calories: Math.round(params.targetCalories * 0.12),
      protein: Math.round(params.targetProtein * 0.15),
      carbs: 18, fat: 4,
      ingredients: ['roasted chana', 'low-fat buttermilk', 'cumin', 'black salt'],
    },
    {
      meal: 'dinner',
      name: 'Palak Paneer + 2 Rotis',
      description: 'Iron + calcium rich spinach curry with cottage cheese.',
      calories: Math.round(params.targetCalories * 0.28),
      protein: Math.round(params.targetProtein * 0.25),
      carbs: 40, fat: 12,
      ingredients: ['palak', 'paneer', 'whole wheat roti', 'tomato', 'ginger-garlic'],
    },
  ];
  return {
    meals,
    totalCalories: params.targetCalories,
    totalProtein: params.targetProtein,
    notes: 'Drink 3–4L water. Space meals 3–4 hours apart for optimal digestion.',
  };
}
