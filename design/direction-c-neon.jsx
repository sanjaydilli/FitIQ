// Direction C — "Neon Saffron"
// Bold black canvas, acid-green primary + saffron accent (subtle Indian cue),
// oversized display type, brutalist data cards.

const C = {
  bg: '#050505',
  bg2: '#0E0E0E',
  card: '#101010',
  cardHi: '#171717',
  border: '#1F1F1F',
  text: '#F5F5F2',
  textDim: '#9B9B96',
  textMute: '#5C5C58',
  accent: '#C8FF3D',          // acid green
  accent2: '#FF8A3D',          // saffron
  hot: '#FF4D6A',
  font: '"Space Grotesk", "Inter", -apple-system, system-ui, sans-serif',
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
};

function CBg({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: C.bg, color: C.text, fontFamily: C.font,
    }}>
      <div style={{
        position: 'absolute', top: -150, left: -100, width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.accent}15, transparent 70%)`, filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, right: -100, width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.accent2}15, transparent 70%)`, filter: 'blur(60px)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function CCard({ children, style = {}, hi = false }) {
  return (
    <div style={{
      background: hi ? C.cardHi : C.card, border: `1px solid ${C.border}`, borderRadius: 16, ...style,
    }}>{children}</div>
  );
}

function CChip({ children, color = C.accent, fill = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 4,
      background: fill ? color : 'transparent',
      color: fill ? '#000' : color,
      fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
      border: `1px solid ${color}`, fontFamily: C.mono,
    }}>{children}</span>
  );
}

// 1. Splash
function CSplash() {
  return (
    <CBg>
      <div style={{ position: 'absolute', inset: 0, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Top metadata */}
        <div style={{ paddingTop: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1.5 }}>
          <div>
            <div>FITIQ</div>
            <div>v1.0.0</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>NEURAL/AI</div>
            <div style={{ color: C.accent }}>● ONLINE</div>
          </div>
        </div>

        {/* Center */}
        <div>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.accent, letterSpacing: 2, marginBottom: 12 }}>—— FOR THE INDIAN LIFTER</div>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 0.92, fontFamily: C.display }}>
            Fit<span style={{ display: 'inline-block', position: 'relative' }}>
              IQ
              <span style={{ position: 'absolute', top: -2, right: -8, width: 12, height: 12, borderRadius: 6, background: C.accent }} />
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.5, marginTop: 16, color: C.textDim, lineHeight: 1.2 }}>
            Your AI fitness coach<br/>
            <span style={{ color: C.text }}>that gets you.</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            <CChip color={C.accent} fill>SCIENCE-FIRST</CChip>
            <CChip color={C.accent2}>INDIA-NATIVE</CChip>
          </div>
          <button style={{
            width: '100%', padding: 18, borderRadius: 14, border: 'none',
            background: C.accent, color: '#000', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            fontFamily: C.font, letterSpacing: -0.2,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>Start your journey</span>
            <span style={{ fontSize: 18 }}>→</span>
          </button>
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: C.textMute }}>
            Have an account? <span style={{ color: C.text }}>Sign in</span>
          </div>
        </div>
      </div>
    </CBg>
  );
}

