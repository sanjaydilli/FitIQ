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
        duration: 8 + Math.random() * 10,
        size: 1.5 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 30,
        scaleEnd: 0.4 + Math.random() * 0.6,
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
          initial={{ y: '0vh', x: 0, opacity: 0, scale: 1 }}
          animate={{
            y: '-115vh',
            x: [0, p.drift, p.drift * 0.5, 0],
            opacity: [0, p.opacity, p.opacity * 0.8, 0],
            scale: [1, 1.2, p.scaleEnd],
          }}
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
            boxShadow: `0 0 ${p.size * 4}px ${color}`,
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
          perspective: '900px',
        }}
      >
        {/* Deep back blob */}
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0], rotateX: [0, 6, -4, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.6), transparent 70%)',
            filter: 'blur(44px)',
            transformOrigin: 'center center',
          }}
        />
        {/* Mid blob with 3D tilt */}
        <motion.div
          animate={{ x: [0, -25, 15, 0], y: [0, 18, -10, 0], scale: [1, 1.12, 0.95, 1], rotateY: [0, 8, -5, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 200,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(94,234,212,0.35), transparent 70%)',
            filter: 'blur(50px)',
            transformOrigin: 'center center',
          }}
        />
        {/* Front accent blob */}
        <motion.div
          animate={{ x: [0, 15, -20, 0], y: [0, -10, 12, 0], rotateX: [0, -5, 3, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: -100,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.45), transparent 70%)',
            filter: 'blur(60px)',
            transformOrigin: 'center center',
          }}
        />
        {/* Subtle shimmer layer */}
        <motion.div
          animate={{ opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(167,139,250,0.12) 0%, transparent 50%, rgba(94,234,212,0.08) 100%)',
            pointerEvents: 'none',
          }}
        />
        <AmbientParticles color="rgba(167,139,250,0.75)" count={18} />
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
        {/* Flat grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />
        {/* 3D perspective grid floor */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '-20%',
            right: '-20%',
            height: '55%',
            transformOrigin: 'bottom center',
            transform: 'perspective(300px) rotateX(55deg)',
            backgroundImage: `linear-gradient(${theme.accent}12 1px, transparent 1px), linear-gradient(90deg, ${theme.accent}12 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 80%)',
          }}
        />
        <motion.div
          animate={{ x: [0, -15, 10, 0], y: [0, 12, -8, 0], rotateY: [0, 10, -6, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -100,
            right: -120,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accent}22, transparent 70%)`,
            filter: 'blur(44px)',
            transformOrigin: 'center center',
          }}
        />
        {/* Scanline effect */}
        <motion.div
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '40%',
            background: `linear-gradient(to bottom, transparent, ${theme.accent}06, transparent)`,
            pointerEvents: 'none',
          }}
        />
        <AmbientParticles color={`${theme.accent}90`} count={12} />
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
        perspective: '900px',
      }}
    >
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0], scale: [1, 1.1, 1], rotateX: [0, 8, -4, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: -150,
          left: -100,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent}30, transparent 70%)`,
          filter: 'blur(60px)',
          transformOrigin: 'center center',
        }}
      />
      <motion.div
        animate={{ x: [0, -18, 12, 0], y: [0, 14, -10, 0], rotateY: [0, -10, 6, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent2}30, transparent 70%)`,
          filter: 'blur(60px)',
          transformOrigin: 'center center',
        }}
      />
      {/* Neon scanline */}
      <motion.div
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '30%',
          background: `linear-gradient(to bottom, transparent, ${theme.accent}08, transparent)`,
          pointerEvents: 'none',
        }}
      />
      {/* Corner glow accents */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 120, height: 120,
        background: `radial-gradient(circle at top right, ${theme.accent}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: 120, height: 120,
        background: `radial-gradient(circle at bottom left, ${theme.accent2}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <AmbientParticles color={theme.accent} count={20} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
