import React, { useMemo, useCallback, useState } from 'react';
import { formatLocalDate } from '../utils/date';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { useFoodLog } from '../hooks/useFoodLog';
import { useBodyComp } from '../hooks/useBodyComp';
import { bodyFatCategory } from '../utils/bodyComposition';

function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(formatLocalDate(d));
  }
  return dates;
}

export function WeeklyWrapped() {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const { sessions, personalRecords } = useWorkoutLog();
  const { getDailyTotals } = useFoodLog();
  const { measurements } = useBodyComp();

  const weekDates = useMemo(getWeekDates, []);

  const weekSessions = useMemo(() =>
    sessions.filter(s => weekDates.includes(s.date)),
    [sessions, weekDates]
  );

  const totalVolume = useMemo(() =>
    weekSessions.reduce((s, sess) => s + sess.totalVolume, 0),
    [weekSessions]
  );

  // Calorie on-target days (within 10% of TDEE)
  const { onTargetDays } = useMemo(() => {
    let onTarget = 0;
    let total = 0;
    weekDates.forEach(date => {
      const t = getDailyTotals(date);
      if (t.calories > 0) {
        total += t.calories;
        if (Math.abs(t.calories - user.weightKg * 30) / (user.weightKg * 30) < 0.15) onTarget++;
      }
    });
    return { onTargetDays: onTarget, totalCalories: total };
  }, [weekDates, getDailyTotals, user.weightKg]);

  // New PRs this week
  const weekPRs = useMemo(() => {
    const prs: { exercise: string; weight: number; reps: number }[] = [];
    weekSessions.forEach(sess => {
      sess.exercises.forEach(ex => {
        const pr = personalRecords[ex.exerciseId];
        if (pr && pr.date && weekDates.includes(pr.date)) {
          prs.push({ exercise: ex.exerciseName, weight: pr.weight, reps: pr.reps });
        }
      });
    });
    return prs;
  }, [weekSessions, personalRecords, weekDates]);

  const weekMeasurement = measurements.find(m => weekDates.includes(m.date));
  const bfCat = weekMeasurement ? bodyFatCategory(user.sex, weekMeasurement.bodyFatPct) : null;

  const score = Math.min(100, Math.round(
    weekSessions.length * 15 +
    onTargetDays * 8 +
    weekPRs.length * 10 +
    (weekMeasurement ? 12 : 0)
  ));

  const scoreLabel = score >= 80 ? 'Excellent' : score >= 55 ? 'Good' : score >= 30 ? 'Getting there' : 'Keep going';
  const scoreColor = score >= 80 ? '#16A34A' : score >= 55 ? theme.accent : score >= 30 ? '#D97706' : '#DC2626';

  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const prLine = weekPRs.length > 0
      ? `\n🏆 ${weekPRs.length} new PR${weekPRs.length > 1 ? 's' : ''} (${weekPRs[0].exercise})`
      : '';
    const text =
      `💪 My FitIQ Week — ${weekDates[0].slice(5)} to ${weekDates[6].slice(5)}\n` +
      `\nScore: ${score}/100 — ${scoreLabel}` +
      `\n🏋️ ${weekSessions.length} workout${weekSessions.length !== 1 ? 's' : ''} completed` +
      `\n🎯 ${onTargetDays} days on calorie target` +
      prLine +
      `\n\nTracked with FitIQ — AI fitness for Indian gym-goers`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'My FitIQ Week', text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [score, scoreLabel, weekSessions.length, onTargetDays, weekPRs, weekDates]);

  // Day-by-day mini heatmap
  const dayActivity = useMemo(() => weekDates.map(date => {
    const hasWorkout = weekSessions.some(s => s.date === date);
    const hasFood = getDailyTotals(date).calories > 0;
    return { date, hasWorkout, hasFood };
  }), [weekDates, weekSessions, getDailyTotals]);

  return (
    <Background>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '14px 20px',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.cardBorder}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Weekly Wrapped</div>
        <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.6 }}>
          {weekDates[0].slice(5)} – {weekDates[6].slice(5)}
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleShare}
          style={{
            marginLeft: 'auto',
            padding: '6px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: copied ? 'rgba(22,163,74,0.15)' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: copied ? '#16A34A' : theme.onAccent,
            fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {copied ? (
            <><Icon name="check" size={13} color="#16A34A" /> Copied!</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> Share</>
          )}
        </motion.button>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        {/* Hero score card */}
        <div style={{ padding: '20px 20px 12px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' as const, stiffness: 200 }}
          >
            <Card style={{ borderRadius: 24, padding: '28px 22px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at 50% 15%, ${scoreColor}26, transparent 65%)`,
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.8, marginBottom: 10, textTransform: 'uppercase' }}>Week Score</div>
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.18, type: 'spring' as const, stiffness: 160, damping: 14 }}
                  style={{
                    fontSize: 92, fontWeight: 900, letterSpacing: -5,
                    color: scoreColor,
                    lineHeight: 1,
                    fontFamily: theme.mono,
                    filter: `drop-shadow(0 0 28px ${scoreColor}70)`,
                  }}
                >
                  {score}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  style={{ fontSize: 18, fontWeight: 700, color: scoreColor, marginTop: 6, letterSpacing: -0.2 }}
                >
                  {scoreLabel}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  style={{ fontSize: 12, color: theme.textDim, marginTop: 8 }}
                >
                  Hey {user.name}, here's your week at a glance
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Day heatmap strip */}
        <div style={{ padding: '0 20px 12px' }}>
          <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, marginBottom: 12, letterSpacing: 1.6, textTransform: 'uppercase' }}>This Week</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {dayActivity.map(({ date, hasWorkout, hasFood }, i) => {
                const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
                const both = hasWorkout && hasFood;
                const any = hasWorkout || hasFood;
                return (
                  <div key={date} style={{ flex: 1, textAlign: 'center' }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: 8,
                        background: both ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : any ? `${theme.accent}50` : 'rgba(15,23,42,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 4, fontSize: 12,
                      }}
                    >
                      {hasWorkout ? '💪' : hasFood ? '🍽' : ''}
                    </motion.div>
                    <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.8, textTransform: 'uppercase' }}>{dayName}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Stats grid */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { iconName: 'dumbbell' as const, label: 'Workouts', value: weekSessions.length, sub: `${weekSessions.length}/7 days`, color: theme.accent },
              { iconName: 'flame' as const, label: 'Volume', value: `${(totalVolume / 1000).toFixed(1)}t`, sub: 'total lifted', color: '#EA580C' },
              { iconName: 'target' as const, label: 'On Target', value: `${onTargetDays}d`, sub: 'calorie goal hit', color: '#16A34A' },
              { iconName: 'trophy' as const, label: 'New PRs', value: weekPRs.length, sub: weekPRs.length > 0 ? weekPRs[0].exercise.split(' ')[0] : 'none this week', color: '#D97706' },
            ].map(({ iconName, label, value, sub, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, type: 'spring' as const, stiffness: 260, damping: 24 }}
              >
                <Card style={{ padding: '14px 14px', borderRadius: 18 }}>
                  <div style={{ marginBottom: 10, width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={iconName} size={18} color={color} />
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800, color, letterSpacing: -1.2, fontFamily: theme.mono, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, letterSpacing: -0.1 }}>{label}</div>
                  <div style={{ fontSize: 10, color: theme.textMute, marginTop: 1 }}>{sub}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* PR list */}
        {weekPRs.length > 0 && (
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, fontWeight: 700, marginBottom: 8, padding: '0 2px', letterSpacing: 1.6, textTransform: 'uppercase' }}>Personal Records</div>
            <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
              {weekPRs.map((pr, i, arr) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  style={{
                    padding: '12px 14px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <span style={{ fontSize: 18 }}>🥇</span>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{pr.exercise}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#D97706', fontFamily: theme.mono, letterSpacing: 0.2 }}>
                    {pr.weight}kg × {pr.reps}
                  </div>
                </motion.div>
              ))}
            </Card>
          </div>
        )}

        {/* Body comp this week */}
        {weekMeasurement && bfCat && (
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, fontWeight: 700, marginBottom: 8, padding: '0 2px', letterSpacing: 1.6, textTransform: 'uppercase' }}>Body Check-In</div>
            <Card style={{ borderRadius: 18, padding: '16px 18px', borderLeft: `3px solid ${bfCat.color}` }}>
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.8 }}>BODY FAT</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: bfCat.color, fontFamily: theme.mono, letterSpacing: -0.8, marginTop: 2 }}>{weekMeasurement.bodyFatPct}%</div>
                  <div style={{ fontSize: 10, color: bfCat.color, fontWeight: 600 }}>{bfCat.label}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.8 }}>LEAN MASS</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0E9384', fontFamily: theme.mono, letterSpacing: -0.8, marginTop: 2 }}>{weekMeasurement.leanMass}<span style={{ fontSize: 14 }}>kg</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.8 }}>WEIGHT</div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: theme.mono, letterSpacing: -0.8, marginTop: 2 }}>{weekMeasurement.weightKg}<span style={{ fontSize: 14 }}>kg</span></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Motivational footer */}
        <div style={{ padding: '0 20px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              padding: '14px 16px', borderRadius: 18,
              background: `linear-gradient(135deg, ${theme.accent}12, ${theme.accent2}08)`,
              border: `1px solid ${theme.accent}20`,
              fontSize: 13, color: theme.textDim, lineHeight: 1.6, textAlign: 'center',
            }}
          >
            {weekSessions.length >= 4
              ? `🔥 ${weekSessions.length} workouts this week. You're in the top 10% of consistency.`
              : weekSessions.length >= 2
              ? `💪 ${weekSessions.length} workouts done. Aim for 3–4 next week for optimal adaptation.`
              : `🌱 Every journey starts somewhere. One workout is better than zero — keep showing up.`}
          </motion.div>
        </div>
      </div>
    </Background>
  );
}
