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
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Achievements</div>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono }}>
            {unlockedCount} / {achievements.length} unlocked
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        {/* Progress bar */}
        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: 3 }}
            />
          </div>
          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginTop: 4 }}>
            {Math.round((unlockedCount / achievements.length) * 100)}% complete
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ padding: '0 16px 12px', overflowX: 'auto', display: 'flex', gap: 6, scrollbarWidth: 'none' }}>
          {filters.map(f => {
            const sel = filter === f.id;
            return (
            <motion.button key={f.id} whileTap={{ scale: 0.94 }} onClick={() => setFilter(f.id)}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: sel ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : theme.card,
                color: sel ? theme.onAccent : theme.textDim,
                fontSize: 11, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              {f.icon && <Icon name={f.icon} size={11} color={sel ? theme.onAccent : theme.textDim} strokeWidth={2} />}
              {f.label}
            </motion.button>
            );
          })}
        </div>

        {/* Achievements grid */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card style={{
                borderRadius: 16, padding: '12px 14px',
                opacity: a.unlocked ? 1 : 0.55,
                borderLeft: a.unlocked ? `3px solid ${theme.accent}` : `3px solid rgba(255,255,255,0.1)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: a.unlocked ? `linear-gradient(135deg, ${theme.accent}30, ${theme.accent2}20)` : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    filter: a.unlocked ? 'none' : 'grayscale(1)',
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{a.title}</span>
                      {a.unlocked && (
                        <span style={{ fontSize: 9, background: `${theme.accent}25`, color: theme.accent, borderRadius: 6, padding: '1px 6px', fontFamily: theme.mono, fontWeight: 700 }}>
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: theme.textDim, marginBottom: a.progress !== undefined && !a.unlocked ? 6 : 0 }}>
                      {a.description}
                    </div>
                    {!a.unlocked && a.progress !== undefined && (
                      <div>
                        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 3 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${a.progress}%` }}
                            transition={{ duration: 0.6, delay: i * 0.04 }}
                            style={{ height: '100%', background: theme.accent2, borderRadius: 2 }}
                          />
                        </div>
                        <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>{a.progressLabel}</div>
                      </div>
                    )}
                  </div>
                  {a.xpReward > 0 && (
                    <div style={{
                      fontSize: 10, fontFamily: theme.mono, fontWeight: 700,
                      color: a.unlocked ? '#FBBF24' : theme.textMute,
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
