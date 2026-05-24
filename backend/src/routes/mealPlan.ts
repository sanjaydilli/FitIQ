import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import { NUTRITION_CONTEXT } from '../nutrition-context';

const router = Router();
const groq = new Groq();

const MODEL = 'llama-3.3-70b-versatile';

interface Meal {
  meal: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
}

interface MealPlan {
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  notes: string;
}

interface MealPlanBody {
  goal: string;
  diet: string;
  targetCalories: number;
  targetProtein: number;
  weightKg: number;
}

// Scale all meal macros so they hit the exact targets
function scaleMacros(plan: MealPlan, targetCalories: number, targetProtein: number): MealPlan {
  const totalCal = plan.meals.reduce((s, m) => s + m.calories, 0);
  const totalPro = plan.meals.reduce((s, m) => s + m.protein, 0);

  if (totalCal === 0) return plan;

  const calRatio = targetCalories / totalCal;
  const proRatio = targetProtein  / totalPro;

  const scaled = plan.meals.map(m => ({
    ...m,
    calories: Math.round(m.calories * calRatio),
    protein:  Math.round(m.protein  * proRatio),
    carbs:    Math.round(m.carbs    * calRatio),
    fat:      Math.round(m.fat      * calRatio),
  }));

  // Fix rounding drift on first meal
  const calDrift = targetCalories - scaled.reduce((s, m) => s + m.calories, 0);
  const proDrift = targetProtein  - scaled.reduce((s, m) => s + m.protein,  0);
  if (scaled.length > 0) {
    scaled[0].calories += calDrift;
    scaled[0].protein  += proDrift;
  }

  return {
    meals: scaled,
    totalCalories: targetCalories,
    totalProtein:  targetProtein,
    notes: plan.notes,
  };
}

const SYSTEM_PROMPT = `You are an expert Indian nutritionist. Generate precise meal plans using only authentic Indian foods.

${NUTRITION_CONTEXT}

CRITICAL RULES:
- Strictly follow the diet type rules above (especially Jain — no root vegetables, dairy IS allowed)
- Use only Indian dishes and ingredients
- Return ONLY valid JSON — no markdown, no explanation`;

router.post('/', async (req: Request, res: Response) => {
  const { goal, diet, targetCalories, targetProtein, weightKg } = req.body as MealPlanBody;

  const goalLabel: Record<string, string> = {
    lose: 'fat loss (calorie deficit)', gain: 'muscle gain (calorie surplus)',
    main: 'maintenance',               endur: 'endurance training',
  };
  const dietLabel: Record<string, string> = {
    veg:        'vegetarian (dairy OK, no meat/eggs)',
    eggetarian: 'eggetarian (eggs + dairy OK, no meat)',
    nveg:       'non-vegetarian (all foods OK)',
    vegan:      'vegan (NO animal products — no dairy, no eggs, no honey)',
    jain:       'Jain (dairy OK, NO root vegetables like onion/garlic/potato/carrot)',
  };

  const prompt = `Generate a full-day Indian meal plan for:
- Goal: ${goalLabel[goal] ?? goal}
- Diet: ${dietLabel[diet] ?? diet}
- Target calories: ${targetCalories} kcal
- Target protein: ${targetProtein}g
- Weight: ${weightKg}kg

Return ONLY this JSON (no markdown):
{
  "meals": [
    {"meal":"breakfast","name":"...","description":"1 sentence","calories":600,"protein":35,"carbs":75,"fat":18,"ingredients":["..."]},
    {"meal":"lunch",    "name":"...","description":"1 sentence","calories":800,"protein":45,"carbs":95,"fat":22,"ingredients":["..."]},
    {"meal":"snack",    "name":"...","description":"1 sentence","calories":400,"protein":25,"carbs":45,"fat":12,"ingredients":["..."]},
    {"meal":"dinner",   "name":"...","description":"1 sentence","calories":600,"protein":35,"carbs":75,"fat":15,"ingredients":["..."]}
  ],
  "totalCalories":${targetCalories},
  "totalProtein":${targetProtein},
  "notes":"one practical tip"
}

The 4 meal calories MUST sum to exactly ${targetCalories}. Protein MUST sum to ${targetProtein}g.`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 900,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const jsonStart = text.indexOf('{');
    const jsonEnd   = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON in response');

    const raw = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as MealPlan;

    // Guarantee macro accuracy regardless of model output
    const plan = scaleMacros(raw, targetCalories, targetProtein);
    return res.json(plan);
  } catch (err) {
    console.error('Meal plan error:', err);
    return res.status(500).json({ error: 'Could not generate meal plan. Please try again.' });
  }
});

export default router;