// 2. Goal
function COnboardGoal() {
  const goals = [
    { id: 'lose', t: 'Cut Fat', n: '01', sel: false },
    { id: 'gain', t: 'Build Muscle', n: '02', sel: true },
    { id: 'endur', t: 'Run Longer', n: '03', sel: false },
    { id: 'main', t: 'Stay Lean', n: '04', sel: false },
  ];
  return (
    <CBg>
      <div style={{ padding: '60px 20px 24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: C.mono, fontSize: 10, letterSpacing: 1.5, color: C.textMute, marginBottom: 6 }}>
          <span>STEP <span style={{ color: C.accent }}>01</span> / 03</span><span>SKIP</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          {[1,0,0].map((on,i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: on ? C.accent : C.border }} />)}
        </div>

        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.4, lineHeight: 1, fontFamily: C.display, marginBottom: 8 }}>
          What's your<br/><span style={{ color: C.accent }}>mission?</span>
        </div>
        <div style={{ color: C.textDim, fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>Pick one. We'll obsess over it for you.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {goals.map(g => (
            <div key={g.id} style={{
              padding: 18, borderRadius: 14,
              background: g.sel ? C.accent : C.card,
              border: `1px solid ${g.sel ? C.accent : C.border}`,
              color: g.sel ? '#000' : C.text,
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer',
              boxShadow: g.sel ? `0 8px 32px ${C.accent}30` : 'none',
            }}>
              <div style={{
                fontFamily: C.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1,
                color: g.sel ? '#000' : C.textMute, opacity: g.sel ? 0.7 : 1,
              }}>{g.n}</div>
              <div style={{ flex: 1, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: C.display }}>{g.t}</div>
              {g.sel
                ? <div style={{ width: 28, height: 28, borderRadius: 14, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke={C.accent} strokeWidth="2.4" fill="none" strokeLinecap="round"/></svg>
                  </div>
                : <div style={{ fontSize: 22, color: C.textMute }}>→</div>}
            </div>
          ))}
        </div>

        <button style={{
          marginTop: 16, padding: 18, borderRadius: 14, border: 'none',
          background: C.text, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px',
        }}>
          <span>Continue</span><span>→</span>
        </button>
      </div>
    </CBg>
  );
}

// 3. Body Stats
function COnboardStats() {
  return (
    <CBg>
      <div style={{ padding: '60px 20px 24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          {[1,1,0].map((on,i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: on ? C.accent : C.border }} />)}
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1.5, marginBottom: 8 }}>STEP <span style={{ color: C.accent }}>02</span> / 03 · BODY</div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1, fontFamily: C.display, marginBottom: 22 }}>
          The <span style={{ color: C.accent }}>numbers.</span>
        </div>

        {/* Big weight card */}
        <CCard hi style={{ padding: 18, marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 180, fontWeight: 800, color: C.cardHi, fontFamily: C.display, lineHeight: 0.8, letterSpacing: -8 }}>kg</div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1, marginBottom: 6 }}>WEIGHT</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2.5, fontFamily: C.display, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>74.2</span>
              <span style={{ fontSize: 18, color: C.textDim }}>kg</span>
            </div>
            {/* dial */}
            <div style={{ position: 'relative', height: 32, marginTop: 4 }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between' }}>
                {Array.from({length: 21}).map((_,i) => (
                  <div key={i} style={{
                    width: 1, height: i % 5 === 0 ? '100%' : '50%', alignSelf: 'flex-end',
                    background: i === 10 ? C.accent : (i === 8 || i === 12 ? C.textDim : C.border),
                  }} />
                ))}
              </div>
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: -2, width: 2, height: 38, background: C.accent, boxShadow: `0 0 8px ${C.accent}` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: C.mono, fontSize: 10, color: C.textMute }}>
              <span>72</span><span>74</span><span style={{ color: C.accent }}>74.2</span><span>76</span><span>78</span>
            </div>
          </div>
        </CCard>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <CCard style={{ padding: 16 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1, marginBottom: 4 }}>HEIGHT</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, fontFamily: C.display, fontFeatureSettings: '"tnum"' }}>178<span style={{ fontSize: 13, color: C.textDim, marginLeft: 4 }}>cm</span></div>
          </CCard>
          <CCard style={{ padding: 16 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1, marginBottom: 4 }}>AGE</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, fontFamily: C.display, fontFeatureSettings: '"tnum"' }}>27<span style={{ fontSize: 13, color: C.textDim, marginLeft: 4 }}>yrs</span></div>
          </CCard>
        </div>

        <CCard style={{ padding: 14 }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1, marginBottom: 8 }}>BIOLOGICAL SEX</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Male', 'Female', 'Other'].map((s,i) => (
              <div key={s} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 700,
                background: i === 0 ? C.accent : 'transparent',
                color: i === 0 ? '#000' : C.text,
                border: i === 0 ? 'none' : `1px solid ${C.border}`,
              }}>{s}</div>
            ))}
          </div>
        </CCard>

        <div style={{ flex: 1 }} />
        <button style={{
          padding: 16, borderRadius: 14, border: 'none', background: C.accent,
          color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px',
        }}>
          <span>Continue</span><span>→</span>
        </button>
      </div>
    </CBg>
  );
}

