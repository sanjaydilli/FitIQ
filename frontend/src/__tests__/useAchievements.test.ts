import { renderHook } from '@testing-library/react';
import { useAchievements } from '../hooks/useAchievements';
import { formatLocalDate } from '../utils/date';

// Mock all four hook dependencies
jest.mock('../context/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('../hooks/useWorkoutLog',  () => ({ useWorkoutLog: jest.fn() }));
jest.mock('../hooks/useFoodLog',     () => ({ useFoodLog: jest.fn() }));
jest.mock('../hooks/useBodyComp',    () => ({ useBodyComp: jest.fn() }));

import { useUser }        from '../context/UserContext';
import { useWorkoutLog }  from '../hooks/useWorkoutLog';
import { useFoodLog }     from '../hooks/useFoodLog';
import { useBodyComp }    from '../hooks/useBodyComp';

// ── helpers ───────────────────────────────────────────────────────────────────

const baseUser = {
  level: 1, xp: 0, sex: 'male', weightKg: 75, heightCm: 175, age: 25,
  goal: 'gain', diet: 'veg', activity: 'moderate', streak: 0, name: '',
  waterDrops: [0,0,0,0,0,0], waterDate: '', steps: 0, stepsDate: '',
  stepGoal: 8000, isPremium: false,
};

/** Build a Set<string> of the last `n` consecutive days including today */
function lastNDays(n: number): Set<string> {
  const s = new Set<string>();
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    s.add(formatLocalDate(d));
  }
  return s;
}

function setup(overrides: {
  user?: Partial<typeof baseUser>;
  sessions?: any[];
  personalRecords?: Record<string, any>;
  entries?: any[];
  activeDays?: Set<string>;
  measurements?: any[];
} = {}) {
  (useUser as jest.Mock).mockReturnValue({ user: { ...baseUser, ...overrides.user } });
  (useWorkoutLog as jest.Mock).mockReturnValue({
    sessions: overrides.sessions ?? [],
    personalRecords: overrides.personalRecords ?? {},
  });
  (useFoodLog as jest.Mock).mockReturnValue({
    entries: overrides.entries ?? [],
    activeDays: overrides.activeDays ?? new Set<string>(),
  });
  (useBodyComp as jest.Mock).mockReturnValue({
    measurements: overrides.measurements ?? [],
  });
}

beforeEach(() => {
  setup();
});

// ── structure ─────────────────────────────────────────────────────────────────

describe('achievement list structure', () => {
  test('returns 18 achievements', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current).toHaveLength(18);
  });

  test('every achievement has required fields', () => {
    const { result } = renderHook(() => useAchievements());
    for (const a of result.current) {
      expect(typeof a.id).toBe('string');
      expect(typeof a.title).toBe('string');
      expect(typeof a.icon).toBe('string');
      expect(['workout','nutrition','consistency','body','level']).toContain(a.category);
      expect(typeof a.unlocked).toBe('boolean');
      expect(typeof a.xpReward).toBe('number');
    }
  });

  test('every progress value is 0–100', () => {
    setup({ sessions: Array.from({ length: 3 }, () => ({ date: '2026-01-01', totalVolume: 500, exercises: [] })) });
    const { result } = renderHook(() => useAchievements());
    for (const a of result.current) {
      if (a.progress !== undefined) {
        expect(a.progress).toBeGreaterThanOrEqual(0);
        expect(a.progress).toBeLessThanOrEqual(100);
      }
    }
  });
});

// ── workout achievements ──────────────────────────────────────────────────────

