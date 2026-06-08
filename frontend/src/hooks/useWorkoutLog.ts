import { localDateStr } from '../utils/date';
import { useCallback, useMemo, useState } from 'react';
import { getExercise } from '../data/exercises';

// ── Data model ────────────────────────────────────────────────────────────────

export interface SetEntry {
  weight: number;    // kg (0 for bodyweight)
  reps: number;
  completed: boolean;
  timestamp: number;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;          // YYYY-MM-DD
  startTime: number;
  endTime: number | null;
  exercises: ExerciseLog[];
  totalVolume: number;   // sum of weight × reps across all sets
  notes: string;
}

export interface PersonalRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
}

// ── Storage ───────────────────────────────────────────────────────────────────

const SESSIONS_KEY = 'fitiq.workoutSessions';
const ACTIVE_KEY   = 'fitiq.activeWorkout';
const MAX_SESSIONS = 120;

function loadSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
  } catch { return []; }
}

function saveSessions(sessions: WorkoutSession[]) {
  try {
    const trimmed = sessions.slice(-MAX_SESSIONS);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
  } catch { /* quota */ }
}

function loadActive(): WorkoutSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as WorkoutSession) : null;
  } catch { return null; }
}

function saveActive(session: WorkoutSession | null) {
  try {
    if (session) localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
    else localStorage.removeItem(ACTIVE_KEY);
  } catch { /* quota */ }
}

function today(): string {
  return localDateStr();
}

