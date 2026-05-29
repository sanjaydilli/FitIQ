import React, { useMemo, useState } from 'react';
import { localDateStr, formatLocalDate } from '../utils/date';
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
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Activity</div>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        {/* Stats row */}
        <div style={{ padding: '12px 16px 8px', display: 'flex', gap: 10 }}>
          {[
            { label: 'STREAK', iconName: 'streak' as const, value: `${currentStreak}d`, color: '#FB923C' },
            { label: 'WORKOUTS', iconName: 'dumbbell' as const, value: totalWorkouts, color: theme.accent },
            { label: 'ACTIVE DAYS', iconName: 'lightning' as const, value: activeDaysCount, color: theme.accent2 },
          ].map(({ label, value, iconName, color }) => (
            <div key={label} style={{ flex: 1 }}>
              <Card style={{ padding: '10px 12px', borderRadius: 16, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                  <Icon name={iconName} size={16} color={color} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</div>
                <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.8 }}>{label}</div>
              </Card>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div style={{ padding: '8px 16px 12px' }}>
          <Card style={{ borderRadius: 18, padding: '14px 14px 10px', overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>6-Month Activity</div>
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
              style={{ padding: '0 16px 12px', overflow: 'hidden' }}
            >
              <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedDate}</div>
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
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Icon name="utensils" size={14} color="#FB923C" />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>Nutrition · {selectedDayData.calories} kcal</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {selectedDayData.foodEntries.map(e => (
                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${theme.cardBorder}` }}>
                          <span style={{ fontSize: 12, color: theme.textDim }}>{e.name}</span>
                          <span style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono }}>{e.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workout summary */}
                {selectedDayData.workout && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Icon name="dumbbell" size={14} color={theme.accent} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>Workout · {selectedDayData.workout.name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono }}>
                      {selectedDayData.workout.exercises.length} exercises · {selectedDayData.workout.totalVolume.toFixed(0)}kg volume
                    </div>
                  </div>
                )}

                {/* Measurement summary */}
                {selectedDayData.measurement && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Icon name="body" size={14} color="#5EEAD4" />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>Body Comp · {selectedDayData.measurement.bodyFatPct}% BF</span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono }}>
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
        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, padding: '0 2px' }}>Activity Breakdown</div>
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {[
              { label: 'Food logged', iconName: 'utensils' as const, count: Object.keys(caloriesByDate).length, color: '#FB923C' },
              { label: 'Workouts done', iconName: 'dumbbell' as const, count: totalWorkouts, color: theme.accent },
              { label: 'Body comp checks', iconName: 'body' as const, count: measurements.length, color: '#5EEAD4' },
            ].map(({ label, iconName, count, color }, i, arr) => (
              <div key={label} style={{
                padding: '12px 16px',
                borderBottom: i < arr.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Icon name={iconName} size={18} color={color} />
                <div style={{ flex: 1, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color }}>{count}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Background>
  );
}
