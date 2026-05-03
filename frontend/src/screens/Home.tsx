import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card, Pill } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { BitmojiAvatar } from '../components/BitmojiAvatar';
import { WaterTimeline } from '../components/WaterTimeline';
import { Reveal, Shimmer } from '../components/Reveal';
import { WarningCard } from '../components/warnings/WarningCard';
import { useWarnings } from '../hooks/useWarnings';

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export function Home() {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const today = DATE_FMT.format(new Date()).toUpperCase();

  const { activeWarning, dismissWarning, snoozeActiveWarning, actOnWarning } = useWarnings();

  const metrics = [
    { l: 'Calories', v: '1,847', max: '/2,340', col: '#FB923C', pct: 78, icon: '🔥' },
    { l: 'Protein', v: '102g', max: '/142g', col: theme.accent, pct: 72, icon: '🥩' },
    { l: 'Steps', v: '7,420', max: '/10k', col: theme.accent2, pct: 74, icon: '👣' },
  ];

  const quests = [
    { t: 'Hit 3.5L water', xp: 60, done: false },
    { t: '10k steps', xp: 80, done: true },
    { t: 'Complete Push Day workout', xp: 120, done: true },
  ];

  return (
    <Background>
      <div
        className="scroll-y"
        style={{ padding: '60px 0 110px', height: '100%', overflowY: 'auto' }}
      >
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
              <motion.span
                animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 14, display: 'inline-block' }}
              >
                🔥
              </motion.span>
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
                onClick={() => navigate('/avatar')}
                style={{ flexShrink: 0, cursor: 'pointer' }}
              >
                <BitmojiAvatar
                  config={user.avatar}
                  size={120}
                  level={user.level}
                  showBackground={false}
                />
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
                    78
                  </div>
                  <div style={{ color: theme.textDim, fontSize: 14 }}>/100</div>
                </div>
                <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 8 }}>
                  Up 4 from yesterday ↗
                </div>
                <Pill>LVL {user.level} · LEAN</Pill>
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
                    <div style={{ fontSize: 14 }}>{m.icon}</div>
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
              +240 XP TODAY
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

        {/* Today's workout */}
        <Reveal index={6}>
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Today's Workout</div>
          <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} onClick={() => navigate('/workout')}>
            <Card style={{ padding: 14, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
              <Shimmer color={`${theme.accent}40`} duration={2.6} delay={0.8} />
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${theme.accent2}40, ${theme.accent}30)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                💪
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                  Push Day · Chest + Triceps
                </div>
                <div style={{ fontSize: 11, color: theme.textDim }}>6 exercises · 48 min · ~480 kcal</div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill={theme.onAccent}>
                  <path d="M3 1.5l7 4.5-7 4.5z" />
                </svg>
              </div>
            </Card>
          </motion.div>
        </div>
        </Reveal>
      </div>
      <TabBar />
    </Background>
  );
}
