import { UserStats, Warning } from './warningTypes';

// ─── W01: Water vs Protein ────────────────────────────────────────────────────
function checkW01(s: UserStats): Warning | null {
  if (!(s.protein > 100 && s.water < s.targetWater * 0.6)) return null;
  return {
    id: 'W01',
    priority: 1,
    type: 'critical',
    title: 'Drink water now! 💧',
    shortMessage: `You ate ${s.protein}g protein but only ${s.water.toFixed(1)}L water. Kidneys are stressed.`,
    science:
      'High protein creates urea waste. Kidneys need 35ml water per gram of protein to filter safely. Low water + high protein = kidney stone risk and fatigue.',
    action: 'Add 500ml water now',
    indianFoods: ['Nimbu pani', 'Coconut water', 'Chaas'],
    xpReward: 20,
    cooldownHours: 4,
  };
}

// ─── W02: Calories Too Low ────────────────────────────────────────────────────
function checkW02(s: UserStats): Warning | null {
  const minCal = s.gender === 'male' ? 1500 : 1200;
  if (!(s.mealCount >= 2 && s.calories < minCal)) return null;
  return {
    id: 'W02',
    priority: 2,
    type: 'critical',
    title: 'Not enough fuel! ⚠️',
    shortMessage: `Only ${s.calories} kcal. Too low — muscle loss and metabolism damage begins.`,
    science:
      'Below minimum calories body enters starvation mode. Metabolism permanently slows. Muscle breaks down for energy. Fat loss actually stops long term.',
    action: 'Eat a balanced meal now',
    xpReward: 30,
    cooldownHours: 8,
  };
}

// ─── W03: Overtraining ────────────────────────────────────────────────────────
function checkW03(s: UserStats): Warning | null {
  const overtraining =
    s.consecutiveWorkoutDays >= 6 ||
    (s.strengthTrend === 'down' && s.consecutiveWorkoutDays > 3);
  if (!overtraining) return null;
  return {
    id: 'W03',
    priority: 3,
    type: 'critical',
    title: 'Rest day needed! 🛑',
    shortMessage: `${s.consecutiveWorkoutDays} days straight training. Injury risk is very high now.`,
    science:
      'Muscles grow during REST not during workouts. Continuous training causes damage to exceed repair. Testosterone drops, cortisol stays elevated, injury risk triples.',
    action: 'Take complete rest day today',
    xpReward: 25,
    cooldownHours: 24,
  };
}

// ─── W04: Sleep Warning ───────────────────────────────────────────────────────
function checkW04(s: UserStats): Warning | null {
  if (!(s.lastNightSleep < 6 && s.currentHour >= 6 && s.currentHour <= 10)) return null;
  return {
    id: 'W04',
    priority: 4,
    type: 'daily',
    title: "Sleep affecting your gains 😴",
    shortMessage: `Only ${s.lastNightSleep}hrs sleep. Testosterone is 15% lower today.`,
    science:
      "Under 6hrs sleep: cortisol rises 37%, testosterone drops 15%, growth hormone release cut by 60%. Today's workout gives less results and recovery is compromised.",
    action: 'Sleep by 10pm tonight',
    xpReward: 15,
    cooldownHours: 20,
  };
}

// ─── W05: Protein Target Missed ───────────────────────────────────────────────
function checkW05(s: UserStats): Warning | null {
  if (!(s.currentHour >= 20 && s.protein < s.targetProtein * 0.80)) return null;
  const deficit = Math.round(s.targetProtein - s.protein);
  return {
    id: 'W05',
    priority: 5,
    type: 'daily',
    title: 'Hit your protein today! 🥩',
    shortMessage: `Only ${s.protein}g of ${s.targetProtein}g. Muscle recovery at risk overnight.`,
    science:
      "Without adequate protein overnight, muscle breakdown exceeds synthesis. All today's workout effort is partially wasted without hitting protein target.",
    action: `Eat ${deficit}g protein now`,
    indianFoods: ['Paneer 100g=18g', 'Eggs 2=12g', 'Curd cup=10g', 'Chicken 100g=31g'],
    xpReward: 20,
    cooldownHours: 20,
  };
}

// ─── W06: Steps Too Low ───────────────────────────────────────────────────────
function checkW06(s: UserStats): Warning | null {
  if (!(s.currentHour >= 19 && s.steps < s.targetSteps * 0.50)) return null;
  return {
    id: 'W06',
    priority: 6,
    type: 'daily',
    title: 'NEAT too low today 👟',
    shortMessage: `Only ${s.steps.toLocaleString()} steps. Missing 300+ kcal burn today.`,
    science:
      'NEAT (daily movement) burns 300-500 kcal/day for active people. Low steps slows metabolism and stalls fat loss even with perfect diet and exercise.',
    action: 'Take 20 min walk now',
    xpReward: 15,
    cooldownHours: 20,
  };
}

