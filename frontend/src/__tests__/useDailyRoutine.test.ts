import { renderHook, act } from '@testing-library/react';
import { useDailyRoutine } from '../hooks/useDailyRoutine';

jest.mock('../context/UserContext', () => ({ useUser: jest.fn() }));

import { useUser } from '../context/UserContext';

const awardXP = jest.fn();
const mockUser = (overrides: Record<string, any> = {}) => ({
  goal: 'gain' as const,
  activity: 'moderate' as const,
  sex: 'male' as const,
  weightKg: 75, heightCm: 175, age: 25, name: '', diet: 'veg' as const,
  streak: 0, xp: 0, level: 1, waterDrops: [0,0,0,0,0,0], waterDate: '',
  steps: 0, stepsDate: '', stepGoal: 8000, isPremium: false,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  (useUser as jest.Mock).mockReturnValue({ user: mockUser(), awardXP });
  awardXP.mockClear();
});

// ── activities list structure ─────────────────────────────────────────────────

describe('activities list', () => {
  test('returns a non-empty activities list', () => {
    const { result } = renderHook(() => useDailyRoutine());
    expect(result.current.activities.length).toBeGreaterThan(0);
  });

  test('activities are sorted by hour:minute', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const times = result.current.activities.map(a => a.hour * 60 + a.minute);
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
    }
  });

  test('all activities start as not completed', () => {
    const { result } = renderHook(() => useDailyRoutine());
    expect(result.current.activities.every(a => !a.completed)).toBe(true);
  });

  test('gain goal includes a gym/strength activity', () => {
    (useUser as jest.Mock).mockReturnValue({ user: mockUser({ goal: 'gain', activity: 'moderate' }), awardXP });
    const { result } = renderHook(() => useDailyRoutine());
    const gymAct = result.current.activities.find(a => a.id === 'gym');
    expect(gymAct).toBeDefined();
  });

  test('lose goal includes cardio activity', () => {
    (useUser as jest.Mock).mockReturnValue({ user: mockUser({ goal: 'lose', activity: 'moderate' }), awardXP });
    const { result } = renderHook(() => useDailyRoutine());
    const cardioAct = result.current.activities.find(a => a.id === 'cardio');
    expect(cardioAct).toBeDefined();
  });

  test('sedentary activity has walk, not gym', () => {
    (useUser as jest.Mock).mockReturnValue({ user: mockUser({ activity: 'sedentary' }), awardXP });
    const { result } = renderHook(() => useDailyRoutine());
    const ids = result.current.activities.map(a => a.id);
    expect(ids).toContain('walk');
    expect(ids).not.toContain('gym');
  });

  test('all activities have required fields', () => {
    const { result } = renderHook(() => useDailyRoutine());
    for (const a of result.current.activities) {
      expect(typeof a.id).toBe('string');
      expect(typeof a.title).toBe('string');
      expect(typeof a.xp).toBe('number');
      expect(typeof a.completed).toBe('boolean');
    }
  });
});

// ── stats ─────────────────────────────────────────────────────────────────────

describe('stats', () => {
  test('done starts at 0', () => {
    const { result } = renderHook(() => useDailyRoutine());
    expect(result.current.stats.done).toBe(0);
  });

  test('pct starts at 0', () => {
    const { result } = renderHook(() => useDailyRoutine());
    expect(result.current.stats.pct).toBe(0);
  });

  test('total equals activities length', () => {
    const { result } = renderHook(() => useDailyRoutine());
    expect(result.current.stats.total).toBe(result.current.activities.length);
  });

  test('done increments after toggle', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const id = result.current.activities[0].id;
    act(() => { result.current.toggleActivity(id); });
    expect(result.current.stats.done).toBe(1);
  });

  test('xpEarned reflects completed activities', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const act1 = result.current.activities[0];
    act(() => { result.current.toggleActivity(act1.id); });
    expect(result.current.stats.xpEarned).toBe(act1.xp);
  });

  test('pct = 100 when all activities completed', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const ids = result.current.activities.map(a => a.id);
    act(() => { ids.forEach(id => result.current.toggleActivity(id)); });
    expect(result.current.stats.pct).toBe(100);
  });
});

// ── toggleActivity ────────────────────────────────────────────────────────────

describe('toggleActivity', () => {
  test('toggles activity from false to true', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const id = result.current.activities[0].id;
    act(() => { result.current.toggleActivity(id); });
    expect(result.current.activities.find(a => a.id === id)?.completed).toBe(true);
  });

  test('toggles back to false on second call', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const id = result.current.activities[0].id;
    act(() => { result.current.toggleActivity(id); });
    act(() => { result.current.toggleActivity(id); });
    expect(result.current.activities.find(a => a.id === id)?.completed).toBe(false);
  });

  test('calls awardXP when marking today activity as done', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const act1 = result.current.activities[0];
    act(() => { result.current.toggleActivity(act1.id); });
    expect(awardXP).toHaveBeenCalledWith(act1.xp);
  });

  test('does not call awardXP when untoggling', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const id = result.current.activities[0].id;
    act(() => { result.current.toggleActivity(id); });
    awardXP.mockClear();
    act(() => { result.current.toggleActivity(id); }); // untoggle
    expect(awardXP).not.toHaveBeenCalled();
  });
});

