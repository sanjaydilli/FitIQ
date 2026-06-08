import { useCallback, useMemo, useState } from 'react';
import { formatLocalDate } from '../utils/date';
import { useUser } from '../context/UserContext';

export type ActivityCategory = 'morning' | 'nutrition' | 'workout' | 'hydration' | 'evening' | 'sleep';

export interface RoutineActivity {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: ActivityCategory;
  hour: number;
  minute: number;
  durationMins: number;
  xp: number;
  isDefault: boolean;
}

export interface ActivityEntry extends RoutineActivity {
  completed: boolean;
}

const STORAGE_KEY = 'fitiq.routine';
const MAX_DAYS_STORED = 30;

type DayStore = Record<string, boolean>; // activityId → completed
type Store = Record<string, DayStore>;    // dateKey → DayStore

function dateKey(date: Date): string {
  return formatLocalDate(date);
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Store): void {
  // Keep only recent MAX_DAYS_STORED days to avoid bloat
  const keys = Object.keys(store).sort().slice(-MAX_DAYS_STORED);
  const trimmed: Store = {};
  keys.forEach(k => { trimmed[k] = store[k]; });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch { /* quota */ }
}

// ── Default routine generation ────────────────────────────────────────────────

type Goal = 'lose' | 'gain' | 'endur' | 'main';
type Activity = 'sedentary' | 'light' | 'moderate' | 'active';

function buildDefaultRoutine(goal: Goal, activity: Activity): RoutineActivity[] {
  const hasWorkout = activity !== 'sedentary';
  const isMuscle   = goal === 'gain';
  const isLoss     = goal === 'lose';
  const isEndur    = goal === 'endur';

  const base: RoutineActivity[] = [
    // Morning
    { id: 'wake',      title: 'Wake up & hydrate',     subtitle: '2 glasses water on empty stomach', icon: '💧', category: 'morning',    hour: 6,  minute: 0,  durationMins: 5,  xp: 10,  isDefault: true },
    { id: 'sunlight',  title: 'Morning sunlight',       subtitle: '10–15 min · Vitamin D boost',      icon: '☀️', category: 'morning',    hour: 6,  minute: 15, durationMins: 15, xp: 15,  isDefault: true },
    { id: 'breakfast', title: 'Breakfast',               subtitle: isMuscle ? '35–40g protein + carbs' : isLoss ? '400–500 kcal, high protein' : '450 kcal balanced', icon: '🍳', category: 'nutrition', hour: 7,  minute: 30, durationMins: 20, xp: 20,  isDefault: true },

    // Hydration checkpoints
    { id: 'water_am',  title: 'Mid-morning water',      subtitle: '500 ml',                           icon: '🥤', category: 'hydration',  hour: 10, minute: 0,  durationMins: 2,  xp: 10,  isDefault: true },
    { id: 'lunch',     title: 'Lunch',                   subtitle: isMuscle ? '45–50g protein + rice/roti' : isLoss ? '500–600 kcal, low GI' : '600 kcal', icon: '🍱', category: 'nutrition', hour: 13, minute: 0,  durationMins: 25, xp: 20,  isDefault: true },
    { id: 'water_pm',  title: 'Afternoon water',         subtitle: '500 ml',                           icon: '🥤', category: 'hydration',  hour: 15, minute: 30, durationMins: 2,  xp: 10,  isDefault: true },

    // Evening nutrition
    { id: 'snack',     title: 'Pre-workout / snack',     subtitle: isMuscle ? 'Banana + 20g protein' : '200 kcal light snack', icon: '🍌', category: 'nutrition', hour: 16, minute: 30, durationMins: 10, xp: 15,  isDefault: true },
    { id: 'dinner',    title: 'Dinner',                   subtitle: isMuscle ? '40g protein + carbs' : isLoss ? '400–500 kcal, high protein' : '550 kcal', icon: '🍽️', category: 'nutrition', hour: 19, minute: 30, durationMins: 25, xp: 20,  isDefault: true },
    { id: 'water_eve', title: 'Evening water',            subtitle: '500 ml · finish daily target',    icon: '🥤', category: 'hydration',  hour: 20, minute: 30, durationMins: 2,  xp: 10,  isDefault: true },

    // Sleep
    { id: 'stretch',   title: 'Stretching / wind down',  subtitle: '10 min · reduces cortisol',        icon: '🧘', category: 'sleep',      hour: 21, minute: 30, durationMins: 10, xp: 15,  isDefault: true },
    { id: 'sleep',     title: 'Lights out',               subtitle: '7–8 hours · peak recovery',       icon: '😴', category: 'sleep',      hour: 22, minute: 30, durationMins: 480, xp: 30, isDefault: true },
  ];

  // Workout blocks
  if (hasWorkout) {
    if (isMuscle) {
      base.push({ id: 'gym',       title: 'Gym / Strength training', subtitle: '45–60 min · progressive overload', icon: '💪', category: 'workout', hour: 17, minute: 30, durationMins: 60, xp: 80, isDefault: true });
      base.push({ id: 'post_meal', title: 'Post-workout meal',       subtitle: 'Within 60 min · 40g protein',      icon: '🥛', category: 'nutrition', hour: 18, minute: 45, durationMins: 15, xp: 20, isDefault: true });
    } else if (isEndur) {
      base.push({ id: 'cardio',    title: 'Cardio / Run',            subtitle: '30–45 min · target HR zone 2',     icon: '🏃', category: 'workout', hour: 6,  minute: 30, durationMins: 45, xp: 70, isDefault: true });
      base.push({ id: 'gym',       title: 'Strength training',       subtitle: '30 min · maintenance lifts',       icon: '💪', category: 'workout', hour: 17, minute: 30, durationMins: 30, xp: 50, isDefault: true });
    } else if (isLoss) {
      base.push({ id: 'cardio',    title: 'Morning walk / LISS',     subtitle: '30–40 min · fasted cardio',        icon: '🚶', category: 'workout', hour: 6,  minute: 30, durationMins: 40, xp: 60, isDefault: true });
      base.push({ id: 'gym',       title: 'Gym / Resistance training', subtitle: '40 min · preserve muscle mass', icon: '💪', category: 'workout', hour: 17, minute: 30, durationMins: 40, xp: 60, isDefault: true });
    } else {
      base.push({ id: 'gym',       title: 'Workout',                 subtitle: '40–50 min · compound movements',   icon: '💪', category: 'workout', hour: 17, minute: 30, durationMins: 50, xp: 60, isDefault: true });
    }
  } else {
    base.push({ id: 'walk',        title: 'Daily walk',              subtitle: '7,000–10,000 steps',               icon: '🚶', category: 'workout', hour: 7,  minute: 0,  durationMins: 30, xp: 40, isDefault: true });
  }

  return base.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
}

