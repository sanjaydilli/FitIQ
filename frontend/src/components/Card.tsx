import React, { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: CSSProperties;
  selected?: boolean;
  onClick?: () => void;
}

export function Card({ children, style, selected, onClick }: CardProps) {
  const { theme } = useTheme();
  const isAurora = theme.id === 'aurora';
  const isNeon = theme.id === 'neon';

  const base: CSSProperties = isAurora
    ? {
        background: selected ? `${theme.accent}14` : theme.card,
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: `${selected ? 1.5 : 1}px solid ${selected ? theme.accent : theme.cardBorder}`,
        borderRadius: theme.radius,
      }
    : {
        background: selected ? `${theme.accent}10` : theme.card,
        border: `${selected ? 1.5 : 1}px solid ${selected ? theme.accent : theme.cardBorder}`,
        borderRadius: theme.radius,
      };

  const tiltProps = onClick
    ? {
        whileHover: { rotateY: 3, rotateX: -2, translateZ: 6, scale: 1.01 },
        whileTap: { rotateY: 0, rotateX: 0, scale: 0.98, translateZ: 0 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 22 },
      }
    : {};

  return (
    <motion.div
      onClick={onClick}
      {...tiltProps}
      style={{
        ...base,
        ...style,
        cursor: onClick ? 'pointer' : undefined,
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}
    >
      {/* Gloss overlay — absolutely positioned, never affects layout */}
      {onClick && (isAurora || isNeon) && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 55%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

interface PillProps {
  children: React.ReactNode;
  color?: string;
  fill?: boolean;
  style?: CSSProperties;
}

export function Pill({ children, color, fill, style }: PillProps) {
  const { theme } = useTheme();
  const c = color || theme.accent;
  const isNeon = theme.id === 'neon';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: isNeon ? 4 : 999,
        background: fill ? c : `${c}20`,
        color: fill ? theme.onAccent : c,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        border: `1px solid ${fill ? c : `${c}30`}`,
        fontFamily: theme.mono,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  style,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const isNeon = theme.id === 'neon';
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96, rotateX: 6 }}
      whileHover={{ scale: 1.02, translateY: -2 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      style={{
        padding: '16px',
        borderRadius: isNeon ? 8 : 16,
        border: 'none',
        background: isNeon
          ? theme.accent
          : `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
        color: theme.onAccent,
        fontWeight: 700,
        fontSize: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: `0 12px 32px ${theme.accent}40, 0 2px 8px ${theme.accent}20`,
        opacity: disabled ? 0.5 : 1,
        fontFamily: theme.font,
        letterSpacing: isNeon ? 0.5 : 0,
        textTransform: isNeon ? 'uppercase' : 'none',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
