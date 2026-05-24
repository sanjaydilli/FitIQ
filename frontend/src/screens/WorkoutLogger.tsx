import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { getExercise } from '../data/exercises';

function fmt(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function WorkoutLogger() {
  const { theme } = useTheme();
  const { awardXP } = useUser();
  const navigate = useNavigate();
  const { active, finishWorkout, discardWorkout, updateSet, addSet, removeSet, isNewPR, suggestNextWeight } = useWorkoutLog();

  const [elapsed, setElapsed] = useState(0);
  const [prFlash, setPrFlash] = useState<string | null>(null); // 'exIdx-setIdx'
  const [restTimer, setRestTimer] = useState<{ secs: number; total: number } | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed timer
  useEffect(() => {
    if (!active) return;
    const base = Math.floor((Date.now() - active.startTime) / 1000);
    setElapsed(base);
    const id = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(id);
  }, [active?.startTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rest timer tick
  useEffect(() => {
    if (!restTimer) return;
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (!prev || prev.secs <= 1) {
          clearInterval(restRef.current!);
          return null;
        }
        return { ...prev, secs: prev.secs - 1 };
      });
    }, 1000);
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [restTimer?.total]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback((exIdx: number, setIdx: number, weight: number, reps: number, exerciseId: string, restSeconds: number) => {
    const isNew = isNewPR(exerciseId, weight, reps);
    updateSet(exIdx, setIdx, { completed: true });
    if (isNew) {
      const key = `${exIdx}-${setIdx}`;
      setPrFlash(key);
      setTimeout(() => setPrFlash(null), 2000);
    }
    setRestTimer({ secs: restSeconds, total: restSeconds });
  }, [isNewPR, updateSet]);

  const handleFinish = useCallback(() => {
    const result = finishWorkout();
    awardXP(100);
    navigate('/workout', { state: { justFinished: true, summary: result } });
  }, [finishWorkout, awardXP, navigate]);

  const handleDiscard = useCallback(() => {
    if (window.confirm('Discard this workout? All progress will be lost.')) {
      discardWorkout();
      navigate('/workout');
    }
  }, [discardWorkout, navigate]);

  if (!active) {
    return (
      <Background>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `${theme.accent}15`, border: `1px solid ${theme.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="dumbbell" size={36} color={theme.accent} />
          </div>
          <div style={{ fontSize: 16, color: theme.textDim }}>No active workout</div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/workout')}
            style={{ padding: '12px 24px', borderRadius: 14, background: theme.accent, color: theme.onAccent, border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Go to Workouts
          </motion.button>
        </div>
      </Background>
    );
  }

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
          onClick={() => navigate('/workout')}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>{active.name}</div>
          <div style={{ fontSize: 11, fontFamily: theme.mono, color: theme.textDim }}>
            {fmt(elapsed)} · {active.totalVolume > 0 ? `${active.totalVolume.toFixed(0)} kg vol` : 'Starting...'}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleDiscard}
          style={{ background: 'none', border: 'none', color: '#F87171', fontSize: 12, cursor: 'pointer', fontFamily: theme.mono }}
        >
          DISCARD
        </motion.button>
      </div>

      {/* Scroll area */}
      <div style={{ paddingTop: 72, paddingBottom: 100, height: '100%', overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {active.exercises.map((ex, exIdx) => {
            const tmpl = getExercise(ex.exerciseId);
            return (
              <Card key={ex.exerciseId} style={{ borderRadius: 18, overflow: 'hidden', borderLeft: `3px solid ${theme.accent}` }}>
                {/* Exercise header */}
                <div style={{ padding: '12px 14px 8px', borderBottom: `1px solid ${theme.cardBorder}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{ex.exerciseName}</div>
                  {tmpl && (
                    <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      {tmpl.muscleGroup} · {tmpl.restSeconds}s rest
                    </div>
                  )}
                </div>

                {/* Set rows */}
                <div style={{ padding: '6px 14px' }}>
                  {/* Column headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px', gap: 6, padding: '4px 0', marginBottom: 4 }}>
                    {['SET', 'KG', 'REPS', ''].map((h, i) => (
                      <div key={i} style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1 }}>{h}</div>
                    ))}
                  </div>

                  {ex.sets.map((s, setIdx) => {
                    const flashKey = `${exIdx}-${setIdx}`;
                    const isFlashing = prFlash === flashKey;
                    return (
                      <motion.div
                        key={setIdx}
                        style={{
                          display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px', gap: 6,
                          padding: '5px 0',
                          opacity: s.completed ? 0.55 : 1,
                          borderBottom: setIdx < ex.sets.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                          alignItems: 'center',
                          position: 'relative',
                        }}
                      >
                        {/* PR flash overlay */}
                        <AnimatePresence>
                          {isFlashing && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              style={{
                                position: 'absolute', inset: 0, zIndex: 2,
                                background: 'rgba(251,191,36,0.15)',
                                borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                pointerEvents: 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Icon name="trophy" size={14} color="#FBBF24" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: '#FBBF24', fontFamily: theme.mono }}>PR!</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div style={{ fontSize: 12, color: s.completed ? '#4ade80' : theme.textDim, fontFamily: theme.mono, fontWeight: 700 }}>
                          {s.completed ? '✓' : setIdx + 1}
                        </div>

                        <input
                          type="number"
                          value={s.weight || ''}
                          onChange={e => updateSet(exIdx, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          style={{
                            background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.cardBorder}`,
                            borderRadius: 8, padding: '5px 8px', color: theme.text,
                            fontSize: 13, fontFamily: theme.mono, width: '100%', outline: 'none',
                          }}
                        />

                        <input
                          type="number"
                          value={s.reps || ''}
                          onChange={e => updateSet(exIdx, setIdx, { reps: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          style={{
                            background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.cardBorder}`,
                            borderRadius: 8, padding: '5px 8px', color: theme.text,
                            fontSize: 13, fontFamily: theme.mono, width: '100%', outline: 'none',
                          }}
                        />

                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => {
                            if (s.completed) {
                              updateSet(exIdx, setIdx, { completed: false });
                            } else {
                              handleComplete(exIdx, setIdx, s.weight, s.reps, ex.exerciseId, tmpl?.restSeconds ?? 60);
                            }
                          }}
                          style={{
                            width: 34, height: 34, borderRadius: 10, border: s.completed ? 'none' : `1.5px solid ${theme.accent}50`,
                            cursor: 'pointer',
                            background: s.completed ? 'linear-gradient(135deg, #22c55e, #4ade80)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: s.completed ? '0 2px 8px #4ade8050' : 'none',
                          }}
                        >
                          {s.completed
                            ? <Icon name="check" size={16} color="#fff" strokeWidth={2.5} />
                            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke={theme.accent} strokeWidth="1.5" strokeOpacity="0.7" /></svg>
                          }
                        </motion.button>
                      </motion.div>
                    );
                  })}

                  {/* Suggest hint */}
                  {ex.sets[ex.sets.length - 1]?.weight > 0 && (
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, paddingTop: 6, paddingBottom: 4 }}>
                      Suggested next: {suggestNextWeight(ex.exerciseId, ex.sets[ex.sets.length - 1].weight)}kg
                    </div>
                  )}
                </div>

                {/* Add / Remove set buttons */}
                <div style={{ padding: '6px 14px 12px', display: 'flex', gap: 8 }}>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => addSet(exIdx)}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 10, border: `1px dashed ${theme.cardBorder}`,
                      background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 12,
                    }}
                  >
                    + Add Set
                  </motion.button>
                  {ex.sets.length > 1 && (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => removeSet(exIdx, ex.sets.length - 1)}
                      style={{
                        padding: '7px 14px', borderRadius: 10, border: 'none',
                        background: 'rgba(248,113,113,0.1)', color: '#F87171', cursor: 'pointer', fontSize: 12,
                      }}
                    >
                      −
                    </motion.button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Rest timer toast */}
      <AnimatePresence>
        {restTimer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute', bottom: 86, left: 16, right: 16, zIndex: 20,
              background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accent2}15)`,
              border: `1px solid ${theme.accent}40`,
              borderRadius: 16, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="timer" size={20} color={theme.accent} />
            </motion.div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono }}>REST TIMER</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: theme.mono, letterSpacing: -0.5 }}>
                {fmt(restTimer.secs)}
              </div>
            </div>
            <div style={{ width: 48, height: 48, position: 'relative' }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <motion.circle
                  cx="24" cy="24" r="20" fill="none" stroke={theme.accent} strokeWidth="3"
                  strokeLinecap="round" strokeDasharray={125.6}
                  strokeDashoffset={125.6 * (1 - restTimer.secs / restTimer.total)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '24px 24px' }}
                />
              </svg>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setRestTimer(null)}
              style={{ background: 'none', border: 'none', color: theme.textMute, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
            >
              ×
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish button */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px', background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleFinish}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: theme.onAccent, fontSize: 16, fontWeight: 800, letterSpacing: -0.3,
          }}
        >
          Finish Workout · {fmt(elapsed)}
        </motion.button>
      </div>
    </Background>
  );
}
