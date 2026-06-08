import React, { useState, useMemo } from 'react';
import { localDateStr, formatLocalDate } from '../utils/date';
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
  const { getDailyTotals, removeEntry } = useFoodLog();
  const { tdee } = useBodyComp();

  const today = localDateStr();
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
    setViewDate(formatLocalDate(d));
  };
  const nextDay = () => {
    const d = new Date(viewDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    if (d <= new Date()) setViewDate(formatLocalDate(d));
  };

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '56px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700 }}>FOOD DIARY</div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>Nutrition</div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/food')}
              style={{
                padding: '9px 16px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                color: theme.onAccent, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 4px 14px ${theme.accent}38, inset 0 1px 0 rgba(255,255,255,0.18)`,
              }}
            >
              + Add Food
            </motion.button>
          </div>

          {/* Date navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={prevDay}
              style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: '6px 12px', color: theme.text, cursor: 'pointer', fontSize: 14 }}>
              ‹
            </motion.button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: -0.1 }}>
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
          <Card style={{ borderRadius: 20, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <MacroRing
                calories={totals.calories}
                targetCalories={targetCalories}
                protein={totals.protein}
                carbs={totals.carbs}
                fat={totals.fat}
                size={100}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Calorie deficit/surplus */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, fontFamily: theme.mono }}>
                    {totals.calories > 0 ? totals.calories.toLocaleString() : '—'}
                    <span style={{ fontSize: 11, color: theme.textMute, fontWeight: 400, fontFamily: theme.mono }}> / {targetCalories} kcal</span>
                  </div>
                  {totals.calories > 0 && (
                    <div style={{
                      fontSize: 11, fontFamily: theme.mono, fontWeight: 700, marginTop: 2,
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
            const color = MEAL_COLORS[meal];
            return (
              <div key={meal} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 7,
                      background: `${color}18`, border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={MEAL_ICONS[meal]} size={12} color={color} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'capitalize', letterSpacing: -0.2 }}>{meal}</span>
                    {mealCal > 0 && (
                      <span style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono }}>· {mealCal} kcal</span>
                    )}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(`/food?meal=${meal}`)}
                    style={{
                      background: `${color}18`, border: `1px solid ${color}40`,
                      borderRadius: 8, padding: '4px 12px', cursor: 'pointer',
                      color, fontSize: 12, fontWeight: 700, lineHeight: 1.4, letterSpacing: 0.2,
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
                          padding: '12px 14px',
                          borderBottom: i < entries.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2 }}>{entry.name}</div>
                          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginTop: 2 }}>
                            P:{entry.protein}g · C:{entry.carbs}g · F:{entry.fat}g
                          </div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#FB923C', fontFamily: theme.mono }}>
                          {entry.calories}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => removeEntry(entry.id)}
                          style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 }}
                        >
                          ×
                        </motion.button>
                      </motion.div>
                    )) : (
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ background: `${color}06` }}
                        onClick={() => navigate(`/food?meal=${meal}`)}
                        style={{
                          padding: '16px 14px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `${color}14`, border: `1px dashed ${color}45`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon name={MEAL_ICONS[meal]} size={16} color={color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: theme.textDim, textTransform: 'capitalize', letterSpacing: -0.1 }}>
                            Log your {meal}
                          </div>
                          <div style={{ fontSize: 11, color: theme.textMute, marginTop: 1 }}>
                            Tap to search or scan a barcode
                          </div>
                        </div>
                        <div style={{ fontSize: 18, color: `${color}90`, fontWeight: 300, lineHeight: 1 }}>+</div>
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
