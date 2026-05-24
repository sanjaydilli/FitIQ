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

  const todayISO = new Date().toISOString().slice(0, 10);
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

        {/* Active workout resume banner */}
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '0 20px', marginBottom: 12 }}
          >
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/workout/log')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 16,
                background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accent2}15)`,
                border: `1px solid ${theme.accent}40`,
                cursor: 'pointer',
              }}
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F87171', boxShadow: '0 0 8px #F87171' }} />
              </motion.div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{active.name} in progress</div>
                <div style={{ fontSize: 11, color: theme.textDim }}>{active.exercises.length} exercises · tap to resume</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round">
                <path d="M4.5 2.5L8 6l-3.5 3.5" />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Preset workout cards */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Start a Workout</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PRESETS.map(preset => (
              <motion.div key={preset.id} whileTap={{ scale: 0.96 }}>
                <Card style={{ borderRadius: 18, overflow: 'hidden', padding: 0 }}>
                  <div style={{
                    height: 80, position: 'relative',
                    background: `linear-gradient(135deg, ${preset.color}30, ${preset.color}10)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 60%, ${preset.color}40, transparent 70%)` }} />
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${preset.color}25`, border: `1px solid ${preset.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', boxShadow: `0 4px 16px ${preset.color}30`,
                    }}>
                      <Icon name={preset.icon} size={24} color={preset.color} strokeWidth={1.6} />
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{preset.name}</div>
                    <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 12, lineHeight: 1.4 }}>{preset.subtitle}</div>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleStartPreset(preset.name, preset.exerciseIds)}
                      style={{
                        width: '100%', padding: '8px 0', borderRadius: 10, border: 'none',
                        background: `linear-gradient(135deg, ${preset.color}cc, ${preset.color}99)`,
                        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        boxShadow: `0 2px 8px ${preset.color}40`,
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
              onClick={() => navigate('/workout/history')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 16,
                background: theme.card, border: `1px solid ${theme.cardBorder}`,
                cursor: 'pointer',
              }}
            >
              <Icon name="chart" size={20} color={theme.accent2} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Strength History</div>
                <div style={{ fontSize: 11, color: theme.textDim }}>{sessions.length} sessions logged</div>
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
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1, marginBottom: 8 }}>
              {todaySession ? 'TODAY\'S SESSION' : 'LAST SESSION'}
            </div>
            <motion.div whileTap={{ scale: 0.97 }} onClick={() => navigate('/workout/history')} style={{ cursor: 'pointer' }}>
              <Card style={{ borderRadius: 18, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top right, ${todaySession ? '#4ade8020' : theme.accent + '15'}, transparent 60%)` }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{displaySession.name}</div>
                      <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono }}>{displaySession.date}</div>
                    </div>
                    {todaySession && (
                      <div style={{ fontSize: 10, fontFamily: theme.mono, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '3px 8px' }}>
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
                        <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1 }}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: theme.mono }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        ) : (
          <div style={{ padding: '0 20px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: theme.textMute, lineHeight: 1.6 }}>
              Pick a preset above to log your first session.<br />Your progress will appear here.
            </div>
          </div>
        )}
      </div>
      <TabBar />
    </Background>
  );
}
