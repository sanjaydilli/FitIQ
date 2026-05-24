import { useEffect, useCallback, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import StepCounter from '../plugins/StepCounter';
import { useUser } from '../context/UserContext';

const BASELINE_KEY = 'fitiq.stepBaseline';
const BASELINE_DATE_KEY = 'fitiq.stepBaselineDate';

// Reads the hardware step counter and updates today's step count.
// TYPE_STEP_COUNTER is a cumulative sensor (steps since reboot).
// We store today's "start value" as baseline and compute: today = current - baseline.
export function useStepCounter() {
  const { update, user } = useUser();
  const stepsRef = useRef(user.steps);
  stepsRef.current = user.steps;

  const [permissionDenied, setPermissionDenied] = useState(false);

  const sync = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { steps, available } = await StepCounter.getSteps();
      if (!available) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);

      const today = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem(BASELINE_DATE_KEY);
      const savedBaseline = parseInt(localStorage.getItem(BASELINE_KEY) ?? '0', 10);

      let baseline = savedBaseline;
      if (savedDate !== today) {
        // New day — set today's baseline to current sensor value
        baseline = steps;
        localStorage.setItem(BASELINE_KEY, String(steps));
        localStorage.setItem(BASELINE_DATE_KEY, today);
      } else if (steps < baseline) {
        // Device rebooted — sensor reset to 0, restart baseline from current value
        baseline = steps;
        localStorage.setItem(BASELINE_KEY, String(steps));
      }

      const todaySteps = Math.max(0, steps - baseline);
      // Only update (and trigger Firestore write) when the count actually changed
      if (todaySteps !== stepsRef.current) {
        update({ steps: todaySteps, stepsDate: today });
      }
    } catch {
      // Sensor not available on this device
    }
  }, [update]);

  useEffect(() => {
    sync();
    const interval = setInterval(sync, 60_000);
    // Re-sync immediately when app comes back to foreground
    let resumeHandle: { remove: () => void } | null = null;
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) sync();
      }).then(h => { resumeHandle = h; });
    }
    return () => {
      clearInterval(interval);
      resumeHandle?.remove();
    };
  }, [sync]);

  return { permissionDenied };
}
