import { useCallback, useMemo, useState } from 'react';
import { localDateStr } from '../utils/date';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  date: string;      // YYYY-MM-DD
  timestamp: number; // epoch ms when logged — used for "last meal" calculations
  meal: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams?: number;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: FoodEntry[];
}

const STORAGE_KEY = 'fitiq.foodLog';
const MAX_ENTRIES = 500;

function load(): FoodEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FoodEntry[];
    // Backfill timestamp on legacy entries — derive from id (fl_<ms>_xxx) or fall back to date noon
    return parsed.map(e => {
      if (typeof e.timestamp === 'number' && Number.isFinite(e.timestamp)) return e;
      const m = /^fl_(\d+)_/.exec(e.id);
      const fromId = m ? parseInt(m[1], 10) : NaN;
      const ts = Number.isFinite(fromId) ? fromId : new Date(`${e.date}T12:00:00`).getTime();
      return { ...e, timestamp: ts };
    });
  } catch { return []; }
}

function save(entries: FoodEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch { /* quota */ }
}

function todayStr(): string {
  return localDateStr();
}

export function useFoodLog() {
  const [entries, setEntries] = useState<FoodEntry[]>(load);

  const addEntry = useCallback((entry: Omit<FoodEntry, 'id' | 'date' | 'timestamp'> & { date?: string; timestamp?: number }) => {
    const now = Date.now();
    const newEntry: FoodEntry = {
      ...entry,
      id: `fl_${now}_${Math.random().toString(36).slice(2, 7)}`,
      date: entry.date ?? todayStr(),
      timestamp: entry.timestamp ?? now,
    };
    setEntries(prev => {
      const next = [...prev, newEntry];
      save(next);
      return next;
    });
    return newEntry;
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  const getEntriesForDate = useCallback((date: string): FoodEntry[] => {
    return entries.filter(e => e.date === date);
  }, [entries]);

  const getDailyTotals = useCallback((date: string): DailyTotals => {
    const dayEntries = entries.filter(e => e.date === date);
    return {
      calories: Math.round(dayEntries.reduce((s, e) => s + e.calories, 0)),
      protein:  Math.round(dayEntries.reduce((s, e) => s + e.protein, 0)),
      carbs:    Math.round(dayEntries.reduce((s, e) => s + e.carbs, 0)),
      fat:      Math.round(dayEntries.reduce((s, e) => s + e.fat, 0)),
      entries:  dayEntries,
    };
  }, [entries]);

  // Set of YYYY-MM-DD strings that have at least one entry — for activity calendar
  const activeDays = useMemo(() => {
    const s = new Set<string>();
    entries.forEach(e => s.add(e.date));
    return s;
  }, [entries]);

  // Calorie count per date — for activity heatmap intensity
  const caloriesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach(e => {
      map[e.date] = (map[e.date] ?? 0) + e.calories;
    });
    return map;
  }, [entries]);

  const todayTotals = useMemo(() => getDailyTotals(todayStr()), [getDailyTotals]);

  return {
    entries,
    todayTotals,
    activeDays,
    caloriesByDate,
    addEntry,
    removeEntry,
    getEntriesForDate,
    getDailyTotals,
  };
}
