import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

function AmbientParticles({ color, count = 14 }: { color: string; count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x: Math.random() * 100,
        y: 60 + Math.random() * 60,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 8,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0.25 + Math.random() * 0.45,
      })),
    [count]
  );
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {items.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: '0vh', opacity: 0 }}
          animate={{ y: '-110vh', opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

export function Background({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  if (theme.id === 'aurora') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: theme.bg,
          color: theme.text,
          fontFamily: theme.font,
        }}
      >
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.55), transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{ x: [0, -25, 15, 0], y: [0, 18, -10, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 200,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(94,234,212,0.32), transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <motion.div
          animate={{ x: [0, 15, -20, 0], y: [0, -10, 12, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: -100,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <AmbientParticles color="rgba(167,139,250,0.7)" count={16} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    );
  }

  if (theme.id === 'graphite') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: theme.bg,
          color: theme.text,
          fontFamily: theme.font,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ x: [0, -15, 10, 0], y: [0, 12, -8, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -100,
            right: -120,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accent}20, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <AmbientParticles color={`${theme.accent}88`} count={10} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    );
  }

  // neon
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.font,
      }}
    >
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: -150,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent}25, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        animate={{ x: [0, -18, 12, 0], y: [0, 14, -10, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent2}25, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <AmbientParticles color={theme.accent} count={18} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
