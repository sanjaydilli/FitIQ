import React from 'react';

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          height: '100vh',
          maxHeight: 844,
          position: 'relative',
          overflow: 'hidden',
          background: '#000',
          boxShadow: '0 30px 90px rgba(0,0,0,0.55)',
        }}
      >
        {/* status bar spacer */}
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
      </div>
    </div>
  );
}
