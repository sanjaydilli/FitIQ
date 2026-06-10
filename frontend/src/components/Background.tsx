import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Light, clean app background — soft gray with a faint accent wash at the
 * top. Deliberately quiet so white cards and bold numbers carry the UI.
 */
export function Background({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${theme.bg2} 0%, ${theme.bg} 32%, ${theme.bg} 100%)`,
        color: theme.text,
        fontFamily: theme.font,
      }}
    >
      {/* Soft accent wash at the very top */}
      <div
        style={{
          position: 'absolute',
          top: -160,
          left: '-20%',
          right: '-20%',
          height: 320,
          background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}16, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
