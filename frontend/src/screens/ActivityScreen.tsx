import React, { useMemo, useState } from 'react';
import { formatLocalDate } from '../utils/date';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { ActivityCalendar, DayActivity } from '../components/ActivityCalendar';
import { Icon } from '../components/Icon';
import { useFoodLog } from '../hooks/useFoodLog';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { useBodyComp } from '../hooks/useBodyComp';

export function ActivityScreen() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { caloriesByDate, getEntriesForDate } = useFoodLog();
  const { sessions } = useWorkoutLog();
  const { measurements } = useBodyComp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build workout set for quick lookup
  const workoutDays = useMemo(() => {
    const s = new Set<string>();
    sessions.forEach(sess => s.add(sess.date));
    return s;
  }, [sessions]);

  const measureDays = useMemo(() => {
    const s = new Set<string>();
    measurements.forEach(m => s.add(m.date));
    return s;
  }, [measurements]);

  // Compute activity level per day (0-4 based on combined activity)
  const activityDays = useMemo((): DayActivity[] => {
    const allDates = new Set<string>([
      ...Object.keys(caloriesByDate),
      ...Array.from(workoutDays),
      ...Array.from(measureDays),
    ]);

    return Array.from(allDates.values()).map(date => {
      let score = 0;
      if (caloriesByDate[date] && caloriesByDate[date] > 0) score += 2;
      if (workoutDays.has(date)) score += 2;
      if (measureDays.has(date)) score += 1;
      const level = (Math.min(score, 4)) as 0 | 1 | 2 | 3 | 4;
      return { date, level };
    });
  }, [caloriesByDate, workoutDays, measureDays]);

  // Stats
  const totalWorkouts = sessions.length;
  const activeDaysCount = activityDays.filter(d => d.level > 0).length;
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(d);
      const found = activityDays.find(a => a.date === dateStr);
      if (found && found.level > 0) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [activityDays]);

  // Selected day detail
  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const foodEntries = getEntriesForDate(selectedDate);
    const workout = sessions.find(s => s.date === selectedDate);
    const measurement = measurements.find(m => m.date === selectedDate);
    const calories = foodEntries.reduce((s, e) => s + e.calories, 0);
    return { foodEntries, workout, measurement, calories };
  }, [selectedDate, getEntriesForDate, sessions, measurements]);

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
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Activity</div>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        {/* Stats row */}
        <div style={{ padding: '14px 20px 8px', display: 'flex', gap: 10 }}>
          {[
            { label: 'STREAK', iconName: 'streak' as const, value: `${currentStreak}d`, color: '#EA580C' },
            { label: 'WORKOUTS', iconName: 'dumbbell' as const, value: totalWorkouts, color: theme.accent },
            { label: 'ACTIVE DAYS', iconName: 'lightning' as const, value: activeDaysCount, color: theme.accent2 },
          ].map(({ label, value, iconName, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 280, damping: 26 }}
              style={{ flex: 1 }}
            >
              <Card style={{ padding: '12px 12px', borderRadius: 16, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={iconName} size={14} color={color} />
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: -0.6, fontFamily: theme.mono, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginTop: 4 }}>{label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Calendar */}
        <div style={{ padding: '10px 20px 12px' }}>
          <Card style={{ borderRadius: 18, padding: '14px 14px 10px', overflow: 'hidden' }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 12, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>6-Month Activity</div>
            <ActivityCalendar
              days={activityDays}
              color={theme.accent}
              weeks={26}
              onDayPress={date => setSelectedDate(prev => prev === date ? null : date)}
            />
          </Card>
        </div>

        {/* Day detail panel */}
        <AnimatePresence>
          {selectedDate && selectedDayData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ padding: '0 20px 12px', overflow: 'hidden' }}
            >
              <Card style={{ borderRadius: 18, padding: '14px 16px', borderLeft: `3px solid ${theme.accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: theme.mono, letterSpacing: 0.3, color: theme.text }}>{selectedDate}</div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(null)}
                    style={{ background: 'none', border: 'none', color: theme.textMute, cursor: 'pointer', fontSize: 16 }}
                  >
                    ×
                  </motion.button>
                </div>

                {/* Food summary */}
                {selectedDayData.calories > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(251,146,60,0.18)', border: '1px solid rgba(251,146,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="utensils" size={12} color="#EA580C" />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Nutrition</span>
                      <span style={{ fontSize: 11, color: '#EA580C', fontFamily: theme.mono, marginLeft: 'auto', fontWeight: 700 }}>{selectedDayData.calories} kcal</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedDayData.foodEntries.map(e => (
                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${theme.cardBorder}` }}>
                          <span style={{ fontSize: 12, color: theme.textDim }}>{e.name}</span>
                          <span style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.2 }}>{e.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workout summary */}
                {selectedDayData.workout && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: `${theme.accent}18`, border: `1px solid ${theme.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="dumbbell" size={12} color={theme.accent} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Workout · {selectedDayData.workout.name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono, paddingLeft: 32 }}>
                      {selectedDayData.workout.exercises.length} exercises · {selectedDayData.workout.totalVolume.toFixed(0)}kg volume
                    </div>
                  </div>
                )}

                {/* Measurement summary */}
                {selectedDayData.measurement && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(94,234,212,0.18)', border: '1px solid rgba(94,234,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="body" size={12} color="#0E9384" />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Body Comp · {selectedDayData.measurement.bodyFatPct}% BF</span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono, paddingLeft: 32 }}>
                      {selectedDayData.measurement.weightKg}kg · {selectedDayData.measurement.leanMass}kg lean
                    </div>
                  </div>
                )}

                {selectedDayData.calories === 0 && !selectedDayData.workout && !selectedDayData.measurement && (
                  <div style={{ fontSize: 12, color: theme.textMute, textAlign: 'center', padding: '8px 0' }}>No activity logged</div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contribution breakdown */}
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, padding: '0 2px', color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>Activity Breakdown</div>
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {[
              { label: 'Food logged', iconName: 'utensils' as const, count: Object.keys(caloriesByDate).length, color: '#EA580C' },
              { label: 'Workouts done', iconName: 'dumbbell' as const, count: totalWorkouts, color: theme.accent },
              { label: 'Body comp checks', iconName: 'body' as const, count: measurements.length, color: '#0E9384' },
            ].map(({ label, iconName, count, color }, i, arr) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                style={{
                  padding: '13px 16px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={iconName} size={15} color={color} />
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: theme.mono, letterSpacing: -0.4 }}>{count}</div>
              </motion.div>
            ))}
          </Card>
        </div>
      </div>
    </Background>
  );
}
