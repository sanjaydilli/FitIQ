import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Background } from '../components/Background';
import { Card, Pill } from '../components/Card';
import { TabBar } from '../components/TabBar';

interface Exercise {
  n: string;
  s: string;
  kg: string;
  rest: string;
  why: string;
}

const EXERCISES: Exercise[] = [
  { n: 'Barbell Bench Press', s: '4 × 8', kg: '60kg', rest: '90s', why: 'Compound lift recruits pecs, anterior delts, triceps. Heaviest first when CNS is fresh.' },
  { n: 'Incline Dumbbell Press', s: '4 × 10', kg: '22kg', rest: '75s', why: 'Targets upper chest fibres flat presses miss — fixes the under-developed look.' },
  { n: 'Cable Fly', s: '3 × 12', kg: '15kg', rest: '60s', why: 'Constant tension across stretch — better hypertrophy than free-weight flys.' },
  { n: 'Tricep Pushdown', s: '4 × 12', kg: '30kg', rest: '60s', why: 'Lateral head emphasis — this is what makes the arm look thick from the front.' },
  { n: 'Overhead Extension', s: '3 × 10', kg: '20kg', rest: '60s', why: 'Long head of triceps only fully stretches overhead. Skip this and arms plateau.' },
  { n: 'Dips (BW)', s: '3 × AMRAP', kg: '—', rest: '90s', why: 'Closer-grip variant emphasises triceps + lower chest. Good finisher.' },
];

export function Workout() {
  const { theme } = useTheme();
  const [activeIdx, setActiveIdx] = useState(2);
  const [done, setDone] = useState<Set<number>>(new Set([0, 1]));
  const [openWhy, setOpenWhy] = useState<number | null>(2);

  const totalExercises = EXERCISES.length;
  const completed = done.size;
  const pct = Math.round((completed / totalExercises) * 100);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    if (i + 1 < totalExercises) setActiveIdx(i + 1);
  };

  return (
    <Background>
      <div className="scroll-y" style={{ padding: '60px 0 110px', height: '100%', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              color: theme.accent,
              fontFamily: theme.mono,
              letterSpacing: 1.5,
              marginBottom: 4,
            }}
          >
            WEEK 3 · DAY 5
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Push Day</div>
          <div style={{ color: theme.textDim, fontSize: 13 }}>Chest, shoulders, triceps</div>
        </div>

        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <Card style={{ padding: 16, borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at top right, ${theme.accent}20, transparent 60%)`,
              }}
            />
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.textDim,
                    fontFamily: theme.mono,
                    letterSpacing: 1,
                  }}
                >
                  SESSION TIME
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    fontFeatureSettings: '"tnum"',
                    letterSpacing: -1,
                  }}
                >
                  22:14
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.textDim,
                    fontFamily: theme.mono,
                    letterSpacing: 1,
                  }}
                >
                  VOLUME
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>
                  4,860 <span style={{ fontSize: 11, color: theme.textDim }}>kg</span>
                </div>
              </div>
            </div>
            <div
              style={{
                position: 'relative',
                height: 4,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 2,
                marginBottom: 8,
              }}
            >
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6 }}
                style={{
                  position: 'absolute',
                  height: '100%',
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${theme.accent2}, ${theme.accent})`,
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: theme.textMute,
                fontFamily: theme.mono,
              }}
            >
              <span>
                {completed} / {totalExercises} EXERCISES
              </span>
              <span>~{Math.max(0, 48 - Math.round((completed / totalExercises) * 48))} MIN LEFT</span>
            </div>
          </Card>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {EXERCISES.map((e, i) => {
            const isDone = done.has(i);
            const isActive = i === activeIdx && !isDone;
            return (
              <motion.div key={i} layout>
                <Card
                  selected={isActive}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                  onClick={() => setOpenWhy(openWhy === i ? null : i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      onClick={(ev) => {
                        ev.stopPropagation();
                        toggle(i);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: isDone
                          ? theme.accent
                          : isActive
                          ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
                          : 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: theme.mono,
                        fontSize: 12,
                        fontWeight: 700,
                        color: isDone || isActive ? theme.onAccent : theme.textDim,
                      }}
                    >
                      {isDone ? '✓' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{e.n}</div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          fontSize: 11,
                          color: theme.textDim,
                          fontFamily: theme.mono,
                        }}
                      >
                        <span>{e.s}</span>
                        <span>·</span>
                        <span>{e.kg}</span>
                        <span>·</span>
                        <span>rest {e.rest}</span>
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ fontSize: 10, fontFamily: theme.mono, color: theme.accent }}>NOW</div>
                    )}
                  </div>

                  {openWhy === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: `1px solid ${theme.cardBorder}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Pill color={theme.accent2}>WHY</Pill>
                      </div>
                      <div style={{ fontSize: 12, color: theme.textDim, lineHeight: 1.5 }}>{e.why}</div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      <TabBar />
    </Background>
  );
}
