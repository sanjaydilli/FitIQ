import React, { useEffect, useMemo, useState } from 'react';
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

const REMINDER_HOURS = new Set([9, 12, 15]);
const ON_TRACK = '#3FCF8E';
const BLUE_LIGHT = '#7CC6FF';
const BLUE_MID = '#5AA8F5';
const BLUE_DEEP = '#3F6FE0';

function Drop({
  filled,
  glow,
  size = 22,
  onClick,
  fillKey,
  index,
}: {
  filled: boolean;
  glow: boolean;
  size?: number;
  onClick: () => void;
  fillKey: string;
  index: number;
}) {
  const w = size;
  const h = size * 1.2;
  const gradId = `wd-${fillKey}`;
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 18 }}
      whileTap={{ scale: 0.78, rotate: -8 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        position: 'relative',
        width: w,
        height: h,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={filled ? 'Remove water' : 'Add water'}
    >
      <svg width={w} height={h} viewBox="0 0 24 28" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE_LIGHT} />
            <stop offset="100%" stopColor={BLUE_DEEP} />
          </linearGradient>
        </defs>
        {glow && (
          <motion.circle
            cx="12"
            cy="16"
            r="14"
            fill={BLUE_LIGHT}
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'blur(2px)' }}
          />
        )}
        <motion.path
          animate={
            filled
              ? { y: [0, -1, 0] }
              : { y: 0 }
          }
          transition={{ duration: 2.6 + index * 0.1, repeat: Infinity, ease: 'easeInOut' }}
          d="M12 1 C 6 9, 3 14, 3 18 a 9 9 0 0 0 18 0 c 0 -4 -3 -9 -9 -17 z"
          fill={filled ? `url(#${gradId})` : 'rgba(255,255,255,0.05)'}
          stroke={filled ? BLUE_LIGHT : 'rgba(255,255,255,0.16)'}
          strokeWidth={glow ? 1.4 : 1}
          style={{
            filter: glow && filled ? `drop-shadow(0 0 8px ${BLUE_LIGHT})` : undefined,
          }}
        />
        {filled && (
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.5 }}
            d="M8 14 Q 9 12 11 12.5"
            fill="none"
            stroke="#fff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </motion.button>
  );
}

