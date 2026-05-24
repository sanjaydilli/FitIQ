// ── Body composition calculations (pure math, no AI) ─────────────────────────

// Navy Method body fat estimation
// Reference: Hodgdon & Beckett (1984), used by US Navy
export function navyBodyFat(params: {
  sex: 'male' | 'female';
  heightCm: number;
  waistCm: number;
  neckCm: number;
  hipCm?: number; // required for female
}): number {
  const { sex, heightCm, waistCm, neckCm, hipCm } = params;
  const h = heightCm;

  if (sex === 'male') {
    const bf = 86.01 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(h) + 36.76;
    return Math.max(3, Math.min(60, Math.round(bf * 10) / 10));
  } else {
    const hip = hipCm ?? waistCm * 1.05;
    const bf  = 163.205 * Math.log10(waistCm + hip - neckCm) - 97.684 * Math.log10(h) - 78.387;
    return Math.max(10, Math.min(60, Math.round(bf * 10) / 10));
  }
}

// Mifflin-St Jeor BMR
// Reference: Mifflin et al. (1990) — most accurate for general population
export function calcBMR(params: {
  sex: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const { sex, weightKg, heightCm, age } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

// TDEE from BMR × activity multiplier
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  active:    1.725,
} as const;

export function calcTDEE(bmr: number, activity: keyof typeof ACTIVITY_MULTIPLIERS): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

// Lean body mass and fat mass from body fat %
export function calcBodyComp(weightKg: number, bodyFatPct: number) {
  const fatMass  = Math.round((weightKg * bodyFatPct / 100) * 10) / 10;
  const leanMass = Math.round((weightKg - fatMass) * 10) / 10;
  return { fatMass, leanMass };
}

// Ideal weight range (Devine formula with adjustments)
export function idealWeightRange(sex: 'male' | 'female', heightCm: number) {
  const inchesOver5ft = Math.max(0, (heightCm / 2.54) - 60);
  const base = sex === 'male' ? 50 : 45.5;
  const mid  = base + 2.3 * inchesOver5ft;
  return { low: Math.round((mid - 4) * 10) / 10, high: Math.round((mid + 4) * 10) / 10 };
}

// Body fat category labels
export function bodyFatCategory(sex: 'male' | 'female', pct: number): {
  label: string; color: string;
} {
  if (sex === 'male') {
    if (pct < 6)  return { label: 'Essential fat',   color: '#60A5FA' };
    if (pct < 14) return { label: 'Athletic',        color: '#5EEAD4' };
    if (pct < 18) return { label: 'Fitness',         color: '#4ade80' };
    if (pct < 25) return { label: 'Average',         color: '#FBBF24' };
    return          { label: 'Above average',  color: '#F87171' };
  } else {
    if (pct < 14) return { label: 'Essential fat',   color: '#60A5FA' };
    if (pct < 21) return { label: 'Athletic',        color: '#5EEAD4' };
    if (pct < 25) return { label: 'Fitness',         color: '#4ade80' };
    if (pct < 32) return { label: 'Average',         color: '#FBBF24' };
    return          { label: 'Above average',  color: '#F87171' };
  }
}

// Target calorie deficit/surplus for goal
export function goalCalorieAdjust(goal: 'lose' | 'gain' | 'endur' | 'main'): number {
  const map = { lose: -400, gain: 300, endur: 200, main: 0 };
  return map[goal];
}