// 4. Diet
function COnboardDiet() {
  const diets = [
    { id: 'veg', t: 'Veg', s: 'No meat', sel: true },
    { id: 'egg', t: 'Eggetarian', s: 'Veg + eggs', sel: false },
    { id: 'nveg', t: 'Non-veg', s: 'All in', sel: false },
    { id: 'vegan', t: 'Vegan', s: 'Plants only', sel: false },
    { id: 'jain', t: 'Jain', s: 'No roots', sel: false },
    { id: 'keto', t: 'Keto', s: 'Low carb', sel: false },
  ];
  return (
    <CBg>
      <div style={{ padding: '60px 20px 24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          {[1,1,1].map((on,i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: on ? C.accent : C.border }} />)}
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1.5, marginBottom: 8 }}>STEP <span style={{ color: C.accent }}>03</span> / 03 · DIET</div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1, fontFamily: C.display, marginBottom: 6 }}>
          What's on the<br/><span style={{ color: C.accent2 }}>thali?</span>
        </div>
        <div style={{ color: C.textDim, fontSize: 13, marginBottom: 22 }}>Dal, paneer, biryani — we know your kitchen.</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {diets.map(d => (
            <div key={d.id} style={{
              padding: '16px 14px', borderRadius: 14, position: 'relative', overflow: 'hidden',
              background: d.sel ? C.accent : C.card,
              border: `1px solid ${d.sel ? C.accent : C.border}`,
              color: d.sel ? '#000' : C.text,
            }}>
              {d.sel && <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke={C.accent} strokeWidth="2.4" fill="none" strokeLinecap="round"/></svg>
              </div>}
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.5, fontFamily: C.display }}>{d.t}</div>
              <div style={{ fontSize: 11, opacity: d.sel ? 0.7 : 1, color: d.sel ? '#000' : C.textMute, marginTop: 2 }}>{d.s}</div>
            </div>
          ))}
        </div>

        {/* Cuisines */}
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1, marginBottom: 8 }}>FAVORITE CUISINES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {[
            { l: 'North Indian', on: true },
            { l: 'South Indian', on: true },
            { l: 'Bengali', on: false },
            { l: 'Gujarati', on: false },
            { l: 'Continental', on: false },
            { l: 'Chinese', on: true },
          ].map(c => (
            <div key={c.l} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: c.on ? C.accent2 : 'transparent',
              border: `1px solid ${c.on ? C.accent2 : C.border}`,
              color: c.on ? '#000' : C.text,
            }}>{c.on && '✓ '}{c.l}</div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <button style={{
          padding: 16, borderRadius: 14, border: 'none', background: C.accent,
          color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px',
        }}>
          <span>Build my plan</span><span>→</span>
        </button>
      </div>
    </CBg>
  );
}

