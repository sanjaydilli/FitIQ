// Direction B — "Graphite"
// Linear-inspired charcoal/graphite, mono accents, electric blue.
// Dense data UI, sharp 12px edges, scientific instrument feel.

const B = {
  bg: '#0A0B0D',
  bg2: '#111316',
  card: '#15171B',
  cardHi: '#1B1E24',
  border: '#22262E',
  borderHi: '#2D3138',
  text: '#E8EAED',
  textDim: '#8B92A0',
  textMute: '#5C6371',
  accent: '#5B8DEF',          // electric blue
  accent2: '#7C5BEF',          // violet pair
  good: '#3FCF8E',
  warn: '#F5A524',
  danger: '#F75555',
  font: '"Inter", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
};

function BBg({ children, scan = false }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: B.bg, color: B.text, fontFamily: B.font,
    }}>
      {/* subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} />
      {/* corner glow */}
      <div style={{
        position: 'absolute', top: -100, right: -120, width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${B.accent}20, transparent 70%)`,
        filter: 'blur(40px)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function BCard({ children, style = {}, hi = false }) {
  return (
    <div style={{
      background: hi ? B.cardHi : B.card,
      border: `1px solid ${B.border}`,
      borderRadius: 12,
      ...style,
    }}>{children}</div>
  );
}

function BTag({ children, color = B.accent }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 4,
      background: `${color}15`, color, fontSize: 10, fontWeight: 600,
      letterSpacing: 0.5, textTransform: 'uppercase',
      border: `1px solid ${color}30`, fontFamily: B.mono,
    }}>{children}</span>
  );
}

// 1. Splash
function BSplash() {
  return (
    <BBg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 18,
          background: B.card, border: `1px solid ${B.borderHi}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          position: 'relative', boxShadow: `0 0 60px ${B.accent}30`,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M4 18V6M4 6h6a4 4 0 010 8H4M14 18V6h4a3 3 0 010 6h-4" stroke={B.accent} strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1, marginBottom: 6 }}>FitIQ</div>
        <div style={{ fontFamily: B.mono, fontSize: 11, color: B.textDim, letterSpacing: 1.5, marginBottom: 4 }}>v1.0 · BUILD 2026.05</div>
        <div style={{ color: B.textDim, fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 1.5, marginTop: 16 }}>Your AI fitness coach that gets you.</div>

        <div style={{ position: 'absolute', bottom: 60, left: 30, right: 30, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1 }}>
            <span>BOOTING NEURAL ENGINE</span><span>0.84</span>
          </div>
          <div style={{ height: 2, background: B.border, borderRadius: 1 }}>
            <div style={{ width: '84%', height: '100%', background: B.accent, borderRadius: 1, boxShadow: `0 0 8px ${B.accent}` }} />
          </div>
        </div>
      </div>
    </BBg>
  );
}

