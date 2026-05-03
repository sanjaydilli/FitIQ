import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser, Goal, Sex, Diet, Activity } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card, PrimaryButton } from '../components/Card';

const GOALS: { id: Goal; t: string; s: string; icon: string }[] = [
  { id: 'lose', t: 'Lose Fat', s: 'Cut down, stay strong', icon: '🔥' },
  { id: 'gain', t: 'Build Muscle', s: 'Lean mass, recomp', icon: '💪' },
  { id: 'endur', t: 'Endurance', s: 'Cardio, stamina', icon: '🏃' },
  { id: 'main', t: 'Stay Healthy', s: 'General wellness', icon: '✨' },
];

const DIETS: { id: Diet; t: string; s: string; ic: string }[] = [
  { id: 'veg', t: 'Vegetarian', s: 'No meat, no eggs', ic: '🥬' },
  { id: 'eggetarian', t: 'Eggetarian', s: 'Veg + eggs', ic: '🥚' },
  { id: 'nveg', t: 'Non-vegetarian', s: 'Everything', ic: '🍗' },
  { id: 'vegan', t: 'Vegan', s: 'Plant-based only', ic: '🌱' },
  { id: 'jain', t: 'Jain', s: 'No roots, no onion', ic: '🪷' },
];

const ACTIVITIES: { id: Activity; t: string; s: string; icon: string }[] = [
  { id: 'sedentary', t: 'Sedentary', s: 'Desk job, no workouts', icon: '🪑' },
  { id: 'light', t: 'Lightly Active', s: '1–2 sessions/week', icon: '🚶' },
  { id: 'moderate', t: 'Moderately Active', s: '3–5 sessions/week', icon: '🏋️' },
  { id: 'active', t: 'Very Active', s: '6+ sessions, athlete', icon: '⚡' },
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i < step ? theme.accent : 'rgba(255,255,255,0.1)',
            transition: 'background .3s',
          }}
        />
      ))}
    </div>
  );
}

function StepHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: React.ReactNode;
  subtitle?: string;
}) {
  const { theme } = useTheme();
  return (
    <>
      <div
        style={{
          fontSize: 11,
          color: theme.accent,
          fontFamily: theme.mono,
          letterSpacing: 1.5,
          marginBottom: 8,
        }}
      >
        STEP {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: -0.8,
          lineHeight: 1.15,
          marginBottom: 8,
          color: theme.text,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ color: theme.textDim, fontSize: 14, marginBottom: 24 }}>{subtitle}</div>
      )}
    </>
  );
}

