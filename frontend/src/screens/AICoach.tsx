import React, { memo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { TabBar } from '../components/TabBar';
import { Icon } from '../components/Icon';
import { useAICoach, ChatMessage } from '../hooks/useAICoach';
import { markCoachOpened } from '../hooks/useNotifications';
import { useFoodLog } from '../hooks/useFoodLog';
import { useBodyComp } from '../hooks/useBodyComp';
import { goalCalorieAdjust } from '../utils/bodyComposition';
import { WATER_SLOT_CAPACITY, WATER_DROP_ML } from '../context/UserContext';

const SUGGESTED = [
  'Is my diet balanced today?',
  'What should I eat for dinner?',
  'Why am I not losing weight?',
  'Best Indian protein sources?',
  'Can I eat biryani tonight?',
];

const TOTAL_WATER_L = (WATER_SLOT_CAPACITY.reduce((a, b) => a + b, 0) * WATER_DROP_ML) / 1000;

export function AICoach() {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const { todayTotals } = useFoodLog();
  const { tdee } = useBodyComp();
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const targetCalories = (tdee || Math.round(user.weightKg * 30)) + goalCalorieAdjust(user.goal);
  const targetProtein = Math.round(user.weightKg * 2.0);
  const eatenWaterL = (user.waterDrops.reduce((a, b) => a + b, 0) * WATER_DROP_ML) / 1000;

  const { messages, sendMessage, loading, clearHistory } = useAICoach({
    calories: todayTotals.calories,
    targetCalories,
    protein: todayTotals.protein,
    targetProtein,
    carbs: todayTotals.carbs,
    fat: todayTotals.fat,
    water: eatenWaterL,
    targetWater: TOTAL_WATER_L,
  });

  useEffect(() => { markCoachOpened(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleSend() {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const caloriesLeft = targetCalories - todayTotals.calories;
  const proteinLeft = targetProtein - todayTotals.protein;
  const waterLeft = TOTAL_WATER_L - eatenWaterL;

  // Display helpers — flip sign and label when user has gone over the target
  const calLabel    = caloriesLeft >= 0 ? 'Cal left'     : 'Cal over';
  const calValue    = `${Math.abs(caloriesLeft)}`;
  const proteinLabel = proteinLeft >= 0 ? 'Protein left' : 'Protein over';
  const proteinValue = `${Math.abs(proteinLeft)}g`;
  const waterLabel  = waterLeft >= 0 ? 'Water left' : 'Water over';
  const waterValue  = `${Math.abs(waterLeft).toFixed(1)}L`;

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div
          style={{
            padding: '52px 20px 0',
            flexShrink: 0,
            background: 'linear-gradient(to bottom, rgba(244,246,248,0.95), transparent)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              style={{ background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Icon name="chevron-left" size={16} color={theme.text} />
            </motion.button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700 }}>
                LLAMA 3.1 70B · GROQ
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginTop: 1 }}>AI Coach</div>
            </div>
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={clearHistory}
              style={{
                fontSize: 10,
                fontFamily: theme.mono,
                color: theme.textMute,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 8,
                padding: '5px 10px',
                cursor: 'pointer',
              }}
            >
              CLEAR
            </motion.div>
          </div>

          {/* Stats summary bar */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 12,
            }}
          >
            {[
              { label: calLabel,     value: calValue,     unit: 'kcal', color: '#EA580C' },
              { label: proteinLabel, value: proteinValue, unit: '',     color: theme.accent },
              { label: waterLabel,   value: waterValue,   unit: '',     color: '#60A5FA' },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}30`,
                  borderRadius: 12,
                  padding: '8px 10px',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: theme.mono, color: s.color }}>
                  {s.value}
                  {s.unit && <span style={{ fontSize: 9, marginLeft: 2 }}>{s.unit}</span>}
                </div>
                <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested questions */}
          {messages.length === 0 && (
            <div style={{ overflowX: 'auto', display: 'flex', gap: 8, paddingBottom: 4, marginBottom: 4 }}>
              {SUGGESTED.map((q, i) => (
                <motion.div
                  key={q}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { sendMessage(q); }}
                  style={{
                    flexShrink: 0,
                    padding: '7px 13px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: `${theme.accent}14`,
                    color: theme.accent,
                    border: `1px solid ${theme.accent}30`,
                    whiteSpace: 'nowrap',
                    boxShadow: `inset 0 1px 0 rgba(15,23,42,0.04)`,
                  }}
                >
                  {q}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 16px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                paddingTop: 40,
                color: theme.textMute,
              }}
            >
              {/* AI avatar */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.accent}30, ${theme.accent2}20)`,
                  border: `2px solid ${theme.accent}40`,
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  boxShadow: `0 6px 20px ${theme.accent}25, inset 0 1px 0 rgba(15,23,42,0.06)`,
                }}
              >
                🧠
              </motion.div>
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 6, letterSpacing: -0.2 }}>
                Hey {user.name}, I'm your FitIQ Coach
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>
                Ask me anything about your diet, workout, or nutrition. I know your data.
              </div>
              <div style={{ display: 'inline-block', fontSize: 10, color: theme.textMute, fontFamily: theme.mono, background: 'rgba(15,23,42,0.04)', border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: '6px 12px', marginTop: 12, letterSpacing: 0.4 }}>
                LLaMA 3.1 · IFCT 2017 · ACSM
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {/* Thinking indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
            >
              <AIAvatar />
              <div
                style={{
                  background: 'rgba(15,23,42,0.06)',
                  border: `1px solid rgba(15,23,42,0.08)`,
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: 5,
                  alignItems: 'center',
                }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: theme.accent,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div
          style={{
            flexShrink: 0,
            padding: '8px 16px 90px',
            background: 'linear-gradient(to top, rgba(244,246,248,0.97) 60%, transparent)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: inputFocused ? 'rgba(15,23,42,0.09)' : 'rgba(15,23,42,0.06)',
              border: `1px solid ${inputFocused ? theme.accent + '50' : theme.cardBorder}`,
              borderRadius: 24,
              padding: '6px 6px 6px 16px',
              boxShadow: inputFocused
                ? `0 0 0 3px ${theme.accent}18, inset 0 1px 0 rgba(15,23,42,0.04)`
                : `inset 0 1px 0 rgba(15,23,42,0.03)`,
              transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask your coach…"
              disabled={loading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: theme.text,
                fontFamily: theme.font,
                padding: '6px 0',
              }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={input.trim() && !loading ? { scale: 1.05 } : {}}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 38,
                height: 38,
                borderRadius: 18,
                border: 'none',
                background: input.trim() && !loading
                  ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
                  : 'rgba(15,23,42,0.08)',
                boxShadow: input.trim() && !loading
                  ? `0 4px 12px ${theme.accent}40, inset 0 1px 0 rgba(15,23,42,0.18)`
                  : 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
      <TabBar />
    </Background>
  );
}

const AIAvatar = memo(function AIAvatar() {
  const { theme } = useTheme();
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${theme.accent}40, ${theme.accent2}30)`,
        border: `1.5px solid ${theme.accent}50`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      🧠
    </div>
  );
});

const MessageBubble = memo(function MessageBubble({ message }: { message: ChatMessage }) {
  const { theme } = useTheme();
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      {!isUser && <AIAvatar />}

      <div
        style={{
          maxWidth: '78%',
          padding: '12px 16px',
          borderRadius: isUser
            ? '18px 18px 4px 18px'
            : '18px 18px 18px 4px',
          background: isUser
            ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
            : message.error
            ? 'rgba(220,38,38,0.12)'
            : 'rgba(15,23,42,0.07)',
          border: isUser
            ? 'none'
            : `1px solid ${message.error ? 'rgba(220,38,38,0.3)' : 'rgba(15,23,42,0.09)'}`,
          color: isUser ? '#fff' : theme.text,
          fontSize: 13,
          lineHeight: 1.6,
          fontWeight: isUser ? 600 : 400,
          boxShadow: isUser
            ? `0 4px 16px ${theme.accent}30, inset 0 1px 0 rgba(15,23,42,0.15)`
            : `inset 0 1px 0 rgba(15,23,42,0.03)`,
        }}
      >
        {message.content}
        <div
          style={{
            fontSize: 9,
            marginTop: 6,
            color: isUser ? 'rgba(255,255,255,0.55)' : theme.textMute,
            fontFamily: theme.mono,
            textAlign: isUser ? 'right' : 'left',
            letterSpacing: 0.4,
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
});
