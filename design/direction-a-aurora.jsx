// Direction A — "Aurora"
// Deep indigo/violet gradients, glassmorphism cards, electric cyan accent.
// Whoop × Apple Fitness premium feel.

const A = {
  bg: '#08060F',
  bg2: '#1A0E2E',
  bg3: '#2D1654',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.6)',
  textMute: 'rgba(255,255,255,0.4)',
  accent: '#5EEAD4',          // electric cyan-mint
  accent2: '#A78BFA',         // violet
  warn: '#FBBF24',
  danger: '#F87171',
  font: '"Inter", -apple-system, system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", monospace',
};

// ─── Background ───────────────────────────────────────────────
function ABg({ children, variant = 'home' }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: A.bg, color: A.text, fontFamily: A.font,
    }}>
      {/* aurora blobs */}
      <div style={{
        position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.55), transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', top: 200, right: -120, width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(94,234,212,0.32), transparent 70%)',
        filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -60, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)',
        filter: 'blur(60px)',
      }} />
      {/* film grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function AGlass({ children, style = {}, hover = false }) {
  return (
    <div style={{
      background: A.card,
      backdropFilter: 'blur(24px) saturate(150%)',
      WebkitBackdropFilter: 'blur(24px) saturate(150%)',
      border: `1px solid ${A.cardBorder}`,
      borderRadius: 22,
      ...style,
    }}>{children}</div>
  );
}

function APill({ children, color = A.accent, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 999,
      background: `${color}20`, color, fontSize: 11, fontWeight: 600,
      letterSpacing: 0.3, textTransform: 'uppercase',
      border: `1px solid ${color}30`,
      fontFamily: A.mono,
      ...style,
    }}>{children}</span>
  );
}

// ─── 1. Splash ────────────────────────────────────────────────
function ASplash() {
  return (
    <ABg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        {/* logo mark */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            background: 'linear-gradient(135deg, #A78BFA 0%, #5EEAD4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(167,139,250,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
            position: 'relative',
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1118 0" stroke="#0a0612" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M7 12c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#0a0612" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="2" fill="#0a0612" />
            </svg>
          </div>
          <div style={{
            position: 'absolute', inset: -16, borderRadius: 36,
            border: '1px solid rgba(94,234,212,0.3)',
            animation: 'aurora-pulse 2s ease-in-out infinite',
          }} />
          <style>{`@keyframes aurora-pulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}`}</style>
        </div>

        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.2, marginBottom: 10 }}>
          Fit<span style={{ color: A.accent }}>IQ</span>
        </div>
        <div style={{ color: A.textDim, fontSize: 15, textAlign: 'center', maxWidth: 280, lineHeight: 1.5, marginBottom: 8 }}>
          Your AI fitness coach<br/>that gets you.
        </div>
        <div style={{ marginTop: 60, display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: 3,
              background: i === 0 ? A.accent : 'rgba(255,255,255,0.2)',
            }} />
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: A.textMute, fontFamily: A.mono, letterSpacing: 1 }}>
          INITIALIZING NEURAL ENGINE
        </div>
      </div>
    </ABg>
  );
}

