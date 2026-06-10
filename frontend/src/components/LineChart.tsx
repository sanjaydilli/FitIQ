import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  label: string;   // x-axis label (date or session #)
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color: string;
  height?: number;
  showDots?: boolean;
  showLabels?: boolean;
  unit?: string;
  prIndex?: number;  // index of PR point (highlighted)
  areaFill?: boolean;
}

export const LineChart = memo(function LineChart({
  data,
  color,
  height = 120,
  showDots = true,
  showLabels = true,
  unit = '',
  prIndex,
  areaFill = true,
}: LineChartProps) {
  if (data.length < 2) return null;

  const W = 320;
  const H = height;
  const PAD = { t: 12, r: 8, b: showLabels ? 24 : 8, l: 8 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const values = data.map(d => d.value);
  const minV   = Math.min(...values);
  const maxV   = Math.max(...values);
  const range  = maxV - minV || 1;

  function px(i: number): number { return PAD.l + (i / (data.length - 1)) * cW; }
  function py(v: number): number { return PAD.t + cH - ((v - minV) / range) * cH; }

  const points = data.map((d, i) => ({ x: px(i), y: py(d.value), ...d }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PAD.b} L ${PAD.l} ${H - PAD.b} Z`;

  const totalLen = points.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
  }, 0);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`area-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {areaFill && (
        <motion.path
          d={areaPath}
          fill={`url(#area-grad-${color.replace('#', '')})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ strokeDasharray: totalLen, strokeDashoffset: totalLen }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
      />

      {/* Dots + labels */}
      {showDots && points.map((p, i) => {
        const isPR  = i === prIndex;
        const isEnd = i === points.length - 1;
        if (!isPR && !isEnd && i % Math.ceil(data.length / 6) !== 0) return null;
        return (
          <g key={i}>
            <motion.circle
              cx={p.x} cy={p.y} r={isPR ? 6 : 4}
              fill={isPR ? '#D97706' : color}
              stroke={isPR ? '#D97706' : 'rgba(0,0,0,0.6)'}
              strokeWidth="1.5"
              initial={{ r: 0 }}
              animate={{ r: isPR ? 6 : 4 }}
              transition={{ delay: 0.7 + i * 0.03 }}
              style={{ filter: isPR ? 'drop-shadow(0 0 6px #D9770680)' : undefined }}
            />
            {isPR && (
              <text x={p.x} y={p.y - 12} textAnchor="middle"
                fontSize="9" fill="#D97706" fontWeight="700" fontFamily="ui-monospace, monospace">
                PR
              </text>
            )}
            {(isEnd || isPR) && (
              <text x={p.x} y={p.y - (isPR ? 20 : 14)} textAnchor="middle"
                fontSize="10" fill={isPR ? '#D97706' : color} fontWeight="700" fontFamily="ui-monospace, monospace">
                {p.value}{unit}
              </text>
            )}
          </g>
        );
      })}

      {/* X-axis labels */}
      {showLabels && points.filter((_, i) =>
        i === 0 || i === points.length - 1 || i % Math.ceil(data.length / 4) === 0
      ).map((p, i) => (
        <text key={i} x={p.x} y={H - 2} textAnchor="middle"
          fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="ui-monospace, monospace">
          {p.label}
        </text>
      ))}
    </svg>
  );
});
