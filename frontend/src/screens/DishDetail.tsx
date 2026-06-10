import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { RECIPES } from '../data/recipes';
import { useFoodLog, MealType } from '../hooks/useFoodLog';
import { useUser } from '../context/UserContext';

// Standard Indian household measures → grams of cooked dish
const MEASURES = [
  { id: 'serve',  label: 'Serve',  grams: 0 },      // 0 → use dish.gramsPerServing
  { id: 'katori', label: 'Katori', grams: 100 },
  { id: 'bowl',   label: 'Bowl',   grams: 233 },
  { id: 'cup',    label: 'Cup',    grams: 166 },
  { id: 'oz',     label: 'Oz',     grams: 28.4 },
  { id: 'grams',  label: 'Grams',  grams: 1 },
] as const;
type MeasureId = typeof MEASURES[number]['id'];

const QTY_STEP: Record<MeasureId, number> = {
  serve: 0.5, katori: 0.5, bowl: 0.5, cup: 0.5, oz: 0.5, grams: 10,
};

export function DishDetail() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mealParam = searchParams.get('meal') ?? '';
  const { addEntry } = useFoodLog();
  const { awardXP } = useUser();

  const dish = useMemo(() => RECIPES.find(r => r.id === id) ?? null, [id]);

  const [qty, setQty] = useState(1);
  const [measure, setMeasure] = useState<MeasureId>('serve');
  const [added, setAdded] = useState(false);

  if (!dish) {
    return (
      <Background>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: theme.textMute, fontSize: 14 }}>
          Dish not found.
          <div onClick={() => navigate(-1)} style={{ color: theme.accent, marginTop: 12, cursor: 'pointer', fontWeight: 700 }}>← Go back</div>
        </div>
      </Background>
    );
  }

  const meal: MealType = (['breakfast', 'lunch', 'snack', 'dinner'].includes(mealParam)
    ? mealParam : 'lunch') as MealType;

  const serveGrams = dish.gramsPerServing > 0 ? dish.gramsPerServing : 150;
  const measureDef = MEASURES.find(m => m.id === measure)!;
  const measureGrams = measureDef.grams === 0 ? serveGrams : measureDef.grams;
  const netWt = qty * measureGrams;

  // Per-gram macros from the IFCT-derived per-serving values
  const perGram = {
    calories: dish.caloriesPerServing / serveGrams,
    protein:  dish.proteinPerServing  / serveGrams,
    carbs:    dish.carbsPerServing    / serveGrams,
    fat:      dish.fatPerServing      / serveGrams,
    fiber:    dish.fiberPerServing    / serveGrams,
  };
  const scaled = {
    calories: Math.round(perGram.calories * netWt),
    protein:  +(perGram.protein * netWt).toFixed(1),
    carbs:    +(perGram.carbs   * netWt).toFixed(1),
    fat:      +(perGram.fat     * netWt).toFixed(1),
    fiber:    +(perGram.fiber   * netWt).toFixed(1),
  };

  const step = QTY_STEP[measure];
  const dot = dish.isVegetarian ? '#16A34A' : '#DC2626';

  const handleAdd = () => {
    addEntry({
      meal,
      name: `${dish.name} (${qty} ${measureDef.label.toLowerCase()})`,
      calories: scaled.calories,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fat: scaled.fat,
    });
    awardXP(10);
    setAdded(true);
    setTimeout(() => navigate(-1), 700);
  };

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="scroll-y" style={{ flex: 1, overflowY: 'auto', padding: '56px 20px 120px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              style={{ background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Icon name="chevron-left" size={16} color={theme.text} />
            </motion.button>
            <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2 }}>
              ADD TO {meal.toUpperCase()}
            </div>
          </div>

          {/* Dish hero */}
          <Card style={{ padding: '18px 20px', borderRadius: 22, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle at 85% 15%, ${dot}1c, transparent 60%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}90`, flexShrink: 0 }} />
                <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2 }}>
                  {dish.isVegetarian ? 'VEG' : 'NON-VEG'} · IFCT 2017 DERIVED
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>{dish.name}</div>
              <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono, marginTop: 4 }}>
                Recipe makes {dish.servings} servings · ~{serveGrams}g each
              </div>
            </div>
          </Card>

          {/* Quantity + Measure */}
          <Card style={{ padding: '14px 16px', borderRadius: 20, marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 700, marginBottom: 8 }}>QUANTITY</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {(['−', '+'] as const).map((s, i) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setQty(q => Math.max(step, +(q + (i === 0 ? -step : step)).toFixed(2)))}
                      style={{
                        width: 32, height: 32, borderRadius: 10, border: `1px solid ${theme.cardBorder}`,
                        background: 'rgba(15,23,42,0.06)', color: theme.text,
                        fontSize: 16, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        order: i === 0 ? 0 : 2,
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                  <div style={{
                    order: 1, flex: 1, textAlign: 'center',
                    fontSize: 18, fontWeight: 800, fontFamily: theme.mono, fontFeatureSettings: '"tnum"',
                  }}>
                    {qty}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 700, marginBottom: 8 }}>MEASURE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {MEASURES.map(m => (
                    <motion.div
                      key={m.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => { setMeasure(m.id); setQty(m.id === 'grams' ? 100 : 1); }}
                      style={{
                        padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: measure === m.id ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : 'rgba(15,23,42,0.05)',
                        color: measure === m.id ? theme.onAccent : theme.textDim,
                        border: measure === m.id ? 'none' : `1px solid ${theme.cardBorder}`,
                      }}
                    >
                      {m.label}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Macros breakdown */}
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>
            MACRONUTRIENT BREAKDOWN
          </div>
          <Card style={{ padding: '16px 18px', borderRadius: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2 }}>CALORIES · RECIPE AVERAGE</div>
              <div style={{
                fontSize: 10, fontFamily: theme.mono, fontWeight: 700, color: theme.textDim,
                background: 'rgba(15,23,42,0.06)', border: `1px solid ${theme.cardBorder}`,
                borderRadius: 8, padding: '3px 8px',
              }}>
                NET WT: {netWt < 10 ? netWt.toFixed(1) : Math.round(netWt)} g
              </div>
            </div>
            <motion.div
              key={scaled.calories}
              initial={{ scale: 0.95, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              style={{
                fontSize: 40, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1,
                fontFamily: theme.mono, fontFeatureSettings: '"tnum"', marginBottom: 12,
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              {scaled.calories} <span style={{ fontSize: 18 }}>kcal</span>
            </motion.div>

            <div style={{ borderTop: `1px solid ${theme.cardBorder}`, paddingTop: 4 }}>
              {[
                { l: 'Protein', v: `${scaled.protein} g`, icon: 'utensils' as const, c: theme.accent },
                { l: 'Fats',    v: `${scaled.fat} g`,     icon: 'flame' as const,    c: '#D97706' },
                { l: 'Carbs',   v: `${scaled.carbs} g`,   icon: 'leaf' as const,     c: '#EA580C' },
                { l: 'Fiber',   v: `${scaled.fiber} g`,   icon: 'leaf' as const,     c: '#16A34A' },
              ].map((m, i, a) => (
                <div key={m.l} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                  borderBottom: i < a.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                    background: `${m.c}14`, border: `1px solid ${m.c}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={m.icon} size={14} color={m.c} />
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{m.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.mono, fontFeatureSettings: '"tnum"' }}>{m.v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Ingredients */}
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>
            INGREDIENTS · FULL RECIPE ({dish.servings} SERVINGS)
          </div>
          <Card style={{ padding: '14px 16px', borderRadius: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {dish.ingredients.map((ing, ii) => (
                <span key={ii} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(15,23,42,0.05)', border: `1px solid ${theme.cardBorder}`,
                  color: theme.textDim,
                }}>
                  {[ing.amount, ing.unit, ing.ingredient].filter(Boolean).join(' ')}
                  {ing.grams > 0 && (
                    <span style={{ color: theme.textMute, fontFamily: theme.mono }}> ≈{ing.grams}g</span>
                  )}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Sticky Add button */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '14px 20px 28px',
          background: 'linear-gradient(to top, rgba(244,246,248,0.97), transparent)',
        }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            disabled={added}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
              background: added
                ? 'rgba(22,163,74,0.18)'
                : `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              color: added ? '#16A34A' : theme.onAccent,
              fontSize: 16, fontWeight: 800, cursor: 'pointer',
              boxShadow: added ? 'none' : `0 8px 24px ${theme.accent}40, inset 0 1px 0 rgba(15,23,42,0.2)`,
              fontFamily: theme.font,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? 'done' : 'add'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {added ? '✓ Added' : `Add · ${scaled.calories} kcal`}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </Background>
  );
}
