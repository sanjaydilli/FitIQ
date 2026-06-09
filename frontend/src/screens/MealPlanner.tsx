import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon, IconName } from '../components/Icon';
import { useBodyComp } from '../hooks/useBodyComp';
import { useFoodLog, MealType } from '../hooks/useFoodLog';
import { generateMealPlan, MealPlan, PlannedMeal } from '../services/mealPlannerService';
import { goalCalorieAdjust } from '../utils/bodyComposition';

const MEAL_ICONS: Record<string, IconName> = {
  breakfast: 'sunrise',
  lunch: 'sun',
  dinner: 'moon',
  snack: 'leaf',
};
const MEAL_COLORS: Record<string, string> = {
  breakfast: '#FBBF24',
  lunch: '#FB923C',
  dinner: '#A78BFA',
  snack: '#4ade80',
};

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export function MealPlanner() {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const { tdee } = useBodyComp();
  const { addEntry } = useFoodLog();

  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState<Set<string>>(new Set());

  const targetCalories = (tdee || Math.round(user.weightKg * 30)) + goalCalorieAdjust(user.goal);
  const targetProtein = Math.round(user.weightKg * 2.0);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLogged(new Set());
    try {
      const result = await generateMealPlan({
        tdee,
        goal: user.goal,
        diet: user.diet,
        weightKg: user.weightKg,
        targetCalories,
        targetProtein,
      });
      setPlan(result);
    } catch {
      setError('Failed to generate meal plan. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, [tdee, user.goal, user.diet, user.weightKg, targetCalories, targetProtein]);

  const logMeal = useCallback((meal: PlannedMeal) => {
    addEntry({
      meal: meal.meal,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    });
    setLogged(prev => new Set(prev).add(meal.meal));
  }, [addEntry]);

  const orderedMeals = plan
    ? MEAL_ORDER.map(m => plan.meals.find(pm => pm.meal === m)).filter(Boolean) as PlannedMeal[]
    : [];

  return (
    <Background>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '14px 20px',
        background: theme.id === 'aurora' ? 'rgba(8,6,15,0.7)' : theme.id === 'neon' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderBottom: `1px solid ${theme.cardBorder}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: '6px 10px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700 }}>AI POWERED</div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: theme.text, marginTop: 1 }}>Meal Planner</div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ y: -1 }}
          onClick={generate}
          disabled={loading}
          style={{
            padding: '8px 14px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: theme.onAccent, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: loading ? 'none' : `0 4px 14px ${theme.accent}30`,
            fontFamily: theme.font,
          }}
        >
          {loading ? '...' : plan ? 'Regenerate' : 'Generate'}
        </motion.button>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        {/* Target banner */}
        <div style={{ padding: '12px 16px 8px' }}>
          <Card style={{ borderRadius: 16, padding: '10px 14px', display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1 }}>TARGET KCAL</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FB923C' }}>{targetCalories}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1 }}>PROTEIN</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.accent }}>{targetProtein}g</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1 }}>GOAL</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.accent2, textTransform: 'capitalize' }}>{user.goal}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1 }}>DIET</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.textDim, textTransform: 'capitalize' }}>{user.diet}</div>
            </div>
          </Card>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 32px', gap: 16 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${theme.accent}30`, borderTopColor: theme.accent }}
            />
            <div style={{ fontSize: 14, color: theme.textDim, textAlign: 'center' }}>
              Generating your personalised Indian meal plan...
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ padding: '12px 16px' }}>
            <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', fontSize: 13, color: '#F87171' }}>
              {error}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!plan && !loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 32px', gap: 16, textAlign: 'center' }}>
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: 56 }}
            >
              🍛
            </motion.div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Your AI Meal Plan</div>
            <div style={{ fontSize: 13, color: theme.textDim, lineHeight: 1.6 }}>
              Tap Generate to get a personalised full-day Indian meal plan built around your calorie and protein targets.
            </div>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, background: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: '8px 12px' }}>
              Powered by Groq AI · LLaMA 3.3 70B
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={generate}
              style={{
                padding: '13px 32px', borderRadius: 16, border: 'none',
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                color: theme.onAccent, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Generate Plan
            </motion.button>
          </div>
        )}

        {/* Meal plan */}
        <AnimatePresence>
          {plan && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Totals */}
              <Card style={{ borderRadius: 16, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, marginBottom: 8 }}>TODAY'S PLAN TOTALS</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { l: 'Calories', v: plan.totalCalories, target: targetCalories, unit: 'kcal', color: '#FB923C' },
                    { l: 'Protein', v: plan.totalProtein, target: targetProtein, unit: 'g', color: theme.accent },
                  ].map(({ l, v, target, unit, color }) => {
                    const pct = Math.round((v / target) * 100);
                    return (
                      <div key={l} style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: theme.textDim }}>{l}</span>
                          <span style={{ fontSize: 11, fontFamily: theme.mono, color }}>{v}{unit}</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.8 }}
                            style={{ height: '100%', background: color, borderRadius: 2 }}
                          />
                        </div>
                        <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, marginTop: 2 }}>{pct}% of target</div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Meals */}
              {orderedMeals.map((meal, i) => {
                const isLogged = logged.has(meal.meal);
                return (
                  <motion.div
                    key={meal.meal}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.cardBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icon name={MEAL_ICONS[meal.meal] ?? 'utensils'} size={22} color={MEAL_COLORS[meal.meal] ?? '#FB923C'} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1, textTransform: 'uppercase' }}>{meal.meal}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>{meal.name}</div>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => !isLogged && logMeal(meal)}
                            style={{
                              padding: '6px 12px', borderRadius: 10, border: 'none', cursor: isLogged ? 'default' : 'pointer',
                              background: isLogged ? 'rgba(74,222,128,0.15)' : `${theme.accent}20`,
                              color: isLogged ? '#4ade80' : theme.accent,
                              fontSize: 11, fontWeight: 700,
                            }}
                          >
                            {isLogged ? '✓ Logged' : '+ Log'}
                          </motion.button>
                        </div>
                        <div style={{ fontSize: 12, color: theme.textDim, marginTop: 6, lineHeight: 1.4 }}>{meal.description}</div>
                      </div>

                      {/* Macros */}
                      <div style={{ padding: '10px 16px', display: 'flex', gap: 16, borderBottom: `1px solid ${theme.cardBorder}` }}>
                        {[
                          { l: 'Cal', v: meal.calories, unit: 'kcal', color: '#FB923C' },
                          { l: 'Pro', v: meal.protein, unit: 'g', color: theme.accent },
                          { l: 'Carb', v: meal.carbs, unit: 'g', color: theme.accent2 },
                          { l: 'Fat', v: meal.fat, unit: 'g', color: '#FBBF24' },
                        ].map(({ l, v, unit, color }) => (
                          <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>{l}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color }}>{v}</div>
                            <div style={{ fontSize: 8, color: theme.textMute }}>{unit}</div>
                          </div>
                        ))}
                      </div>

                      {/* Ingredients */}
                      <div style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {meal.ingredients.map((ing, j) => (
                            <div key={j} style={{
                              padding: '3px 8px', borderRadius: 8,
                              background: 'rgba(255,255,255,0.06)',
                              fontSize: 10, color: theme.textDim,
                            }}>
                              {ing}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Notes */}
              {plan.notes && (
                <div style={{
                  padding: '10px 14px', borderRadius: 14,
                  background: `${theme.accent}10`, border: `1px solid ${theme.accent}20`,
                  fontSize: 12, color: theme.textDim, lineHeight: 1.5,
                }}>
                  💡 {plan.notes}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Background>
  );
}
