import React, { memo, useMemo, useCallback, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { TabBar } from '../components/TabBar';
import { Icon } from '../components/Icon';
import { RECIPES, Recipe } from '../data/recipes';
import { useCustomRecipes, SavedRecipe } from '../hooks/useCustomRecipes';
import { useFoodLog, MealType } from '../hooks/useFoodLog';
import { useUser } from '../context/UserContext';

const DIET_FILTERS = [
  { id: 'all',  label: 'All' },
  { id: 'veg',  label: 'Veg' },
  { id: 'nveg', label: 'Non-Veg' },
] as const;
type DietFilter = typeof DIET_FILTERS[number]['id'];

const RESULT_LIMIT = 60;

export function FoodSearch() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mealParam = searchParams.get('meal') ?? '';
  const inputRef = useRef<HTMLInputElement>(null);
  const { recipes } = useCustomRecipes();
  const { addEntry } = useFoodLog();
  const { awardXP } = useUser();

  const [query, setQuery] = useState('');
  const [diet, setDiet]   = useState<DietFilter>('all');
  const [loggedIds, setLoggedIds]   = useState<Set<string>>(new Set());

  const meal: MealType = (['breakfast', 'lunch', 'snack', 'dinner'].includes(mealParam)
    ? mealParam
    : 'lunch') as MealType;

  const markLogged = useCallback((id: string) => {
    setLoggedIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setLoggedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  }, []);

  const handleLogDish = useCallback((dish: Recipe) => {
    addEntry({
      meal,
      name: dish.name,
      calories: dish.caloriesPerServing,
      protein: dish.proteinPerServing,
      carbs: dish.carbsPerServing,
      fat: dish.fatPerServing,
    });
    awardXP(10);
    markLogged(dish.id);
  }, [meal, addEntry, awardXP, markLogged]);

  const handleLogRecipe = useCallback((recipe: SavedRecipe) => {
    addEntry({ meal, name: recipe.name, ...recipe.perServing });
    awardXP(10);
    markLogged(recipe.id);
  }, [meal, addEntry, awardXP, markLogged]);

  const filteredRecipes = useMemo(() =>
    query.trim().length >= 2
      ? recipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
      : recipes,
    [recipes, query]
  );

  // Dish search: name matches rank first, then dishes containing the
  // query as an ingredient (so "paneer" also finds Palak Paneer etc.)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = RECIPES.filter(r => {
      if (diet === 'veg'  && !r.isVegetarian) return false;
      if (diet === 'nveg' &&  r.isVegetarian) return false;
      return true;
    });
    if (!q) return pool.slice(0, RESULT_LIMIT);

    const nameHits: Recipe[] = [];
    const ingredientHits: Recipe[] = [];
    for (const r of pool) {
      if (r.name.toLowerCase().includes(q)) nameHits.push(r);
      else if (r.ingredients.some(ing => ing.ingredient.toLowerCase().includes(q))) ingredientHits.push(r);
      if (nameHits.length >= RESULT_LIMIT) break;
    }
    return [...nameHits, ...ingredientHits].slice(0, RESULT_LIMIT);
  }, [query, diet]);

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '56px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              style={{ background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Icon name="chevron-left" size={16} color={theme.text} />
            </motion.button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2.5 }}>
                {RECIPES.length.toLocaleString()} INDIAN DISHES
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                Add to {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate('/recipe')}
              style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}30`, borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: theme.accent }}
            >
              + Custom Recipe
            </motion.button>
          </div>

          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#FFFFFF',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 16,
              padding: '0 14px',
              marginBottom: 10,
              boxShadow: '0 1px 2px rgba(16,24,40,0.05), 0 4px 14px rgba(16,24,40,0.07)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textMute} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search biryani, dosa, paneer…"
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
                  background: diet === f.id ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : theme.card,
                  color: diet === f.id ? theme.onAccent : theme.textDim,
                  border: diet === f.id ? 'none' : `1px solid ${theme.cardBorder}`,
                  boxShadow: diet === f.id ? `0 4px 12px ${theme.accent}33` : 'none',
                  letterSpacing: 0.5,
                }}
              >
                {f.label}
              </motion.div>
            ))}
          </div>

          {/* Result count */}
          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginBottom: 6 }}>
            {results.length} dishes
          </div>
        </div>

        {/* Results list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 110px' }}>
          {/* Saved custom recipes */}
          {filteredRecipes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 1.5, marginBottom: 6 }}>MY RECIPES</div>
              <div style={{
                background: '#FFFFFF',
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 18,
                padding: '2px 14px',
                boxShadow: '0 1px 2px rgba(16,24,40,0.05), 0 4px 14px rgba(16,24,40,0.06)',
              }}>
              {filteredRecipes.map((recipe, ri) => (
                <div key={recipe.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: ri < filteredRecipes.length - 1 ? `1px solid ${theme.cardBorder}` : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{recipe.name}</div>
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
                      {recipe.ingredientCount} ingredients · {recipe.perServing.calories} kcal/serving
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLogRecipe(recipe)}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      background: loggedIds.has(recipe.id) ? 'rgba(22,163,74,0.15)' : `${theme.accent}20`,
                      color: loggedIds.has(recipe.id) ? '#16A34A' : theme.accent,
                    }}
                  >
                    {loggedIds.has(recipe.id) ? '✓' : '+ Log'}
                  </motion.button>
                </div>
              ))}
              </div>
            </div>
          )}

          {/* Dish results */}
          {results.length > 0 && (
            <div style={{
              background: '#FFFFFF',
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 18,
              padding: '2px 14px',
              marginBottom: 12,
              boxShadow: '0 1px 2px rgba(16,24,40,0.05), 0 4px 14px rgba(16,24,40,0.06)',
            }}>
              {results.map((dish, i) => (
                <DishRow
                  key={dish.id}
                  dish={dish}
                  index={i}
                  isLast={i === results.length - 1}
                  logged={loggedIds.has(dish.id)}
                  onOpen={() => navigate(`/dish/${dish.id}?meal=${meal}`)}
                  onLog={handleLogDish}
                />
              ))}
            </div>
          )}

          {results.length === 0 && filteredRecipes.length === 0 && (
            <div style={{ textAlign: 'center', color: theme.textMute, fontSize: 13, paddingTop: 48 }}>
              No dishes found for "{query}"
              <div style={{ fontSize: 11, marginTop: 8 }}>
                Can't find it?{' '}
                <span onClick={() => navigate('/recipe')} style={{ color: theme.accent, cursor: 'pointer', fontWeight: 700 }}>
                  Build it as a custom recipe →
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </Background>
  );
}

const DishRow = memo(function DishRow({
  dish,
  index,
  isLast,
  logged,
  onOpen,
  onLog,
}: {
  dish: Recipe;
  index: number;
  isLast: boolean;
  logged: boolean;
  onOpen: () => void;
  onLog: (dish: Recipe) => void;
}) {
  const { theme } = useTheme();
  const dot = dish.isVegetarian ? '#16A34A' : '#DC2626';

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.25), duration: 0.2 }}
      style={{ borderBottom: isLast ? 'none' : `1px solid ${theme.cardBorder}` }}
    >
      <div
        onClick={onOpen}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', cursor: 'pointer' }}
      >
        {/* Veg dot */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: dot, flexShrink: 0,
          boxShadow: `0 0 6px ${dot}80`,
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {dish.name}
          </div>
          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
            {dish.caloriesPerServing} kcal · {dish.proteinPerServing}g protein / serving
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onLog(dish); }}
          style={{
            padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
            background: logged ? 'rgba(22,163,74,0.15)' : `${theme.accent}20`,
            color: logged ? '#16A34A' : theme.accent,
          }}
        >
          {logged ? '✓' : '+ Log'}
        </motion.button>

        <svg
          width="14" height="14" viewBox="0 0 12 12" fill="none" stroke={theme.textMute} strokeWidth="1.8" strokeLinecap="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M4.5 2.5L8 6l-3.5 3.5" />
        </svg>
      </div>
    </motion.div>
  );
});
