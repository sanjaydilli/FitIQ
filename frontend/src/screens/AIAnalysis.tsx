import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { RingMeter } from '../components/RingMeter';

export function AIAnalysis() {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  const tdee = Math.round(
    (user.sex === 'male'
      ? 88.36 + 13.4 * user.weightKg + 4.8 * user.heightCm - 5.7 * user.age
      : 447.6 + 9.2 * user.weightKg + 3.1 * user.heightCm - 4.3 * user.age) *
      { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }[user.activity]
  );
  const protein = Math.round(user.weightKg * 1.9);

  const SPLIT_LABEL: Record<string, string> = {
    lose: 'Upper/Lower · 4 days/wk',
    gain: 'PPL split · 6 days/wk',
    endur: 'Full Body + cardio · 5 days/wk',
    main: 'Full Body · 3 days/wk',
  };
  const DIET_LABEL: Record<string, string> = {
    veg: 'vegetarian', eggetarian: 'eggetarian', nveg: 'non-veg', vegan: 'vegan', jain: 'jain',
  };

  const steps = [
    { t: 'Analyzing body composition', d: `${user.heightCm}cm · ${user.weightKg.toFixed(1)}kg · age ${user.age}` },
    { t: 'Calculating BMR & macros', d: `${tdee.toLocaleString()} kcal · ${protein}g protein` },
    { t: 'Matching your training split', d: SPLIT_LABEL[user.goal] ?? 'Custom split' },
    { t: 'Curating Indian meal database', d: `Filtered for ${DIET_LABEL[user.diet] ?? user.diet} · goal-matched` },
    { t: 'Personalizing daily quests', d: 'XP, streaks, social loops' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/tour'), 500);
          return 100;
        }
        return p + 2;
      });
    }, 90);
    return () => clearInterval(interval);
  }, [navigate]);

  const activeStep = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

  return (
    <Background>
      <div
        style={{
          padding: '70px 28px 30px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: theme.accent,
            fontFamily: theme.mono,
            letterSpacing: 2,
            marginBottom: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Neural Engine
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: -0.6,
            lineHeight: 1.15,
            marginBottom: 8,
          }}
        >
          Building your<br />
          personalized plan
        </div>
        <div style={{ color: theme.textMute, fontSize: 13, marginBottom: 30, fontFamily: theme.mono, letterSpacing: 0.3 }}>
          This usually takes 8 seconds.
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <RingMeter
            value={progress}
            max={100}
            size={160}
            stroke={6}
            gradient={[theme.accent2, theme.accent]}
            track="rgba(15,23,42,0.05)"
            label={
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  fontFamily: theme.mono,
                  fontFeatureSettings: '"tnum"',
                  letterSpacing: -1.5,
                }}
              >
                {progress}
                <span style={{ fontSize: 16, color: theme.textDim }}>%</span>
              </div>
            }
            sublabel={
              <div
                style={{
                  fontSize: 10,
                  color: theme.textMute,
                  fontFamily: theme.mono,
                  letterSpacing: 1.8,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Processing
              </div>
            }
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s, i) => {
            const done = i < activeStep;
            const active = i === activeStep && progress < 100;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: active ? `${theme.accent}10` : 'transparent',
                  border: active ? `1px solid ${theme.accent}30` : '1px solid transparent',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    flexShrink: 0,
                    background: done ? theme.accent : active ? 'transparent' : 'rgba(15,23,42,0.06)',
                    border: active ? `2px solid ${theme.accent}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {done && (
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
                  {active && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        background: theme.accent,
                        animation: 'fitiq-pulse 1s infinite',
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: done ? theme.textDim : theme.text,
                    }}
                  >
                    {s.t}
                  </div>
                  {(done || active) && s.d && (
                    <div
                      style={{
                        fontSize: 11,
                        color: theme.textMute,
                        fontFamily: theme.mono,
                        marginTop: 2,
                      }}
                    >
                      {s.d}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Background>
  );
}