// 2. Goal
function BOnboardGoal() {
  const goals = [
    { id: 'lose', t: 'Lose Fat', d: '−0.5kg/wk · 1,840 kcal', sel: false },
    { id: 'gain', t: 'Build Muscle', d: '+0.3kg/wk · 2,640 kcal', sel: true },
    { id: 'endur', t: 'Endurance', d: '5x cardio · 2,400 kcal', sel: false },
    { id: 'main', t: 'Maintain', d: 'Recomp · 2,340 kcal', sel: false },
  ];
  return (
    <BBg>
      <div style={{ padding: '70px 20px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, fontFamily: B.mono, fontSize: 11, color: B.textDim, letterSpacing: 1 }}>
          <span>01 / 03 · GOAL</span>
          <span>SKIP →</span>
        </div>
        <div style={{ height: 2, background: B.border, marginBottom: 28, borderRadius: 1 }}>
          <div style={{ width: '33%', height: '100%', background: B.accent }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginBottom: 6 }}>Define your objective</div>
        <div style={{ color: B.textDim, fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>Macros, training split and meal plans recalibrate around this single variable.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {goals.map(g => (
            <div key={g.id} style={{
              padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
              background: g.sel ? `linear-gradient(90deg, ${B.accent}15, transparent)` : B.card,
              border: g.sel ? `1px solid ${B.accent}` : `1px solid ${B.border}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                background: g.sel ? B.accent : 'transparent',
                border: g.sel ? 'none' : `1.5px solid ${B.borderHi}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {g.sel && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke="#0A0B0D" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{g.t}</div>
                <div style={{ fontSize: 11, color: B.textMute, fontFamily: B.mono }}>{g.d}</div>
              </div>
              {g.sel && <div style={{ fontFamily: B.mono, fontSize: 10, color: B.accent, letterSpacing: 1 }}>SELECTED</div>}
            </div>
          ))}
        </div>

        <button style={{
          marginTop: 16, padding: 14, borderRadius: 10, border: 'none',
          background: B.accent, color: '#0A0B0D', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          fontFamily: B.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>Continue <span style={{ fontFamily: B.mono, opacity: 0.6 }}>↵</span></button>
      </div>
    </BBg>
  );
}

// 3. Body Stats
function BOnboardStats() {
  return (
    <BBg>
      <div style={{ padding: '70px 20px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, fontFamily: B.mono, fontSize: 11, color: B.textDim, letterSpacing: 1 }}>
          <span>02 / 03 · BODY</span>
        </div>
        <div style={{ height: 2, background: B.border, marginBottom: 28, borderRadius: 1 }}>
          <div style={{ width: '66%', height: '100%', background: B.accent }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginBottom: 22 }}>Body baseline</div>

        <BCard style={{ padding: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontFamily: B.mono, color: B.textDim, letterSpacing: 1, marginBottom: 8 }}>BIOLOGICAL SEX</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Male', 'Female', 'Other'].map((s,i) => (
              <div key={s} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 600,
                background: i === 0 ? `${B.accent}20` : 'transparent',
                color: i === 0 ? B.accent : B.text,
                border: i === 0 ? `1px solid ${B.accent}` : `1px solid ${B.border}`,
              }}>{s}</div>
            ))}
          </div>
        </BCard>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <BCard style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontFamily: B.mono, color: B.textDim, letterSpacing: 1, marginBottom: 6 }}>HEIGHT</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFeatureSettings: '"tnum"', letterSpacing: -0.5 }}>178<span style={{ fontSize: 13, color: B.textMute, fontWeight: 500, marginLeft: 3 }}>cm</span></div>
          </BCard>
          <BCard style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontFamily: B.mono, color: B.textDim, letterSpacing: 1, marginBottom: 6 }}>WEIGHT</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFeatureSettings: '"tnum"', letterSpacing: -0.5 }}>74.2<span style={{ fontSize: 13, color: B.textMute, fontWeight: 500, marginLeft: 3 }}>kg</span></div>
          </BCard>
        </div>

        <BCard style={{ padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontFamily: B.mono, color: B.textDim, letterSpacing: 1 }}>AGE</div>
            <div style={{ fontSize: 11, fontFamily: B.mono, color: B.accent }}>27 yrs</div>
          </div>
          {/* age scale */}
          <div style={{ position: 'relative', height: 28, marginTop: 4 }}>
            <div style={{ position: 'absolute', top: 13, left: 0, right: 0, height: 2, background: B.border, borderRadius: 1 }}>
              <div style={{ width: '38%', height: '100%', background: B.accent }} />
            </div>
            {[18, 25, 35, 50, 65].map((a,i) => (
              <div key={a} style={{
                position: 'absolute', left: `${i * 25}%`, top: 8, transform: 'translateX(-50%)',
                width: 1, height: 12, background: B.borderHi,
              }} />
            ))}
            <div style={{ position: 'absolute', left: '38%', top: 7, width: 14, height: 14, borderRadius: 7, background: B.accent, border: `2px solid ${B.bg}`, transform: 'translateX(-7px)', boxShadow: `0 0 8px ${B.accent}` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: B.mono, fontSize: 10, color: B.textMute }}>
            <span>18</span><span>25</span><span>35</span><span>50</span><span>65+</span>
          </div>
        </BCard>

        <BCard style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontFamily: B.mono, color: B.textDim, letterSpacing: 1, marginBottom: 8 }}>ACTIVITY LEVEL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { l: 'Sedentary · desk job', sel: false },
              { l: 'Moderate · 3-4x/week', sel: true },
              { l: 'High · daily training', sel: false },
            ].map((a,i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6,
                background: a.sel ? `${B.accent}10` : 'transparent',
                border: a.sel ? `1px solid ${B.accent}` : '1px solid transparent',
                fontSize: 12,
              }}>
                <div style={{ width: 14, height: 14, borderRadius: 7, border: a.sel ? `4px solid ${B.accent}` : `1.5px solid ${B.borderHi}` }} />
                {a.l}
              </div>
            ))}
          </div>
        </BCard>

        <div style={{ flex: 1 }} />
        <button style={{
          padding: 14, borderRadius: 10, border: 'none', background: B.accent,
          color: '#0A0B0D', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Continue ↵</button>
      </div>
    </BBg>
  );
}

