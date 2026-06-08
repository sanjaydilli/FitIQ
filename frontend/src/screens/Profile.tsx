import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { themes, themeOrder } from '../themes/tokens';
import { Background } from '../components/Background';
import { Card, Pill } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { Icon, IconName } from '../components/Icon';
import { useWorkoutLog } from '../hooks/useWorkoutLog';
import { useFoodLog } from '../hooks/useFoodLog';
import { useBodyComp } from '../hooks/useBodyComp';
import { useAchievements } from '../hooks/useAchievements';
import { bodyFatCategory } from '../utils/bodyComposition';

export function Profile() {
  const { theme, themeId, setTheme } = useTheme();
  const { user } = useUser();
  const { logOut, currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogOut() {
    await logOut();
    navigate('/login');
  }
  const { sessions } = useWorkoutLog();
  const { activeDays } = useFoodLog();
  const { latest, measurements } = useBodyComp();
  const achievements = useAchievements();

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // XP progress within current level
  const xpInLevel = user.xp % 1000;
  const xpToNextLevel = 1000;
  const xpPct = (xpInLevel / xpToNextLevel) * 100;

  const totalVolume = sessions.reduce((s, sess) => s + sess.totalVolume, 0);
  const bfCat = latest ? bodyFatCategory(user.sex, latest.bodyFatPct) : null;

  const GOAL_LABEL: Record<string, string> = { lose: 'Fat Loss', gain: 'Muscle Gain', main: 'Maintenance', endur: 'Endurance' };

  const menuItems: { icon: IconName; iconColor: string; iconBg: string; t: string; d: string; path: string; badge?: string }[] = [
    {
      icon: 'lightning', iconColor: '#A78BFA', iconBg: 'rgba(167,139,250,0.12)',
      t: '3-Month Program',
      d: 'AI-powered periodization · Auto-updates monthly',
      path: '/program',
    },
    {
      icon: 'trophy', iconColor: '#FBBF24', iconBg: 'rgba(251,191,36,0.12)',
      t: 'Achievements',
      d: `${unlockedCount} of ${achievements.length} unlocked`,
      path: '/achievements',
    },
    {
      icon: 'body', iconColor: '#5EEAD4', iconBg: 'rgba(94,234,212,0.12)',
      t: 'Body Composition',
      d: latest ? `Last: ${latest.bodyFatPct}% BF · ${latest.date}` : 'No measurements yet',
      path: '/body-comp',
    },
    {
      icon: 'settings', iconColor: theme.accent, iconBg: `${theme.accent}15`,
      t: 'Goals & Settings',
      d: `${GOAL_LABEL[user.goal] ?? user.goal} · ${user.diet}`,
      path: '/settings',
    },
    {
      icon: 'calendar', iconColor: theme.accent2, iconBg: `${theme.accent2}15`,
      t: 'Activity Calendar',
      d: `${activeDays.size} active days tracked`,
      path: '/activity',
    },
  ];

  return (
    <Background>
      <div className="scroll-y" style={{ padding: '60px 0 110px', height: '100%', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700 }}>ACCOUNT</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>Profile</div>
        </div>

        {/* Hero card */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <Card style={{ padding: 20, borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, ${theme.accent2}28, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                flexShrink: 0,
                width: 72, height: 72, borderRadius: 36,
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 800, color: theme.onAccent,
                boxShadow: `0 4px 20px ${theme.accent}50, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}>
                {(user.name?.[0] ?? '?').toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 8, marginTop: 1 }}>
                  {GOAL_LABEL[user.goal]} · {user.diet}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Pill>LVL {user.level}</Pill>
                  <Pill color={theme.accent2}>{user.xp.toLocaleString()} XP</Pill>
                </div>
              </div>
            </div>

            {/* XP progress bar */}
            <div style={{ position: 'relative', marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, fontWeight: 700, letterSpacing: 0.6 }}>LVL {user.level}</span>
                <span style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.4 }}>{xpInLevel} / {xpToNextLevel} XP → LVL {user.level + 1}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: 3 }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Stats grid — 2x2 */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'WORKOUTS', value: sessions.length, color: theme.accent, sub: 'logged' },
              { label: 'VOLUME', value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${Math.round(totalVolume)}kg`, color: '#FB923C', sub: 'lifted' },
              { label: 'STREAK', value: `${user.streak}d`, color: '#FBBF24', sub: 'current' },
              { label: 'BADGES', value: `${unlockedCount}/${achievements.length}`, color: theme.accent2, sub: 'unlocked' },
            ].map(({ label, value, color, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
              >
                <Card style={{ padding: '12px 14px', borderRadius: 16 }}>
                  <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: -0.5, fontFamily: theme.mono, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 10, color: theme.textMute, marginTop: 4, fontFamily: theme.mono }}>{sub}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Body fat card (real data) */}
        {latest && bfCat && (
          <div style={{ padding: '0 20px', marginBottom: 16 }}>
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} onClick={() => navigate('/body-comp')} style={{ cursor: 'pointer' }}>
              <Card style={{ padding: 16, borderRadius: 20, borderLeft: `3px solid ${bfCat.color}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at right, ${bfCat.color}14, transparent 60%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 10, color: theme.textDim, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 700 }}>BODY FAT</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                      <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1.5, color: bfCat.color, fontFamily: theme.mono, lineHeight: 1 }}>{latest.bodyFatPct}</span>
                      <span style={{ fontSize: 16, color: theme.textDim, fontFamily: theme.mono }}>%</span>
                    </div>
                    <div style={{ fontSize: 11, color: bfCat.color, fontFamily: theme.mono, marginTop: 4, fontWeight: 700, letterSpacing: 0.4 }}>{bfCat.label}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: theme.textDim, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 700 }}>LEAN MASS</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, fontFamily: theme.mono }}>{latest.leanMass}kg</div>
                    <div style={{ fontSize: 10, color: theme.textDim, fontFamily: theme.mono, marginTop: 8, letterSpacing: 1.2, fontWeight: 700 }}>WEIGHT</div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.mono, marginTop: 2 }}>{latest.weightKg}kg</div>
                  </div>
                </div>
                {measurements.length >= 2 && (() => {
                  const first = measurements[0];
                  const delta = Math.round((latest.bodyFatPct - first.bodyFatPct) * 10) / 10;
                  return (
                    <div style={{ position: 'relative', fontSize: 11, color: delta <= 0 ? '#4ade80' : '#F87171', fontFamily: theme.mono, marginTop: 10, fontWeight: 700 }}>
                      {delta <= 0 ? '↓' : '↑'} {Math.abs(delta)}% since first measurement
                    </div>
                  );
                })()}
              </Card>
            </motion.div>
          </div>
        )}

        {/* Theme switcher */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>THEME</div>
          <Card style={{ borderRadius: 18, padding: 6, display: 'flex', gap: 4 }}>
            {themeOrder.map((id) => {
              const t = themes[id];
              const sel = id === themeId;
              return (
                <motion.button key={id} whileTap={{ scale: 0.96 }} onClick={() => setTheme(id)}
                  style={{
                    flex: 1, padding: '12px 8px',
                    background: sel ? `${theme.accent}15` : 'transparent',
                    border: sel ? `1px solid ${theme.accent}` : '1px solid transparent',
                    borderRadius: 12, color: theme.text, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                    boxShadow: sel ? `inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
                  }}>
                  <div style={{ width: 28, height: 18, borderRadius: 5, background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, boxShadow: sel ? `0 2px 6px ${t.accent}40` : 'none' }} />
                  {t.name.split(' ')[0]}
                </motion.button>
              );
            })}
          </Card>
        </div>

        {/* Menu items */}
        <div style={{ padding: '0 20px' }}>
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {menuItems.map((it, i, a) => (
              <motion.div
                key={it.t}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(it.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', cursor: 'pointer',
                  borderBottom: i < a.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: it.iconBg, border: `1px solid ${it.iconColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={it.icon} size={16} color={it.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.2 }}>{it.t}</div>
                    {it.badge && (
                      <div style={{ padding: '1px 6px', borderRadius: 6, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, fontSize: 8, fontWeight: 800, color: '#000', letterSpacing: 0.5 }}>
                        {it.badge}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMute, marginTop: 1, lineHeight: 1.4 }}>{it.d}</div>
                </div>
                <Icon name="chevron-right" size={16} color={theme.textMute} />
              </motion.div>
            ))}
          </Card>

          {/* Account section */}
          {currentUser && currentUser.uid !== 'guest' && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.5, marginBottom: 6 }}>
                ACCOUNT · {currentUser.email}
              </div>
              <Card style={{ borderRadius: 14, overflow: 'hidden' }}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogOut}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', cursor: 'pointer' }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="logout" size={16} color="#F87171" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F87171' }}>Sign Out</div>
                    <div style={{ fontSize: 11, color: theme.textMute }}>Log out of your account</div>
                  </div>
                </motion.div>
              </Card>
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </Background>
  );
}
