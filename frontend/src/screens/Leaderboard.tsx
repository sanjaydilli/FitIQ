import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card, Pill } from '../components/Card';
import { TabBar } from '../components/TabBar';
import { BitmojiAvatar } from '../components/BitmojiAvatar';

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
    { r: 4, n: 'Aditi Rao',   xp: Math.round(base * 0.90), avatar: '#A78BFA', delta: '+120', me: false, stage: Math.floor(base * 0.90 / 1000) + 1 },
    { r: 5, n: 'Vikram S.',   xp: Math.round(base * 0.74), avatar: '#FBBF24', delta: '+80',  me: false, stage: Math.floor(base * 0.74 / 1000) + 1 },
    { r: 6, n: 'Neha P.',     xp: Math.round(base * 0.62), avatar: '#FB923C', delta: '+60',  me: false, stage: Math.floor(base * 0.62 / 1000) + 1 },
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
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              WEEK {weekNum} · {daysLeft === 0 ? 'LAST DAY' : `${daysLeft} DAYS LEFT`}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Squad League</div>
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
                  <div
                    key={f.n}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: pos === 1 ? 56 : 44,
                          height: pos === 1 ? 56 : 44,
                          borderRadius: '50%',
                          background: f.avatar,
                          border: f.me
                            ? `2px solid ${theme.accent}`
                            : `2px solid ${pos === 1 ? '#FBBF24' : 'rgba(255,255,255,0.2)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: pos === 1 ? 18 : 14,
                          color: '#0a0612',
                        }}
                      >
                        {f.n[0]}
                      </div>
                      {pos === 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 16,
                          }}
                        >
                          👑
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{f.n.split(' ')[0]}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: theme.accent,
                        fontFamily: theme.mono,
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      {f.xp.toLocaleString()}
                    </div>
                    <div
                      style={{
                        width: 50,
                        height: h,
                        borderRadius: '6px 6px 0 0',
                        background:
                          pos === 1
                            ? `linear-gradient(180deg, #FBBF24, ${theme.accent2})`
                            : `linear-gradient(180deg, ${theme.accent}40, ${theme.accent2}20)`,
                        border: `1px solid ${pos === 1 ? '#FBBF2440' : theme.cardBorder}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: 4,
                        fontFamily: theme.mono,
                        fontSize: 11,
                        fontWeight: 700,
                        color: pos === 1 ? '#0a0612' : theme.text,
                      }}
                    >
                      {pos}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              fontSize: 11,
              color: theme.textDim,
              fontFamily: theme.mono,
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            FULL RANKING
          </div>
          <Card style={{ borderRadius: 18, overflow: 'hidden' }}>
            {friends.map((f, i, a) => (
              <div
                key={f.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderBottom: i < a.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                  background: f.me ? `${theme.accent}10` : 'transparent',
                }}
              >
                <div
                  style={{
                    width: 22,
                    fontSize: 12,
                    fontFamily: theme.mono,
                    color: f.r <= 3 ? theme.accent : theme.textDim,
                    fontWeight: 700,
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
                      overflow: 'hidden',
                      border: `2px solid ${theme.accent}`,
                      flexShrink: 0,
                      background: '#0a0612',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ transform: 'translateY(6px)' }}>
                      <BitmojiAvatar
                        config={user.avatar}
                        size={44}
                        level={0}
                        showBackground={false}
                        showAura={false}
                        rounded={false}
                      />
                    </div>
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {f.n}{' '}
                    {f.me && (
                      <span
                        style={{
                          color: theme.accent,
                          fontSize: 10,
                          fontFamily: theme.mono,
                          marginLeft: 4,
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
                    LVL {f.stage}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: theme.mono,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {f.xp.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono }}>{f.delta}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <TabBar />
    </Background>
  );
}
