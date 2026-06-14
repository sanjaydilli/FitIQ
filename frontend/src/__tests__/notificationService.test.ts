/**
 * Sprint 8 — notificationService scheduling logic.
 *
 * Everything is gated on Capacitor.isNativePlatform(), which is false under
 * jest, so we mock it to TRUE at module load and mock LocalNotifications to
 * capture schedule()/cancel() payloads. The interesting deterministic surface:
 *   - rescheduleAll(ctx): which reminders fire for a given daily context
 *   - todayAt(h): next occurrence of an hour (today, or tomorrow if past)
 *   - deterministic per-slot IDs so cancel+reschedule never duplicates
 *
 * Contract/coverage tests written against the documented intent.
 */

jest.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true },
}));
jest.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: jest.fn(() => Promise.resolve()),
    cancel: jest.fn(() => Promise.resolve()),
    checkPermissions: jest.fn(() => Promise.resolve({ display: 'granted' })),
    requestPermissions: jest.fn(() => Promise.resolve({ display: 'granted' })),
    createChannel: jest.fn(() => Promise.resolve()),
    addListener: jest.fn(() => Promise.resolve()),
  },
}));

import { LocalNotifications } from '@capacitor/local-notifications';
import {
  rescheduleAll, cancelCategory, initNotifications,
  attachNotificationTapHandler, NotificationContext,
} from '../services/notificationService';

const schedule = LocalNotifications.schedule as jest.Mock;
const cancel = LocalNotifications.cancel as jest.Mock;
const createChannel = LocalNotifications.createChannel as jest.Mock;
const addListener = LocalNotifications.addListener as jest.Mock;
const checkPermissions = LocalNotifications.checkPermissions as jest.Mock;
const requestPermissions = LocalNotifications.requestPermissions as jest.Mock;

type Notif = { id: number; title: string; body: string; channelId: string; schedule: { at: Date }; extra: { route: string } };

/** The notifications passed to the most recent schedule() call. */
function scheduled(): Notif[] {
  if (schedule.mock.calls.length === 0) return [];
  return schedule.mock.calls[schedule.mock.calls.length - 1][0].notifications as Notif[];
}
const ids = () => scheduled().map((n) => n.id).sort((a, b) => a - b);

// Everything done → nothing should schedule.
const allDone: NotificationContext = {
  waterMet: true,
  loggedMeals: { breakfast: true, lunch: true, dinner: true },
  workoutDone: true,
  streakActive: true,
  stepsPct: 1,
  coachOpenedToday: true,
};
// Nothing done → maximum reminders.
const nothingDone: NotificationContext = {
  waterMet: false,
  loggedMeals: { breakfast: false, lunch: false, dinner: false },
  workoutDone: false,
  streakActive: true,
  stepsPct: 0,
  coachOpenedToday: false,
};

beforeEach(() => {
  // CRA's jest preset sets resetMocks:true, wiping implementations before each
  // test — so re-establish the happy-path defaults here.
  schedule.mockResolvedValue(undefined);
  cancel.mockResolvedValue(undefined);
  createChannel.mockResolvedValue(undefined);
  addListener.mockResolvedValue(undefined);
  checkPermissions.mockResolvedValue({ display: 'granted' });
  requestPermissions.mockResolvedValue({ display: 'granted' });

  jest.useFakeTimers();
  // 06:00 — before every reminder hour, so todayAt() never rolls to tomorrow.
  jest.setSystemTime(new Date(2026, 5, 14, 6, 0, 0));
});
afterEach(() => jest.useRealTimers());

// ── rescheduleAll: selection rules ────────────────────────────────────────────

describe('rescheduleAll — selection rules', () => {
  test('schedules nothing when every goal is met', async () => {
    await rescheduleAll(allDone);
    expect(schedule).not.toHaveBeenCalled();
  });

  test('schedules the full set (13) when nothing is done', async () => {
    await rescheduleAll(nothingDone);
    // 7 water + 3 meals + 1 workout + 1 steps + 1 coach
    expect(scheduled()).toHaveLength(13);
  });

  test('omits water reminders once the water goal is met', async () => {
    await rescheduleAll({ ...nothingDone, waterMet: true });
    expect(ids().filter((id) => id >= 1001 && id <= 1007)).toEqual([]);
    expect(scheduled()).toHaveLength(6); // 3 meal + workout + steps + coach
  });

  test('only unlogged meals get a reminder, with stable per-slot IDs', async () => {
    await rescheduleAll({
      ...allDone, // suppress everything else
      loggedMeals: { breakfast: true, lunch: false, dinner: false },
    });
    const mealIds = ids().filter((id) => id >= 2001 && id <= 2003);
    // breakfast(2001) logged → skipped; lunch(2002) + dinner(2003) remain.
    expect(mealIds).toEqual([2002, 2003]);
  });

  test('workout reminder requires an active streak AND not done', async () => {
    await rescheduleAll({ ...allDone, streakActive: false, workoutDone: false });
    expect(ids()).not.toContain(3001);

    await rescheduleAll({ ...allDone, streakActive: true, workoutDone: false });
    expect(ids()).toContain(3001);
  });

  test('steps reminder fires below 80% but not at exactly 80%', async () => {
    await rescheduleAll({ ...allDone, stepsPct: 0.8 });
    expect(ids()).not.toContain(4001);

    await rescheduleAll({ ...allDone, stepsPct: 0.79 });
    expect(ids()).toContain(4001);
  });

  test('steps reminder body reflects the current percentage', async () => {
    await rescheduleAll({ ...allDone, stepsPct: 0.42 });
    const steps = scheduled().find((n) => n.id === 4001)!;
    expect(steps.body).toContain('42%');
  });

  test('coach nudge only when not opened today', async () => {
    await rescheduleAll({ ...allDone, coachOpenedToday: false });
    expect(ids()).toContain(5001);
  });
});

