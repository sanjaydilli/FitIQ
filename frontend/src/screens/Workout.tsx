import { localDateStr } from '../utils/date';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { Icon, IconName } from '../components/Icon';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { PUSH_DAY, PULL_DAY, LEG_DAY, FULL_BODY } from '../data/exercises';

const PRESETS: { id: string; name: string; subtitle: string; icon: IconName; color: string; exerciseIds: string[] }[] = [
  { id: 'push', name: 'Push Day', subtitle: 'Chest · Shoulders · Triceps', icon: 'muscle', color: '#A78BFA', exerciseIds: PUSH_DAY },
  { id: 'pull', name: 'Pull Day', subtitle: 'Back · Biceps', icon: 'barbell', color: '#5EEAD4', exerciseIds: PULL_DAY },
  { id: 'legs', name: 'Leg Day', subtitle: 'Quads · Hamstrings · Calves', icon: 'legs', color: '#FB923C', exerciseIds: LEG_DAY },
  { id: 'full', name: 'Full Body', subtitle: 'All muscle groups', icon: 'lightning', color: '#FBBF24', exerciseIds: FULL_BODY },
];

export function Workout() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { active, sessions, startWorkout } = useWorkoutLog();

  const todayISO = localDateStr();
  const todaySession = sessions.find(s => s.date === todayISO) ?? null;
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const displaySession = todaySession ?? lastSession;

  const handleStartPreset = (name: string, exerciseIds: string[]) => {
    startWorkout(name, exerciseIds);
    navigate('/workout/log');
  };

  return (
    <Background>
      <div className="scroll-y" style={{ padding: '60px 0 110px', height: '100%', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700 }}>STRENGTH</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>Workout</div>
        </div>

        {/* Active workout resume banner */}
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '0 20px', marginBottom: 16 }}
          >
            <motion.div
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate('/workout/log')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 16,
                background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accent2}15)`,
                border: `1px solid ${theme.accent}40`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)`,
                cursor: 'pointer',
              }}
            >
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: '#F87171', boxShadow: '0 0 8px #F87171', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>{active.name} in progress</div>
                <div style={{ fontSize: 11, color: theme.textDim, marginTop: 1 }}>{active.exercises.length} exercises · tap to resume</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round">
                <path d="M4.5 2.5L8 6l-3.5 3.5" />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Preset workout cards */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>
            START A WORKOUT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PRESETS.map((preset, i) => (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
              >
                <Card style={{ borderRadius: 18, overflow: 'hidden', padding: 0 }}>
                  <div style={{
                    height: 84, position: 'relative',
                    background: `linear-gradient(135deg, ${preset.color}30, ${preset.color}10)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderBottom: `1px solid ${preset.color}20`,
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 60%, ${preset.color}40, transparent 70%)`, pointerEvents: 'none' }} />
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${preset.color}28`, border: `1px solid ${preset.color}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', boxShadow: `0 4px 14px ${preset.color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
                    }}>
                      <Icon name={preset.icon} size={24} color={preset.color} strokeWidth={1.6} />
                    </div>
                  </div>
                  <div style={{ padding: '14px 14px 14px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, letterSpacing: -0.2 }}>{preset.name}</div>
                    <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 12, lineHeight: 1.4 }}>{preset.subtitle}</div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartPreset(preset.name, preset.exerciseIds)}
                      style={{
                        width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
                        background: `linear-gradient(135deg, ${preset.color}, ${preset.color}cc)`,
                        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        boxShadow: `0 2px 8px ${preset.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
                        letterSpacing: 0.3,
                      }}
                    >
                      Start
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* History link */}
        {sessions.length > 0 && (
          <div style={{ padding: '0 20px', marginBottom: 16 }}>
            <motion.div
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate('/workout/history')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 16,
                background: theme.card, border: `1px solid ${theme.cardBorder}`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)`,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${theme.accent2}18`, border: `1px solid ${theme.accent2}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="chart" size={18} color={theme.accent2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Strength History</div>
                <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono, marginTop: 1 }}>{sessions.length} sessions logged</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke={theme.textMute} strokeWidth="2" strokeLinecap="round">
                <path d="M4.5 2.5L8 6l-3.5 3.5" />
              </svg>
            </motion.div>
          </div>
        )}

        {/* Last / Today session summary */}
        {displaySession ? (
          <div style={{ padding: '0 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>
              {todaySession ? 'TODAY\'S SESSION' : 'LAST SESSION'}
            </div>
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} onClick={() => navigate('/workout/history')} style={{ cursor: 'pointer' }}>
              <Card style={{ borderRadius: 18, padding: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top right, ${todaySession ? '#4ade8020' : theme.accent + '15'}, transparent 60%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{displaySession.name}</div>
                      <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, marginTop: 2 }}>{displaySession.date}</div>
                    </div>
                    {todaySession && (
                      <div style={{ fontSize: 10, fontFamily: theme.mono, fontWeight: 800, color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '3px 8px', letterSpacing: 0.8 }}>
                        DONE ✓
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    {[
                      { label: 'EXERCISES', value: String(displaySession.exercises.length) },
                      { label: 'VOLUME', value: `${displaySession.totalVolume.toLocaleString()} kg` },
                      { label: 'DURATION', value: displaySession.endTime ? `${Math.round((displaySession.endTime - displaySession.startTime) / 60000)}m` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 700 }}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: theme.mono, marginTop: 2 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        ) : (
          <div style={{ padding: '0 20px 8px' }}>
            <Card style={{ padding: '24px 20px', borderRadius: 18, textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${theme.accent}14`, border: `1px solid ${theme.accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Icon name="dumbbell" size={22} color={theme.accent} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, letterSpacing: -0.2 }}>
                Log your first session
              </div>
              <div style={{ fontSize: 12, color: theme.textMute, lineHeight: 1.5, maxWidth: 240, margin: '0 auto' }}>
                Pick a preset above to start tracking. Your progress will appear here.
              </div>
            </Card>
          </div>
        )}
      </div>
      <TabBar />
    </Background>
  );
}
