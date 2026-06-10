import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { useProgram } from '../hooks/useProgram';
import { useBodyComp } from '../hooks/useBodyComp';
import { ProgramType, PROGRAM_META, buildPhaseSpecs } from '../services/programPhaseEngine';
import { DayPlan } from '../services/programPlannerService';

const PROGRAM_TYPES: ProgramType[] = ['muscle_gain', 'body_recomp', 'fat_loss', 'strength'];

const TYPE_COLOR: Record<ProgramType, string> = {
  muscle_gain: '#0E9384',
  body_recomp: '#7C3AED',
  fat_loss:    '#EA580C',
  strength:    '#D97706',
};

const TYPE_ICON: Record<ProgramType, React.ComponentProps<typeof Icon>['name']> = {
  muscle_gain: 'muscle',
  body_recomp: 'target',
  fat_loss:    'flame',
  strength:    'barbell',
};

function PhaseBar({ phases, currentPhase, daysElapsed }: {
  phases: ReturnType<typeof buildPhaseSpecs>;
  currentPhase: ReturnType<typeof buildPhaseSpecs>[0] | null;
  daysElapsed: number;
}) {
  const { theme } = useTheme();
  const totalDays = 90;
  const pct = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

  return (
    <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, fontWeight: 700, textTransform: 'uppercase' }}>Program Progress</div>
        <div style={{ fontSize: 11, fontFamily: theme.mono, color: theme.accent, fontWeight: 700, letterSpacing: 0.3 }}>{daysElapsed}/90 days</div>
      </div>
      {/* Phase labels */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {phases.map((p, i) => {
          const isCurrent = currentPhase?.phase === p.phase;
          const isPast = currentPhase && p.phase < currentPhase.phase;
          return (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: 6, borderRadius: 3, marginBottom: 4,
                background: isCurrent
                  ? theme.accent
                  : isPast ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.08)',
              }} />
              <div style={{ fontSize: 9, color: isCurrent ? theme.text : theme.textMute, fontFamily: theme.mono, textAlign: 'center' }}>
                {isCurrent ? `PH${p.phase} ●` : `PH${p.phase}`}
              </div>
            </div>
          );
        })}
      </div>
      {/* Overall bar */}
      <div style={{ height: 3, background: 'rgba(15,23,42,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: 2 }}
        />
      </div>
    </Card>
  );
}

