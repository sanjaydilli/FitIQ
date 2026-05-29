import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const isNative = Capacitor.isNativePlatform();

export type NotifCategory = 'water' | 'meal' | 'workout' | 'steps' | 'coach';

const CHANNELS: Record<NotifCategory, { id: string; name: string; description: string; importance: number }> = {
  water:   { id: 'fitiq_water',   name: 'Water Reminders',   description: 'Hydration nudges',         importance: 3 },
  meal:    { id: 'fitiq_meal',    name: 'Meal Reminders',    description: 'Log your meals',            importance: 3 },
  workout: { id: 'fitiq_workout', name: 'Workout Reminders', description: 'Daily workout reminder',   importance: 4 },
  steps:   { id: 'fitiq_steps',  name: 'Step Reminders',    description: 'Activity nudges',           importance: 3 },
  coach:   { id: 'fitiq_coach',  name: 'AI Coach',          description: 'Daily coaching nudge',      importance: 3 },
};

// Deterministic IDs per slot so cancel+reschedule never creates duplicates
const NOTIF_IDS: Record<NotifCategory, number[]> = {
  water:   [1001, 1002, 1003, 1004, 1005, 1006, 1007], // every 2h 8am-8pm
  meal:    [2001, 2002, 2003],                          // 8am, 1pm, 7pm
  workout: [3001],                                       // 6pm
  steps:   [4001],                                       // 8pm
  coach:   [5001],                                       // 9am
};

export async function initNotifications(): Promise<boolean> {
  if (!isNative) return false;
  try {
    const perm = await LocalNotifications.checkPermissions();
    let granted = perm.display === 'granted';
    if (!granted) {
      const req = await LocalNotifications.requestPermissions();
      granted = req.display === 'granted';
    }
    if (!granted) return false;

    // Create Android 8+ channels
    for (const ch of Object.values(CHANNELS)) {
      await LocalNotifications.createChannel({
        id: ch.id,
        name: ch.name,
        description: ch.description,
        importance: ch.importance,
        visibility: 1,
        sound: 'default',
        vibration: true,
      } as Parameters<typeof LocalNotifications.createChannel>[0]);
    }
    return true;
  } catch {
    return false;
  }
}

export async function cancelCategory(cat: NotifCategory) {
  if (!isNative) return;
  try {
    await LocalNotifications.cancel({
      notifications: NOTIF_IDS[cat].map(id => ({ id })),
    });
  } catch { /* ignore */ }
}

/** Returns a Date for today at the given hour:minute, or tomorrow if already past. */
function todayAt(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

export interface NotificationContext {
  waterMet: boolean;
  loggedMeals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  workoutDone: boolean;
  streakActive: boolean;
  stepsPct: number;      // 0..1
  coachOpenedToday: boolean;
}

export async function rescheduleAll(ctx: NotificationContext) {
  if (!isNative) return;
  try {
    // Cancel all then re-schedule fresh to avoid stale notifications
    await Promise.all(
      (Object.keys(NOTIF_IDS) as NotifCategory[]).map(cancelCategory)
    );

    const notifications: Parameters<typeof LocalNotifications.schedule>[0]['notifications'] = [];

    // 1. Water — every 2h 8am-8pm while goal not met
    if (!ctx.waterMet) {
      [8, 10, 12, 14, 16, 18, 20].forEach((h, i) => {
        notifications.push({
          id: NOTIF_IDS.water[i],
          title: '💧 Stay hydrated',
          body: 'A glass of water keeps your energy and focus sharp.',
          channelId: CHANNELS.water.id,
          schedule: { at: todayAt(h), allowWhileIdle: true },
          extra: { route: '/home' },
        });
      });
    }

    // 2. Meals — fire only for meals not yet logged
    const mealSlots: Array<[number, keyof NotificationContext['loggedMeals'], string, string]> = [
      [8,  'breakfast', '🌅 Time for breakfast', 'Log your breakfast to start your macros right.'],
      [13, 'lunch',     '☀️ Time for lunch',     'Your midday meal keeps energy and protein on track.'],
      [19, 'dinner',    '🌙 Time for dinner',    'Log dinner to see how close you are to your targets.'],
    ];
    mealSlots.forEach(([h, key, title, body], i) => {
      if (ctx.loggedMeals[key]) return;
      notifications.push({
        id: NOTIF_IDS.meal[i],
        title,
        body,
        channelId: CHANNELS.meal.id,
        schedule: { at: todayAt(h), allowWhileIdle: true },
        extra: { route: '/food-log' },
      });
    });

    // 3. Workout — 6pm if streak active and not done today
    if (ctx.streakActive && !ctx.workoutDone) {
      notifications.push({
        id: NOTIF_IDS.workout[0],
        title: '🔥 Keep your streak alive',
        body: "Your workout is waiting — 30 minutes is all it takes.",
        channelId: CHANNELS.workout.id,
        schedule: { at: todayAt(18), allowWhileIdle: true },
        extra: { route: '/workout' },
      });
    }

    // 4. Steps — 8pm if below 80% of goal
    if (ctx.stepsPct < 0.8) {
      notifications.push({
        id: NOTIF_IDS.steps[0],
        title: '👟 Move a little more',
        body: `You're at ${Math.round(ctx.stepsPct * 100)}% of your step goal. An evening walk helps!`,
        channelId: CHANNELS.steps.id,
        schedule: { at: todayAt(20), allowWhileIdle: true },
        extra: { route: '/activity' },
      });
    }

    // 5. AI Coach — 9am nudge if not opened today
    if (!ctx.coachOpenedToday) {
      notifications.push({
        id: NOTIF_IDS.coach[0],
        title: '🤖 Your AI coach has insights',
        body: "Ask anything about your nutrition, training, or recovery.",
        channelId: CHANNELS.coach.id,
        schedule: { at: todayAt(9), allowWhileIdle: true },
        extra: { route: '/coach' },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch { /* ignore */ }
}

export async function attachNotificationTapHandler(navigate: (path: string) => void) {
  if (!isNative) return;
  try {
    await LocalNotifications.addListener('localNotificationActionPerformed', evt => {
      const route = (evt.notification.extra as { route?: string } | undefined)?.route;
      if (typeof route === 'string') navigate(route);
    });
  } catch { /* ignore */ }
}