// ─── 2. Onboarding · Goal ─────────────────────────────────────
function AOnboardGoal() {
  const goals = [
    { id: 'lose', t: 'Lose Fat', s: 'Cut down, stay strong', icon: '🔥', sel: false },
    { id: 'gain', t: 'Build Muscle', s: 'Lean mass, recomp', icon: '💪', sel: true },
    { id: 'endur', t: 'Endurance', s: 'Cardio, stamina', icon: '🏃', sel: false },
    { id: 'main', t: 'Stay Healthy', s: 'General wellness', icon: '✨', sel: false },
  ];
  return (
    <ABg>
      <div style={{ padding: '70px 24px 30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {[1,1,0,0].map((on,i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: on ? A.accent : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, letterSpacing: 1.5, marginBottom: 8 }}>STEP 01 / 03</div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15, marginBottom: 8 }}>
          What's your<br/>primary goal?
        </div>
        <div style={{ color: A.textDim, fontSize: 14, marginBottom: 28 }}>
          We'll calibrate every workout, meal and macro around this.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {goals.map(g => (
            <AGlass key={g.id} style={{
              padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
              border: g.sel ? `1.5px solid ${A.accent}` : `1px solid ${A.cardBorder}`,
              background: g.sel ? 'rgba(94,234,212,0.08)' : A.card,
              borderRadius: 18,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: g.sel ? `linear-gradient(135deg, ${A.accent}, ${A.accent2})` : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{g.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{g.t}</div>
                <div style={{ color: A.textDim, fontSize: 12 }}>{g.s}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                border: g.sel ? `2px solid ${A.accent}` : '1.5px solid rgba(255,255,255,0.2)',
                background: g.sel ? A.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {g.sel && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3.5" stroke="#0a0612" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </AGlass>
          ))}
        </div>

        <button style={{
          marginTop: 16, padding: '16px', borderRadius: 16, border: 'none',
          background: `linear-gradient(135deg, ${A.accent}, ${A.accent2})`,
          color: '#0a0612', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          boxShadow: `0 12px 32px ${A.accent}30`,
        }}>Continue →</button>
      </div>
    </ABg>
  );
}

// ─── 3. Onboarding · Body Stats ───────────────────────────────
function AOnboardStats() {
  return (
    <ABg>
      <div style={{ padding: '70px 24px 30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {[1,1,1,0].map((on,i) => (<div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: on ? A.accent : 'rgba(255,255,255,0.1)' }} />))}
        </div>
        <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, letterSpacing: 1.5, marginBottom: 8 }}>STEP 02 / 03</div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15, marginBottom: 28 }}>
          Tell us about<br/>your body
        </div>

        {/* Sex toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[{l:'Male',sel:true},{l:'Female',sel:false}].map(o => (
            <AGlass key={o.l} style={{
              flex: 1, padding: '14px', textAlign: 'center', borderRadius: 14,
              border: o.sel ? `1.5px solid ${A.accent}` : `1px solid ${A.cardBorder}`,
              background: o.sel ? 'rgba(94,234,212,0.08)' : A.card,
              fontSize: 14, fontWeight: 600,
            }}>{o.l}</AGlass>
          ))}
        </div>

        {/* Height */}
        <AGlass style={{ padding: 18, marginBottom: 12, borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: A.textDim, fontFamily: A.mono, letterSpacing: 1 }}>HEIGHT</span>
            <span style={{ fontFamily: A.mono, fontSize: 11, color: A.textMute }}>cm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, fontFeatureSettings: '"tnum"' }}>178</span>
            <span style={{ color: A.textDim, fontSize: 14 }}>cm</span>
          </div>
          <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{ position: 'absolute', left: 0, width: '62%', height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${A.accent2}, ${A.accent})` }} />
            <div style={{ position: 'absolute', left: '62%', top: -6, width: 16, height: 16, borderRadius: 8, background: '#fff', boxShadow: `0 0 0 4px ${A.accent}30, 0 4px 8px rgba(0,0,0,0.4)`, transform: 'translateX(-8px)' }} />
          </div>
        </AGlass>

        {/* Weight */}
        <AGlass style={{ padding: 18, marginBottom: 12, borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: A.textDim, fontFamily: A.mono, letterSpacing: 1 }}>WEIGHT</span>
            <span style={{ fontFamily: A.mono, fontSize: 11, color: A.textMute }}>kg</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, fontFeatureSettings: '"tnum"' }}>74.2</span>
            <span style={{ color: A.textDim, fontSize: 14 }}>kg</span>
          </div>
          <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{ position: 'absolute', left: 0, width: '48%', height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${A.accent2}, ${A.accent})` }} />
            <div style={{ position: 'absolute', left: '48%', top: -6, width: 16, height: 16, borderRadius: 8, background: '#fff', boxShadow: `0 0 0 4px ${A.accent}30, 0 4px 8px rgba(0,0,0,0.4)`, transform: 'translateX(-8px)' }} />
          </div>
        </AGlass>

        {/* Age */}
        <AGlass style={{ padding: 18, marginBottom: 12, borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: A.textDim, fontFamily: A.mono, letterSpacing: 1, marginBottom: 4 }}>AGE</div>
              <div style={{ fontSize: 22, fontWeight: 600, fontFeatureSettings: '"tnum"' }}>27 yrs</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['−','+'].map(s => (
                <div key={s} style={{
                  width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: A.text, border: `1px solid ${A.cardBorder}`,
                }}>{s}</div>
              ))}
            </div>
          </div>
        </AGlass>

        <div style={{ flex: 1 }} />
        <button style={{
          padding: '16px', borderRadius: 16, border: 'none',
          background: `linear-gradient(135deg, ${A.accent}, ${A.accent2})`,
          color: '#0a0612', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          boxShadow: `0 12px 32px ${A.accent}30`,
        }}>Continue →</button>
      </div>
    </ABg>
  );
}