// ── dedup: cancel before schedule ─────────────────────────────────────────────

describe('rescheduleAll — cancel before schedule', () => {
  test('cancels all five categories before scheduling', async () => {
    await rescheduleAll(nothingDone);
    expect(cancel).toHaveBeenCalledTimes(5); // one cancelCategory per category
  });

  test('scheduled notifications carry deep-link routes', async () => {
    await rescheduleAll(nothingDone);
    const routes = new Set(scheduled().map((n) => n.extra.route));
    expect(routes).toEqual(new Set(['/home', '/food-log', '/workout', '/activity', '/coach']));
  });
});

// ── todayAt next-occurrence math (via scheduled times) ────────────────────────

describe('todayAt — next occurrence', () => {
  test('a future hour today schedules for today', async () => {
    // 06:00 now; coach is 9am → today.
    await rescheduleAll({ ...allDone, coachOpenedToday: false });
    const coach = scheduled().find((n) => n.id === 5001)!;
    expect(coach.schedule.at.getHours()).toBe(9);
    expect(coach.schedule.at.getDate()).toBe(14);
  });

  test('an hour already past today rolls to tomorrow', async () => {
    jest.setSystemTime(new Date(2026, 5, 14, 10, 0, 0)); // 10am, past 9am coach
    await rescheduleAll({ ...allDone, coachOpenedToday: false });
    const coach = scheduled().find((n) => n.id === 5001)!;
    expect(coach.schedule.at.getHours()).toBe(9);
    expect(coach.schedule.at.getDate()).toBe(15); // tomorrow
  });
});

// ── cancelCategory ────────────────────────────────────────────────────────────

describe('cancelCategory', () => {
  test('cancels exactly the slot IDs for the category', async () => {
    await cancelCategory('water');
    expect(cancel).toHaveBeenCalledWith({
      notifications: [1001, 1002, 1003, 1004, 1005, 1006, 1007].map((id) => ({ id })),
    });
  });
});

// ── initNotifications ─────────────────────────────────────────────────────────

describe('initNotifications', () => {
  test('returns true and creates all 5 channels when permission granted', async () => {
    const ok = await initNotifications();
    expect(ok).toBe(true);
    expect(createChannel).toHaveBeenCalledTimes(5);
  });

  test('requests permission when not already granted', async () => {
    checkPermissions.mockResolvedValueOnce({ display: 'denied' });
    requestPermissions.mockResolvedValueOnce({ display: 'granted' });
    const ok = await initNotifications();
    expect(requestPermissions).toHaveBeenCalled();
    expect(ok).toBe(true);
  });

  test('returns false (no channels) when permission denied', async () => {
    checkPermissions.mockResolvedValueOnce({ display: 'denied' });
    requestPermissions.mockResolvedValueOnce({ display: 'denied' });
    const ok = await initNotifications();
    expect(ok).toBe(false);
    expect(createChannel).not.toHaveBeenCalled();
  });
});

// ── attachNotificationTapHandler ──────────────────────────────────────────────

describe('attachNotificationTapHandler', () => {
  test('navigates to the route stored in notification.extra on tap', async () => {
    const navigate = jest.fn();
    let handler: (evt: { notification: { extra?: { route?: string } } }) => void = () => {};
    addListener.mockImplementationOnce((_evt: string, cb: typeof handler) => {
      handler = cb;
      return Promise.resolve();
    });
    await attachNotificationTapHandler(navigate);

    handler({ notification: { extra: { route: '/coach' } } });
    expect(navigate).toHaveBeenCalledWith('/coach');
  });

  test('ignores taps with no route', async () => {
    const navigate = jest.fn();
    let handler: (evt: { notification: { extra?: { route?: string } } }) => void = () => {};
    addListener.mockImplementationOnce((_evt: string, cb: typeof handler) => {
      handler = cb;
      return Promise.resolve();
    });
    await attachNotificationTapHandler(navigate);

    handler({ notification: { extra: {} } });
    expect(navigate).not.toHaveBeenCalled();
  });
});
