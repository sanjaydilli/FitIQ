import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { indianFoods } from '../data/indianFoods';
import { calcNutrition, macroPct } from '../utils/foodCalculator';
import { useFoodLog, MealType } from '../hooks/useFoodLog';

export function FoodDetail() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // O(1) lookup — memoized once per id change instead of O(542) on every render
  const food = useMemo(() => indianFoods.find(f => f.id === id), [id]);

  const [searchParams] = useSearchParams();
  const mealParam = searchParams.get('meal');

  const { awardXP } = useUser();
  const { addEntry } = useFoodLog();

  const [servingIdx, setServingIdx]   = useState(0);
  const [cookingIdx, setCookingIdx]   = useState(0);
  const [multiplier, setMultiplier]   = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(() => {
    const valid: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
    return valid.includes(mealParam as MealType) ? (mealParam as MealType) : 'lunch';
  });
  const [loggedKey, setLoggedKey] = useState<string | null>(null);

  // Memoize all nutrition calculations — only recompute when inputs change
  const { serving, cooking, nutrition, pct } = useMemo(() => {
    if (!food) return { serving: null, cooking: null, nutrition: null, pct: null };
    const s = food.servingSizes[servingIdx] ?? food.servingSizes[0];
    const c = food.cookingMethods[cookingIdx] ?? food.cookingMethods[0];
    const n = calcNutrition(food, {
      grams: s.grams * multiplier,
      calorieModifier: c.calorieModifier * multiplier,
      fatModifier: c.fatModifier * multiplier,
    });
    return { serving: s, cooking: c, nutrition: n, pct: macroPct(n) };
  }, [food, servingIdx, cookingIdx, multiplier]);

  if (!food || !serving || !cooking || !nutrition || !pct) {
    return (
      <Background>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textMute }}>
          Food not found
        </div>
      </Background>
    );
  }

  const dot = food.isVegan ? '#5EEAD4' : food.isVegetarian ? '#4ade80' : '#F87171';
  const dotLabel = food.isVegan ? 'Vegan' : food.isVegetarian ? 'Vegetarian' : 'Non-veg';

  return (
    <Background>
      <div style={{ height: '100%', overflowY: 'auto', padding: '52px 0 40px' }}>

        {/* Header */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 10, cursor: 'pointer', color: theme.textMute, fontSize: 12 }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2L4 6l4 4" /></svg>
            Back
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, marginBottom: 3 }}>
                {food.grup.toUpperCase()}
              </div>
              <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 4 }}>
                {food.name}
              </div>
              {(food.nameHindi || food.nameTamil) && (
                <div style={{ fontSize: 11, color: theme.textMute }}>
                  {[food.nameHindi, food.nameTamil, food.nameKannada].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, boxShadow: `0 0 6px ${dot}80` }} />
                <span style={{ fontSize: 10, color: dot, fontFamily: theme.mono, fontWeight: 700 }}>{dotLabel}</span>
              </div>
              <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>{food.region}</div>
            </div>
          </div>
        </div>

        {/* Calorie hero */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <Card style={{ padding: 18, borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 50%, ${theme.accent}20, transparent 60%)` }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, marginBottom: 4 }}>
                {serving.name} {multiplier > 1 ? `× ${multiplier}` : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                <motion.div
                  key={nutrition.calories}
                  initial={{ scale: 0.88, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    fontSize: 56, fontWeight: 800, letterSpacing: -2, lineHeight: 1,
                    fontFeatureSettings: '"tnum"',
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}
                >
                  {nutrition.calories}
                </motion.div>
                <div style={{ color: theme.textDim, fontSize: 14 }}>kcal</div>
              </div>

              {/* Macro bar */}
              <div style={{ display: 'flex', gap: 2, height: 6, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <motion.div animate={{ width: `${pct.carbPct}%` }} style={{ background: '#FB923C', height: '100%', borderRadius: 2 }} />
                <motion.div animate={{ width: `${pct.protPct}%` }} style={{ background: theme.accent, height: '100%', borderRadius: 2 }} />
                <motion.div animate={{ width: `${pct.fatPct}%` }} style={{ background: theme.accent2, height: '100%', borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Carbs', value: `${nutrition.carbs}g`, color: '#FB923C', pct: pct.carbPct },
                  { label: 'Protein', value: `${nutrition.protein}g`, color: theme.accent, pct: pct.protPct },
                  { label: 'Fat', value: `${nutrition.fat}g`, color: theme.accent2, pct: pct.fatPct },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>{m.label} {m.pct}%</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{nutrition.fiber}g</div>
                  <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>Fiber</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Serving selector */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>SERVING SIZE</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {food.servingSizes.map((s, i) => (
              <motion.div
                key={i}
                whileTap={{ scale: 0.94 }}
                onClick={() => setServingIdx(i)}
                style={{
                  padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', fontFamily: theme.mono,
                  background: servingIdx === i ? theme.accent : theme.card,
                  color: servingIdx === i ? theme.onAccent : theme.textDim,
                  border: `1px solid ${servingIdx === i ? theme.accent : theme.cardBorder}`,
                  boxShadow: servingIdx === i ? `0 4px 12px ${theme.accent}33` : 'none',
                }}
              >
                {s.name}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Multiplier */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>QUANTITY</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {[0.5, 1, 1.5, 2, 2.5, 3].map(m => (
              <motion.div
                key={m}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMultiplier(m)}
                style={{
                  width: 40, height: 36, borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: theme.mono,
                  background: multiplier === m ? theme.accent2 : theme.card,
                  color: multiplier === m ? theme.onAccent : theme.textDim,
                  border: `1px solid ${multiplier === m ? theme.accent2 : theme.cardBorder}`,
                  boxShadow: multiplier === m ? `0 4px 12px ${theme.accent2}33` : 'none',
                }}
              >
                {m}×
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cooking method */}
        {food.cookingMethods.length > 1 && (
          <div style={{ padding: '0 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>COOKING METHOD</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {food.cookingMethods.map((c, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCookingIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                    background: cookingIdx === i ? `${theme.warn}18` : theme.card,
                    border: `1px solid ${cookingIdx === i ? theme.warn + '50' : theme.cardBorder}`,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: cookingIdx === i ? 700 : 400, color: cookingIdx === i ? theme.warn : theme.textDim }}>
                    {c.method}
                  </span>
                  {c.calorieModifier > 0 && (
                    <span style={{ fontSize: 10, color: theme.warn, fontFamily: theme.mono }}>
                      +{c.calorieModifier} kcal
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Micronutrients */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>MICRONUTRIENTS</div>
          <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
            {[
              { label: 'Iron',       value: `${nutrition.iron} mg`,      pct: Math.min(nutrition.iron / (18) * 100, 100),    color: '#F87171' },
              { label: 'Calcium',    value: `${nutrition.calcium} mg`,   pct: Math.min(nutrition.calcium / 1000 * 100, 100), color: '#A78BFA' },
              { label: 'Magnesium',  value: `${nutrition.magnesium} mg`, pct: Math.min(nutrition.magnesium / 400 * 100, 100),color: '#5EEAD4' },
              { label: 'Zinc',       value: `${nutrition.zinc} mg`,      pct: Math.min(nutrition.zinc / 11 * 100, 100),      color: '#FBBF24' },
              { label: 'Vitamin C',  value: `${nutrition.vitaminC} mg`,  pct: Math.min(nutrition.vitaminC / 90 * 100, 100),  color: '#FB923C' },
              { label: 'Omega-3',    value: `${nutrition.omega3} g`,     pct: Math.min(nutrition.omega3 / 1.6 * 100, 100),   color: '#60A5FA' },
              { label: 'Potassium',  value: `${nutrition.potassium} mg`, pct: Math.min(nutrition.potassium / 3500 * 100, 100), color: '#4ade80' },
              { label: 'Sodium',     value: `${nutrition.sodium} mg`,    pct: Math.min(nutrition.sodium / 2300 * 100, 100),  color: '#94a3b8' },
            ].map((m, i, arr) => (
              <div
                key={m.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                }}
              >
                <div style={{ width: 74, fontSize: 11, color: theme.textDim }}>{m.label}</div>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', background: m.color, borderRadius: 2 }}
                  />
                </div>
                <div style={{ width: 70, textAlign: 'right', fontSize: 11, fontFamily: theme.mono, color: theme.text }}>{m.value}</div>
              </div>
            ))}
          </Card>
        </div>

        {/* Meal type selector */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>LOG AS</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map(m => (
              <motion.div
                key={m}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedMeal(m)}
                style={{
                  flex: 1, padding: '7px 4px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  textAlign: 'center', cursor: 'pointer', fontFamily: theme.mono, textTransform: 'capitalize',
                  background: selectedMeal === m ? theme.accent : theme.card,
                  color: selectedMeal === m ? theme.onAccent : theme.textDim,
                  border: `1px solid ${selectedMeal === m ? theme.accent : theme.cardBorder}`,
                  boxShadow: selectedMeal === m ? `0 4px 12px ${theme.accent}33` : 'none',
                }}
              >
                {m === 'breakfast' ? '🌅' : m === 'lunch' ? '☀️' : m === 'snack' ? '🥜' : '🌙'}<br />{m}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Log button */}
        <div style={{ padding: '0 20px 20px' }}>
          <AnimatePresence mode="wait">
            {loggedKey === `${selectedMeal}-${nutrition.calories}` ? (
              <motion.div
                key="logged"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 16,
                  background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
                  color: '#4ade80', fontSize: 15, fontWeight: 800,
                  textAlign: 'center', fontFamily: theme.font,
                }}
              >
                ✓ Logged to {selectedMeal}
              </motion.div>
            ) : (
              <motion.button
                key="log"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!nutrition || !serving) return;
                  addEntry({
                    meal: selectedMeal,
                    name: food.name,
                    calories: nutrition.calories,
                    protein: nutrition.protein,
                    carbs: nutrition.carbs,
                    fat: nutrition.fat,
                    grams: serving.grams * multiplier,
                  });
                  awardXP(10);
                  setLoggedKey(`${selectedMeal}-${nutrition.calories}`);
                  setTimeout(() => navigate(`/food${mealParam ? `?meal=${selectedMeal}` : ''}`), 1500);
                }}
                style={{
                  width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                  color: theme.onAccent, fontSize: 15, fontWeight: 800,
                  cursor: 'pointer', fontFamily: theme.font,
                  boxShadow: `0 8px 24px ${theme.accent}38, inset 0 1px 0 rgba(255,255,255,0.18)`,
                }}
              >
                + Log {serving.name} · {nutrition.calories} kcal
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Background>
  );
}
