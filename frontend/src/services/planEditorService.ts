import { EXERCISE_DB, ExerciseTemplate } from '../data/exercises';
import { DayPlan, PlannedExercise } from './programPlannerService';
import { getApiUrl } from './aiService';

// ─── Validation (pure logic — AI output is never trusted blindly) ────────────

const BY_ID = new Map<string, ExerciseTemplate>(EXERCISE_DB.map(e => [e.id, e]));
const BY_NAME = new Map<string, ExerciseTemplate>(
  EXERCISE_DB.map(e => [e.name.toLowerCase(), e])
);

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/** Coerce one AI/user-provided exercise into a valid PlannedExercise, or null. */
function sanitizeExercise(raw: any): PlannedExercise | null {
  if (!raw || typeof raw !== 'object') return null;

  let tmpl: ExerciseTemplate | undefined =
    BY_ID.get(String(raw.exerciseId ?? '')) ??
    BY_NAME.get(String(raw.name ?? '').toLowerCase());

  // Fuzzy: partial name containment ("bench press" → Barbell Bench Press)
  if (!tmpl && raw.name) {
    const n = String(raw.name).toLowerCase();
    tmpl = EXERCISE_DB.find(e =>
      e.name.toLowerCase().includes(n) || n.includes(e.name.toLowerCase())
    );
  }
  if (!tmpl) return null; // unknown exercise — drop rather than guess

  return {
    exerciseId: tmpl.id,
    name: tmpl.name,
    sets: clamp(Number(raw.sets) || tmpl.defaultSets, 1, 10),
    repsDisplay: String(raw.repsDisplay ?? raw.reps ?? tmpl.defaultReps).slice(0, 16),
    restSeconds: clamp(Number(raw.restSeconds) || tmpl.restSeconds, 15, 300),
    cue: String(raw.cue ?? tmpl.why).slice(0, 140),
  };
}

/** Validate a whole weekly plan. Returns null if nothing usable survives. */
export function sanitizeWeeklyPlan(raw: any): DayPlan[] | null {
  if (!Array.isArray(raw)) return null;
  const days: DayPlan[] = [];
  for (const d of raw.slice(0, 7)) {
    if (!d || typeof d !== 'object') continue;
    const exercises = (Array.isArray(d.exercises) ? d.exercises : [])
      .map(sanitizeExercise)
      .filter((e: PlannedExercise | null): e is PlannedExercise => e !== null)
      .slice(0, 10);
    if (exercises.length === 0) continue;
    days.push({
      day: String(d.day ?? `Day ${days.length + 1}`).slice(0, 20),
      focus: String(d.focus ?? 'Training day').slice(0, 60),
      // Always OUR math — never trust the AI's duration claim
      estimatedMinutes: estimateMinutes(exercises),
      exercises,
    });
  }
  return days.length > 0 ? days : null;
}

export function estimateMinutes(exercises: PlannedExercise[]): number {
  // warm-up + sets × (45s work + rest) + ~90s transition per exercise station
  if (exercises.length === 0) return 0;
  const WARMUP = 600, TRANSITION = 90, WORK = 45;
  const sec = WARMUP
    + exercises.reduce((s, e) => s + e.sets * (WORK + e.restSeconds), 0)
    + exercises.length * TRANSITION;
  return Math.max(20, Math.round(sec / 60 / 5) * 5);
}

export function makeExercise(tmpl: ExerciseTemplate): PlannedExercise {
  return {
    exerciseId: tmpl.id,
    name: tmpl.name,
    sets: tmpl.defaultSets,
    repsDisplay: String(tmpl.defaultReps),
    restSeconds: tmpl.restSeconds,
    cue: tmpl.why.split('.')[0],
  };
}

// ─── Weekly volume analysis (pure math — science-backed guidance) ────────────
// Counts primary sets fully and secondary involvement as half ("fractional
// sets"), the standard method in hypertrophy research. 10–20 weekly sets per
// muscle is the broadly supported growth zone.

export interface MuscleVolume {
  muscle: string;
  sets: number;
  status: 'low' | 'optimal' | 'high';
}

export function weeklyVolume(days: DayPlan[]): MuscleVolume[] {
  const totals = new Map<string, number>();
  for (const d of days) {
    for (const ex of d.exercises) {
      const tmpl = BY_ID.get(ex.exerciseId);
      if (!tmpl) continue;
      totals.set(tmpl.muscleGroup, (totals.get(tmpl.muscleGroup) ?? 0) + ex.sets);
      for (const sec of tmpl.secondary ?? []) {
        totals.set(sec, (totals.get(sec) ?? 0) + ex.sets * 0.5);
      }
    }
  }
  const order = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];
  return order
    .filter(m => (totals.get(m) ?? 0) > 0)
    .map(m => {
      const sets = Math.round((totals.get(m) ?? 0) * 2) / 2;
      return {
        muscle: m,
        sets,
        status: sets < 10 ? 'low' as const : sets <= 20 ? 'optimal' as const : 'high' as const,
      };
    });
}

export const BLANK_PLAN: DayPlan[] = [
  { day: 'Monday',    focus: 'Day 1', estimatedMinutes: 45, exercises: [] },
  { day: 'Wednesday', focus: 'Day 2', estimatedMinutes: 45, exercises: [] },
  { day: 'Friday',    focus: 'Day 3', estimatedMinutes: 45, exercises: [] },
];

// ─── AI revision ──────────────────────────────────────────────────────────────

export interface ReviseContext {
  sex: string;
  weightKg: number;
  goal: string;
}

/**
 * Send the current plan + a natural-language instruction to the AI coach and
 * get back a revised, validated weekly plan. Throws on failure — caller keeps
 * the existing plan untouched.
 */
export async function revisePlanWithAI(
  weeklyPlan: DayPlan[],
  instruction: string,
  ctx: ReviseContext,
): Promise<DayPlan[]> {
  const exerciseList = EXERCISE_DB
    .map(e => `${e.id} (${e.name} — ${e.muscleGroup}, ${e.equipment})`)
    .join('\n');

  const prompt = `You are a professional strength coach. The user has this weekly workout plan (JSON):

${JSON.stringify(weeklyPlan)}

USER REQUEST: "${instruction}"

Modify the plan according to the request. Keep everything the user did NOT ask to change exactly as it is.

AVAILABLE EXERCISES (use ONLY these exerciseIds):
${exerciseList}

RULES:
- Return the COMPLETE revised plan, all days included
- sets: 1-10, restSeconds: 15-300
- Compounds first within each day
- Return ONLY valid JSON in this exact format, no markdown:
{"weeklyPlan":[{"day":"Monday","focus":"...","estimatedMinutes":60,"exercises":[{"exerciseId":"bench_bb","name":"Barbell Bench Press","sets":4,"repsDisplay":"8-10","restSeconds":90,"cue":"..."}]}]}`;

  const res = await fetch(`${getApiUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: prompt,
      userStats: { gender: ctx.sex, weightKg: ctx.weightKg, goal: ctx.goal, dietType: 'any' },
    }),
  });
  if (!res.ok) throw new Error(`Server ${res.status}`);

  const data = await res.json() as { reply: string };
  const raw = data.reply.trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in reply');

  const parsed = JSON.parse(raw.slice(start, end + 1));
  const plan = sanitizeWeeklyPlan(parsed.weeklyPlan ?? parsed);
  if (!plan) throw new Error('AI returned no valid plan');
  return plan;
}
