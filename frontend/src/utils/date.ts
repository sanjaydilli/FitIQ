/** Returns today's date in YYYY-MM-DD using the device's local timezone. */
export function localDateStr(): string {
  return formatLocalDate(new Date());
}

/** Formats any Date as YYYY-MM-DD using the device's local timezone. */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
