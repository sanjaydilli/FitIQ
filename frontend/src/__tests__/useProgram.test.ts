import { renderHook, act } from '@testing-library/react';
import { useProgram } from '../hooks/useProgram';
import { ProgramConfig } from '../services/programPhaseEngine';

jest.mock('../context/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('../hooks/useBodyComp',   () => ({ useBodyComp: jest.fn() }));
jest.mock('../services/programPlannerService', () => ({
  generateProgramPhase: jest.fn().mockResolvedValue({
    phaseNumber: 1, phaseName: 'Foundation', weeklyPlan: [],
    calories: 2200, protein: 150, keyFocus: 'Build base strength',
    generatedAt: new Date().toISOString(),
  }),
}));

import { useUser }    from '../context/UserContext';
import { useBodyComp } from '../hooks/useBodyComp';

// ── helpers ───────────────────────────────────────────────────────────────────

const baseUser = {
  sex: 'male' as const, weightKg: 75, heightCm: 175, age: 25,
  goal: 'gain' as const, diet: 'veg' as const, activity: 'moderate' as const,
  streak: 0, xp: 0, level: 1, name: '', waterDrops: [0,0,0,0,0,0],
  waterDate: '', steps: 0, stepsDate: '', stepGoal: 8000, isPremium: false,
};

function setupMocks(userOverrides: Partial<typeof baseUser> = {}, bodyCompOverrides: object = {}) {
  (useUser as jest.Mock).mockReturnValue({ user: { ...baseUser, ...userOverrides } });
  (useBodyComp as jest.Mock).mockReturnValue({
    tdee: 2200, latest: null, measurements: [],
    ...bodyCompOverrides,
  });
}

const sampleConfig: ProgramConfig = {
  id: 'prog_test', type: 'muscle_gain', durationMonths: 3,
  startDate: '2026-01-01',
  startWeight: 75, startLeanMass: 61, startBodyFatPct: 18,
  startTDEE: 2200, sex: 'male', heightCm: 175, age: 25, activity: 'moderate',
};

beforeEach(() => {
  localStorage.clear();
  setupMocks();
});

// ── initial state (no config) ─────────────────────────────────────────────────

describe('initial state', () => {
  test('config is null when nothing saved', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.config).toBeNull();
  });

  test('phases is empty when no config', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.phases).toHaveLength(0);
  });

  test('currentPhase is null when no config', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.currentPhase).toBeNull();
  });

  test('currentPlan is null when no config', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.currentPlan).toBeNull();
  });

  test('daysElapsed is 0 when no config', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.daysElapsed).toBe(0);
  });

  test('programEndDate is null when no config', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.programEndDate).toBeNull();
  });

  test('generating is false on mount', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.generating).toBe(false);
  });

  test('error is null on mount', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.error).toBeNull();
  });
});

// ── phases derived from config ────────────────────────────────────────────────

describe('phases derived from config', () => {
  beforeEach(() => {
    localStorage.setItem('fitiq.program.config', JSON.stringify(sampleConfig));
  });

  test('phases has 3 entries for a 3-month program', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.phases).toHaveLength(3);
  });

  test('phases are numbered 1, 2, 3', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.phases.map(p => p.phase)).toEqual([1, 2, 3]);
  });

  test('config is loaded from localStorage on mount', () => {
    const { result } = renderHook(() => useProgram());
    expect(result.current.config?.id).toBe('prog_test');
    expect(result.current.config?.type).toBe('muscle_gain');
  });
});

// ── daysElapsed ───────────────────────────────────────────────────────────────

describe('daysElapsed', () => {
  test('is 0 when startDate is today', () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('fitiq.program.config', JSON.stringify({ ...sampleConfig, startDate: today }));
    const { result } = renderHook(() => useProgram());
    expect(result.current.daysElapsed).toBeGreaterThanOrEqual(0);
    expect(result.current.daysElapsed).toBeLessThan(2);
  });

  test('is positive when startDate is in the past', () => {
    localStorage.setItem('fitiq.program.config', JSON.stringify({ ...sampleConfig, startDate: '2026-01-01' }));
    const { result } = renderHook(() => useProgram());
    expect(result.current.daysElapsed).toBeGreaterThan(0);
  });
});

// ── programEndDate ────────────────────────────────────────────────────────────