// ─── 4. Onboarding · Diet ─────────────────────────────────────
function AOnboardDiet() {
  const diets = [
    { id: 'veg', t: 'Vegetarian', s: 'No meat, no eggs', sel: true, ic: '🥬' },
    { id: 'eggetarian', t: 'Eggetarian', s: 'Veg + eggs', sel: false, ic: '🥚' },
    { id: 'nveg', t: 'Non-vegetarian', s: 'Everything', sel: false, ic: '🍗' },
    { id: 'vegan', t: 'Vegan', s: 'Plant-based only', sel: false, ic: '🌱' },
    { id: 'jain', t: 'Jain', s: 'No roots, no onion', sel: false, ic: '🪷' },
  ];
  return (
    <ABg>
      <div style={{ padding: '70px 24px 30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {[1,1,1,1].map((on,i) => (<div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: on ? A.accent : 'rgba(255,255,255,0.1)' }} />))}
        </div>
        <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, letterSpacing: 1.5, marginBottom: 8 }}>STEP 03 / 03</div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15, marginBottom: 6 }}>
          What's on your<br/>plate?
        </div>
        <div style={{ color: A.textDim, fontSize: 13, marginBottom: 24 }}>
          We'll suggest meals you'll actually eat — dal, paneer, biryani, all in.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {diets.map(d => (
            <AGlass key={d.id} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              border: d.sel ? `1.5px solid ${A.accent}` : `1px solid ${A.cardBorder}`,
              background: d.sel ? 'rgba(94,234,212,0.08)' : A.card,
              borderRadius: 16,
            }}>
              <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{d.ic}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{d.t}</div>
                <div style={{ color: A.textDim, fontSize: 12 }}>{d.s}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                border: d.sel ? `2px solid ${A.accent}` : '1.5px solid rgba(255,255,255,0.2)',
                background: d.sel ? A.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {d.sel && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke="#0a0612" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </AGlass>
          ))}
        </div>

        <button style={{
          marginTop: 16, padding: '16px', borderRadius: 16, border: 'none',
          background: `linear-gradient(135deg, ${A.accent}, ${A.accent2})`,
          color: '#0a0612', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          boxShadow: `0 12px 32px ${A.accent}30`,
        }}>Generate my plan ✨</button>
      </div>
    </ABg>
  );
}

