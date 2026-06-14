/**
 * Sprint 8 — useCustomPlan CRUD coverage.
 *
 * The standalone user-built workout plan hook (independent of the 3-month
 * program). Named by the prior sprint plan but never written. Small surface,
 * but the load() corrupt-JSON guard and the localStorage round-trip are the
 * kind of thing that breaks silently in production.
 */

import { renderHook, act } from '@testing-library/react';
import { useCustomPlan, CustomPlan } from '../hooks/useCustomPlan';
import { DayPlan } from '../services/programPlannerService';

const KEY = 'fitiq.customPlan';

const day = (overrides: Partial<DayPlan> = {}): DayPlan => ({
  day: 'Monday',
  focus: 'Push',
  estimatedMinutes: 60,
  exercises: [
    { exerciseId: 'bench_bb', name: 'Barbell Bench Press', sets: 4, repsDisplay: '8-10', restSeconds: 90, cue: 'Brace' },
  ],
  ...overrides,
});

beforeEach(() => localStorage.clear());

// ── initial load ────────────────────────────────────────────────────────────

describe('initial load', () => {
  test('returns null when nothing is stored', () => {
    const { result } = renderHook(() => useCustomPlan());
    expect(result.current.customPlan).toBeNull();
  });

  test('hydrates an existing plan from localStorage', () => {
    const stored: CustomPlan = { name: 'My Split', weeklyPlan: [day()], updatedAt: '2026-01-01T00:00:00.000Z' };
    localStorage.setItem(KEY, JSON.stringify(stored));
    const { result } = renderHook(() => useCustomPlan());
    expect(result.current.customPlan).toEqual(stored);
  });

  test('returns null (does not throw) on corrupt JSON', () => {
    localStorage.setItem(KEY, '{ not valid json');
    const { result } = renderHook(() => useCustomPlan());
    expect(result.current.customPlan).toBeNull();
  });
});

// ── saveCustomPlan ────────────────────────────────────────────────────────────

describe('saveCustomPlan', () => {
  test('sets the plan in state with name + weeklyPlan', () => {
    const { result } = renderHook(() => useCustomPlan());
    act(() => { result.current.saveCustomPlan('PPL', [day()]); });
    expect(result.current.customPlan?.name).toBe('PPL');
    expect(result.current.customPlan?.weeklyPlan).toHaveLength(1);
  });

  test('stamps an ISO updatedAt', () => {
    const { result } = renderHook(() => useCustomPlan());
    act(() => { result.current.saveCustomPlan('PPL', [day()]); });
    const ts = result.current.customPlan!.updatedAt;
    expect(() => new Date(ts).toISOString()).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  test('persists to localStorage so a fresh hook re-hydrates it', () => {
    const { result } = renderHook(() => useCustomPlan());
    act(() => { result.current.saveCustomPlan('PPL', [day({ focus: 'Pull' })]); });

    const fresh = renderHook(() => useCustomPlan());
    expect(fresh.result.current.customPlan?.name).toBe('PPL');
    expect(fresh.result.current.customPlan?.weeklyPlan[0].focus).toBe('Pull');
  });

  test('overwrites a previously saved plan', () => {
    const { result } = renderHook(() => useCustomPlan());
    act(() => { result.current.saveCustomPlan('First', [day()]); });
    act(() => { result.current.saveCustomPlan('Second', [day(), day({ day: 'Tuesday' })]); });
    expect(result.current.customPlan?.name).toBe('Second');
    expect(result.current.customPlan?.weeklyPlan).toHaveLength(2);
  });
});

// ── deleteCustomPlan ──────────────────────────────────────────────────────────

describe('deleteCustomPlan', () => {
  test('clears state and removes the localStorage key', () => {
    const { result } = renderHook(() => useCustomPlan());
    act(() => { result.current.saveCustomPlan('PPL', [day()]); });
    act(() => { result.current.deleteCustomPlan(); });
    expect(result.current.customPlan).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  test('a fresh hook after delete loads null', () => {
    const { result } = renderHook(() => useCustomPlan());
    act(() => { result.current.saveCustomPlan('PPL', [day()]); });
    act(() => { result.current.deleteCustomPlan(); });
    const fresh = renderHook(() => useCustomPlan());
    expect(fresh.result.current.customPlan).toBeNull();
  });
});