// 5. Analyzing
function CAnalyzing() {
  return (
    <CBg>
      <div style={{ padding: '60px 24px 30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent, letterSpacing: 2, marginBottom: 16 }}>—— FORGING YOUR PLAN</div>

        <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.4, lineHeight: 0.95, fontFamily: C.display, marginBottom: 24 }}>
          Crunching<br/><span style={{ color: C.accent }}>1,247</span><br/>data points.
        </div>

        {/* terminal-ish */}
        <CCard hi style={{ padding: 14, fontFamily: C.mono, fontSize: 11, marginBottom: 16, lineHeight: 1.7 }}>
          <div style={{ color: C.textMute, marginBottom: 6 }}>$ fitiq build --user=arjun.k</div>
          <div style={{ color: C.accent }}>✓ BMR / TDEE calculated</div>
          <div style={{ color: C.accent }}>✓ Macros locked: 142P · 280C · 78F</div>
          <div style={{ color: C.accent }}>✓ Split: Push/Pull/Legs × 5d</div>
          <div style={{ color: C.text }}>◐ Curating veg meals... <span style={{ color: C.accent2 }}>74%</span></div>
          <div style={{ color: C.textMute }}>○ Generating quests</div>
          <div style={{ color: C.textMute }}>○ Spawning avatar</div>
        </CCard>

        {/* Big number progress */}
        <CCard style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1 }}>PROGRESS</div>
            <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5, fontFamily: C.display, color: C.accent, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>74<span style={{ fontSize: 14, color: C.textDim }}>%</span></div>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '74%', height: '100%', background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`, borderRadius: 3 }} />
          </div>
        </CCard>

        <div style={{ flex: 1 }} />

        {/* Did you know */}
        <CCard style={{ padding: 14, borderColor: C.accent2, background: `linear-gradient(135deg, ${C.accent2}15, transparent)` }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent2, letterSpacing: 1.5, marginBottom: 4 }}>—— DID YOU KNOW</div>
          <div style={{ fontSize: 14, lineHeight: 1.45, color: C.text }}>
            Indian dal-rice combos hit a <span style={{ color: C.accent }}>complete amino profile</span> — better than chicken alone for most lifters under 80kg.
          </div>
        </CCard>
      </div>
    </CBg>
  );
}

// 6. Home
function CHome() {
  return (
    <CBg>
      <div style={{ padding: '50px 0 100px', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '0 18px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1.5, marginBottom: 2 }}>WED · MAY 01</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, fontFamily: C.display }}>Yo, <span style={{ color: C.accent }}>Arjun</span></div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <CCard style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, borderColor: C.accent2 }}>
              <span style={{ fontSize: 12 }}>🔥</span>
              <span style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 800, color: C.accent2 }}>14d</span>
            </CCard>
          </div>
        </div>

        {/* Hero — score + avatar */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <CCard hi style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -30, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}25, transparent 60%)`, filter: 'blur(20px)' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1.5, marginBottom: 4 }}>HEALTH SCORE</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3.5, fontFamily: C.display, lineHeight: 0.9, fontFeatureSettings: '"tnum"', color: C.accent }}>78</span>
                  <span style={{ fontSize: 18, color: C.textDim }}>/100</span>
                </div>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.accent, marginTop: 4 }}>↗ +4 vs YESTERDAY</div>
              </div>
              <div style={{ flexShrink: 0, marginTop: -10 }}>
                <FitAvatar stage={4} size={130} palette={{ glow: C.accent, accent: C.accent }} />
              </div>
            </div>
            <div style={{ position: 'relative', marginTop: 6, paddingTop: 14, borderTop: `1px dashed ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>STAGE</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: C.display }}>04 · LEAN</div>
              </div>
              <div>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>RECOVERY</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.accent, fontFamily: C.display }}>86</div>
              </div>
              <div>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>NEAT</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: C.display }}>7.4k</div>
              </div>
            </div>
          </CCard>
        </div>

        {/* Big stat strip — Cal + Protein + Water + Steps as 2x2 chunky tiles */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { l: 'KCAL', v: '1,847', s: '/2,640', col: C.accent2, pct: 70 },
              { l: 'PROTEIN', v: '102', s: 'g /142', col: C.accent, pct: 72 },
              { l: 'WATER', v: '1.8L', s: '/3.5L', col: '#5BA8FF', pct: 51 },
              { l: 'STEPS', v: '7,420', s: '/10k', col: '#F5A524', pct: 74 },
            ].map((m,i) => (
              <CCard key={i} style={{ padding: 14, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: `${m.pct}%`, background: m.col }} />
                <div style={{ fontFamily: C.mono, fontSize: 10, color: m.col, letterSpacing: 1.2, fontWeight: 700, marginBottom: 6 }}>{m.l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -1, fontFamily: C.display, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>{m.v}</span>
                  <span style={{ fontSize: 11, color: C.textMute }}>{m.s}</span>
                </div>
              </CCard>
            ))}
          </div>
        </div>

        {/* WARNING — bold */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ padding: 14, borderRadius: 14, background: C.hot, color: '#000', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -8, right: -8, fontSize: 90, fontWeight: 800, opacity: 0.15, fontFamily: C.display, lineHeight: 1 }}>!</div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>⚠ SCIENCE ALERT</div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2, marginBottom: 6, fontFamily: C.display }}>Drink water. Now.</div>
              <div style={{ fontSize: 11, lineHeight: 1.4, opacity: 0.8 }}>
                102g protein needs <b>3.5L</b> water for safe nitrogen clearance. You're at <b>1.8L</b>.
              </div>
            </div>
          </div>
        </div>

        {/* Quests */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: C.display, letterSpacing: -0.3 }}>Daily quests</div>
            <CChip>+260 XP</CChip>
          </div>
          <CCard style={{ overflow: 'hidden' }}>
            {[
              { t: 'Hit 3.5L water', xp: 60, done: false },
              { t: '10k steps', xp: 80, done: true },
              { t: 'Push Day workout', xp: 120, done: true },
            ].map((q,i,a) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < a.length-1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: q.done ? C.accent : 'transparent',
                  border: q.done ? 'none' : `1.5px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {q.done && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke="#000" strokeWidth="2.4" fill="none" strokeLinecap="round"/></svg>}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: q.done ? C.textMute : C.text, textDecoration: q.done ? 'line-through' : 'none' }}>{q.t}</div>
                <div style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 800, color: q.done ? C.textMute : C.accent }}>+{q.xp}</div>
              </div>
            ))}
          </CCard>
        </div>

        {/* Today's workout */}
        <div style={{ padding: '0 18px' }}>
          <CCard hi style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: C.accent, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h2v16H6zM10 7h2v10h-2zM14 5h2v14h-2zM18 4h2v16h-2z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>TODAY · 17:30</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: C.display, letterSpacing: -0.3 }}>Push Day · Chest+Tri</div>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textDim }}>6 exercises · 48m · ~480 kcal</div>
            </div>
            <div style={{ fontSize: 22, color: C.accent }}>→</div>
          </CCard>
        </div>

        <TabBar active="home" accent={C.accent} />
      </div>
    </CBg>
  );
}