// 4. Diet
function BOnboardDiet() {
  const diets = [
    { id: 'veg', t: 'Vegetarian', sel: true },
    { id: 'egg', t: 'Eggetarian', sel: false },
    { id: 'nveg', t: 'Non-vegetarian', sel: false },
    { id: 'vegan', t: 'Vegan', sel: false },
    { id: 'jain', t: 'Jain', sel: false },
    { id: 'keto', t: 'Keto', sel: false },
  ];
  const allergies = [
    { l: 'Nuts', on: false },
    { l: 'Dairy', on: false },
    { l: 'Gluten', on: true },
    { l: 'Soy', on: false },
  ];
  return (
    <BBg>
      <div style={{ padding: '70px 20px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: B.mono, fontSize: 11, color: B.textDim, letterSpacing: 1, marginBottom: 18 }}>03 / 03 · DIET</div>
        <div style={{ height: 2, background: B.border, marginBottom: 28, borderRadius: 1 }}>
          <div style={{ width: '100%', height: '100%', background: B.accent }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginBottom: 6 }}>Eating preferences</div>
        <div style={{ color: B.textDim, fontSize: 13, marginBottom: 22 }}>1,247 Indian meals indexed. We'll build around what you already cook.</div>

        <div style={{ fontSize: 11, fontFamily: B.mono, color: B.textDim, letterSpacing: 1, marginBottom: 8 }}>DIET TYPE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {diets.map(d => (
            <div key={d.id} style={{
              padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: d.sel ? `${B.accent}15` : B.card,
              border: d.sel ? `1px solid ${B.accent}` : `1px solid ${B.border}`,
              color: d.sel ? B.accent : B.text,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              {d.t}
              {d.sel && <svg width="14" height="14" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke={B.accent} strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontFamily: B.mono, color: B.textDim, letterSpacing: 1, marginBottom: 8 }}>ALLERGIES & INTOLERANCES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          {allergies.map(a => (
            <div key={a.l} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: a.on ? `${B.warn}20` : B.card,
              border: a.on ? `1px solid ${B.warn}` : `1px solid ${B.border}`,
              color: a.on ? B.warn : B.text,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 11 }}>{a.on ? '✕' : '+'}</span>
              {a.l}
            </div>
          ))}
        </div>

        <BCard style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${B.accent}15`, border: `1px solid ${B.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B.accent} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: B.textDim, lineHeight: 1.4 }}>
              We'll cap protein from <span style={{ color: B.text }}>paneer/dal</span> and balance B12 from supplements.
            </div>
          </div>
        </BCard>

        <div style={{ flex: 1 }} />
        <button style={{
          padding: 14, borderRadius: 10, border: 'none', background: B.accent,
          color: '#0A0B0D', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Generate plan ↵</button>
      </div>
    </BBg>
  );
}

// 5. AI Analyzing
function BAnalyzing() {
  const lines = [
    { t: 'computeBMR()', s: 'BMR = 1,742 kcal', d: true },
    { t: 'computeTDEE(activity=moderate)', s: 'TDEE = 2,696 kcal', d: true },
    { t: 'macroSplit(goal=muscle)', s: 'P:142g · C:280g · F:78g', d: true },
    { t: 'buildSplit(days=5)', s: 'PPL × 4 wks', d: true },
    { t: 'curateMeals(cuisine=indian)', s: 'matching 1,247 meals…', d: false, a: true },
    { t: 'generateQuests()', s: '', d: false },
  ];
  return (
    <BBg>
      <div style={{ padding: '60px 20px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: B.good, boxShadow: `0 0 8px ${B.good}`, animation: 'b-blink 1s infinite' }} />
          <div style={{ fontFamily: B.mono, fontSize: 11, color: B.good, letterSpacing: 1.5 }}>NEURAL ENGINE · ONLINE</div>
        </div>
        <style>{`@keyframes b-blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>Calibrating your plan</div>
        <div style={{ color: B.textDim, fontSize: 13, marginBottom: 24 }}>Analyzing 18 variables · ~6s remaining</div>

        {/* Big readout */}
        <BCard style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1 }}>TARGET KCAL</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFeatureSettings: '"tnum"', color: B.accent, letterSpacing: -0.5 }}>2,640</div>
            </div>
            <div>
              <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1 }}>PROTEIN</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFeatureSettings: '"tnum"', letterSpacing: -0.5 }}>142<span style={{ fontSize: 13, color: B.textMute }}>g</span></div>
            </div>
            <div>
              <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1 }}>SPLIT</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>PPL × 5d</div>
            </div>
            <div>
              <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1 }}>VOLUME/WK</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>22 sets/mg</div>
            </div>
          </div>
        </BCard>

        {/* Terminal */}
        <BCard style={{ padding: 0, fontFamily: B.mono, fontSize: 12, overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${B.border}`, display: 'flex', justifyContent: 'space-between', color: B.textMute, fontSize: 10, letterSpacing: 1 }}>
            <span>FITIQ.PLAN</span><span>{'>'} 5/6 · 84%</span>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lines.map((l,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, opacity: l.d || l.a ? 1 : 0.4 }}>
                <span style={{ color: l.d ? B.good : (l.a ? B.accent : B.textMute), fontSize: 11, marginTop: 2 }}>
                  {l.d ? '✓' : (l.a ? '◐' : '○')}
                </span>
                <div style={{ flex: 1, lineHeight: 1.5 }}>
                  <span style={{ color: B.text }}>{l.t}</span>
                  {l.s && <div style={{ color: l.d ? B.good : B.textDim, fontSize: 11 }}>→ {l.s}</div>}
                </div>
              </div>
            ))}
          </div>
        </BCard>

        <div style={{ flex: 1 }} />

        {/* progress */}
        <div style={{ display: 'flex', gap: 3, marginTop: 16 }}>
          {Array.from({length: 32}).map((_,i) => (
            <div key={i} style={{ flex: 1, height: 18, background: i < 27 ? B.accent : B.border, borderRadius: 1 }} />
          ))}
        </div>
      </div>
    </BBg>
  );
}

// 6. Home Dashboard
function BHome() {
  return (
    <BBg>
      <div style={{ padding: '54px 0 100px', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '0 18px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1.5, marginBottom: 3 }}>WED · MAY 01 · 09:41</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Hello, Arjun</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <BCard style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: B.warn }}>●</span>
              <span style={{ fontFamily: B.mono, fontSize: 12, fontWeight: 700 }}>14</span>
              <span style={{ fontFamily: B.mono, fontSize: 9, color: B.textMute, letterSpacing: 1 }}>STREAK</span>
            </BCard>
          </div>
        </div>

        {/* Ring + avatar hero */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <BCard hi style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${B.accent}15, transparent 70%)` }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <RingMeter
                  value={78} size={140} stroke={8}
                  gradient={[B.accent2, B.accent]}
                  track={B.border}
                  label={<div style={{ fontSize: 32, fontWeight: 800, fontFamily: B.mono, letterSpacing: -1, fontFeatureSettings: '"tnum"' }}>78</div>}
                  sublabel={<div style={{ fontFamily: B.mono, fontSize: 9, color: B.textMute, letterSpacing: 1.5 }}>HEALTH SCORE</div>}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: B.mono, fontSize: 10, color: B.good, letterSpacing: 1, marginBottom: 4 }}>↗ +4 vs YESTERDAY</div>
                <div style={{ fontSize: 13, color: B.textDim, marginBottom: 10, lineHeight: 1.4 }}>Recovery <span style={{ color: B.good }}>good</span>. HRV up 8ms. Cleared for high intensity.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { l: 'Recovery', v: 86, c: B.good },
                    { l: 'Strain', v: 72, c: B.warn },
                    { l: 'Sleep', v: 81, c: B.accent },
                  ].map(x => (
                    <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 50, fontSize: 10, color: B.textMute, fontFamily: B.mono, letterSpacing: 0.5 }}>{x.l.toUpperCase()}</div>
                      <div style={{ flex: 1, height: 4, background: B.border, borderRadius: 2 }}>
                        <div style={{ width: `${x.v}%`, height: '100%', background: x.c, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontFamily: B.mono, fontSize: 10, color: x.c, fontWeight: 700, width: 22, textAlign: 'right' }}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BCard>
        </div>

        {/* Avatar pinned card */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <BCard style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${B.accent2}10)` }} />
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <FitAvatar stage={4} size={90} palette={{ glow: B.accent, accent: B.accent }} />
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
              <BTag color={B.accent2}>EVOLUTION · STAGE 4</BTag>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Lean Athlete</div>
              <div style={{ fontSize: 11, color: B.textDim, marginBottom: 8 }}>620 XP to Stage 5 · Hardened</div>
              <div style={{ height: 4, background: B.border, borderRadius: 2 }}>
                <div style={{ width: '68%', height: '100%', background: `linear-gradient(90deg, ${B.accent}, ${B.accent2})`, borderRadius: 2 }} />
              </div>
            </div>
          </BCard>
        </div>

        {/* Metrics 4-up */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {[
              { l: 'KCAL', v: '1,847', s: '/2,640', c: '#FB923C', pct: 70 },
              { l: 'PROT', v: '102g', s: '/142g', c: B.accent, pct: 72 },
              { l: 'WATR', v: '1.8L', s: '/3.5L', c: '#60A5FA', pct: 51 },
              { l: 'STEP', v: '7.4k', s: '/10k', c: B.good, pct: 74 },
            ].map((m,i) => (
              <BCard key={i} style={{ padding: '10px 8px' }}>
                <div style={{ fontFamily: B.mono, fontSize: 9, color: B.textMute, letterSpacing: 1, marginBottom: 4 }}>{m.l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: B.mono, fontFeatureSettings: '"tnum"', letterSpacing: -0.3 }}>{m.v}</div>
                <div style={{ fontFamily: B.mono, fontSize: 9, color: B.textMute, marginBottom: 6 }}>{m.s}</div>
                <div style={{ height: 2, background: B.border, borderRadius: 1 }}>
                  <div style={{ width: `${m.pct}%`, height: '100%', background: m.c, borderRadius: 1 }} />
                </div>
              </BCard>
            ))}
          </div>
        </div>

        {/* Smart warning */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <BCard style={{ padding: 12, borderColor: B.warn, background: `linear-gradient(90deg, ${B.warn}10, transparent)` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${B.warn}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={B.warn} strokeWidth="2.4"><path d="M12 9v4M12 17h.01M5 19h14a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0L3.3 16a2 2 0 001.7 3z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Hydration deficit detected</div>
                <div style={{ fontSize: 11, color: B.textDim, lineHeight: 1.4 }}>Protein 102g · Water 1.8L. Ratio <span style={{ color: B.warn, fontFamily: B.mono }}>17.6 ml/g</span> below kidney-safe 35 ml/g. <span style={{ color: B.accent }}>Why? →</span></div>
              </div>
            </div>
          </BCard>
        </div>

        {/* Quests */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontFamily: B.mono, color: B.textDim, letterSpacing: 1 }}>DAILY QUESTS · 2/3</div>
            <div style={{ fontSize: 11, fontFamily: B.mono, color: B.accent }}>+200/+260 XP</div>
          </div>
          <BCard style={{ overflow: 'hidden' }}>
            {[
              { t: 'Hit 3.5L water', xp: 60, done: false },
              { t: '10k steps', xp: 80, done: true },
              { t: 'Complete Push Day', xp: 120, done: true },
            ].map((q,i,a) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: i < a.length-1 ? `1px solid ${B.border}` : 'none' }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  background: q.done ? B.good : 'transparent',
                  border: q.done ? 'none' : `1.5px solid ${B.borderHi}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {q.done && <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke="#0A0B0D" strokeWidth="2.4" fill="none" strokeLinecap="round"/></svg>}
                </div>
                <div style={{ flex: 1, fontSize: 12, color: q.done ? B.textMute : B.text, textDecoration: q.done ? 'line-through' : 'none' }}>{q.t}</div>
                <div style={{ fontFamily: B.mono, fontSize: 10, color: q.done ? B.textMute : B.accent, fontWeight: 700 }}>+{q.xp}</div>
              </div>
            ))}
          </BCard>
        </div>

        <TabBar active="home" accent={B.accent} />
      </div>
    </BBg>
  );
}

// 7. Workout
function BWorkout() {
  return (
    <BBg>
      <div style={{ padding: '54px 0 100px', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textDim, letterSpacing: 1.5, marginBottom: 3 }}>WK 03 / DAY 05 · PUSH</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Chest + Triceps</div>
        </div>

        {/* Live stats */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <BCard hi style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { l: 'TIME', v: '22:14', c: B.text },
                { l: 'VOLUME', v: '4,860', s: 'kg', c: B.accent },
                { l: 'KCAL', v: '286', c: '#FB923C' },
                { l: 'HR', v: '124', s: 'bpm', c: B.danger },
              ].map((s,i) => (
                <div key={i}>
                  <div style={{ fontFamily: B.mono, fontSize: 9, color: B.textMute, letterSpacing: 1, marginBottom: 2 }}>{s.l}</div>
                  <div style={{ fontFamily: B.mono, fontSize: 18, fontWeight: 700, color: s.c, fontFeatureSettings: '"tnum"', letterSpacing: -0.3 }}>{s.v}{s.s && <span style={{ fontSize: 10, color: B.textMute, marginLeft: 2 }}>{s.s}</span>}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, height: 4, background: B.border, borderRadius: 2 }}>
              <div style={{ width: '40%', height: '100%', background: `linear-gradient(90deg, ${B.accent}, ${B.accent2})`, borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: B.mono, fontSize: 9, color: B.textMute, letterSpacing: 1 }}>
              <span>2/6 EXERCISES · 40%</span><span>~26 MIN LEFT</span>
            </div>
          </BCard>
        </div>

        {/* exercises */}
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { n: 'Barbell Bench Press', s: '4×8', kg: '60kg', why: 'Compound · primary chest', done: true },
            { n: 'Incline DB Press', s: '4×10', kg: '22kg', why: 'Upper chest emphasis', done: true },
            { n: 'Cable Fly', s: '3×12', kg: '15kg', why: 'Stretch + isolation', active: true },
            { n: 'Tricep Pushdown', s: '4×12', kg: '30kg', why: 'Long head tricep' },
            { n: 'Overhead Extension', s: '3×10', kg: '20kg', why: 'Full ROM tricep' },
            { n: 'Dips · BW', s: '3×∞', kg: '—', why: 'Bodyweight finisher' },
          ].map((e,i) => (
            <BCard key={i} hi={e.active} style={{
              padding: '10px 12px', borderColor: e.active ? B.accent : B.border,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: e.done ? B.good : (e.active ? B.accent : B.cardHi),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: B.mono, fontSize: 11, fontWeight: 700,
                  color: (e.done || e.active) ? '#0A0B0D' : B.textDim,
                }}>{e.done ? '✓' : i+1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{e.n}</div>
                  <div style={{ fontSize: 10, color: B.textMute, marginTop: 1 }}>{e.why}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <div style={{ fontFamily: B.mono, fontSize: 11, fontWeight: 700, color: B.text }}>{e.s}</div>
                  <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute }}>{e.kg}</div>
                </div>
              </div>
            </BCard>
          ))}
        </div>

        <TabBar active="workout" accent={B.accent} />
      </div>
    </BBg>
  );
}

// 8. Food Scan
function BFoodScan() {
  return (
    <BBg>
      <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0A0B0D, #161820)' }} />
        {/* food image */}
        <div style={{ position: 'absolute', top: '34%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <ImagePlaceholder width={240} height={240} radius={6} label="paneer butter masala" tone="rgba(245,165,36,0.12)" />
        </div>

        {/* scan reticle */}
        <div style={{ position: 'absolute', inset: '18% 10%', borderRadius: 8 }}>
          {[[0,0,'tl'],[1,0,'tr'],[0,1,'bl'],[1,1,'br']].map(([x,y,k]) => (
            <div key={k} style={{
              position: 'absolute',
              top: y ? 'auto' : 0, bottom: y ? 0 : 'auto',
              left: x ? 'auto' : 0, right: x ? 0 : 'auto',
              width: 20, height: 20,
              borderTop: y ? 'none' : `2px solid ${B.accent}`,
              borderBottom: y ? `2px solid ${B.accent}` : 'none',
              borderLeft: x ? 'none' : `2px solid ${B.accent}`,
              borderRight: x ? `2px solid ${B.accent}` : 'none',
            }} />
          ))}
          {/* scan line */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: B.accent, boxShadow: `0 0 12px ${B.accent}` }} />
        </div>

        {/* Header */}
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BCard style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={B.text} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </BCard>
          <BTag color={B.accent}>● SCANNING · 96% MATCH</BTag>
          <BCard style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={B.text} strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </BCard>
        </div>

        {/* Bottom panel */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 36, background: 'linear-gradient(180deg, transparent, rgba(10,11,13,0.95) 30%)' }}>
          <BCard hi style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: B.mono, fontSize: 10, color: B.accent, letterSpacing: 1.5, marginBottom: 2 }}>IDENTIFIED · 4 ITEMS</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Paneer Butter Masala + Roti</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: B.mono, fontSize: 22, fontWeight: 800, color: B.accent, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>684</div>
                <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1 }}>KCAL</div>
              </div>
            </div>

            {/* ingredient table */}
            <div style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${B.border}`, marginBottom: 12 }}>
              {[
                ['Paneer', '120g', 280, 92],
                ['Tomato gravy', '100g', 145, 88],
                ['Roti (whole wheat)', '2 pc', 184, 96],
                ['Ghee (estimated)', '1 tsp', 75, 78],
              ].map(([n,g,k,m],i,a) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '8px 10px', fontSize: 11,
                  borderBottom: i < a.length-1 ? `1px solid ${B.border}` : 'none',
                  background: i % 2 ? 'transparent' : `${B.cardHi}`,
                  fontFamily: B.mono,
                }}>
                  <div style={{ fontFamily: B.font, fontSize: 12, fontWeight: 500 }}>{n}</div>
                  <div style={{ color: B.textDim }}>{g}</div>
                  <div style={{ fontFeatureSettings: '"tnum"' }}>{k}</div>
                  <div style={{ color: B.good, textAlign: 'right' }}>{m}%</div>
                </div>
              ))}
            </div>

            {/* macro bar */}
            <div style={{ display: 'flex', height: 8, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ flex: 22, background: B.accent }} />
              <div style={{ flex: 38, background: '#FB923C' }} />
              <div style={{ flex: 40, background: B.warn }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: B.mono, fontSize: 10, color: B.textDim, marginBottom: 14 }}>
              <span>P 22g · 22%</span><span>C 38g · 38%</span><span>F 40g · 40%</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: 12, borderRadius: 8, border: `1px solid ${B.border}`, background: 'transparent', color: B.text, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Edit</button>
              <button style={{ flex: 2, padding: 12, borderRadius: 8, border: 'none', background: B.accent, color: '#0A0B0D', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Log meal ↵</button>
            </div>
          </BCard>
        </div>
      </div>
    </BBg>
  );
}