// Custom activity counter — read fresh from localStorage each time
// so logout+clear doesn't leave a stale in-memory counter
function nextCustomId(): string {
  const n = parseInt(localStorage.getItem('fitiq.routine.counter') ?? '0', 10) + 1;
  localStorage.setItem('fitiq.routine.counter', String(n));
  return `custom_${n}`;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDailyRoutine() {
  const { user, awardXP } = useUser();

  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });
  const [store, setStore] = useState<Store>(loadStore);
  const [customActivities, setCustomActivities] = useState<RoutineActivity[]>(() => {
    try {
      const raw = localStorage.getItem('fitiq.routine.custom');
      return raw ? (JSON.parse(raw) as RoutineActivity[]) : [];
    } catch { return []; }
  });

  const key = dateKey(viewDate);

  const defaultActivities = useMemo(
    () => buildDefaultRoutine(user.goal, user.activity),
    [user.goal, user.activity]
  );

  const allActivities = useMemo(
    () => [...defaultActivities, ...customActivities],
    [defaultActivities, customActivities]
  );

  const activities: ActivityEntry[] = useMemo(() => {
    const dayStore = store[key] ?? {};
    return allActivities.map(a => ({
      ...a,
      completed: dayStore[a.id] ?? false,
    })).sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  }, [allActivities, store, key]);

  const stats = useMemo(() => {
    const done = activities.filter(a => a.completed).length;
    const total = activities.length;
    const xpEarned = activities.filter(a => a.completed).reduce((s, a) => s + a.xp, 0);
    const xpTotal  = activities.reduce((s, a) => s + a.xp, 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, xpEarned, xpTotal, pct };
  }, [activities]);

  const isToday = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return viewDate.getTime() === today.getTime();
  }, [viewDate]);

  const toggleActivity = useCallback((id: string) => {
    const act = allActivities.find(a => a.id === id);
    const todayKey = dateKey(new Date());
    setStore(prev => {
      const dayStore = { ...(prev[key] ?? {}) };
      const wasCompleted = dayStore[id] ?? false;
      dayStore[id] = !wasCompleted;
      if (!wasCompleted && act && key === todayKey) {
        awardXP(act.xp);
      }
      const next = { ...prev, [key]: dayStore };
      saveStore(next);
      return next;
    });
  }, [key, allActivities, awardXP]);

  const addCustomActivity = useCallback((act: Omit<RoutineActivity, 'id' | 'isDefault'>) => {
    const full: RoutineActivity = { ...act, id: nextCustomId(), isDefault: false };
    setCustomActivities(prev => {
      const next = [...prev, full];
      try { localStorage.setItem('fitiq.routine.custom', JSON.stringify(next)); } catch { /* quota */ }
      return next;
    });
  }, []);

  const removeCustomActivity = useCallback((id: string) => {
    setCustomActivities(prev => {
      const next = prev.filter(a => a.id !== id);
      try { localStorage.setItem('fitiq.routine.custom', JSON.stringify(next)); } catch { /* quota */ }
      return next;
    });
  }, []);

  const goToPrevDay = useCallback(() => {
    setViewDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  }, []);

  const goToNextDay = useCallback(() => {
    setViewDate(d => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (d >= today) return d;
      const n = new Date(d); n.setDate(n.getDate() + 1); return n;
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0); setViewDate(today);
  }, []);

  return {
    activities,
    stats,
    viewDate,
    isToday,
    toggleActivity,
    addCustomActivity,
    removeCustomActivity,
    goToPrevDay,
    goToNextDay,
    goToToday,
  };
}