// ─── 5. AI Analysis Loading ───────────────────────────────────
function AAnalyzing() {
  const steps = [
    { t: 'Analyzing body composition', d: '178cm · 74.2kg · age 27', done: true },
    { t: 'Calculating BMR & macros', d: '2,340 kcal · 142g protein', done: true },
    { t: 'Building 4-week plan', d: 'PPL split · 5 days/wk', done: true },
    { t: 'Curating Indian meal database', d: '1,247 meals · veg-friendly', done: false, active: true },
    { t: 'Personalizing daily quests', d: '', done: false },
  ];
  return (
    <ABg>
      <div style={{ padding: '70px 28px 30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, letterSpacing: 1.5, marginBottom: 8 }}>NEURAL ENGINE</div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.2, marginBottom: 6 }}>
          Building your<br/>personalized plan
        </div>
        <div style={{ color: A.textDim, fontSize: 13, marginBottom: 30 }}>
          This usually takes 8 seconds.
        </div>

        {/* big ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <RingMeter
            value={68} max={100} size={160} stroke={6}
            gradient={[A.accent2, A.accent]}
            track="rgba(255,255,255,0.05)"
            label={<div style={{ fontSize: 38, fontWeight: 700, fontFamily: A.mono, fontFeatureSettings: '"tnum"' }}>68<span style={{ fontSize: 16, color: A.textDim }}>%</span></div>}
            sublabel={<div style={{ fontSize: 10, color: A.textMute, fontFamily: A.mono, letterSpacing: 1.5 }}>PROCESSING</div>}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: s.active ? 'rgba(94,234,212,0.06)' : 'transparent',
              border: s.active ? `1px solid ${A.accent}30` : '1px solid transparent',
              borderRadius: 12,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                background: s.done ? A.accent : (s.active ? 'transparent' : 'rgba(255,255,255,0.06)'),
                border: s.active ? `2px solid ${A.accent}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.done && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke="#0a0612" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {s.active && <div style={{ width: 8, height: 8, borderRadius: 4, background: A.accent, animation: 'a-pulse 1s infinite' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: s.done ? A.textDim : A.text }}>{s.t}</div>
                {s.d && <div style={{ fontSize: 11, color: A.textMute, fontFamily: A.mono, marginTop: 2 }}>{s.d}</div>}
              </div>
            </div>
          ))}
          <style>{`@keyframes a-pulse{0%,100%{opacity:0.4;transform:scale(0.7)}50%{opacity:1;transform:scale(1)}}`}</style>
        </div>
      </div>
    </ABg>
  );
}

// ─── 6. Home Dashboard ────────────────────────────────────────
function AHome() {
  return (
    <ABg>
      <div style={{ padding: '60px 0 100px', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: A.textMute, fontFamily: A.mono, letterSpacing: 1 }}>WED · 1 MAY</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Hey, Arjun</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <AGlass style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 2, fontFamily: A.mono }}>14</span>
            </AGlass>
            <AGlass style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.6L4 17h5"/><path d="M9 17a3 3 0 006 0"/></svg>
            </AGlass>
          </div>
        </div>

        {/* Hero: avatar + score */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <AGlass style={{ padding: 20, borderRadius: 26, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(167,139,250,0.18), transparent 60%)' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flexShrink: 0 }}>
                <FitAvatar stage={4} size={130} palette={{ glow: A.accent, accent: A.accent }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: A.textMute, fontFamily: A.mono, letterSpacing: 1.2, marginBottom: 4 }}>HEALTH SCORE</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, lineHeight: 1, fontFeatureSettings: '"tnum"', background: `linear-gradient(135deg, ${A.accent}, ${A.accent2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>78</div>
                  <div style={{ color: A.textDim, fontSize: 14 }}>/100</div>
                </div>
                <div style={{ fontSize: 12, color: A.textDim, marginBottom: 8 }}>Up 4 from yesterday ↗</div>
                <APill>LVL 4 · LEAN</APill>
              </div>
            </div>
          </AGlass>
        </div>

        {/* Metric ring grid */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { l: 'Calories', v: '1,847', max: '/2,340', col: '#FB923C', pct: 78, icon: '🔥' },
              { l: 'Protein', v: '102g', max: '/142g', col: A.accent, pct: 72, icon: '🥩' },
              { l: 'Water', v: '1.8L', max: '/3.5L', col: '#60A5FA', pct: 51, icon: '💧' },
              { l: 'Steps', v: '7,420', max: '/10k', col: A.accent2, pct: 74, icon: '👣' },
            ].map((m,i) => (
              <AGlass key={i} style={{ padding: '12px 14px', borderRadius: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: A.textDim, fontFamily: A.mono, letterSpacing: 1 }}>{m.l.toUpperCase()}</div>
                  <div style={{ fontSize: 14 }}>{m.icon}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFeatureSettings: '"tnum"' }}>{m.v}</span>
                  <span style={{ color: A.textMute, fontSize: 11 }}>{m.max}</span>
                </div>
                <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.pct}%`, background: m.col, borderRadius: 2 }} />
                </div>
              </AGlass>
            ))}
          </div>
        </div>

        {/* Smart warning */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <AGlass style={{ padding: 14, borderRadius: 16, border: `1px solid ${A.warn}40`, background: `linear-gradient(135deg, ${A.warn}10, transparent)` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${A.warn}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.warn} strokeWidth="2.2"><path d="M12 9v4M12 17h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Hydrate now — protein backlog</div>
                <div style={{ fontSize: 11, color: A.textDim, lineHeight: 1.4 }}>You ate 102g protein but only 1.8L water. <span style={{ color: A.warn }}>Kidneys need 35ml per g.</span></div>
              </div>
              <div style={{ color: A.textMute, fontSize: 18 }}>›</div>
            </div>
          </AGlass>
        </div>

        {/* Daily Quests */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Daily Quests</div>
            <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono }}>+240 XP TODAY</div>
          </div>
          <AGlass style={{ borderRadius: 18, overflow: 'hidden' }}>
            {[
              { t: 'Hit 3.5L water', xp: 60, done: false },
              { t: '10k steps', xp: 80, done: true },
              { t: 'Complete Push Day workout', xp: 120, done: true },
            ].map((q,i,a) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < a.length-1 ? `1px solid ${A.cardBorder}` : 'none' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  background: q.done ? A.accent : 'transparent',
                  border: q.done ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {q.done && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3.5" stroke="#0a0612" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex: 1, fontSize: 13, color: q.done ? A.textMute : A.text, textDecoration: q.done ? 'line-through' : 'none' }}>{q.t}</div>
                <div style={{ fontSize: 11, fontFamily: A.mono, color: q.done ? A.textMute : A.accent, fontWeight: 600 }}>+{q.xp} XP</div>
              </div>
            ))}
          </AGlass>
        </div>

        {/* Today's workout preview */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Today's Workout</div>
          <AGlass style={{ padding: 14, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ImagePlaceholder width={56} height={56} radius={12} label="" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Push Day · Chest + Triceps</div>
              <div style={{ fontSize: 11, color: A.textDim }}>6 exercises · 48 min · ~480 kcal</div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `linear-gradient(135deg, ${A.accent}, ${A.accent2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="#0a0612"><path d="M3 1.5l7 4.5-7 4.5z"/></svg>
            </div>
          </AGlass>
        </div>

        <TabBar active="home" accent={A.accent} />
      </div>
    </ABg>
  );
}

// ─── 7. Workout Plan ──────────────────────────────────────────
function AWorkout() {
  const exercises = [
    { n: 'Barbell Bench Press', s: '4 × 8', kg: '60kg', rest: '90s', done: true },
    { n: 'Incline Dumbbell Press', s: '4 × 10', kg: '22kg', rest: '75s', done: true },
    { n: 'Cable Fly', s: '3 × 12', kg: '15kg', rest: '60s', done: false, active: true },
    { n: 'Tricep Pushdown', s: '4 × 12', kg: '30kg', rest: '60s', done: false },
    { n: 'Overhead Extension', s: '3 × 10', kg: '20kg', rest: '60s', done: false },
    { n: 'Dips (BW)', s: '3 × AMRAP', kg: '—', rest: '90s', done: false },
  ];
  return (
    <ABg>
      <div style={{ padding: '60px 0 100px', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, letterSpacing: 1.5, marginBottom: 4 }}>WEEK 3 · DAY 5</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Push Day</div>
          <div style={{ color: A.textDim, fontSize: 13 }}>Chest, shoulders, triceps</div>
        </div>

        {/* live progress */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <AGlass style={{ padding: 16, borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top right, ${A.accent}20, transparent 60%)` }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: A.textDim, fontFamily: A.mono, letterSpacing: 1 }}>SESSION TIME</div>
                <div style={{ fontSize: 32, fontWeight: 700, fontFeatureSettings: '"tnum"', letterSpacing: -1 }}>22:14</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: A.textDim, fontFamily: A.mono, letterSpacing: 1 }}>VOLUME</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>4,860 <span style={{ fontSize: 11, color: A.textDim }}>kg</span></div>
              </div>
            </div>
            <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 8 }}>
              <div style={{ position: 'absolute', height: '100%', width: '40%', borderRadius: 2, background: `linear-gradient(90deg, ${A.accent2}, ${A.accent})` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: A.textMute, fontFamily: A.mono }}>
              <span>2 / 6 EXERCISES</span><span>~26 MIN LEFT</span>
            </div>
          </AGlass>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exercises.map((e,i) => (
            <AGlass key={i} style={{
              padding: '12px 14px', borderRadius: 14,
              border: e.active ? `1.5px solid ${A.accent}` : `1px solid ${A.cardBorder}`,
              background: e.active ? 'rgba(94,234,212,0.06)' : A.card,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: e.done ? A.accent : (e.active ? `linear-gradient(135deg, ${A.accent}, ${A.accent2})` : 'rgba(255,255,255,0.06)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: A.mono, fontSize: 12, fontWeight: 700,
                  color: e.done || e.active ? '#0a0612' : A.textDim,
                }}>{e.done ? '✓' : i+1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{e.n}</div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: A.textDim, fontFamily: A.mono }}>
                    <span>{e.s}</span><span>·</span><span>{e.kg}</span><span>·</span><span>rest {e.rest}</span>
                  </div>
                </div>
                {e.active && <div style={{ fontSize: 10, fontFamily: A.mono, color: A.accent }}>NOW</div>}
              </div>
            </AGlass>
          ))}
        </div>

        <TabBar active="workout" accent={A.accent} />
      </div>
    </ABg>
  );
}

