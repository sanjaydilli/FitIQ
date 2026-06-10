import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { TabBar } from '../components/TabBar';
import { useDailyRoutine, ActivityCategory, ActivityEntry } from '../hooks/useDailyRoutine';

// ── Category config ───────────────────────────────────────────────────────────

const CAT_META: Record<ActivityCategory, { label: string; color: string }> = {
  morning:   { label: 'Morning',    color: '#D97706' },
  nutrition: { label: 'Nutrition',  color: '#EA580C' },
  workout:   { label: 'Workout',    color: '#0E9384' },
  hydration: { label: 'Hydration',  color: '#60A5FA' },
  evening:   { label: 'Evening',    color: '#7C3AED' },
  sleep:     { label: 'Sleep',      color: '#818CF8' },
};

const CATEGORY_ORDER: ActivityCategory[] = ['morning', 'workout', 'nutrition', 'hydration', 'evening', 'sleep'];

// ── Helper: format time ───────────────────────────────────────────────────────

function fmtTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, '0');
  const ampm = hour < 12 ? 'am' : 'pm';
  return `${h}:${m} ${ampm}`;
}

function fmtDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

// ── Add Activity Sheet ────────────────────────────────────────────────────────

interface AddSheetProps {
  onClose: () => void;
  onAdd: (act: { title: string; subtitle: string; icon: string; category: ActivityCategory; hour: number; minute: number; durationMins: number; xp: number }) => void;
}

const QUICK_ICONS = ['🏃', '💪', '🧘', '🚴', '🏊', '🥗', '🍵', '💊', '📖', '🎯', '🛁', '🌙'];

const AddSheet = memo(function AddSheet({ onClose, onAdd }: AddSheetProps) {
  const { theme } = useTheme();
  const [title, setTitle]     = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [icon, setIcon]       = useState('🎯');
  const [category, setCategory] = useState<ActivityCategory>('morning');
  const [hour, setHour]       = useState(8);
  const [minute, setMinute]   = useState(0);
  const [duration, setDuration] = useState(30);

  const canSave = title.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    onAdd({ title: title.trim(), subtitle: subtitle.trim(), icon, category, hour, minute, durationMins: duration, xp: Math.round(duration / 2) });
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: theme.cardHi, border: `1px solid ${theme.cardBorder}`,
    borderRadius: theme.radiusSm, padding: '11px 14px', fontSize: 14,
    color: theme.text, fontFamily: theme.font, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        background: theme.bg2 ?? theme.bg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '24px 24px 0 0',
        padding: '20px 20px 48px',
      }}
    >
      {/* Handle */}
      <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(15,23,42,0.15)', margin: '0 auto 20px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Add Activity</div>
        <motion.div whileTap={{ scale: 0.9 }} onClick={onClose}
          style={{ fontSize: 22, color: theme.textMute, cursor: 'pointer', lineHeight: 1 }}>×</motion.div>
      </div>

      {/* Icon picker */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginBottom: 8 }}>ICON</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_ICONS.map(ic => (
            <motion.div key={ic} whileTap={{ scale: 0.88 }} onClick={() => setIcon(ic)}
              style={{
                width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, cursor: 'pointer',
                background: icon === ic ? `${theme.accent}20` : theme.card,
                border: `1px solid ${icon === ic ? theme.accent : theme.cardBorder}`,
              }}
            >{ic}</motion.div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginBottom: 6 }}>ACTIVITY NAME *</div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Evening walk" style={inputStyle} />
      </div>

      {/* Subtitle */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginBottom: 6 }}>DETAILS (optional)</div>
        <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. 2km · zone 2 cardio" style={inputStyle} />
      </div>

      {/* Category */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginBottom: 8 }}>CATEGORY</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORY_ORDER.map(cat => {
            const meta = CAT_META[cat];
            const sel = category === cat;
            return (
              <motion.div key={cat} whileTap={{ scale: 0.94 }} onClick={() => setCategory(cat)}
                style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: theme.mono,
                  background: sel ? `${meta.color}20` : theme.card,
                  color: sel ? meta.color : theme.textMute,
                  border: `1px solid ${sel ? meta.color + '50' : theme.cardBorder}`,
                }}
              >{meta.label}</motion.div>
            );
          })}
        </div>
      </div>

      {/* Time + duration row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginBottom: 6 }}>TIME</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <select value={hour} onChange={e => setHour(+e.target.value)}
              style={{ ...inputStyle, flex: 1, padding: '11px 8px' }}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <select value={minute} onChange={e => setMinute(+e.target.value)}
              style={{ ...inputStyle, flex: 1, padding: '11px 8px' }}>
              {[0, 15, 30, 45].map(m => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginBottom: 6 }}>DURATION (min)</div>
          <input type="number" value={duration} onChange={e => setDuration(Math.max(1, +e.target.value))} min={1} max={300}
            style={inputStyle} />
        </div>
      </div>

      {/* Save */}
      <motion.button
        whileTap={{ scale: 0.97 }} disabled={!canSave} onClick={handleSave}
        style={{
          width: '100%', padding: '14px 0', borderRadius: theme.radius, border: 'none',
          background: canSave ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : 'rgba(15,23,42,0.08)',
          color: canSave ? theme.onAccent : theme.textMute,
          fontSize: 15, fontWeight: 800, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: theme.font,
        }}
      >Add to routine</motion.button>
    </motion.div>
  );
});

