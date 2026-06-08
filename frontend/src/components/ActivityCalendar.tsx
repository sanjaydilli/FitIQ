import React, { memo, useMemo } from 'react';
import { formatLocalDate } from '../utils/date';
import { motion } from 'framer-motion';

export interface DayActivity {
  date: string;       // YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4;  // 0=none, 4=max
  tooltip?: string;
}

interface ActivityCalendarProps {
  days: DayActivity[];
  color: string;
  weeks?: number;     // how many weeks to show (default 26 = ~6 months)
  onDayPress?: (date: string) => void;
}

function datesBetween(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(formatLocalDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getMonthLabels(startDate: Date, weeks: number): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  const seen = new Set<string>();
  for (let w = 0; w < weeks; w++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + w * 7);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      labels.push({
        label: d.toLocaleString('default', { month: 'short' }),
        col: w,
      });
    }
  }
  return labels;
}

const LEVEL_OPACITY = [0.06, 0.25, 0.5, 0.75, 1.0];
const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

export const ActivityCalendar = memo(function ActivityCalendar({
  days,
  color,
  weeks = 26,
  onDayPress,
}: ActivityCalendarProps) {
  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    // Align start to Sunday
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - weeks * 7 + 1);
    // Go back to the nearest Sunday before start
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);

    const allDates = datesBetween(start, end);
    const map: Record<string, DayActivity> = {};
    days.forEach(d => { map[d.date] = d; });

    // Build weeks×7 grid
    const cols: (DayActivity | null)[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: (DayActivity | null)[] = [];
      for (let dow = 0; dow < 7; dow++) {
        const idx = w * 7 + dow;
        const date = allDates[idx];
        if (!date) { col.push(null); continue; }
        const dateObj = new Date(date + 'T00:00:00');
        if (dateObj > today) { col.push(null); continue; }
        col.push(map[date] ?? { date, level: 0 });
      }
      cols.push(col);
    }

    return {
      grid: cols,
      startDate: start,
      monthLabels: getMonthLabels(start, weeks),
    };
  }, [days, weeks]);

  const CELL = 11;
  const GAP = 2;
  const STEP = CELL + GAP;
  const LEFT_PAD = 14;
  const TOP_PAD = 16;
  const svgW = LEFT_PAD + weeks * STEP;
  const svgH = TOP_PAD + 7 * STEP;

  return (
    <div style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
      <svg
        width={svgW}
        height={svgH}
        style={{ display: 'block', minWidth: svgW }}
      >
        {/* Day-of-week labels */}
        {DAY_LABELS.map((l, i) => l && (
          <text
            key={i}
            x={LEFT_PAD - 4}
            y={TOP_PAD + i * STEP + CELL * 0.75}
            fontSize="7"
            fill="rgba(255,255,255,0.3)"
            textAnchor="end"
            fontFamily="ui-monospace, monospace"
          >
            {l}
          </text>
        ))}

        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text
            key={`${label}-${col}`}
            x={LEFT_PAD + col * STEP}
            y={TOP_PAD - 4}
            fontSize="7"
            fill="rgba(255,255,255,0.4)"
            fontFamily="ui-monospace, monospace"
          >
            {label}
          </text>
        ))}

        {/* Day cells */}
        {grid.map((col, w) =>
          col.map((day, dow) => {
            if (!day) return null;
            const x = LEFT_PAD + w * STEP;
            const y = TOP_PAD + dow * STEP;
            const opacity = LEVEL_OPACITY[day.level];
            return (
              <motion.rect
                key={`${w}-${dow}`}
                x={x} y={y}
                width={CELL} height={CELL}
                rx={2}
                fill={color}
                fillOpacity={opacity}
                stroke={day.level > 0 ? color : 'rgba(255,255,255,0.05)'}
                strokeOpacity={day.level > 0 ? 0.4 : 1}
                strokeWidth={0.5}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: (w * 7 + dow) * 0.001, duration: 0.2 }}
                onClick={() => onDayPress?.(day.date)}
                style={{ cursor: onDayPress ? 'pointer' : 'default' }}
              />
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: LEFT_PAD, marginTop: 4 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace' }}>Less</span>
        {[0, 1, 2, 3, 4].map(l => (
          <div
            key={l}
            style={{
              width: 9, height: 9, borderRadius: 2,
              background: color,
              opacity: LEVEL_OPACITY[l],
              border: l === 0 ? '0.5px solid rgba(255,255,255,0.1)' : 'none',
            }}
          />
        ))}
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace' }}>More</span>
      </div>
    </div>
  );
});
