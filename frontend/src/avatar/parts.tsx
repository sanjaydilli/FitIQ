import React from 'react';
import { AvatarConfig, BodyType, muscleForBody, skinShades, skinTones } from './config';

export interface RenderCtx {
  config: AvatarConfig;
  uid: string;
  skin: string;
  skinShade: string;
  muscle: number;
}

const OUTLINE = '#1A0E08';
const STROKE_W = 1.6;
const STROKE_W_THIN = 1.1;

export function buildCtx(config: AvatarConfig, uid: string): RenderCtx {
  const tone = Math.min(skinTones.length - 1, Math.max(0, config.skinTone));
  return {
    config,
    uid,
    skin: skinTones[tone],
    skinShade: skinShades[tone],
    muscle: muscleForBody(config.bodyType),
  };
}

// ─── Body / Torso / Arms / Legs ───────────────────────────────
// Bitmoji proportions: small chibi body, head dominates
export function Body({ ctx }: { ctx: RenderCtx }) {
  const { skin, skinShade, muscle, config } = ctx;
  const m = muscle;
  const top = config.outfitTop;
  const bottom = config.outfitBottom;
  const color = config.outfitColor;
  const colorDark = darken(color, 0.7);
  const colorLight = lighten(color, 1.18);
  const flexed = config.pose === 'workout' || config.pose === 'celebrating';

  const torsoW = 38 + m * 1.2; // half-width
  const torsoY = 158;

  return (
    <>
      {/* shadow under feet */}
      <ellipse cx="100" cy="266" rx={32} ry="3.5" fill="#000" opacity="0.4" />

      {/* legs */}
      <g>
        {bottom === 'shorts' ? (
          <>
            {/* skin */}
            <path
              d="M86 200 L82 240 Q82 248 90 248 L96 248 Q98 248 98 244 L99 200 Z"
              fill={skin}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            <path
              d="M114 200 L118 240 Q118 248 110 248 L104 248 Q102 248 102 244 L101 200 Z"
              fill={skin}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            {/* shorts overlay */}
            <path
              d="M76 196 Q72 204 76 218 L124 218 Q128 204 124 196 Q100 192 76 196 Z"
              fill={color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            <line x1="100" y1="198" x2="100" y2="218" stroke={colorDark} strokeWidth="1.2" />
          </>
        ) : (
          <>
            <path
              d={`M82 196 Q76 224 80 260 Q82 266 92 264 Q96 262 98 256 L99 196 Z`}
              fill={color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            <path
              d={`M118 196 Q124 224 120 260 Q118 266 108 264 Q104 262 102 256 L101 196 Z`}
              fill={color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            {bottom === 'joggers' && (
              <>
                <path d="M80 252 Q88 254 96 252" stroke={colorDark} strokeWidth="1.4" fill="none" />
                <path d="M104 252 Q112 254 120 252" stroke={colorDark} strokeWidth="1.4" fill="none" />
              </>
            )}
            {bottom === 'track' && (
              <>
                <line x1="86" y1="200" x2="88" y2="258" stroke="#fff" strokeWidth="1.3" opacity="0.9" />
                <line x1="114" y1="200" x2="112" y2="258" stroke="#fff" strokeWidth="1.3" opacity="0.9" />
              </>
            )}
          </>
        )}
        {/* shoes */}
        <ellipse cx="89" cy="266" rx="11" ry="5" fill={OUTLINE} />
        <ellipse cx="111" cy="266" rx="11" ry="5" fill={OUTLINE} />
        <ellipse cx="89" cy="264" rx="9" ry="3" fill="#fff" opacity="0.9" />
        <ellipse cx="111" cy="264" rx="9" ry="3" fill="#fff" opacity="0.9" />
      </g>

      {/* torso (skin under shirt) */}
      <path
        d={`M${100 - torsoW} ${torsoY - 8} Q${100 - torsoW + 2} ${torsoY + 30} ${100 - torsoW + 8} ${torsoY + 44} L${100 + torsoW - 8} ${torsoY + 44} Q${100 + torsoW - 2} ${torsoY + 30} ${100 + torsoW} ${torsoY - 8} Q100 ${torsoY - 14} ${100 - torsoW} ${torsoY - 8} Z`}
        fill={skin}
        stroke={OUTLINE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />

      {/* outfit top */}
      <g>
        {top === 'tank' && (
          <>
            <path
              d={`M${100 - torsoW + 4} ${torsoY - 4} Q${100 - torsoW + 6} ${torsoY + 32} ${100 - torsoW + 10} ${torsoY + 44} L${100 + torsoW - 10} ${torsoY + 44} Q${100 + torsoW - 6} ${torsoY + 32} ${100 + torsoW - 4} ${torsoY - 4} Q${100 + torsoW * 0.5} ${torsoY - 6} 100 ${torsoY + 4} Q${100 - torsoW * 0.5} ${torsoY - 6} ${100 - torsoW + 4} ${torsoY - 4} Z`}
              fill={color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            <path
              d={`M${100 - torsoW + 8} ${torsoY - 2} Q100 ${torsoY + 6} ${100 + torsoW - 8} ${torsoY - 2}`}
              fill="none"
              stroke={colorDark}
              strokeWidth="1"
              opacity="0.6"
            />
          </>
        )}
        {top === 'tee' && (
          <>
            <path
              d={`M${100 - torsoW - 2} ${torsoY - 10} Q${100 - torsoW - 4} ${torsoY + 30} ${100 - torsoW + 6} ${torsoY + 46} L${100 + torsoW - 6} ${torsoY + 46} Q${100 + torsoW + 4} ${torsoY + 30} ${100 + torsoW + 2} ${torsoY - 10} Q100 ${torsoY - 16} ${100 - torsoW - 2} ${torsoY - 10} Z`}
              fill={color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            <path
              d={`M${94} ${torsoY - 12} Q100 ${torsoY - 6} ${106} ${torsoY - 12}`}
              fill={skin}
              stroke={OUTLINE}
              strokeWidth={STROKE_W_THIN}
            />
          </>
        )}
        {top === 'hoodie' && (
          <>
            <path
              d={`M${100 - torsoW - 4} ${torsoY - 12} Q${100 - torsoW - 8} ${torsoY + 32} ${100 - torsoW + 4} ${torsoY + 48} L${100 + torsoW - 4} ${torsoY + 48} Q${100 + torsoW + 8} ${torsoY + 32} ${100 + torsoW + 4} ${torsoY - 12} Q100 ${torsoY - 18} ${100 - torsoW - 4} ${torsoY - 12} Z`}
              fill={color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            {/* hood drape */}
            <path
              d={`M${100 - torsoW - 2} ${torsoY - 12} Q${94} ${torsoY - 22} 100 ${torsoY - 24} Q${106} ${torsoY - 22} ${100 + torsoW + 2} ${torsoY - 12} Q100 ${torsoY - 16} ${100 - torsoW - 2} ${torsoY - 12} Z`}
              fill={colorDark}
              stroke={OUTLINE}
              strokeWidth={STROKE_W_THIN}
            />
            {/* drawstrings */}
            <line x1="96" y1={torsoY - 6} x2="96" y2={torsoY + 14} stroke={OUTLINE} strokeWidth="1.2" />
            <line x1="104" y1={torsoY - 6} x2="104" y2={torsoY + 14} stroke={OUTLINE} strokeWidth="1.2" />
            <circle cx="96" cy={torsoY + 16} r="1.6" fill={OUTLINE} />
            <circle cx="104" cy={torsoY + 16} r="1.6" fill={OUTLINE} />
            {/* pocket */}
            <path
              d={`M${100 - torsoW + 8} ${torsoY + 22} L${100 + torsoW - 8} ${torsoY + 22} L${100 + torsoW - 12} ${torsoY + 38} L${100 - torsoW + 12} ${torsoY + 38} Z`}
              fill={colorDark}
              opacity="0.55"
              stroke={OUTLINE}
              strokeWidth={STROKE_W_THIN}
            />
          </>
        )}
        {top === 'crop' && (
          <>
            <path
              d={`M${100 - torsoW - 2} ${torsoY - 10} Q${100 - torsoW - 4} ${torsoY + 12} ${100 - torsoW + 6} ${torsoY + 24} L${100 + torsoW - 6} ${torsoY + 24} Q${100 + torsoW + 4} ${torsoY + 12} ${100 + torsoW + 2} ${torsoY - 10} Q100 ${torsoY - 16} ${100 - torsoW - 2} ${torsoY - 10} Z`}
              fill={color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            {/* hood */}
            <path
              d={`M${100 - torsoW} ${torsoY - 10} Q94 ${torsoY - 22} 100 ${torsoY - 24} Q106 ${torsoY - 22} ${100 + torsoW} ${torsoY - 10}`}
              fill={colorDark}
              stroke={OUTLINE}
              strokeWidth={STROKE_W_THIN}
            />
          </>
        )}
        {/* shirt highlight */}
        <path
          d={`M${100 - torsoW + 6} ${torsoY + 4} Q${100 - torsoW + 4} ${torsoY + 24} ${100 - torsoW + 10} ${torsoY + 38}`}
          fill="none"
          stroke={colorLight}
          strokeWidth="1.4"
          opacity="0.4"
        />
      </g>

      {/* arms */}
      <g>
        {flexed ? (
          <>
            {/* left flexed arm */}
            <path
              d={`M${100 - torsoW + 2} ${torsoY - 4} Q${68} ${torsoY + 6} ${56} ${torsoY - 14} Q${52} ${torsoY - 26} ${64} ${torsoY - 30} Q${78} ${torsoY - 26} ${100 - torsoW + 6} ${torsoY - 8} Z`}
              fill={skin}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            {/* right flexed arm */}
            <path
              d={`M${100 + torsoW - 2} ${torsoY - 4} Q${132} ${torsoY + 6} ${144} ${torsoY - 14} Q${148} ${torsoY - 26} ${136} ${torsoY - 30} Q${122} ${torsoY - 26} ${100 + torsoW - 6} ${torsoY - 8} Z`}
              fill={skin}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            {/* fists */}
            <circle cx="58" cy={torsoY - 22} r="7" fill={skin} stroke={OUTLINE} strokeWidth={STROKE_W} />
            <circle cx="142" cy={torsoY - 22} r="7" fill={skin} stroke={OUTLINE} strokeWidth={STROKE_W} />
            <path d="M55 174 q3 -2 6 0" fill="none" stroke={OUTLINE} strokeWidth="1" />
            <path d="M139 174 q3 -2 6 0" fill="none" stroke={OUTLINE} strokeWidth="1" />
          </>
        ) : (
          <>
            {/* left straight arm */}
            <path
              d={`M${100 - torsoW + 2} ${torsoY - 4} Q${100 - torsoW - 6} ${torsoY + 22} ${100 - torsoW - 4} ${torsoY + 50} Q${100 - torsoW + 4} ${torsoY + 54} ${100 - torsoW + 8} ${torsoY + 48} Q${100 - torsoW + 6} ${torsoY + 24} ${100 - torsoW + 10} ${torsoY - 2} Z`}
              fill={top === 'tank' || top === 'crop' ? skin : color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            {/* right straight arm */}
            <path
              d={`M${100 + torsoW - 2} ${torsoY - 4} Q${100 + torsoW + 6} ${torsoY + 22} ${100 + torsoW + 4} ${torsoY + 50} Q${100 + torsoW - 4} ${torsoY + 54} ${100 + torsoW - 8} ${torsoY + 48} Q${100 + torsoW - 6} ${torsoY + 24} ${100 + torsoW - 10} ${torsoY - 2} Z`}
              fill={top === 'tank' || top === 'crop' ? skin : color}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            {/* hands */}
            <circle cx={100 - torsoW + 2} cy={torsoY + 56} r="6" fill={skin} stroke={OUTLINE} strokeWidth={STROKE_W} />
            <circle cx={100 + torsoW - 2} cy={torsoY + 56} r="6" fill={skin} stroke={OUTLINE} strokeWidth={STROKE_W} />
          </>
        )}
      </g>

      {/* watch */}
      {config.accessories.includes('watch') && !flexed && (
        <g>
          <rect
            x={100 - torsoW + 0}
            y={torsoY + 44}
            width="10"
            height="6"
            rx="1.5"
            fill={OUTLINE}
            stroke={OUTLINE}
            strokeWidth={STROKE_W_THIN}
          />
          <rect
            x={100 - torsoW + 2}
            y={torsoY + 45}
            width="6"
            height="4"
            rx="0.8"
            fill={config.outfitColor}
          />
        </g>
      )}

      {/* tiny shading on torso */}
      {config.bodyType !== 'slim' && top === 'tank' && (
        <line
          x1="100"
          y1={torsoY + 8}
          x2="100"
          y2={torsoY + 36}
          stroke={skinShade}
          strokeWidth="1"
          opacity={0.35 + m * 0.05}
        />
      )}
    </>
  );
}

// ─── Head / Face ──────────────────────────────────────────────
// Bitmoji-style: huge round head dominates
export function Head({ ctx }: { ctx: RenderCtx }) {
  const { config, skin } = ctx;

  const bodyToJaw: Record<BodyType, number> = {
    slim: 40,
    athletic: 42,
    muscular: 44,
    bulky: 46,
  };
  const r = bodyToJaw[config.bodyType];

  const tilted = config.pose === 'sleeping';

  return (
    <g transform={tilted ? 'rotate(-10 100 90)' : undefined}>
      {/* neck (small) */}
      <path
        d={`M${94} ${130} L${94} ${146} Q100 ${150} ${106} ${146} L${106} ${130} Z`}
        fill={skin}
        stroke={OUTLINE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* face — round chibi shape */}
      <path
        d={`M${100 - r} 90 Q${100 - r} ${90 + r * 1.05} ${100 - r * 0.55} ${90 + r * 1.18} Q100 ${90 + r * 1.28} ${100 + r * 0.55} ${90 + r * 1.18} Q${100 + r} ${90 + r * 1.05} ${100 + r} 90 Q${100 + r} ${90 - r * 1.05} 100 ${90 - r * 1.05} Q${100 - r} ${90 - r * 1.05} ${100 - r} 90 Z`}
        fill={skin}
        stroke={OUTLINE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* ears */}
      <path
        d={`M${100 - r + 2} 92 Q${100 - r - 5} 92 ${100 - r - 6} 100 Q${100 - r - 5} 108 ${100 - r + 1} 106`}
        fill={skin}
        stroke={OUTLINE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      <path
        d={`M${100 + r - 2} 92 Q${100 + r + 5} 92 ${100 + r + 6} 100 Q${100 + r + 5} 108 ${100 + r - 1} 106`}
        fill={skin}
        stroke={OUTLINE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      {/* cheek blush */}
      <ellipse cx="78" cy="112" rx="6" ry="3.5" fill="#FF8FA3" opacity="0.35" />
      <ellipse cx="122" cy="112" rx="6" ry="3.5" fill="#FF8FA3" opacity="0.35" />
      {/* earring */}
      {config.accessories.includes('earring') && (
        <>
          <circle cx={100 - r - 2} cy="108" r="2.2" fill="#FFD86E" stroke={OUTLINE} strokeWidth="0.8" />
          <circle cx={100 + r + 2} cy="108" r="2.2" fill="#FFD86E" stroke={OUTLINE} strokeWidth="0.8" />
        </>
      )}
    </g>
  );
}

// ─── Eyebrows (above big eyes) ────────────────────────────────
export function Eyebrows({ ctx }: { ctx: RenderCtx }) {
  const c = darken(ctx.config.hairColor, 0.85);
  switch (ctx.config.eyebrow) {
    case 'thick':
      return (
        <g fill={c} stroke={c} strokeWidth="0.5">
          <path d="M76 88 Q84 84 94 88 Q94 92 84 91 Q78 91 76 90 Z" />
          <path d="M124 88 Q116 84 106 88 Q106 92 116 91 Q122 91 124 90 Z" />
        </g>
      );
    case 'thin':
      return (
        <g stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M78 90 Q84 86 92 89" />
          <path d="M122 90 Q116 86 108 89" />
        </g>
      );
    case 'arched':
      return (
        <g stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M77 91 Q84 84 93 89" />
          <path d="M123 91 Q116 84 107 89" />
        </g>
      );
    default:
      return (
        <g fill={c} stroke={c} strokeWidth="0.4">
          <path d="M77 90 Q84 86 93 89 Q93 92 84 91 Q79 91 77 91 Z" />
          <path d="M123 90 Q116 86 107 89 Q107 92 116 91 Q121 91 123 91 Z" />
        </g>
      );
  }
}

// ─── Eyes — big round Bitmoji style ────────────────────────────
export function Eyes({ ctx }: { ctx: RenderCtx }) {
  const c = ctx.config.eyeColor;
  const closed = ctx.config.pose === 'sleeping';

  if (closed) {
    return (
      <g stroke={OUTLINE} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M76 100 Q84 105 92 100" />
        <path d="M108 100 Q116 105 124 100" />
        {/* eyelashes */}
        <path d="M75 98 L73 96" />
        <path d="M125 98 L127 96" />
      </g>
    );
  }

  const shapeMap = {
    narrow: { rx: 5, ry: 3 },
    wide: { rx: 6.5, ry: 6 },
    round: { rx: 6, ry: 6 },
    almond: { rx: 6, ry: 5 },
  } as const;
  const { rx, ry } = shapeMap[ctx.config.eyeShape as keyof typeof shapeMap] ?? shapeMap.almond;

  return (
    <g>
      {/* whites with bold outline */}
      <ellipse cx="84" cy="102" rx={rx} ry={ry} fill="#fff" stroke={OUTLINE} strokeWidth={STROKE_W} />
      <ellipse cx="116" cy="102" rx={rx} ry={ry} fill="#fff" stroke={OUTLINE} strokeWidth={STROKE_W} />
      {/* iris */}
      <circle cx="84" cy="102" r={Math.min(ry, rx) * 0.65} fill={c} />
      <circle cx="116" cy="102" r={Math.min(ry, rx) * 0.65} fill={c} />
      {/* pupil */}
      <circle cx="84" cy="102" r={Math.min(ry, rx) * 0.4} fill={OUTLINE} />
      <circle cx="116" cy="102" r={Math.min(ry, rx) * 0.4} fill={OUTLINE} />
      {/* highlights */}
      <circle cx="86" cy="100" r="1.4" fill="#fff" />
      <circle cx="118" cy="100" r="1.4" fill="#fff" />
      <circle cx="82" cy="103.5" r="0.6" fill="#fff" opacity="0.8" />
      <circle cx="114" cy="103.5" r="0.6" fill="#fff" opacity="0.8" />
    </g>
  );
}

// ─── Nose — tiny, cute ────────────────────────────────────────
export function Nose({ ctx }: { ctx: RenderCtx }) {
  switch (ctx.config.nose) {
    case 'wide':
      return (
        <path
          d="M94 116 Q100 122 106 116"
          fill="none"
          stroke={OUTLINE}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      );
    case 'narrow':
      return (
        <path
          d="M99 114 Q100 120 101 114"
          fill="none"
          stroke={OUTLINE}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      );
    case 'rounded':
      return (
        <ellipse cx="100" cy="118" rx="2.4" ry="1.8" fill={ctx.skinShade} stroke={OUTLINE} strokeWidth="1" />
      );
    default:
      return (
        <path
          d="M97 114 Q100 120 103 114"
          fill="none"
          stroke={OUTLINE}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      );
  }
}

// ─── Mouth ────────────────────────────────────────────────────
export function Mouth({ ctx }: { ctx: RenderCtx }) {
  const eating = ctx.config.pose === 'eating';
  if (eating) {
    return (
      <g>
        <ellipse cx="100" cy="128" rx="4" ry="3.2" fill="#5a2820" stroke={OUTLINE} strokeWidth="1.3" />
      </g>
    );
  }
  switch (ctx.config.mouth) {
    case 'neutral':
      return (
        <line
          x1="92"
          y1="128"
          x2="108"
          y2="128"
          stroke={OUTLINE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      );
    case 'smirk':
      return (
        <path
          d="M90 128 Q98 126 108 130"
          fill="none"
          stroke={OUTLINE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      );
    case 'grin':
      return (
        <g>
          <path
            d="M88 124 Q100 137 112 124 Q100 129 88 124 Z"
            fill="#5a2820"
            stroke={OUTLINE}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M88 126 Q100 128 112 126" stroke="#fff" strokeWidth="1.4" fill="none" />
        </g>
      );
    default: // smile
      return (
        <g>
          <path
            d="M90 124 Q100 134 110 124"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M93 126 Q100 130 107 126"
            fill="#FF8FA3"
            opacity="0.5"
            stroke="none"
          />
        </g>
      );
  }
}

// ─── Facial hair ──────────────────────────────────────────────
export function FacialHair({ ctx }: { ctx: RenderCtx }) {
  const c = darken(ctx.config.hairColor, 0.85);
  switch (ctx.config.facialHair) {
    case 'stubble':
      return (
        <g fill={c} opacity="0.4">
          {Array.from({ length: 28 }).map((_, i) => (
            <circle
              key={i}
              cx={80 + (i % 7) * 6 + (Math.floor(i / 7) % 2) * 3}
              cy={130 + Math.floor(i / 7) * 4}
              r="0.7"
            />
          ))}
        </g>
      );
    case 'mustache':
      return (
        <path
          d="M88 124 Q94 120 100 124 Q106 120 112 124 Q106 127 100 126 Q94 127 88 124 Z"
          fill={c}
          stroke={OUTLINE}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      );
    case 'goatee':
      return (
        <g stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round">
          <path
            d="M88 124 Q94 120 100 124 Q106 120 112 124 Q106 127 100 126 Q94 127 88 124 Z"
            fill={c}
          />
          <path
            d="M93 134 Q100 144 107 134 Q104 140 100 140 Q96 140 93 134 Z"
            fill={c}
          />
        </g>
      );
    case 'beard':
      return (
        <path
          d="M76 116 Q74 138 100 146 Q126 138 124 116 Q120 130 110 130 Q106 124 100 126 Q94 124 90 130 Q80 130 76 116 Z"
          fill={c}
          stroke={OUTLINE}
          strokeWidth={STROKE_W}
          strokeLinejoin="round"
        />
      );
    case 'circle':
      return (
        <g fill={c} stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round">
          <path d="M88 124 Q94 120 100 124 Q106 120 112 124 Q106 127 100 126 Q94 127 88 124 Z" />
          <ellipse cx="100" cy="135" rx="8" ry="5" />
        </g>
      );
    default:
      return null;
  }
}

// ─── Hair (back layer) ────────────────────────────────────────
export function HairBack({ ctx }: { ctx: RenderCtx }) {
  const c = ctx.config.hairColor;
  switch (ctx.config.hairStyle) {
    case 'long':
      return (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path
            d="M58 90 Q52 130 60 156 L72 156 Q68 124 70 90 Z"
            fill={c}
          />
          <path
            d="M142 90 Q148 130 140 156 L128 156 Q132 124 130 90 Z"
            fill={c}
          />
        </g>
      );
    case 'manbun':
      return (
        <circle cx="100" cy="50" r="11" fill={c} stroke={OUTLINE} strokeWidth={STROKE_W} />
      );
    case 'bun':
      return (
        <circle cx="100" cy="48" r="10" fill={c} stroke={OUTLINE} strokeWidth={STROKE_W} />
      );
    default:
      return null;
  }
}

// ─── Hair (front layer) — bold caps ───────────────────────────
export function HairFront({ ctx }: { ctx: RenderCtx }) {
  const c = ctx.config.hairColor;
  const cD = darken(c, 0.7);
  switch (ctx.config.hairStyle) {
    case 'bald':
      return null;
    case 'short':
      return (
        <g>
          <path
            d="M62 88 Q66 56 100 56 Q134 56 138 88 Q132 70 100 66 Q68 70 62 88 Z"
            fill={c}
            stroke={OUTLINE}
            strokeWidth={STROKE_W}
            strokeLinejoin="round"
          />
          <path d="M76 70 Q88 64 100 66" fill="none" stroke={cD} strokeWidth="1.4" />
        </g>
      );
    case 'medium':
      return (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path
            d="M58 92 Q60 50 100 48 Q140 50 142 92 Q136 70 100 66 Q64 70 58 92 Z"
            fill={c}
          />
          <path d="M58 88 Q66 96 74 92 L74 88 Q66 86 58 88 Z" fill={c} />
          <path d="M142 88 Q134 96 126 92 L126 88 Q134 86 142 88 Z" fill={c} />
          <path d="M70 70 Q90 60 110 66" fill="none" stroke={cD} strokeWidth="1.4" />
        </g>
      );
    case 'long':
      return (
        <path
          d="M56 96 Q58 46 100 44 Q142 46 144 96 Q140 70 100 64 Q60 70 56 96 Z"
          fill={c}
          stroke={OUTLINE}
          strokeWidth={STROKE_W}
          strokeLinejoin="round"
        />
      );
    case 'bun':
      return (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path
            d="M64 78 Q70 60 100 58 Q130 60 136 78 Q130 70 100 68 Q70 70 64 78 Z"
            fill={c}
          />
          <path d="M82 64 Q100 56 118 64" fill="none" stroke={cD} strokeWidth="1.2" />
        </g>
      );
    case 'mohawk':
      return (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path
            d="M90 30 L92 80 L108 80 L110 30 Q100 22 90 30 Z"
            fill={c}
          />
          <path d="M62 80 Q70 76 88 78 L88 84 Q72 82 62 84 Z" fill={c} opacity="0.6" />
          <path d="M138 80 Q130 76 112 78 L112 84 Q128 82 138 84 Z" fill={c} opacity="0.6" />
        </g>
      );
    case 'fade':
      return (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path
            d="M68 76 Q72 56 100 54 Q128 56 132 76 Q126 64 100 62 Q74 64 68 76 Z"
            fill={c}
          />
          <path d="M62 80 Q72 86 84 84" fill={c} opacity="0.5" />
          <path d="M138 80 Q128 86 116 84" fill={c} opacity="0.5" />
        </g>
      );
    case 'curly':
      return (
        <g fill={c} stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <circle cx="68" cy="74" r="9" />
          <circle cx="80" cy="58" r="11" />
          <circle cx="100" cy="50" r="12" />
          <circle cx="120" cy="58" r="11" />
          <circle cx="132" cy="74" r="9" />
          <circle cx="62" cy="88" r="7" />
          <circle cx="138" cy="88" r="7" />
        </g>
      );
    case 'wavy':
      return (
        <path
          d="M58 90 Q62 50 80 54 Q90 42 100 54 Q110 42 120 54 Q138 50 142 90 Q138 70 100 66 Q62 70 58 90 Z"
          fill={c}
          stroke={OUTLINE}
          strokeWidth={STROKE_W}
          strokeLinejoin="round"
        />
      );
    case 'undercut':
      return (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path
            d="M68 70 Q72 42 100 40 Q128 42 132 70 Q128 60 100 58 Q72 60 68 70 Z"
            fill={c}
          />
          <rect x="68" y="70" width="64" height="6" fill={cD} opacity="0.55" />
        </g>
      );
    case 'manbun':
      return (
        <path
          d="M70 80 Q76 62 100 60 Q124 62 130 80 Q124 70 100 68 Q76 70 70 80 Z"
          fill={c}
          stroke={OUTLINE}
          strokeWidth={STROKE_W}
          strokeLinejoin="round"
        />
      );
    case 'pompadour':
      return (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path
            d="M64 84 Q66 36 100 34 Q134 36 136 84 Q130 56 100 56 Q70 56 64 84 Z"
            fill={c}
          />
          <path d="M76 56 Q92 22 116 48" fill={c} />
        </g>
      );
    default:
      return null;
  }
}

// ─── Accessories on face/head ─────────────────────────────────
export function FaceAccessories({ ctx }: { ctx: RenderCtx }) {
  const acc = ctx.config.accessories;
  const c = ctx.config.outfitColor;
  const cD = darken(c, 0.75);
  return (
    <>
      {acc.includes('headband') && (
        <g>
          <rect
            x="60"
            y="84"
            width="80"
            height="8"
            rx="2"
            fill={c}
            stroke={OUTLINE}
            strokeWidth={STROKE_W_THIN}
          />
          <line x1="100" y1="84" x2="100" y2="92" stroke={cD} strokeWidth="1.2" />
        </g>
      )}
      {acc.includes('cap') && (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path d="M62 86 Q66 50 100 50 Q134 50 138 86 Z" fill={c} />
          <path d="M62 86 Q50 92 42 102 L70 96 Z" fill={cD} />
          <circle cx="100" cy="60" r="3" fill="#fff" opacity="0.4" />
        </g>
      )}
      {acc.includes('beanie') && (
        <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
          <path d="M58 88 Q56 44 100 38 Q144 44 142 88 Z" fill={c} />
          <rect x="58" y="82" width="84" height="8" fill={cD} />
          <circle cx="100" cy="32" r="4" fill={cD} />
          <line x1="62" y1="56" x2="62" y2="78" stroke={cD} strokeWidth="1.2" />
          <line x1="138" y1="56" x2="138" y2="78" stroke={cD} strokeWidth="1.2" />
        </g>
      )}
      {acc.includes('sunglasses') && (
        <g stroke={OUTLINE} strokeWidth={STROKE_W}>
          <rect x="74" y="96" width="20" height="12" rx="3" fill="#1a1a1a" />
          <rect x="106" y="96" width="20" height="12" rx="3" fill="#1a1a1a" />
          <line x1="94" y1="102" x2="106" y2="102" />
          <rect x="76" y="98" width="8" height="3" rx="1" fill={c} opacity="0.85" />
          <rect x="108" y="98" width="8" height="3" rx="1" fill={c} opacity="0.85" />
        </g>
      )}
      {acc.includes('glasses') && (
        <g fill="none" stroke={OUTLINE} strokeWidth={STROKE_W}>
          <rect x="74" y="96" width="20" height="13" rx="3" />
          <rect x="106" y="96" width="20" height="13" rx="3" />
          <line x1="94" y1="102" x2="106" y2="102" />
          <line x1="74" y1="100" x2="68" y2="98" />
          <line x1="126" y1="100" x2="132" y2="98" />
        </g>
      )}
    </>
  );
}

// ─── Pose props (dumbbell, fork, zzz, confetti) ───────────────
export function PoseProps({ ctx }: { ctx: RenderCtx }) {
  const { config } = ctx;
  if (config.pose === 'workout') {
    return (
      <g stroke={OUTLINE} strokeWidth={STROKE_W} strokeLinejoin="round">
        {/* left dumbbell */}
        <rect x="50" y="146" width="14" height="6" rx="1" fill="#3a3a3a" />
        <rect x="46" y="142" width="6" height="14" rx="1" fill="#1a1a1a" />
        <rect x="62" y="142" width="6" height="14" rx="1" fill="#1a1a1a" />
        {/* right dumbbell */}
        <rect x="136" y="146" width="14" height="6" rx="1" fill="#3a3a3a" />
        <rect x="132" y="142" width="6" height="14" rx="1" fill="#1a1a1a" />
        <rect x="148" y="142" width="6" height="14" rx="1" fill="#1a1a1a" />
      </g>
    );
  }
  if (config.pose === 'eating') {
    return (
      <g>
        {/* fork */}
        <line x1="62" y1="200" x2="55" y2="225" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M52 226 L58 226 M53 222 L57 222"
          stroke={OUTLINE}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* plate */}
        <ellipse cx="100" cy="240" rx="26" ry="6" fill="#fff" stroke={OUTLINE} strokeWidth={STROKE_W} />
        <circle cx="100" cy="237" r="5" fill="#FF8A3D" stroke={OUTLINE} strokeWidth="1" />
      </g>
    );
  }
  if (config.pose === 'sleeping') {
    return (
      <g
        fill="#fff"
        stroke={OUTLINE}
        strokeWidth="1"
        fontFamily="ui-monospace, monospace"
        fontWeight="800"
        opacity="0.85"
      >
        <text x="148" y="56" fontSize="14">
          z
        </text>
        <text x="158" y="42" fontSize="18">
          Z
        </text>
        <text x="170" y="26" fontSize="22">
          Z
        </text>
      </g>
    );
  }
  if (config.pose === 'celebrating') {
    return (
      <g stroke={OUTLINE} strokeWidth="0.8">
        {[
          [50, 36, '#FFD86E'],
          [148, 32, '#FF8A3D'],
          [76, 18, '#5EEAD4'],
          [124, 18, '#A78BFA'],
          [38, 60, '#C8FF3D'],
          [162, 64, '#F472B6'],
        ].map(([x, y, c], i) => (
          <g key={i}>
            <circle cx={x as number} cy={y as number} r="3" fill={c as string} />
            <line
              x1={(x as number) - 4}
              y1={(y as number) - 4}
              x2={(x as number) + 4}
              y2={(y as number) + 4}
              stroke={c as string}
              strokeWidth="1.5"
            />
          </g>
        ))}
      </g>
    );
  }
  return null;
}

// ─── Background ───────────────────────────────────────────────
export function AvatarBackground({ ctx }: { ctx: RenderCtx }) {
  const { uid, config } = ctx;
  switch (config.background) {
    case 'gym':
      return (
        <g>
          <rect width="200" height="280" fill="#161A22" />
          <rect x="0" y="180" width="200" height="100" fill="#1F242E" />
          <rect x="20" y="160" width="40" height="20" fill="#2A2F3A" stroke={OUTLINE} strokeWidth="0.5" />
          <rect x="140" y="160" width="40" height="20" fill="#2A2F3A" stroke={OUTLINE} strokeWidth="0.5" />
          <line x1="0" y1="180" x2="200" y2="180" stroke="#3A3F4A" strokeWidth="1" />
        </g>
      );
    case 'beach':
      return (
        <g>
          <rect width="200" height="180" fill="#7DD3FC" />
          <rect y="180" width="200" height="100" fill="#FBE7A1" />
          <circle cx="160" cy="50" r="22" fill="#FFD86E" stroke={OUTLINE} strokeWidth="1" />
          <path d="M0 180 Q50 175 100 180 Q150 175 200 180" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.8" />
        </g>
      );
    case 'mountain':
      return (
        <g>
          <rect width="200" height="280" fill="#1E2A3F" />
          <polygon
            points="0,180 60,90 120,160 180,80 200,180 200,280 0,280"
            fill="#3F5A7A"
            stroke={OUTLINE}
            strokeWidth="0.6"
          />
          <polygon points="40,160 80,110 120,160" fill="#fff" opacity="0.7" />
          <polygon points="140,140 170,90 200,160" fill="#fff" opacity="0.7" />
        </g>
      );
    case 'studio':
      return (
        <g>
          <defs>
            <radialGradient id={`bg-studio-${uid}`} cx="50%" cy="40%">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" fill={`url(#bg-studio-${uid})`} />
        </g>
      );
    default: // gradient (Aurora)
      return (
        <g>
          <defs>
            <radialGradient id={`bg-grad-${uid}`} cx="50%" cy="40%">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#5EEAD4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#08060F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" fill={`url(#bg-grad-${uid})`} />
        </g>
      );
  }
}

// ─── Helpers ──────────────────────────────────────────────────
function clampHex(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => clampHex(x).toString(16).padStart(2, '0')).join('');
}

export function darken(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * factor, g * factor, b * factor);
}

export function lighten(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * factor, g * factor, b * factor);
}