describe('programEndDate', () => {
  test('is 3 months after startDate', () => {
    localStorage.setItem('fitiq.program.config', JSON.stringify({ ...sampleConfig, startDate: '2026-01-01' }));
    const { result } = renderHook(() => useProgram());
    // Jan 1 + 3 months = Apr 1
    expect(result.current.programEndDate).toBe('2026-04-01');
  });

  test('is a valid YYYY-MM-DD string', () => {
    localStorage.setItem('fitiq.program.config', JSON.stringify(sampleConfig));
    const { result } = renderHook(() => useProgram());
    expect(result.current.programEndDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── clearProgram ──────────────────────────────────────────────────────────────

describe('clearProgram', () => {
  test('resets config to null', () => {
    localStorage.setItem('fitiq.program.config', JSON.stringify(sampleConfig));
    const { result } = renderHook(() => useProgram());
    act(() => { result.current.clearProgram(); });
    expect(result.current.config).toBeNull();
  });

  test('resets phases to empty', () => {
    localStorage.setItem('fitiq.program.config', JSON.stringify(sampleConfig));
    const { result } = renderHook(() => useProgram());
    act(() => { result.current.clearProgram(); });
    expect(result.current.phases).toHaveLength(0);
  });

  test('removes config from localStorage', () => {
    localStorage.setItem('fitiq.program.config', JSON.stringify(sampleConfig));
    const { result } = renderHook(() => useProgram());
    act(() => { result.current.clearProgram(); });
    expect(localStorage.getItem('fitiq.program.config')).toBeNull();
  });

  test('resets plans to empty object', () => {
    localStorage.setItem('fitiq.program.config', JSON.stringify(sampleConfig));
    localStorage.setItem('fitiq.program.plans', JSON.stringify({ phase_1: { phaseNumber: 1 } }));
    const { result } = renderHook(() => useProgram());
    act(() => { result.current.clearProgram(); });
    expect(result.current.plans).toEqual({});
  });
});

// ── startProgram ──────────────────────────────────────────────────────────────

describe('startProgram', () => {
  test('does nothing when user is not premium', async () => {
    setupMocks({ isPremium: false });
    const { result } = renderHook(() => useProgram());
    await act(async () => { await result.current.startProgram('muscle_gain'); });
    expect(result.current.config).toBeNull();
  });

  test('sets config when user is premium', async () => {
    setupMocks({ isPremium: true });
    const { result } = renderHook(() => useProgram());
    await act(async () => { await result.current.startProgram('muscle_gain'); });
    expect(result.current.config).not.toBeNull();
    expect(result.current.config?.type).toBe('muscle_gain');
  });

  test('config has 3 phases after start', async () => {
    setupMocks({ isPremium: true });
    const { result } = renderHook(() => useProgram());
    await act(async () => { await result.current.startProgram('fat_loss'); });
    expect(result.current.phases).toHaveLength(3);
  });

  test('startDate is today', async () => {
    setupMocks({ isPremium: true });
    const today = new Date().toISOString().split('T')[0];
    const { result } = renderHook(() => useProgram());
    await act(async () => { await result.current.startProgram('muscle_gain'); });
    expect(result.current.config?.startDate).toBe(today);
  });

  test('durationMonths is always 3', async () => {
    setupMocks({ isPremium: true });
    const { result } = renderHook(() => useProgram());
    await act(async () => { await result.current.startProgram('body_recomp'); });
    expect(result.current.config?.durationMonths).toBe(3);
  });
});

// ── updateCurrentPlan ────────────────────────────────────────────────────────

describe('updateCurrentPlan', () => {
  test('replaces weeklyPlan on current phase plan', () => {
    // Pre-seed with today's start date so getCurrentPhase returns Phase 1
    const today = new Date().toISOString().split('T')[0];
    const cfg = { ...sampleConfig, startDate: today };
    const seedPlan = { phaseNumber: 1, phaseName: 'Foundation', weeklyPlan: [], calories: 2200, protein: 150, keyFocus: 'Strength', generatedAt: '' };
    localStorage.setItem('fitiq.program.config', JSON.stringify(cfg));
    localStorage.setItem('fitiq.program.plans', JSON.stringify({ phase_1: seedPlan }));

    const { result } = renderHook(() => useProgram());
    expect(result.current.currentPhase?.phase).toBe(1);   // verify setup
    expect(result.current.currentPlan).not.toBeNull();    // plan exists

    const newPlan = [{ day: 'Monday', focus: 'Chest', estimatedMinutes: 60, exercises: [] }];
    act(() => { result.current.updateCurrentPlan(newPlan); });

    expect(result.current.currentPlan?.weeklyPlan).toEqual(newPlan);
  });

  test('no-op when no current phase exists', () => {
    const { result } = renderHook(() => useProgram());
    // No config → no currentPhase → updateCurrentPlan should not throw
    expect(() => { act(() => { result.current.updateCurrentPlan([]); }); }).not.toThrow();
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe('localStorage persistence', () => {
  test('config survives remount', () => {
    localStorage.setItem('fitiq.program.config', JSON.stringify(sampleConfig));
    const { result } = renderHook(() => useProgram());
    expect(result.current.config?.id).toBe('prog_test');
  });

  test('plans survive remount', () => {
    const mockPlan = { phase_1: { phaseNumber: 1, phaseName: 'Foundation', weeklyPlan: [], calories: 2200, protein: 150, keyFocus: 'Strength', generatedAt: '2026-01-01T00:00:00Z' } };
    localStorage.setItem('fitiq.program.config', JSON.stringify(sampleConfig));
    localStorage.setItem('fitiq.program.plans', JSON.stringify(mockPlan));
    const { result } = renderHook(() => useProgram());
    expect(result.current.plans['phase_1']).toBeDefined();
  });
});
