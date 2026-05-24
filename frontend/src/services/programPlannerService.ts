import { ProgramConfig, PhaseSpec, calcPhaseNutrition } from './programPhaseEngine';

const OLLAMA_BASE = 'http://localhost:11434';
const MODEL = 'llama3.1';

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  repsDisplay: string;
  restSeconds: number;
  cue: string;
}

export interface DayPlan {
  day: string;
  focus: string;
  estimatedMinutes: number;
  exercises: PlannedExercise[];
}

export interface GeneratedProgramPhase {
  phaseNumber: 1 | 2 | 3;
  phaseName: string;
  weeklyPlan: DayPlan[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutritionNotes: string;
  trainingRationale: string;
  keyFocus: string;
  generatedAt: string;
}

export async function generateProgramPhase(params: {
  config: ProgramConfig;
  phase: PhaseSpec;
  tdee: number;
  leanMassKg: number;
  bodyFatPct: number;
  diet: string;
  prevPhaseNotes?: string;
  bodyCompDelta?: { leanMassDelta: number; bodyFatDelta: number; weightDelta: number };
}): Promise<GeneratedProgramPhase> {
  const { config, phase, tdee, leanMassKg, bodyFatPct, diet } = params;
  const nutrition = calcPhaseNutrition(phase, tdee, leanMassKg);

  const TYPE_LABEL: Record<string, string> = {
    muscle_gain: 'Muscle Gain', body_recomp: 'Body Recomposition',
    fat_loss: 'Fat Loss', strength: 'Strength',
  };
  const SPLIT_LABEL: Record<string, string> = {
    PPL: 'Push/Pull/Legs (6-day)', Upper_Lower: 'Upper/Lower (4-day)', Full_Body: 'Full Body (3-day)',
  };
  const DIET_LABEL: Record<string, string> = {
    veg: 'vegetarian', eggetarian: 'eggetarian', nveg: 'non-vegetarian', vegan: 'vegan', jain: 'Jain',
  };

  const deltaSection = params.bodyCompDelta
    ? `\nBODY COMPOSITION SINCE PROGRAM START:\n- Lean mass: ${params.bodyCompDelta.leanMassDelta > 0 ? '+' : ''}${params.bodyCompDelta.leanMassDelta}kg\n- Body fat: ${params.bodyCompDelta.bodyFatDelta > 0 ? '+' : ''}${params.bodyCompDelta.bodyFatDelta}%\n- Weight: ${params.bodyCompDelta.weightDelta > 0 ? '+' : ''}${params.bodyCompDelta.weightDelta}kg\n${params.prevPhaseNotes ? `Last phase key focus was: "${params.prevPhaseNotes}". Build on that.` : ''}`
    : '';

  const prompt = `You are a scientific strength and conditioning coach specializing in Indian gym-goers. Generate a ${SPLIT_LABEL[phase.split]} workout program.

PROGRAM: ${TYPE_LABEL[config.type]} — Phase ${phase.phase}/3 (${phase.label})
PHASE GOAL: ${phase.focus}
TRAINING PARAMETERS:
- Rep range: ${phase.repRange[0]}-${phase.repRange[1]} (${phase.rirTarget} reps in reserve)
- Sets per exercise: ${phase.setRange[0]}-${phase.setRange[1]}
- Rest compound lifts: ${phase.restSecondsCompound}s | isolation: ${phase.restSecondsIsolation}s
- Volume block: ${phase.volumeLabel}
${phase.deloadWeek ? '- Week 4 = DELOAD: cut volume 40%, maintain intensity' : ''}

USER:
- Sex: ${config.sex} | Lean mass: ${leanMassKg}kg | Body fat: ${bodyFatPct}%
- TDEE: ${tdee} kcal | Diet: ${DIET_LABEL[diet] ?? diet}
${deltaSection}
CALCULATED NUTRITION:
- Calories: ${nutrition.calories} kcal | Protein: ${nutrition.protein}g | Carbs: ${nutrition.carbs}g | Fat: ${nutrition.fat}g

OUTPUT RULES:
- Compound movements first in each session
- Prioritise barbell/dumbbell/cable exercises available in Indian gyms
- Vary from a typical bro split — use science-based selection
- Return ONLY valid JSON, no markdown, no extra text

JSON format:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "focus": "Push — Chest/Shoulders/Triceps",
      "estimatedMinutes": 65,
      "exercises": [
        {
          "exerciseId": "bench_bb",
          "name": "Barbell Bench Press",
          "sets": 4,
          "repsDisplay": "${phase.repRange[0]}-${phase.repRange[1]}",
          "restSeconds": ${phase.restSecondsCompound},
          "cue": "one-line form cue"
        }
      ]
    }
  ],
  "nutritionNotes": "2-3 sentences on nutrition timing for this phase",
  "trainingRationale": "2-3 sentences on why these parameters for phase ${phase.phase}",
  "keyFocus": "single most important thing to do in this phase"
}`;

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt, stream: false }),
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}`);
    const data = await res.json() as { response: string };
    const raw = data.response.trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON');
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Pick<GeneratedProgramPhase, 'weeklyPlan' | 'nutritionNotes' | 'trainingRationale' | 'keyFocus'>;
    return { phaseNumber: phase.phase, phaseName: phase.label, weeklyPlan: parsed.weeklyPlan, ...nutrition, nutritionNotes: parsed.nutritionNotes, trainingRationale: parsed.trainingRationale, keyFocus: parsed.keyFocus, generatedAt: new Date().toISOString() };
  } catch {
    return buildFallback(phase, nutrition);
  }
}

function buildFallback(phase: PhaseSpec, nutrition: ReturnType<typeof calcPhaseNutrition>): GeneratedProgramPhase {
  const r = `${phase.repRange[0]}-${phase.repRange[1]}`;
  const rc = phase.restSecondsCompound;
  const ri = phase.restSecondsIsolation;

  const pplPlan: DayPlan[] = [
    { day: 'Monday', focus: 'Push — Chest / Shoulders / Triceps', estimatedMinutes: 65, exercises: [
      { exerciseId: 'bench_bb',    name: 'Barbell Bench Press',     sets: 4, repsDisplay: r,     restSeconds: rc, cue: 'Blades retracted, elbows 45°, controlled descent' },
      { exerciseId: 'incline_db',  name: 'Incline Dumbbell Press',  sets: 3, repsDisplay: r,     restSeconds: rc, cue: 'Slight arch, full stretch at bottom' },
      { exerciseId: 'ohp_bb',      name: 'Overhead Press',          sets: 3, repsDisplay: r,     restSeconds: rc, cue: 'Bar over mid-foot, brace hard, full lockout' },
      { exerciseId: 'lat_raise',   name: 'Lateral Raise',           sets: 4, repsDisplay: '12-15', restSeconds: ri, cue: 'Slight lean forward, lead with elbows not hands' },
      { exerciseId: 'tricep_push', name: 'Tricep Pushdown',         sets: 3, repsDisplay: '10-12', restSeconds: ri, cue: 'Elbows glued to sides, full extension every rep' },
    ]},
    { day: 'Tuesday', focus: 'Pull — Back / Biceps / Rear Delts', estimatedMinutes: 60, exercises: [
      { exerciseId: 'deadlift',    name: 'Conventional Deadlift',   sets: 4, repsDisplay: r,     restSeconds: 180, cue: 'Bar over mid-foot, lats tight, big air before each rep' },
      { exerciseId: 'bent_row',    name: 'Barbell Bent-Over Row',   sets: 4, repsDisplay: r,     restSeconds: rc, cue: 'Overhand, hinge 45°, pull to lower sternum' },
      { exerciseId: 'lat_pulldown',name: 'Lat Pulldown',            sets: 3, repsDisplay: '10-12', restSeconds: rc, cue: 'Pull elbows to hips, chest up, don\'t swing' },
      { exerciseId: 'face_pull',   name: 'Face Pull',               sets: 3, repsDisplay: '15',   restSeconds: ri, cue: 'Pull to forehead, external rotate at finish' },
      { exerciseId: 'barbell_curl',name: 'Barbell Curl',            sets: 3, repsDisplay: '10-12', restSeconds: ri, cue: 'Full extension at bottom, no momentum' },
    ]},
    { day: 'Wednesday', focus: 'Legs — Quads / Hamstrings / Calves', estimatedMinutes: 70, exercises: [
      { exerciseId: 'squat',       name: 'Barbell Back Squat',      sets: 4, repsDisplay: r,     restSeconds: 180, cue: 'Hip crease below parallel, knees track toes' },
      { exerciseId: 'rdl',         name: 'Romanian Deadlift',       sets: 3, repsDisplay: '10-12', restSeconds: rc, cue: 'Hip hinge, soft knees, feel the hamstring stretch' },
      { exerciseId: 'leg_press',   name: 'Leg Press',               sets: 3, repsDisplay: '12-15', restSeconds: rc, cue: 'Full depth without hips rounding off pad' },
      { exerciseId: 'leg_curl',    name: 'Lying Leg Curl',          sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'Pause 1 second at peak contraction' },
      { exerciseId: 'calf_raise',  name: 'Standing Calf Raise',     sets: 4, repsDisplay: '15-20', restSeconds: 45, cue: 'Full stretch at bottom, pause at top' },
    ]},
    { day: 'Thursday', focus: 'Push — Shoulders Heavy / Upper Chest', estimatedMinutes: 60, exercises: [
      { exerciseId: 'ohp_bb',      name: 'Overhead Press',          sets: 4, repsDisplay: r,     restSeconds: rc, cue: 'Stand if able — more core + stability demand' },
      { exerciseId: 'incline_db',  name: 'Incline Dumbbell Press',  sets: 4, repsDisplay: r,     restSeconds: rc, cue: 'Upper chest emphasis, long eccentric' },
      { exerciseId: 'lat_raise',   name: 'Lateral Raise',           sets: 4, repsDisplay: '12-15', restSeconds: ri, cue: 'Creates the 3D shoulder width' },
      { exerciseId: 'rear_delt_fly',name: 'Rear Delt Fly',          sets: 3, repsDisplay: '15',   restSeconds: ri, cue: 'Hinged at hips, slight elbow bend' },
      { exerciseId: 'overhead_ext',name: 'Overhead Tricep Ext',     sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'Only move that stretches the tricep long head' },
    ]},
    { day: 'Friday', focus: 'Pull — Lats / Mid-Back / Arms', estimatedMinutes: 60, exercises: [
      { exerciseId: 'pullup',      name: 'Pull-up / Chin-up',       sets: 4, repsDisplay: 'Max-1', restSeconds: 90, cue: 'Dead hang start, chin clears bar, slow down' },
      { exerciseId: 'cable_row',   name: 'Seated Cable Row',        sets: 4, repsDisplay: '10-12', restSeconds: rc, cue: 'V-bar, elbows close, retract scapula fully' },
      { exerciseId: 'db_row',      name: 'Single-Arm DB Row',       sets: 3, repsDisplay: '12',   restSeconds: rc, cue: 'Pull to hip not armpit, full stretch' },
      { exerciseId: 'incline_curl',name: 'Incline Dumbbell Curl',   sets: 3, repsDisplay: '10-12', restSeconds: ri, cue: 'Supinate at top, long head emphasis' },
      { exerciseId: 'hammer_curl', name: 'Hammer Curl',             sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'Brachialis builder — makes arms look thicker' },
    ]},
    { day: 'Saturday', focus: 'Legs — Posterior Chain / Volume', estimatedMinutes: 60, exercises: [
      { exerciseId: 'leg_press',   name: 'Leg Press (high feet)',   sets: 4, repsDisplay: `${phase.repRange[0]+2}-${phase.repRange[1]+2}`, restSeconds: 90, cue: 'High foot placement = more glute/hamstring' },
      { exerciseId: 'lunge',       name: 'Walking Lunge (DB)',      sets: 3, repsDisplay: '12 each', restSeconds: 75, cue: 'Big steps, upright torso, back knee near floor' },
      { exerciseId: 'leg_ext',     name: 'Leg Extension',           sets: 3, repsDisplay: '15',   restSeconds: ri, cue: 'Full extension, 1s pause at top' },
      { exerciseId: 'leg_curl',    name: 'Lying Leg Curl',          sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'Dorsiflex feet for better hamstring engagement' },
      { exerciseId: 'calf_raise',  name: 'Standing Calf Raise',     sets: 4, repsDisplay: '20',   restSeconds: 45, cue: 'Slow eccentric — calves need full ROM' },
    ]},
  ];

  const upperLowerPlan: DayPlan[] = [
    { day: 'Monday', focus: 'Upper — Horizontal Push & Pull', estimatedMinutes: 65, exercises: [
      { exerciseId: 'bench_bb',    name: 'Barbell Bench Press',     sets: 5, repsDisplay: r,     restSeconds: rc, cue: 'Competition grip, controlled descent' },
      { exerciseId: 'bent_row',    name: 'Barbell Bent-Over Row',   sets: 4, repsDisplay: r,     restSeconds: rc, cue: 'Match grip width to bench press' },
      { exerciseId: 'incline_db',  name: 'Incline Dumbbell Press',  sets: 3, repsDisplay: `${phase.repRange[1]}-${phase.repRange[1]+2}`, restSeconds: rc, cue: 'Slightly more reps than compound' },
      { exerciseId: 'cable_row',   name: 'Seated Cable Row',        sets: 3, repsDisplay: '10-12', restSeconds: ri, cue: 'V-bar, full retraction at finish' },
      { exerciseId: 'tricep_push', name: 'Tricep Pushdown',         sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'Full extension, elbows fixed' },
      { exerciseId: 'barbell_curl',name: 'Barbell Curl',            sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'No swing, full eccentric' },
    ]},
    { day: 'Tuesday', focus: 'Lower — Quad Dominant', estimatedMinutes: 70, exercises: [
      { exerciseId: 'squat',       name: 'Barbell Back Squat',      sets: 5, repsDisplay: r,     restSeconds: 180, cue: 'Below parallel is non-negotiable' },
      { exerciseId: 'leg_press',   name: 'Leg Press',               sets: 4, repsDisplay: '10-12', restSeconds: 90, cue: 'Full depth, no hip rotation off pad' },
      { exerciseId: 'lunge',       name: 'Walking Lunge',           sets: 3, repsDisplay: '12 each', restSeconds: 75, cue: 'Fixes leg dominance imbalances' },
      { exerciseId: 'leg_curl',    name: 'Lying Leg Curl',          sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'Pause at top, control the negative' },
      { exerciseId: 'calf_raise',  name: 'Standing Calf Raise',     sets: 4, repsDisplay: '15-20', restSeconds: 45, cue: 'Full ROM every rep without exception' },
    ]},
    { day: 'Thursday', focus: 'Upper — Vertical Push & Pull', estimatedMinutes: 65, exercises: [
      { exerciseId: 'ohp_bb',      name: 'Overhead Press',          sets: 5, repsDisplay: r,     restSeconds: rc, cue: 'Most underrated compound — do it standing' },
      { exerciseId: 'pullup',      name: 'Pull-up / Chin-up',       sets: 4, repsDisplay: r,     restSeconds: rc, cue: 'Add weight when 8+ easy' },
      { exerciseId: 'lat_raise',   name: 'Lateral Raise',           sets: 4, repsDisplay: '12-15', restSeconds: ri, cue: 'The real shoulder width builder' },
      { exerciseId: 'lat_pulldown',name: 'Lat Pulldown',            sets: 3, repsDisplay: '10-12', restSeconds: rc, cue: 'Elbows travel to hips not back' },
      { exerciseId: 'overhead_ext',name: 'Overhead Tricep Ext',     sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'Long head stretch position' },
      { exerciseId: 'incline_curl',name: 'Incline DB Curl',         sets: 3, repsDisplay: '12',   restSeconds: ri, cue: 'Best bicep peak exercise' },
    ]},
    { day: 'Friday', focus: 'Lower — Posterior Chain', estimatedMinutes: 65, exercises: [
      { exerciseId: 'deadlift',    name: 'Conventional Deadlift',   sets: 4, repsDisplay: r,     restSeconds: 240, cue: 'Bar contacts legs all the way up' },
      { exerciseId: 'rdl',         name: 'Romanian Deadlift',       sets: 4, repsDisplay: '10',   restSeconds: 90, cue: 'Hip hinge — not a squat, not a deadlift' },
      { exerciseId: 'leg_press',   name: 'Leg Press (high feet)',   sets: 3, repsDisplay: '12',   restSeconds: 90, cue: 'High placement shifts to posterior chain' },
      { exerciseId: 'leg_ext',     name: 'Leg Extension',           sets: 3, repsDisplay: '15',   restSeconds: ri, cue: 'Full extension, controlled negative' },
      { exerciseId: 'calf_raise',  name: 'Calf Raise',              sets: 3, repsDisplay: '20',   restSeconds: 45, cue: 'Single leg version doubles effectiveness' },
    ]},
  ];

  const fullBodyPlan: DayPlan[] = [
    { day: 'Monday', focus: 'Full Body A', estimatedMinutes: 60, exercises: [
      { exerciseId: 'squat',       name: 'Barbell Back Squat',      sets: 3, repsDisplay: r,     restSeconds: 180, cue: 'Below parallel, brace before each rep' },
      { exerciseId: 'bench_bb',    name: 'Barbell Bench Press',     sets: 3, repsDisplay: r,     restSeconds: rc, cue: 'Retract scapula, controlled descent' },
      { exerciseId: 'bent_row',    name: 'Barbell Bent-Over Row',   sets: 3, repsDisplay: r,     restSeconds: rc, cue: 'Hinge at hips, pull to lower chest' },
      { exerciseId: 'lat_raise',   name: 'Lateral Raise',           sets: 3, repsDisplay: '12-15', restSeconds: ri, cue: 'Slight lean, lead with elbows' },
      { exerciseId: 'plank',       name: 'Plank',                   sets: 3, repsDisplay: '45-60s', restSeconds: 60, cue: 'Squeeze glutes and abs simultaneously' },
    ]},
    { day: 'Wednesday', focus: 'Full Body B', estimatedMinutes: 60, exercises: [
      { exerciseId: 'deadlift',    name: 'Conventional Deadlift',   sets: 3, repsDisplay: r,     restSeconds: 180, cue: 'Hip hinge pattern — not a squat' },
      { exerciseId: 'ohp_bb',      name: 'Overhead Press',          sets: 3, repsDisplay: r,     restSeconds: rc, cue: 'Full lockout at top, brace abs' },
      { exerciseId: 'pullup',      name: 'Pull-up / Chin-up',       sets: 3, repsDisplay: 'Max-1', restSeconds: 90, cue: 'Dead hang, chin above bar' },
      { exerciseId: 'barbell_curl',name: 'Barbell Curl',            sets: 3, repsDisplay: '10-12', restSeconds: ri, cue: 'No momentum, full extension' },
      { exerciseId: 'calf_raise',  name: 'Standing Calf Raise',     sets: 3, repsDisplay: '15-20', restSeconds: 45, cue: 'Full ROM every rep' },
    ]},
    { day: 'Friday', focus: 'Full Body C', estimatedMinutes: 60, exercises: [
      { exerciseId: 'leg_press',   name: 'Leg Press',               sets: 3, repsDisplay: r,     restSeconds: 120, cue: 'Full depth, don\'t lock out at top' },
      { exerciseId: 'incline_db',  name: 'Incline Dumbbell Press',  sets: 3, repsDisplay: r,     restSeconds: rc, cue: 'Upper chest emphasis — don\'t skip this' },
      { exerciseId: 'cable_row',   name: 'Seated Cable Row',        sets: 3, repsDisplay: '10-12', restSeconds: rc, cue: 'Full retraction, no trunk swing' },
      { exerciseId: 'rdl',         name: 'Romanian Deadlift',       sets: 3, repsDisplay: '10-12', restSeconds: rc, cue: 'Feel the hamstring stretch' },
      { exerciseId: 'cable_crunch',name: 'Cable Crunch',            sets: 3, repsDisplay: '15',   restSeconds: ri, cue: 'Only weighted ab exercise worth doing' },
    ]},
  ];

  const weeklyPlan = phase.split === 'PPL' ? pplPlan
    : phase.split === 'Upper_Lower' ? upperLowerPlan
    : fullBodyPlan;

  return {
    phaseNumber: phase.phase,
    phaseName: phase.label,
    weeklyPlan,
    ...nutrition,
    nutritionNotes: `Target ${nutrition.protein}g protein across 4 meals — about ${Math.round(nutrition.protein / 4)}g per meal. Prioritise carbs 1–2h before training and within 60min after. ${nutrition.calories < 2000 ? 'On rest days you can reduce carbs by 30–40g.' : ''}`,
    trainingRationale: `Phase ${phase.phase} (${phase.label}) uses ${phase.repRange[0]}-${phase.repRange[1]} rep ranges to maximise ${phase.volumeLabel.toLowerCase()}. ${phase.deloadWeek ? 'Week 4 is a mandatory deload — reduce sets by 40% but keep the same weights. This is where adaptation actually happens.' : 'Push hard every session — progressive overload is the only way forward.'}`,
    keyFocus: phase.phase === 1
      ? 'Nail movement quality and consistently hit volume — don\'t chase weight yet'
      : phase.phase === 2
      ? 'Beat last week\'s weight or reps on every compound lift — log everything'
      : 'Execute with precision and test where your body is after 8 weeks of work',
    generatedAt: new Date().toISOString(),
  };
}
