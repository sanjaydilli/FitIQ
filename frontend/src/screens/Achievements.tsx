import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon, IconName } from '../components/Icon';
import { useAchievements } from '../hooks/useAchievements';

type Filter = 'all' | 'unlocked' | 'workout' | 'nutrition' | 'consistency' | 'body' | 'level';

export function Achievements() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const achievements = useAchievements();
  const [filter, setFilter] = useState<Filter>('all');

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const filters: { id: Filter; label: string; icon?: IconName }[] = [
    { id: 'all', label: 'All' },
    { id: 'unlocked', label: 'Unlocked', icon: 'check' },
    { id: 'workout', label: 'Workout', icon: 'dumbbell' },
    { id: 'nutrition', label: 'Nutrition', icon: 'utensils' },
    { id: 'consistency', label: 'Streak', icon: 'streak' },
    { id: 'body', label: 'Body', icon: 'body' },
    { id: 'level', label: 'Level', icon: 'star' },
  ];

  const visible = achievements.filter(a =>
    filter === 'all' ? true :
    filter === 'unlocked' ? a.unlocked :
    a.category === filter
  );

  return (
    <Background>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '14px 20px',
        background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.cardBorder}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          style={{ background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Achievements</div>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.6 }}>
            {unlockedCount} / {achievements.length} unlocked
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        {/* Progress bar */}
        <div style={{ padding: '14px 20px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>Progress</div>
            <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono, letterSpacing: 0.6 }}>
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(15,23,42,0.06)', overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.3)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: 3, boxShadow: `0 0 12px ${theme.accent}55` }}
            />
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ padding: '0 20px 14px', overflowX: 'auto', display: 'flex', gap: 6, scrollbarWidth: 'none' }}>
          {filters.map(f => {
            const sel = filter === f.id;
            return (
            <motion.button key={f.id} whileTap={{ scale: 0.96 }} onClick={() => setFilter(f.id)}
              style={{
                flexShrink: 0, padding: '7px 13px', borderRadius: 20, border: sel ? 'none' : `1px solid ${theme.cardBorder}`, cursor: 'pointer',
                background: sel ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : 'rgba(15,23,42,0.04)',
                color: sel ? theme.onAccent : theme.textDim,
                fontSize: 11, fontWeight: 700,
                letterSpacing: sel ? 0.3 : 0.2,
                display: 'flex', alignItems: 'center', gap: 5,
                boxShadow: sel ? `0 4px 12px ${theme.accent}33` : 'none',
              }}>
              {f.icon && <Icon name={f.icon} size={11} color={sel ? theme.onAccent : theme.textDim} strokeWidth={2} />}
              {f.label}
            </motion.button>
            );
          })}
        </div>

        {/* Achievements grid */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 280, damping: 26 }}
            >
              <Card style={{
                borderRadius: 16, padding: '14px 14px',
                background: a.unlocked
                  ? `linear-gradient(135deg, ${theme.accent}0a, transparent 60%)`
                  : 'rgba(15,23,42,0.02)',
                borderLeft: a.unlocked ? `3px solid ${theme.accent}` : `3px solid rgba(15,23,42,0.06)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 14,
                      background: a.unlocked
                        ? `linear-gradient(135deg, ${theme.accent}38, ${theme.accent2}22)`
                        : 'rgba(15,23,42,0.03)',
                      border: a.unlocked ? `1px solid ${theme.accent}40` : `1px solid ${theme.cardBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                      filter: a.unlocked ? 'none' : 'grayscale(1) opacity(0.45)',
                      boxShadow: a.unlocked ? `0 4px 14px ${theme.accent}22, inset 0 1px 0 rgba(15,23,42,0.08)` : 'inset 0 1px 0 rgba(15,23,42,0.02)',
                    }}>
                      {a.icon}
                    </div>
                    {!a.unlocked && (
                      <div style={{
                        position: 'absolute', bottom: -3, right: -3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'rgba(20,20,20,0.95)',
                        border: `1px solid ${theme.cardBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={theme.textMute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: a.unlocked ? theme.text : theme.textDim, letterSpacing: -0.2 }}>{a.title}</span>
                      {a.unlocked && (
                        <span style={{ fontSize: 9, background: `${theme.accent}25`, color: theme.accent, borderRadius: 6, padding: '1px 6px', fontFamily: theme.mono, fontWeight: 700, letterSpacing: 0.8 }}>
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: a.unlocked ? theme.textDim : theme.textMute, marginBottom: a.progress !== undefined && !a.unlocked ? 7 : 0, lineHeight: 1.4 }}>
                      {a.description}
                    </div>
                    {!a.unlocked && a.progress !== undefined && (
                      <div>
                        <div style={{ height: 3, borderRadius: 2, background: 'rgba(15,23,42,0.05)', overflow: 'hidden', marginBottom: 4 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${a.progress}%` }}
                            transition={{ duration: 0.6, delay: 0.1 + i * 0.04, ease: 'easeOut' }}
                            style={{ height: '100%', background: `linear-gradient(90deg, ${theme.accent2}, ${theme.accent})`, borderRadius: 2 }}
                          />
                        </div>
                        <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.6 }}>{a.progressLabel}</div>
                      </div>
                    )}
                  </div>
                  {a.xpReward > 0 && (
                    <div style={{
                      fontSize: 10, fontFamily: theme.mono, fontWeight: 700,
                      color: a.unlocked ? '#D97706' : theme.textMute,
                      letterSpacing: 0.5,
                      flexShrink: 0,
                    }}>
                      +{a.xpReward} XP
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Background>
  );
}
