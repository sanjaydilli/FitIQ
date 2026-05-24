import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { localDateStr } from '../utils/date';
import { Capacitor } from '@capacitor/core';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, firebaseConfigured } from '../firebase';

const isNative = Capacitor.isNativePlatform();

async function firestoreGet(uid: string): Promise<Record<string, unknown> | null> {
  if (isNative) {
    const { snapshot } = await FirebaseFirestore.getDocument({ reference: `users/${uid}` });
    return snapshot.data ?? null;
  }
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() as Record<string, unknown> : null;
}

async function firestoreSet(uid: string, data: object): Promise<void> {
  if (isNative) {
    await FirebaseFirestore.setDocument({ reference: `users/${uid}`, data, merge: true });
  } else {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  }
}

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
  waterDrops: number[];
  waterDate: string;
  steps: number;
  stepsDate: string;
  stepGoal: number;
  isPremium: boolean;
}

interface UserContextValue {
  user: UserState;
  update: (patch: Partial<UserState>) => void;
  setWaterSlot: (slotIndex: number, filled: number) => void;
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
  waterDrops: EMPTY_WATER,
  waterDate: '',
  steps: 0,
  stepsDate: '',
  stepGoal: 8000,
  isPremium: false,
};

const STORAGE_KEY = 'fitiq.user';

function loadFromStorage(): UserState {
  const today = localDateStr();
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
    };
  } catch {
    return { ...defaultUser, waterDate: today };
  }
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(loadFromStorage);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  // Listen to auth state and load Firestore profile on sign-in
  useEffect(() => {
    if (!firebaseConfigured) return;

    async function onUser(uid: string, displayName?: string | null) {
      setFirebaseUid(uid);
      try {
        const data = await firestoreGet(uid) as Partial<UserState> | null;
        const today = localDateStr();
        if (data) {
          const isToday = data.waterDate === today;
          setUser({
            ...defaultUser, ...data,
            waterDrops: isToday ? (data.waterDrops ?? EMPTY_WATER) : EMPTY_WATER,
            waterDate: today,
            name: data.name || displayName || '',
          });
        } else if (displayName) {
          setUser(u => ({ ...u, name: displayName }));
        }
      } catch { /* offline */ }
    }

    if (isNative) {
      const { FirebaseAuthentication } = require('@capacitor-firebase/authentication');
      let mounted = true;
      FirebaseAuthentication.addListener('authStateChange', ({ user }: { user: { uid: string; displayName?: string } | null }) => {
        if (!mounted) return;
        if (user) onUser(user.uid, user.displayName);
        else setFirebaseUid(null);
      });
      FirebaseAuthentication.getCurrentUser().then(({ user }: { user: { uid: string; displayName?: string } | null }) => {
        if (!mounted || !user) return;
        onUser(user.uid, user.displayName);
      }).catch(() => {});
      return () => { mounted = false; };
    } else {
      const { onAuthStateChanged } = require('firebase/auth');
      const { auth: webAuth } = require('../firebase');
      const unsub = onAuthStateChanged(webAuth, (fbUser: { uid: string; displayName?: string } | null) => {
        if (fbUser) onUser(fbUser.uid, fbUser.displayName);
        else setFirebaseUid(null);
      });
      return unsub;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Daily water + steps reset
  useEffect(() => {
    const check = () => {
      const today = localDateStr();
      setUser(u => ({
        ...u,
        waterDrops: u.waterDate !== today ? EMPTY_WATER : u.waterDrops,
        waterDate: today,
        steps: u.stepsDate !== today ? 0 : u.steps,
        stepsDate: today,
      }));
    };
    check();
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
      if (firebaseConfigured && firebaseUid) {
        firestoreSet(firebaseUid, latestUser.current).catch(() => {});
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

  const awardXP = useCallback((amount: number) => {
    setUser(u => {
      const newXP = u.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return { ...u, xp: newXP, level: Math.max(u.level, newLevel) };
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, update, setWaterSlot, awardXP }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
