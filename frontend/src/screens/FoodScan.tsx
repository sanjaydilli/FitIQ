import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card, Pill, PrimaryButton } from '../components/Card';
import { TabBar } from '../components/TabBar';

const FOODS = [
  { n: 'Sambar', g: '180g', k: 120, c: 95 },
  { n: 'Steamed rice', g: '150g', k: 195, c: 88 },
  { n: 'Coconut chutney', g: '40g', k: 85, c: 72 },
  { n: 'Idli (3)', g: '120g', k: 220, c: 96 },
];

export function FoodScan() {
  const { theme } = useTheme();
  const [scanning, setScanning] = useState(true);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const total = FOODS.reduce((acc, f) => acc + f.k, 0);

  return (
    <Background>
      <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Camera viewfinder */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(50,30,80,1) 0%, rgba(10,6,20,1) 80%)',
          }}
        >
          {/* food placeholder */}
          <div
            style={{
              position: 'absolute',
              top: '34%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 220,
              height: 220,
              borderRadius: 18,
              background:
                'repeating-linear-gradient(135deg, rgba(255,180,80,0.18), rgba(255,180,80,0.18) 6px, transparent 6px, transparent 14px), rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
            }}
          >
            🍛
          </div>

          {/* scan frame */}
          <div
            style={{
              position: 'absolute',
              inset: '20% 12%',
              borderRadius: 24,
              border: `1.5px solid ${theme.accent}`,
              boxShadow: `0 0 40px ${theme.accent}40`,
            }}
          >
            {([
              [0, 0],
              [1, 0],
              [0, 1],
              [1, 1],
            ] as const).map(([x, y]) => (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'absolute',
                  top: y ? 'auto' : -2,
                  bottom: y ? -2 : 'auto',
                  left: x ? 'auto' : -2,
                  right: x ? -2 : 'auto',
                  width: 24,
                  height: 24,
                  borderTop: y ? 'none' : `3px solid ${theme.accent}`,
                  borderBottom: y ? `3px solid ${theme.accent}` : 'none',
                  borderLeft: x ? 'none' : `3px solid ${theme.accent}`,
                  borderRight: x ? `3px solid ${theme.accent}` : 'none',
                }}
              />
            ))}
            {scanning && (
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: '100%' }}
                transition={{ duration: 1.4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  top: 0,
                  background: theme.accent,
                  boxShadow: `0 0 12px ${theme.accent}`,
                }}
              />
            )}
          </div>
        </div>

        {/* Header */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 20px',
            alignItems: 'center',
          }}
        >
          <Card style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2.2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Card>
          <Pill style={{ background: `${theme.accent}25`, border: `1px solid ${theme.accent}40` }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: theme.accent,
                animation: 'fitiq-pulse 1s infinite',
                display: 'inline-block',
              }}
            />
            {scanning ? 'ANALYZING' : 'DETECTED'}
          </Pill>
          <Card style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Card>
        </div>

        {/* Bottom sheet */}
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: scanning ? 200 : 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 110 }}
        >
          <Card
            style={{
              padding: 18,
              borderRadius: 26,
              background: 'rgba(20,16,32,0.85)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.accent,
                    fontFamily: theme.mono,
                    letterSpacing: 1.5,
                  }}
                >
                  DETECTED · {FOODS.length} ITEMS
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>South Indian Thali</div>
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: theme.mono,
                  color: theme.accent,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {total}
                <span style={{ fontSize: 11, color: theme.textDim }}>kcal</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {FOODS.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: i < FOODS.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{f.n}</div>
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
                      {f.g} · {f.c}% match
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: theme.mono }}>{f.k} kcal</div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: 6,
                marginBottom: 14,
              }}
            >
              {[
                { l: 'P', v: '18g', c: theme.accent },
                { l: 'C', v: '102g', c: '#FB923C' },
                { l: 'F', v: '14g', c: theme.warn },
                { l: 'Fib', v: '8g', c: theme.accent2 },
              ].map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    padding: '8px 6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 9, color: m.c, fontFamily: theme.mono, letterSpacing: 1 }}>
                    {m.l}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{m.v}</div>
                </div>
              ))}
            </div>

            <PrimaryButton onClick={() => setLogged(true)} style={{ width: '100%', padding: 14, fontSize: 14 }}>
              {logged ? '✓ Logged to today' : "Log to today's intake"}
            </PrimaryButton>
          </Card>
        </motion.div>
      </div>
      <TabBar />
    </Background>
  );
}
