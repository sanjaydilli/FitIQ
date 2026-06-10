import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { indianFoods, IndianFood } from '../data/indianFoods';
import { searchFoods, calcNutrition, sumNutrition, macroPct, NutritionResult } from '../utils/foodCalculator';
import { useCustomRecipes } from '../hooks/useCustomRecipes';

interface Ingredient {
  food: IndianFood;
  grams: number;
}

export function CustomRecipe() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { addRecipe } = useCustomRecipes();
  const inputRef = useRef<HTMLInputElement>(null);

  const [recipeName, setRecipeName]     = useState('');
  const [query, setQuery]               = useState('');
  const [ingredients, setIngredients]   = useState<Ingredient[]>([]);
  const [servings, setServings]         = useState(1);
  const [editingGrams, setEditingGrams] = useState<number | null>(null);
  const [saved, setSaved]               = useState(false);

  const searchResults = useMemo(() =>
    query.trim().length >= 2 ? searchFoods(indianFoods, query, 20) : [],
    [query]
  );

  const totals: NutritionResult = useMemo(() => {
    const items = ingredients.map(ing =>
      calcNutrition(ing.food, { grams: ing.grams, calorieModifier: 0, fatModifier: 0 })
    );
    return sumNutrition(items);
  }, [ingredients]);

  const perServing: NutritionResult = useMemo(() => ({
    calories:  Math.round(totals.calories  / servings),
    protein:   Math.round(totals.protein   / servings * 10) / 10,
    carbs:     Math.round(totals.carbs     / servings * 10) / 10,
    fat:       Math.round(totals.fat       / servings * 10) / 10,
    fiber:     Math.round(totals.fiber     / servings * 10) / 10,
    iron:      Math.round(totals.iron      / servings * 100) / 100,
    calcium:   Math.round(totals.calcium   / servings * 10) / 10,
    vitaminC:  Math.round(totals.vitaminC  / servings * 10) / 10,
    magnesium: Math.round(totals.magnesium / servings * 10) / 10,
    zinc:      Math.round(totals.zinc      / servings * 100) / 100,
    potassium: Math.round(totals.potassium / servings * 10) / 10,
    sodium:    Math.round(totals.sodium    / servings * 10) / 10,
    omega3:    Math.round(totals.omega3    / servings * 1000) / 1000,
  }), [totals, servings]);

  const pct = macroPct(perServing);

  function addIngredient(food: IndianFood) {
    const defaultServing = food.servingSizes.find(s => s.isDefault) ?? food.servingSizes[0];
    setIngredients(prev => {
      const existing = prev.findIndex(i => i.food.id === food.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], grams: next[existing].grams + defaultServing.grams };
        return next;
      }
      return [...prev, { food, grams: defaultServing.grams }];
    });
    setQuery('');
    inputRef.current?.focus();
  }

  function updateGrams(idx: number, grams: number) {
    if (grams <= 0) return removeIngredient(idx);
    setIngredients(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], grams };
      return next;
    });
  }

  function removeIngredient(idx: number) {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
    if (editingGrams === idx) setEditingGrams(null);
  }

  function handleSave() {
    if (ingredients.length === 0 || !recipeName.trim()) return;
    addRecipe({
      name: recipeName.trim(),
      servings,
      perServing: {
        calories: perServing.calories,
        protein: perServing.protein,
        carbs: perServing.carbs,
        fat: perServing.fat,
        fiber: perServing.fiber,
      },
      ingredientCount: ingredients.length,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate(-1); }, 1200);
  }

  const totalGrams = ingredients.reduce((s, i) => s + i.grams, 0);

  return (
    <Background>
      <div style={{ height: '100%', overflowY: 'auto', padding: '52px 0 40px' }}>

        {/* Header */}
        <div style={{ padding: '0 20px', marginBottom: 16, position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: '-12px 0 0 0',
            background: `radial-gradient(ellipse at 80% 0%, ${theme.accent2}1c, transparent 60%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <motion.div
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              style={{ cursor: 'pointer', background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', color: theme.text, display: 'flex', alignItems: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </motion.div>
            <div>
              <div style={{ fontSize: 10, color: theme.accent2, fontFamily: theme.mono, letterSpacing: 2.2, fontWeight: 700, textTransform: 'uppercase' }}>Recipe Builder</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6, marginTop: 2 }}>Custom Recipe</div>
            </div>
          </div>

          {/* Recipe name input */}
          <input
            value={recipeName}
            onChange={e => setRecipeName(e.target.value)}
            placeholder="Recipe name (e.g. Dal Tadka, Palak Paneer…)"
            style={{
              position: 'relative',
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(15,23,42,0.04)', border: `1px solid ${theme.cardBorder}`,
              borderRadius: 14, padding: '12px 14px',
              fontSize: 14, color: theme.text, outline: 'none',
              fontFamily: theme.font, marginBottom: 10,
              boxShadow: 'inset 0 1px 0 rgba(15,23,42,0.04)',
            }}
          />
        </div>

        {/* Live totals card */}
        {ingredients.length > 0 && (
          <div style={{ padding: '0 20px', marginBottom: 14 }}>
            <Card style={{ padding: 16, borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 50%, ${theme.accent2}18, transparent 60%)` }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, marginBottom: 3, fontWeight: 700, textTransform: 'uppercase' }}>
                      Per serving · {totalGrams}g total
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <motion.span
                        key={perServing.calories}
                        initial={{ scale: 0.88 }}
                        animate={{ scale: 1 }}
                        style={{
                          fontSize: 42, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
                          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {perServing.calories}
                      </motion.span>
                      <span style={{ color: theme.textDim, fontSize: 13 }}>kcal</span>
                    </div>
                  </div>

                  {/* Servings selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, fontWeight: 700, textTransform: 'uppercase' }}>Servings</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <motion.div whileTap={{ scale: 0.88 }} onClick={() => setServings(s => Math.max(1, s - 1))}
                        style={{ width: 26, height: 26, borderRadius: 8, background: theme.cardHi, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>
                        −
                      </motion.div>
                      <span style={{ fontSize: 18, fontWeight: 800, fontFamily: theme.mono, minWidth: 20, textAlign: 'center' }}>{servings}</span>
                      <motion.div whileTap={{ scale: 0.88 }} onClick={() => setServings(s => s + 1)}
                        style={{ width: 26, height: 26, borderRadius: 8, background: theme.cardHi, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>
                        +
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Macro bar */}
                <div style={{ display: 'flex', gap: 2, height: 6, borderRadius: 4, overflow: 'hidden', marginBottom: 8, boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.25)' }}>
                  <motion.div animate={{ width: `${pct.carbPct}%` }} style={{ background: '#EA580C', height: '100%' }} />
                  <motion.div animate={{ width: `${pct.protPct}%` }} style={{ background: theme.accent, height: '100%' }} />
                  <motion.div animate={{ width: `${pct.fatPct}%` }} style={{ background: theme.accent2, height: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { label: 'Carbs',   val: `${perServing.carbs}g`,   color: '#EA580C' },
                    { label: 'Protein', val: `${perServing.protein}g`, color: theme.accent },
                    { label: 'Fat',     val: `${perServing.fat}g`,     color: theme.accent2 },
                    { label: 'Fiber',   val: `${perServing.fiber}g`,   color: theme.textDim },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: m.color, fontFamily: theme.mono, letterSpacing: -0.2 }}>{m.val}</div>
                      <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.6, marginTop: 1, textTransform: 'uppercase' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Ingredient search */}
        <div style={{ padding: '0 20px', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>Add Ingredient</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(15,23,42,0.04)', border: `1px solid ${theme.cardBorder}`,
            borderRadius: 14, padding: '0 14px',
            boxShadow: 'inset 0 1px 0 rgba(15,23,42,0.04)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMute} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search ingredient…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: theme.text, padding: '10px 0', fontFamily: theme.font,
              }}
            />
            {query && (
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => setQuery('')}
                style={{ cursor: 'pointer', color: theme.textMute, fontSize: 18, lineHeight: 1 }}>×</motion.div>
            )}
          </div>
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ padding: '0 20px', marginBottom: 14 }}
            >
              <Card style={{ borderRadius: 14, overflow: 'hidden' }}>
                {searchResults.slice(0, 8).map((food, i) => (
                  <motion.div
                    key={food.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addIngredient(food)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 14px', cursor: 'pointer',
                      borderBottom: i < Math.min(searchResults.length, 8) - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                    }}
                  >
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: food.isVegan ? '#0E9384' : food.isVegetarian ? '#16A34A' : '#DC2626',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{food.name}</div>
                      <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>{food.grup}</div>
                    </div>
                    <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono }}>{food.per100g.calories} kcal/100g</div>
                    <div style={{ fontSize: 18, color: theme.accent, lineHeight: 1 }}>+</div>
                  </motion.div>
                ))}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ingredient list */}
        {ingredients.length > 0 && (
          <div style={{ padding: '0 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              Ingredients ({ingredients.length})
            </div>
            <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
              <AnimatePresence>
                {ingredients.map((ing, idx) => {
                  const ingNutr = calcNutrition(ing.food, { grams: ing.grams, calorieModifier: 0, fatModifier: 0 });
                  const isEditing = editingGrams === idx;
                  return (
                    <motion.div
                      key={ing.food.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                        borderBottom: idx < ingredients.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ing.food.name}
                        </div>
                        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
                          {ingNutr.calories} kcal · {ingNutr.protein}g P · {ingNutr.carbs}g C · {ingNutr.fat}g F
                        </div>
                      </div>

                      {/* Gram editor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <motion.div whileTap={{ scale: 0.88 }} onClick={() => updateGrams(idx, ing.grams - 10)}
                          style={{ width: 24, height: 24, borderRadius: 6, background: theme.cardHi, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: theme.textDim }}>
                          −
                        </motion.div>
                        {isEditing ? (
                          <input
                            autoFocus
                            type="number"
                            defaultValue={ing.grams}
                            onBlur={e => { updateGrams(idx, Number(e.target.value)); setEditingGrams(null); }}
                            style={{
                              width: 44, textAlign: 'center', background: theme.cardHi,
                              border: `1px solid ${theme.accent}`, borderRadius: 6, padding: '2px 4px',
                              fontSize: 12, color: theme.text, fontFamily: theme.mono, outline: 'none',
                            }}
                          />
                        ) : (
                          <motion.div whileTap={{ scale: 0.9 }} onClick={() => setEditingGrams(idx)}
                            style={{ minWidth: 40, textAlign: 'center', fontSize: 12, fontFamily: theme.mono, cursor: 'pointer', color: theme.text }}>
                            {ing.grams}g
                          </motion.div>
                        )}
                        <motion.div whileTap={{ scale: 0.88 }} onClick={() => updateGrams(idx, ing.grams + 10)}
                          style={{ width: 24, height: 24, borderRadius: 6, background: theme.cardHi, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: theme.textDim }}>
                          +
                        </motion.div>
                      </div>

                      {/* Remove */}
                      <motion.div whileTap={{ scale: 0.88 }} onClick={() => removeIngredient(idx)}
                        style={{ color: theme.danger, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>
                        ×
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Card>
          </div>
        )}

        {/* Empty state */}
        {ingredients.length === 0 && (
          <div style={{ padding: '0 20px', textAlign: 'center', paddingTop: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🥘</div>
            <div style={{ fontSize: 13, color: theme.textMute }}>Search and add ingredients above</div>
            <div style={{ fontSize: 11, color: theme.textMute, marginTop: 4 }}>Macros calculate live as you add</div>
          </div>
        )}

        {/* Save button */}
        {ingredients.length > 0 && (() => {
          const canSave = recipeName.trim().length > 0;
          const inactive = saved || !canSave;
          return (
            <div style={{ padding: '0 20px 20px' }}>
              <motion.button
                whileTap={canSave && !saved ? { scale: 0.96 } : {}}
                whileHover={canSave && !saved ? { y: -1 } : {}}
                transition={{ type: 'spring' as const, stiffness: 420, damping: 26 }}
                onClick={handleSave}
                disabled={inactive}
                style={{
                  width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
                  background: saved
                    ? `${theme.accent}40`
                    : canSave
                      ? `linear-gradient(135deg, ${theme.accent2}, ${theme.accent})`
                      : 'rgba(15,23,42,0.06)',
                  color: saved ? theme.accent : canSave ? theme.onAccent : theme.textMute,
                  fontSize: 15, fontWeight: 800, cursor: inactive ? 'default' : 'pointer',
                  fontFamily: theme.font, letterSpacing: -0.1,
                  boxShadow: canSave && !saved ? `0 8px 24px ${theme.accent}38, 0 2px 6px ${theme.accent}1c, inset 0 1px 0 rgba(15,23,42,0.18)` : 'none',
                }}
              >
                {saved
                  ? `✓ Saved — ${perServing.calories} kcal/serving`
                  : canSave
                    ? `Save Recipe · ${perServing.calories} kcal per serving`
                    : 'Enter a recipe name to save'}
              </motion.button>
            </div>
          );
        })()}
      </div>
    </Background>
  );
}
