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
const ON_TRACK   = '#059669';

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

// ─── Cup dot (compact, tappable) ──────────────────────────────────────────────

function CupDot({
  filled,
  isNext,
  onClick,
}: {
  filled: boolean;
  isNext: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.75 }}
      onClick={onClick}
      style={{
        position: 'relative',
        width: 14, height: 14,
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        background: filled
          ? `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE_DEEP})`
          : 'rgba(15,23,42,0.08)',
        boxShadow: filled
          ? `0 1px 6px ${BLUE_MID}60, inset 0 1px 0 rgba(255,255,255,0.25)`
          : 'none',
        flexShrink: 0,
      }}
      aria-label={filled ? 'Remove cup' : 'Add cup'}
    >
      {isNext && !filled && (
        <motion.div
          animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: -3, borderRadius: 8,
            border: `1.5px solid ${BLUE_LIGHT}`,
          }}
        />
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
  const goalDone    = filledCount >= totalCount;

  const expectedByNow = WATER_SLOT_CAPACITY.slice(0, currentSlot + 1).reduce((a: number, b) => a + b, 0);
  const filledByNow   = user.waterDrops.slice(0, currentSlot + 1).reduce((a, b) => a + b, 0);
  const onTrack       = filledByNow >= expectedByNow;
  const statusColor   = goalDone ? ON_TRACK : onTrack ? ON_TRACK : '#F59E0B';

  // Slot that the big button logs into: current slot if it has room,
  // otherwise the first slot (earliest first) with space left.
  const logSlot = useMemo(() => {
    if (user.waterDrops[currentSlot] < WATER_SLOT_CAPACITY[currentSlot]) return currentSlot;
    for (let i = 0; i < WATER_SLOT_CAPACITY.length; i++) {
      if (user.waterDrops[i] < WATER_SLOT_CAPACITY[i]) return i;
    }
    return -1; // all full
  }, [user.waterDrops, currentSlot]);

  const tap = (slotIdx: number, dropIdx: number) => {
    const cur  = user.waterDrops[slotIdx];
    const next = dropIdx < cur ? dropIdx : dropIdx + 1;
    setWaterSlot(slotIdx, next);
    setRipple(true);
    setTimeout(() => setRipple(false), 550);
  };

  const logCup = () => {
    if (logSlot < 0) return;
    tap(logSlot, user.waterDrops[logSlot]);
  };

  return (
    <Card style={{ padding: '15px 16px 14px', borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient */}
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 25% 30%, ${BLUE_MID}16, transparent 60%)`,
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
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
                display: 'inline-block', lineHeight: 1,
              }}
            >
              {(filledMl / 1000).toFixed(1)}L
            </motion.span>
            <span style={{ fontSize: 11, color: theme.textMute }}>/ {(targetMl / 1000).toFixed(1)}L</span>
          </div>

          <div
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
            {goalDone ? 'GOAL HIT' : onTrack ? 'ON TRACK' : 'BEHIND'}
          </div>
        </div>

        {/* Bottle + log action */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
          <WaterBottle fillPct={fillPct} onTap={logCup} ripple={ripple} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, color: theme.textMute, fontFamily: theme.mono,
              letterSpacing: 1.2, fontWeight: 700, marginBottom: 8,
            }}>
              {goalDone
                ? 'ALL CUPS LOGGED 🎉'
                : logSlot === currentSlot
                ? `${WATER_SLOT_LABELS[currentSlot].toUpperCase()} SLOT · ${user.waterDrops[currentSlot]}/${WATER_SLOT_CAPACITY[currentSlot]} CUPS`
                : `CATCH UP · ${WATER_SLOT_LABELS[Math.max(0, logSlot)].toUpperCase()} SLOT`}
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -1 }}
              onClick={logCup}
              disabled={goalDone}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 0', borderRadius: 14, border: 'none', cursor: goalDone ? 'default' : 'pointer',
                background: goalDone
                  ? 'rgba(52,211,153,0.12)'
                  : `linear-gradient(135deg, ${BLUE_MID}, ${BLUE_DEEP})`,
                boxShadow: goalDone ? 'none' : `0 4px 16px ${BLUE_MID}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
                color: goalDone ? ON_TRACK : '#fff',
                fontSize: 14, fontWeight: 800, letterSpacing: -0.2,
                fontFamily: 'inherit',
              }}
            >
              {goalDone ? (
                <>✓ Done for today</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 2.7C12 2.7 5.5 10 5.5 14.5a6.5 6.5 0 0013 0C18.5 10 12 2.7 12 2.7z" />
                  </svg>
                  +{WATER_DROP_ML} ml
                </>
              )}
            </motion.button>

            <div style={{ fontSize: 10.5, color: theme.textMute, marginTop: 8, lineHeight: 1.4 }}>
              {goalDone
                ? `${(targetMl / 1000).toFixed(1)}L logged — great hydration!`
                : `${((targetMl - filledMl) / 1000).toFixed(2).replace(/0$/, '')}L to go · ${totalCount - filledCount} cups left`}
            </div>
          </div>
        </div>

        {/* Horizontal slot strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${WATER_SLOT_HOURS.length}, 1fr)`,
          gap: 6,
        }}>
          {WATER_SLOT_HOURS.map((hour, slotIdx) => {
            const cap      = WATER_SLOT_CAPACITY[slotIdx];
            const filled   = user.waterDrops[slotIdx];
            const isCur    = slotIdx === currentSlot;
            const isPast   = slotIdx < currentSlot;
            const complete = filled >= cap;
            const missed   = isPast && !complete;

            return (
              <motion.div
                key={hour}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: slotIdx * 0.05 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: '8px 2px 6px',
                  borderRadius: 12,
                  background: isCur ? `${BLUE_MID}14` : 'transparent',
                  border: `1px solid ${isCur ? `${BLUE_LIGHT}35` : 'transparent'}`,
                }}
              >
                {/* Cup dots, stacked bottom-up */}
                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, minHeight: 50, justifyContent: 'flex-start' }}>
                  {Array.from({ length: cap }).map((_, di) => (
                    <CupDot
                      key={di}
                      filled={di < filled}
                      isNext={isCur && di === filled && filled < cap}
                      onClick={() => tap(slotIdx, di)}
                    />
                  ))}
                </div>

                {/* Time label */}
                <div style={{
                  fontSize: 9.5, fontFamily: theme.mono, fontWeight: 800, letterSpacing: 0.3,
                  color: isCur ? BLUE_LIGHT : complete ? ON_TRACK : missed ? '#F59E0B' : theme.textMute,
                }}>
                  {WATER_SLOT_LABELS[slotIdx]}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