function calcVolume(exercises: ExerciseLog[]): number {
  return exercises.reduce((total, ex) =>
    total + ex.sets.filter(s => s.completed).reduce((t, s) => t + s.weight * s.reps, 0), 0
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWorkoutLog() {
  const [sessions, setSessions]     = useState<WorkoutSession[]>(loadSessions);
  const [active, setActive]         = useState<WorkoutSession | null>(loadActive);

  // ── Derived ──

  const personalRecords = useMemo((): Record<string, PersonalRecord> => {
    const prs: Record<string, PersonalRecord> = {};
    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        ex.sets.filter(s => s.completed && s.weight > 0).forEach(s => {
          const cur = prs[ex.exerciseId];
          if (!cur || s.weight > cur.weight || (s.weight === cur.weight && s.reps > cur.reps)) {
            prs[ex.exerciseId] = { exerciseId: ex.exerciseId, weight: s.weight, reps: s.reps, date: session.date };
          }
        });
      });
    });
    return prs;
  }, [sessions]);

  // ── Session management ──

  const startWorkout = useCallback((name: string, exerciseIds: string[]) => {
    const session: WorkoutSession = {
      id: `ws_${Date.now()}`,
      name,
      date: today(),
      startTime: Date.now(),
      endTime: null,
      totalVolume: 0,
      notes: '',
      exercises: exerciseIds.map(id => {
        const tmpl = getExercise(id);
        return {
          exerciseId: id,
          exerciseName: tmpl?.name ?? id,
          sets: Array.from({ length: tmpl?.defaultSets ?? 3 }, () => ({
            weight: getLastWeight(sessions, id),
            reps: tmpl?.defaultReps ?? 10,
            completed: false,
            timestamp: 0,
          })),
        };
      }),
    };
    setActive(session);
    saveActive(session);
  }, [sessions]);

  const finishWorkout = useCallback(() => {
    if (!active) return;
    const finished: WorkoutSession = {
      ...active,
      endTime: Date.now(),
      totalVolume: calcVolume(active.exercises),
    };
    setSessions(prev => {
      const next = [...prev, finished];
      saveSessions(next);
      return next;
    });
    setActive(null);
    saveActive(null);
    return finished;
  }, [active]);

  const discardWorkout = useCallback(() => {
    setActive(null);
    saveActive(null);
  }, []);

  // ── Live set mutations ──

  const updateSet = useCallback((exIdx: number, setIdx: number, patch: Partial<SetEntry>) => {
    setActive(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const sets = ex.sets.map((s, si) =>
          si === setIdx ? { ...s, ...patch, timestamp: patch.completed ? Date.now() : s.timestamp } : s
        );
        return { ...ex, sets };
      });
      const next = { ...prev, exercises, totalVolume: calcVolume(exercises) };
      saveActive(next);
      return next;
    });
  }, []);

  const addSet = useCallback((exIdx: number) => {
    setActive(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 10, completed: false, timestamp: 0 }],
        };
      });
      const next = { ...prev, exercises };
      saveActive(next);
      return next;
    });
  }, []);

  const removeSet = useCallback((exIdx: number, setIdx: number) => {
    setActive(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) };
      });
      const next = { ...prev, exercises };
      saveActive(next);
      return next;
    });
  }, []);

  const addExercise = useCallback((exerciseId: string) => {
    const tmpl = getExercise(exerciseId);
    if (!tmpl) return;
    setActive(prev => {
      if (!prev) return prev;
      if (prev.exercises.find(e => e.exerciseId === exerciseId)) return prev;
      const newEx: ExerciseLog = {
        exerciseId,
        exerciseName: tmpl.name,
        sets: Array.from({ length: tmpl.defaultSets }, () => ({
          weight: 0, reps: tmpl.defaultReps, completed: false, timestamp: 0,
        })),
      };
      const next = { ...prev, exercises: [...prev.exercises, newEx] };
      saveActive(next);
      return next;
    });
  }, []);

  // ── Analytics ──

  const getExerciseHistory = useCallback((exerciseId: string) => {
    return sessions
      .filter(s => s.exercises.some(e => e.exerciseId === exerciseId))
      .map(s => {
        const ex = s.exercises.find(e => e.exerciseId === exerciseId)!;
        const completedSets = ex.sets.filter(st => st.completed && st.weight > 0);
        const maxWeight = completedSets.length > 0 ? Math.max(...completedSets.map(st => st.weight)) : 0;
        const totalVol  = completedSets.reduce((t, st) => t + st.weight * st.reps, 0);
        return { date: s.date, maxWeight, totalVolume: totalVol, sets: completedSets };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sessions]);

  const detectPlateau = useCallback((exerciseId: string): boolean => {
    const hist = getExerciseHistory(exerciseId);
    if (hist.length < 4) return false;
    const recent = hist.slice(-4);
    const first = recent[0].maxWeight;
    return recent.every(h => h.maxWeight <= first);
  }, [getExerciseHistory]);

  const suggestNextWeight = useCallback((exerciseId: string, currentWeight: number): number => {
    const tmpl = getExercise(exerciseId);
    if (!tmpl) return currentWeight;
    const increment = tmpl.muscleGroup === 'legs' ? 2.5 : 1.25;
    return Math.round((currentWeight + increment) * 4) / 4;
  }, []);

  const isNewPR = useCallback((exerciseId: string, weight: number, reps: number): boolean => {
    const pr = personalRecords[exerciseId];
    if (!pr) return weight > 0;
    return weight > pr.weight || (weight === pr.weight && reps > pr.reps);
  }, [personalRecords]);

  return {
    // state
    sessions,
    active,
    personalRecords,
    // session
    startWorkout,
    finishWorkout,
    discardWorkout,
    // sets
    updateSet,
    addSet,
    removeSet,
    addExercise,
    // analytics
    getExerciseHistory,
    detectPlateau,
    suggestNextWeight,
    isNewPR,
  };
}

// Finds the most recent weight used for an exercise across all sessions
function getLastWeight(sessions: WorkoutSession[], exerciseId: string): number {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises.find(e => e.exerciseId === exerciseId);
    if (ex) {
      const done = ex.sets.filter(s => s.completed && s.weight > 0);
      if (done.length > 0) return Math.max(...done.map(s => s.weight));
    }
  }
  return 0;
}
