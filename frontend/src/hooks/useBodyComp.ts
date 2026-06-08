import { localDateStr } from '../utils/date';
import { useCallback, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import { navyBodyFat, calcBMR, calcTDEE, calcBodyComp } from '../utils/bodyComposition';

export interface Measurement {
  date: string;       // YYYY-MM-DD
  weightKg: number;
  waistCm: number;
  neckCm: number;
  hipCm?: number;     // women
  bodyFatPct: number;
  leanMass: number;
  fatMass: number;
}

const STORAGE_KEY  = 'fitiq.bodyComp';
const MAX_ENTRIES  = 52; // ~1 year of weekly entries

function load(): Measurement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Measurement[]) : [];
  } catch { return []; }
}

function save(entries: Measurement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch { /* quota */ }
}

export function useBodyComp() {
  const { user } = useUser();
  const [measurements, setMeasurements] = useState<Measurement[]>(load);

  const addMeasurement = useCallback((params: {
    weightKg: number;
    waistCm: number;
    neckCm: number;
    hipCm?: number;
  }) => {
    const bf = navyBodyFat({ sex: user.sex, heightCm: user.heightCm, ...params });
    const { leanMass, fatMass } = calcBodyComp(params.weightKg, bf);
    const entry: Measurement = {
      date: localDateStr(),
      ...params,
      bodyFatPct: bf,
      leanMass,
      fatMass,
    };
    setMeasurements(prev => {
      // Replace if same date, else append
      const filtered = prev.filter(m => m.date !== entry.date);
      const next = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
      save(next);
      return next;
    });
    return entry;
  }, [user.sex, user.heightCm]);

  const latest = measurements[measurements.length - 1] ?? null;

  const bmr  = useMemo(() => calcBMR({
    sex: user.sex, weightKg: latest?.weightKg ?? user.weightKg,
    heightCm: user.heightCm, age: user.age,
  }), [user, latest]);

  const tdee = useMemo(() => calcTDEE(bmr, user.activity), [bmr, user.activity]);

  // Trends: compare latest vs 4 weeks ago
  const trend = useMemo(() => {
    if (measurements.length < 2) return null;
    const cur = measurements[measurements.length - 1];
    const ref = measurements[Math.max(0, measurements.length - 5)];
    return {
      weightDelta: Math.round((cur.weightKg - ref.weightKg) * 10) / 10,
      fatPctDelta: Math.round((cur.bodyFatPct - ref.bodyFatPct) * 10) / 10,
      leanDelta:   Math.round((cur.leanMass - ref.leanMass) * 10) / 10,
    };
  }, [measurements]);

  return { measurements, latest, addMeasurement, bmr, tdee, trend };
}
