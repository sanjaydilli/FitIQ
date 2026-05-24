// ── FitIQ 3-Month Program Phase Engine ───────────────────────────────────────
// All science is here — Ollama just picks exercises and writes explanations.

export type ProgramType = 'muscle_gain' | 'body_recomp' | 'fat_loss' | 'strength';

export interface ProgramConfig {
  id: string;
  type: ProgramType;
  durationMonths: 3;
  startDate: string;      // YYYY-MM-DD
  startWeight: number;
  startLeanMass: number;
  startBodyFatPct: number;
  startTDEE: number;
  sex: 'male' | 'female';
  heightCm: number;
  age: number;
  activity: string;
}

export interface PhaseSpec {
  phase: 1 | 2 | 3;
  label: string;
  focus: string;
  startDate: string;
  endDate: string;
  // Nutrition offsets from TDEE
  calorieOffset: number;
  proteinMultiplier: number; // g per kg lean mass
  carbPct: number;           // % of non-protein calories
  // Training
  split: 'PPL' | 'Upper_Lower' | 'Full_Body';
  weeklyFrequency: number;
  repRange: [number, number];
  setRange: [number, number];
  rirTarget: number;          // reps in reserve
  restSecondsCompound: number;
  restSecondsIsolation: number;
  volumeLabel: 'Accumulation' | 'Intensification' | 'Realization';
  deloadWeek: boolean;
}

// ── Phase templates (block periodization) ────────────────────────────────────

const MUSCLE_GAIN: Omit<PhaseSpec, 'startDate' | 'endDate'>[] = [
  {
    phase: 1, label: 'Hypertrophy', focus: 'Volume accumulation — build the muscle you\'ll later harden',
    calorieOffset: 300, proteinMultiplier: 2.0, carbPct: 55,
    split: 'PPL', weeklyFrequency: 6, repRange: [8, 12], setRange: [3, 4],
    rirTarget: 2, restSecondsCompound: 90, restSecondsIsolation: 60,
    volumeLabel: 'Accumulation', deloadWeek: true,
  },
  {
    phase: 2, label: 'Strength', focus: 'Increase mechanical tension — force adaptations on new muscle',
    calorieOffset: 200, proteinMultiplier: 2.2, carbPct: 50,
    split: 'Upper_Lower', weeklyFrequency: 4, repRange: [4, 6], setRange: [4, 5],
    rirTarget: 1, restSecondsCompound: 180, restSecondsIsolation: 90,
    volumeLabel: 'Intensification', deloadWeek: true,
  },
  {
    phase: 3, label: 'Peak & Consolidate', focus: 'Maximize strength expression + mini diet to reveal gains',
    calorieOffset: 50, proteinMultiplier: 2.4, carbPct: 45,
    split: 'PPL', weeklyFrequency: 5, repRange: [6, 8], setRange: [3, 4],
    rirTarget: 1, restSecondsCompound: 120, restSecondsIsolation: 75,
    volumeLabel: 'Realization', deloadWeek: true,
  },
];

const BODY_RECOMP: Omit<PhaseSpec, 'startDate' | 'endDate'>[] = [
  {
    phase: 1, label: 'Foundation', focus: 'Establish baseline — full body strength with slight deficit',
    calorieOffset: -150, proteinMultiplier: 2.2, carbPct: 45,
    split: 'Full_Body', weeklyFrequency: 3, repRange: [8, 12], setRange: [3, 4],
    rirTarget: 2, restSecondsCompound: 90, restSecondsIsolation: 60,
    volumeLabel: 'Accumulation', deloadWeek: false,
  },
  {
    phase: 2, label: 'Mini Bulk', focus: 'Push lean mass up while fat is sensitized from Phase 1',
    calorieOffset: 200, proteinMultiplier: 2.0, carbPct: 50,
    split: 'Upper_Lower', weeklyFrequency: 4, repRange: [6, 10], setRange: [3, 4],
    rirTarget: 2, restSecondsCompound: 120, restSecondsIsolation: 75,
    volumeLabel: 'Intensification', deloadWeek: true,
  },
  {
    phase: 3, label: 'Cut & Define', focus: 'Aggressive deficit to strip fat while protecting new muscle',
    calorieOffset: -350, proteinMultiplier: 2.4, carbPct: 35,
    split: 'PPL', weeklyFrequency: 5, repRange: [8, 15], setRange: [3, 4],
    rirTarget: 1, restSecondsCompound: 75, restSecondsIsolation: 60,
    volumeLabel: 'Realization', deloadWeek: false,
  },
];

