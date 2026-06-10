import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card, PrimaryButton } from '../components/Card';
import { Icon, IconName } from '../components/Icon';
import { calcBMR, calcTDEE, goalCalorieAdjust } from '../utils/bodyComposition';

// Post-onboarding tour: walks the user through THEIR numbers and the science
// behind each one. All values are pure math from utils/bodyComposition.

interface TourStep {
  icon: IconName;
  color: string;
  label: string;
  heroValue: string;
  heroUnit: string;
  title: string;
  body: string;
  science: string;
  formula?: string;
}

const GOAL_LABEL: Record<string, string> = {
  lose: 'fat loss', gain: 'muscle gain', endur: 'endurance', main: 'maintenance',
};

export function ScienceTour() {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = useMemo<TourStep[]>(() => {
    const bmr = calcBMR({ sex: user.sex, weightKg: user.weightKg, heightCm: user.heightCm, age: user.age });
    const tdee = calcTDEE(bmr, user.activity);
    const adjust = goalCalorieAdjust(user.goal);
    const target = tdee + adjust;
    const proteinLow = Math.round(user.weightKg * 1.6);
    const proteinHigh = Math.round(user.weightKg * 2.2);
    const proteinTarget = Math.round(user.weightKg * 2);
    const weeklyRateKg = Math.abs(adjust) * 7 / 7700; // 7,700 kcal ≈ 1 kg body fat

    const goalBody =
      user.goal === 'lose'
        ? `To lose fat you'll eat ${Math.abs(adjust)} kcal below maintenance — about ${target.toLocaleString()} kcal/day. That's roughly ${weeklyRateKg.toFixed(2)} kg of fat per week: steady enough to keep your muscle, strength and sanity.`
        : user.goal === 'gain'
        ? `To build muscle you'll eat ${adjust} kcal above maintenance — about ${target.toLocaleString()} kcal/day. A small surplus maximises muscle growth while keeping fat gain minimal.`
        : user.goal === 'endur'
        ? `For endurance training you'll eat about ${target.toLocaleString()} kcal/day — a small surplus to fuel longer sessions and recovery.`
        : `You'll eat right at maintenance — about ${target.toLocaleString()} kcal/day — to hold your weight steady while improving body composition through training.`;

    const goalScience =
      user.goal === 'lose'
        ? `1 kg of body fat stores ≈ 7,700 kcal. A ${Math.abs(adjust)} kcal daily deficit = ${(Math.abs(adjust) * 7).toLocaleString()} kcal/week ≈ ${weeklyRateKg.toFixed(2)} kg of fat. Bigger deficits backfire: research shows aggressive cuts increase muscle loss and trigger metabolic adaptation — your body fights back by burning less.`
        : user.goal === 'gain'
        ? `Muscle protein synthesis needs surplus energy, but studies show ~200–300 kcal extra is enough to maximise growth. Anything beyond that mostly becomes body fat — "dirty bulking" just means a longer cut later.`
        : `Energy balance is the foundation: calories in vs calories out decides whether your weight moves. Training then decides what that weight is made of — muscle or fat.`;

    return [
      {
        icon: 'flame', color: '#EA580C', label: 'STEP 1 · YOUR ENGINE',
        heroValue: tdee.toLocaleString(), heroUnit: 'kcal/day',
        title: `${user.name}, this is your maintenance`,
        body: `Your body burns about ${tdee.toLocaleString()} kcal every day — even before any workout. Eat exactly this and your weight stays put. Everything in FitIQ is built around this number.`,
        science: `We use the Mifflin-St Jeor equation (1990) — the most accurate formula for the general population — then multiply by ${user.activity === 'sedentary' ? '1.2' : user.activity === 'light' ? '1.375' : user.activity === 'moderate' ? '1.55' : '1.725'}× for your "${user.activity}" activity level.`,
        formula: `BMR = 10×${user.weightKg} + 6.25×${user.heightCm} − 5×${user.age} ${user.sex === 'male' ? '+ 5' : '− 161'} = ${bmr.toLocaleString()} kcal`,
      },
      {
        icon: 'target', color: theme.accent, label: `STEP 2 · ${GOAL_LABEL[user.goal].toUpperCase()} TARGET`,
        heroValue: target.toLocaleString(), heroUnit: 'kcal/day',
        title: 'Your daily calorie target',
        body: goalBody,
        science: goalScience,
        formula: `${tdee.toLocaleString()} ${adjust >= 0 ? '+' : '−'} ${Math.abs(adjust)} = ${target.toLocaleString()} kcal`,
      },
      {
        icon: 'utensils', color: '#16A34A', label: 'STEP 3 · PROTEIN',
        heroValue: `${proteinLow}–${proteinHigh}`, heroUnit: 'g/day',
        title: 'Protein is non-negotiable',
        body: `At ${user.weightKg} kg, you need ${proteinLow}–${proteinHigh}g of protein daily (1.6–2.2 g per kg). FitIQ targets ${proteinTarget}g for you. Dal, paneer, eggs, chicken, curd — we'll track every gram.`,
        science: `Meta-analyses show muscle protein synthesis maxes out around 1.6–2.2 g/kg/day for people who train. Protein also has the highest thermic effect (20–30% of its calories burn off in digestion) and keeps you fuller than carbs or fat — which is why it matters double ${user.goal === 'lose' ? 'in a deficit' : 'for your goal'}.`,
      },
      {
        icon: 'dumbbell', color: '#7C3AED', label: 'STEP 4 · TRAINING',
        heroValue: '10–20', heroUnit: 'sets/muscle/week',
        title: 'Lift. Progress. Repeat.',
        body: `Your calorie target decides your weight — training decides what it's made of. FitIQ builds you a plan, tracks every set, and tells you when each muscle is under- or over-worked.`,
        science: `The growth driver is progressive overload: gradually doing more than last time. Research supports 10–20 hard sets per muscle per week as the hypertrophy sweet spot — our plan editor literally shows you this bar for every muscle.`,
      },
      {
        icon: 'run', color: '#2563EB', label: 'STEP 5 · DAILY MOVEMENT',
        heroValue: user.stepGoal.toLocaleString(), heroUnit: 'steps/day',
        title: 'Steps are your secret weapon',
        body: `Outside the gym, your step count is the biggest lever on daily burn. We'll auto-track your steps and nudge you toward ${user.stepGoal.toLocaleString()} a day.`,
        science: `This is NEAT — non-exercise activity thermogenesis. It varies by up to 800 kcal/day between people and quietly decides who finds ${user.goal === 'lose' ? 'fat loss' : 'staying lean'} "easy". 8–10k steps ≈ 250–400 kcal burned without a single gym minute.`,
      },
    ];
  }, [user, theme.accent]);

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '64px 24px 32px' }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
          {steps.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 22 : 7, background: i <= step ? s.color : 'rgba(15,23,42,0.12)' }}
              transition={{ duration: 0.3 }}
              style={{ height: 7, borderRadius: 4 }}
            />
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 0.8, 0.22, 1] }}
            >
              {/* Icon + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `${s.color}14`, border: `1px solid ${s.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={s.icon} size={22} color={s.color} />
                </div>
                <div style={{ fontSize: 10, fontFamily: theme.mono, fontWeight: 800, letterSpacing: 1.8, color: s.color }}>
                  {s.label}
                </div>
              </div>

              {/* Hero number */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <motion.span
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  style={{
                    fontSize: 56, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1,
                    fontFamily: theme.mono, fontFeatureSettings: '"tnum"', color: s.color,
                    display: 'inline-block',
                  }}
                >
                  {s.heroValue}
                </motion.span>
                <span style={{ fontSize: 14, color: theme.textMute, fontFamily: theme.mono }}>{s.heroUnit}</span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.25, marginBottom: 12 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 14, color: theme.textDim, lineHeight: 1.65, marginBottom: 16 }}>
                {s.body}
              </div>

              {/* Formula (when present) */}
              {s.formula && (
                <Card style={{ padding: '10px 14px', borderRadius: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginBottom: 4 }}>
                    YOUR NUMBERS
                  </div>
                  <div style={{ fontSize: 13, fontFamily: theme.mono, fontWeight: 700, color: theme.text }}>
                    {s.formula}
                  </div>
                </Card>
              )}

              {/* Science box */}
              <Card style={{ padding: '12px 14px', borderRadius: 14 }}>
                <div style={{ fontSize: 9, color: s.color, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 800, marginBottom: 5 }}>
                  THE SCIENCE
                </div>
                <div style={{ fontSize: 12.5, color: theme.textDim, lineHeight: 1.6 }}>
                  {s.science}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {step > 0 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep(step - 1)}
              style={{
                padding: '15px 22px', borderRadius: 16, cursor: 'pointer',
                border: `1px solid ${theme.cardBorder}`, background: theme.card,
                color: theme.textDim, fontSize: 15, fontWeight: 700, fontFamily: theme.font,
              }}
            >
              Back
            </motion.button>
          )}
          <PrimaryButton
            onClick={() => (isLast ? navigate('/home') : setStep(step + 1))}
            style={{ flex: 1 }}
          >
            {isLast ? "Let's go →" : 'Next'}
          </PrimaryButton>
        </div>

        {/* Skip */}
        {!isLast && (
          <div
            onClick={() => navigate('/home')}
            style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: theme.textMute, cursor: 'pointer', fontWeight: 600 }}
          >
            Skip tour
          </div>
        )}
      </div>
    </Background>
  );
}
