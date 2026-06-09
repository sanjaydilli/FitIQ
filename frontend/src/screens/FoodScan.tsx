import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card, Pill, PrimaryButton } from '../components/Card';
import { TabBar } from '../components/TabBar';

export function FoodScan() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 1800);
    return () => clearTimeout(t);
  }, []);

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
          <Card onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
            {scanning ? 'ANALYZING' : 'COMING SOON'}
          </Pill>
          <div style={{ width: 38 }} />
        </div>

        {/* Bottom sheet — shown after scanning animation */}
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: scanning ? 200 : 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 110 }}
        >
          <Card
            style={{
              padding: 24,
              borderRadius: 26,
              background: 'rgba(20,16,32,0.85)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>📸</div>
            <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 6, letterSpacing: -0.4 }}>AI Food Scanner</div>
            <div style={{ fontSize: 13, color: theme.textDim, lineHeight: 1.6, marginBottom: 20 }}>
              Vision-based meal scanning is coming soon.{'\n'}
              For now, search our database of 542 Indian foods.
            </div>
            <PrimaryButton onClick={() => navigate('/food')} style={{ width: '100%', fontSize: 15 }}>
              Search Food Database →
            </PrimaryButton>
          </Card>
        </motion.div>
      </div>
      <TabBar />
    </Background>
  );
}
