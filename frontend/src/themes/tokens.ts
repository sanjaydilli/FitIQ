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

// Light, clean, clinical — white cards on soft gray, one strong accent.
export const themes: Record<ThemeId, ThemeTokens> = {
  aurora: {
    id: 'aurora',
    name: 'Pearl',
    tagline: 'Clean & clinical · deep teal',
    bg: '#F4F6F8',
    bg2: '#EAF4F2',
    bg3: '#DDF0EC',
    card: '#FFFFFF',
    cardHi: '#F1F5F6',
    cardBorder: 'rgba(15,23,42,0.08)',
    text: '#0F172A',
    textDim: 'rgba(15,23,42,0.64)',
    textMute: 'rgba(15,23,42,0.42)',
    accent: '#0E9384',
    accent2: '#14B8A6',
    warn: '#D97706',
    danger: '#DC2626',
    good: '#16A34A',
    font: '"Inter", -apple-system, system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", "JetBrains Mono", monospace',
    radius: 20,
    radiusSm: 12,
    onAccent: '#FFFFFF',
  },
  graphite: {
    id: 'graphite',
    name: 'Slate',
    tagline: 'Crisp & focused · royal blue',
    bg: '#F5F6F8',
    bg2: '#EBF0F8',
    card: '#FFFFFF',
    cardHi: '#F1F4F8',
    cardBorder: 'rgba(15,23,42,0.08)',
    borderHi: 'rgba(15,23,42,0.14)',
    text: '#101828',
    textDim: 'rgba(16,24,40,0.64)',
    textMute: 'rgba(16,24,40,0.42)',
    accent: '#2563EB',
    accent2: '#4F46E5',
    warn: '#D97706',
    danger: '#DC2626',
    good: '#16A34A',
    font: '"Inter", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
    radius: 14,
    radiusSm: 9,
    onAccent: '#FFFFFF',
  },
  neon: {
    id: 'neon',
    name: 'Coral',
    tagline: 'Warm & energetic · saffron',
    bg: '#F7F5F2',
    bg2: '#F8EFE7',
    card: '#FFFFFF',
    cardHi: '#F6F1EB',
    cardBorder: 'rgba(41,27,12,0.09)',
    text: '#1C1410',
    textDim: 'rgba(28,20,16,0.64)',
    textMute: 'rgba(28,20,16,0.42)',
    accent: '#EA580C',
    accent2: '#F59E0B',
    warn: '#D97706',
    danger: '#DC2626',
    good: '#16A34A',
    font: '"Space Grotesk", "Inter", -apple-system, system-ui, sans-serif',
    display: '"Space Grotesk", "Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
    radius: 16,
    radiusSm: 8,
    onAccent: '#FFFFFF',
  },
};

export const themeOrder: ThemeId[] = ['aurora', 'graphite', 'neon'];
