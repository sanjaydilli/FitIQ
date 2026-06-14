import { formatLocalDate, localDateStr } from '../utils/date';

describe('formatLocalDate', () => {
  test('formats a known date correctly', () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05');   // Jan 5
    expect(formatLocalDate(new Date(2026, 11, 31))).toBe('2026-12-31'); // Dec 31
  });

  test('pads month and day with leading zero', () => {
    const d = formatLocalDate(new Date(2026, 2, 7)); // March 7
    expect(d).toBe('2026-03-07');
  });

  test('returns YYYY-MM-DD format', () => {
    const d = formatLocalDate(new Date(2026, 5, 13));
    expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('localDateStr', () => {
  test('returns today in YYYY-MM-DD format', () => {
    expect(localDateStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('matches formatLocalDate(new Date())', () => {
    // Both called within the same second — should match
    expect(localDateStr()).toBe(formatLocalDate(new Date()));
  });
});