// 7. Workout
function CWorkout() {
  return (
    <CBg>
      <div style={{ padding: '50px 0 100px', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '0 18px', marginBottom: 14 }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent, letterSpacing: 2, marginBottom: 4 }}>—— WK 03 / DAY 05</div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1, fontFamily: C.display }}>Push <span style={{ color: C.accent }}>Day.</span></div>
        </div>

        {/* Live giant timer */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <CCard hi style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, left: -20, fontSize: 140, fontWeight: 800, color: C.cardHi, fontFamily: C.display, lineHeight: 0.9, letterSpacing: -8 }}>22</div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1.5, marginBottom: 4 }}>SESSION TIME</div>
              <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -3, fontFamily: C.display, fontFeatureSettings: '"tnum"', lineHeight: 1, color: C.accent }}>22:14</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                <div>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>VOLUME</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: C.display }}>4,860<span style={{ fontSize: 11, color: C.textDim, marginLeft: 2 }}>kg</span></div>
                </div>
                <div>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>HR</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: C.display, color: C.hot }}>124<span style={{ fontSize: 11, color: C.textDim, marginLeft: 2 }}>bpm</span></div>
                </div>
                <div>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>KCAL</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: C.display, color: C.accent2 }}>286</div>
                </div>
              </div>
            </div>
          </CCard>
        </div>

        {/* exercises */}
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { n: 'Barbell Bench', s: '4×8', kg: '60', done: true },
            { n: 'Incline DB Press', s: '4×10', kg: '22', done: true },
            { n: 'Cable Fly', s: '3×12', kg: '15', active: true, why: 'Stretch under load → 18% more growth' },
            { n: 'Tricep Pushdown', s: '4×12', kg: '30' },
            { n: 'Overhead Extension', s: '3×10', kg: '20' },
            { n: 'Dips · BW', s: '3×AMRAP', kg: '—' },
          ].map((e,i) => (
            <div key={i} style={{
              padding: 14, borderRadius: 12,
              background: e.active ? C.accent : (e.done ? C.card : C.card),
              border: `1px solid ${e.active ? C.accent : C.border}`,
              color: e.active ? '#000' : C.text,
              opacity: e.done ? 0.5 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  fontFamily: C.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, width: 22,
                  color: e.active ? '#000' : (e.done ? C.textMute : C.textDim),
                  opacity: e.active ? 0.7 : 1,
                }}>{String(i+1).padStart(2,'0')}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: C.display, letterSpacing: -0.3 }}>{e.n}</div>
                  {e.why && <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{e.why}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 14, fontWeight: 800 }}>{e.s}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 11, opacity: 0.6 }}>· {e.kg}{e.kg !== '—' && 'kg'}</div>
                </div>
                {e.done && <span style={{ color: C.accent, fontSize: 18 }}>✓</span>}
                {e.active && <span style={{ background: '#000', color: C.accent, fontFamily: C.mono, fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 4, letterSpacing: 1 }}>NOW</span>}
              </div>
            </div>
          ))}
        </div>

        <TabBar active="workout" accent={C.accent} />
      </div>
    </CBg>
  );
}