function TimelineCard({ projections, color }: {
  projections: ReturnType<typeof import('../services/programPhaseEngine').projectTimeline>;
  color: string;
}) {
  const { theme } = useTheme();
  if (!projections.length) return null;

  return (
    <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}>
        Timeline to Goal
      </div>
      {projections.map((proj, i) => (
        <div key={i} style={{ marginBottom: i < projections.length - 1 ? 16 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{proj.goal}</div>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono }}>
              ~{proj.monthsToGoal}mo
            </div>
          </div>
          {/* Milestone row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 6 }}>
            {[proj.currentValue, ...proj.milestones.map(m => m.value)].map((val, j) => (
              <React.Fragment key={j}>
                <div style={{ textAlign: 'center', minWidth: 40 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto 3px',
                    background: j === 0 ? 'rgba(15,23,42,0.08)' : j <= 3 ? `${color}25` : 'rgba(15,23,42,0.04)',
                    border: j === 0 ? `1.5px solid rgba(15,23,42,0.2)` : j <= 3 ? `1.5px solid ${color}60` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: 8, fontWeight: 700, fontFamily: theme.mono, color: j === 0 ? theme.textDim : color }}>
                      {val}
                    </div>
                  </div>
                  <div style={{ fontSize: 8, color: theme.textMute, fontFamily: theme.mono }}>
                    {j === 0 ? 'NOW' : `M${j}`}
                  </div>
                </div>
                {j < 3 && (
                  <div style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg, rgba(15,23,42,0.1), ${color}40)`, margin: '0 2px 12px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>
            {proj.isFromRealData ? '📊 ' : '📐 '}{proj.confidenceNote} · {proj.changePerMonth > 0 ? '+' : ''}{proj.changePerMonth}{proj.unit.includes('%') ? '%' : 'kg'}/mo
          </div>
        </div>
      ))}
    </Card>
  );
}

function WorkoutDayCard({ day }: { day: DayPlan }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={() => setOpen(o => !o)}
        style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${theme.accent}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="dumbbell" size={18} color={theme.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{day.day}</div>
          <div style={{ fontSize: 10, color: theme.textDim }}>{day.focus}</div>
        </div>
        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginRight: 4 }}>
          {day.estimatedMinutes}m
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }}>
          <Icon name="chevron-right" size={14} color={theme.textMute} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: `1px solid ${theme.cardBorder}` }}>
              {day.exercises.map((ex, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px',
                    borderBottom: i < day.exercises.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    background: `${theme.accent2}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontFamily: theme.mono, color: theme.accent2, fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{ex.name}</div>
                    <div style={{ fontSize: 10, color: theme.textMute, fontStyle: 'italic', marginBottom: 3 }}>{ex.cue}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 10, fontFamily: theme.mono, color: theme.accent, background: `${theme.accent}12`, padding: '2px 6px', borderRadius: 5 }}>
                        {ex.sets}×{ex.repsDisplay}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: theme.mono, color: theme.textMute, background: 'rgba(15,23,42,0.05)', padding: '2px 6px', borderRadius: 5 }}>
                        {ex.restSeconds}s rest
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function Program() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { latest } = useBodyComp();
  const {
    config, phases, currentPhase, currentPlan, plans,
    generating, error, timeline,
    daysElapsed, daysRemaining, programEndDate,
    startProgram, regenerateCurrent, generatePhaseN, clearProgram,
  } = useProgram();

  const [selectedType, setSelectedType] = useState<ProgramType>('muscle_gain');
  const [activeTab, setActiveTab] = useState<'plan' | 'nutrition' | 'timeline'>('plan');
  const [confirmClear, setConfirmClear] = useState(false);

  // ── Setup screen (no active program) ─────────────────────────────────────
  if (!config) {
    return (
      <Background>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          padding: '14px 20px', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
            style={{ background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Icon name="chevron-left" size={16} color={theme.text} />
          </motion.button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>3-Month Program</div>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.6 }}>AI-powered · Auto-updates monthly</div>
          </div>
        </div>

        <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
          <div style={{ padding: '18px 20px 12px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, letterSpacing: -0.2 }}>Choose your program</div>
            <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 16, lineHeight: 1.5 }}>
              AI generates a new workout plan each month, automatically adjusting your TDEE, macros, and exercise selection based on your actual body composition changes.
            </div>

            {/* No body comp warning */}
            {!latest && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', marginBottom: 14, fontSize: 12, color: '#D97706' }}>
                ⚠ Add a body comp measurement for more accurate timeline projections → Body Comp tab
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROGRAM_TYPES.map(type => {
                const meta = PROGRAM_META[type];
                const color = TYPE_COLOR[type];
                const isSelected = selectedType === type;
                return (
                  <motion.div
                    key={type}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -1 }}
                    transition={{ type: 'spring' as const, stiffness: 360, damping: 26 }}
                    onClick={() => setSelectedType(type)}
                    style={{
                      padding: '14px 16px', borderRadius: 18, cursor: 'pointer',
                      background: isSelected ? `${color}12` : theme.card,
                      border: `1.5px solid ${isSelected ? color + '60' : theme.cardBorder}`,
                      boxShadow: isSelected ? `0 6px 18px ${color}22, inset 0 1px 0 rgba(15,23,42,0.05)` : 'inset 0 1px 0 rgba(15,23,42,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                        background: isSelected ? `${color}20` : 'rgba(15,23,42,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name={TYPE_ICON[type]} size={24} color={isSelected ? color : theme.textDim} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? color : theme.text }}>{meta.label}</div>
                          {isSelected && (
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon name="check" size={11} color="#000" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 3 }}>{meta.tagline}</div>
                        <div style={{ fontSize: 10, color: theme.textMute, fontStyle: 'italic' }}>✓ {meta.idealFor}</div>
                      </div>
                    </div>

                    {/* Phase preview */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${color}20` }}
                      >
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[['Month 1', 'Accumulation'], ['Month 2', 'Intensification'], ['Month 3', 'Realization']].map(([m, v], i) => (
                            <div key={i} style={{ flex: 1, padding: '6px 8px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}20`, textAlign: 'center' }}>
                              <div style={{ fontSize: 9, fontFamily: theme.mono, color, letterSpacing: 0.5 }}>{m}</div>
                              <div style={{ fontSize: 9, color: theme.textMute }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={!generating ? { y: -1 } : {}}
              transition={{ type: 'spring' as const, stiffness: 420, damping: 26 }}
              onClick={() => startProgram(selectedType)}
              disabled={generating}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 16, border: 'none', cursor: 'pointer',
                marginTop: 22,
                background: generating ? 'rgba(15,23,42,0.08)' : `linear-gradient(135deg, ${TYPE_COLOR[selectedType]}, ${theme.accent2})`,
                color: generating ? theme.textMute : '#000',
                fontSize: 15, fontWeight: 800,
                letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: generating ? 'none' : `0 8px 24px ${TYPE_COLOR[selectedType]}38, inset 0 1px 0 rgba(15,23,42,0.2)`,
              }}
            >
              {generating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid rgba(15,23,42,0.2)`, borderTopColor: 'rgba(255,255,255,0.7)' }} />
                  Generating Phase 1…
                </>
              ) : (
                <>Start {PROGRAM_META[selectedType].label} Program</>
              )}
            </motion.button>
          </div>
        </div>
      </Background>
    );
  }

  // ── Active program view ───────────────────────────────────────────────────
  const progColor = TYPE_COLOR[config.type];
  const meta = PROGRAM_META[config.type];

  return (
    <Background>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '14px 20px', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          style={{ background: 'rgba(15,23,42,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{meta.label}</div>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.6 }}>
            Day {daysElapsed} · {daysRemaining} days left
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={regenerateCurrent}
          disabled={generating}
          style={{ padding: '6px 12px', borderRadius: 10, border: `1px solid ${progColor}40`, background: `${progColor}10`, color: progColor, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
        >
          {generating ? '…' : 'Regen'}
        </motion.button>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Phase progress */}
          <PhaseBar phases={phases} currentPhase={currentPhase} daysElapsed={daysElapsed} />

          {/* Current phase hero */}
          {currentPhase && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card style={{ borderRadius: 20, padding: '16px 16px', position: 'relative', overflow: 'hidden', borderLeft: `3px solid ${progColor}` }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 0% 50%, ${progColor}12, transparent 60%)` }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${progColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={TYPE_ICON[config.type]} size={20} color={progColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: theme.mono, color: progColor, letterSpacing: 1.8, fontWeight: 700, textTransform: 'uppercase' }}>Phase {currentPhase.phase} of 3</div>
                      <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>{currentPhase.label}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.8, textTransform: 'uppercase' }}>Ends</div>
                      <div style={{ fontSize: 12, fontFamily: theme.mono, fontWeight: 700, letterSpacing: 0.2 }}>{currentPhase.endDate.slice(5)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: theme.textDim, lineHeight: 1.5, marginBottom: 10 }}>{currentPhase.focus}</div>
                  {currentPlan?.keyFocus && (
                    <div style={{ padding: '8px 12px', borderRadius: 10, background: `${progColor}10`, border: `1px solid ${progColor}25`, fontSize: 12, color: progColor, fontWeight: 600 }}>
                      🎯 {currentPlan.keyFocus}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', fontSize: 12, color: '#DC2626' }}>
              {error}
            </div>
          )}

          {/* Generating spinner */}
          {generating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: `${progColor}08`, border: `1px solid ${progColor}20` }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${progColor}25`, borderTopColor: progColor, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: theme.textDim }}>Generating your personalised phase plan with AI…</div>
            </div>
          )}

          {/* Tabs */}
          {currentPlan && !generating && (
            <>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['plan', 'nutrition', 'timeline'] as const).map(tab => (
                  <motion.button
                    key={tab}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: theme.mono, letterSpacing: 1.2,
                      background: activeTab === tab ? progColor : 'rgba(15,23,42,0.04)',
                      color: activeTab === tab ? '#000' : theme.textMute,
                      textTransform: 'uppercase',
                      boxShadow: activeTab === tab ? `0 4px 12px ${progColor}33` : 'none',
                    }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              {/* Workout plan tab */}
              {activeTab === 'plan' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, padding: '0 2px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {currentPhase?.split.replace('_', '/')} · {currentPhase?.weeklyFrequency}x/Week · {currentPhase?.repRange[0]}-{currentPhase?.repRange[1]} Reps
                  </div>
                  {currentPlan.weeklyPlan.map((day, i) => (
                    <motion.div key={day.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <WorkoutDayCard day={day} />
                    </motion.div>
                  ))}
                  {currentPlan.trainingRationale && (
                    <div style={{ padding: '10px 14px', borderRadius: 14, background: `${progColor}08`, border: `1px solid ${progColor}18`, fontSize: 12, color: theme.textDim, lineHeight: 1.5 }}>
                      💡 {currentPlan.trainingRationale}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Nutrition tab */}
              {activeTab === 'nutrition' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.6, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}>Daily Targets — Phase {currentPhase?.phase}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { l: 'Calories', v: currentPlan.calories, unit: 'kcal', color: '#EA580C' },
                        { l: 'Protein',  v: currentPlan.protein,  unit: 'g',    color: theme.accent },
                        { l: 'Carbs',    v: currentPlan.carbs,    unit: 'g',    color: theme.accent2 },
                        { l: 'Fat',      v: currentPlan.fat,      unit: 'g',    color: '#D97706' },
                      ].map(({ l, v, unit, color }) => (
                        <div key={l} style={{ padding: '12px 14px', borderRadius: 14, background: `${color}10`, border: `1px solid ${color}25` }}>
                          <div style={{ fontSize: 9, fontFamily: theme.mono, color, letterSpacing: 1.4, fontWeight: 700 }}>{l.toUpperCase()}</div>
                          <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: -0.6, fontFamily: theme.mono, lineHeight: 1.1 }}>{v}</div>
                          <div style={{ fontSize: 9, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 0.6 }}>{unit}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  {currentPlan.nutritionNotes && (
                    <div style={{ padding: '10px 14px', borderRadius: 14, background: `${theme.accent}08`, border: `1px solid ${theme.accent}18`, fontSize: 12, color: theme.textDim, lineHeight: 1.6 }}>
                      💡 {currentPlan.nutritionNotes}
                    </div>
                  )}
                  {/* Phase comparison */}
                  {phases.length > 1 && (
                    <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginBottom: 10, letterSpacing: 1.6, fontWeight: 700, textTransform: 'uppercase' }}>Calorie Targets by Phase</div>
                      {phases.map(p => {
                        const plan = plans[`phase_${p.phase}`];
                        const isCurrent = currentPhase?.phase === p.phase;
                        return (
                          <div key={p.phase} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: p.phase < 3 ? `1px solid ${theme.cardBorder}` : 'none' }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, background: isCurrent ? `${progColor}20` : 'rgba(15,23,42,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: theme.mono, color: isCurrent ? progColor : theme.textMute, fontWeight: 700 }}>
                              {p.phase}
                            </div>
                            <div style={{ flex: 1, fontSize: 12, color: isCurrent ? theme.text : theme.textDim }}>{p.label}</div>
                            {plan ? (
                              <div style={{ fontSize: 12, fontFamily: theme.mono, fontWeight: 700, color: isCurrent ? progColor : theme.textMute }}>
                                {plan.calories} kcal
                              </div>
                            ) : (
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => generatePhaseN(p.phase as 1 | 2 | 3)}
                                disabled={generating}
                                style={{ fontSize: 10, padding: '3px 8px', borderRadius: 8, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textMute, cursor: 'pointer' }}
                              >
                                Generate
                              </motion.button>
                            )}
                          </div>
                        );
                      })}
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Timeline tab */}
              {activeTab === 'timeline' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {timeline.length > 0 ? (
                    <TimelineCard projections={timeline} color={progColor} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: theme.textMute, fontSize: 13, lineHeight: 1.6 }}>
                      Add a body composition measurement to see your personalised goal timeline.
                    </div>
                  )}
                  {/* Program start baseline */}
                  <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginBottom: 10, letterSpacing: 1.6, fontWeight: 700, textTransform: 'uppercase' }}>Program Baseline</div>
                    {[
                      { l: 'Start weight', v: `${config.startWeight}kg` },
                      { l: 'Start lean mass', v: `${config.startLeanMass}kg` },
                      { l: 'Start body fat', v: `${config.startBodyFatPct}%` },
                      { l: 'Start TDEE', v: `${config.startTDEE} kcal` },
                      { l: 'Program start', v: config.startDate },
                      { l: 'Program end', v: programEndDate ?? '—' },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${theme.cardBorder}`, fontSize: 12 }}>
                        <span style={{ color: theme.textDim }}>{l}</span>
                        <span style={{ fontFamily: theme.mono, fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {/* Generate plan button (if no plan for current phase yet) */}
          {!currentPlan && !generating && currentPhase && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={regenerateCurrent}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 16, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${progColor}, ${theme.accent2})`,
                color: '#000', fontSize: 14, fontWeight: 800,
              }}
            >
              Generate Phase {currentPhase.phase} Plan
            </motion.button>
          )}

          {/* Danger zone */}
          <div style={{ marginTop: 8 }}>
            {!confirmClear ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setConfirmClear(true)}
                style={{ width: '100%', padding: '10px 0', borderRadius: 12, border: '1px solid rgba(220,38,38,0.2)', background: 'transparent', color: '#DC2626', fontSize: 12, cursor: 'pointer' }}
              >
                Reset Program
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button whileTap={{ scale: 0.94 }} onClick={() => setConfirmClear(false)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.94 }} onClick={() => { clearProgram(); setConfirmClear(false); }}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: 'rgba(220,38,38,0.15)', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Confirm Reset
                </motion.button>
              </div>
            )}
          </div>

        </div>
      </div>
    </Background>
  );
}