// ─── W07: Pre Workout Fuel ────────────────────────────────────────────────────
function checkW07(s: UserStats): Warning | null {
  if (!(s.nextWorkoutMinutes > 0 && s.nextWorkoutMinutes < 90 && s.lastMealMinutesAgo > 180))
    return null;
  const hours = (s.lastMealMinutesAgo / 60).toFixed(1);
  return {
    id: 'W07',
    priority: 7,
    type: 'timing',
    title: 'Fuel up before training! ⚡',
    shortMessage: `Workout in ${s.nextWorkoutMinutes}min. No food in ${hours}hrs. Performance will drop.`,
    science:
      'Without pre-workout carbs, muscle glycogen depletes. Training capacity drops 20-30%. Strength reduces 10-15%. Body breaks down muscle for fuel instead.',
    action: 'Eat banana or rice now',
    indianFoods: ['Banana', 'Dates 3-4', 'Bread with jam', 'Small rice portion'],
    xpReward: 10,
    cooldownHours: 24,
  };
}

// ─── W08: Post Workout Protein ────────────────────────────────────────────────
function checkW08(s: UserStats): Warning | null {
  if (!(s.workoutMinutesAgo > 0 && s.workoutMinutesAgo < 120 && !s.postWorkoutMealLogged))
    return null;
  return {
    id: 'W08',
    priority: 8,
    type: 'timing',
    title: 'Anabolic window open! 🏆',
    shortMessage: `Workout done ${s.workoutMinutesAgo}min ago. Eat protein NOW for maximum recovery.`,
    science:
      'Muscle protein synthesis is elevated 2 hours post-workout. Muscles absorb amino acids 40% more efficiently in this window. Missing it significantly reduces training results.',
    action: 'Log post workout meal',
    indianFoods: ['Whey shake', 'Chicken 100g', 'Paneer 150g', 'Eggs 3'],
    xpReward: 25,
    cooldownHours: 24,
  };
}

// ─── W09: Deload Needed ───────────────────────────────────────────────────────
function checkW09(s: UserStats): Warning | null {
  const needsDeload =
    s.weeksSinceDeload >= 6 ||
    (s.strengthTrend === 'down' && s.weeksSinceDeload >= 4);
  if (!needsDeload) return null;
  return {
    id: 'W09',
    priority: 9,
    type: 'weekly',
    title: 'Deload week needed 📉',
    shortMessage: `${s.weeksSinceDeload} weeks without deload. Reduce volume this week for bigger gains.`,
    science:
      'Fatigue accumulates hiding true fitness gains. A deload (50% volume for 1 week) allows full recovery. Most people hit personal records the week after deload.',
    action: 'Start deload this week',
    xpReward: 30,
    cooldownHours: 168,
  };
}

// ─── W10: B12 and Vitamin D ───────────────────────────────────────────────────
function checkW10(s: UserStats): Warning | null {
  const needsB12 =
    (s.dietType === 'vegetarian' || s.dietType === 'vegan') && !s.takingB12;
  const needsVitD =
    (s.currentMonth >= 10 || s.currentMonth <= 1) && !s.takingVitaminD;
  if (!(needsB12 || needsVitD)) return null;
  return {
    id: 'W10',
    priority: 10,
    type: 'weekly',
    title: 'Supplement reminder 💊',
    shortMessage: 'Vegetarians need B12. 90% Indians need Vitamin D. Supplementing?',
    science:
      'B12 exists ONLY in animal foods. Deficiency causes irreversible nerve damage. Vitamin D deficiency affects 90% Indians reducing testosterone and immunity.',
    action: 'Take supplements today',
    xpReward: 10,
    cooldownHours: 168,
  };
}

// ─── W11: Iron Deficiency ─────────────────────────────────────────────────────
function checkW11(s: UserStats): Warning | null {
  const target = s.gender === 'male' ? 8 : 18;
  if (!(s.consecutiveLowIronDays >= 3 && s.ironIntake < target)) return null;
  return {
    id: 'W11',
    priority: 11,
    type: 'micro',
    title: 'Low iron affecting performance 🩸',
    shortMessage: `Low iron for 3+ days. Fatigue and poor endurance are early signs.`,
    science:
      `Iron carries oxygen in blood. Low iron means less oxygen to muscles causing fatigue, poor endurance, breathlessness during workouts. Women need 18mg/day, men need 8mg/day.`,
    action: 'Add iron-rich foods today',
    indianFoods: ['Rajma cup=5mg', 'Spinach cup=6mg', 'Pumpkin seeds=8mg/100g', 'Dark chocolate=3mg/30g'],
    tip: 'Eat with lemon juice for 3x absorption!',
    xpReward: 15,
    cooldownHours: 72,
  };
}