// 9. Friends
function BFriends() {
  const friends = [
    { r: 1, n: 'Riya Mehta', xp: 4820, d: '+340', stage: 6, hue: 320 },
    { r: 2, n: 'You', xp: 4210, d: '+240', stage: 4, me: true, hue: 200 },
    { r: 3, n: 'Karan Joshi', xp: 3960, d: '+180', stage: 4, hue: 150 },
    { r: 4, n: 'Aditi Rao', xp: 3540, d: '+120', stage: 3, hue: 270 },
    { r: 5, n: 'Vikram S.', xp: 2890, d: '+80', stage: 2, hue: 40 },
    { r: 6, n: 'Neha P.', xp: 2410, d: '+60', stage: 2, hue: 10 },
  ];
  return (
    <BBg>
      <div style={{ padding: '54px 0 100px', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textDim, letterSpacing: 1.5, marginBottom: 3 }}>SQUAD LEAGUE · WK 18</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Leaderboard</div>
            <BTag color={B.accent}>4 DAYS LEFT</BTag>
          </div>
        </div>

        {/* tabs */}
        <div style={{ padding: '0 18px', marginBottom: 12, display: 'flex', gap: 4 }}>
          {['Squad', 'Global', 'Office'].map((t,i) => (
            <div key={t} style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: i === 0 ? B.cardHi : 'transparent',
              border: `1px solid ${i === 0 ? B.borderHi : B.border}`,
              color: i === 0 ? B.text : B.textDim,
            }}>{t}</div>
          ))}
        </div>

        {/* You row pinned */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <BCard hi style={{ padding: 14, borderColor: B.accent, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${B.accent}10, transparent)` }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: B.mono, fontSize: 22, fontWeight: 800, color: B.accent, width: 36, fontFeatureSettings: '"tnum"' }}>#02</div>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: `hsl(200,70%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0A0B0D' }}>A</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>You</div>
                <div style={{ fontSize: 11, color: B.textDim, fontFamily: B.mono }}>610 XP behind Riya</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: B.mono, fontSize: 17, fontWeight: 800, fontFeatureSettings: '"tnum"' }}>4,210</div>
                <div style={{ fontFamily: B.mono, fontSize: 10, color: B.good }}>+240 today</div>
              </div>
            </div>
          </BCard>
        </div>

        <div style={{ padding: '0 18px' }}>
          <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1, marginBottom: 6, padding: '0 4px', display: 'flex', justifyContent: 'space-between' }}>
            <span># NAME</span><span>XP · TODAY</span>
          </div>
          <BCard style={{ overflow: 'hidden' }}>
            {friends.map((f,i,a) => (
              <div key={f.n} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderBottom: i < a.length-1 ? `1px solid ${B.border}` : 'none',
                background: f.me ? `${B.accent}08` : 'transparent',
              }}>
                <div style={{ width: 22, fontFamily: B.mono, fontSize: 12, fontWeight: 700, color: f.r === 1 ? B.warn : (f.r <= 3 ? B.accent : B.textDim) }}>{String(f.r).padStart(2,'0')}</div>
                <div style={{ width: 30, height: 30, borderRadius: 15, background: `hsl(${f.hue},70%,55%)`, color: '#0A0B0D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{f.n[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.n}</div>
                  <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute }}>STAGE {f.stage} · {['Rookie','Beginner','Intermediate','Lean','Forged','Hardened','Elite'][f.stage-1]}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: B.mono, fontSize: 12, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{f.xp.toLocaleString()}</div>
                  <div style={{ fontFamily: B.mono, fontSize: 10, color: B.good }}>{f.d}</div>
                </div>
              </div>
            ))}
          </BCard>
        </div>

        <TabBar active="friends" accent={B.accent} />
      </div>
    </BBg>
  );
}