// ─── 8. Food Scan ─────────────────────────────────────────────
function AFoodScan() {
  return (
    <ABg>
      <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Camera viewfinder */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(50,30,80,1) 0%, rgba(10,6,20,1) 80%)' }}>
          {/* food placeholder */}
          <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <ImagePlaceholder width={220} height={220} radius={18} label="thali photo" tone="rgba(255,180,80,0.12)" />
          </div>
          {/* scan grid lines */}
          <div style={{ position: 'absolute', inset: '20% 12%', borderRadius: 24, border: `1.5px solid ${A.accent}`, boxShadow: `0 0 40px ${A.accent}40` }}>
            {/* corners */}
            {[[0,0,'tl'],[1,0,'tr'],[0,1,'bl'],[1,1,'br']].map(([x,y,k]) => (
              <div key={k} style={{
                position: 'absolute',
                top: y ? 'auto' : -2, bottom: y ? -2 : 'auto',
                left: x ? 'auto' : -2, right: x ? -2 : 'auto',
                width: 24, height: 24,
                borderTop: y ? 'none' : `3px solid ${A.accent}`,
                borderBottom: y ? `3px solid ${A.accent}` : 'none',
                borderLeft: x ? 'none' : `3px solid ${A.accent}`,
                borderRight: x ? `3px solid ${A.accent}` : 'none',
                borderTopLeftRadius: !x && !y ? 8 : 0,
                borderTopRightRadius: x && !y ? 8 : 0,
                borderBottomLeftRadius: !x && y ? 8 : 0,
                borderBottomRightRadius: x && y ? 8 : 0,
              }} />
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{ position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
          <AGlass style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </AGlass>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <APill style={{ background: 'rgba(94,234,212,0.15)', border: `1px solid ${A.accent}40` }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: A.accent, animation: 'a-pulse 1s infinite' }} />
              ANALYZING
            </APill>
          </div>
          <AGlass style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </AGlass>
        </div>

        {/* Bottom sheet — detected foods */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 36 }}>
          <AGlass style={{ padding: 18, borderRadius: 26, background: 'rgba(20,16,32,0.85)', backdropFilter: 'blur(30px) saturate(180%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, letterSpacing: 1.5 }}>DETECTED · 4 ITEMS</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>South Indian Thali</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: A.mono, color: A.accent, fontFeatureSettings: '"tnum"' }}>620<span style={{ fontSize: 11, color: A.textDim }}>kcal</span></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {[
                { n: 'Sambar', g: '180g', k: 120, c: 95 },
                { n: 'Steamed rice', g: '150g', k: 195, c: 88 },
                { n: 'Coconut chutney', g: '40g', k: 85, c: 72 },
                { n: 'Idli (3)', g: '120g', k: 220, c: 96 },
              ].map((f,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? `1px solid ${A.cardBorder}` : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{f.n}</div>
                    <div style={{ fontSize: 10, color: A.textMute, fontFamily: A.mono }}>{f.g} · {f.c}% match</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: A.mono, fontFeatureSettings: '"tnum"' }}>{f.k} kcal</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 14 }}>
              {[
                { l: 'P', v: '18g', c: A.accent },
                { l: 'C', v: '102g', c: '#FB923C' },
                { l: 'F', v: '14g', c: A.warn },
                { l: 'Fib', v: '8g', c: A.accent2 },
              ].map((m,i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: m.c, fontFamily: A.mono, letterSpacing: 1 }}>{m.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{m.v}</div>
                </div>
              ))}
            </div>

            <button style={{
              width: '100%', padding: 14, borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${A.accent}, ${A.accent2})`,
              color: '#0a0612', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>Log to today's intake</button>
          </AGlass>
        </div>
      </div>
    </ABg>
  );
}

// ─── 9. Friends Leaderboard ───────────────────────────────────
function AFriends() {
  const friends = [
    { r: 1, n: 'Riya Mehta', xp: 4820, avatar: '#F472B6', delta: '+340', me: false, stage: 6 },
    { r: 2, n: 'You', xp: 4210, avatar: A.accent, delta: '+240', me: true, stage: 4 },
    { r: 3, n: 'Karan Joshi', xp: 3960, avatar: '#60A5FA', delta: '+180', me: false, stage: 4 },
    { r: 4, n: 'Aditi Rao', xp: 3540, avatar: '#A78BFA', delta: '+120', me: false, stage: 3 },
    { r: 5, n: 'Vikram S.', xp: 2890, avatar: '#FBBF24', delta: '+80', me: false, stage: 2 },
    { r: 6, n: 'Neha P.', xp: 2410, avatar: '#FB923C', delta: '+60', me: false, stage: 2 },
  ];
  return (
    <ABg>
      <div style={{ padding: '60px 0 100px', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, letterSpacing: 1.5, marginBottom: 4 }}>WEEK 18 · 4 DAYS LEFT</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Squad League</div>
          </div>
          <APill>+240 XP</APill>
        </div>

        {/* Top 3 podium */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <AGlass style={{ padding: 16, borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center top, ${A.accent2}20, transparent 60%)` }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', paddingTop: 8 }}>
              {[friends[1], friends[0], friends[2]].map((f, idx) => {
                const pos = [2,1,3][idx];
                const h = pos === 1 ? 70 : pos === 2 ? 50 : 40;
                return (
                  <div key={f.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: pos === 1 ? 56 : 44, height: pos === 1 ? 56 : 44,
                        borderRadius: '50%', background: f.avatar,
                        border: f.me ? `2px solid ${A.accent}` : `2px solid ${pos === 1 ? '#FBBF24' : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: pos === 1 ? 18 : 14, color: '#0a0612',
                      }}>{f.n[0]}</div>
                      {pos === 1 && (
                        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}>👑</div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{f.n.split(' ')[0]}</div>
                    <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, fontFeatureSettings: '"tnum"' }}>{f.xp.toLocaleString()}</div>
                    <div style={{
                      width: 50, height: h, borderRadius: '6px 6px 0 0',
                      background: pos === 1
                        ? `linear-gradient(180deg, #FBBF24, ${A.accent2})`
                        : `linear-gradient(180deg, ${A.accent}40, ${A.accent2}20)`,
                      border: `1px solid ${pos === 1 ? '#FBBF2440' : A.cardBorder}`,
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                      paddingTop: 4, fontFamily: A.mono, fontSize: 11, fontWeight: 700,
                      color: pos === 1 ? '#0a0612' : A.text,
                    }}>{pos}</div>
                  </div>
                );
              })}
            </div>
          </AGlass>
        </div>

        <div style={{ padding: '0 20px' }}>
          <div style={{ fontSize: 11, color: A.textDim, fontFamily: A.mono, letterSpacing: 1, marginBottom: 8 }}>FULL RANKING</div>
          <AGlass style={{ borderRadius: 18, overflow: 'hidden' }}>
            {friends.map((f,i,a) => (
              <div key={f.n} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderBottom: i < a.length - 1 ? `1px solid ${A.cardBorder}` : 'none',
                background: f.me ? 'rgba(94,234,212,0.06)' : 'transparent',
              }}>
                <div style={{ width: 22, fontSize: 12, fontFamily: A.mono, color: f.r <= 3 ? A.accent : A.textDim, fontWeight: 700 }}>{f.r}</div>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: f.avatar, color: '#0a0612', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{f.n[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.n} {f.me && <span style={{ color: A.accent, fontSize: 10, fontFamily: A.mono, marginLeft: 4 }}>YOU</span>}</div>
                  <div style={{ fontSize: 10, color: A.textMute, fontFamily: A.mono }}>LVL {f.stage}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: A.mono, fontFeatureSettings: '"tnum"' }}>{f.xp.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: A.accent, fontFamily: A.mono }}>{f.delta}</div>
                </div>
              </div>
            ))}
          </AGlass>
        </div>

        <TabBar active="friends" accent={A.accent} />
      </div>
    </ABg>
  );
}

