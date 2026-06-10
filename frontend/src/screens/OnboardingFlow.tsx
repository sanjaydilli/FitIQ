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
            height: 4,
            borderRadius: 2,
            background: 'rgba(15,23,42,0.08)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={false}
            animate={{ width: i < step ? '100%' : '0%' }}
            transition={{ duration: 0.45, ease: [0.22, 0.8, 0.22, 1] }}
            style={{
              height: '100%',
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
              boxShadow: i < step ? `0 0 8px ${theme.accent}60` : 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function StepHeader({
  step,
  total,
  title,
  subtitle,
  onBack,
}: {
  step: number;
  total: number;
  title: React.ReactNode;
  subtitle?: string;
  onBack?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: theme.textMute,
            fontFamily: theme.mono,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          STEP {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        {onBack && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onBack}
            style={{
              background: 'rgba(15,23,42,0.05)',
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 999,
              padding: '4px 12px',
              color: theme.textDim,
              fontSize: 11,
              fontFamily: theme.mono,
              letterSpacing: 1.2,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← BACK
          </motion.button>
        )}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: -0.5,
          lineHeight: 1.15,
          marginBottom: 8,
          color: theme.text,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ color: theme.textDim, fontSize: 14, marginBottom: 24, lineHeight: 1.45 }}>{subtitle}</div>
      )}
    </>
  );
}

function GoalStep({ value, onChange }: { value: Goal; onChange: (g: Goal) => void }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      {GOALS.map((g, i) => {
        const sel = g.id === value;
        return (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileTap={{ scale: 0.97 }}
          >
            <Card selected={sel} onClick={() => onChange(g.id)} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: sel
                    ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
                    : 'rgba(15,23,42,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  boxShadow: sel ? `0 4px 14px ${theme.accent}30` : 'none',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {g.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, color: theme.text }}>{g.t}</div>
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
        border: sel ? `2px solid ${theme.accent}` : '1.5px solid rgba(15,23,42,0.2)',
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
        <span style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.8, fontWeight: 700 }}>
          {label}
        </span>
        <span style={{ fontFamily: theme.mono, fontSize: 11, color: theme.textMute, letterSpacing: 1 }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
        <span
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: -1,
            fontFeatureSettings: '"tnum"',
            fontFamily: theme.mono,
            color: theme.text,
          }}
        >
          {display ?? value}
        </span>
        <span style={{ color: theme.textDim, fontSize: 14, fontFamily: theme.mono }}>{unit}</span>
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
      <div style={{ position: 'relative', height: 4, marginTop: -16, background: 'rgba(15,23,42,0.08)', borderRadius: 2, pointerEvents: 'none' }}>
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
  name,
  setName,
  sex,
  setSex,
  height,
  setHeight,
  weight,
  setWeight,
  age,
  setAge,
}: {
  name: string;
  setName: (s: string) => void;
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
  const [nameFocused, setNameFocused] = useState(false);
  return (
    <>
      <div
        style={{
          padding: '12px 16px',
          marginBottom: 16,
          background: nameFocused ? 'rgba(15,23,42,0.07)' : theme.card,
          border: `1px solid ${nameFocused ? theme.accent + '50' : theme.cardBorder}`,
          borderRadius: theme.radius,
          boxShadow: nameFocused
            ? `0 0 0 3px ${theme.accent}18, inset 0 1px 0 rgba(15,23,42,0.04)`
            : 'inset 0 1px 0 rgba(15,23,42,0.04)',
          transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
        }}
      >
        <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.8, fontWeight: 700, marginBottom: 6 }}>YOUR NAME</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
          placeholder="e.g. Arjun"
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            fontSize: 18, fontWeight: 700, color: theme.text, fontFamily: theme.font,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {(['male', 'female'] as Sex[]).map((s) => {
          const sel = s === sex;
          return (
            <motion.div key={s} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
              <Card
                selected={sel}
                onClick={() => setSex(s)}
                style={{ padding: '14px', textAlign: 'center', fontSize: 14, fontWeight: 700, textTransform: 'capitalize', color: sel ? theme.text : theme.textDim }}
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
                fontSize: 11,
                color: theme.textMute,
                fontFamily: theme.mono,
                letterSpacing: 1.8,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              AGE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, fontFeatureSettings: '"tnum"', fontFamily: theme.mono, color: theme.text, letterSpacing: -0.5 }}>{age}</span>
              <span style={{ fontSize: 13, color: theme.textDim, fontFamily: theme.mono }}>yrs</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['−', '+'].map((s, i) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.92 }}
                onClick={() => setAge(Math.max(15, Math.min(80, age + (i === 0 ? -1 : 1))))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(15,23,42,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: theme.text,
                  border: `1px solid ${theme.cardBorder}`,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {s}
              </motion.button>
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
      {DIETS.map((d, i) => {
        const sel = d.id === value;
        return (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileTap={{ scale: 0.97 }}
          >
            <Card selected={sel} onClick={() => onChange(d.id)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: sel
                    ? `linear-gradient(135deg, ${theme.accent}22, ${theme.accent2}18)`
                    : 'rgba(15,23,42,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {d.ic}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{d.t}</div>
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
      {ACTIVITIES.map((a, i) => {
        const sel = a.id === value;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileTap={{ scale: 0.97 }}
          >
            <Card selected={sel} onClick={() => onChange(a.id)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: sel
                    ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
                    : 'rgba(15,23,42,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  boxShadow: sel ? `0 4px 14px ${theme.accent}30` : 'none',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{a.t}</div>
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
  const [name, setName] = useState(user.name);
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
      update({ name: name.trim() || 'You', goal, sex, heightCm: height, weightKg: weight, age, diet, activity, streak: 0, xp: 0, level: 1 });
      navigate('/analysis');
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
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
        <StepHeader
          step={step + 1}
          total={total}
          title={titles[step]}
          subtitle={subtitles[step]}
          onBack={step > 0 ? back : undefined}
        />

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
                name={name}
                setName={setName}
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