// ─── W12: Magnesium Low ───────────────────────────────────────────────────────
function checkW12(s: UserStats): Warning | null {
  if (
    !(
      s.consecutiveLowMagDays >= 3 &&
      s.magnesiumIntake < 300 &&
      (s.sleepQuality === 'poor' || s.muscleCramps)
    )
  )
    return null;
  return {
    id: 'W12',
    priority: 12,
    type: 'micro',
    title: 'Low magnesium hurting recovery 💤',
    shortMessage: 'Poor sleep + muscle cramps = magnesium deficiency. Very common in India.',
    science:
      'Magnesium regulates 300+ body processes including melatonin (sleep), cortisol (stress), muscle relaxation (cramps), and ATP production (energy). Deficiency reduces performance and recovery.',
    action: 'Add magnesium-rich foods',
    indianFoods: [
      'Pumpkin seeds=156mg/30g',
      'Dark chocolate=64mg/30g',
      'Almonds=80mg/30g',
      'Spinach cooked=78mg/cup',
    ],
    tip: '200-400mg magnesium glycinate at bedtime',
    xpReward: 15,
    cooldownHours: 72,
  };
}

// ─── W13: Omega-3 Deficiency ──────────────────────────────────────────────────
function checkW13(s: UserStats): Warning | null {
  if (!(s.consecutiveLowOmega3Days >= 5 && s.omega3Intake < 1.0)) return null;
  return {
    id: 'W13',
    priority: 13,
    type: 'micro',
    title: 'Chronic inflammation building 🔥',
    shortMessage: `Low omega-3 for 5+ days. Recovery slowing, joints inflamed.`,
    science:
      'Indian diet omega-6:omega-3 ratio averages 20:1. Ideal is 4:1. This imbalance causes systemic inflammation, slower muscle recovery, joint pain during training.',
    action: 'Add omega-3 source today',
    indianFoods: [
      'Flaxseeds 1tbsp=2.4g',
      'Walnuts handful=2.6g',
      'Chia seeds=1.8g/tbsp',
      'Fish oil supplement',
    ],
    xpReward: 15,
    cooldownHours: 72,
  };
}

// ─── W14: Zinc Low ────────────────────────────────────────────────────────────
function checkW14(s: UserStats): Warning | null {
  const target = s.gender === 'male' ? 11 : 8;
  if (
    !(
      s.consecutiveLowZincDays >= 5 &&
      s.zincIntake < target &&
      s.goal === 'muscle'
    )
  )
    return null;
  return {
    id: 'W14',
    priority: 14,
    type: 'micro',
    title: 'Low zinc reducing testosterone 💪',
    shortMessage: `Low zinc for 5+ days. Testosterone and muscle gains affected.`,
    science:
      'Zinc is direct precursor to testosterone synthesis. Deficiency reduces testosterone significantly. Critical for protein synthesis, immunity and recovery. Most common deficiency in vegetarian athletes.',
    action: 'Add zinc-rich foods today',
    indianFoods: [
      'Pumpkin seeds=6.6mg/100g',
      'Cashews=5.6mg/100g',
      'Chickpeas=2.5mg/cup',
      'Paneer=2.9mg/100g',
    ],
    tip: 'Take zinc supplement away from dairy meals',
    xpReward: 15,
    cooldownHours: 72,
  };
}

// ─── W15: Tea Blocking Iron ───────────────────────────────────────────────────
function checkW15(s: UserStats): Warning | null {
  const ironTarget = s.gender === 'male' ? 8 : 18;
  if (
    !(
      s.teaLoggedMinutesAgo > 0 &&
      s.teaLoggedMinutesAgo < 60 &&
      s.ironRichMealLogged &&
      s.ironIntake < ironTarget
    )
  )
    return null;
  return {
    id: 'W15',
    priority: 15,
    type: 'micro',
    title: 'Chai blocking your iron! ☕',
    shortMessage: 'Tea within 1 hour of meal blocks 50-70% of iron absorption.',
    science:
      'Tannins in tea bind to iron forming compounds your gut cannot absorb. Major reason for iron deficiency in Indians who drink chai with every meal. Even 1 cup chai with dal wastes most of the iron.',
    action: 'Wait 1 hour after meals for chai',
    tip: 'Add lemon to dal instead for 3x better absorption',
    xpReward: 10,
    cooldownHours: 24,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function checkAllWarnings(stats: UserStats): Warning[] {
  const checks = [
    checkW01,
    checkW02,
    checkW03,
    checkW04,
    checkW05,
    checkW06,
    checkW07,
    checkW08,
    checkW09,
    checkW10,
    checkW11,
    checkW12,
    checkW13,
    checkW14,
    checkW15,
  ];

  return checks
    .map((fn) => fn(stats))
    .filter((w): w is Warning => w !== null)
    .sort((a, b) => a.priority - b.priority);
}
