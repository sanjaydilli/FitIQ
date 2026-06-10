import React, { memo } from 'react';
import {
  Flame, Zap, Heart, Activity, Target, Dumbbell, Utensils, Soup,
  Brain, PersonStanding, BicepsFlexed, Footprints, Weight, Trophy,
  Medal, Star, Award, ChevronRight, ChevronLeft, Check, Plus, X,
  LogOut, Play, User, Settings as SettingsIcon, Bell, CalendarDays,
  Timer, History as HistoryIcon, BarChart3, Leaf, Moon, Sun, Sunrise,
  Droplets, Gift, Home,
  type LucideIcon,
} from 'lucide-react';

export type IconName =
  | 'flame' | 'dumbbell' | 'barbell' | 'utensils' | 'brain'
  | 'calendar' | 'trophy' | 'lightning' | 'chart' | 'person'
  | 'scale' | 'heart' | 'run' | 'medal' | 'star' | 'settings'
  | 'moon' | 'sun' | 'sunrise' | 'timer' | 'check' | 'plus'
  | 'chevron-right' | 'chevron-left' | 'play' | 'history'
  | 'body' | 'leaf' | 'activity' | 'target' | 'water'
  | 'bell' | 'badge' | 'muscle' | 'legs' | 'back'
  | 'wrap' | 'food' | 'close' | 'streak' | 'logout' | 'home';

// Professionally drawn 24px-grid icons from Lucide.
const LUCIDE: Partial<Record<IconName, LucideIcon>> = {
  flame: Flame,
  streak: Zap,
  lightning: Zap,
  heart: Heart,
  activity: Activity,
  target: Target,
  dumbbell: Dumbbell,
  utensils: Utensils,
  food: Soup,
  brain: Brain,
  body: PersonStanding,
  muscle: BicepsFlexed,
  run: Footprints,
  scale: Weight,
  trophy: Trophy,
  medal: Medal,
  star: Star,
  badge: Award,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  check: Check,
  plus: Plus,
  close: X,
  logout: LogOut,
  play: Play,
  person: User,
  settings: SettingsIcon,
  bell: Bell,
  calendar: CalendarDays,
  timer: Timer,
  history: HistoryIcon,
  chart: BarChart3,
  leaf: Leaf,
  moon: Moon,
  sun: Sun,
  sunrise: Sunrise,
  water: Droplets,
  wrap: Gift,
  home: Home,
};

// Domain-specific icons Lucide doesn't have — kept as custom paths,
// redrawn to sit cleanly on the same 24px grid.
const CUSTOM_PATHS: Partial<Record<IconName, string[]>> = {
  // Olympic barbell: bar + inner & outer plates each side
  barbell: [
    'M9 12h6',
    'M2.5 10.5h1.5v3H2.5z',
    'M20 10.5h1.5v3H20z',
    'M5.5 8.5H8v7H5.5z',
    'M16 8.5h2.5v7H16z',
  ],
  // Legs: two strong strides with a hip line
  legs: [
    'M9.5 3v8.2L6 20.5',
    'M14.5 3v8.2l3.5 9.3',
    'M8 11.5h8',
  ],
  // Back muscles: trapezius silhouette
  back: [
    'M12 3c2.8 0 5 2.2 5 5l-1 4.5c-.4 1.8-1 3.5-4 3.5s-3.6-1.7-4-3.5L7 8c0-2.8 2.2-5 5-5z',
    'M12 16v5',
    'M9 19l3 2.5 3-2.5',
  ],
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Icon = memo(function Icon({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.8,
  style,
}: IconProps) {
  const Lucide = LUCIDE[name];
  if (Lucide) {
    return (
      <Lucide
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        style={style}
        absoluteStrokeWidth={false}
      />
    );
  }

  const paths = CUSTOM_PATHS[name] ?? [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
});
