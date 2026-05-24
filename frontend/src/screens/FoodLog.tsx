import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { MacroRing } from '../components/MacroRing';
import { Icon, IconName } from '../components/Icon';
import { useFoodLog, MealType, FoodEntry } from '../hooks/useFoodLog';
import { useBodyComp } from '../hooks/useBodyComp';
import { goalCalorieAdjust } from '../utils/bodyComposition';

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_ICONS: Record<MealType, IconName> = {
  breakfast: 'sunrise',
  lunch: 'sun',
  snack: 'leaf',
  dinner: 'moon',
};
const MEAL_COLORS: Record<MealType, string> = {
  breakfast: '#FBBF24',
  lunch: '#FB923C',
  snack: '#4ade80',
  dinner: '#A78BFA',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function FoodLog() {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const { getEntriesForDate, getDailyTotals, removeEntry } = useFoodLog();
  const { tdee } = useBodyComp();

  const today = new Date().toISOString().slice(0, 10);
  const [viewDate, setViewDate] = useState(today);

  const targetCalories = (tdee || Math.round(user.weightKg * 30)) + goalCalorieAdjust(user.goal);
  const targetProtein  = Math.round(user.weightKg * 2);

  const totals = useMemo(() => getDailyTotals(viewDate), [getDailyTotals, viewDate]);

  const byMeal = useMemo(() => {
    const map: Record<MealType, FoodEntry[]> = { breakfast: [], lunch: [], snack: [], dinner: [] };
    totals.entries.forEach(e => { map[e.meal]?.push(e); });
    return map;
  }, [totals]);

  const deficit = targetCalories - totals.calories;

  const prevDay = () => {
    const d = new Date(viewDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setViewDate(d.toISOString().slice(0, 10));
  };
  const nextDay = () => {
    const d = new Date(viewDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    if (d <= new Date()) setViewDate(d.toISOString().slice(0, 10));
  };

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '56px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2.5 }}>FOOD DIARY</div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>Nutrition</div>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate('/food')}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                color: theme.onAccent, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              + Add Food
            </motion.button>
          </div>

          {/* Date navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={prevDay}
              style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: '6px 12px', color: theme.text, cursor: 'pointer', fontSize: 14 }}>
              ‹
            </motion.button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              {viewDate === today ? 'Today' : formatDate(viewDate)}
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={nextDay}
              disabled={viewDate === today}
              style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: '6px 12px', color: viewDate === today ? theme.textMute : theme.text, cursor: viewDate === today ? 'default' : 'pointer', fontSize: 14 }}>
              ›
            </motion.button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 110px' }}>
          {/* Macro summary */}
          <Card style={{ borderRadius: 20, padding: '16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <MacroRing
                calories={totals.calories}
                targetCalories={targetCalories}
                protein={totals.protein}
                carbs={totals.carbs}
                fat={totals.fat}
                size={100}
              />
              <div style={{ flex: 1 }}>
                {/* Calorie deficit/surplus */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                    {totals.calories > 0 ? totals.calories.toLocaleString() : '—'}
                    <span style={{ fontSize: 11, color: theme.textMute, fontWeight: 400 }}> / {targetCalories} kcal</span>
                  </div>
                  {totals.calories > 0 && (
                    <div style={{
                      fontSize: 11, fontFamily: theme.mono, fontWeight: 700,
                      color: deficit >= 0 ? '#4ade80' : '#F87171',
                    }}>
                      {deficit >= 0 ? `${deficit} kcal under target` : `${Math.abs(deficit)} kcal over target`}
                    </div>
                  )}
                </div>

                {/* Macro bars */}
                {[
                  { l: 'Carbs', v: totals.carbs, color: '#FB923C' },
                  { l: 'Protein', v: totals.protein, target: targetProtein, color: '#A78BFA' },
                  { l: 'Fat', v: totals.fat, color: '#5EEAD4' },
                ].map(({ l, v, target, color }) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <div style={{ width: 42, fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>{l}</div>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        animate={{ width: target ? `${Math.min(100, (v / target) * 100)}%` : '30%' }}
                        transition={{ duration: 0.6 }}
                        style={{ height: '100%', background: color, borderRadius: 2 }}
                      />
                    </div>
                    <div style={{ width: 32, textAlign: 'right', fontSize: 10, fontFamily: theme.mono, color }}>{v}g</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Meal groups */}
          {MEAL_ORDER.map(meal => {
            const entries = byMeal[meal];
            const mealCal = entries.reduce((s, e) => s + e.calories, 0);
            return (
              <div key={meal} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, padding: '0 2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name={MEAL_ICONS[meal]} size={14} color={MEAL_COLORS[meal]} />
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{meal}</span>
                    {mealCal > 0 && (
                      <span style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono }}>{mealCal} kcal</span>
                    )}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => navigate(`/food?meal=${meal}`)}
                    style={{
                      background: `${MEAL_COLORS[meal]}18`, border: `1px solid ${MEAL_COLORS[meal]}40`,
                      borderRadius: 8, padding: '3px 10px', cursor: 'pointer',
                      color: MEAL_COLORS[meal], fontSize: 13, fontWeight: 700, lineHeight: 1.4,
                    }}
                  >
                    + Add
                  </motion.button>
                </div>

                <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <AnimatePresence>
                    {entries.length > 0 ? entries.map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px',
                          borderBottom: i < entries.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{entry.name}</div>
                          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
                            P:{entry.protein}g · C:{entry.carbs}g · F:{entry.fat}g
                          </div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#FB923C', fontFamily: theme.mono }}>
                          {entry.calories}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => removeEntry(entry.id)}
                          style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: 'pointer', fontSize: 16, padding: '0 4px', lineHeight: 1 }}
                        >
                          ×
                        </motion.button>
                      </motion.div>
                    )) : (
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/food?meal=${meal}`)}
                        style={{
                          padding: '12px 14px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 16, opacity: 0.4 }}>+</span>
                        <span style={{ fontSize: 12, color: theme.textMute }}>Add {meal}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      <TabBar />
    </Background>
  );
}
