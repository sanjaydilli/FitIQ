import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { LineChart } from '../components/LineChart';
import { useBodyComp } from '../hooks/useBodyComp';
import { bodyFatCategory, idealWeightRange } from '../utils/bodyComposition';

type Tab = 'measure' | 'progress';

export function BodyComp() {
  const { theme } = useTheme();
  const { user, awardXP } = useUser();
  const navigate = useNavigate();
  const { measurements, latest, addMeasurement, bmr, tdee, trend } = useBodyComp();

  const [tab, setTab] = useState<Tab>('measure');
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [neckCm, setNeckCm] = useState('');
  const [hipCm, setHipCm] = useState('');
  const [result, setResult] = useState<ReturnType<typeof addMeasurement> | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(weightKg);
    const wa = parseFloat(waistCm);
    const ne = parseFloat(neckCm);
    if (!w || !wa || !ne) return;
    const params: { weightKg: number; waistCm: number; neckCm: number; hipCm?: number } = { weightKg: w, waistCm: wa, neckCm: ne };
    if (user.sex === 'female' && hipCm) params.hipCm = parseFloat(hipCm);
    const entry = addMeasurement(params);
    awardXP(30);
    setResult(entry);
  };

  const category = latest ? bodyFatCategory(user.sex, latest.bodyFatPct) : null;
  const idealRange = idealWeightRange(user.sex, user.heightCm);

  const bfData = measurements.map(m => ({ label: m.date.slice(5), value: m.bodyFatPct }));
  const leanData = measurements.map(m => ({ label: m.date.slice(5), value: m.leanMass }));
  const weightData = measurements.map(m => ({ label: m.date.slice(5), value: m.weightKg }));

  return (
    <Background>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '14px 20px',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.cardBorder}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Body Composition</div>
      </div>

      {/* Tab bar */}
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, zIndex: 9,
        display: 'flex', gap: 0,
        background: 'rgba(10,10,10,0.9)',
        borderBottom: `1px solid ${theme.cardBorder}`,
      }}>
        {(['measure', 'progress'] as Tab[]).map(t => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: tab === t ? theme.accent : theme.textDim,
              fontSize: 13, fontWeight: tab === t ? 700 : 400,
              fontFamily: theme.mono, letterSpacing: 0.5, textTransform: 'uppercase',
              borderBottom: tab === t ? `2px solid ${theme.accent}` : '2px solid transparent',
            }}
          >
            {t}
          </motion.button>
        ))}
      </div>

      <div style={{ paddingTop: 104, paddingBottom: 32, height: '100%', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          {tab === 'measure' ? (
            <motion.div
              key="measure"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22 }}
              style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Latest summary */}
              {latest && category && (
                <Card style={{ borderRadius: 18, padding: '14px 16px', borderLeft: `3px solid ${category.color}` }}>
                  <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, marginBottom: 6, letterSpacing: 1 }}>LAST MEASUREMENT · {latest.date}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, color: category.color }}>{latest.bodyFatPct}%</div>
                      <div style={{ fontSize: 11, color: category.color, fontFamily: theme.mono }}>{category.label}</div>
                    </div>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>LEAN</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{latest.leanMass}kg</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono }}>FAT</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{latest.fatMass}kg</div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Input fields */}
              <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>New Measurement</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Weight', unit: 'kg', val: weightKg, set: setWeightKg },
                    { label: 'Waist', unit: 'cm', val: waistCm, set: setWaistCm },
                    { label: 'Neck', unit: 'cm', val: neckCm, set: setNeckCm },
                    ...(user.sex === 'female' ? [{ label: 'Hip', unit: 'cm', val: hipCm, set: setHipCm }] : []),
                  ].map(({ label, unit, val, set }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 60, fontSize: 12, color: theme.textDim }}>{label}</div>
                      <input
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        placeholder="—"
                        style={{
                          flex: 1, background: 'rgba(255,255,255,0.06)',
                          border: `1px solid ${theme.cardBorder}`, borderRadius: 10,
                          padding: '8px 12px', color: theme.text,
                          fontSize: 14, fontFamily: theme.mono, outline: 'none',
                        }}
                      />
                      <div style={{ width: 26, fontSize: 11, color: theme.textMute, fontFamily: theme.mono }}>{unit}</div>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCalculate}
                  style={{
                    width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 14, border: 'none',
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                    color: theme.onAccent, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Calculate
                </motion.button>
              </Card>

              {/* Result card */}
              <AnimatePresence>
                {result && (() => {
                  const cat = bodyFatCategory(user.sex, result.bodyFatPct);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card style={{ borderRadius: 18, padding: '14px 16px', border: `1px solid ${cat.color}40` }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: cat.color }}>Result</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          {[
                            { l: 'BODY FAT', v: `${result.bodyFatPct}%`, c: cat.color, sub: cat.label },
                            { l: 'LEAN MASS', v: `${result.leanMass}kg`, c: '#5EEAD4' },
                            { l: 'FAT MASS', v: `${result.fatMass}kg`, c: '#F87171' },
                            { l: 'BMR', v: `${bmr} kcal`, c: theme.accent },
                            { l: 'TDEE', v: `${tdee} kcal`, c: theme.accent2 },
                            { l: 'IDEAL RANGE', v: `${idealRange.low}–${idealRange.high}kg`, c: theme.textDim },
                          ].map(({ l, v, c, sub }) => (
                            <div key={l}>
                              <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1 }}>{l}</div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                              {sub && <div style={{ fontSize: 10, color: c, fontFamily: theme.mono }}>{sub}</div>}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {measurements.length < 2 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, gap: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 40 }}>📊</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Not enough data</div>
                  <div style={{ fontSize: 13, color: theme.textDim }}>Log at least 2 measurements to see trends</div>
                </div>
              ) : (
                <>
                  {/* Trend summary */}
                  {trend && (
                    <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>4-Week Trend</div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        {[
                          { l: 'Weight', v: trend.weightDelta, unit: 'kg', goodDir: -1 },
                          { l: 'Body Fat', v: trend.fatPctDelta, unit: '%', goodDir: -1 },
                          { l: 'Lean Mass', v: trend.leanDelta, unit: 'kg', goodDir: 1 },
                        ].map(({ l, v, unit, goodDir }) => {
                          const isGood = v * goodDir <= 0;
                          const col = v === 0 ? theme.textDim : isGood ? '#4ade80' : '#F87171';
                          return (
                            <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, marginBottom: 4 }}>{l.toUpperCase()}</div>
                              <div style={{ fontSize: 17, fontWeight: 700, color: col }}>
                                {v > 0 ? '+' : ''}{v}{unit}
                              </div>
                              <div style={{ fontSize: 14 }}>{v === 0 ? '→' : v * goodDir < 0 ? '↑' : '↓'}</div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Body fat chart */}
                  <Card style={{ borderRadius: 18, padding: '14px 14px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Body Fat %</div>
                    <LineChart data={bfData} color={category?.color ?? '#F87171'} height={110} unit="%" />
                  </Card>

                  {/* Lean mass chart */}
                  <Card style={{ borderRadius: 18, padding: '14px 14px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Lean Mass</div>
                    <LineChart data={leanData} color="#5EEAD4" height={110} unit="kg" />
                  </Card>

                  {/* Weight chart */}
                  <Card style={{ borderRadius: 18, padding: '14px 14px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Weight</div>
                    <LineChart data={weightData} color={theme.accent} height={110} unit="kg" />
                  </Card>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Background>
  );
}
