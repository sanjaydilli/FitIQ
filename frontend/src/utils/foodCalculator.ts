import { IndianFood } from '../data/indianFoods';

export interface ServingCalc {
  grams: number;
  calorieModifier: number;
  fatModifier: number;
}

export interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  vitaminC: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  omega3: number;
}

export function calcNutrition(food: IndianFood, serving: ServingCalc): NutritionResult {
  const ratio = serving.grams / 100;
  return {
    calories:  Math.round(food.per100g.calories  * ratio + serving.calorieModifier),
    protein:   round1(food.per100g.protein   * ratio),
    carbs:     round1(food.per100g.carbs     * ratio),
    fat:       round1(food.per100g.fat       * ratio + serving.fatModifier),
    fiber:     round1(food.per100g.fiber     * ratio),
    iron:      round2(food.per100g.iron      * ratio),
    calcium:   round1(food.per100g.calcium   * ratio),
    vitaminC:  round1(food.per100g.vitaminC  * ratio),
    magnesium: round1(food.per100g.magnesium * ratio),
    zinc:      round2(food.per100g.zinc      * ratio),
    potassium: round1(food.per100g.potassium * ratio),
    sodium:    round1(food.per100g.sodium    * ratio),
    omega3:    round3(food.per100g.omega3    * ratio),
  };
}

export function sumNutrition(items: NutritionResult[]): NutritionResult {
  const zero: NutritionResult = {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
    iron: 0, calcium: 0, vitaminC: 0, magnesium: 0, zinc: 0,
    potassium: 0, sodium: 0, omega3: 0,
  };
  return items.reduce((acc, item) => ({
    calories:  Math.round(acc.calories  + item.calories),
    protein:   round1(acc.protein   + item.protein),
    carbs:     round1(acc.carbs     + item.carbs),
    fat:       round1(acc.fat       + item.fat),
    fiber:     round1(acc.fiber     + item.fiber),
    iron:      round2(acc.iron      + item.iron),
    calcium:   round1(acc.calcium   + item.calcium),
    vitaminC:  round1(acc.vitaminC  + item.vitaminC),
    magnesium: round1(acc.magnesium + item.magnesium),
    zinc:      round2(acc.zinc      + item.zinc),
    potassium: round1(acc.potassium + item.potassium),
    sodium:    round1(acc.sodium    + item.sodium),
    omega3:    round3(acc.omega3    + item.omega3),
  }), zero);
}

// Search foods by name (case-insensitive, partial match on name/nameHindi)
export function searchFoods(foods: IndianFood[], query: string, limit = 30): IndianFood[] {
  const q = query.trim().toLowerCase();
  if (!q) return foods.slice(0, limit);
  return foods
    .filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.nameHindi && f.nameHindi.toLowerCase().includes(q)) ||
      (f.nameTamil && f.nameTamil.toLowerCase().includes(q)) ||
      (f.nameKannada && f.nameKannada.toLowerCase().includes(q))
    )
    .slice(0, limit);
}

// Filter by category and dietary flags
export function filterFoods(
  foods: IndianFood[],
  opts: {
    category?: string;
    vegetarianOnly?: boolean;
    veganOnly?: boolean;
    glutenFreeOnly?: boolean;
  }
): IndianFood[] {
  return foods.filter(f => {
    if (opts.category && f.category !== opts.category) return false;
    if (opts.vegetarianOnly && !f.isVegetarian) return false;
    if (opts.veganOnly && !f.isVegan) return false;
    if (opts.glutenFreeOnly && !f.isGlutenFree) return false;
    return true;
  });
}

// Macro percentage breakdown
export function macroPct(n: NutritionResult): { carbPct: number; protPct: number; fatPct: number } {
  const total = n.carbs * 4 + n.protein * 4 + n.fat * 9;
  if (total === 0) return { carbPct: 0, protPct: 0, fatPct: 0 };
  return {
    carbPct:  Math.round((n.carbs   * 4 / total) * 100),
    protPct:  Math.round((n.protein * 4 / total) * 100),
    fatPct:   Math.round((n.fat     * 9 / total) * 100),
  };
}

function round1(v: number) { return Math.round(v * 10) / 10; }
function round2(v: number) { return Math.round(v * 100) / 100; }
function round3(v: number) { return Math.round(v * 1000) / 1000; }