export function WaterTimeline() {
  const { theme } = useTheme();
  const { user, setWaterSlot } = useUser();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  const currentSlot = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < WATER_SLOT_HOURS.length; i++) {
      if (currentHour >= WATER_SLOT_HOURS[i]) idx = i;
    }
    return idx;
  }, [currentHour]);

  const filledCount = user.waterDrops.reduce((a, b) => a + b, 0);
  const totalCount = WATER_SLOT_CAPACITY.reduce((a: number, b) => a + b, 0);
  const filledMl = filledCount * WATER_DROP_ML;
  const targetMl = totalCount * WATER_DROP_ML;
  const fillPct = Math.round((filledMl / targetMl) * 100);

  const expectedByNow = WATER_SLOT_CAPACITY.slice(0, currentSlot + 1).reduce(
    (a: number, b) => a + b,
    0
  );
  const filledByNow = user.waterDrops.slice(0, currentSlot + 1).reduce((a, b) => a + b, 0);
  const onTrack = filledByNow >= expectedByNow;
  const statusColor = onTrack ? ON_TRACK : theme.warn;

  const reminder =
    REMINDER_HOURS.has(WATER_SLOT_HOURS[currentSlot]) &&
    user.waterDrops[currentSlot] < WATER_SLOT_CAPACITY[currentSlot];

  const handleDropTap = (slotIdx: number, dropIdx: number) => {
    const cur = user.waterDrops[slotIdx];
    const next = dropIdx < cur ? dropIdx : dropIdx + 1;
    setWaterSlot(slotIdx, next);
  };

  const slotCount = WATER_SLOT_HOURS.length;
  // Position of the "now" marker (0 to 1 along the spine)
  const nowProgress = useMemo(() => {
    const startHour = WATER_SLOT_HOURS[0];
    const endHour = WATER_SLOT_HOURS[slotCount - 1] + 3; // last slot is +3h window
    const total = endHour - startHour;
    const cur = currentHour + currentMin / 60;
    return Math.max(0, Math.min(1, (cur - startHour) / total));
  }, [currentHour, currentMin, slotCount]);

  return (
    <Card style={{ padding: 16, borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
      {/* ambient backdrop */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 100% 0%, ${BLUE_LIGHT}1f, transparent 60%), radial-gradient(ellipse at 0% 100%, ${BLUE_DEEP}1a, transparent 50%)`,
        }}
      />
      <div style={{ position: 'relative' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 16, display: 'inline-block' }}
            >
              💧
            </motion.span>
            <span
              style={{
                fontSize: 11,
                color: theme.textDim,
                fontFamily: theme.mono,
                letterSpacing: 1,
                fontWeight: 700,
              }}
            >
              HYDRATION
            </span>
          </div>
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 999,
              background: `${statusColor}20`,
              border: `1px solid ${statusColor}40`,
              color: statusColor,
              fontSize: 10,
              fontFamily: theme.mono,
              fontWeight: 700,
              letterSpacing: 0.6,
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: statusColor,
                boxShadow: `0 0 6px ${statusColor}`,
              }}
            />
            {onTrack ? 'ON TRACK' : 'BEHIND'}
          </motion.div>
        </div>

        {/* Big total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <motion.span
              key={filledMl}
              initial={{ scale: 0.92, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              style={{
                fontSize: 32,
                fontWeight: 800,
                fontFeatureSettings: '"tnum"',
                letterSpacing: -1,
                background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE_DEEP})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              {(filledMl / 1000).toFixed(1)}L
            </motion.span>
            <span style={{ fontSize: 13, color: theme.textDim }}>
              / {(targetMl / 1000).toFixed(1)}L
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: theme.textMute,
              fontFamily: theme.mono,
              fontFeatureSettings: '"tnum"',
            }}
          >
            {fillPct}% · {filledCount}/{totalCount}
          </div>
        </div>

        {/* Reminder banner */}
        <AnimatePresence>
          {reminder && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              style={{
                marginBottom: 12,
                padding: '8px 10px',
                borderRadius: 10,
                background: `${BLUE_LIGHT}14`,
                border: `1px solid ${BLUE_LIGHT}30`,
                fontSize: 11,
                color: BLUE_LIGHT,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                overflow: 'hidden',
              }}
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                💧
              </motion.span>
              <span>Time to drink — log {WATER_DROP_ML}ml below.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical timeline */}
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '54px 1fr',
            rowGap: 10,
            paddingLeft: 4,
          }}
        >
          {/* Spine */}
          <div
            style={{
              position: 'absolute',
              left: 53,
              top: 12,
              bottom: 12,
              width: 2,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(filledByNow / totalCount) * 100}%` }}
              transition={{ duration: 0.9, ease: [0.22, 0.8, 0.22, 1] }}
              style={{
                width: '100%',
                background: `linear-gradient(180deg, ${BLUE_LIGHT}, ${BLUE_MID}, ${BLUE_DEEP})`,
                boxShadow: `0 0 12px ${BLUE_MID}80`,
              }}
            />
          </div>

          {/* Now indicator */}
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0, top: `calc(${nowProgress * 100}% - 6px)` }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              left: 47,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: BLUE_LIGHT,
              border: '2px solid #08060F',
              boxShadow: `0 0 12px ${BLUE_LIGHT}, 0 0 24px ${BLUE_LIGHT}80`,
              zIndex: 2,
            }}
          >
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: -2,
                borderRadius: 9,
                background: BLUE_LIGHT,
                opacity: 0.4,
              }}
            />
          </motion.div>

          {/* Slot rows */}
          {WATER_SLOT_HOURS.map((hour, slotIdx) => {
            const cap = WATER_SLOT_CAPACITY[slotIdx];
            const filled = user.waterDrops[slotIdx];
            const isCurrent = slotIdx === currentSlot;
            const isPast = slotIdx < currentSlot;
            const slotComplete = filled >= cap;

            return (
              <React.Fragment key={hour}>
                {/* Time label */}
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: slotIdx * 0.05 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    paddingRight: 14,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: theme.mono,
                      fontWeight: 800,
                      color: isCurrent ? BLUE_LIGHT : isPast ? theme.textDim : theme.textMute,
                      letterSpacing: 0.5,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {WATER_SLOT_LABELS[slotIdx]}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: slotComplete ? ON_TRACK : theme.textMute,
                      fontFamily: theme.mono,
                      fontWeight: 700,
                    }}
                  >
                    {filled}/{cap}
                  </div>
                </motion.div>

                {/* Drops branch */}
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: slotIdx * 0.05 + 0.05 }}
                  style={{
                    paddingLeft: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 32,
                  }}
                >
                  {Array.from({ length: cap }).map((_, dropIdx) => (
                    <Drop
                      key={dropIdx}
                      index={dropIdx}
                      filled={dropIdx < filled}
                      glow={isCurrent && dropIdx === Math.min(filled, cap - 1)}
                      onClick={() => handleDropTap(slotIdx, dropIdx)}
                      fillKey={`${slotIdx}-${dropIdx}`}
                    />
                  ))}
                  {slotComplete && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                      style={{
                        marginLeft: 4,
                        fontSize: 11,
                        color: ON_TRACK,
                        fontWeight: 800,
                        fontFamily: theme.mono,
                      }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
