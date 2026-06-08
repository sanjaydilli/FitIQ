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

  const insetHighlight = isAurora
    ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.25)'
    : isNeon
    ? 'inset 0 1px 0 rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.4)'
    : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.3)';

  const base: CSSProperties = isAurora
    ? {
        background: selected ? `${theme.accent}14` : theme.card,
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: `${selected ? 1.5 : 1}px solid ${selected ? theme.accent : theme.cardBorder}`,
        borderRadius: theme.radius,
        boxShadow: insetHighlight,
      }
    : {
        background: selected ? `${theme.accent}10` : theme.card,
        border: `${selected ? 1.5 : 1}px solid ${selected ? theme.accent : theme.cardBorder}`,
        borderRadius: theme.radius,
        boxShadow: insetHighlight,
      };

  const interactionProps = onClick
    ? {
        whileHover: { y: -2 },
        whileTap: { scale: 0.97 },
        transition: { type: 'spring' as const, stiffness: 420, damping: 26 },
      }
    : {};

  return (
    <motion.div
      onClick={onClick}
      {...interactionProps}
      style={{
        ...base,
        ...style,
        cursor: onClick ? 'pointer' : undefined,
        position: 'relative',
      }}
    >
      {/* Subtle gloss overlay on hover — absolutely positioned, never affects layout */}
      {onClick && (isAurora || isNeon) && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 55%)',
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
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring' as const, stiffness: 420, damping: 26 }}
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
        boxShadow: `0 8px 24px ${theme.accent}38, 0 2px 6px ${theme.accent}1c, inset 0 1px 0 rgba(255,255,255,0.18)`,
        opacity: disabled ? 0.5 : 1,
        fontFamily: theme.font,
        letterSpacing: isNeon ? 0.5 : 0,
        textTransform: isNeon ? 'uppercase' : 'none',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
