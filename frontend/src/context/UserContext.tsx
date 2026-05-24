import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
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
  waterDate: string;
  avatar: AvatarConfig;
  isPremium: boolean;
}

interface UserContextValue {
  user: UserState;
  update: (patch: Partial<UserState>) => void;
  setWaterSlot: (slotIndex: number, filled: number) => void;
  setAvatar: (patch: Partial<AvatarConfig>) => void;
  awardXP: (amount: number) => void;
}

const EMPTY_WATER = [0, 0, 0, 0, 0, 0];

const defaultUser: UserState = {
  name: '',
  goal: 'gain',
  sex: 'male',
  heightCm: 170,
  weightKg: 70,
  age: 25,
  diet: 'veg',
  activity: 'moderate',
  streak: 0,
  xp: 0,
  level: 1,
  avatarStage: 1,
  waterDrops: EMPTY_WATER,
  waterDate: '',
  avatar: defaultAvatar,
  isPremium: false,
};

const STORAGE_KEY = 'fitiq.user';

function loadFromStorage(): UserState {
  const today = new Date().toISOString().slice(0, 10);
  if (typeof window === 'undefined') return { ...defaultUser, waterDate: today };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultUser, waterDate: today };
    const parsed = JSON.parse(raw) as Partial<UserState>;
    const isToday = parsed.waterDate === today;
    return {
      ...defaultUser,
      ...parsed,
      waterDrops: isToday ? (parsed.waterDrops ?? EMPTY_WATER) : EMPTY_WATER,
      waterDate: today,
      avatar: { ...defaultAvatar, ...(parsed.avatar ?? {}) },
    };
  } catch {
    return { ...defaultUser, waterDate: today };
  }
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(loadFromStorage);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  // Track logged-in Firebase user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, fbUser => {
      setFirebaseUid(fbUser?.uid ?? null);
      if (fbUser) {
        // Load profile from Firestore on sign-in
        getDoc(doc(db, 'users', fbUser.uid)).then(snap => {
          if (snap.exists()) {
            const data = snap.data() as Partial<UserState>;
            const today = new Date().toISOString().slice(0, 10);
            const isToday = data.waterDate === today;
            setUser({
              ...defaultUser,
              ...data,
              waterDrops: isToday ? (data.waterDrops ?? EMPTY_WATER) : EMPTY_WATER,
              waterDate: today,
              avatar: { ...defaultAvatar, ...(data.avatar ?? {}) },
              name: data.name || fbUser.displayName || '',
            });
          } else if (fbUser.displayName) {
            // New Google sign-in — prefill name
            setUser(u => ({ ...u, name: fbUser.displayName! }));
          }
        }).catch(() => {/* offline — use local state */});
      }
    });
    return unsub;
  }, []);

  // Daily water reset
  useEffect(() => {
    const check = () => {
      const today = new Date().toISOString().slice(0, 10);
      setUser(u => u.waterDate !== today ? { ...u, waterDrops: EMPTY_WATER, waterDate: today } : u);
    };
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, []);

  // Debounced write — localStorage always, Firestore when logged in
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestUser = useRef(user);
  latestUser.current = user;

  useEffect(() => {
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(latestUser.current)); } catch { /* quota */ }
      if (firebaseUid) {
        setDoc(doc(db, 'users', firebaseUid), latestUser.current, { merge: true }).catch(() => {});
      }
    }, 800);
    return () => { if (writeTimer.current) clearTimeout(writeTimer.current); };
  }, [user, firebaseUid]);

  const update = useCallback((patch: Partial<UserState>) => {
    setUser(u => ({ ...u, ...patch }));
  }, []);

  const setWaterSlot = useCallback((slotIndex: number, filled: number) => {
    setUser(u => {
      const next = [...u.waterDrops];
      next[slotIndex] = Math.max(0, Math.min(WATER_SLOT_CAPACITY[slotIndex], filled));
      return { ...u, waterDrops: next };
    });
  }, []);

  const setAvatar = useCallback((patch: Partial<AvatarConfig>) => {
    setUser(u => ({ ...u, avatar: { ...u.avatar, ...patch } }));
  }, []);

  const awardXP = useCallback((amount: number) => {
    setUser(u => {
      const newXP = u.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return { ...u, xp: newXP, level: Math.max(u.level, newLevel) };
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, update, setWaterSlot, setAvatar, awardXP }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
