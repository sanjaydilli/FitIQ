import { useCallback, useState } from 'react';
import { DayPlan } from '../services/programPlannerService';

const KEY = 'fitiq.customPlan';

export interface CustomPlan {
  name: string;
  weeklyPlan: DayPlan[];
  updatedAt: string;
}

function load(): CustomPlan | null {
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) as CustomPlan : null;
  } catch {
    return null;
  }
}

/** Standalone, user-built workout plan — independent of the 3-month program. */
export function useCustomPlan() {
  const [customPlan, setCustomPlan] = useState<CustomPlan | null>(load);

  const saveCustomPlan = useCallback((name: string, weeklyPlan: DayPlan[]) => {
    const plan: CustomPlan = { name, weeklyPlan, updatedAt: new Date().toISOString() };
    setCustomPlan(plan);
    try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch { /* quota */ }
  }, []);

  const deleteCustomPlan = useCallback(() => {
    setCustomPlan(null);
    localStorage.removeItem(KEY);
  }, []);

  return { customPlan, saveCustomPlan, deleteCustomPlan };
}
