export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'cardio';
export type Equipment  = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'band';
export type ExCategory = 'compound' | 'isolation' | 'cardio' | 'bodyweight';

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondary?: MuscleGroup[];
  category: ExCategory;
  equipment: Equipment;
  defaultSets: number;
  defaultReps: number;
  restSeconds: number;
  why: string;
}

export const EXERCISE_DB: ExerciseTemplate[] = [
  // ── CHEST ──────────────────────────────────────────────────────────────────
  { id: 'bench_bb',       name: 'Barbell Bench Press',     muscleGroup: 'chest', secondary: ['triceps','shoulders'], category: 'compound',  equipment: 'barbell',   defaultSets: 4, defaultReps: 8,  restSeconds: 90,  why: 'Best overall chest builder. Heaviest first while CNS is fresh. 1.25kg weekly progression.' },
  { id: 'incline_db',     name: 'Incline Dumbbell Press',  muscleGroup: 'chest', secondary: ['shoulders'],           category: 'compound',  equipment: 'dumbbell',  defaultSets: 4, defaultReps: 10, restSeconds: 75,  why: 'Targets upper chest fibres flat pressing misses. Critical for a full chest look.' },
  { id: 'cable_fly',      name: 'Cable Crossover Fly',     muscleGroup: 'chest',                                     category: 'isolation', equipment: 'cable',     defaultSets: 3, defaultReps: 12, restSeconds: 60,  why: 'Constant tension through full stretch. Superior hypertrophy signal vs free-weight flys.' },
  { id: 'dips',           name: 'Dips (Chest)',            muscleGroup: 'chest', secondary: ['triceps'],             category: 'bodyweight',equipment: 'bodyweight',defaultSets: 3, defaultReps: 10, restSeconds: 90,  why: 'Lower chest + triceps. Lean forward 15° to shift emphasis onto pecs. Load with belt when easy.' },
  { id: 'pushup',         name: 'Push-up',                 muscleGroup: 'chest', secondary: ['triceps','shoulders'], category: 'bodyweight',equipment: 'bodyweight',defaultSets: 3, defaultReps: 15, restSeconds: 60,  why: 'Good finisher or home option. Elevate feet for upper chest emphasis.' },

  // ── BACK ───────────────────────────────────────────────────────────────────
  { id: 'deadlift',       name: 'Conventional Deadlift',   muscleGroup: 'back',  secondary: ['legs','core'],         category: 'compound',  equipment: 'barbell',   defaultSets: 4, defaultReps: 5,  restSeconds: 180, why: 'Highest systemic muscle activation of any lift. Best full-posterior chain builder. 2.5kg weekly.' },
  { id: 'pullup',         name: 'Pull-up / Chin-up',       muscleGroup: 'back',  secondary: ['biceps'],              category: 'bodyweight',equipment: 'bodyweight',defaultSets: 4, defaultReps: 6,  restSeconds: 90,  why: 'Best bodyweight back exercise. Chin-up (supinated) adds 20% more bicep involvement.' },
  { id: 'bent_row',       name: 'Barbell Bent-Over Row',   muscleGroup: 'back',  secondary: ['biceps','core'],       category: 'compound',  equipment: 'barbell',   defaultSets: 4, defaultReps: 8,  restSeconds: 90,  why: 'Thickness builder. Overhand grip hits rhomboids + mid-traps. Control the eccentric.' },
  { id: 'cable_row',      name: 'Seated Cable Row',        muscleGroup: 'back',  secondary: ['biceps'],              category: 'compound',  equipment: 'cable',     defaultSets: 3, defaultReps: 12, restSeconds: 75,  why: 'Constant tension unlike dumbbells. V-bar hits inner back; wide grip hits outer lats.' },
  { id: 'lat_pulldown',   name: 'Lat Pulldown',            muscleGroup: 'back',  secondary: ['biceps'],              category: 'compound',  equipment: 'cable',     defaultSets: 4, defaultReps: 10, restSeconds: 75,  why: 'Lat width builder. Pull to chin, elbows down and back. Avoid pulling behind neck.' },
  { id: 'db_row',         name: 'Single-Arm DB Row',       muscleGroup: 'back',                                      category: 'compound',  equipment: 'dumbbell',  defaultSets: 3, defaultReps: 12, restSeconds: 60,  why: 'Full ROM and unilateral balance. Allows heavier load than bilateral rows for most people.' },

  // ── SHOULDERS ──────────────────────────────────────────────────────────────
  { id: 'ohp_bb',         name: 'Overhead Press (Barbell)',muscleGroup: 'shoulders',secondary: ['triceps'],          category: 'compound',  equipment: 'barbell',   defaultSets: 4, defaultReps: 6,  restSeconds: 120, why: 'Best overall shoulder builder + core stability demand. Seated DB version equally valid.' },
  { id: 'lat_raise',      name: 'Lateral Raise',           muscleGroup: 'shoulders',                                 category: 'isolation', equipment: 'dumbbell',  defaultSets: 4, defaultReps: 15, restSeconds: 60,  why: 'Medial head only builder — this creates the 3D shoulder look. Slight forward lean hits sweet spot.' },
  { id: 'face_pull',      name: 'Face Pull',               muscleGroup: 'shoulders',secondary: ['back'],             category: 'isolation', equipment: 'cable',     defaultSets: 3, defaultReps: 15, restSeconds: 60,  why: 'Rear delt + external rotator health. Critical for posture and shoulder longevity. Often skipped.' },
  { id: 'rear_delt_fly',  name: 'Rear Delt Fly (DB)',      muscleGroup: 'shoulders',                                 category: 'isolation', equipment: 'dumbbell',  defaultSets: 3, defaultReps: 15, restSeconds: 60,  why: 'Rear delts lag in most gym-goers — imbalance causes rounded shoulder posture over time.' },

  // ── ARMS ───────────────────────────────────────────────────────────────────
  { id: 'barbell_curl',   name: 'Barbell Curl',            muscleGroup: 'biceps',                                    category: 'isolation', equipment: 'barbell',   defaultSets: 4, defaultReps: 10, restSeconds: 60,  why: 'Allows heaviest bicep loading. EZ-bar reduces wrist strain. Full extension at bottom is key.' },
  { id: 'incline_curl',   name: 'Incline Dumbbell Curl',   muscleGroup: 'biceps',                                    category: 'isolation', equipment: 'dumbbell',  defaultSets: 3, defaultReps: 12, restSeconds: 60,  why: 'Long head stretch position — hits the bicep peak. No momentum possible on incline bench.' },
  { id: 'hammer_curl',    name: 'Hammer Curl',             muscleGroup: 'biceps',                                    category: 'isolation', equipment: 'dumbbell',  defaultSets: 3, defaultReps: 12, restSeconds: 60,  why: 'Brachialis builder under the bicep — makes arms look thicker. Neutral grip = less supination.' },
  { id: 'tricep_push',    name: 'Tricep Pushdown',         muscleGroup: 'triceps',                                   category: 'isolation', equipment: 'cable',     defaultSets: 4, defaultReps: 12, restSeconds: 60,  why: 'Lateral head emphasis — visible from front. Keep elbows glued to sides. Rope handle = better peak.' },
  { id: 'skull_crusher',  name: 'Skull Crusher (EZ Bar)',  muscleGroup: 'triceps',                                   category: 'isolation', equipment: 'barbell',   defaultSets: 3, defaultReps: 10, restSeconds: 60,  why: 'Long + medial head builder. Lower bar behind head slightly for better stretch on long head.' },
  { id: 'overhead_ext',   name: 'Overhead Tricep Ext (DB)',muscleGroup: 'triceps',                                   category: 'isolation', equipment: 'dumbbell',  defaultSets: 3, defaultReps: 12, restSeconds: 60,  why: 'Only movement that fully stretches the long head of triceps. Arms plateau without this.' },

  // ── LEGS ───────────────────────────────────────────────────────────────────
  { id: 'squat',          name: 'Barbell Back Squat',      muscleGroup: 'legs',  secondary: ['core','back'],         category: 'compound',  equipment: 'barbell',   defaultSets: 4, defaultReps: 8,  restSeconds: 180, why: 'King of leg exercises. Quad + glute + hamstring + core. 2.5kg weekly on good days.' },
  { id: 'leg_press',      name: 'Leg Press',               muscleGroup: 'legs',                                      category: 'compound',  equipment: 'machine',   defaultSets: 4, defaultReps: 10, restSeconds: 120, why: 'Higher volume without spinal load. Feet high = more hamstring/glute. Feet low = more quad.' },
  { id: 'rdl',            name: 'Romanian Deadlift',       muscleGroup: 'legs',  secondary: ['back'],                category: 'compound',  equipment: 'barbell',   defaultSets: 3, defaultReps: 10, restSeconds: 90,  why: 'Best hamstring stretch + strength builder. Soft knees, hip hinge, bar tracks legs. Feel the stretch.' },
  { id: 'leg_curl',       name: 'Lying Leg Curl',          muscleGroup: 'legs',                                      category: 'isolation', equipment: 'machine',   defaultSets: 3, defaultReps: 12, restSeconds: 60,  why: 'Hamstring isolation. Curl fully, pause 1s at peak. Most gym-goers neglect hamstrings.' },
  { id: 'leg_ext',        name: 'Leg Extension',           muscleGroup: 'legs',                                      category: 'isolation', equipment: 'machine',   defaultSets: 3, defaultReps: 15, restSeconds: 60,  why: 'Quad isolation. Full extension at top. Research supports quad health over feared knee strain.' },
  { id: 'calf_raise',     name: 'Standing Calf Raise',     muscleGroup: 'legs',                                      category: 'isolation', equipment: 'machine',   defaultSets: 4, defaultReps: 20, restSeconds: 60,  why: 'Calves need high volume and full ROM. Single-leg version doubles effectiveness per set.' },
  { id: 'lunge',          name: 'Walking Lunge (DB)',       muscleGroup: 'legs',  secondary: ['core'],                category: 'compound',  equipment: 'dumbbell',  defaultSets: 3, defaultReps: 12, restSeconds: 90,  why: 'Unilateral strength + balance. Corrects leg dominance imbalances. Add weight when 12 reps easy.' },

  // ── CORE ───────────────────────────────────────────────────────────────────
  { id: 'plank',          name: 'Plank',                   muscleGroup: 'core',                                      category: 'bodyweight',equipment: 'bodyweight',defaultSets: 3, defaultReps: 60, restSeconds: 60,  why: 'Anti-extension core stability. More functional than crunches for spinal health under load.' },
  { id: 'cable_crunch',   name: 'Cable Crunch',            muscleGroup: 'core',                                      category: 'isolation', equipment: 'cable',     defaultSets: 3, defaultReps: 15, restSeconds: 60,  why: 'Only weighted ab exercise with constant tension. Crucial for actually building visible abs.' },
  { id: 'leg_raise',      name: 'Hanging Leg Raise',       muscleGroup: 'core',                                      category: 'bodyweight',equipment: 'bodyweight',defaultSets: 3, defaultReps: 10, restSeconds: 60,  why: 'Lower ab emphasis. Full leg raise > knee raise. Slow eccentric to eliminate momentum.' },
  { id: 'ab_wheel',       name: 'Ab Wheel Rollout',        muscleGroup: 'core',                                      category: 'bodyweight',equipment: 'bodyweight',defaultSets: 3, defaultReps: 8,  restSeconds: 90,  why: 'Hardest core exercise. Trains entire anterior chain. Start on knees, progress to standing.' },

  // ── CARDIO ─────────────────────────────────────────────────────────────────
  { id: 'treadmill',      name: 'Treadmill Run',           muscleGroup: 'cardio',                                    category: 'cardio',    equipment: 'machine',   defaultSets: 1, defaultReps: 30, restSeconds: 0,   why: 'Zone 2 cardio at 60–70% max HR burns fat and builds aerobic base. 3–4x/week is optimal.' },
  { id: 'hiit_bike',      name: 'HIIT Cycling',            muscleGroup: 'cardio',                                    category: 'cardio',    equipment: 'machine',   defaultSets: 8, defaultReps: 30, restSeconds: 30,  why: '8 rounds × 30s max effort + 30s rest. Burns 2× calories of steady-state in half the time.' },
];