const FAT_LOSS: Omit<PhaseSpec, 'startDate' | 'endDate'>[] = [
  {
    phase: 1, label: 'Metabolic Reset', focus: 'High volume moderate deficit — condition metabolism and movement',
    calorieOffset: -300, proteinMultiplier: 2.4, carbPct: 40,
    split: 'Full_Body', weeklyFrequency: 4, repRange: [12, 15], setRange: [3, 4],
    rirTarget: 1, restSecondsCompound: 60, restSecondsIsolation: 45,
    volumeLabel: 'Accumulation', deloadWeek: false,
  },
  {
    phase: 2, label: 'Aggressive Cut', focus: 'Deeper deficit — maintain all muscle with high protein + heavy lifting',
    calorieOffset: -500, proteinMultiplier: 2.6, carbPct: 30,
    split: 'Upper_Lower', weeklyFrequency: 4, repRange: [8, 12], setRange: [3, 4],
    rirTarget: 1, restSecondsCompound: 75, restSecondsIsolation: 60,
    volumeLabel: 'Intensification', deloadWeek: true,
  },
  {
    phase: 3, label: 'Peak & Reveal', focus: 'Moderate deficit + carb cycling — reveal the result of 8 weeks work',
    calorieOffset: -250, proteinMultiplier: 2.5, carbPct: 35,
    split: 'PPL', weeklyFrequency: 5, repRange: [10, 15], setRange: [3, 4],
    rirTarget: 2, restSecondsCompound: 60, restSecondsIsolation: 45,
    volumeLabel: 'Realization', deloadWeek: false,
  },
];

const STRENGTH: Omit<PhaseSpec, 'startDate' | 'endDate'>[] = [
  {
    phase: 1, label: 'Hypertrophy Base', focus: 'Build the muscle mass needed to express strength at Phase 2',
    calorieOffset: 200, proteinMultiplier: 1.8, carbPct: 55,
    split: 'PPL', weeklyFrequency: 6, repRange: [8, 10], setRange: [4, 5],
    rirTarget: 2, restSecondsCompound: 120, restSecondsIsolation: 75,
    volumeLabel: 'Accumulation', deloadWeek: true,
  },
  {
    phase: 2, label: 'Strength Block', focus: 'Prilepin percentages — 80-90% 1RM, low reps, maximum tension',
    calorieOffset: 150, proteinMultiplier: 2.0, carbPct: 55,
    split: 'Upper_Lower', weeklyFrequency: 4, repRange: [3, 5], setRange: [5, 6],
    rirTarget: 1, restSecondsCompound: 240, restSecondsIsolation: 90,
    volumeLabel: 'Intensification', deloadWeek: true,
  },
  {
    phase: 3, label: 'Peak & Test', focus: 'Taper volume, prime CNS — test new 1RMs in Week 4',
    calorieOffset: 100, proteinMultiplier: 2.0, carbPct: 60,
    split: 'Upper_Lower', weeklyFrequency: 4, repRange: [1, 3], setRange: [3, 5],
    rirTarget: 0, restSecondsCompound: 300, restSecondsIsolation: 120,
    volumeLabel: 'Realization', deloadWeek: false,
  },
];

const TEMPLATES: Record<ProgramType, Omit<PhaseSpec, 'startDate' | 'endDate'>[]> = {
  muscle_gain: MUSCLE_GAIN,
  body_recomp: BODY_RECOMP,
  fat_loss: FAT_LOSS,
  strength: STRENGTH,
};

// ── Phase builders ────────────────────────────────────────────────────────────

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function buildPhaseSpecs(config: ProgramConfig): PhaseSpec[] {
  return TEMPLATES[config.type].map((t, i) => ({
    ...t,
    startDate: addMonths(config.startDate, i),
    endDate: addMonths(config.startDate, i + 1),
  }));
}

export function getCurrentPhase(config: ProgramConfig): PhaseSpec | null {
  const today = new Date().toISOString().slice(0, 10);
  return buildPhaseSpecs(config).find(s => today >= s.startDate && today < s.endDate) ?? null;
}

// ── Nutrition calculator for a phase ─────────────────────────────────────────

export function calcPhaseNutrition(phase: PhaseSpec, tdee: number, leanMassKg: number) {
  const calories = Math.max(1200, tdee + phase.calorieOffset);
  const protein = Math.round(leanMassKg * phase.proteinMultiplier);
  const remaining = Math.max(0, calories - protein * 4);
  const carbs = Math.round((remaining * phase.carbPct / 100) / 4);
  const fat = Math.round((remaining * (1 - phase.carbPct / 100)) / 9);
  return { calories, protein, carbs, fat };
}

// ── Timeline projection ───────────────────────────────────────────────────────

export interface TimelineProjection {
  goal: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  changePerMonth: number;
  monthsToGoal: number;
  confidenceNote: string;
  isFromRealData: boolean;
  milestones: { month: number; label: string; value: number }[];
}

