import { RECIPES, Recipe } from '../data/recipes';
import { getApiUrl } from './aiService';

// ─────────────────────────────────────────────────────────────────────────────
// Meal planning built on the 3,420-dish IFCT database.
// Pure math selects & portions real dishes (always works, offline too).
// AI is used ONLY for taste-based picking, "why" lines and prep steps —
// macros and measurements always come from our own data.
// ─────────────────────────────────────────────────────────────────────────────

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealIngredient {
  text: string;   // "wheat flour ≈ 60g" (scaled to the user's portion)
  grams: number;
}

export interface PlannedMeal {
  meal: MealSlot;
  recipeId: string | null;
  name: string;
  servings: number;          // portions of the dish
  portionGrams: number;      // approx weight of this portion
  why: string;               // personalised reason
  prep: string[];            // preparation steps (AI; [] offline)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: MealIngredient[];
}

export interface MealPlan {
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  notes: string;
  aiPowered: boolean;        // false → offline math fallback was used
}

export interface PlanParams {
  targetCalories: number;
  targetProtein: number;
  goal: string;
  diet: string;
  preferences: string;       // free text: "love south indian, no paneer…"
  seed?: number;             // vary picks between regenerations
  excludeIds?: string[];     // don't repeat these dishes
}

// ── Preference persistence ───────────────────────────────────────────────────

const PREFS_KEY = 'fitiq.mealPrefs';
const PLAN_KEY = 'fitiq.mealPlan.last';

export function loadPrefs(): string {
  try { return localStorage.getItem(PREFS_KEY) ?? ''; } catch { return ''; }
}
export function savePrefs(p: string) {
  try { localStorage.setItem(PREFS_KEY, p); } catch { /* quota */ }
}
export function loadLastPlan(): MealPlan | null {
  try { const r = localStorage.getItem(PLAN_KEY); return r ? JSON.parse(r) as MealPlan : null; }
  catch { return null; }
}
export function saveLastPlan(p: MealPlan) {
  try { localStorage.setItem(PLAN_KEY, JSON.stringify(p)); } catch { /* quota */ }
}

// ── Preference parsing (pure logic) ──────────────────────────────────────────

interface ParsedPrefs { include: string[]; exclude: string[] }

