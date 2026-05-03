import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { themes, themeOrder } from '../themes/tokens';
import { Background } from '../components/Background';
import { Card, Pill } from '../components/Card';
import { Spark } from '../components/Spark';
import { TabBar } from '../components/TabBar';
import { BitmojiAvatar } from '../components/BitmojiAvatar';

export function Profile() {
  const { theme, themeId, setTheme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();

  const items = [
    { i: '🏆', t: 'Achievements', d: '12 of 48 unlocked' },
    { i: '📊', t: 'Body measurements', d: 'Updated 2 days ago' },
    { i: '⚙️', t: 'Goals & preferences', d: `${user.goal === 'gain' ? 'Build muscle' : 'Stay healthy'} · ${user.diet}` },
    { i: '🔔', t: 'Notifications', d: 'On' },
  ];

  return (
    <Background>
      <div className="scroll-y" style={{ padding: '60px 0 110px', height: '100%', overflowY: 'auto' }}>
        {/* Hero */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <Card style={{ padding: 18, borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 30% 30%, ${theme.accent2}30, transparent 70%)`,
              }}
            />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.div
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/avatar')}
                style={{ flexShrink: 0, cursor: 'pointer', position: 'relative' }}
              >
                <BitmojiAvatar
                  config={user.avatar}
                  size={92}
                  level={user.level}
                  showBackground={false}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: -2,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: theme.accent,
                    color: theme.onAccent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    boxShadow: `0 0 8px ${theme.accent}80`,
                  }}
                >
                  ✎
                </div>
              </motion.div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{user.name} Kapoor</div>
                <div style={{ fontSize: 12, color: theme.textDim }}>Bengaluru · Joined Jan 2026</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <Pill>LVL {user.level}</Pill>
                  <Pill color={theme.accent2}>{user.xp.toLocaleString()} XP</Pill>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Body Fat % */}
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <Card style={{ padding: 18, borderRadius: 22 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.textDim,
                    fontFamily: theme.mono,
                    letterSpacing: 1,
                  }}
                >
                  BODY FAT %
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span
                    style={{
                      fontSize: 38,
                      fontWeight: 800,
                      letterSpacing: -1.5,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    18.4
                  </span>
                  <span style={{ fontSize: 16, color: theme.textDim }}>%</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.accent,
                    fontFamily: theme.mono,
                    marginTop: 2,
                  }}
                >
                  −2.1% in 90 days ↓
                </div>
              </div>
              <Pill>ATHLETIC</Pill>
            </div>
            <div style={{ marginTop: 12, height: 80, position: 'relative' }}>
              <Spark
                data={[20.5, 20.3, 20.8, 20.1, 19.6, 19.4, 19.0, 19.2, 18.8, 18.5, 18.6, 18.4]}
                width={320}
                height={80}
                color={theme.accent}
                fill={theme.accent}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  fontSize: 10,
                  color: theme.textMute,
                  fontFamily: theme.mono,
                }}
              >
                20.5%
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  fontSize: 10,
                  color: theme.textMute,
                  fontFamily: theme.mono,
                }}
              >
                18.4%
              </div>
            </div>
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: theme.textMute,
                fontFamily: theme.mono,
              }}
            >
              <span>FEB</span>
              <span>MAR</span>
              <span>APR</span>
              <span>MAY</span>
            </div>
          </Card>
        </div>

        {/* 3-month wrapped */}
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <Card
            style={{
              padding: 14,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${theme.accent2}40, ${theme.accent}20)`,
              border: `1px solid ${theme.accent2}50`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                ✨
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.accent,
                    fontFamily: theme.mono,
                    letterSpacing: 1.5,
                    fontWeight: 700,
                  }}
                >
                  NEW · DROPS MAY 31
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Your 3-Month Wrapped</div>
                <div style={{ fontSize: 11, color: theme.textDim }}>
                  −3.8kg · 47 workouts · 280k steps
                </div>
              </div>
              <div style={{ color: theme.text }}>›</div>
            </div>
          </Card>
        </div>

        {/* Theme switcher */}
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <div
            style={{
              fontSize: 11,
              color: theme.textDim,
              fontFamily: theme.mono,
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            THEME
          </div>
          <Card style={{ borderRadius: 18, padding: 6, display: 'flex', gap: 4 }}>
            {themeOrder.map((id) => {
              const t = themes[id];
              const sel = id === themeId;
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTheme(id)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    background: sel ? `${theme.accent}15` : 'transparent',
                    border: sel ? `1px solid ${theme.accent}` : '1px solid transparent',
                    borderRadius: 12,
                    color: theme.text,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 16,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
                    }}
                  />
                  {t.name.split(' ')[0]}
                </motion.button>
              );
            })}
          </Card>
        </div>

        {/* Settings list */}
        <div style={{ padding: '0 20px' }}>
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {items.map((it, i, a) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 14px',
                  borderBottom: i < a.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {it.i}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{it.t}</div>
                  <div style={{ fontSize: 11, color: theme.textMute, textTransform: 'capitalize' }}>{it.d}</div>
                </div>
                <div style={{ color: theme.textMute, fontSize: 16 }}>›</div>
              </div>
            ))}
          </Card>

          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: 16,
              width: '100%',
              padding: 14,
              borderRadius: 14,
              border: `1px solid ${theme.cardBorder}`,
              background: 'transparent',
              color: theme.textDim,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: theme.font,
            }}
          >
            Restart onboarding
          </button>
        </div>
      </div>
      <TabBar />
    </Background>
  );
}
