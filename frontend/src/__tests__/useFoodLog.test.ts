import { renderHook, act } from '@testing-library/react';
import { useFoodLog } from '../hooks/useFoodLog';
import { localDateStr } from '../utils/date';

beforeEach(() => localStorage.clear());

const entry = (overrides = {}) => ({
  meal: 'breakfast' as const,
  name: 'Oats',
  calories: 300,
  protein: 10,
  carbs: 50,
  fat: 5,
  ...overrides,
});

// ── addEntry ──────────────────────────────────────────────────────────────────

describe('addEntry', () => {
  test('appends a new entry to the list', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => { result.current.addEntry(entry()); });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe('Oats');
  });

  test('auto-generates an id with fl_ prefix', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => { result.current.addEntry(entry()); });
    expect(result.current.entries[0].id).toMatch(/^fl_/);
  });

  test('defaults date to today', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => { result.current.addEntry(entry()); });
    expect(result.current.entries[0].date).toBe(localDateStr());
  });

  test('respects explicit date override', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => { result.current.addEntry(entry({ date: '2026-01-01' })); });
    expect(result.current.entries[0].date).toBe('2026-01-01');
  });

  test('adds timestamp as a number', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => { result.current.addEntry(entry()); });
    expect(typeof result.current.entries[0].timestamp).toBe('number');
    expect(result.current.entries[0].timestamp).toBeGreaterThan(0);
  });

  test('multiple adds accumulate', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => {
      result.current.addEntry(entry({ meal: 'breakfast', name: 'Oats' }));
      result.current.addEntry(entry({ meal: 'lunch', name: 'Dal' }));
    });
    expect(result.current.entries).toHaveLength(2);
  });

  test('returns the new entry', () => {
    const { result } = renderHook(() => useFoodLog());
    let newEntry: any;
    act(() => { newEntry = result.current.addEntry(entry()); });
    expect(newEntry.name).toBe('Oats');
    expect(newEntry.id).toMatch(/^fl_/);
  });
});

// ── removeEntry ───────────────────────────────────────────────────────────────

describe('removeEntry', () => {
  test('removes the entry by id', () => {
    const { result } = renderHook(() => useFoodLog());
    let id: string;
    act(() => { id = result.current.addEntry(entry()).id; });
    act(() => { result.current.removeEntry(id); });
    expect(result.current.entries).toHaveLength(0);
  });

  test('removes only the matching entry', () => {
    const { result } = renderHook(() => useFoodLog());
    let idA: string;
    act(() => {
      idA = result.current.addEntry(entry({ name: 'A' })).id;
      result.current.addEntry(entry({ name: 'B' }));
    });
    act(() => { result.current.removeEntry(idA); });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe('B');
  });

  test('removing non-existent id leaves entries unchanged', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => { result.current.addEntry(entry()); });
    act(() => { result.current.removeEntry('nonexistent'); });
    expect(result.current.entries).toHaveLength(1);
  });
});

// ── getEntriesForDate ─────────────────────────────────────────────────────────

describe('getEntriesForDate', () => {
  test('returns entries matching the given date', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => {
      result.current.addEntry(entry({ date: '2026-01-01' }));
      result.current.addEntry(entry({ date: '2026-01-02' }));
    });
    const jan1 = result.current.getEntriesForDate('2026-01-01');
    expect(jan1).toHaveLength(1);
    expect(jan1[0].date).toBe('2026-01-01');
  });

  test('returns empty array when no entries for date', () => {
    const { result } = renderHook(() => useFoodLog());
    expect(result.current.getEntriesForDate('2020-01-01')).toEqual([]);
  });
});

// ── getDailyTotals ────────────────────────────────────────────────────────────

