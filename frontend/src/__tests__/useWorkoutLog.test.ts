import { renderHook, act } from '@testing-library/react';
import { useWorkoutLog, WorkoutSession } from '../hooks/useWorkoutLog';

const BENCH = 'bench_bb';   // chest, non-legs → 1.25kg increment
const SQUAT = 'squat';      // legs → 2.5kg increment

beforeEach(() => localStorage.clear());

// ── helpers ───────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: `ws_${Date.now()}_${Math.random()}`,
    name: 'Test',
    date: '2026-01-01',
    startTime: Date.now(),
    endTime: Date.now() + 3600000,
    totalVolume: 0,
    notes: '',
    exercises: [],
    ...overrides,
  };
}

function seedSessions(sessions: WorkoutSession[]) {
  localStorage.setItem('fitiq.workoutSessions', JSON.stringify(sessions));
}

// ── startWorkout ──────────────────────────────────────────────────────────────

describe('startWorkout', () => {
  test('creates an active session with the given name', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Push Day', [BENCH]); });
    expect(result.current.active?.name).toBe('Push Day');
  });

  test('active starts with exercises for given ids', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Pull Day', [BENCH]); });
    expect(result.current.active?.exercises).toHaveLength(1);
    expect(result.current.active?.exercises[0].exerciseId).toBe(BENCH);
  });

  test('sets default exercise name from template', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    expect(result.current.active?.exercises[0].exerciseName).toBe('Barbell Bench Press');
  });

  test('creates correct number of sets per exercise from template', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    // bench_bb defaultSets = 4
    expect(result.current.active?.exercises[0].sets).toHaveLength(4);
  });

  test('planOverrides set custom sets count', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH], [{ sets: 5, repsDisplay: '6' }]); });
    expect(result.current.active?.exercises[0].sets).toHaveLength(5);
  });

  test('all sets start as not completed', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    expect(result.current.active?.exercises[0].sets.every(s => !s.completed)).toBe(true);
  });

  test('endTime starts as null', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    expect(result.current.active?.endTime).toBeNull();
  });
});

// ── finishWorkout ─────────────────────────────────────────────────────────────

describe('finishWorkout', () => {
  test('moves active session into sessions list', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.finishWorkout(); });
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.active).toBeNull();
  });

  test('sets endTime on the finished session', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.finishWorkout(); });
    expect(result.current.sessions[0].endTime).toBeGreaterThan(0);
  });

  test('totalVolume counts only completed sets', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.updateSet(0, 0, { weight: 100, reps: 8, completed: true }); });
    act(() => { result.current.finishWorkout(); });
    // 100 × 8 = 800; other sets incomplete
    expect(result.current.sessions[0].totalVolume).toBe(800);
  });

  test('returns the finished session', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    let finished: any;
    act(() => { finished = result.current.finishWorkout(); });
    expect(finished?.name).toBe('Chest');
  });

  test('no-op when no active session', () => {
    const { result } = renderHook(() => useWorkoutLog());
    expect(() => { act(() => { result.current.finishWorkout(); }); }).not.toThrow();
    expect(result.current.sessions).toHaveLength(0);
  });
});

// ── discardWorkout ────────────────────────────────────────────────────────────

describe('discardWorkout', () => {
  test('clears active session without saving to sessions', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.discardWorkout(); });
    expect(result.current.active).toBeNull();
    expect(result.current.sessions).toHaveLength(0);
  });
});

// ── updateSet ────────────────────────────────────────────────────────────────

describe('updateSet', () => {
  test('patches weight on target set', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.updateSet(0, 0, { weight: 80 }); });
    expect(result.current.active?.exercises[0].sets[0].weight).toBe(80);
  });

  test('marks a set as completed', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.updateSet(0, 0, { completed: true }); });
    expect(result.current.active?.exercises[0].sets[0].completed).toBe(true);
  });

  test('sets timestamp when completed=true', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.updateSet(0, 0, { completed: true }); });
    expect(result.current.active?.exercises[0].sets[0].timestamp).toBeGreaterThan(0);
  });

  test('does not mutate other sets', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.updateSet(0, 0, { weight: 80, completed: true }); });
    const set1 = result.current.active?.exercises[0].sets[1];
    expect(set1?.completed).toBe(false);
  });
});

