import React, { useEffect, useMemo, useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  useUser,
  WATER_SLOT_HOURS,
  WATER_SLOT_LABELS,
  WATER_SLOT_CAPACITY,
  WATER_DROP_ML,
} from '../context/UserContext';
import { Card } from './Card';

const BLUE_SKY   = '#93C5FD';
const BLUE_LIGHT = '#60A5FA';
const BLUE_MID   = '#3B82F6';
const BLUE_DEEP  = '#1D4ED8';
const BLUE_NAVY  = '#1A3358';
const ON_TRACK   = '#34D399';

// ─── Water Bottle ─────────────────────────────────────────────────────────────

function WaterBottle({
  fillPct,
  onTap,
  ripple,
}: {
  fillPct: number;
  onTap: () => void;
  ripple: boolean;
}) {
  const uid = useId().replace(/:/g, '');

  const BW = 64, BH = 118;
  const capX = 20, capW = 24, capH = 9, neckH = 8;
  const bx = 6, bw = 52, bt = capH + neckH, bh = BH - bt - 4, br = 11;
  const bb = bt + bh;

  const clamp = Math.max(0, Math.min(100, fillPct));
  const wl = bt + bh * (1 - clamp / 100);
  const wh = bb - wl;

  const wp = bw + 6;
  const makeWave = (amp: number) => {
    const pts = Array.from({ length: 8 }, (_, i) =>
      `q${wp / 4} ${i % 2 === 0 ? -amp : amp} ${wp / 2} 0`
    ).join(' ');
    return `M${-wp} 0 ${pts} V18 H${-wp} Z`;
  };
  const waveFront = makeWave(3.5);
  const waveBack  = makeWave(2.2);

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      aria-label="Log water"
    >
      <svg width={BW} height={BH} viewBox={`0 0 ${BW} ${BH}`} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id={`bc-${uid}`}>
            <rect x={bx} y={bt} width={bw} height={bh} rx={br} />
          </clipPath>
          <linearGradient id={`wg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE_LIGHT} />
            <stop offset="100%" stopColor={BLUE_DEEP} />
          </linearGradient>
          <linearGradient id={`eg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE_NAVY} stopOpacity={0.9} />
            <stop offset="100%" stopColor="#0d1a2e" stopOpacity={0.95} />
          </linearGradient>
          <linearGradient id={`cg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE_MID} />
            <stop offset="100%" stopColor={BLUE_DEEP} />
          </linearGradient>
          <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.18)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>

        {/* Ambient glow */}
        <motion.rect
          x={bx - 4} y={bt - 2} width={bw + 8} height={bh + 4} rx={br + 4}
          fill={BLUE_MID} opacity={0}
          animate={{ opacity: [0.06, 0.16, 0.06] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          style={{ filter: 'blur(6px)' }}
        />

        {/* Ripple */}
        <AnimatePresence>
          {ripple && (
            <motion.ellipse
              cx={BW / 2} cy={BH * 0.6}
              initial={{ rx: 8, ry: 6, opacity: 0.7 }}
              animate={{ rx: 38, ry: 28, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              fill="none" stroke={BLUE_LIGHT} strokeWidth={1.8}
            />
          )}
        </AnimatePresence>

        {/* Cap thread ridges */}
        {[2, 5, 7].map(dy => (
          <rect key={dy} x={capX + 2} y={dy} width={capW - 4} height={1} rx={0.5}
            fill="rgba(255,255,255,0.14)" />
        ))}
        {/* Cap */}
        <rect x={capX} y={1} width={capW} height={capH} rx={3.5}
          fill={`url(#cg-${uid})`} stroke={BLUE_SKY} strokeWidth={0.9} strokeOpacity={0.5} />
        <rect x={capX + 2} y={1} width={capW - 4} height={capH / 2} rx={3}
          fill="rgba(255,255,255,0.18)" />

        {/* Neck taper */}
        <path
          d={`M${capX} ${capH} L${bx + 2} ${bt} L${bx + bw - 2} ${bt} L${capX + capW} ${capH} Z`}
          fill={`url(#eg-${uid})`}
          stroke={BLUE_MID} strokeWidth={0.7} strokeOpacity={0.45}
        />

        {/* Body — empty (dark navy) */}
        <rect x={bx} y={bt} width={bw} height={bh} rx={br}
          fill={`url(#eg-${uid})`} />

        {/* Water fill */}
        <g clipPath={`url(#bc-${uid})`}>
          <motion.rect
            x={bx} width={bw}
            animate={{ y: wl, height: Math.max(0, wh) }}
            transition={{ duration: 0.9, ease: [0.22, 0.8, 0.22, 1] }}
            fill={`url(#wg-${uid})`}
          />
          {clamp > 2 && (
            <motion.g
              animate={{ x: [0, -wp] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
              style={{ translateX: bx, translateY: wl - 3 } as React.CSSProperties}
            >
              <path d={waveBack} fill={BLUE_SKY} opacity={0.18} />
            </motion.g>
          )}
          {clamp > 2 && (
            <motion.g
              animate={{ x: [0, -wp] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
              style={{ translateX: bx, translateY: wl - 4.5 } as React.CSSProperties}
            >
              <path d={waveFront} fill={BLUE_SKY} opacity={0.3} />
            </motion.g>
          )}
          {/* Bubbles */}
          {clamp > 12 && [
            { f: 0.3, d: 3.8, sz: 2, delay: 0.3 },
            { f: 0.6, d: 2.9, sz: 1.5, delay: 1.4 },
            { f: 0.75, d: 4.4, sz: 1.1, delay: 0.9 },
          ].map((b, i) => (
            <motion.circle key={i}
              cx={bx + bw * b.f} r={b.sz}
              fill={`${BLUE_SKY}55`}
              animate={{ cy: [wl + wh * 0.7, wl + wh * 0.12], opacity: [0, 0.7, 0] }}
              transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut', delay: b.delay, repeatDelay: 0.4 }}
            />
          ))}
        </g>

        {/* Body outline */}
        <rect x={bx} y={bt} width={bw} height={bh} rx={br}
          fill="none" stroke={BLUE_LIGHT} strokeWidth={1.3} strokeOpacity={0.5} />

        {/* Measurement marks */}
        {[0.25, 0.5, 0.75].map(f => {
          const my = bt + bh * (1 - f);
          return (
            <g key={f}>
              <line x1={bx + bw - 12} y1={my} x2={bx + bw - 4} y2={my}
                stroke="rgba(255,255,255,0.22)" strokeWidth={0.9} />
              <line x1={bx + 4} y1={my} x2={bx + 12} y2={my}
                stroke="rgba(255,255,255,0.22)" strokeWidth={0.9} />
            </g>
          );
        })}

        {/* Shine */}
        <rect x={bx} y={bt} width={bw} height={bh} rx={br}
          fill={`url(#shine-${uid})`} />
        <rect x={bx + 9} y={bt + 12} width={4} height={26} rx={2}
          fill="rgba(255,255,255,0.2)" />

        {/* % label */}
        {clamp > 8 && (
          <text
            x={BW / 2} y={wl + Math.min(wh / 2 + 5, bh * 0.55 + bt)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={clamp > 28 ? 13 : 10}
            fontWeight="800"
            fill="rgba(255,255,255,0.9)"
            fontFamily="system-ui,-apple-system,sans-serif"
          >
            {clamp}%
          </text>
        )}
      </svg>
    </motion.button>
  );
}

// ─── Cup pill button ──────────────────────────────────────────────────────────

function CupPill({
  filled,
  isNext,
  onClick,
  index,
}: {
  filled: boolean;
  isNext: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 360, damping: 20 }}
      whileTap={{ scale: 0.82 }}
      onClick={onClick}
      style={{
        position: 'relative',
        width: 22, height: 22,
        borderRadius: 7,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        background: filled
          ? `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE_DEEP})`
          : 'rgba(255,255,255,0.07)',
        outline: isNext ? `1.5px solid ${BLUE_LIGHT}80` : 'none',
        boxShadow: filled
          ? `0 2px 8px ${BLUE_MID}70, inset 0 1px 0 rgba(255,255,255,0.25)`
          : isNext
          ? `0 0 8px ${BLUE_MID}50`
          : 'none',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      aria-label={filled ? 'Remove cup' : 'Add cup'}
    >
      {/* Shine strip on filled */}
      {filled && (
        <div style={{
          position: 'absolute', top: 2, left: 3, width: 6, height: 4,
          borderRadius: 3, background: 'rgba(255,255,255,0.35)',
        }} />
      )}

      {/* Pulse ring for next cup */}
      {isNext && !filled && (
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.45, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: -3, borderRadius: 10,
            border: `1.5px solid ${BLUE_LIGHT}`,
          }}
        />
      )}

      {/* Check icon on filled */}
      {filled && (
        <svg
          width={11} height={11}
          viewBox="0 0 12 12"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ position: 'absolute', inset: 0, margin: 'auto', display: 'block' }}
        >
          <path d="M2 6l3 3 5-5" />
        </svg>
      )}
    </motion.button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function WaterTimeline() {
  const { theme } = useTheme();
  const { user, setWaterSlot } = useUser();
  const [now, setNow] = useState(new Date());
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const currentHour = now.getHours();
  const currentMin  = now.getMinutes();

  const currentSlot = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < WATER_SLOT_HOURS.length; i++) {
      if (currentHour >= WATER_SLOT_HOURS[i]) idx = i;
    }
    return idx;
  }, [currentHour]);

  const filledCount = user.waterDrops.reduce((a, b) => a + b, 0);
  const totalCount  = WATER_SLOT_CAPACITY.reduce((a: number, b) => a + b, 0);
  const filledMl    = filledCount * WATER_DROP_ML;
  const targetMl    = totalCount  * WATER_DROP_ML;
  const fillPct     = Math.round((filledMl / targetMl) * 100);

  const expectedByNow = WATER_SLOT_CAPACITY.slice(0, currentSlot + 1).reduce((a: number, b) => a + b, 0);
  const filledByNow   = user.waterDrops.slice(0, currentSlot + 1).reduce((a, b) => a + b, 0);
  const onTrack       = filledByNow >= expectedByNow;
  const statusColor   = onTrack ? ON_TRACK : '#F59E0B';

  const nowProgress = useMemo(() => {
    const start = WATER_SLOT_HOURS[0];
    const end   = WATER_SLOT_HOURS[WATER_SLOT_HOURS.length - 1] + 3;
    const cur   = currentHour + currentMin / 60;
    return Math.max(0, Math.min(1, (cur - start) / (end - start)));
  }, [currentHour, currentMin]);

  const tap = (slotIdx: number, dropIdx: number) => {
    const cur  = user.waterDrops[slotIdx];
    const next = dropIdx < cur ? dropIdx : dropIdx + 1;
    setWaterSlot(slotIdx, next);
    setRipple(true);
    setTimeout(() => setRipple(false), 550);
  };

  const bottleTap = () => {
    const cur = user.waterDrops[currentSlot];
    const cap = WATER_SLOT_CAPACITY[currentSlot];
    if (cur < cap) tap(currentSlot, cur);
  };

  return (
    <Card style={{ padding: '15px 16px 16px', borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient */}
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 25% 50%, ${BLUE_MID}16, transparent 60%)`,
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, fontWeight: 700, marginBottom: 3 }}>
              HYDRATION
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <motion.span
                key={filledMl}
                initial={{ scale: 0.88, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 340, damping: 20 }}
                style={{
                  fontSize: 26, fontWeight: 800, letterSpacing: -1,
                  background: `linear-gradient(135deg, ${BLUE_SKY}, ${BLUE_DEEP})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}
              >
                {(filledMl / 1000).toFixed(1)}L
              </motion.span>
              <span style={{ fontSize: 11, color: theme.textMute }}>/ {(targetMl / 1000).toFixed(1)}L</span>
            </div>
          </div>

          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 999,
              background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
              color: statusColor, fontSize: 10, fontFamily: theme.mono, fontWeight: 700, letterSpacing: 0.5,
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}`, display: 'inline-block' }}
            />
            {onTrack ? 'ON TRACK' : 'BEHIND'}
          </motion.div>
        </div>

        {/* Content: bottle + vertical timeline */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

          {/* Bottle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <WaterBottle fillPct={fillPct} onTap={bottleTap} ripple={ripple} />
            <div style={{ fontSize: 8.5, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.8, textAlign: 'center' }}>
              TAP TO LOG
            </div>
          </div>

          {/* Vertical timeline */}
          <div style={{ flex: 1, position: 'relative', display: 'grid', gridTemplateColumns: '38px 1fr', rowGap: 8, paddingTop: 2 }}>

            {/* Spine */}
            <div style={{
              position: 'absolute', left: 37, top: 10, bottom: 10,
              width: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden',
            }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(filledByNow / totalCount) * 100}%` }}
                transition={{ duration: 0.9, ease: [0.22, 0.8, 0.22, 1] }}
                style={{
                  width: '100%',
                  background: `linear-gradient(180deg, ${BLUE_LIGHT}, ${BLUE_MID}, ${BLUE_DEEP})`,
                  boxShadow: `0 0 8px ${BLUE_MID}80`,
                }}
              />
            </div>

            {/* Now indicator */}
            <motion.div
              animate={{ top: `calc(${nowProgress * 100}% - 6px)` }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute', left: 31, zIndex: 2,
                width: 14, height: 14, borderRadius: 7,
                background: BLUE_LIGHT,
                border: '2px solid rgba(10,10,20,0.9)',
                boxShadow: `0 0 10px ${BLUE_LIGHT}, 0 0 20px ${BLUE_LIGHT}70`,
              }}
            >
              <motion.div
                animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: -2, borderRadius: 9, background: BLUE_LIGHT, opacity: 0.4 }}
              />
            </motion.div>

            {/* Slots */}
            {WATER_SLOT_HOURS.map((hour, slotIdx) => {
              const cap      = WATER_SLOT_CAPACITY[slotIdx];
              const filled   = user.waterDrops[slotIdx];
              const isCur    = slotIdx === currentSlot;
              const isPast   = slotIdx < currentSlot;
              const complete = filled >= cap;

              return (
                <React.Fragment key={hour}>
                  {/* Time label */}
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: slotIdx * 0.04 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 12, paddingTop: 2 }}
                  >
                    <div style={{
                      fontSize: 11, fontFamily: theme.mono, fontWeight: 800, letterSpacing: 0.3,
                      color: isCur ? BLUE_LIGHT : isPast ? theme.textDim : theme.textMute,
                    }}>
                      {WATER_SLOT_LABELS[slotIdx]}
                    </div>
                    <div style={{ fontSize: 8.5, color: complete ? ON_TRACK : theme.textMute, fontFamily: theme.mono, fontWeight: 700 }}>
                      {filled}/{cap}
                    </div>
                  </motion.div>

                  {/* Cup pills */}
                  <motion.div
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: slotIdx * 0.04 + 0.04 }}
                    style={{ paddingLeft: 14, display: 'flex', alignItems: 'center', gap: 5, minHeight: 28 }}
                  >
                    {Array.from({ length: cap }).map((_, di) => (
                      <CupPill
                        key={di}
                        index={di}
                        filled={di < filled}
                        isNext={isCur && di === filled && filled < cap}
                        onClick={() => tap(slotIdx, di)}
                      />
                    ))}
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
