import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { themes, themeOrder, ThemeId, ThemeTokens } from '../themes/tokens';
import { Background } from '../components/Background';
import { PrimaryButton } from '../components/Card';

function MiniPreview({ t, selected }: { t: ThemeTokens; selected: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 64,
        height: 84,
        borderRadius: 12,
        background: t.bg,
        border: `${selected ? 2 : 1}px solid ${selected ? t.accent : t.cardBorder}`,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 6,
          borderRadius: 8,
          background: t.id === 'aurora' ? 'rgba(255,255,255,0.06)' : t.card,
          border: `1px solid ${t.cardBorder}`,
          backdropFilter: t.id === 'aurora' ? 'blur(10px)' : undefined,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          width: 18,
          height: 4,
          borderRadius: 2,
          background: t.accent,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 22,
          width: 30,
          height: 3,
          borderRadius: 2,
          background: t.textDim,
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 14,
          width: 22,
          height: 22,
          borderRadius: 6,
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
        }}
      />
    </div>
  );
}

export function ThemeSelector() {
  const { theme, themeId, setTheme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.name) navigate('/home', { replace: true });
  }, [user.name, navigate]);

  return (
    <Background>
      <div
        style={{
          padding: '70px 24px 30px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: theme.textMute,
            fontFamily: theme.mono,
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          PICK YOUR VIBE
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: -0.5,
            lineHeight: 1.15,
            marginBottom: 8,
            color: theme.text,
          }}
        >
          Choose your<br />
          interface theme
        </div>
        <div style={{ color: theme.textDim, fontSize: 14, marginBottom: 28, lineHeight: 1.45 }}>
          You can switch anytime from your profile.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {themeOrder.map((id: ThemeId, i: number) => {
            const t = themes[id];
            const sel = id === themeId;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => setTheme(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: theme.radius,
                  border: `${sel ? 1.5 : 1}px solid ${sel ? t.accent : theme.cardBorder}`,
                  background: sel ? `${t.accent}12` : theme.card,
                  backdropFilter: theme.id === 'aurora' ? 'blur(20px) saturate(150%)' : undefined,
                  WebkitBackdropFilter: theme.id === 'aurora' ? 'blur(20px) saturate(150%)' : undefined,
                  boxShadow: sel
                    ? `0 6px 22px ${t.accent}22, inset 0 1px 0 rgba(255,255,255,0.04)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, background 0.2s, border-color 0.2s',
                }}
              >
                <MiniPreview t={t} selected={sel} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: theme.text,
                      marginBottom: 2,
                      letterSpacing: -0.2,
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: 12, color: theme.textDim }}>{t.tagline}</div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                    {[t.accent, t.accent2, t.warn].map((c, idx) => (
                      <div
                        key={idx}
                        style={{ width: 12, height: 12, borderRadius: 6, background: c, boxShadow: `0 2px 6px ${c}40` }}
                      />
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    border: sel ? `2px solid ${t.accent}` : `1.5px solid ${theme.cardBorder}`,
                    background: sel ? t.accent : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  {sel && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6.5L4.5 9L10 3.5"
                        stroke={t.onAccent}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <PrimaryButton onClick={() => navigate('/onboarding')} style={{ marginTop: 16 }}>
          Continue →
        </PrimaryButton>
      </div>
    </Background>
  );
}