// 8. Food Scan
function CFoodScan() {
  return (
    <CBg>
      <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1a1208 0%, #050505 70%)' }} />

        {/* food shot */}
        <div style={{ position: 'absolute', top: '32%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <ImagePlaceholder width={240} height={240} radius={20} label="biryani plate" tone="rgba(255,138,61,0.15)" />
        </div>

        {/* reticle */}
        <div style={{ position: 'absolute', inset: '14% 8% 60% 8%', borderRadius: 22 }}>
          {[[0,0],[1,0],[0,1],[1,1]].map(([x,y]) => (
            <div key={`${x}${y}`} style={{
              position: 'absolute',
              top: y ? 'auto' : -1, bottom: y ? -1 : 'auto',
              left: x ? 'auto' : -1, right: x ? -1 : 'auto',
              width: 28, height: 28,
              borderTop: y ? 'none' : `3px solid ${C.accent}`,
              borderBottom: y ? `3px solid ${C.accent}` : 'none',
              borderLeft: x ? 'none' : `3px solid ${C.accent}`,
              borderRight: x ? `3px solid ${C.accent}` : 'none',
              boxShadow: `0 0 16px ${C.accent}`,
            }} />
          ))}
        </div>

        {/* Header */}
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, padding: '0 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent, letterSpacing: 1.5 }}>● AI MATCH 96%</div>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2"><circle cx="12" cy="13" r="3"/><path d="M9 4l-2 3H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2-3z"/></svg>
          </div>
        </div>

        {/* Bottom panel */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, paddingBottom: 30 }}>
          <CCard hi style={{ padding: 18, borderColor: C.accent, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 100, fontWeight: 800, color: C.cardHi, fontFamily: C.display, lineHeight: 0.8, letterSpacing: -6 }}>720</div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent, letterSpacing: 1.5, marginBottom: 4 }}>—— DETECTED · 4 ITEMS</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6, fontFamily: C.display, marginBottom: 2 }}>Chicken Biryani</div>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.textDim, marginBottom: 14 }}>Hyderabadi · Lunch portion</div>

              {/* big numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { l: 'KCAL', v: '720', c: C.accent },
                  { l: 'P', v: '38', c: C.text },
                  { l: 'C', v: '78', c: C.text },
                  { l: 'F', v: '24', c: C.text },
                ].map((m,i) => (
                  <div key={i} style={{ background: C.bg, borderRadius: 10, padding: '10px 8px', textAlign: 'left' }}>
                    <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>{m.l}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: C.display, color: m.c, fontFeatureSettings: '"tnum"', letterSpacing: -0.5 }}>{m.v}{m.l !== 'KCAL' && <span style={{ fontSize: 10, color: C.textMute }}>g</span>}</div>
                  </div>
                ))}
              </div>

              {/* breakdown rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14, fontSize: 12 }}>
                {[
                  ['Basmati rice', '180g', 320],
                  ['Chicken (mar.)', '120g', 240],
                  ['Ghee', '12g', 108],
                  ['Spices · raita', '—', 52],
                ].map(([n,g,k],i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? `1px dashed ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute }}>—</span>
                      {n}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textMute }}>{g}</span>
                      <span style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{k} kcal</span>
                    </div>
                  </div>
                ))}
              </div>

              <button style={{
                width: '100%', padding: 14, borderRadius: 12, border: 'none',
                background: C.accent, color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                fontFamily: C.font, letterSpacing: -0.2,
              }}>Log to today →</button>
            </div>
          </CCard>
        </div>
      </div>
    </CBg>
  );
}

// 9. Friends
function CFriends() {
  const friends = [
    { r: 1, n: 'Riya Mehta', xp: 4820, d: '+340', stage: 6, hue: 320 },
    { r: 2, n: 'You', xp: 4210, d: '+240', stage: 4, me: true, hue: 80 },
    { r: 3, n: 'Karan Joshi', xp: 3960, d: '+180', stage: 4, hue: 150 },
    { r: 4, n: 'Aditi Rao', xp: 3540, d: '+120', stage: 3, hue: 270 },
    { r: 5, n: 'Vikram S.', xp: 2890, d: '+80', stage: 2, hue: 30 },
  ];
  return (
    <CBg>
      <div style={{ padding: '50px 0 100px', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '0 18px', marginBottom: 14 }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent, letterSpacing: 2, marginBottom: 4 }}>—— SQUAD LEAGUE · WK 18</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.2, fontFamily: C.display, lineHeight: 1 }}>Beat your<br/><span style={{ color: C.accent }}>friends.</span></div>
            <CChip color={C.accent2} fill>4D LEFT</CChip>
          </div>
        </div>

        {/* You banner */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ padding: 16, borderRadius: 14, background: C.accent, color: '#000', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -10, top: -20, fontSize: 90, fontWeight: 800, opacity: 0.25, fontFamily: C.display, lineHeight: 1 }}>02</div>
            <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 24, background: '#000', color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>A</div>
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, opacity: 0.7 }}>RANK #2 · YOU</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: C.display, letterSpacing: -0.6 }}>4,210 XP</div>
              <div style={{ fontFamily: C.mono, fontSize: 11, opacity: 0.7 }}>610 XP behind Riya · catch up!</div>
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1, marginBottom: 8, padding: '0 4px' }}>
            <span>RANK · LIFTER</span><span>XP</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {friends.map(f => (
              <CCard key={f.n} hi={f.me} style={{
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                borderColor: f.me ? C.accent : C.border,
              }}>
                <div style={{ fontFamily: C.display, fontSize: 24, fontWeight: 700, color: f.r === 1 ? C.accent2 : (f.me ? C.accent : C.textDim), width: 32, letterSpacing: -1, lineHeight: 1 }}>
                  {String(f.r).padStart(2,'0')}
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: `hsl(${f.hue},65%,55%)`, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, fontFamily: C.display }}>{f.n[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: C.display, letterSpacing: -0.2 }}>{f.n}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute }}>S{f.stage}</span>
                    <span style={{ fontFamily: C.mono, fontSize: 10, color: C.accent }}>{f.d} TODAY</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: C.display, fontSize: 18, fontWeight: 700, fontFeatureSettings: '"tnum"', letterSpacing: -0.5 }}>{f.xp.toLocaleString()}</div>
                </div>
              </CCard>
            ))}
          </div>
        </div>

        {/* Challenge banner */}
        <div style={{ padding: '0 18px' }}>
          <CCard style={{ padding: 14, borderColor: C.accent2, background: `linear-gradient(135deg, ${C.accent2}25, transparent)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent2, letterSpacing: 1.5 }}>NEW CHALLENGE</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: C.display, letterSpacing: -0.2 }}>10k steps every day · 7d</div>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textDim }}>WIN: 500 XP + Badge</div>
              </div>
              <button style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: C.accent2, color: '#000', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Join</button>
            </div>
          </CCard>
        </div>

        <TabBar active="friends" accent={C.accent} />
      </div>
    </CBg>
  );
}

// 10. Profile
function CProfile() {
  return (
    <CBg>
      <div style={{ padding: '50px 0 100px', height: '100%', overflow: 'hidden' }}>
        {/* HERO */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <CCard hi style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.2 }}>
              <FitAvatar stage={4} size={150} palette={{ glow: C.accent, accent: C.accent }} />
            </div>
            <div style={{ position: 'relative' }}>
              <CChip>STAGE 04 · LEAN</CChip>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1, fontFamily: C.display, lineHeight: 1, marginTop: 10 }}>Arjun<br/>Kapoor</div>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.textDim, marginTop: 6 }}>BENGALURU · MEMBER SINCE JAN '26</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                {[
                  { l: 'XP', v: '4.2k' },
                  { l: 'STREAK', v: '14d' },
                  { l: 'BADGES', v: '12' },
                ].map((s,i) => (
                  <div key={i}>
                    <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMute, letterSpacing: 1 }}>{s.l}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: C.display, color: C.accent, letterSpacing: -0.6 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </CCard>
        </div>

        {/* Body fat huge */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <CCard style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1.5 }}>BODY FAT</div>
              <CChip color={C.accent}>↓ 2.1% / 90D</CChip>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, lineHeight: 1 }}>
              <span style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3.5, fontFamily: C.display, fontFeatureSettings: '"tnum"', color: C.accent }}>18.4</span>
              <span style={{ fontSize: 22, color: C.textDim }}>%</span>
            </div>
            <div style={{ marginTop: 14, height: 90 }}>
              <Spark
                data={[20.5, 20.3, 20.8, 20.1, 19.6, 19.4, 19.0, 19.2, 18.8, 18.5, 18.6, 18.4]}
                width={320} height={90} color={C.accent} fill={C.accent}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: C.mono, fontSize: 10, color: C.textMute }}>
              <span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span>
            </div>
            {/* WHY */}
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: C.bg, borderLeft: `2px solid ${C.accent2}` }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.accent2, letterSpacing: 1.5, marginBottom: 4 }}>—— WHY THIS NUMBER</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: C.textDim }}>
                Estimated via Navy method (waist <span style={{ color: C.text }}>82cm</span> · neck <span style={{ color: C.text }}>38cm</span>). ±1.5% margin. Best validated for athletic builds.
              </div>
            </div>
          </CCard>
        </div>

        {/* Wrapped */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{
            padding: 16, borderRadius: 14, position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, ${C.accent2}, ${C.hot})`, color: '#000',
          }}>
            <div style={{ position: 'absolute', right: 10, top: 10, fontSize: 60, fontWeight: 800, fontFamily: C.display, lineHeight: 0.8, opacity: 0.4 }}>3M</div>
            <div style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>—— DROPS MAY 31</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: C.display, letterSpacing: -0.6, lineHeight: 1, marginBottom: 6 }}>Your Q1<br/>Wrapped.</div>
            <div style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>−3.8KG · 47 SESSIONS · 280K STEPS</div>
          </div>
        </div>

        {/* Achievements grid */}
        <div style={{ padding: '0 18px' }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textMute, letterSpacing: 1, marginBottom: 8, padding: '0 4px' }}>RECENT BADGES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[
              { e: '💪', l: 'BEAST', on: true },
              { e: '🔥', l: '14d', on: true },
              { e: '💧', l: '3.5L', on: true },
              { e: '🏃', l: '50km', on: false },
            ].map((b,i) => (
              <CCard key={i} style={{ padding: '12px 8px', textAlign: 'center', opacity: b.on ? 1 : 0.4, borderColor: b.on ? C.accent : C.border }}>
                <div style={{ fontSize: 22, marginBottom: 2, filter: b.on ? 'none' : 'grayscale(1)' }}>{b.e}</div>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: b.on ? C.accent : C.textMute, letterSpacing: 1, fontWeight: 700 }}>{b.l}</div>
              </CCard>
            ))}
          </div>
        </div>

        <TabBar active="profile" accent={C.accent} />
      </div>
    </CBg>
  );
}

Object.assign(window, {
  CSplash, COnboardGoal, COnboardStats, COnboardDiet, CAnalyzing,
  CHome, CWorkout, CFoodScan, CFriends, CProfile,
});
