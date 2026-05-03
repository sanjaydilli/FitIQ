import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AvatarConfig, defaultAvatar } from '../avatar/config';

export type Goal = 'lose' | 'gain' | 'endur' | 'main';
export type Sex = 'male' | 'female';
export type Diet = 'veg' | 'eggetarian' | 'nveg' | 'vegan' | 'jain';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active';

export const WATER_SLOT_HOURS = [6, 9, 12, 15, 18, 21] as const;
export const WATER_SLOT_LABELS = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'] as const;
export const WATER_SLOT_CAPACITY = [2, 2, 3, 2, 3, 2] as const;
export const WATER_DROP_ML = 250;

export interface UserState {
  name: string;
  goal: Goal;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  age: number;
  diet: Diet;
  activity: Activity;
  streak: number;
  xp: number;
  level: number;
  avatarStage: number;
  waterDrops: number[];
  avatar: AvatarConfig;
  isPremium: boolean;
}

interface UserContextValue {
  user: UserState;
  update: (patch: Partial<UserState>) => void;
  setWaterSlot: (slotIndex: number, filled: number) => void;
  setAvatar: (patch: Partial<AvatarConfig>) => void;
}

const defaultUser: UserState = {
  name: 'Arjun',
  goal: 'gain',
  sex: 'male',
  heightCm: 178,
  weightKg: 74.2,
  age: 27,
  diet: 'veg',
  activity: 'moderate',
  streak: 14,
  xp: 4210,
  level: 4,
  avatarStage: 4,
  waterDrops: [2, 2, 2, 1, 0, 0],
  avatar: defaultAvatar,
  isPremium: false,
};

const STORAGE_KEY = 'fitiq.user';

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(() => {
    if (typeof window === 'undefined') return defaultUser;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultUser;
      const parsed = JSON.parse(raw) as Partial<UserState>;
      return {
        ...defaultUser,
        ...parsed,
        avatar: { ...defaultAvatar, ...(parsed.avatar ?? {}) },
      };
    } catch {
      return defaultUser;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore quota errors
    }
  }, [user]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      update: (patch) => setUser((u) => ({ ...u, ...patch })),
      setWaterSlot: (slotIndex, filled) =>
        setUser((u) => {
          const next = [...u.waterDrops];
          const cap = WATER_SLOT_CAPACITY[slotIndex];
          next[slotIndex] = Math.max(0, Math.min(cap, filled));
          return { ...u, waterDrops: next };
        }),
      setAvatar: (patch) =>
        setUser((u) => ({ ...u, avatar: { ...u.avatar, ...patch } })),
    }),
    [user]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