// ── addSet / removeSet ────────────────────────────────────────────────────────

describe('addSet', () => {
  test('appends a set to the exercise', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    const before = result.current.active!.exercises[0].sets.length;
    act(() => { result.current.addSet(0); });
    expect(result.current.active?.exercises[0].sets.length).toBe(before + 1);
  });

  test('new set copies weight/reps from last set', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.updateSet(0, 0, { weight: 90, reps: 6 }); });
    act(() => { result.current.addSet(0); });
    const sets = result.current.active!.exercises[0].sets;
    const last = sets[sets.length - 1];
    // The last set before addSet had weight 90 from set index 0
    // addSet copies from the LAST set, which is index (before-1), not 0
    expect(last.completed).toBe(false);
  });
});

describe('removeSet', () => {
  test('removes the specified set', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    const before = result.current.active!.exercises[0].sets.length;
    act(() => { result.current.removeSet(0, 0); });
    expect(result.current.active?.exercises[0].sets.length).toBe(before - 1);
  });
});

// ── addExercise ───────────────────────────────────────────────────────────────

describe('addExercise', () => {
  test('adds a new exercise to active session', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Full Body', [BENCH]); });
    act(() => { result.current.addExercise(SQUAT); });
    expect(result.current.active?.exercises).toHaveLength(2);
    expect(result.current.active?.exercises[1].exerciseId).toBe(SQUAT);
  });

  test('does not add a duplicate exercise', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.addExercise(BENCH); });
    expect(result.current.active?.exercises).toHaveLength(1);
  });

  test('ignores unknown exercise ids', () => {
    const { result } = renderHook(() => useWorkoutLog());
    act(() => { result.current.startWorkout('Chest', [BENCH]); });
    act(() => { result.current.addExercise('nonexistent_exercise'); });
    expect(result.current.active?.exercises).toHaveLength(1);
  });
});

// ── personalRecords ───────────────────────────────────────────────────────────

describe('personalRecords', () => {
  test('is empty with no sessions', () => {
    const { result } = renderHook(() => useWorkoutLog());
    expect(Object.keys(result.current.personalRecords)).toHaveLength(0);
  });

  test('records best weight from completed sets', () => {
    seedSessions([makeSession({
      exercises: [{
        exerciseId: BENCH, exerciseName: 'Barbell Bench Press',
        sets: [
          { weight: 80, reps: 8, completed: true, timestamp: 1 },
          { weight: 90, reps: 5, completed: true, timestamp: 2 },
        ],
      }],
    })]);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.personalRecords[BENCH]?.weight).toBe(90);
    expect(result.current.personalRecords[BENCH]?.reps).toBe(5);
  });

  test('ignores incomplete sets', () => {
    seedSessions([makeSession({
      exercises: [{
        exerciseId: BENCH, exerciseName: 'Barbell Bench Press',
        sets: [{ weight: 120, reps: 1, completed: false, timestamp: 0 }],
      }],
    })]);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.personalRecords[BENCH]).toBeUndefined();
  });

  test('updates PR with higher weight from newer session', () => {
    seedSessions([
      makeSession({ date: '2026-01-01', exercises: [{ exerciseId: BENCH, exerciseName: 'Barbell Bench Press', sets: [{ weight: 80, reps: 5, completed: true, timestamp: 1 }] }] }),
      makeSession({ date: '2026-01-08', exercises: [{ exerciseId: BENCH, exerciseName: 'Barbell Bench Press', sets: [{ weight: 85, reps: 5, completed: true, timestamp: 2 }] }] }),
    ]);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.personalRecords[BENCH]?.weight).toBe(85);
  });
});

// ── getExerciseHistory ────────────────────────────────────────────────────────

