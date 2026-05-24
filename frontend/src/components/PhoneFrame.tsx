import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

function isNative() {
  return Capacitor.isNativePlatform();
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [native] = useState(isNative);

  // Configure native status bar on Android
  useEffect(() => {
    if (!native) return;
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => {});
  }, [native]);

  // On a real Android device — render full-screen, no frame
  if (native) {
    return (
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#000' }}>
        {children}
      </div>
    );
  }

  // In browser — show the phone chrome for demo purposes
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #000 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        perspective: '1200px',
      }}
    >
      <motion.div
        animate={{
          rotateX: [0, 1.2, 0, -0.8, 0],
          rotateY: [0, -1.5, 0.8, 1.5, 0],
          y: [0, -4, 0, -2, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
        style={{
          width: '100%',
          maxWidth: 390,
          height: '100vh',
          maxHeight: 844,
          position: 'relative',
          overflow: 'hidden',
          background: '#000',
          borderRadius: 0,
          boxShadow:
            '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(120,80,255,0.12)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Fake status bar for browser preview */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 44,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
            pointerEvents: 'none',
          }}
        >
          <span>9:41</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span>●●●</span>
            <span>100%</span>
          </span>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
