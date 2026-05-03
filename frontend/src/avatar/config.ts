export type BodyType = 'slim' | 'athletic' | 'muscular' | 'bulky';
export type Pose = 'idle' | 'workout' | 'eating' | 'sleeping' | 'celebrating';

export interface AvatarConfig {
  bodyType: BodyType;
  skinTone: number; // 0..5
  hairStyle: string;
  hairColor: string; // hex
  eyeShape: string;
  eyeColor: string;
  eyebrow: string;
  nose: string;
  mouth: string;
  facialHair: string;
  outfitTop: string;
  outfitBottom: string;
  outfitColor: string;
  accessories: string[];
  background: string;
  pose: Pose;
}

export const skinTones = [
  '#F4D6BA',
  '#E8B894',
  '#D4A07A',
  '#B57F5A',
  '#8C5A3C',
  '#5C3A26',
];

export const skinShades = [
  '#D8B392',
  '#C49575',
  '#A87A55',
  '#8E5F3D',
  '#6E4326',
  '#3F2715',
];

export interface OptionItem {
  id: string;
  label: string;
  premium?: boolean;
}
export interface ColorItem {
  id: string;
  value: string;
  premium?: boolean;
}
export interface AccessoryItem {
  id: string;
  label: string;
  icon: string;
  premium?: boolean;
}

export const hairStyles: OptionItem[] = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'bald', label: 'Bald' },
  { id: 'bun', label: 'Bun' },
  { id: 'mohawk', label: 'Mohawk' },
  { id: 'fade', label: 'Fade' },
  { id: 'curly', label: 'Curly' },
  { id: 'wavy', label: 'Wavy' },
  { id: 'undercut', label: 'Undercut', premium: true },
  { id: 'manbun', label: 'Man Bun', premium: true },
  { id: 'pompadour', label: 'Pompadour', premium: true },
];

export const hairColors: ColorItem[] = [
  { id: 'black', value: '#1a0f08' },
  { id: 'brown', value: '#5A3A24' },
  { id: 'blonde', value: '#D9B97A' },
  { id: 'red', value: '#A14A2A' },
  { id: 'white', value: '#E8E8E8' },
  { id: 'auburn', value: '#7B3A22', premium: true },
  { id: 'platinum', value: '#F2EAD3', premium: true },
];

export const eyeShapes: OptionItem[] = [
  { id: 'round', label: 'Round' },
  { id: 'almond', label: 'Almond' },
  { id: 'narrow', label: 'Narrow' },
  { id: 'wide', label: 'Wide' },
];

export const eyeColors: ColorItem[] = [
  { id: 'brown', value: '#5A3A24' },
  { id: 'black', value: '#1A0F08' },
  { id: 'hazel', value: '#8B6F3D' },
  { id: 'green', value: '#3F7A4F' },
  { id: 'blue', value: '#3F6F9C' },
  { id: 'gray', value: '#5C6D7B', premium: true },
];

export const eyebrows: OptionItem[] = [
  { id: 'natural', label: 'Natural' },
  { id: 'thick', label: 'Thick' },
  { id: 'thin', label: 'Thin' },
  { id: 'arched', label: 'Arched' },
];

export const noses: OptionItem[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'wide', label: 'Wide' },
  { id: 'narrow', label: 'Narrow' },
  { id: 'rounded', label: 'Rounded' },
];

export const mouths: OptionItem[] = [
  { id: 'smile', label: 'Smile' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'smirk', label: 'Smirk' },
  { id: 'grin', label: 'Grin' },
];

export const facialHairOptions: OptionItem[] = [
  { id: 'clean', label: 'Clean' },
  { id: 'stubble', label: 'Stubble' },
  { id: 'goatee', label: 'Goatee' },
  { id: 'mustache', label: 'Mustache' },
  { id: 'beard', label: 'Full Beard' },
  { id: 'circle', label: 'Circle Beard', premium: true },
];

export const outfitTops: OptionItem[] = [
  { id: 'tank', label: 'Tank Top' },
  { id: 'tee', label: 'T-Shirt' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'crop', label: 'Crop Hoodie', premium: true },
];

export const outfitBottoms: OptionItem[] = [
  { id: 'shorts', label: 'Gym Shorts' },
  { id: 'joggers', label: 'Joggers' },
  { id: 'track', label: 'Track Pants' },
  { id: 'tights', label: 'Tights', premium: true },
];

export const outfitColors: ColorItem[] = [
  { id: 'mint', value: '#5EEAD4' },
  { id: 'violet', value: '#A78BFA' },
  { id: 'saffron', value: '#FF8A3D' },
  { id: 'acid', value: '#C8FF3D' },
  { id: 'crimson', value: '#F75555' },
  { id: 'graphite', value: '#22262E' },
  { id: 'ivory', value: '#F5F5F2' },
  { id: 'cobalt', value: '#5B8DEF', premium: true },
];

export const accessoryOptions: AccessoryItem[] = [
  { id: 'sunglasses', label: 'Sunglasses', icon: '🕶️' },
  { id: 'glasses', label: 'Glasses', icon: '👓' },
  { id: 'cap', label: 'Cap', icon: '🧢' },
  { id: 'beanie', label: 'Beanie', icon: '🎩' },
  { id: 'watch', label: 'Watch', icon: '⌚' },
  { id: 'headband', label: 'Headband', icon: '🎽' },
  { id: 'earring', label: 'Earring', icon: '💎', premium: true },
];

export const backgroundOptions: OptionItem[] = [
  { id: 'gradient', label: 'Aurora' },
  { id: 'gym', label: 'Gym' },
  { id: 'beach', label: 'Beach' },
  { id: 'mountain', label: 'Mountain' },
  { id: 'studio', label: 'Studio', premium: true },
];

export const poses: { id: Pose; label: string; icon: string }[] = [
  { id: 'idle', label: 'Idle', icon: '🧍' },
  { id: 'workout', label: 'Workout', icon: '🏋️' },
  { id: 'eating', label: 'Eating', icon: '🍽️' },
  { id: 'sleeping', label: 'Sleeping', icon: '😴' },
  { id: 'celebrating', label: 'Celebrate', icon: '🎉' },
];

export const defaultAvatar: AvatarConfig = {
  bodyType: 'athletic',
  skinTone: 2,
  hairStyle: 'short',
  hairColor: '#1a0f08',
  eyeShape: 'almond',
  eyeColor: '#5A3A24',
  eyebrow: 'natural',
  nose: 'standard',
  mouth: 'smile',
  facialHair: 'stubble',
  outfitTop: 'tank',
  outfitBottom: 'shorts',
  outfitColor: '#5EEAD4',
  accessories: [],
  background: 'gradient',
  pose: 'idle',
};

export const bodyTypes: { id: BodyType; label: string; muscle: number }[] = [
  { id: 'slim', label: 'Slim', muscle: 2 },
  { id: 'athletic', label: 'Athletic', muscle: 4 },
  { id: 'muscular', label: 'Muscular', muscle: 6 },
  { id: 'bulky', label: 'Bulky', muscle: 7 },
];

export function muscleForBody(b: BodyType): number {
  return bodyTypes.find((x) => x.id === b)?.muscle ?? 4;
}
