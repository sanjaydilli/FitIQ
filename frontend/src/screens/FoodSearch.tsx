import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { indianFoods, FOOD_CATEGORIES, IndianFood } from '../data/indianFoods';
import { searchFoods, filterFoods } from '../utils/foodCalculator';

const DIET_FILTERS = [
  { id: 'all',  label: 'All' },
  { id: 'veg',  label: 'Veg' },
  { id: 'vegan',label: 'Vegan' },
  { id: 'gf',   label: 'GF' },
] as const;
type DietFilter = typeof DIET_FILTERS[number]['id'];

export function FoodSearch() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery]           = useState('');
  const [category, setCategory]     = useState('');
  const [diet, setDiet]             = useState<DietFilter>('all');

  const results = useMemo(() => {
    const filtered = filterFoods(indianFoods, {
      category:        category || undefined,
      vegetarianOnly:  diet === 'veg' || diet === 'vegan',
      veganOnly:       diet === 'vegan',
      glutenFreeOnly:  diet === 'gf',
    });
    return searchFoods(filtered, query, 60);
  }, [query, category, diet]);

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '56px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <motion.div
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              style={{ cursor: 'pointer', color: theme.textMute, fontSize: 22, lineHeight: 1 }}
            >
              ‹
            </motion.div>
            <div>
              <div style={{ fontSize: 9, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2.5 }}>
                IFCT 2017 · 542 FOODS
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>Food Search</div>
            </div>
          </div>

          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: theme.cardHi,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: theme.radiusSm,
              padding: '0 14px',
              marginBottom: 10,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textMute} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search dal, rice, paneer…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: theme.text, padding: '12px 0',
                fontFamily: theme.font,
              }}
            />
            {query && (
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuery('')}
                style={{ cursor: 'pointer', color: theme.textMute, fontSize: 18, lineHeight: 1 }}
              >
                ×
              </motion.div>
            )}
          </div>

          {/* Diet filter pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto' }}>
            {DIET_FILTERS.map(f => (
              <motion.div
                key={f.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setDiet(f.id)}
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: theme.mono,
                  cursor: 'pointer',
                  background: diet === f.id ? theme.accent : theme.card,
                  color: diet === f.id ? theme.onAccent : theme.textDim,
                  border: `1px solid ${diet === f.id ? theme.accent : theme.cardBorder}`,
                  letterSpacing: 0.5,
                }}
              >
                {f.label}
              </motion.div>
            ))}
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, marginBottom: 10 }}>
            <motion.div
              whileTap={{ scale: 0.94 }}
              onClick={() => setCategory('')}
              style={{
                flexShrink: 0, padding: '4px 10px', borderRadius: 20,
                fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: theme.mono,
                background: !category ? `${theme.accent2}28` : theme.card,
                color: !category ? theme.accent2 : theme.textMute,
                border: `1px solid ${!category ? theme.accent2 + '60' : theme.cardBorder}`,
              }}
            >
              All
            </motion.div>
            {FOOD_CATEGORIES.map(c => (
              <motion.div
                key={c.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setCategory(category === c.id ? '' : c.id)}
                style={{
                  flexShrink: 0, padding: '4px 10px', borderRadius: 20,
                  fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: theme.mono,
                  background: category === c.id ? `${theme.accent2}28` : theme.card,
                  color: category === c.id ? theme.accent2 : theme.textMute,
                  border: `1px solid ${category === c.id ? theme.accent2 + '60' : theme.cardBorder}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {c.label}
              </motion.div>
            ))}
          </div>

          {/* Result count */}
          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginBottom: 6 }}>
            {results.length} results
          </div>
        </div>

        {/* Results list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 110px' }}>
          <AnimatePresence mode="popLayout">
            {results.map((food, i) => (
              <FoodRow
                key={food.id}
                food={food}
                index={i}
                onClick={() => navigate(`/food/${food.id}`)}
              />
            ))}
          </AnimatePresence>
          {results.length === 0 && (
            <div style={{ textAlign: 'center', color: theme.textMute, fontSize: 13, paddingTop: 48 }}>
              No results for "{query}"
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </Background>
  );
}

function FoodRow({ food, index, onClick }: { food: IndianFood; index: number; onClick: () => void }) {
  const { theme } = useTheme();
  const def = food.servingSizes.find(s => s.isDefault) ?? food.servingSizes[0];
  const servingCal = Math.round(food.per100g.calories * (def?.grams ?? 100) / 100);

  const dot =
    food.isVegan ? '#5EEAD4'
    : food.isVegetarian ? '#4ade80'
    : '#F87171';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.018, 0.3), duration: 0.22 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 0',
        borderBottom: `1px solid ${theme.cardBorder}`,
        cursor: 'pointer',
      }}
    >
      {/* Veg dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: dot, flexShrink: 0,
        boxShadow: `0 0 6px ${dot}80`,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {food.name}
        </div>
        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
          {food.grup}
          {food.nameHindi ? ` · ${food.nameHindi}` : ''}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.mono, color: theme.accent }}>
          {food.per100g.calories}
        </div>
        <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>kcal/100g</div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, fontFamily: theme.mono }}>
          {food.per100g.protein}g
        </div>
        <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>protein</div>
      </div>

      <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke={theme.textMute} strokeWidth="1.8" strokeLinecap="round">
        <path d="M4.5 2.5L8 6l-3.5 3.5" />
      </svg>
    </motion.div>
  );
}