// ── addCustomActivity / removeCustomActivity ──────────────────────────────────

describe('addCustomActivity', () => {
  const customAct = {
    title: 'Meditation', subtitle: '10 min', icon: '🧘', category: 'morning' as const,
    hour: 7, minute: 0, durationMins: 10, xp: 20,
  };

  test('adds a custom activity to the list', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const before = result.current.activities.length;
    act(() => { result.current.addCustomActivity(customAct); });
    expect(result.current.activities.length).toBe(before + 1);
  });

  test('custom activity has isDefault=false', () => {
    const { result } = renderHook(() => useDailyRoutine());
    act(() => { result.current.addCustomActivity(customAct); });
    const added = result.current.activities.find(a => a.title === 'Meditation');
    expect(added?.isDefault).toBe(false);
  });

  test('custom activity id starts with custom_', () => {
    const { result } = renderHook(() => useDailyRoutine());
    act(() => { result.current.addCustomActivity(customAct); });
    const added = result.current.activities.find(a => a.title === 'Meditation');
    expect(added?.id).toMatch(/^custom_/);
  });
});

describe('removeCustomActivity', () => {
  test('removes the custom activity from list', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const customAct = {
      title: 'Nap', subtitle: '20 min', icon: '😴', category: 'sleep' as const,
      hour: 14, minute: 0, durationMins: 20, xp: 10,
    };
    act(() => { result.current.addCustomActivity(customAct); });
    const added = result.current.activities.find(a => a.title === 'Nap');
    const before = result.current.activities.length;
    act(() => { result.current.removeCustomActivity(added!.id); });
    expect(result.current.activities.length).toBe(before - 1);
    expect(result.current.activities.find(a => a.title === 'Nap')).toBeUndefined();
  });
});

// ── navigation ────────────────────────────────────────────────────────────────

describe('navigation', () => {
  test('isToday is true on mount', () => {
    const { result } = renderHook(() => useDailyRoutine());
    expect(result.current.isToday).toBe(true);
  });

  test('goToPrevDay moves viewDate back one day', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const before = result.current.viewDate.getTime();
    act(() => { result.current.goToPrevDay(); });
    expect(result.current.viewDate.getTime()).toBe(before - 86400000);
  });

  test('isToday is false after goToPrevDay', () => {
    const { result } = renderHook(() => useDailyRoutine());
    act(() => { result.current.goToPrevDay(); });
    expect(result.current.isToday).toBe(false);
  });

  test('goToNextDay does not go past today', () => {
    const { result } = renderHook(() => useDailyRoutine());
    const before = result.current.viewDate.getTime();
    act(() => { result.current.goToNextDay(); }); // already on today
    expect(result.current.viewDate.getTime()).toBe(before);
  });

  test('goToNextDay moves forward after goToPrevDay', () => {
    const { result } = renderHook(() => useDailyRoutine());
    act(() => { result.current.goToPrevDay(); });
    const afterPrev = result.current.viewDate.getTime();
    act(() => { result.current.goToNextDay(); });
    expect(result.current.viewDate.getTime()).toBeGreaterThan(afterPrev);
  });

  test('goToToday returns to today after navigation', () => {
    const { result } = renderHook(() => useDailyRoutine());
    act(() => { result.current.goToPrevDay(); result.current.goToPrevDay(); });
    act(() => { result.current.goToToday(); });
    expect(result.current.isToday).toBe(true);
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe('localStorage persistence', () => {
  test('completion state survives remount', () => {
    const { result: r1 } = renderHook(() => useDailyRoutine());
    const id = r1.current.activities[0].id;
    act(() => { r1.current.toggleActivity(id); });

    const { result: r2 } = renderHook(() => useDailyRoutine());
    expect(r2.current.activities.find(a => a.id === id)?.completed).toBe(true);
  });

  test('custom activities survive remount', () => {
    const { result: r1 } = renderHook(() => useDailyRoutine());
    act(() => {
      r1.current.addCustomActivity({
        title: 'Yoga', subtitle: '20 min', icon: '🧘', category: 'morning' as const,
        hour: 6, minute: 30, durationMins: 20, xp: 25,
      });
    });

    const { result: r2 } = renderHook(() => useDailyRoutine());
    expect(r2.current.activities.find(a => a.title === 'Yoga')).toBeDefined();
  });
});
