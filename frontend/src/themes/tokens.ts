export type ThemeId = 'aurora' | 'graphite' | 'neon';

export interface ThemeTokens {
  id: ThemeId;
  name: string;
  tagline: string;
  bg: string;
  bg2: string;
  bg3?: string;
  card: string;
  cardHi: string;
  cardBorder: string;
  borderHi?: string;
  text: string;
  textDim: string;
  textMute: string;
  accent: string;
  accent2: string;
  warn: string;
  danger: string;
  good?: string;
  font: string;
  display?: string;
  mono: string;
  radius: number;
  radiusSm: number;
  onAccent: string;
}

export const themes: Record<ThemeId, ThemeTokens> = {
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Glassmorphism · electric mint',
    bg: '#08060F',
    bg2: '#1A0E2E',
    bg3: '#2D1654',
    card: 'rgba(255,255,255,0.04)',
    cardHi: 'rgba(255,255,255,0.07)',
    cardBorder: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    textDim: 'rgba(255,255,255,0.6)',
    textMute: 'rgba(255,255,255,0.4)',
    accent: '#5EEAD4',
    accent2: '#A78BFA',
    warn: '#FBBF24',
    danger: '#F87171',
    good: '#5EEAD4',
    font: '"Inter", -apple-system, system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", "JetBrains Mono", monospace',
    radius: 22,
    radiusSm: 14,
    onAccent: '#0a0612',
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    tagline: 'Linear-inspired · electric blue',
    bg: '#0A0B0D',
    bg2: '#111316',
    card: '#15171B',
    cardHi: '#1B1E24',
    cardBorder: '#22262E',
    borderHi: '#2D3138',
    text: '#E8EAED',
    textDim: '#8B92A0',
    textMute: '#5C6371',
    accent: '#5B8DEF',
    accent2: '#7C5BEF',
    warn: '#F5A524',
    danger: '#F75555',
    good: '#3FCF8E',
    font: '"Inter", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
    radius: 12,
    radiusSm: 8,
    onAccent: '#0A0B0D',
  },
  neon: {
    id: 'neon',
    name: 'Neon Saffron',
    tagline: 'Brutalist · acid green + saffron',
    bg: '#050505',
    bg2: '#0E0E0E',
    card: '#101010',
    cardHi: '#171717',
    cardBorder: '#1F1F1F',
    text: '#F5F5F2',
    textDim: '#9B9B96',
    textMute: '#5C5C58',
    accent: '#C8FF3D',
    accent2: '#FF8A3D',
    warn: '#FF8A3D',
    danger: '#FF4D6A',
    good: '#C8FF3D',
    font: '"Space Grotesk", "Inter", -apple-system, system-ui, sans-serif',
    display: '"Space Grotesk", "Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
    radius: 16,
    radiusSm: 6,
    onAccent: '#000000',
  },
};

export const themeOrder: ThemeId[] = ['aurora', 'graphite', 'neon'];