function GoalStep({ value, onChange }: { value: Goal; onChange: (g: Goal) => void }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      {GOALS.map((g) => {
        const sel = g.id === value;
        return (
          <motion.div key={g.id} whileTap={{ scale: 0.98 }}>
            <Card selected={sel} onClick={() => onChange(g.id)} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: sel
                    ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
                    : 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                {g.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{g.t}</div>
                <div style={{ color: theme.textDim, fontSize: 12 }}>{g.s}</div>
              </div>
              <Radio sel={sel} />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function Radio({ sel }: { sel: boolean }) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        border: sel ? `2px solid ${theme.accent}` : '1.5px solid rgba(255,255,255,0.2)',
        background: sel ? theme.accent : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {sel && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6.5L4.5 9L10 3.5"
            stroke={theme.onAccent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function Slider({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  const { theme } = useTheme();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <Card style={{ padding: 18, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: theme.textDim, fontFamily: theme.mono, letterSpacing: 1 }}>
          {label}
        </span>
        <span style={{ fontFamily: theme.mono, fontSize: 11, color: theme.textMute }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: -1,
            fontFeatureSettings: '"tnum"',
            color: theme.text,
          }}
        >
          {display ?? value}
        </span>
        <span style={{ color: theme.textDim, fontSize: 14 }}>{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: theme.accent }}
      />
      <div style={{ position: 'relative', height: 4, marginTop: -16, background: 'rgba(255,255,255,0.08)', borderRadius: 2, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${pct}%`,
            height: '100%',
            borderRadius: 2,
            background: `linear-gradient(90deg, ${theme.accent2}, ${theme.accent})`,
          }}
        />
      </div>
    </Card>
  );
}

function StatsStep({
  sex,
  setSex,
  height,
  setHeight,
  weight,
  setWeight,
  age,
  setAge,
}: {
  sex: Sex;
  setSex: (s: Sex) => void;
  height: number;
  setHeight: (n: number) => void;
  weight: number;
  setWeight: (n: number) => void;
  age: number;
  setAge: (n: number) => void;
}) {
  const { theme } = useTheme();
  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {(['male', 'female'] as Sex[]).map((s) => {
          const sel = s === sex;
          return (
            <motion.div key={s} whileTap={{ scale: 0.98 }} style={{ flex: 1 }}>
              <Card
                selected={sel}
                onClick={() => setSex(s)}
                style={{ padding: '14px', textAlign: 'center', fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }}
              >
                {s}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Slider label="HEIGHT" unit="cm" value={height} min={140} max={210} onChange={setHeight} />
      <Slider
        label="WEIGHT"
        unit="kg"
        value={weight}
        min={40}
        max={150}
        step={0.1}
        onChange={setWeight}
        display={weight.toFixed(1)}
      />

      <Card style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div
              style={{
                fontSize: 13,
                color: theme.textDim,
                fontFamily: theme.mono,
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              AGE
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{age} yrs</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['−', '+'].map((s, i) => (
              <button
                key={s}
                onClick={() => setAge(Math.max(15, Math.min(80, age + (i === 0 ? -1 : 1))))}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: theme.text,
                  border: `1px solid ${theme.cardBorder}`,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

function DietStep({ value, onChange }: { value: Diet; onChange: (d: Diet) => void }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      {DIETS.map((d) => {
        const sel = d.id === value;
        return (
          <motion.div key={d.id} whileTap={{ scale: 0.98 }}>
            <Card selected={sel} onClick={() => onChange(d.id)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{d.ic}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{d.t}</div>
                <div style={{ color: theme.textDim, fontSize: 12 }}>{d.s}</div>
              </div>
              <Radio sel={sel} />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function ActivityStep({ value, onChange }: { value: Activity; onChange: (a: Activity) => void }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      {ACTIVITIES.map((a) => {
        const sel = a.id === value;
        return (
          <motion.div key={a.id} whileTap={{ scale: 0.98 }}>
            <Card selected={sel} onClick={() => onChange(a.id)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: sel
                    ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
                    : 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                {a.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{a.t}</div>
                <div style={{ color: theme.textDim, fontSize: 12 }}>{a.s}</div>
              </div>
              <Radio sel={sel} />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

export function OnboardingFlow() {
  const { user, update } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>(user.goal);
  const [sex, setSex] = useState<Sex>(user.sex);
  const [height, setHeight] = useState(user.heightCm);
  const [weight, setWeight] = useState(user.weightKg);
  const [age, setAge] = useState(user.age);
  const [diet, setDiet] = useState<Diet>(user.diet);
  const [activity, setActivity] = useState<Activity>(user.activity);

  const total = 4;
  const ctas = ['Continue →', 'Continue →', 'Continue →', 'Generate my plan ✨'];

  const next = () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      update({ goal, sex, heightCm: height, weightKg: weight, age, diet, activity });
      navigate('/analysis');
    }
  };

  const titles: React.ReactNode[] = [
    <>What's your<br />primary goal?</>,
    <>Tell us about<br />your body</>,
    <>What's on your<br />plate?</>,
    <>How active are<br />you, day-to-day?</>,
  ];

  const subtitles = [
    "We'll calibrate every workout, meal and macro around this.",
    undefined,
    "We'll suggest meals you'll actually eat — dal, paneer, biryani, all in.",
    'Used to fine-tune your daily calorie target.',
  ];

  return (
    <Background>
      <div style={{ padding: '70px 24px 30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ProgressBar step={step + 1} total={total} />
        <StepHeader step={step + 1} total={total} title={titles[step]} subtitle={subtitles[step]} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            {step === 0 && <GoalStep value={goal} onChange={setGoal} />}
            {step === 1 && (
              <StatsStep
                sex={sex}
                setSex={setSex}
                height={height}
                setHeight={setHeight}
                weight={weight}
                setWeight={setWeight}
                age={age}
                setAge={setAge}
              />
            )}
            {step === 2 && <DietStep value={diet} onChange={setDiet} />}
            {step === 3 && <ActivityStep value={activity} onChange={setActivity} />}
          </motion.div>
        </AnimatePresence>

        <PrimaryButton onClick={next} style={{ marginTop: 16 }}>
          {ctas[step]}
        </PrimaryButton>
      </div>
    </Background>
  );
}
