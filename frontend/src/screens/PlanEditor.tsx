import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { EXERCISE_DB, ExerciseTemplate, MuscleGroup } from '../data/exercises';
import { DayPlan, PlannedExercise } from '../services/programPlannerService';
import {
  revisePlanWithAI, estimateMinutes, makeExercise, BLANK_PLAN, weeklyVolume,
} from '../services/planEditorService';
import { useProgram } from '../hooks/useProgram';
import { useCustomPlan } from '../hooks/useCustomPlan';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MUSCLES: (MuscleGroup | 'all')[] = ['all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];

const QUICK_PROMPTS = [
  'Make it 4 days/week',
  'No barbell exercises',
  'Shorter sessions (~45 min)',
  'Add more core work',
  'Beginner friendly',
];

const VOLUME_COLORS = { low: '#D97706', optimal: '#16A34A', high: '#DC2626' } as const;
const VOLUME_LABELS = { low: 'LOW', optimal: 'GOOD', high: 'HIGH' } as const;

type Src = 'program' | 'custom';

export function PlanEditor() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const src: Src = searchParams.get('src') === 'program' ? 'program' : 'custom';

  const { user } = useUser();
  const { currentPlan, updateCurrentPlan } = useProgram();
  const { customPlan, saveCustomPlan } = useCustomPlan();

  // If asked to edit the program plan but none exists, fall back to the
  // custom plan — otherwise Save would silently persist nothing.
  const effectiveSrc: Src = src === 'program' && currentPlan ? 'program' : 'custom';

  const initial = useMemo<DayPlan[]>(() => {
    if (src === 'program' && currentPlan) return JSON.parse(JSON.stringify(currentPlan.weeklyPlan));
    if (src === 'custom' && customPlan) return JSON.parse(JSON.stringify(customPlan.weeklyPlan));
    return JSON.parse(JSON.stringify(BLANK_PLAN));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [days, setDays] = useState<DayPlan[]>(initial);
  const [dayIdx, setDayIdx] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [picker, setPicker] = useState(false);
  const [swapIdx, setSwapIdx] = useState<number | null>(null); // picker replaces this index
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all');
  const [search, setSearch] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const [undoPlan, setUndoPlan] = useState<DayPlan[] | null>(null);
  const [saved, setSaved] = useState(false);

  const day = days[dayIdx] ?? null;
  const volume = useMemo(() => weeklyVolume(days), [days]);

  const mutate = useCallback((fn: (draft: DayPlan[]) => void) => {
    setDays(prev => {
      const next: DayPlan[] = JSON.parse(JSON.stringify(prev));
      fn(next);
      // keep estimated minutes honest (pure math)
      next.forEach(d => { d.estimatedMinutes = estimateMinutes(d.exercises); });
      return next;
    });
    setDirty(true);
    setSaved(false);
  }, []);

  // ── Exercise mutations ────────────────────────────────────────────────────
  const setEx = (ei: number, patch: Partial<PlannedExercise>) =>
    mutate(d => { Object.assign(d[dayIdx].exercises[ei], patch); });
  const removeEx = (ei: number) =>
    mutate(d => { d[dayIdx].exercises.splice(ei, 1); });
  const moveEx = (ei: number, dir: -1 | 1) =>
    mutate(d => {
      const arr = d[dayIdx].exercises;
      const j = ei + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[ei], arr[j]] = [arr[j], arr[ei]];
    });
  const addEx = (tmpl: ExerciseTemplate) => {
    if (swapIdx !== null) {
      // Swap: replace exercise but keep the user's sets/reps/rest
      mutate(d => {
        const prev = d[dayIdx].exercises[swapIdx];
        d[dayIdx].exercises[swapIdx] = {
          ...makeExercise(tmpl),
          sets: prev.sets,
          repsDisplay: prev.repsDisplay,
          restSeconds: prev.restSeconds,
        };
      });
    } else {
      mutate(d => { d[dayIdx].exercises.push(makeExercise(tmpl)); });
    }
    setPicker(false);
    setSwapIdx(null);
    setSearch('');
  };

  const openSwap = (ei: number) => {
    const tmpl = EXERCISE_DB.find(e => e.id === day?.exercises[ei]?.exerciseId);
    setMuscle(tmpl?.muscleGroup ?? 'all'); // pre-filter to same muscle
    setSwapIdx(ei);
    setPicker(true);
  };

  // ── Day mutations ─────────────────────────────────────────────────────────
  const addDay = () => {
    if (days.length >= 7) return;
    const used = new Set(days.map(d => d.day));
    const nextDay = WEEKDAYS.find(w => !used.has(w)) ?? `Day ${days.length + 1}`;
    mutate(d => { d.push({ day: nextDay, focus: 'Training day', estimatedMinutes: 45, exercises: [] }); });
    setDayIdx(days.length);
  };
  const removeDay = () => {
    if (days.length <= 1) return;
    mutate(d => { d.splice(dayIdx, 1); });
    setDayIdx(i => Math.max(0, i - 1));
  };
  const duplicateDay = () => {
    if (days.length >= 7 || !day) return;
    const used = new Set(days.map(d => d.day));
    const nextDay = WEEKDAYS.find(w => !used.has(w)) ?? `Day ${days.length + 1}`;
    mutate(d => {
      const copy: DayPlan = JSON.parse(JSON.stringify(d[dayIdx]));
      copy.day = nextDay;
      d.splice(dayIdx + 1, 0, copy);
    });
    setDayIdx(dayIdx + 1);
  };

  // ── AI revision ───────────────────────────────────────────────────────────
  const askAI = async (prompt?: string) => {
    const instruction = (prompt ?? aiInput).trim();
    if (!instruction || aiBusy) return;
    setAiBusy(true);
    setAiMsg(null);
    const before: DayPlan[] = JSON.parse(JSON.stringify(days));
    try {
      const revised = await revisePlanWithAI(days, instruction, {
        sex: user.sex, weightKg: user.weightKg, goal: user.goal,
      });
      setUndoPlan(before);
      setDays(revised);
      setDayIdx(0);
      setDirty(true);
      setSaved(false);
      setAiInput('');
      setAiMsg('✓ Plan updated by AI — review and save');
    } catch {
      setAiMsg('Could not reach the AI coach. Your plan is unchanged.');
      setTimeout(() => setAiMsg(null), 5000);
    } finally {
      setAiBusy(false);
    }
  };

  const undoAI = () => {
    if (!undoPlan) return;
    setDays(undoPlan);
    setUndoPlan(null);
    setDayIdx(0);
    setDirty(true);
    setAiMsg(null);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = () => {
    const valid = days.filter(d => d.exercises.length > 0);
    if (valid.length === 0) {
      setAiMsg('Add at least one exercise before saving.');
      setTimeout(() => setAiMsg(null), 4000);
      return;
    }
    if (effectiveSrc === 'program') updateCurrentPlan(valid);
    else saveCustomPlan(customPlan?.name ?? 'My Plan', valid);
    setDays(valid);              // editor mirrors what was actually persisted
    setDayIdx(i => Math.min(i, valid.length - 1));
    setUndoPlan(null);
    setAiMsg(null);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pickerResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EXERCISE_DB.filter(e => {
      if (muscle !== 'all' && e.muscleGroup !== muscle) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [muscle, search]);

  const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none', outline: 'none',
    color: theme.text, fontFamily: theme.font,
  };

  return (
    <Background>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="scroll-y" style={{ flex: 1, overflowY: 'auto', padding: '56px 20px 130px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              style={{ background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Icon name="chevron-left" size={16} color={theme.text} />
            </motion.button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2.5 }}>
                {effectiveSrc === 'program' ? 'PROGRAM PHASE PLAN' : 'CUSTOM PLAN'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Plan Editor</div>
            </div>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={save}
              disabled={!dirty && !saved}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 800,
                background: saved ? 'rgba(22,163,74,0.14)' : dirty ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : 'rgba(15,23,42,0.06)',
                color: saved ? '#16A34A' : dirty ? theme.onAccent : theme.textMute,
                boxShadow: dirty ? `0 4px 14px ${theme.accent}35` : 'none',
              }}
            >
              {saved ? '✓ Saved' : 'Save'}
            </motion.button>
          </div>

          {/* AI instruction bar */}
          <Card style={{ padding: '10px 12px', borderRadius: 16, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="brain" size={16} color={theme.accent} />
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') askAI(); }}
                placeholder='e.g. "only 4 days", "no barbell", "easier leg day"'
                style={{ ...inputStyle, flex: 1, fontSize: 13 }}
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => askAI()}
                disabled={aiBusy || !aiInput.trim()}
                style={{
                  padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                  background: aiBusy ? 'rgba(15,23,42,0.06)' : `${theme.accent}16`,
                  color: aiBusy ? theme.textMute : theme.accent,
                }}
              >
                {aiBusy ? 'Thinking…' : 'Ask AI'}
              </motion.button>
            </div>
          </Card>

          {/* Quick AI prompts */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0 2px' }}>
            {QUICK_PROMPTS.map(p => (
              <motion.div
                key={p}
                whileTap={{ scale: 0.94 }}
                onClick={() => !aiBusy && askAI(p)}
                style={{
                  flexShrink: 0, padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
                  fontSize: 11, fontWeight: 600,
                  background: 'transparent', color: aiBusy ? theme.textMute : theme.textDim,
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                {p}
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {aiMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 11, margin: '6px 0 2px', padding: '7px 10px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: aiMsg.startsWith('✓') ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                  color: aiMsg.startsWith('✓') ? '#16A34A' : '#DC2626',
                  fontWeight: 600,
                }}
              >
                <span style={{ flex: 1 }}>{aiMsg}</span>
                {aiMsg.startsWith('✓') && undoPlan && (
                  <span
                    onClick={undoAI}
                    style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 800, flexShrink: 0 }}
                  >
                    Undo
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Day chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0 12px' }}>
            {days.map((d, i) => (
              <motion.div
                key={`${d.day}_${i}`}
                whileTap={{ scale: 0.94 }}
                onClick={() => setDayIdx(i)}
                style={{
                  flexShrink: 0, padding: '6px 13px', borderRadius: 999, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: i === dayIdx ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : theme.card,
                  color: i === dayIdx ? theme.onAccent : theme.textDim,
                  border: i === dayIdx ? 'none' : `1px solid ${theme.cardBorder}`,
                }}
              >
                {d.day.slice(0, 3)} · {d.exercises.length}
              </motion.div>
            ))}
            {days.length < 7 && (
              <motion.div
                whileTap={{ scale: 0.94 }}
                onClick={addDay}
                style={{
                  flexShrink: 0, padding: '6px 13px', borderRadius: 999, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, color: theme.accent,
                  border: `1px dashed ${theme.accent}60`,
                }}
              >
                + Day
              </motion.div>
            )}
          </div>

          {day && (
            <>
              {/* Day meta */}
              <Card style={{ padding: '12px 14px', borderRadius: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, marginBottom: 3 }}>
                      {day.day.toUpperCase()} · ~{day.estimatedMinutes} MIN
                    </div>
                    <input
                      value={day.focus}
                      onChange={e => mutate(d => { d[dayIdx].focus = e.target.value.slice(0, 60); })}
                      style={{ ...inputStyle, fontSize: 15, fontWeight: 700, width: '100%' }}
                      placeholder="Day focus (e.g. Push — Chest/Triceps)"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {days.length < 7 && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={duplicateDay}
                        style={{ background: `${theme.accent}10`, border: 'none', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: theme.accent, fontSize: 11, fontWeight: 700 }}
                      >
                        Duplicate
                      </motion.button>
                    )}
                    {days.length > 1 && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={removeDay}
                        style={{ background: 'rgba(220,38,38,0.08)', border: 'none', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: '#DC2626', fontSize: 11, fontWeight: 700 }}
                      >
                        Remove
                      </motion.button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Exercise rows */}
              {day.exercises.map((ex, ei) => (
                <Card key={`${ex.exerciseId}_${ei}`} style={{ padding: '12px 14px', borderRadius: 16, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ex.name}
                      </div>
                      <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginTop: 1 }}>
                        {EXERCISE_DB.find(e => e.id === ex.exerciseId)?.muscleGroup.toUpperCase() ?? ''} · REST {ex.restSeconds}s
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {([['↑', -1], ['↓', 1]] as const).map(([sym, dir]) => (
                        <motion.button
                          key={sym}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => moveEx(ei, dir)}
                          style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 12 }}
                        >
                          {sym}
                        </motion.button>
                      ))}
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => openSwap(ei)}
                        title="Swap exercise"
                        style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${theme.accent}40`, background: `${theme.accent}0c`, color: theme.accent, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                      >
                        ⇄
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => removeEx(ei)}
                        style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: 'rgba(220,38,38,0.08)', color: '#DC2626', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                      >
                        ×
                      </motion.button>
                    </div>
                  </div>

                  {/* Sets / reps / rest controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {/* Sets stepper */}
                    <Stepper
                      label="SETS"
                      value={ex.sets}
                      display={String(ex.sets)}
                      onDec={() => setEx(ei, { sets: Math.max(1, ex.sets - 1) })}
                      onInc={() => setEx(ei, { sets: Math.min(10, ex.sets + 1) })}
                    />
                    {/* Reps free text */}
                    <div style={{ background: 'rgba(15,23,42,0.04)', borderRadius: 10, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1, marginBottom: 2 }}>REPS</div>
                      <input
                        value={ex.repsDisplay}
                        onChange={e => setEx(ei, { repsDisplay: e.target.value.slice(0, 10) })}
                        style={{ ...inputStyle, width: '100%', textAlign: 'center', fontSize: 14, fontWeight: 800, fontFamily: theme.mono }}
                      />
                    </div>
                    {/* Rest stepper */}
                    <Stepper
                      label="REST"
                      value={ex.restSeconds}
                      display={`${ex.restSeconds}s`}
                      onDec={() => setEx(ei, { restSeconds: Math.max(15, ex.restSeconds - 15) })}
                      onInc={() => setEx(ei, { restSeconds: Math.min(300, ex.restSeconds + 15) })}
                    />
                  </div>
                </Card>
              ))}

              {/* Add exercise */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSwapIdx(null); setPicker(true); }}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 14, cursor: 'pointer',
                  border: `1.5px dashed ${theme.accent}50`, background: `${theme.accent}08`,
                  color: theme.accent, fontSize: 13, fontWeight: 800, fontFamily: theme.font,
                }}
              >
                + Add exercise
              </motion.button>

              {/* Weekly volume analysis — pure math, fractional-set method */}
              {volume.length > 0 && (
                <Card style={{ padding: '14px 16px', borderRadius: 16, marginTop: 16 }}>
                  <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.4, fontWeight: 700, marginBottom: 10 }}>
                    WEEKLY SETS PER MUSCLE · 10–20 = GROWTH ZONE
                  </div>
                  {volume.map(v => (
                    <div key={v.muscle} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                      <div style={{ width: 70, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', color: theme.textDim }}>
                        {v.muscle}
                      </div>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(15,23,42,0.06)', overflow: 'hidden' }}>
                        <motion.div
                          initial={false}
                          animate={{ width: `${Math.min(100, (v.sets / 25) * 100)}%` }}
                          transition={{ duration: 0.5 }}
                          style={{ height: '100%', borderRadius: 3, background: VOLUME_COLORS[v.status] }}
                        />
                      </div>
                      <div style={{ width: 64, textAlign: 'right', fontSize: 10, fontFamily: theme.mono, fontWeight: 800, color: VOLUME_COLORS[v.status] }}>
                        {v.sets} · {VOLUME_LABELS[v.status]}
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: 10, color: theme.textMute, lineHeight: 1.5, marginTop: 8 }}>
                    Counts direct sets fully and secondary-muscle involvement as half a set.
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Exercise picker sheet */}
        <AnimatePresence>
          {picker && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setPicker(false); setSwapIdx(null); }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 50 }}
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 51,
                  background: theme.card, borderRadius: '22px 22px 0 0',
                  border: `1px solid ${theme.cardBorder}`, borderBottom: 'none',
                  padding: '16px 16px 28px', maxHeight: '70%',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 -8px 32px rgba(16,24,40,0.18)',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
                  {swapIdx !== null
                    ? `Swap "${day?.exercises[swapIdx]?.name ?? ''}" with…`
                    : 'Add exercise'}
                </div>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search exercises…"
                  style={{
                    ...inputStyle, fontSize: 13, padding: '10px 12px', borderRadius: 12,
                    background: 'rgba(15,23,42,0.05)', marginBottom: 8, width: '100%', boxSizing: 'border-box' as const,
                  }}
                />
                <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 8, flexShrink: 0 }}>
                  {MUSCLES.map(m => (
                    <div
                      key={m}
                      onClick={() => setMuscle(m)}
                      style={{
                        flexShrink: 0, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: muscle === m ? `${theme.accent}16` : 'transparent',
                        color: muscle === m ? theme.accent : theme.textMute,
                        border: `1px solid ${muscle === m ? theme.accent + '40' : theme.cardBorder}`,
                        textTransform: 'capitalize',
                      }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {pickerResults.map(e => (
                    <div
                      key={e.id}
                      onClick={() => addEx(e)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 2px',
                        borderBottom: `1px solid ${theme.cardBorder}`, cursor: 'pointer',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{e.name}</div>
                        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
                          {e.muscleGroup} · {e.equipment} · {e.defaultSets}×{e.defaultReps}
                        </div>
                      </div>
                      <div style={{ color: theme.accent, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>+</div>
                    </div>
                  ))}
                  {pickerResults.length === 0 && (
                    <div style={{ textAlign: 'center', color: theme.textMute, fontSize: 12, padding: 24 }}>No exercises found</div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Background>
  );
}

function Stepper({ label, display, onDec, onInc }: {
  label: string; value: number; display: string; onDec: () => void; onInc: () => void;
}) {
  const { theme } = useTheme();
  return (
    <div style={{ background: 'rgba(15,23,42,0.04)', borderRadius: 10, padding: '6px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 8, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <button onClick={onDec} style={{ border: 'none', background: 'transparent', color: theme.textDim, fontSize: 15, fontWeight: 800, cursor: 'pointer', padding: '0 4px' }}>−</button>
        <span style={{ fontSize: 14, fontWeight: 800, fontFamily: theme.mono }}>{display}</span>
        <button onClick={onInc} style={{ border: 'none', background: 'transparent', color: theme.textDim, fontSize: 15, fontWeight: 800, cursor: 'pointer', padding: '0 4px' }}>+</button>
      </div>
    </div>
  );
}