export const MUSCLE_GROUPS: { id: MuscleGroup; label: string; icon: string }[] = [
  { id: 'chest',     label: 'Chest',     icon: '🫁' },
  { id: 'back',      label: 'Back',      icon: '🔙' },
  { id: 'shoulders', label: 'Shoulders', icon: '💪' },
  { id: 'biceps',    label: 'Biceps',    icon: '💪' },
  { id: 'triceps',   label: 'Triceps',   icon: '💪' },
  { id: 'legs',      label: 'Legs',      icon: '🦵' },
  { id: 'core',      label: 'Core',      icon: '⚡' },
  { id: 'cardio',    label: 'Cardio',    icon: '🏃' },
];

export const PUSH_DAY  = ['bench_bb', 'incline_db', 'cable_fly', 'ohp_bb', 'tricep_push', 'skull_crusher'];
export const PULL_DAY  = ['deadlift', 'pullup', 'bent_row', 'cable_row', 'barbell_curl', 'incline_curl'];
export const LEG_DAY   = ['squat', 'rdl', 'leg_press', 'leg_curl', 'leg_ext', 'calf_raise'];
export const FULL_BODY = ['squat', 'bench_bb', 'bent_row', 'ohp_bb', 'barbell_curl', 'tricep_push'];

export function getExercise(id: string): ExerciseTemplate | undefined {
  return EXERCISE_DB.find(e => e.id === id);
}