// ── Activity card ─────────────────────────────────────────────────────────────

interface ActivityCardProps {
  entry: ActivityEntry;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  isNow: boolean;
}

const ActivityCard = memo(function ActivityCard({ entry, onToggle, onDelete, isNow }: ActivityCardProps) {
  const { theme } = useTheme();
  const meta = CAT_META[entry.category];
  const [showDelete, setShowDelete] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onPointerDown() {
    if (entry.isDefault) return;
    pressTimer.current = setTimeout(() => setShowDelete(true), 600);
  }
  function onPointerUp() {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 0 }}
    >
      {/* Time column */}
      <div style={{ width: 52, flexShrink: 0, paddingTop: 16, paddingRight: 8, textAlign: 'right' }}>
        <div style={{ fontSize: 10, fontFamily: theme.mono, color: isNow ? meta.color : theme.textMute, fontWeight: isNow ? 700 : 400, letterSpacing: 0.3 }}>
          {fmtTime(entry.hour, entry.minute)}
        </div>
      </div>

      {/* Timeline dot + continuous backbone */}
      <div style={{ width: 20, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        {/* Continuous vertical line behind the dot */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, ${meta.color}38, ${meta.color}20)`,
          borderRadius: 1,
        }} />
        <div style={{ height: 16, flexShrink: 0 }} />
        <motion.div
          animate={entry.completed ? { scale: [1, 1.35, 1] } : {}}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            width: isNow ? 14 : 10, height: isNow ? 14 : 10, borderRadius: '50%', flexShrink: 0,
            background: entry.completed ? meta.color : isNow ? meta.color : `${meta.color}55`,
            border: `2px solid ${entry.completed || isNow ? meta.color : meta.color + '70'}`,
            boxShadow: (entry.completed || isNow)
              ? `0 0 10px ${meta.color}90, 0 0 0 3px ${meta.color}20`
              : `0 0 0 2px rgba(15,23,42,0.15)`,
            transition: 'all 0.3s',
            zIndex: 1,
          }}
        />
        <div style={{ flex: 1, minHeight: 24 }} />
      </div>

      {/* Card body */}
      <div style={{ flex: 1, paddingLeft: 10, paddingBottom: 12, minWidth: 0 }}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => onToggle(entry.id)}
          style={{
            padding: '12px 14px', borderRadius: theme.radiusSm,
            background: entry.completed ? `${meta.color}10` : isNow ? `${meta.color}08` : theme.card,
            border: `1px solid ${entry.completed ? meta.color + '30' : isNow ? meta.color + '30' : theme.cardBorder}`,
            boxShadow: `inset 0 1px 0 rgba(15,23,42,0.03)`,
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* Now indicator pulse */}
          {isNow && !entry.completed && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
              }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            {/* Icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `${meta.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              opacity: entry.completed ? 0.6 : 1,
            }}>
              {entry.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, marginBottom: 2,
                textDecoration: entry.completed ? 'line-through' : 'none',
                opacity: entry.completed ? 0.55 : 1,
                color: theme.text,
              }}>
                {entry.title}
              </div>
              {entry.subtitle ? (
                <div style={{ fontSize: 11, color: theme.textMute, lineHeight: 1.4 }}>{entry.subtitle}</div>
              ) : null}
              <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                <div style={{
                  fontSize: 9, fontFamily: theme.mono, color: meta.color,
                  background: `${meta.color}18`, borderRadius: 6, padding: '2px 7px',
                }}>
                  {meta.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 9, fontFamily: theme.mono, color: theme.textMute }}>
                  {entry.durationMins}m
                </div>
                <div style={{ fontSize: 9, fontFamily: theme.mono, color: theme.accent, fontWeight: 700 }}>
                  +{entry.xp} XP
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <motion.div
              whileTap={{ scale: 0.85 }}
              style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: entry.completed ? meta.color : 'rgba(15,23,42,0.03)',
                border: `2px solid ${entry.completed ? meta.color : 'rgba(15,23,42,0.18)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: entry.completed
                  ? `0 0 12px ${meta.color}60, inset 0 1px 0 rgba(15,23,42,0.2)`
                  : `inset 0 1px 0 rgba(15,23,42,0.03)`,
                transition: 'all 0.25s',
              }}
            >
              <AnimatePresence>
                {entry.completed && (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                    width="14" height="14" viewBox="0 0 12 12" fill="none"
                  >
                    <path d="M2 6.5L4.5 9L10 3.5" stroke={theme.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Delete option for custom activities */}
          <AnimatePresence>
            {showDelete && !entry.isDefault && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 10, display: 'flex', gap: 8 }}
              >
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  onClick={e => { e.stopPropagation(); onDelete?.(entry.id); }}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, textAlign: 'center',
                    background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                    fontSize: 11, color: '#DC2626', fontWeight: 700, cursor: 'pointer',
                  }}
                >Delete activity</motion.div>
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  onClick={e => { e.stopPropagation(); setShowDelete(false); }}
                  style={{
                    padding: '7px 14px', borderRadius: 8, background: theme.card, border: `1px solid ${theme.cardBorder}`,
                    fontSize: 11, color: theme.textMute, cursor: 'pointer',
                  }}
                >Cancel</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
});

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 64, accent }: { pct: number; size?: number; accent: string }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="5" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={accent} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ}` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 4px ${accent}80)` }}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle"
        fontSize="13" fontWeight="800" fill={accent}
        fontFamily="ui-monospace, monospace">
        {pct}%
      </text>
    </svg>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function DailyRoutine() {
  const { theme } = useTheme();
  const navigate  = useNavigate();
  const {
    activities, stats, viewDate, isToday,
    toggleActivity, addCustomActivity, removeCustomActivity,
    goToPrevDay, goToNextDay, goToToday,
  } = useDailyRoutine();

  const [showAdd, setShowAdd] = useState(false);

  // Current-time activity detection
  const nowMinutes = useMemo(() => {
    if (!isToday) return -1;
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }, [isToday]);

  const currentActivityId = useMemo(() => {
    if (nowMinutes < 0) return null;
    for (let i = activities.length - 1; i >= 0; i--) {
      const a = activities[i];
      if (a.hour * 60 + a.minute <= nowMinutes) return a.id;
    }
    return null;
  }, [activities, nowMinutes]);

  // Group by category in the order they appear on the timeline
  const grouped = useMemo(() => {
    const seen = new Set<ActivityCategory>();
    const groups: { category: ActivityCategory; items: ActivityEntry[] }[] = [];
    activities.forEach(a => {
      if (!seen.has(a.category)) {
        seen.add(a.category);
        groups.push({ category: a.category, items: [] });
      }
      groups.find(g => g.category === a.category)!.items.push(a);
    });
    return groups;
  }, [activities]);

  const handleAdd = useCallback((act: Parameters<typeof addCustomActivity>[0]) => {
    addCustomActivity(act);
  }, [addCustomActivity]);

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ padding: '52px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <motion.div whileTap={{ scale: 0.88 }} onClick={() => navigate(-1)}
              style={{
                cursor: 'pointer', color: theme.textDim, fontSize: 22, lineHeight: 1,
                width: 32, height: 32, borderRadius: 10,
                background: theme.card, border: `1px solid ${theme.cardBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>‹</motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700 }}>DAILY ROUTINE</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginTop: 1 }}>Schedule & Track</div>
            </div>
          </div>

          {/* ── Date navigator ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: theme.card, border: `1px solid ${theme.cardBorder}`,
            borderRadius: theme.radiusSm, padding: '12px 14px', marginBottom: 16,
            boxShadow: `inset 0 1px 0 rgba(15,23,42,0.03)`,
          }}>
            <motion.div whileTap={{ scale: 0.88 }} onClick={goToPrevDay}
              style={{ cursor: 'pointer', color: theme.textMute, fontSize: 20, lineHeight: 1, width: 28, textAlign: 'center' }}>‹</motion.div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtDate(viewDate)}</div>
              {!isToday && (
                <motion.div whileTap={{ scale: 0.94 }} onClick={goToToday}
                  style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, cursor: 'pointer', marginTop: 2 }}>
                  BACK TO TODAY
                </motion.div>
              )}
              {isToday && (
                <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, marginTop: 2 }}>TODAY</div>
              )}
            </div>
            <motion.div whileTap={{ scale: 0.88 }} onClick={goToNextDay}
              style={{
                cursor: isToday ? 'default' : 'pointer',
                color: isToday ? 'rgba(15,23,42,0.08)' : theme.textMute,
                fontSize: 20, lineHeight: 1, width: 28, textAlign: 'center',
              }}>›</motion.div>
          </div>

          {/* ── Stats summary ── */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <ProgressRing pct={stats.pct} accent={theme.accent} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                {[
                  { label: 'Completed', value: `${stats.done}/${stats.total}`, color: theme.accent },
                  { label: 'XP earned', value: `${stats.xpEarned}`, color: '#D97706' },
                  { label: 'XP total', value: `${stats.xpTotal}`, color: theme.textMute },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: theme.mono, color: s.color, letterSpacing: -0.3 }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.8, marginTop: 1 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(15,23,42,0.06)', overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${stats.pct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: 2,
                    background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 120px' }}>
          {grouped.map(({ category, items }) => {
            const meta = CAT_META[category];
            return (
              <div key={category} style={{ marginBottom: 6 }}>
                {/* Category header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                  paddingLeft: 60,
                }}>
                  <div style={{ fontSize: 9, fontFamily: theme.mono, letterSpacing: 1.5, color: meta.color, fontWeight: 700 }}>
                    {meta.label.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, height: 1, background: `${meta.color}20` }} />
                  <div style={{ fontSize: 9, fontFamily: theme.mono, color: theme.textMute }}>
                    {items.filter(i => i.completed).length}/{items.length}
                  </div>
                </div>

                <AnimatePresence>
                  {items.map(entry => (
                    <ActivityCard
                      key={entry.id}
                      entry={entry}
                      onToggle={toggleActivity}
                      onDelete={removeCustomActivity}
                      isNow={entry.id === currentActivityId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            );
          })}

          {/* All-done celebration */}
          <AnimatePresence>
            {stats.pct === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  margin: '16px 0', padding: '20px', borderRadius: theme.radius,
                  background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent2}12)`,
                  border: `1px solid ${theme.accent}30`, textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Perfect Day!</div>
                <div style={{ fontSize: 12, color: theme.textDim }}>All {stats.total} activities completed · +{stats.xpTotal} XP earned</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Floating add button ── */}
        <motion.button
          whileTap={{ scale: 0.88, rotateZ: 45 }}
          whileHover={{ scale: 1.08 }}
          onClick={() => setShowAdd(true)}
          style={{
            position: 'absolute', bottom: 98, right: 20,
            width: 50, height: 50, borderRadius: 25, border: 'none',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: theme.onAccent, fontSize: 24, fontWeight: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: `0 6px 24px ${theme.accent}40`,
            zIndex: 30,
          }}
        >+</motion.button>

        {/* ── Add activity bottom sheet ── */}
        <AnimatePresence>
          {showAdd && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowAdd(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 55 }}
              />
              <AddSheet onClose={() => setShowAdd(false)} onAdd={handleAdd} />
            </>
          )}
        </AnimatePresence>

        <TabBar />
      </div>
    </Background>
  );
}