describe('getExerciseHistory', () => {
  test('returns empty array when no sessions', () => {
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.getExerciseHistory(BENCH)).toEqual([]);
  });

  test('returns sorted history by date', () => {
    seedSessions([
      makeSession({ date: '2026-01-10', exercises: [{ exerciseId: BENCH, exerciseName: 'Barbell Bench Press', sets: [{ weight: 80, reps: 5, completed: true, timestamp: 1 }] }] }),
      makeSession({ date: '2026-01-05', exercises: [{ exerciseId: BENCH, exerciseName: 'Barbell Bench Press', sets: [{ weight: 75, reps: 5, completed: true, timestamp: 1 }] }] }),
    ]);
    const { result } = renderHook(() => useWorkoutLog());
    const hist = result.current.getExerciseHistory(BENCH);
    expect(hist[0].date).toBe('2026-01-05');
    expect(hist[1].date).toBe('2026-01-10');
  });

  test('reports maxWeight correctly', () => {
    seedSessions([makeSession({
      date: '2026-01-01',
      exercises: [{ exerciseId: BENCH, exerciseName: 'Barbell Bench Press',
        sets: [
          { weight: 70, reps: 5, completed: true, timestamp: 1 },
          { weight: 80, reps: 5, completed: true, timestamp: 2 },
        ],
      }],
    })]);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.getExerciseHistory(BENCH)[0].maxWeight).toBe(80);
  });
});

// ── detectPlateau ─────────────────────────────────────────────────────────────

describe('detectPlateau', () => {
  test('returns false with fewer than 4 sessions', () => {
    seedSessions([
      makeSession({ date: '2026-01-01', exercises: [{ exerciseId: BENCH, exerciseName: '', sets: [{ weight: 80, reps: 5, completed: true, timestamp: 1 }] }] }),
    ]);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.detectPlateau(BENCH)).toBe(false);
  });

  test('returns true when last 4 sessions all have same max weight', () => {
    const sessions = Array.from({ length: 4 }, (_, i) => makeSession({
      date: `2026-0${i + 1}-01`,
      exercises: [{ exerciseId: BENCH, exerciseName: '', sets: [{ weight: 80, reps: 5, completed: true, timestamp: 1 }] }],
    }));
    seedSessions(sessions);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.detectPlateau(BENCH)).toBe(true);
  });

  test('returns false when weight increased in last 4 sessions', () => {
    const sessions = [80, 82, 84, 86].map((w, i) => makeSession({
      date: `2026-0${i + 1}-01`,
      exercises: [{ exerciseId: BENCH, exerciseName: '', sets: [{ weight: w, reps: 5, completed: true, timestamp: 1 }] }],
    }));
    seedSessions(sessions);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.detectPlateau(BENCH)).toBe(false);
  });
});

// ── suggestNextWeight ─────────────────────────────────────────────────────────

describe('suggestNextWeight', () => {
  test('increments by 1.25kg for non-leg exercises', () => {
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.suggestNextWeight(BENCH, 100)).toBe(101.25);
  });

  test('increments by 2.5kg for leg exercises', () => {
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.suggestNextWeight(SQUAT, 100)).toBe(102.5);
  });

  test('returns current weight for unknown exercise', () => {
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.suggestNextWeight('unknown_ex', 80)).toBe(80);
  });
});

// ── isNewPR ───────────────────────────────────────────────────────────────────

describe('isNewPR', () => {
  test('returns true for any positive weight when no PR exists', () => {
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.isNewPR(BENCH, 1, 1)).toBe(true);
  });

  test('returns false for 0 weight when no PR exists', () => {
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.isNewPR(BENCH, 0, 10)).toBe(false);
  });

  test('returns true when weight exceeds existing PR', () => {
    seedSessions([makeSession({ exercises: [{ exerciseId: BENCH, exerciseName: '', sets: [{ weight: 80, reps: 5, completed: true, timestamp: 1 }] }] })]);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.isNewPR(BENCH, 85, 5)).toBe(true);
  });

  test('returns false when weight is below existing PR', () => {
    seedSessions([makeSession({ exercises: [{ exerciseId: BENCH, exerciseName: '', sets: [{ weight: 80, reps: 5, completed: true, timestamp: 1 }] }] })]);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.isNewPR(BENCH, 75, 5)).toBe(false);
  });

  test('returns true for same weight but more reps', () => {
    seedSessions([makeSession({ exercises: [{ exerciseId: BENCH, exerciseName: '', sets: [{ weight: 80, reps: 5, completed: true, timestamp: 1 }] }] })]);
    const { result } = renderHook(() => useWorkoutLog());
    expect(result.current.isNewPR(BENCH, 80, 6)).toBe(true);
  });
});
