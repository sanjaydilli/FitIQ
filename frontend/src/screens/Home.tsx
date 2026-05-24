import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card, Pill } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { WaterTimeline } from '../components/WaterTimeline';
import { Reveal, Shimmer } from '../components/Reveal';
import { WarningCard } from '../components/warnings/WarningCard';
import { Icon } from '../components/Icon';
import { useWarnings } from '../hooks/useWarnings';
import { useBodyComp } from '../hooks/useBodyComp';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { useFoodLog } from '../hooks/useFoodLog';
import { bodyFatCategory, goalCalorieAdjust } from '../utils/bodyComposition';
import { WATER_SLOT_CAPACITY, WATER_DROP_ML } from '../context/UserContext';

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export function Home() {
  const { theme } = useTheme();
  const { user, update } = useUser();
  const navigate = useNavigate();
  const today = DATE_FMT.format(new Date()).toUpperCase();

  const { activeWarning, dismissWarning, snoozeActiveWarning, actOnWarning } = useWarnings();
  const { latest: bodyCompLatest, trend: bodyCompTrend, tdee } = useBodyComp();
  const { sessions } = useWorkoutLog();
  const { todayTotals, activeDays } = useFoodLog();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaySession = sessions.find(s => s.date === todayISO) ?? null;

  // Compute real streak from actual food/workout activity and sync to user.streak
  const computedStreak = useMemo(() => {
    const now = new Date();
    const todayDS = now.toISOString().slice(0, 10);
    const todayActive = activeDays.has(todayDS) || sessions.some(s => s.date === todayDS);
    let count = 0;
    for (let i = todayActive ? 0 : 1; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      if (activeDays.has(ds) || sessions.some(s => s.date === ds)) count++;
      else break;
    }
    return count;
  }, [activeDays, sessions]);

  const lastSyncedStreak = useRef(user.streak);
  useEffect(() => {
    if (computedStreak !== lastSyncedStreak.current) {
      lastSyncedStreak.current = computedStreak;
      update({ streak: computedStreak });
    }
  }, [computedStreak, update]);
  const bfCat = bodyCompLatest ? bodyFatCategory(user.sex, bodyCompLatest.bodyFatPct) : null;
  const calTarget = (tdee || Math.round(user.weightKg * 30)) + goalCalorieAdjust(user.goal);
  const proteinTarget = Math.round(user.weightKg * 2);

  const metrics = useMemo(() => [
    {
      l: 'Calories', iconName: 'flame' as const, col: '#FB923C',
      v: todayTotals.calories > 0 ? todayTotals.calories.toLocaleString() : '—',
      max: `/${calTarget.toLocaleString()}`,
      pct: calTarget > 0 ? Math.min(100, Math.round((todayTotals.calories / calTarget) * 100)) : 0,
    },
    {
      l: 'Protein', iconName: 'utensils' as const, col: theme.accent,
      v: todayTotals.protein > 0 ? `${todayTotals.protein}g` : '—',
      max: `/${proteinTarget}g`,
      pct: proteinTarget > 0 ? Math.min(100, Math.round((todayTotals.protein / proteinTarget) * 100)) : 0,
    },
    {
      l: 'Steps', iconName: 'run' as const, col: theme.accent2,
      v: user.steps > 0 ? user.steps.toLocaleString() : '—',
      max: `/${user.stepGoal.toLocaleString()}`,
      pct: user.stepGoal > 0 ? Math.min(100, Math.round((user.steps / user.stepGoal) * 100)) : 0,
    },
  ], [theme.accent, theme.accent2, todayTotals, calTarget, proteinTarget, user.steps, user.stepGoal]);

  const totalWaterCups = WATER_SLOT_CAPACITY.reduce((a, b) => a + b, 0);
  const filledWaterCups = user.waterDrops.reduce((a, b) => a + b, 0);
  const totalWaterL = (totalWaterCups * WATER_DROP_ML) / 1000;
  const waterDone = filledWaterCups >= totalWaterCups;
  const workoutDone = sessions.some(s => s.date === todayISO);
  const caloriesOnTarget = todayTotals.calories > 0 &&
    Math.abs(todayTotals.calories - calTarget) / calTarget < 0.15;

  const healthScore = useMemo(() => {
    let score = 0;
    const waterPct = totalWaterCups > 0 ? filledWaterCups / totalWaterCups : 0;
    score += Math.round(waterPct * 25);
    if (todayTotals.calories > 0) {
      const adh = 1 - Math.abs(todayTotals.calories - calTarget) / calTarget;
      score += Math.round(Math.max(0, Math.min(1, adh)) * 25);
    }
    if (workoutDone) score += 20;
    score += Math.min(15, user.streak);
    if (bfCat) {
      const s: Record<string, number> = { Athletic: 15, Fitness: 12, Average: 8, 'Above Average': 4 };
      score += s[bfCat.label] ?? 0;
    }
    return Math.min(100, score);
  }, [filledWaterCups, totalWaterCups, todayTotals.calories, calTarget, workoutDone, user.streak, bfCat]);

  const quests = useMemo(() => [
    { t: `Hit ${totalWaterL}L water`, xp: 60, done: waterDone },
    { t: 'Log calories on target', xp: 80, done: caloriesOnTarget },
    { t: 'Complete a workout', xp: 120, done: workoutDone },
  ], [waterDone, caloriesOnTarget, workoutDone, totalWaterL]);

  const [verifyBanner, setVerifyBanner] = useState(() => {
    const email = sessionStorage.getItem('fitiq.pendingVerifyEmail');
    if (email) { sessionStorage.removeItem('fitiq.pendingVerifyEmail'); }
    return email;
  });
  useEffect(() => {
    if (!verifyBanner) return;
    const t = setTimeout(() => setVerifyBanner(null), 8000);
    return () => clearTimeout(t);
  }, [verifyBanner]);

  return (
    <Background>
      <div
        className="scroll-y"
        style={{ padding: '60px 0 110px', height: '100%', overflowY: 'auto' }}
      >
        {/* Email verification banner — shown once after signup */}
        <AnimatePresence>
          {verifyBanner && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                margin: '0 16px 12px',
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.3)',
                fontSize: 12, color: '#4ade80', lineHeight: 1.5,
              }}
            >
              ✉️ Verification email sent to <strong>{verifyBanner}</strong> — check your inbox.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div
          style={{
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1 }}>
              {today}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Hey, {user.name}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Card style={{ width: 'auto', height: 38, borderRadius: 12, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'inline-flex' }}
              >
                <Icon name="flame" size={14} color="#FB923C" />
              </motion.div>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: theme.mono }}>{user.streak}</span>
            </Card>
            <Card style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.6L4 17h5" />
                <path d="M9 17a3 3 0 006 0" />
              </svg>
            </Card>
          </div>
        </div>

        {/* Hero */}
        <Reveal index={0}>
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <Card style={{ padding: 20, borderRadius: 26, position: 'relative', overflow: 'hidden' }}>
            <Shimmer color={`${theme.accent2}30`} duration={3.2} delay={0.6} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 30% 50%, ${theme.accent2}30, transparent 60%)`,
              }}
            />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.div
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/profile')}
                style={{
                  flexShrink: 0, cursor: 'pointer',
                  width: 72, height: 72, borderRadius: 36,
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 800, color: theme.onAccent,
                  boxShadow: `0 4px 20px ${theme.accent}50`,
                }}
              >
                {(user.name?.[0] ?? '?').toUpperCase()}
              </motion.div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: theme.textMute,
                    fontFamily: theme.mono,
                    letterSpacing: 1.2,
                    marginBottom: 4,
                  }}
                >
                  HEALTH SCORE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <div
                    style={{
                      fontSize: 56,
                      fontWeight: 800,
                      letterSpacing: -2,
                      lineHeight: 1,
                      fontFeatureSettings: '"tnum"',
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {healthScore}
                  </div>
                  <div style={{ color: theme.textDim, fontSize: 14 }}>/100</div>
                </div>
                <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 8 }}>
                  {healthScore >= 80 ? 'Looking great today 🔥' : healthScore >= 50 ? 'Keep going, almost there' : 'Log food & water to boost'}
                </div>
                <Pill>LVL {user.level}{bfCat ? ` · ${bfCat.label.toUpperCase()}` : ''}</Pill>
              </div>
            </div>
          </Card>
        </div>
        </Reveal>

        {/* Water timeline */}
        <Reveal index={1}>
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <WaterTimeline />
        </div>
        </Reveal>

        {/* Steps card */}
        <Reveal index={2}>
        <StepsCard />
        </Reveal>

        {/* Metric grid */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.18 + i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -2 }}
              >
                <Card style={{ padding: '12px 14px', borderRadius: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: theme.textDim,
                        fontFamily: theme.mono,
                        letterSpacing: 1,
                      }}
                    >
                      {m.l.toUpperCase()}
                    </div>
                    <Icon name={m.iconName} size={16} color={m.col} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: -0.5,
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      {m.v}
                    </span>
                    <span style={{ color: theme.textMute, fontSize: 11 }}>{m.max}</span>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      height: 3,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                      style={{ height: '100%', background: m.col, borderRadius: 2 }}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Smart warning system */}
        <AnimatePresence mode="wait">
          {activeWarning && (
            <motion.div
              key={activeWarning.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
              style={{ padding: '0 20px', marginBottom: 14 }}
            >
              <WarningCard
                warning={activeWarning}
                onAct={actOnWarning}
                onSnooze={snoozeActiveWarning}
                onDismiss={dismissWarning}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ask AI Coach */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <motion.div
            whileTap={{ scale: 0.97, rotateX: 4 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate('/coach')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 18,
              background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent2}12)`,
              border: `1px solid ${theme.accent}30`,
              cursor: 'pointer',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${theme.accent}30, ${theme.accent2}20)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="brain" size={20} color={theme.accent} />
            </motion.div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Ask AI Coach</div>
              <div style={{ fontSize: 11, color: theme.textDim }}>
                Powered by Llama 3.1 · Indian nutrition expert
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round">
              <path d="M4.5 2.5L8 6l-3.5 3.5" />
            </svg>
          </motion.div>
        </div>

        {/* Today's Routine */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <motion.div
            whileTap={{ scale: 0.97, rotateX: 4 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate('/routine')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 18,
              background: theme.card, border: `1px solid ${theme.cardBorder}`,
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Gradient accent bar */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
              background: `linear-gradient(to bottom, #FBBF24, ${theme.accent})`,
              borderRadius: '2px 0 0 2px',
            }} />
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(251,191,36,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="calendar" size={20} color="#FBBF24" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Today's Routine</div>
              <div style={{ fontSize: 11, color: theme.textDim }}>Schedule · track · earn XP</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke={theme.textMute} strokeWidth="2" strokeLinecap="round">
              <path d="M4.5 2.5L8 6l-3.5 3.5" />
            </svg>
          </motion.div>
        </div>

        {/* Meal Planner + Activity + Wrapped quick links */}
        <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 10 }}>
          {[
            { iconName: 'utensils' as const, label: 'Meal Plan', sub: 'AI-powered', path: '/meal-plan', color: '#FB923C' },
            { iconName: 'leaf' as const,    label: 'Recipes',   sub: '3235 dishes', path: '/recipes',  color: '#4ade80' },
            { iconName: 'calendar' as const, label: 'Activity', sub: 'Calendar', path: '/activity', color: theme.accent2 },
            { iconName: 'trophy' as const, label: 'Wrapped', sub: 'This week', path: '/wrapped', color: '#FBBF24' },
          ].map(({ iconName, label, sub, path, color }) => (
            <motion.div
              key={path}
              whileTap={{ scale: 0.93 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate(path)}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              <Card style={{ padding: '12px 10px', borderRadius: 18, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                  <Icon name={iconName} size={22} color={color} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
                <div style={{ fontSize: 9, color: theme.textMute }}>{sub}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Daily Quests */}
        <Reveal index={5}>
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>Daily Quests</div>
            <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono }}>
              +{quests.filter(q => q.done).reduce((s, q) => s + q.xp, 0)} XP TODAY
            </div>
          </div>
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {quests.map((q, i, a) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42 + i * 0.06 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderBottom: i < a.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    flexShrink: 0,
                    background: q.done ? theme.accent : 'transparent',
                    border: q.done ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {q.done && (
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
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: q.done ? theme.textMute : theme.text,
                    textDecoration: q.done ? 'line-through' : 'none',
                  }}
                >
                  {q.t}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: theme.mono,
                    color: q.done ? theme.textMute : theme.accent,
                    fontWeight: 700,
                  }}
                >
                  +{q.xp} XP
                </div>
              </motion.div>
            ))}
          </Card>
        </div>
        </Reveal>

        {/* Calorie deficit / surplus banner */}
        {todayTotals.calories > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '0 20px', marginBottom: 14 }}
          >
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/food-log')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 16, cursor: 'pointer',
                background: calTarget - todayTotals.calories >= 0
                  ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                border: `1px solid ${calTarget - todayTotals.calories >= 0
                  ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
              }}
            >
              <Icon name={calTarget - todayTotals.calories >= 0 ? 'check' : 'target'} size={20} color={calTarget - todayTotals.calories >= 0 ? '#4ade80' : '#F87171'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {Math.abs(calTarget - todayTotals.calories)} kcal {calTarget - todayTotals.calories >= 0 ? 'remaining' : 'over target'}
                </div>
                <div style={{ fontSize: 11, color: theme.textDim }}>
                  {todayTotals.calories} eaten · {calTarget} target
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke={theme.textMute} strokeWidth="2" strokeLinecap="round">
                <path d="M4.5 2.5L8 6l-3.5 3.5" />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Body Comp + Strength quick cards */}
        {(bodyCompLatest || sessions.length > 0) && (
          <div style={{ padding: '0 20px', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: bodyCompLatest && sessions.length > 0 ? '1fr 1fr' : '1fr', gap: 10 }}>
              {bodyCompLatest && bfCat && (
                <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }} onClick={() => navigate('/body-comp')} style={{ cursor: 'pointer' }}>
                  <Card style={{ padding: '12px 14px', borderRadius: 18, borderLeft: `3px solid ${bfCat.color}` }}>
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginBottom: 4 }}>BODY FAT</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: bfCat.color, letterSpacing: -0.5 }}>{bodyCompLatest.bodyFatPct}%</div>
                    <div style={{ fontSize: 10, color: bfCat.color, fontFamily: theme.mono }}>{bfCat.label}</div>
                    {bodyCompTrend && (
                      <div style={{ fontSize: 10, color: theme.textMute, marginTop: 4 }}>
                        {bodyCompTrend.fatPctDelta > 0 ? '↑' : bodyCompTrend.fatPctDelta < 0 ? '↓' : '→'} {Math.abs(bodyCompTrend.fatPctDelta)}% trend
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
              {sessions.length > 0 && (
                <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }} onClick={() => navigate('/workout/history')} style={{ cursor: 'pointer' }}>
                  <Card style={{ padding: '12px 14px', borderRadius: 18, borderLeft: `3px solid ${theme.accent}` }}>
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginBottom: 4 }}>WORKOUTS</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: theme.accent, letterSpacing: -0.5 }}>{sessions.length}</div>
                    <div style={{ fontSize: 10, color: theme.textDim, fontFamily: theme.mono }}>sessions logged</div>
                    <div style={{ fontSize: 10, color: theme.textMute, marginTop: 4 }}>View history →</div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Today's workout */}
        <Reveal index={6}>
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Today's Workout</div>
          {todaySession ? (
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} onClick={() => navigate('/workout/history')}>
              <Card style={{ padding: 14, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
                <Shimmer color="rgba(74,222,128,0.25)" duration={2.6} delay={0.8} />
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={26} color="#4ade80" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{todaySession.name}</div>
                  <div style={{ fontSize: 11, color: theme.textDim }}>
                    {todaySession.exercises.length} exercises · {todaySession.totalVolume.toLocaleString()} kg volume
                  </div>
                </div>
                <div style={{ fontSize: 11, fontFamily: theme.mono, fontWeight: 700, color: '#4ade80' }}>DONE ✓</div>
              </Card>
            </motion.div>
          ) : (
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} onClick={() => navigate('/workout')}>
              <Card style={{ padding: 14, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
                <Shimmer color={`${theme.accent}40`} duration={2.6} delay={0.8} />
                <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent2}40, ${theme.accent}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="dumbbell" size={26} color={theme.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Start Today's Workout</div>
                  <div style={{ fontSize: 11, color: theme.textDim }}>Push · Pull · Legs · Full Body</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 12 12" fill={theme.onAccent}><path d="M3 1.5l7 4.5-7 4.5z" /></svg>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
        </Reveal>
      </div>
      <TabBar />
    </Background>
  );
}

function StepsCard() {
  const { theme } = useTheme();
  const { user } = useUser();
  const isNative = Capacitor.isNativePlatform();

  const pct = Math.min(100, Math.round((user.steps / user.stepGoal) * 100));
  const done = user.steps >= user.stepGoal;
  const remaining = Math.max(0, user.stepGoal - user.steps);

  return (
    <div style={{ padding: '0 20px', marginBottom: 14 }}>
      <Card style={{ padding: '16px', borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: done ? 'rgba(74,222,128,0.15)' : `${theme.accent}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="run" size={18} color={done ? '#4ade80' : theme.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Steps Today</div>
            <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
              {isNative ? 'AUTO-TRACKING · UPDATES LIVE' : 'OPEN ON ANDROID TO AUTO-TRACK'}
            </div>
          </div>
          <div style={{ fontSize: 10, color: done ? '#4ade80' : theme.textMute, fontFamily: theme.mono, fontWeight: 700 }}>
            {done ? '✓ GOAL HIT' : `${pct}%`}
          </div>
        </div>

        {/* Big step count */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
          <div style={{
            fontSize: 40, fontWeight: 900, letterSpacing: -2, lineHeight: 1,
            color: done ? '#4ade80' : theme.text,
          }}>
            {user.steps.toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: theme.textMute }}>
            / {user.stepGoal.toLocaleString()} steps
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 8 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 5,
              background: done
                ? 'linear-gradient(90deg, #4ade80, #22d3ee)'
                : `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
            }}
          />
        </div>

        <div style={{ fontSize: 11, color: theme.textMute }}>
          {done ? 'Amazing! Goal reached today 🎉' : `${remaining.toLocaleString()} more steps to reach your goal`}
        </div>
      </Card>
    </div>
  );
}
