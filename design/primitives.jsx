// Shared primitives across all 3 FitIQ directions
// Avatar (procedural SVG character that "evolves"), Ring meter, Sparkline

function FitAvatar({ stage = 4, size = 180, palette = {} }) {
  // 7 evolution stages: muscle definition + glow intensifies
  const muscle = Math.min(7, Math.max(1, stage));
  const skin = palette.skin || '#C9A07A';
  const skinShade = palette.skinShade || '#9C7654';
  const glow = palette.glow || '#7CF9C5';
  const accent = palette.accent || '#7CF9C5';
  const suit = palette.suit || '#1a1330';
  const suitHi = palette.suitHi || '#2a1f4a';

  const muscleScale = 0.8 + muscle * 0.05; // 0.85 → 1.15
  const glowOpacity = 0.15 + muscle * 0.08;

  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`avatarGlow-${stage}`} cx="50%" cy="60%">
          <stop offset="0%" stopColor={glow} stopOpacity={glowOpacity} />
          <stop offset="60%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`bodyGrad-${stage}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </linearGradient>
        <linearGradient id={`suitGrad-${stage}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitHi} />
          <stop offset="100%" stopColor={suit} />
        </linearGradient>
        <filter id={`avatarBlur-${stage}`}>
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* aura */}
      <ellipse cx="100" cy="160" rx="90" ry="100" fill={`url(#avatarGlow-${stage})`} />

      {/* shadow */}
      <ellipse cx="100" cy="248" rx={50 * muscleScale} ry="6" fill="#000" opacity="0.35" />

      {/* legs */}
      <g transform={`translate(100 175) scale(${muscleScale} 1) translate(-100 -175)`}>
        <path d="M82 175 Q78 220 76 248 L92 248 Q94 220 95 175 Z" fill={`url(#suitGrad-${stage})`} />
        <path d="M118 175 Q122 220 124 248 L108 248 Q106 220 105 175 Z" fill={`url(#suitGrad-${stage})`} />
        <line x1="84" y1="200" x2="92" y2="200" stroke={accent} strokeWidth="1.5" opacity="0.6" />
        <line x1="108" y1="200" x2="116" y2="200" stroke={accent} strokeWidth="1.5" opacity="0.6" />
      </g>

      {/* torso */}
      <g transform={`translate(100 130) scale(${muscleScale} 1) translate(-100 -130)`}>
        <path
          d={`M${72 - muscle} 95 Q${68 - muscle} 130 78 175 L122 175 Q${132 + muscle} 130 ${128 + muscle} 95 Q100 88 ${72 - muscle} 95 Z`}
          fill={`url(#bodyGrad-${stage})`}
        />
        {/* chest definition */}
        <path
          d={`M85 110 Q92 ${118 - muscle} 100 ${118 - muscle} Q108 ${118 - muscle} 115 110`}
          fill="none" stroke={skinShade} strokeWidth="1.2" opacity={0.4 + muscle * 0.08}
        />
        <line x1="100" y1="118" x2="100" y2="155" stroke={skinShade} strokeWidth="1" opacity={0.3 + muscle * 0.07} />
        {/* abs (only at higher stages) */}
        {muscle >= 4 && (
          <g opacity={(muscle - 3) * 0.18} stroke={skinShade} strokeWidth="0.8" fill="none">
            <path d="M88 130 H112" />
            <path d="M88 142 H112" />
            <path d="M90 154 H110" />
          </g>
        )}
        {/* tank top */}
        <path
          d={`M82 95 Q78 110 80 145 L120 145 Q122 110 118 95 Q100 90 82 95 Z`}
          fill={`url(#suitGrad-${stage})`}
        />
        {/* logo dot */}
        <circle cx="100" cy="125" r="3" fill={accent} />
      </g>

      {/* arms */}
      <g>
        <path
          d={`M${75 - muscle * 1.2} 100 Q${62 - muscle * 1.5} 130 ${68 - muscle} 165 Q${74 - muscle} 170 78 165 Q${74 - muscle * 0.5} 135 ${82 - muscle * 0.5} 105 Z`}
          fill={`url(#bodyGrad-${stage})`}
        />
        <path
          d={`M${125 + muscle * 1.2} 100 Q${138 + muscle * 1.5} 130 ${132 + muscle} 165 Q${126 + muscle} 170 122 165 Q${126 + muscle * 0.5} 135 ${118 + muscle * 0.5} 105 Z`}
          fill={`url(#bodyGrad-${stage})`}
        />
        {/* bicep highlight */}
        {muscle >= 3 && (
          <>
            <ellipse cx={70 - muscle} cy="125" rx="5" ry="9" fill={skinShade} opacity={0.3 + muscle * 0.05} />
            <ellipse cx={130 + muscle} cy="125" rx="5" ry="9" fill={skinShade} opacity={0.3 + muscle * 0.05} />
          </>
        )}
      </g>

      {/* neck */}
      <rect x="93" y="80" width="14" height="18" fill={`url(#bodyGrad-${stage})`} />

      {/* head */}
      <circle cx="100" cy="62" r="22" fill={`url(#bodyGrad-${stage})`} />
      {/* hair */}
      <path d="M78 58 Q80 40 100 38 Q120 40 122 58 Q120 50 100 48 Q82 50 78 58 Z" fill="#1a0f08" />
      {/* face */}
      <ellipse cx="92" cy="62" rx="1.5" ry="2" fill="#1a0f08" />
      <ellipse cx="108" cy="62" rx="1.5" ry="2" fill="#1a0f08" />
      <path d="M94 72 Q100 75 106 72" fill="none" stroke={skinShade} strokeWidth="1.2" strokeLinecap="round" />

      {/* tier indicator pip */}
      <g transform="translate(160 30)">
        <circle r="14" fill="rgba(0,0,0,0.6)" stroke={accent} strokeWidth="1.5" />
        <text textAnchor="middle" dy="4" fontSize="13" fontWeight="700" fill={accent} fontFamily="ui-monospace, monospace">{stage}</text>
      </g>
    </svg>
  );
}