// ─── 10. Profile ──────────────────────────────────────────────
function AProfile() {
  return (
    <ABg>
      <div style={{ padding: '60px 0 100px', height: '100%', overflow: 'hidden' }}>
        {/* Hero */}
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <AGlass style={{ padding: 18, borderRadius: 22, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, ${A.accent2}30, transparent 70%)` }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 30,
                background: `linear-gradient(135deg, ${A.accent}, ${A.accent2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 22, color: '#0a0612',
              }}>A</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Arjun Kapoor</div>
                <div style={{ fontSize: 12, color: A.textDim }}>Bengaluru · Joined Jan 2026</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <APill>LVL 4</APill>
                  <APill color={A.accent2}>4,210 XP</APill>
                </div>
              </div>
            </div>
          </AGlass>
        </div>

        {/* Body Fat % big chart */}
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <AGlass style={{ padding: 18, borderRadius: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: A.textDim, fontFamily: A.mono, letterSpacing: 1 }}>BODY FAT %</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1.5, fontFeatureSettings: '"tnum"' }}>18.4</span>
                  <span style={{ fontSize: 16, color: A.textDim }}>%</span>
                </div>
                <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, marginTop: 2 }}>−2.1% in 90 days ↓</div>
              </div>
              <APill color={A.accent}>ATHLETIC</APill>
            </div>
            {/* sparkline */}
            <div style={{ marginTop: 12, height: 80, position: 'relative' }}>
              <Spark
                data={[20.5, 20.3, 20.8, 20.1, 19.6, 19.4, 19.0, 19.2, 18.8, 18.5, 18.6, 18.4]}
                width={320} height={80}
                color={A.accent}
                fill={A.accent}
              />
              <div style={{ position: 'absolute', top: 0, right: 0, fontSize: 10, color: A.textMute, fontFamily: A.mono }}>20.5%</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, fontSize: 10, color: A.textMute, fontFamily: A.mono }}>18.4%</div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: A.textMute, fontFamily: A.mono }}>
              <span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span>
            </div>
          </AGlass>
        </div>

        {/* 3 month wrapped teaser */}
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <AGlass style={{
            padding: 14, borderRadius: 18, position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, ${A.accent2}40, ${A.accent}20)`,
            border: `1px solid ${A.accent2}50`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: A.accent, fontFamily: A.mono, letterSpacing: 1.5, fontWeight: 700 }}>NEW · DROPS MAY 31</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Your 3-Month Wrapped</div>
                <div style={{ fontSize: 11, color: A.textDim }}>−3.8kg · 47 workouts · 280k steps</div>
              </div>
              <div style={{ color: A.text }}>›</div>
            </div>
          </AGlass>
        </div>

        {/* List */}
        <div style={{ padding: '0 20px' }}>
          <AGlass style={{ borderRadius: 18, overflow: 'hidden' }}>
            {[
              { i: '🏆', t: 'Achievements', d: '12 of 48 unlocked' },
              { i: '📊', t: 'Body measurements', d: 'Updated 2 days ago' },
              { i: '⚙️', t: 'Goals & preferences', d: 'Build muscle · Veg' },
              { i: '🔔', t: 'Notifications', d: 'On' },
            ].map((it,i,a) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px',
                borderBottom: i < a.length-1 ? `1px solid ${A.cardBorder}` : 'none',
              }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.i}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{it.t}</div>
                  <div style={{ fontSize: 11, color: A.textMute }}>{it.d}</div>
                </div>
                <div style={{ color: A.textMute, fontSize: 16 }}>›</div>
              </div>
            ))}
          </AGlass>
        </div>

        <TabBar active="profile" accent={A.accent} />
      </div>
    </ABg>
  );
}

Object.assign(window, {
  ASplash, AOnboardGoal, AOnboardStats, AOnboardDiet, AAnalyzing,
  AHome, AWorkout, AFoodScan, AFriends, AProfile,
});
