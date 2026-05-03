const STORAGE_KEY = 'fitiq.warnings';

interface CooldownEntry {
  lastShownAt: number;    // Unix ms
  actedOnAt: number | null;
  snoozedUntil: number | null;
}

type CooldownStore = Record<string, CooldownEntry>;

function load(): CooldownStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CooldownStore) : {};
  } catch {
    return {};
  }
}

function save(store: CooldownStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
}

export function canShowWarning(warningId: string, cooldownHours: number): boolean {
  const store = load();
  const entry = store[warningId];
  if (!entry) return true;

  const now = Date.now();

  // Snoozed — respect snooze window
  if (entry.snoozedUntil && now < entry.snoozedUntil) return false;

  // Already acted on — still respect regular cooldown
  const cooldownMs = cooldownHours * 60 * 60 * 1000;
  return now - entry.lastShownAt >= cooldownMs;
}

export function markWarningShown(warningId: string): void {
  const store = load();
  store[warningId] = {
    lastShownAt: Date.now(),
    actedOnAt: store[warningId]?.actedOnAt ?? null,
    snoozedUntil: null,
  };
  save(store);
}

export function markWarningActedOn(warningId: string): void {
  const store = load();
  const existing = store[warningId] ?? { lastShownAt: Date.now(), actedOnAt: null, snoozedUntil: null };
  store[warningId] = { ...existing, actedOnAt: Date.now() };
  save(store);
}

export function snoozeWarning(warningId: string, hours: number): void {
  const store = load();
  const existing = store[warningId] ?? { lastShownAt: Date.now(), actedOnAt: null, snoozedUntil: null };
  store[warningId] = {
    ...existing,
    snoozedUntil: Date.now() + hours * 60 * 60 * 1000,
  };
  save(store);
}

export function clearWarningCooldown(warningId: string): void {
  const store = load();
  delete store[warningId];
  save(store);
}
