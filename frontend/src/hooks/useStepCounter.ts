import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import StepCounter from '../plugins/StepCounter';
import { useUser } from '../context/UserContext';

const BASELINE_KEY = 'fitiq.stepBaseline';
const BASELINE_DATE_KEY = 'fitiq.stepBaselineDate';

// Reads the hardware step counter and updates today's step count.
// TYPE_STEP_COUNTER is a cumulative sensor (steps since reboot).
// We store today's "start value" as baseline and compute: today = current - baseline.
export function useStepCounter() {
  const { update } = useUser();

  const sync = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { steps, available } = await StepCounter.getSteps();
      if (!available) return;

      const today = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem(BASELINE_DATE_KEY);
      const savedBaseline = parseInt(localStorage.getItem(BASELINE_KEY) ?? '0', 10);

      let baseline = savedBaseline;
      if (savedDate !== today) {
        // New day — set today's baseline to current sensor value
        baseline = steps;
        localStorage.setItem(BASELINE_KEY, String(steps));
        localStorage.setItem(BASELINE_DATE_KEY, today);
      }

      const todaySteps = Math.max(0, steps - baseline);
      update({ steps: todaySteps, stepsDate: today });
    } catch {
      // Sensor not available on this device
    }
  }, [update]);

  useEffect(() => {
    sync();
    // Re-sync every 60 seconds while app is open
    const interval = setInterval(sync, 60_000);
    return () => clearInterval(interval);
  }, [sync]);
}
