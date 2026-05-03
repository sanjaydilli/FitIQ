import React, { useId } from 'react';

interface RingMeterProps {
  value?: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  gradient?: [string, string];
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
}

export function RingMeter({
  value = 72,
  max = 100,
  size = 180,
  stroke = 14,
  color = '#7CF9C5',
  track = 'rgba(255,255,255,0.08)',
  gradient,
  label,
  sublabel,
}: RingMeterProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const dash = c * pct;
  const id = 'rg-' + useId().replace(/:/g, '');

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          {gradient && (
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          )}
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={gradient ? `url(#${id})` : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {label}
        {sublabel}
      </div>
    </div>
  );
}
