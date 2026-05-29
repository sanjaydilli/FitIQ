import { useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';
import { useUser, WATER_SLOT_CAPACITY, WATER_DROP_ML } from '../context/UserContext';
import { useFoodLog } from './useFoodLog';
import { useWorkoutLog } from './useWorkoutLog';
import { localDateStr } from '../utils/date';
import {
  initNotifications,
  rescheduleAll,
  attachNotificationTapHandler,
  NotificationContext,
} from '../services/notificationService';

const COACH_LAST_OPEN_KEY = 'fitiq.coach.lastOpen';
const TOTAL_WATER_L = (WATER_SLOT_CAPACITY.reduce((a, b) => a + b, 0) * WATER_DROP_ML) / 1000;

export function useNotifications() {
  const { user } = useUser();
  const { entries } = useFoodLog();
  const { sessions } = useWorkoutLog();
  const navigate = useNavigate();
  const initialized = useRef(false);

  // Build the current notification context from live state
  function buildCtx(): NotificationContext {
    const today = localDateStr();
    const todayEntries = entries.filter(e => e.date === today);
    const waterL = (user.waterDrops.reduce((a, b) => a + b, 0) * WATER_DROP_ML) / 1000;
    return {
      waterMet: waterL >= TOTAL_WATER_L,
      loggedMeals: {
        breakfast: todayEntries.some(e => e.meal === 'breakfast'),
        lunch:     todayEntries.some(e => e.meal === 'lunch'),
        dinner:    todayEntries.some(e => e.meal === 'dinner'),
      },
      workoutDone: sessions.some(s => s.date === today),
      streakActive: user.streak > 0,
      stepsPct: user.steps / Math.max(user.stepGoal, 1),
      coachOpenedToday: localStorage.getItem(COACH_LAST_OPEN_KEY) === today,
    };
  }

  // Init once: request permission, create channels, attach tap handler
  useEffect(() => {
    let cancelled = false;
    initNotifications().then(ok => {
      if (cancelled || !ok) return;
      initialized.current = true;
      attachNotificationTapHandler(navigate);
      rescheduleAll(buildCtx());
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reschedule when relevant data changes
  useEffect(() => {
    if (initialized.current) rescheduleAll(buildCtx());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.waterDrops, user.steps, user.streak, entries.length, sessions.length]);

  // Reschedule when app comes to foreground (catches midnight rollover)
  useEffect(() => {
    let handle: { remove: () => void } | null = null;
    CapApp.addListener('appStateChange', s => {
      if (s.isActive && initialized.current) rescheduleAll(buildCtx());
    }).then(h => { handle = h; });
    return () => { handle?.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Call this in AICoach screen on mount to mark coach as opened today. */
export function markCoachOpened() {
  localStorage.setItem(COACH_LAST_OPEN_KEY, localDateStr());
}
