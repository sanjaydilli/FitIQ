import React, { memo, useEffect, useId, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarConfig } from '../avatar/config';
import {
  buildCtx,
  Body,
  Head,
  Eyebrows,
  Eyes,
  Nose,
  Mouth,
  FacialHair,
  HairBack,
  HairFront,
  FaceAccessories,
  PoseProps,
  AvatarBackground,
  darken,
  lighten,
} from '../avatar/parts';

interface BitmojiAvatarProps {
  config: AvatarConfig;
  size?: number;
  level?: number;
  showBackground?: boolean;
  showAura?: boolean;
  rounded?: boolean;
  className?: string;
}

export const BitmojiAvatar = memo(function BitmojiAvatar({
  config,
  size = 220,
  level = 1,
  showBackground = true,
  showAura = true,
  rounded = true,
  className,
}: BitmojiAvatarProps) {
  const reactId = useId();
  const uid = reactId.replace(/[:]/g, '');

  // Memoize heavy derivations — only recompute when config or uid changes
  const ctx = useMemo(() => buildCtx(config, uid), [config, uid]);
  const skin = ctx.skin;
  const skinShade = ctx.skinShade;

  const auraIntensity = useMemo(() => Math.max(0, Math.min(7, level)) / 7, [level]);
  const auraColor = config.outfitColor;

  // Blink loop — outer timer cleaned up on unmount/pose change;
  // inner 130ms close-eye timer tracked separately to avoid the leak
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    if (config.pose === 'sleeping') return;
    let outer: ReturnType<typeof setTimeout>;
    let inner: ReturnType<typeof setTimeout>;
    const loop = () => {
      const wait = 2400 + Math.random() * 2800;
      outer = setTimeout(() => {
        setBlinking(true);
        inner = setTimeout(() => setBlinking(false), 130);
        loop();
      }, wait);
    };
    loop();
    return () => { clearTimeout(outer); clearTimeout(inner); };
  }, [config.pose]);


  // Memoize pose-driven motion values — only recompute when pose changes
  const { bobAnim, bobDur, hairSway, breathe, breatheDur } = useMemo(() => ({
    bobAnim:
      config.pose === 'celebrating' ? { y: [0, -8, 0], rotate: [0, -2, 2, 0] } :
      config.pose === 'workout'     ? { y: [0, -3, 0] } :
      config.pose === 'sleeping'    ? { y: [0, 1, 0] } :
                                      { y: [0, -2.4, 0] },
    bobDur:
      config.pose === 'celebrating' ? 0.7 :
      config.pose === 'workout'     ? 1.1 :
      config.pose === 'sleeping'    ? 4.5 : 3.4,
    hairSway:
      config.pose === 'workout' || config.pose === 'celebrating'
        ? { rotate: [-2, 2, -2] }
        : { rotate: [-0.6, 0.6, -0.6] },
    breathe:
      config.pose === 'workout'  ? { scale: [1, 1.04, 1] } :
      config.pose === 'sleeping' ? { scale: [1, 1.025, 1] } :
                                   { scale: [1, 1.012, 1] },
    breatheDur:
      config.pose === 'sleeping' ? 4.2 :
      config.pose === 'workout'  ? 1.0 : 3.0,
  }), [config.pose]);

  const aspect = 280 / 200;
  const w = size;
  const h = Math.round(size * aspect);

  return (
    <div
      className={className}
      style={{
        width: w,
        height: h,
        position: 'relative',
        borderRadius: rounded ? 24 : 0,
        overflow: 'hidden',
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 200 280"
        style={{ display: 'block' }}
        aria-label="Avatar"
      >
        <defs>
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighten(skin, 1.06)} />
            <stop offset="100%" stopColor={skinShade} />
          </linearGradient>
          <linearGradient id={`leg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skin} />
            <stop offset="100%" stopColor={darken(skin, 0.85)} />
          </linearGradient>
          <radialGradient id={`aura-${uid}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor={auraColor} stopOpacity={0.6 * auraIntensity} />
            <stop offset="60%" stopColor={auraColor} stopOpacity={0.14 * auraIntensity} />
            <stop offset="100%" stopColor={auraColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`spotlight-${uid}`} cx="50%" cy="20%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {/* shimmer for celebrating */}
          <linearGradient id={`shimmer-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {showBackground && <AvatarBackground ctx={ctx} />}

        {/* spotlight wash */}
        {showBackground && <rect width="200" height="280" fill={`url(#spotlight-${uid})`} />}

        {/* Pulsing aura */}
        {showAura && auraIntensity > 0.15 && (
          <motion.circle
            cx="100"
            cy="120"
            r="120"
            fill={`url(#aura-${uid})`}
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 120px' }}
          />
        )}

        {/* Floating particles when celebrating */}
        {config.pose === 'celebrating' && (
          <g>
            {[
              { x: 30, c: '#FFD86E' },
              { x: 60, c: '#FF8A3D' },
              { x: 100, c: '#5EEAD4' },
              { x: 140, c: '#A78BFA' },
              { x: 170, c: '#C8FF3D' },
            ].map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={260}
                r="2.4"
                fill={p.c}
                initial={{ cy: 280, opacity: 0 }}
                animate={{ cy: [280, 20], opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
              />
            ))}
          </g>
        )}

        {/* Sweat drops when working out */}
        {config.pose === 'workout' && (
          <g>
            {[
              { x: 64, d: 0 },
              { x: 136, d: 0.6 },
            ].map((s, i) => (
              <motion.path
                key={i}
                d={`M${s.x} 80 q -2.5 5 0 8 q 2.5 -3 0 -8 z`}
                fill="#7CC6FF"
                stroke="#3F6FE0"
                strokeWidth="0.6"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: [0, 36] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: s.d, ease: 'easeIn' }}
              />
            ))}
          </g>
        )}

        {/* Z's already handled by PoseProps but add gentle rise */}

        {/* Whole body bob */}
        <motion.g
          animate={bobAnim}
          transition={{ duration: bobDur, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 200px' }}
        >
          {/* breathing torso group */}
          <motion.g
            animate={breathe}
            transition={{ duration: breatheDur, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 180px' }}
          >
            <Body ctx={ctx} />
          </motion.g>

          {/* Hair back with sway */}
          <motion.g
            animate={hairSway}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 90px' }}
          >
            <HairBack ctx={ctx} />
          </motion.g>

          {/* Head + face */}
          <motion.g
            animate={
              config.pose === 'idle'
                ? { rotate: [-1.2, 1.2, -1.2] }
                : config.pose === 'celebrating'
                ? { rotate: [-4, 4, -4] }
                : { rotate: 0 }
            }
            transition={{
              duration: config.pose === 'celebrating' ? 0.8 : 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '100px 130px' }}
          >
            <Head ctx={ctx} />
            <Eyebrows ctx={ctx} />
            {/* Eyelid blink overlay */}
            <g>
              <Eyes ctx={ctx} />
              <AnimatePresence>
                {blinking && config.pose !== 'sleeping' && (
                  <motion.g
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ duration: 0.07 }}
                    style={{ transformOrigin: '100px 102px' }}
                  >
                    <ellipse cx="84" cy="102" rx="7" ry="6" fill={skin} stroke="#1A0E08" strokeWidth="1.6" />
                    <ellipse cx="116" cy="102" rx="7" ry="6" fill={skin} stroke="#1A0E08" strokeWidth="1.6" />
                    <path d="M77 102 Q84 105 91 102" fill="none" stroke="#1A0E08" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M109 102 Q116 105 123 102" fill="none" stroke="#1A0E08" strokeWidth="1.8" strokeLinecap="round" />
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
            <Nose ctx={ctx} />
            {/* Mouth — animate eating */}
            <motion.g
              animate={
                config.pose === 'eating'
                  ? { scaleY: [1, 0.6, 1] }
                  : config.pose === 'celebrating'
                  ? { scale: [1, 1.15, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: config.pose === 'eating' ? 0.7 : 0.9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: '100px 128px' }}
            >
              <Mouth ctx={ctx} />
            </motion.g>
            <FacialHair ctx={ctx} />
            <motion.g
              animate={hairSway}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '100px 90px' }}
            >
              <HairFront ctx={ctx} />
            </motion.g>
            <FaceAccessories ctx={ctx} />
          </motion.g>
        </motion.g>

        {/* Pose props (outside bob so dumbbell stays put for workout) */}
        <PoseProps ctx={ctx} />

        {/* Level pip */}
        {level >= 1 && (
          <motion.g
            transform="translate(170 248)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 380, damping: 16 }}
          >
            <motion.circle
              r="14"
              fill="#08060F"
              stroke={auraColor}
              strokeWidth="1.5"
              animate={{ strokeOpacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontWeight="800"
              fontSize="11"
              fill={auraColor}
            >
              {level}
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
});
