import React from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  y?: number;
  duration?: number;
}

export function Reveal({ children, index = 0, delay = 0, y = 14, duration = 0.5 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay: delay + index * 0.07,
        ease: [0.22, 0.8, 0.22, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function Shimmer({
  color = 'rgba(15,23,42,0.05)',
  duration = 2.4,
  delay = 0,
}: {
  color?: string;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ x: '-120%' }}
      animate={{ x: '220%' }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '40%',
        background: `linear-gradient(110deg, transparent 30%, ${color} 50%, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />
  );
}