export function parsePreferences(text: string): ParsedPrefs {
  const include: string[] = [];
  const exclude: string[] = [];
  const cleaned = text.toLowerCase().replace(/[.;]/g, ',');
  for (let part of cleaned.split(',')) {
    part = part.trim();
    if (!part) continue;
    const neg = part.match(/^(?:no|avoid|hate|skip|allergic to|don'?t like|less)\s+(.+)$/);
    if (neg) {
      exclude.push(...neg[1].split(/\s+and\s+|\s*&\s*/).map(s => s.trim()).filter(Boolean));
      continue;
    }
    const pos = part.replace(/^(?:i\s+)?(?:love|like|prefer|want|more|enjoy)\s+/, '').trim();
    if (pos) include.push(...pos.split(/\s+and\s+|\s*&\s*/).map(s => s.trim()).filter(Boolean));
  }
  return { include, exclude };
}

// ── Slot heuristics ──────────────────────────────────────────────────────────

const SLOT_SPLIT: Record<MealSlot, number> = { breakfast: 0.25, lunch: 0.35, snack: 0.12, dinner: 0.28 };

const SLOT_KEYWORDS: Record<MealSlot, string[]> = {
  breakfast: ['dosa', 'idli', 'poha', 'upma', 'paratha', 'chilla', 'cheela', 'pongal',
    'appam', 'uttapam', 'sandwich', 'oats', 'vada', 'idiyappam', 'puttu', 'thepla',
    'dhokla', 'toast', 'pancake', 'smoothie', 'egg', 'omelette', 'sevai', 'kanji'],
  snack: ['chaat', 'sundal', 'tikki', 'cutlet', 'bhel', 'salad', 'smoothie', 'chana',
    'makhana', 'soup', 'sprout', 'momo', 'pakora', 'kebab', 'chivda', 'lassi', 'juice'],
  lunch: ['rice', 'biryani', 'pulao', 'dal', 'curry', 'sambar', 'rajma', 'chole',
    'khichdi', 'kuzhambu', 'sabzi', 'roti', 'paratha', 'kofta', 'masala', 'fry',
    'gravy', 'korma', 'paneer', 'chicken', 'fish', 'mutton', 'bhindi', 'gobi', 'palak'],
  dinner: ['rice', 'dal', 'curry', 'sambar', 'khichdi', 'soup', 'millet', 'roti',
    'sabzi', 'kuzhambu', 'masala', 'palak', 'paneer', 'chicken', 'fish', 'gravy',
    'fry', 'kofta', 'bhindi', 'gobi', 'rasam'],
};

const SLOT_KCAL_WINDOW: Record<MealSlot, [number, number]> = {
  breakfast: [100, 650], snack: [60, 420], lunch: [180, 950], dinner: [150, 850],
};

const PORTIONS = [0.5, 1, 1.5, 2, 2.5];

// ── Pure-math selection ──────────────────────────────────────────────────────

function dietAllows(diet: string, r: Recipe): boolean {
  if (diet === 'nveg') return true;
  if (diet === 'eggetarian') {
    return r.isVegetarian || r.ingredients.some(i => i.ingredient.toLowerCase().includes('egg'));
  }
  return r.isVegetarian; // veg / vegan / jain
}

function matchesAny(r: Recipe, terms: string[]): number {
  if (terms.length === 0) return 0;
  const name = r.name.toLowerCase();
  const ings = r.ingredients.map(i => i.ingredient.toLowerCase()).join(' ');
  let hits = 0;
  for (const t of terms) {
    if (!t) continue;
    if (name.includes(t)) hits += 3;        // name match is a strong signal
    else if (ings.includes(t)) hits += 1;
  }
  return hits;
}

interface Scored { recipe: Recipe; score: number }

function candidatesFor(slot: MealSlot, params: PlanParams, prefs: ParsedPrefs, used: Set<string>): Scored[] {
  const [lo, hi] = SLOT_KCAL_WINDOW[slot];
  const wantProtein = params.goal === 'gain' || params.goal === 'lose';
  const out: Scored[] = [];

  for (const r of RECIPES) {
    if (used.has(r.id)) continue;
    if (!dietAllows(params.diet, r)) continue;
    if (r.caloriesPerServing < lo || r.caloriesPerServing > hi) continue;
    if (r.proteinPerServing > 70) continue;     // implausible — data outlier guard
    if (matchesAny(r, prefs.exclude) > 0) continue;

    const slotFit = matchesAny(r, SLOT_KEYWORDS[slot]);
    // breakfast & snack require a slot keyword; mains can be generic
    if (slotFit === 0 && (slot === 'breakfast' || slot === 'snack')) continue;

    const prefFit = matchesAny(r, prefs.include);
    const proteinDensity = r.caloriesPerServing > 0 ? (r.proteinPerServing / r.caloriesPerServing) * 100 : 0;

    const score = slotFit * 2 + prefFit * 12 + (wantProtein ? proteinDensity * 2.5 : proteinDensity);
    out.push({ recipe: r, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

function bestPortion(r: Recipe, slotKcal: number): number {
  let best = 1, err = Infinity;
  for (const p of PORTIONS) {
    const e = Math.abs(r.caloriesPerServing * p - slotKcal);
    if (e < err) { err = e; best = p; }
  }
  return best;
}

function scaleIngredients(r: Recipe, portion: number): MealIngredient[] {
  const frac = portion / Math.max(1, r.servings);
  return r.ingredients.map(ing => {
    const g = Math.round(ing.grams * frac);
    const base = ing.ingredient;
    return g > 0
      ? { text: `${base} ≈ ${g}g`, grams: g }
      : { text: [ing.amount, ing.unit, base].filter(Boolean).join(' '), grams: 0 };
  });
}

function buildMeal(slot: MealSlot, r: Recipe, portion: number, why: string, prep: string[]): PlannedMeal {
  return {
    meal: slot,
    recipeId: r.id,
    name: r.name,
    servings: portion,
    portionGrams: Math.round((r.gramsPerServing || 150) * portion),
    why,
    prep,
    calories: Math.round(r.caloriesPerServing * portion),
    protein: Math.round(r.proteinPerServing * portion * 10) / 10,
    carbs: Math.round(r.carbsPerServing * portion * 10) / 10,
    fat: Math.round(r.fatPerServing * portion * 10) / 10,
    ingredients: scaleIngredients(r, portion),
  };
}

function mathWhy(slot: MealSlot, r: Recipe, prefs: ParsedPrefs, goal: string): string {
  const matched = prefs.include.find(t =>
    r.name.toLowerCase().includes(t) || r.ingredients.some(i => i.ingredient.toLowerCase().includes(t)));
  if (matched) return `Picked because you like ${matched} — ${r.proteinPerServing}g protein per serving.`;
  if (goal === 'gain') return `Protein-dense pick for muscle gain (${r.proteinPerServing}g/serving).`;
  if (goal === 'lose') return `Filling but calorie-controlled for fat loss.`;
  return `Balanced ${slot} fitting your daily targets.`;
}

/** Deterministic offline plan — always succeeds. */
export function buildMathPlan(params: PlanParams): MealPlan {
  const prefs = parsePreferences(params.preferences);
  const seed = params.seed ?? 0;
  const used = new Set<string>(params.excludeIds ?? []);
  const meals: PlannedMeal[] = [];
  const termUse = new Map<string, number>(); // variety: max 2 dishes per liked term

  for (const slot of ['breakfast', 'lunch', 'snack', 'dinner'] as MealSlot[]) {
    const slotKcal = params.targetCalories * SLOT_SPLIT[slot];
    let cands = candidatesFor(slot, params, prefs, used);
    if (cands.length === 0) continue;

    const overused = prefs.include.filter(t => (termUse.get(t) ?? 0) >= 2);
    if (overused.length > 0) {
      const filtered = cands.filter(c => matchesAny(c.recipe, overused) === 0);
      if (filtered.length > 0) cands = filtered;
    }

    const pickPool = cands.slice(0, 8);
    const pick = pickPool[(seed + slot.length) % pickPool.length].recipe;
    used.add(pick.id);
    for (const t of prefs.include) {
      if (matchesAny(pick, [t]) > 0) termUse.set(t, (termUse.get(t) ?? 0) + 1);
    }
    const portion = bestPortion(pick, slotKcal);
    meals.push(buildMeal(slot, pick, portion, mathWhy(slot, pick, prefs, params.goal), []));
  }

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = Math.round(meals.reduce((s, m) => s + m.protein, 0));
  return {
    meals, totalCalories, totalProtein,
    notes: 'Built from real IFCT-measured dishes. Adjust portions to taste — macros scale with you.',
    aiPowered: false,
  };
}

/** Replace one meal with the next best candidate (pure math). */
export function swapMeal(plan: MealPlan, slot: MealSlot, params: PlanParams, bump: number): PlannedMeal | null {
  const prefs = parsePreferences(params.preferences);
  const used = new Set(plan.meals.map(m => m.recipeId).filter(Boolean) as string[]);
  const cands = candidatesFor(slot, params, prefs, used);
  if (cands.length === 0) return null;
  const pick = cands[bump % Math.min(8, cands.length)].recipe;
  const slotKcal = params.targetCalories * SLOT_SPLIT[slot];
  const portion = bestPortion(pick, slotKcal);
  return buildMeal(slot, pick, portion, mathWhy(slot, pick, prefs, params.goal), []);
}

// ── AI selection (taste + prep steps) ────────────────────────────────────────

export async function generateMealPlan(params: PlanParams): Promise<MealPlan> {
  const prefs = parsePreferences(params.preferences);
  const used = new Set<string>(params.excludeIds ?? []);

  // Shortlist real dishes for the AI to choose from
  const shortlists: Record<MealSlot, Scored[]> = {
    breakfast: candidatesFor('breakfast', params, prefs, used).slice(0, 14),
    lunch: candidatesFor('lunch', params, prefs, used).slice(0, 14),
    snack: candidatesFor('snack', params, prefs, used).slice(0, 14),
    dinner: candidatesFor('dinner', params, prefs, used).slice(0, 14),
  };

  const candidateText = (Object.entries(shortlists) as [MealSlot, Scored[]][])
    .map(([slot, list]) =>
      `${slot.toUpperCase()} (target ~${Math.round(params.targetCalories * SLOT_SPLIT[slot])} kcal):\n` +
      list.map(c => `  ${c.recipe.id} | ${c.recipe.name} | ${c.recipe.caloriesPerServing} kcal, ${c.recipe.proteinPerServing}g protein per serving`).join('\n'))
    .join('\n\n');

  const prompt = `You are an Indian nutrition coach. Build a 1-day meal plan for this user by CHOOSING from the candidate dishes below (these are real dishes from our verified database — do NOT invent dishes).

USER:
- Goal: ${params.goal} | Diet: ${params.diet}
- Daily targets: ${params.targetCalories} kcal, ${params.targetProtein}g protein
- Stated preferences: "${params.preferences || 'none given'}"

CANDIDATES:
${candidateText}

For each of breakfast, lunch, snack, dinner pick ONE dish (use its exact id), choose servings (0.5–3, in 0.5 steps) to fit the slot's kcal target, write a one-line "why" tied to THIS user's preferences/goal, and give 3-5 short preparation steps for the dish.

Return ONLY valid JSON:
{"meals":[{"meal":"breakfast","recipeId":"...","servings":1,"why":"...","prep":["...","..."]}, ...4 entries...],"notes":"one tip for the day"}`;

  try {
    const res = await fetch(`${getApiUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        userStats: { gender: 'any', weightKg: 0, goal: params.goal, dietType: params.diet },
      }),
    });
    if (!res.ok) throw new Error(`Server ${res.status}`);
    const data = await res.json() as { reply: string };
    const raw = data.reply.trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON');
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      meals?: { meal?: string; recipeId?: string; servings?: number; why?: string; prep?: string[] }[];
      notes?: string;
    };

    const byId = new Map(RECIPES.map(r => [r.id, r]));
    const meals: PlannedMeal[] = [];
    const usedIds = new Set<string>();

    for (const slot of ['breakfast', 'lunch', 'snack', 'dinner'] as MealSlot[]) {
      const aiPick = parsed.meals?.find(m => m.meal === slot);
      const recipe = aiPick?.recipeId ? byId.get(aiPick.recipeId) : undefined;
      const slotKcal = params.targetCalories * SLOT_SPLIT[slot];

      // Validate the AI's pick: must exist, fit diet & exclusions, not repeat
      if (recipe && !usedIds.has(recipe.id) && dietAllows(params.diet, recipe)
          && matchesAny(recipe, prefs.exclude) === 0) {
        usedIds.add(recipe.id);
        const portion = Math.min(3, Math.max(0.5, Math.round((Number(aiPick!.servings) || bestPortion(recipe, slotKcal)) * 2) / 2));
        const why = String(aiPick!.why ?? '').slice(0, 140) || mathWhy(slot, recipe, prefs, params.goal);
        const prep = (Array.isArray(aiPick!.prep) ? aiPick!.prep : [])
          .slice(0, 6).map(s => String(s).slice(0, 160)).filter(Boolean);
        meals.push(buildMeal(slot, recipe, portion, why, prep));
      } else {
        // Per-slot fallback: math pick (no prep steps)
        const cands = candidatesFor(slot, params, prefs, usedIds);
        if (cands.length > 0) {
          const pick = cands[0].recipe;
          usedIds.add(pick.id);
          meals.push(buildMeal(slot, pick, bestPortion(pick, slotKcal), mathWhy(slot, pick, prefs, params.goal), []));
        }
      }
    }

    if (meals.length === 0) throw new Error('Nothing valid');
    const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
    const totalProtein = Math.round(meals.reduce((s, m) => s + m.protein, 0));
    return {
      meals, totalCalories, totalProtein,
      notes: String(parsed.notes ?? '').slice(0, 240) || 'Space meals 3–4 hours apart and hit your water target.',
      aiPowered: true,
    };
  } catch {
    return buildMathPlan(params);
  }
}
