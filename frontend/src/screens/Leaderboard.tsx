import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card, Pill } from '../components/Card';
import { TabBar } from '../components/TabBar';

interface Friend {
  r: number;
  n: string;
  xp: number;
  avatar: string;
  delta: string;
  me: boolean;
  stage: number;
}

function getWeekInfo(): { weekNum: number; daysLeft: number } {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  const dayOfWeek = now.getDay(); // 0=Sun
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return { weekNum, daysLeft };
}

export function Leaderboard() {
  const { theme } = useTheme();
  const { user } = useUser();
  const { weekNum, daysLeft } = getWeekInfo();

  // Friends XP scaled relative to user's XP so ranking stays sensible at any progression
  const base = Math.max(user.xp, 500);
  const friends: Friend[] = [
    { r: 1, n: 'Riya Mehta',  xp: Math.round(base * 1.22), avatar: '#F472B6', delta: '+340', me: false, stage: Math.floor(base * 1.22 / 1000) + 1 },
    { r: 2, n: 'You',         xp: user.xp,                  avatar: theme.accent, delta: `+${Math.min(user.xp % 1000, 999)}`, me: true, stage: user.level },
    { r: 3, n: 'Karan Joshi', xp: Math.round(base * 1.01), avatar: '#60A5FA', delta: '+180', me: false, stage: Math.floor(base * 1.01 / 1000) + 1 },
    { r: 4, n: 'Aditi Rao',   xp: Math.round(base * 0.90), avatar: '#7C3AED', delta: '+120', me: false, stage: Math.floor(base * 0.90 / 1000) + 1 },
    { r: 5, n: 'Vikram S.',   xp: Math.round(base * 0.74), avatar: '#D97706', delta: '+80',  me: false, stage: Math.floor(base * 0.74 / 1000) + 1 },
    { r: 6, n: 'Neha P.',     xp: Math.round(base * 0.62), avatar: '#EA580C', delta: '+60',  me: false, stage: Math.floor(base * 0.62 / 1000) + 1 },
  ].sort((a, b) => b.xp - a.xp).map((f, i) => ({ ...f, r: i + 1 }));

  const podium = [friends[1], friends[0], friends[2]];

  return (
    <Background>
      <div className="scroll-y" style={{ padding: '60px 0 110px', height: '100%', overflowY: 'auto' }}>
        <div
          style={{
            padding: '0 20px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: theme.accent,
                fontFamily: theme.mono,
                letterSpacing: 1.8,
                marginBottom: 4,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Week {weekNum} · {daysLeft === 0 ? 'Last Day' : `${daysLeft} Days Left`}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Squad League</div>
          </div>
          <Pill>+240 XP</Pill>
        </div>

        {/* Podium */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <Card style={{ padding: 16, borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at center top, ${theme.accent2}20, transparent 60%)`,
              }}
            />
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                paddingTop: 8,
              }}
            >
              {podium.map((f, idx) => {
                const pos = [2, 1, 3][idx];
                const h = pos === 1 ? 70 : pos === 2 ? 50 : 40;
                return (
                  <motion.div
                    key={f.n}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 260, damping: 22 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: pos === 1 ? 58 : 46,
                          height: pos === 1 ? 58 : 46,
                          borderRadius: '50%',
                          background: f.avatar,
                          border: f.me
                            ? `2px solid ${theme.accent}`
                            : `2px solid ${pos === 1 ? '#D97706' : 'rgba(15,23,42,0.2)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: pos === 1 ? 19 : 14,
                          color: '#0a0612',
                          boxShadow: pos === 1
                            ? '0 8px 22px rgba(217,119,6,0.35), inset 0 1px 0 rgba(15,23,42,0.25)'
                            : 'inset 0 1px 0 rgba(15,23,42,0.15)',
                        }}
                      >
                        {f.n[0]}
                      </div>
                      {pos === 1 && (
                        <motion.div
                          initial={{ y: -4, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, type: 'spring' as const, stiffness: 240 }}
                          style={{
                            position: 'absolute',
                            top: -12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 18,
                            filter: 'drop-shadow(0 2px 4px rgba(217,119,6,0.45))',
                          }}
                        >
                          👑
                        </motion.div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: -0.1 }}>{f.n.split(' ')[0]}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: theme.accent,
                        fontFamily: theme.mono,
                        fontFeatureSettings: '"tnum"',
                        fontWeight: 700,
                        letterSpacing: 0.2,
                      }}
                    >
                      {f.xp.toLocaleString()}
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ delay: 0.15 + idx * 0.08, duration: 0.5, ease: 'easeOut' }}
                      style={{
                        width: 52,
                        borderRadius: '8px 8px 0 0',
                        background:
                          pos === 1
                            ? `linear-gradient(180deg, #D97706, ${theme.accent2})`
                            : `linear-gradient(180deg, ${theme.accent}55, ${theme.accent2}25)`,
                        border: `1px solid ${pos === 1 ? '#D9770640' : theme.cardBorder}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: 4,
                        fontFamily: theme.mono,
                        fontSize: 12,
                        fontWeight: 800,
                        color: pos === 1 ? '#0a0612' : theme.text,
                        boxShadow: pos === 1 ? '0 6px 16px rgba(217,119,6,0.3)' : 'inset 0 1px 0 rgba(15,23,42,0.08)',
                      }}
                    >
                      {pos}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              fontSize: 10,
              color: theme.textMute,
              fontFamily: theme.mono,
              letterSpacing: 1.6,
              marginBottom: 8,
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '0 2px',
            }}
          >
            Full Ranking
          </div>
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {friends.map((f, i, a) => (
              <motion.div
                key={f.n}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 14px',
                  borderBottom: i < a.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                  background: f.me ? `${theme.accent}10` : 'transparent',
                  borderLeft: f.me ? `3px solid ${theme.accent}` : '3px solid transparent',
                }}
              >
                <div
                  style={{
                    width: 22,
                    fontSize: 13,
                    fontFamily: theme.mono,
                    color: f.r <= 3 ? theme.accent : theme.textMute,
                    fontWeight: 800,
                    letterSpacing: -0.2,
                    textAlign: 'center',
                  }}
                >
                  {f.r}
                </div>
                {f.me ? (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                      color: '#0a0612',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      border: `2px solid ${theme.accent}`,
                      flexShrink: 0,
                    }}
                  >
                    {user.name ? user.name[0].toUpperCase() : 'Y'}
                  </div>
                ) : (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: f.avatar,
                      color: '#0a0612',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {f.n[0]}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.2 }}>
                    {f.n}{' '}
                    {f.me && (
                      <span
                        style={{
                          color: theme.accent,
                          fontSize: 9,
                          fontFamily: theme.mono,
                          marginLeft: 4,
                          padding: '1px 6px',
                          background: `${theme.accent}25`,
                          borderRadius: 5,
                          letterSpacing: 0.8,
                          fontWeight: 700,
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.6, marginTop: 1 }}>
                    LVL {f.stage}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      fontFamily: theme.mono,
                      fontFeatureSettings: '"tnum"',
                      letterSpacing: -0.3,
                    }}
                  >
                    {f.xp.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, fontWeight: 700, marginTop: 1 }}>{f.delta}</div>
                </div>
              </motion.div>
            ))}
          </Card>
        </div>
      </div>
      <TabBar />
    </Background>
  );
}
