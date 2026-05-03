import React, { useId } from 'react';

interface AvatarPalette {
  skin?: string;
  skinShade?: string;
  glow?: string;
  accent?: string;
  suit?: string;
  suitHi?: string;
}

interface FitAvatarProps {
  stage?: number;
  size?: number;
  palette?: AvatarPalette;
}

export function FitAvatar({ stage = 4, size = 180, palette = {} }: FitAvatarProps) {
  const muscle = Math.min(7, Math.max(1, stage));
  const skin = palette.skin || '#C9A07A';
  const skinShade = palette.skinShade || '#9C7654';
  const glow = palette.glow || '#7CF9C5';
  const accent = palette.accent || '#7CF9C5';
  const suit = palette.suit || '#1a1330';
  const suitHi = palette.suitHi || '#2a1f4a';

  const muscleScale = 0.8 + muscle * 0.05;
  const glowOpacity = 0.15 + muscle * 0.08;
  const uid = useId().replace(/:/g, '');

  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`avg-${uid}`} cx="50%" cy="60%">
          <stop offset="0%" stopColor={glow} stopOpacity={glowOpacity} />
          <stop offset="60%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </linearGradient>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitHi} />
          <stop offset="100%" stopColor={suit} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="160" rx="90" ry="100" fill={`url(#avg-${uid})`} />
      <ellipse cx="100" cy="248" rx={50 * muscleScale} ry="6" fill="#000" opacity="0.35" />

      <g transform={`translate(100 175) scale(${muscleScale} 1) translate(-100 -175)`}>
        <path d="M82 175 Q78 220 76 248 L92 248 Q94 220 95 175 Z" fill={`url(#sg-${uid})`} />
        <path d="M118 175 Q122 220 124 248 L108 248 Q106 220 105 175 Z" fill={`url(#sg-${uid})`} />
        <line x1="84" y1="200" x2="92" y2="200" stroke={accent} strokeWidth="1.5" opacity="0.6" />
        <line x1="108" y1="200" x2="116" y2="200" stroke={accent} strokeWidth="1.5" opacity="0.6" />
      </g>

      <g transform={`translate(100 130) scale(${muscleScale} 1) translate(-100 -130)`}>
        <path
          d={`M${72 - muscle} 95 Q${68 - muscle} 130 78 175 L122 175 Q${132 + muscle} 130 ${128 + muscle} 95 Q100 88 ${72 - muscle} 95 Z`}
          fill={`url(#bg-${uid})`}
        />
        <path
          d={`M85 110 Q92 ${118 - muscle} 100 ${118 - muscle} Q108 ${118 - muscle} 115 110`}
          fill="none"
          stroke={skinShade}
          strokeWidth="1.2"
          opacity={0.4 + muscle * 0.08}
        />
        <line x1="100" y1="118" x2="100" y2="155" stroke={skinShade} strokeWidth="1" opacity={0.3 + muscle * 0.07} />
        {muscle >= 4 && (
          <g opacity={(muscle - 3) * 0.18} stroke={skinShade} strokeWidth="0.8" fill="none">
            <path d="M88 130 H112" />
            <path d="M88 142 H112" />
            <path d="M90 154 H110" />
          </g>
        )}
        <path
          d="M82 95 Q78 110 80 145 L120 145 Q122 110 118 95 Q100 90 82 95 Z"
          fill={`url(#sg-${uid})`}
        />
        <circle cx="100" cy="125" r="3" fill={accent} />
      </g>

      <g>
        <path
          d={`M${75 - muscle * 1.2} 100 Q${62 - muscle * 1.5} 130 ${68 - muscle} 165 Q${74 - muscle} 170 78 165 Q${74 - muscle * 0.5} 135 ${82 - muscle * 0.5} 105 Z`}
          fill={`url(#bg-${uid})`}
        />
        <path
          d={`M${125 + muscle * 1.2} 100 Q${138 + muscle * 1.5} 130 ${132 + muscle} 165 Q${126 + muscle} 170 122 165 Q${126 + muscle * 0.5} 135 ${118 + muscle * 0.5} 105 Z`}
          fill={`url(#bg-${uid})`}
        />
        {muscle >= 3 && (
          <>
            <ellipse cx={70 - muscle} cy="125" rx="5" ry="9" fill={skinShade} opacity={0.3 + muscle * 0.05} />
            <ellipse cx={130 + muscle} cy="125" rx="5" ry="9" fill={skinShade} opacity={0.3 + muscle * 0.05} />
          </>
        )}
      </g>

      <rect x="93" y="80" width="14" height="18" fill={`url(#bg-${uid})`} />
      <circle cx="100" cy="62" r="22" fill={`url(#bg-${uid})`} />
      <path d="M78 58 Q80 40 100 38 Q120 40 122 58 Q120 50 100 48 Q82 50 78 58 Z" fill="#1a0f08" />
      <ellipse cx="92" cy="62" rx="1.5" ry="2" fill="#1a0f08" />
      <ellipse cx="108" cy="62" rx="1.5" ry="2" fill="#1a0f08" />
      <path d="M94 72 Q100 75 106 72" fill="none" stroke={skinShade} strokeWidth="1.2" strokeLinecap="round" />

      <g transform="translate(160 30)">
        <circle r="14" fill="rgba(0,0,0,0.6)" stroke={accent} strokeWidth="1.5" />
        <text textAnchor="middle" dy="4" fontSize="13" fontWeight="700" fill={accent} fontFamily="ui-monospace, monospace">
          {stage}
        </text>
      </g>
    </svg>
  );
}
