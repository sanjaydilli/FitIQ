import { renderHook, act } from '@testing-library/react';
import { useBodyComp, Measurement } from '../hooks/useBodyComp';

// Mock UserContext so Firebase/Capacitor are never loaded
jest.mock('../context/UserContext', () => ({
  useUser: jest.fn(),
}));

import { useUser } from '../context/UserContext';

const mockUser = {
  sex: 'male' as const,
  heightCm: 175,
  weightKg: 75,
  age: 25,
  activity: 'moderate' as const,
  // other UserState fields not used by useBodyComp
  name: '', goal: 'gain' as const, diet: 'veg' as const, streak: 0, xp: 0,
  level: 1, waterDrops: [0,0,0,0,0,0], waterDate: '', steps: 0, stepsDate: '',
  stepGoal: 8000, isPremium: false,
};

beforeEach(() => {
  localStorage.clear();
  (useUser as jest.Mock).mockReturnValue({ user: mockUser });
});

const measureParams = (overrides = {}) => ({
  weightKg: 75,
  waistCm: 82,
  neckCm: 38,
  ...overrides,
});

// ── addMeasurement ────────────────────────────────────────────────────────────

describe('addMeasurement', () => {
  test('adds a measurement to the list', () => {
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams()); });
    expect(result.current.measurements).toHaveLength(1);
  });

  test('computes bodyFatPct as a positive number', () => {
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams()); });
    expect(result.current.measurements[0].bodyFatPct).toBeGreaterThan(0);
    expect(result.current.measurements[0].bodyFatPct).toBeLessThan(60);
  });

  test('computes leanMass + fatMass ≈ weightKg', () => {
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams({ weightKg: 80 })); });
    const { leanMass, fatMass } = result.current.measurements[0];
    expect(Math.round((leanMass + fatMass) * 10) / 10).toBeCloseTo(80, 0);
  });

  test('stores today\'s date on the entry', () => {
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams()); });
    expect(result.current.measurements[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('replaces existing entry for same date', () => {
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams({ weightKg: 75 })); });
    act(() => { result.current.addMeasurement(measureParams({ weightKg: 74 })); });
    // Same date → replace, not append
    expect(result.current.measurements).toHaveLength(1);
    expect(result.current.measurements[0].weightKg).toBe(74);
  });

  test('returns the new Measurement entry', () => {
    const { result } = renderHook(() => useBodyComp());
    let entry: Measurement | undefined;
    act(() => { entry = result.current.addMeasurement(measureParams()); });
    expect(entry?.weightKg).toBe(75);
    expect(typeof entry?.bodyFatPct).toBe('number');
  });

  test('addMeasurement sorts new entry relative to pre-seeded history', () => {
    // Seed one entry in the past
    const past: Measurement = { date: '2026-01-01', weightKg: 76, waistCm: 84, neckCm: 38, bodyFatPct: 18, leanMass: 62, fatMass: 14 };
    localStorage.setItem('fitiq.bodyComp', JSON.stringify([past]));

    const { result } = renderHook(() => useBodyComp());
    // Add today's measurement — it should sort after the Jan entry
    act(() => { result.current.addMeasurement(measureParams({ weightKg: 75 })); });

    expect(result.current.measurements[0].date).toBe('2026-01-01');
    const last = result.current.measurements[result.current.measurements.length - 1].date;
    // Today (2026-06-xx) is lexicographically after 2026-01-01
    expect(last > '2026-01-01').toBe(true);
  });
});

// ── latest ────────────────────────────────────────────────────────────────────

describe('latest', () => {
  test('is null when no measurements', () => {
    const { result } = renderHook(() => useBodyComp());
    expect(result.current.latest).toBeNull();
  });

  test('is the most recent measurement after adding', () => {
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams({ weightKg: 76 })); });
    expect(result.current.latest?.weightKg).toBe(76);
  });

  test('updates when a new measurement replaces the same-date entry', () => {
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams({ weightKg: 76 })); });
    act(() => { result.current.addMeasurement(measureParams({ weightKg: 74 })); });
    expect(result.current.latest?.weightKg).toBe(74);
  });
});

// ── bmr and tdee ──────────────────────────────────────────────────────────────

describe('bmr', () => {
  test('is a positive integer', () => {
    const { result } = renderHook(() => useBodyComp());
    expect(result.current.bmr).toBeGreaterThan(0);
    expect(Number.isInteger(result.current.bmr)).toBe(true);
  });

  test('uses latest measurement weight when available', () => {
    const { result: r1 } = renderHook(() => useBodyComp());
    const bmrBefore = r1.current.bmr;

    // Add measurement with different weight — BMR should change
    act(() => { r1.current.addMeasurement(measureParams({ weightKg: 90 })); });
    expect(r1.current.bmr).toBeGreaterThan(bmrBefore);
  });
});

