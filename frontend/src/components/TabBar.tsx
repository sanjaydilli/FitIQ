import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

type TabId = 'home' | 'workout' | 'food-log' | 'coach' | 'profile';

interface Tab {
  id: TabId;
  path: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'home',     path: '/home',     icon: 'M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7H10v7H6a2 2 0 01-2-2v-9z' },
  { id: 'workout',  path: '/workout',  icon: 'M6 6h2v12H6zM10 9h2v6h-2zM14 7h2v10h-2zM18 6h2v12h-2z' },
  { id: 'food-log', path: '/food-log', icon: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm-3 0v7' },
  { id: 'coach',    path: '/coach',    icon: 'M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6L15 21H9l-.7-6C6.3 13.7 5 11.5 5 9a7 7 0 017-7zm-1 5v4h2V7h-2zm0 5v2h2v-2h-2z' },
  { id: 'profile',  path: '/profile',  icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 1116 0' },
];

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const active = TABS.find((t) => location.pathname.startsWith(t.path))?.id ?? 'home';
  const isAurora = theme.id === 'aurora';
  const isNeon = theme.id === 'neon';

  const barBg = isAurora
    ? 'rgba(20,16,32,0.72)'
    : isNeon
    ? 'rgba(10,10,10,0.88)'
    : 'rgba(17,19,22,0.86)';

  const inactiveStroke = isNeon ? 'rgba(245,245,242,0.45)' : theme.textDim;
  const pillRadius = isNeon ? 10 : 14;
  const outerRadius = isNeon ? 18 : 22;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 28,
        paddingTop: 10,
        paddingLeft: 16,
        paddingRight: 16,
        background: 'linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.55) 60%, transparent)',
        zIndex: 40,
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 0.8, 0.22, 1] }}
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: barBg,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: outerRadius,
          padding: '8px 6px',
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.25)`,
        }}
      >
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              onClick={() => navigate(t.path)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: 48,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: 0,
              }}
            >
              {/* Active pill bg — stronger than before */}
              {isActive && (
                <motion.div
                  layoutId="tabbar-glow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: pillRadius,
                    background: `linear-gradient(135deg, ${theme.accent}26, ${theme.accent2}1a)`,
                    border: `1px solid ${theme.accent}44`,
                    boxShadow: `0 0 16px ${theme.accent}30, inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isActive ? theme.accent : inactiveStroke}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  filter: isActive ? `drop-shadow(0 0 6px ${theme.accent}70)` : 'none',
                  transition: 'filter 0.3s, stroke 0.3s',
                }}
              >
                <path d={t.icon} />
              </svg>
              {isActive && (
                <motion.div
                  layoutId="tabbar-dot"
                  style={{
                    position: 'absolute',
                    bottom: 3,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: theme.accent,
                    boxShadow: `0 0 8px ${theme.accent}, 0 0 3px ${theme.accent}`,
                    zIndex: 1,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