describe('workout achievements', () => {
  test('first_workout: locked with 0 sessions', () => {
    setup({ sessions: [] });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'first_workout')?.unlocked).toBe(false);
  });

  test('first_workout: unlocked with 1 session', () => {
    setup({ sessions: [{ date: '2026-01-01', totalVolume: 0, exercises: [] }] });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'first_workout')?.unlocked).toBe(true);
  });

  test('workouts_5: locked with 4 sessions', () => {
    setup({ sessions: Array.from({ length: 4 }, () => ({ date: '2026-01-01', totalVolume: 0, exercises: [] })) });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'workouts_5')?.unlocked).toBe(false);
  });

  test('workouts_5: unlocked with 5 sessions', () => {
    setup({ sessions: Array.from({ length: 5 }, () => ({ date: '2026-01-01', totalVolume: 0, exercises: [] })) });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'workouts_5')?.unlocked).toBe(true);
  });

  test('workouts_10: unlocked with 10 sessions', () => {
    setup({ sessions: Array.from({ length: 10 }, () => ({ date: '2026-01-01', totalVolume: 0, exercises: [] })) });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'workouts_10')?.unlocked).toBe(true);
  });

  test('workouts_25: unlocked with 25 sessions', () => {
    setup({ sessions: Array.from({ length: 25 }, () => ({ date: '2026-01-01', totalVolume: 0, exercises: [] })) });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'workouts_25')?.unlocked).toBe(true);
  });

  test('volume_1000: locked below 1000kg total', () => {
    setup({ sessions: [{ date: '2026-01-01', totalVolume: 500, exercises: [] }] });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'volume_1000')?.unlocked).toBe(false);
  });

  test('volume_1000: unlocked at 1000kg total volume', () => {
    setup({ sessions: [
      { date: '2026-01-01', totalVolume: 600, exercises: [] },
      { date: '2026-01-02', totalVolume: 400, exercises: [] },
    ]});
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'volume_1000')?.unlocked).toBe(true);
  });

  test('first_pr: unlocked when 1 personal record exists', () => {
    setup({ personalRecords: { bench_bb: { weight: 80, reps: 8 } } });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'first_pr')?.unlocked).toBe(true);
  });

  test('pr_5: unlocked with 5 personal records', () => {
    const prs = Object.fromEntries(['a','b','c','d','e'].map(k => [k, { weight: 50, reps: 5 }]));
    setup({ personalRecords: prs });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'pr_5')?.unlocked).toBe(true);
  });
});

// ── nutrition achievements ────────────────────────────────────────────────────

describe('nutrition achievements', () => {
  test('first_log: locked with 0 entries', () => {
    setup({ entries: [] });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'first_log')?.unlocked).toBe(false);
  });

  test('first_log: unlocked with 1 entry', () => {
    setup({ entries: [{ id: '1', date: '2026-01-01', meal: 'breakfast', name: 'Oats', calories: 300, protein: 10, carbs: 50, fat: 5 }] });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'first_log')?.unlocked).toBe(true);
  });

  test('log_7days: unlocked with 7 active days', () => {
    setup({ activeDays: lastNDays(7) });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'log_7days')?.unlocked).toBe(true);
  });

  test('log_30days: locked with 7 active days', () => {
    setup({ activeDays: lastNDays(7) });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'log_30days')?.unlocked).toBe(false);
  });
});

// ── body achievements ─────────────────────────────────────────────────────────

describe('body achievements', () => {
  test('first_measure: locked with 0 measurements', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'first_measure')?.unlocked).toBe(false);
  });

  test('first_measure: unlocked with 1 measurement', () => {
    setup({ measurements: [{ date: '2026-01-01', weightKg: 75, bodyFatPct: 18, leanMass: 61, fatMass: 14, waistCm: 82, neckCm: 38 }] });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'first_measure')?.unlocked).toBe(true);
  });

  test('measure_4: unlocked with 4 measurements', () => {
    const m = { date: '2026-01-01', weightKg: 75, bodyFatPct: 18, leanMass: 61, fatMass: 14, waistCm: 82, neckCm: 38 };
    setup({ measurements: [m, m, m, m] });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'measure_4')?.unlocked).toBe(true);
  });
});

// ── consistency / streak achievements ────────────────────────────────────────

describe('consistency (streak) achievements', () => {
  test('streak_3: locked when no active days', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'streak_3')?.unlocked).toBe(false);
  });

  test('streak_3: unlocked with 3 consecutive active days', () => {
    setup({ activeDays: lastNDays(3) });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'streak_3')?.unlocked).toBe(true);
  });

  test('streak_7: unlocked with 7 consecutive active days', () => {
    setup({ activeDays: lastNDays(7) });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'streak_7')?.unlocked).toBe(true);
  });

  test('streak_7: locked with a gap in the middle', () => {
    // Day 0 (today) and day 2–7, but day 1 missing → streak breaks at 1
    const s = new Set<string>();
    const today = new Date();
    s.add(formatLocalDate(today));
    for (let i = 2; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      s.add(formatLocalDate(d));
    }
    setup({ activeDays: s });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'streak_7')?.unlocked).toBe(false);
  });
});

// ── level achievements ────────────────────────────────────────────────────────

describe('level achievements', () => {
  test('level_2: locked at level 1', () => {
    setup({ user: { level: 1 } });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'level_2')?.unlocked).toBe(false);
  });

  test('level_2: unlocked at level 2', () => {
    setup({ user: { level: 2 } });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'level_2')?.unlocked).toBe(true);
  });

  test('level_5: unlocked at level 5', () => {
    setup({ user: { level: 5 } });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'level_5')?.unlocked).toBe(true);
  });

  test('level_10: unlocked at level 10', () => {
    setup({ user: { level: 10 } });
    const { result } = renderHook(() => useAchievements());
    expect(result.current.find(a => a.id === 'level_10')?.unlocked).toBe(true);
  });
});
