import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface MacroRingProps {
  calories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
}

export const MacroRing = memo(function MacroRing({
  calories,
  targetCalories,
  protein,
  carbs,
  fat,
  size = 110,
}: MacroRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const stroke = size * 0.09;
  const circumference = 2 * Math.PI * r;

  const total = protein * 4 + carbs * 4 + fat * 9;
  const carbArc   = total > 0 ? (carbs * 4 / total) * circumference : 0;
  const protArc   = total > 0 ? (protein * 4 / total) * circumference : 0;
  const fatArc    = total > 0 ? (fat * 9 / total) * circumference : 0;

  const carbOffset   = 0;
  const protOffset   = -(carbArc);
  const fatOffset    = -(carbArc + protArc);

  const pct = targetCalories > 0 ? Math.min(100, Math.round((calories / targetCalories) * 100)) : 0;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth={stroke} />

        {/* Carbs - orange */}
        {carbArc > 0 && (
          <motion.circle
            cx={cx} cy={cy} r={r} fill="none" stroke="#EA580C" strokeWidth={stroke}
            strokeDasharray={`${carbArc} ${circumference}`}
            strokeDashoffset={carbOffset}
            strokeLinecap="butt"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${carbArc} ${circumference}` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}

        {/* Protein - purple */}
        {protArc > 0 && (
          <motion.circle
            cx={cx} cy={cy} r={r} fill="none" stroke="#7C3AED" strokeWidth={stroke}
            strokeDasharray={`${protArc} ${circumference}`}
            strokeDashoffset={protOffset}
            strokeLinecap="butt"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${protArc} ${circumference}` }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          />
        )}

        {/* Fat - teal */}
        {fatArc > 0 && (
          <motion.circle
            cx={cx} cy={cy} r={r} fill="none" stroke="#0E9384" strokeWidth={stroke}
            strokeDasharray={`${fatArc} ${circumference}`}
            strokeDashoffset={fatOffset}
            strokeLinecap="butt"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${fatArc} ${circumference}` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          />
        )}
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: size * 0.2, fontWeight: 800, letterSpacing: -1, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
          {pct}%
        </div>
        <div style={{ fontSize: size * 0.09, color: 'rgba(255,255,255,0.4)', fontFamily: 'ui-monospace, monospace' }}>
          of goal
        </div>
      </div>
    </div>
  );
});
