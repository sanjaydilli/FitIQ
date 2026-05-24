import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { LineChart } from '../components/LineChart';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { EXERCISE_DB } from '../data/exercises';

export function StrengthHistory() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { sessions, personalRecords, getExerciseHistory, detectPlateau } = useWorkoutLog();

  // Exercises that have at least one session
  const exercisesWithData = useMemo(() => {
    const ids = new Set<string>();
    sessions.forEach(s => s.exercises.forEach(e => ids.add(e.exerciseId)));
    return EXERCISE_DB.filter(ex => ids.has(ex.id));
  }, [sessions]);

  const [selectedId, setSelectedId] = useState<string>(() => exercisesWithData[0]?.id ?? '');

  const history = useMemo(() => getExerciseHistory(selectedId).slice(-12), [getExerciseHistory, selectedId]);

  const weightData = useMemo(() =>
    history.map(h => ({ label: h.date.slice(5), value: h.maxWeight })),
    [history]
  );

  const volumeData = useMemo(() =>
    history.map(h => ({ label: h.date.slice(5), value: h.totalVolume })),
    [history]
  );

  const prIndex = useMemo(() => {
    if (weightData.length === 0) return undefined;
    let maxIdx = 0;
    weightData.forEach((d, i) => { if (d.value > weightData[maxIdx].value) maxIdx = i; });
    return maxIdx;
  }, [weightData]);

  const pr = personalRecords[selectedId];
  const isPlateauing = selectedId ? detectPlateau(selectedId) : false;

  if (exercisesWithData.length === 0) {
    return (
      <Background>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '0 32px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 22, background: `${theme.accent}12`, border: `1px solid ${theme.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="barbell" size={38} color={theme.accent} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>No workouts yet</div>
          <div style={{ fontSize: 13, color: theme.textDim, lineHeight: 1.5 }}>Complete your first workout to see strength history and progress charts here.</div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/workout')}
            style={{ padding: '12px 24px', borderRadius: 14, background: theme.accent, color: theme.onAccent, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            Start First Workout
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
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Strength History</div>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        {/* Exercise selector */}
        <div style={{ padding: '12px 0', overflowX: 'auto', display: 'flex', gap: 8, paddingLeft: 16, scrollbarWidth: 'none' }}>
          {exercisesWithData.map(ex => (
            <motion.button
              key={ex.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedId(ex.id)}
              style={{
                flexShrink: 0,
                padding: '7px 14px', borderRadius: 20,
                border: selectedId === ex.id ? 'none' : `1px solid ${theme.cardBorder}`,
                background: selectedId === ex.id ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : theme.card,
                color: selectedId === ex.id ? theme.onAccent : theme.text,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {ex.name}
            </motion.button>
          ))}
        </div>

        <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Plateau warning */}
          {isPlateauing && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '10px 14px', borderRadius: 14,
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.3)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24' }}>Plateau detected</div>
                <div style={{ fontSize: 11, color: theme.textDim }}>No weight increase in last 4 sessions — consider deload or variation</div>
              </div>
            </motion.div>
          )}

          {/* Max weight chart */}
          {weightData.length >= 2 ? (
            <Card style={{ borderRadius: 18, padding: '14px 14px 10px' }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Max Weight</div>
                {pr && (
                  <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, marginTop: 2 }}>
                    Best: {pr.weight}kg × {pr.reps} reps · {pr.date}
                  </div>
                )}
              </div>
              <LineChart data={weightData} color={theme.accent} height={130} unit="kg" prIndex={prIndex} />
            </Card>
          ) : (
            <Card style={{ borderRadius: 18, padding: 16 }}>
              <div style={{ fontSize: 13, color: theme.textDim, textAlign: 'center' }}>Need 2+ sessions for chart</div>
            </Card>
          )}

          {/* Volume chart */}
          {volumeData.length >= 2 && (
            <Card style={{ borderRadius: 18, padding: '14px 14px 10px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Volume (kg)</div>
              <LineChart data={volumeData} color="#60A5FA" height={100} showDots={false} />
            </Card>
          )}

          {/* Session history */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, padding: '0 2px' }}>Recent Sessions</div>
            <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
              {history.slice(-8).reverse().map((h, i, arr) => (
                <div key={i} style={{
                  padding: '11px 14px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{h.date}</div>
                    <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono }}>
                      {h.sets.length} sets · max {h.maxWeight}kg · {h.totalVolume.toFixed(0)}kg vol
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>{h.maxWeight}kg</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </Background>
  );
}