// 10. Profile
function BProfile() {
  return (
    <BBg>
      <div style={{ padding: '54px 0 100px', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <BCard hi style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${B.accent}, ${B.accent2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 22, color: '#0A0B0D',
              }}>A</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Arjun Kapoor</div>
                <div style={{ fontFamily: B.mono, fontSize: 11, color: B.textDim }}>arjun.k · BENGALURU</div>
              </div>
              <BCard style={{ padding: '6px 10px' }}>
                <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute }}>EDIT</div>
              </BCard>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { l: 'STAGE', v: '04' },
                { l: 'TOTAL XP', v: '4.2k' },
                { l: 'STREAK', v: '14d' },
              ].map((s,i) => (
                <div key={i} style={{ background: B.bg, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontFamily: B.mono, fontSize: 9, color: B.textMute, letterSpacing: 1 }}>{s.l}</div>
                  <div style={{ fontFamily: B.mono, fontSize: 16, fontWeight: 700, color: B.accent }}>{s.v}</div>
                </div>
              ))}
            </div>
          </BCard>
        </div>

        {/* Body fat chart */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <BCard style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1 }}>BODY FAT %</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontFamily: B.mono, fontSize: 30, fontWeight: 800, fontFeatureSettings: '"tnum"', letterSpacing: -1 }}>18.4</span>
                  <span style={{ fontSize: 13, color: B.textDim }}>%</span>
                  <BTag color={B.good}>↓ 2.1 · 90D</BTag>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['1M','3M','1Y'].map((p,i) => (
                  <div key={p} style={{ padding: '4px 8px', borderRadius: 4, fontFamily: B.mono, fontSize: 10, fontWeight: 600, background: i === 1 ? B.cardHi : 'transparent', border: `1px solid ${i === 1 ? B.borderHi : B.border}`, color: i === 1 ? B.text : B.textMute }}>{p}</div>
                ))}
              </div>
            </div>
            <div style={{ height: 100, position: 'relative' }}>
              {/* gridlines */}
              {[0, 25, 50, 75, 100].map(y => (
                <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 1, background: B.border, opacity: 0.5 }} />
              ))}
              <Spark
                data={[20.5, 20.3, 20.8, 20.1, 19.6, 19.4, 19.0, 19.2, 18.8, 18.5, 18.6, 18.4]}
                width={320} height={100} color={B.accent} fill={B.accent}
              />
            </div>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontFamily: B.mono, fontSize: 9, color: B.textMute }}>
              <span>FEB '26</span><span>MAR</span><span>APR</span><span>MAY</span>
            </div>
            <div style={{ marginTop: 12, padding: 10, background: B.bg, borderRadius: 8, border: `1px solid ${B.border}` }}>
              <div style={{ fontFamily: B.mono, fontSize: 9, color: B.accent, letterSpacing: 1, marginBottom: 4 }}>WHY THIS NUMBER →</div>
              <div style={{ fontSize: 11, color: B.textDim, lineHeight: 1.5 }}>Estimated from waist (82cm), height & age via Navy method. Lean mass up 1.2kg over 90d.</div>
            </div>
          </BCard>
        </div>

        {/* Wrapped teaser */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <BCard style={{ padding: 14, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${B.accent2}25, ${B.accent}15)`, borderColor: B.accent2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: B.bg, border: `1px solid ${B.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: B.mono, fontSize: 14, fontWeight: 700, color: B.accent2 }}>3M</div>
              <div style={{ flex: 1 }}>
                <BTag color={B.accent2}>NEW · MAY 31</BTag>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Your Q1 Wrapped</div>
                <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textDim }}>−3.8KG · 47 SESSIONS · 280K STEPS</div>
              </div>
              <div style={{ color: B.text }}>›</div>
            </div>
          </BCard>
        </div>

        {/* Settings list */}
        <div style={{ padding: '0 18px' }}>
          <div style={{ fontFamily: B.mono, fontSize: 10, color: B.textMute, letterSpacing: 1, marginBottom: 6, padding: '0 4px' }}>SETTINGS</div>
          <BCard style={{ overflow: 'hidden' }}>
            {[
              { l: 'Body measurements', v: '178cm · 74.2kg' },
              { l: 'Goals', v: 'Build muscle' },
              { l: 'Diet', v: 'Vegetarian' },
              { l: 'Achievements', v: '12 / 48' },
            ].map((s,i,a) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', padding: '12px 14px',
                borderBottom: i < a.length-1 ? `1px solid ${B.border}` : 'none',
              }}>
                <div style={{ flex: 1, fontSize: 13 }}>{s.l}</div>
                <div style={{ fontFamily: B.mono, fontSize: 11, color: B.textMute, marginRight: 8 }}>{s.v}</div>
                <div style={{ color: B.textMute }}>›</div>
              </div>
            ))}
          </BCard>
        </div>

        <TabBar active="profile" accent={B.accent} />
      </div>
    </BBg>
  );
}

Object.assign(window, {
  BSplash, BOnboardGoal, BOnboardStats, BOnboardDiet, BAnalyzing,
  BHome, BWorkout, BFoodScan, BFriends, BProfile,
});