describe('getDailyTotals', () => {
  test('sums macros for a date', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => {
      result.current.addEntry({ meal: 'breakfast', name: 'A', calories: 300, protein: 10, carbs: 40, fat: 8, date: '2026-03-01' });
      result.current.addEntry({ meal: 'lunch',     name: 'B', calories: 500, protein: 30, carbs: 60, fat: 12, date: '2026-03-01' });
    });
    const totals = result.current.getDailyTotals('2026-03-01');
    expect(totals.calories).toBe(800);
    expect(totals.protein).toBe(40);
    expect(totals.carbs).toBe(100);
    expect(totals.fat).toBe(20);
    expect(totals.entries).toHaveLength(2);
  });

  test('returns zeros when no entries for date', () => {
    const { result } = renderHook(() => useFoodLog());
    const totals = result.current.getDailyTotals('1990-01-01');
    expect(totals.calories).toBe(0);
    expect(totals.protein).toBe(0);
    expect(totals.entries).toHaveLength(0);
  });

  test('ignores entries from other dates', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => {
      result.current.addEntry({ meal: 'breakfast', name: 'A', calories: 300, protein: 10, carbs: 40, fat: 8, date: '2026-03-01' });
      result.current.addEntry({ meal: 'breakfast', name: 'B', calories: 400, protein: 15, carbs: 50, fat: 9, date: '2026-03-02' });
    });
    expect(result.current.getDailyTotals('2026-03-01').calories).toBe(300);
  });
});

// ── activeDays ────────────────────────────────────────────────────────────────

describe('activeDays', () => {
  test('contains dates of logged entries', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => {
      result.current.addEntry(entry({ date: '2026-03-10' }));
      result.current.addEntry(entry({ date: '2026-03-12' }));
    });
    expect(result.current.activeDays.has('2026-03-10')).toBe(true);
    expect(result.current.activeDays.has('2026-03-12')).toBe(true);
    expect(result.current.activeDays.has('2026-03-11')).toBe(false);
  });

  test('is empty before any entries', () => {
    const { result } = renderHook(() => useFoodLog());
    expect(result.current.activeDays.size).toBe(0);
  });
});

// ── caloriesByDate ────────────────────────────────────────────────────────────

describe('caloriesByDate', () => {
  test('sums calories per date', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => {
      result.current.addEntry({ meal: 'breakfast', name: 'A', calories: 200, protein: 5, carbs: 30, fat: 5, date: '2026-03-01' });
      result.current.addEntry({ meal: 'lunch',     name: 'B', calories: 400, protein: 15, carbs: 50, fat: 10, date: '2026-03-01' });
      result.current.addEntry({ meal: 'dinner',    name: 'C', calories: 300, protein: 10, carbs: 40, fat: 8,  date: '2026-03-02' });
    });
    expect(result.current.caloriesByDate['2026-03-01']).toBe(600);
    expect(result.current.caloriesByDate['2026-03-02']).toBe(300);
  });
});

// ── todayTotals ───────────────────────────────────────────────────────────────

describe('todayTotals', () => {
  test('reflects entries added for today', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => { result.current.addEntry(entry({ calories: 500 })); });
    expect(result.current.todayTotals.calories).toBe(500);
  });

  test('does not include entries from other dates', () => {
    const { result } = renderHook(() => useFoodLog());
    act(() => { result.current.addEntry(entry({ date: '2020-01-01', calories: 999 })); });
    expect(result.current.todayTotals.calories).toBe(0);
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe('localStorage persistence', () => {
  test('entries survive unmount and remount', () => {
    const { result: r1 } = renderHook(() => useFoodLog());
    act(() => { r1.current.addEntry(entry({ name: 'Dosa' })); });

    const { result: r2 } = renderHook(() => useFoodLog());
    expect(r2.current.entries).toHaveLength(1);
    expect(r2.current.entries[0].name).toBe('Dosa');
  });

  test('backfills timestamp from id if missing on legacy entry', () => {
    const ts = 1700000000000;
    const legacy = [{ id: `fl_${ts}_abc`, date: '2026-01-01', meal: 'breakfast', name: 'Old', calories: 100, protein: 3, carbs: 15, fat: 2 }];
    localStorage.setItem('fitiq.foodLog', JSON.stringify(legacy));

    const { result } = renderHook(() => useFoodLog());
    expect(result.current.entries[0].timestamp).toBe(ts);
  });
});