describe('tdee', () => {
  test('is greater than bmr', () => {
    const { result } = renderHook(() => useBodyComp());
    // moderate activity multiplier > 1
    expect(result.current.tdee).toBeGreaterThan(result.current.bmr);
  });

  test('is a positive integer', () => {
    const { result } = renderHook(() => useBodyComp());
    expect(result.current.tdee).toBeGreaterThan(0);
    expect(Number.isInteger(result.current.tdee)).toBe(true);
  });
});

// ── trend ─────────────────────────────────────────────────────────────────────

describe('trend', () => {
  test('is null when fewer than 2 measurements', () => {
    const { result } = renderHook(() => useBodyComp());
    expect(result.current.trend).toBeNull();
  });

  test('is null with exactly one measurement', () => {
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams()); });
    expect(result.current.trend).toBeNull();
  });

  test('returns an object with weightDelta, fatPctDelta, leanDelta', () => {
    const m1: Measurement = { date: '2026-01-01', weightKg: 80, waistCm: 86, neckCm: 38, bodyFatPct: 20, leanMass: 64, fatMass: 16 };
    const m2: Measurement = { date: '2026-01-15', weightKg: 78, waistCm: 84, neckCm: 38, bodyFatPct: 18, leanMass: 64, fatMass: 14 };
    localStorage.setItem('fitiq.bodyComp', JSON.stringify([m1, m2]));

    const { result } = renderHook(() => useBodyComp());
    const t = result.current.trend!;
    expect(t).not.toBeNull();
    expect(typeof t.weightDelta).toBe('number');
    expect(typeof t.fatPctDelta).toBe('number');
    expect(typeof t.leanDelta).toBe('number');
  });

  test('weightDelta is negative when weight decreased', () => {
    const m1: Measurement = { date: '2026-01-01', weightKg: 80, waistCm: 86, neckCm: 38, bodyFatPct: 20, leanMass: 64, fatMass: 16 };
    const m2: Measurement = { date: '2026-01-15', weightKg: 78, waistCm: 84, neckCm: 38, bodyFatPct: 18, leanMass: 64, fatMass: 14 };
    localStorage.setItem('fitiq.bodyComp', JSON.stringify([m1, m2]));

    const { result } = renderHook(() => useBodyComp());
    expect(result.current.trend!.weightDelta).toBeLessThan(0);
  });

  test('weightDelta is rounded to 1 decimal', () => {
    const m1: Measurement = { date: '2026-01-01', weightKg: 80.123, waistCm: 86, neckCm: 38, bodyFatPct: 20, leanMass: 64, fatMass: 16 };
    const m2: Measurement = { date: '2026-01-15', weightKg: 78.456, waistCm: 84, neckCm: 38, bodyFatPct: 18, leanMass: 64, fatMass: 14 };
    localStorage.setItem('fitiq.bodyComp', JSON.stringify([m1, m2]));

    const { result } = renderHook(() => useBodyComp());
    const d = result.current.trend!.weightDelta;
    expect(String(Math.abs(d))).toMatch(/^\d+(\.\d)?$/);
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe('localStorage persistence', () => {
  test('measurements survive remount', () => {
    const { result: r1 } = renderHook(() => useBodyComp());
    act(() => { r1.current.addMeasurement(measureParams({ weightKg: 77 })); });

    const { result: r2 } = renderHook(() => useBodyComp());
    expect(r2.current.measurements).toHaveLength(1);
    expect(r2.current.measurements[0].weightKg).toBe(77);
  });

  test('capped at 52 entries (MAX_ENTRIES)', () => {
    const entries: Measurement[] = Array.from({ length: 55 }, (_, i) => ({
      date: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      weightKg: 75, waistCm: 82, neckCm: 38, bodyFatPct: 18, leanMass: 61.5, fatMass: 13.5,
    }));
    localStorage.setItem('fitiq.bodyComp', JSON.stringify(entries));

    // Save via hook to trigger trim
    const { result } = renderHook(() => useBodyComp());
    act(() => { result.current.addMeasurement(measureParams()); });

    const raw = JSON.parse(localStorage.getItem('fitiq.bodyComp') || '[]');
    expect(raw.length).toBeLessThanOrEqual(52);
  });
});
