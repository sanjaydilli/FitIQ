import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Warning } from '../../utils/warnings/warningTypes';

interface WarningCardProps {
  warning: Warning;
  onAct: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

const TYPE_COLOR: Record<Warning['type'], string> = {
  critical: '#F87171',
  daily:    '#FBBF24',
  timing:   '#60A5FA',
  weekly:   '#A78BFA',
  micro:    '#5EEAD4',
};

const TYPE_LABEL: Record<Warning['type'], string> = {
  critical: 'CRITICAL',
  daily:    'DAILY',
  timing:   'TIMING',
  weekly:   'WEEKLY',
  micro:    'NUTRITION',
};

export function WarningCard({ warning, onAct, onSnooze, onDismiss }: WarningCardProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);
  const color = TYPE_COLOR[warning.type];

  function handleAct() {
    setActing(true);
    setTimeout(() => {
      onAct();
    }, 600);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.32, ease: [0.22, 0.8, 0.22, 1] }}
      style={{
        borderRadius: theme.radius,
        background: theme.card,
        border: `1px solid ${color}30`,
        borderLeft: `3px solid ${color}`,
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: theme.id === 'aurora' ? 'blur(24px)' : undefined,
        WebkitBackdropFilter: theme.id === 'aurora' ? 'blur(24px)' : undefined,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${color}08, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* XP badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.18, type: 'spring', stiffness: 400, damping: 18 }}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: `${color}22`,
          border: `1px solid ${color}40`,
          borderRadius: 8,
          padding: '2px 7px',
          fontSize: 10,
          fontFamily: theme.mono,
          fontWeight: 700,
          color,
          letterSpacing: 0.5,
        }}
      >
        +{warning.xpReward} XP
      </motion.div>

      {/* Header row — tap to expand */}
      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '13px 44px 13px 14px',
          cursor: 'pointer',
        }}
      >
        {/* Type badge */}
        <div
          style={{
            flexShrink: 0,
            marginTop: 1,
            fontSize: 8,
            fontFamily: theme.mono,
            fontWeight: 800,
            letterSpacing: 1.5,
            color,
            background: `${color}14`,
            padding: '3px 6px',
            borderRadius: 5,
          }}
        >
          {TYPE_LABEL[warning.type]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 3,
              lineHeight: 1.25,
            }}
          >
            {warning.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: theme.textDim,
              lineHeight: 1.45,
            }}
          >
            {warning.shortMessage}
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            right: 44,
            top: 15,
            color: theme.textMute,
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ›
        </motion.div>
      </motion.div>

      {/* Expanded science panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="science"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 0.8, 0.22, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 14px 14px',
                borderTop: `1px solid ${color}18`,
              }}
            >
              {/* Science block */}
              <div
                style={{
                  background: `${color}0a`,
                  border: `1px solid ${color}20`,
                  borderRadius: theme.radiusSm,
                  padding: '10px 12px',
                  marginBottom: 10,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: theme.mono,
                    color,
                    letterSpacing: 1.5,
                    fontWeight: 700,
                    marginBottom: 5,
                  }}
                >
                  THE SCIENCE
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.textDim,
                    lineHeight: 1.6,
                  }}
                >
                  {warning.science}
                </div>
              </div>

              {/* Indian foods */}
              {warning.indianFoods && warning.indianFoods.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: theme.mono,
                      color: theme.textMute,
                      letterSpacing: 1.2,
                      marginBottom: 6,
                    }}
                  >
                    EAT NOW
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {warning.indianFoods.map((food, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 10,
                          background: `${color}12`,
                          border: `1px solid ${color}25`,
                          borderRadius: 6,
                          padding: '3px 8px',
                          color: theme.textDim,
                          fontFamily: theme.mono,
                        }}
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tip */}
              {warning.tip && (
                <div
                  style={{
                    display: 'flex',
                    gap: 7,
                    alignItems: 'flex-start',
                    marginBottom: 10,
                    padding: '8px 10px',
                    background: `${color}0c`,
                    borderRadius: theme.radiusSm,
                    border: `1px solid ${color}18`,
                  }}
                >
                  <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
                  <span style={{ fontSize: 11, color: theme.textDim, lineHeight: 1.45 }}>
                    {warning.tip}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action row */}
      <div
        style={{
          display: 'flex',
          gap: 7,
          padding: '0 14px 13px',
          alignItems: 'center',
        }}
      >
        {/* Primary action */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAct}
          disabled={acting}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: theme.radiusSm,
            border: 'none',
            background: acting
              ? `${color}22`
              : `linear-gradient(135deg, ${color}, ${color}aa)`,
            color: acting ? color : '#000',
            fontSize: 11,
            fontWeight: 700,
            cursor: acting ? 'default' : 'pointer',
            fontFamily: theme.font,
            letterSpacing: 0.3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            transition: 'background 0.2s',
          }}
        >
          {acting ? (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.4, repeat: 1 }}
            >
              ✓ Done
            </motion.span>
          ) : (
            warning.action
          )}
        </motion.button>

        {/* Snooze */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onSnooze}
          style={{
            padding: '9px 11px',
            borderRadius: theme.radiusSm,
            border: `1px solid ${theme.cardBorder}`,
            background: 'transparent',
            color: theme.textMute,
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: theme.mono,
            letterSpacing: 0.5,
            whiteSpace: 'nowrap',
          }}
        >
          2h
        </motion.button>

        {/* Dismiss */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onDismiss}
          style={{
            padding: '9px 10px',
            borderRadius: theme.radiusSm,
            border: `1px solid ${theme.cardBorder}`,
            background: 'transparent',
            color: theme.textMute,
            fontSize: 13,
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Dismiss warning"
        >
          ×
        </motion.button>
      </div>

      {/* XP earned animation */}
      <AnimatePresence>
        {acting && (
          <motion.div
            key="xp-burst"
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -32, scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: theme.mono,
              color,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            +{warning.xpReward} XP
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