export function projectTimeline(params: {
  type: ProgramType;
  currentLeanMass: number;
  currentBodyFatPct: number;
  currentWeight: number;
  sex: 'male' | 'female';
  measurements: { date: string; leanMass: number; bodyFatPct: number; weightKg: number }[];
}): TimelineProjection[] {
  const { type, currentLeanMass, currentBodyFatPct, currentWeight, sex, measurements } = params;

  function observedMonthlyRate(getter: (m: typeof measurements[0]) => number): number | null {
    if (measurements.length < 2) return null;
    const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const first = sorted[0];
    const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
    if (days < 14) return null;
    return ((getter(last) - getter(first)) / days) * 30;
  }

  const results: TimelineProjection[] = [];

  if (type === 'muscle_gain' || type === 'strength') {
    const obsRate = observedMonthlyRate(m => m.leanMass);
    // Beginner >0.75kg/mo, intermediate ~0.5, advanced ~0.25
    const estRate = currentLeanMass < 55 ? 0.75 : currentLeanMass < 65 ? 0.5 : 0.3;
    const rate = obsRate !== null && obsRate > 0 ? obsRate : estRate;
    const target3mo = Math.round((currentLeanMass + rate * 3) * 10) / 10;
    const remaining = target3mo - currentLeanMass;

    results.push({
      goal: 'Lean Mass Gain',
      currentValue: currentLeanMass,
      targetValue: target3mo,
      unit: 'kg lean mass',
      changePerMonth: Math.round(rate * 100) / 100,
      monthsToGoal: remaining > 0 ? Math.ceil(remaining / rate) : 0,
      confidenceNote: obsRate !== null ? 'Calculated from your actual measurements' : 'Estimated for your training level',
      isFromRealData: obsRate !== null,
      milestones: [1, 2, 3].map(m => ({
        month: m, label: `Month ${m}`,
        value: Math.round((currentLeanMass + rate * m) * 10) / 10,
      })),
    });
  }

  if (type === 'fat_loss' || type === 'body_recomp') {
    const obsRate = observedMonthlyRate(m => m.bodyFatPct);
    const safeRate = -0.8; // -0.8% bf per month
    const rate = obsRate !== null && obsRate < 0 ? obsRate : safeRate;
    const minBf = sex === 'male' ? 10 : 18;
    const target3mo = Math.max(minBf, Math.round((currentBodyFatPct + rate * 3) * 10) / 10);

    results.push({
      goal: 'Body Fat Reduction',
      currentValue: currentBodyFatPct,
      targetValue: target3mo,
      unit: '% body fat',
      changePerMonth: Math.round(rate * 100) / 100,
      monthsToGoal: Math.ceil((currentBodyFatPct - target3mo) / Math.abs(rate)),
      confidenceNote: obsRate !== null ? 'Calculated from your actual measurements' : 'Estimated at safe cut rate',
      isFromRealData: obsRate !== null,
      milestones: [1, 2, 3].map(m => ({
        month: m, label: `Month ${m}`,
        value: Math.max(minBf, Math.round((currentBodyFatPct + rate * m) * 10) / 10),
      })),
    });
  }

  if (type === 'body_recomp') {
    // Also show lean mass gain for recomp
    const obsRate = observedMonthlyRate(m => m.leanMass);
    const rate = obsRate !== null && obsRate > 0 ? obsRate : 0.3;
    results.push({
      goal: 'Lean Mass (Recomp)',
      currentValue: currentLeanMass,
      targetValue: Math.round((currentLeanMass + rate * 3) * 10) / 10,
      unit: 'kg lean mass',
      changePerMonth: Math.round(rate * 100) / 100,
      monthsToGoal: 3,
      confidenceNote: obsRate !== null ? 'Based on your data' : 'Conservative recomp estimate',
      isFromRealData: obsRate !== null,
      milestones: [1, 2, 3].map(m => ({
        month: m, label: `Month ${m}`,
        value: Math.round((currentLeanMass + rate * m) * 10) / 10,
      })),
    });
  }

  return results;
}

// ── Metadata for UI ───────────────────────────────────────────────────────────

export const PROGRAM_META: Record<ProgramType, {
  label: string;
  tagline: string;
  idealFor: string;
  color: string;
  icon: string;
}> = {
  muscle_gain: {
    label: 'Muscle Gain',
    tagline: 'Lean bulk with smart periodization',
    idealFor: 'You want to add 2-3kg of real muscle in 3 months',
    color: '#5EEAD4',
    icon: 'muscle',
  },
  body_recomp: {
    label: 'Body Recomp',
    tagline: 'Lose fat, gain muscle simultaneously',
    idealFor: 'You have 15-25% body fat and want to reshape without bulking',
    color: '#A78BFA',
    icon: 'target',
  },
  fat_loss: {
    label: 'Fat Loss',
    tagline: 'Aggressive cut while keeping muscle',
    idealFor: 'You want to lose 4-6% body fat as fast as safely possible',
    color: '#FB923C',
    icon: 'flame',
  },
  strength: {
    label: 'Strength',
    tagline: 'Peak your big 3 with Prilepin periodization',
    idealFor: 'You want a 10-20% increase in your squat, bench and deadlift',
    color: '#FBBF24',
    icon: 'barbell',
  },
};
