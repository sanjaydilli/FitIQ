import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

type TabId = 'home' | 'workout' | 'scan' | 'friends' | 'profile';

interface Tab {
  id: TabId;
  path: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'home', path: '/home', icon: 'M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7H10v7H6a2 2 0 01-2-2v-9z' },
  { id: 'workout', path: '/workout', icon: 'M6 6h2v12H6zM10 9h2v6h-2zM14 7h2v10h-2zM18 6h2v12h-2z' },
  { id: 'scan', path: '/scan', icon: 'M4 7V5a1 1 0 011-1h2M20 7V5a1 1 0 00-1-1h-2M4 17v2a1 1 0 001 1h2M20 17v2a1 1 0 01-1 1h-2M7 12h10' },
  { id: 'friends', path: '/friends', icon: 'M9 11a4 4 0 100-8 4 4 0 000 8zM17 11a3 3 0 100-6 3 3 0 000 6zM2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2M16 15a4 4 0 014 4v2' },
  { id: 'profile', path: '/profile', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 1116 0' },
];

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const active = TABS.find((t) => location.pathname.startsWith(t.path))?.id ?? 'home';

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
        background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 60%, transparent)',
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: 'rgba(20,16,32,0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 22,
          padding: '10px 6px',
        }}
      >
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(t.path)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isActive ? theme.accent : 'rgba(255,255,255,0.45)'}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={t.icon} />
              </svg>
              {isActive && (
                <motion.div
                  layoutId="tabbar-dot"
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: theme.accent,
                    boxShadow: `0 0 8px ${theme.accent}`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
