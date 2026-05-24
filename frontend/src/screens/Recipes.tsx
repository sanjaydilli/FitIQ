import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { RECIPES, Recipe } from '../data/recipes';
import { useFoodLog, MealType } from '../hooks/useFoodLog';

const FILTER_TABS = ['All', 'Vegetarian', 'Non-Veg'] as const;

export function Recipes() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const meal = (searchParams.get('meal') ?? 'lunch') as MealType;
  const { addEntry } = useFoodLog();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<typeof FILTER_TABS[number]>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [logged, setLogged] = useState<Set<string>>(new Set());

  const handleLog = useCallback((recipe: Recipe) => {
    addEntry({
      meal,
      name: recipe.name,
      calories: recipe.caloriesPerServing,
      protein: recipe.proteinPerServing,
      carbs: recipe.carbsPerServing,
      fat: recipe.fatPerServing,
    });
    setLogged(prev => new Set(prev).add(recipe.id));
  }, [addEntry, meal]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RECIPES.filter(r => {
      if (filter === 'Vegetarian' && !r.isVegetarian) return false;
      if (filter === 'Non-Veg' && r.isVegetarian) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, filter]);

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          padding: '52px 20px 0',
          flexShrink: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2.2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2 }}>
                {filtered.length} RECIPES
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>Indian Recipes</div>
            </div>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 14, padding: '8px 14px', marginBottom: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMute} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search recipes..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: theme.text, fontFamily: theme.font }}
            />
            {query && (
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => setQuery('')} style={{ cursor: 'pointer', color: theme.textMute, fontSize: 16 }}>×</motion.div>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {FILTER_TABS.map(tab => (
              <motion.div
                key={tab}
                whileTap={{ scale: 0.94 }}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: filter === tab ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : 'rgba(255,255,255,0.06)',
                  color: filter === tab ? theme.onAccent : theme.textDim,
                  border: filter === tab ? 'none' : `1px solid ${theme.cardBorder}`,
                }}
              >
                {tab}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recipe list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 100px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 60, color: theme.textMute, fontSize: 14 }}>
              No recipes found for "{query}"
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                expanded={expanded === recipe.id}
                onToggle={() => setExpanded(expanded === recipe.id ? null : recipe.id)}
                isLogged={logged.has(recipe.id)}
                onLog={() => handleLog(recipe)}
              />
            ))}
          </div>
        </div>
      </div>
      <TabBar />
    </Background>
  );
}

function RecipeCard({ recipe, expanded, onToggle, isLogged, onLog }: {
  recipe: Recipe;
  expanded: boolean;
  onToggle: () => void;
  isLogged: boolean;
  onLog: () => void;
}) {
  const { theme } = useTheme();

  return (
    <motion.div layout onClick={onToggle} style={{ cursor: 'pointer' }}>
      <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
        {/* Top row */}
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{recipe.name}</span>
              {recipe.isVegetarian && (
                <span style={{ fontSize: 8, background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 4, padding: '1px 5px', fontFamily: theme.mono }}>VEG</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: `${recipe.caloriesPerServing} kcal`, color: '#FB923C' },
                { label: `${recipe.proteinPerServing}g P`, color: theme.accent },
                { label: `${recipe.carbsPerServing}g C`, color: theme.accent2 },
                { label: `${recipe.fatPerServing}g F`, color: '#FBBF24' },
              ].map(m => (
                <span key={m.label} style={{ fontSize: 10, color: m.color, fontFamily: theme.mono, fontWeight: 700 }}>{m.label}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>{recipe.ingredients.length} ing</span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.textMute} strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Expanded ingredients */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 14px 12px', borderTop: `1px solid ${theme.cardBorder}` }}>
                <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1, marginBottom: 8, marginTop: 10 }}>
                  INGREDIENTS · {recipe.servings} SERVINGS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} style={{
                      padding: '4px 9px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${theme.cardBorder}`,
                      fontSize: 11, color: theme.textDim,
                    }}>
                      {ing.amount && <span style={{ color: theme.accent, fontFamily: theme.mono, marginRight: 3 }}>{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</span>}
                      {ing.ingredient}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <span style={{ fontSize: 10, color: '#4ade80', fontFamily: theme.mono }}>
                    Fiber: {recipe.fiberPerServing}g
                  </span>
                  <span style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
                    · per serving
                  </span>
                  <motion.button
                    whileTap={!isLogged ? { scale: 0.94 } : {}}
                    onClick={e => { e.stopPropagation(); if (!isLogged) onLog(); }}
                    style={{
                      marginLeft: 'auto',
                      padding: '5px 14px', borderRadius: 10, border: 'none',
                      background: isLogged ? 'rgba(74,222,128,0.15)' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                      color: isLogged ? '#4ade80' : theme.onAccent,
                      fontSize: 11, fontWeight: 700, cursor: isLogged ? 'default' : 'pointer',
                    }}
                  >
                    {isLogged ? '✓ Logged' : '+ Log Meal'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