// circular ring meter, stroke arc with gradient
function RingMeter({ value = 72, max = 100, size = 180, stroke = 14, color = '#7CF9C5', track = 'rgba(255,255,255,0.08)', label, sublabel, gradient }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const dash = c * pct;
  const id = 'rg-' + Math.round(Math.random() * 1e9);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          {gradient && (
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          )}
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={gradient ? `url(#${id})` : color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        {label}
        {sublabel}
      </div>
    </div>
  );
}

function Spark({ data = [], width = 80, height = 24, color = '#7CF9C5', fill }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${height - ((v - min) / span) * height}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && (
        <polygon points={`0,${height} ${pts} ${width},${height}`} fill={fill} opacity="0.25" />
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Bottom tab bar (shared shape, color from props)
function TabBar({ active = 'home', onTab, accent = '#7CF9C5', dark = true, blur = true }) {
  const tabs = [
    { id: 'home', icon: 'M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7H10v7H6a2 2 0 01-2-2v-9z' },
    { id: 'workout', icon: 'M6 6h2v12H6zM10 9h2v6h-2zM14 7h2v10h-2zM18 6h2v12h-2z' },
    { id: 'scan', icon: 'M4 7V5a1 1 0 011-1h2M20 7V5a1 1 0 00-1-1h-2M4 17v2a1 1 0 001 1h2M20 17v2a1 1 0 01-1 1h-2M7 12h10' },
    { id: 'friends', icon: 'M9 11a4 4 0 100-8 4 4 0 000 8zM17 11a3 3 0 100-6 3 3 0 000 6zM2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2M16 15a4 4 0 014 4v2' },
    { id: 'profile', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 1116 0' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 10, paddingLeft: 16, paddingRight: 16,
      background: blur ? 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 60%, transparent)' : 'transparent',
      zIndex: 40,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        background: 'rgba(20,16,32,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 22, padding: '10px 6px',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onTab && onTab(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active === t.id ? accent : 'rgba(255,255,255,0.45)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {active === t.id && (
              <div style={{
                position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2,
                background: accent, boxShadow: `0 0 8px ${accent}`,
              }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Subtle striped placeholder for hero food/workout images
function ImagePlaceholder({ width = '100%', height = 120, label = 'image', tone = 'rgba(255,255,255,0.04)', textColor = 'rgba(255,255,255,0.4)', radius = 14 }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: `repeating-linear-gradient(135deg, ${tone}, ${tone} 6px, transparent 6px, transparent 12px), rgba(255,255,255,0.03)`,
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 10,
      color: textColor, letterSpacing: 1, textTransform: 'uppercase',
    }}>{label}</div>
  );
}

Object.assign(window, { FitAvatar, RingMeter, Spark, TabBar, ImagePlaceholder });
