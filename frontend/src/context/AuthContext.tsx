import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  FirebaseAuthentication,
  User as CapUser,
} from '@capacitor-firebase/authentication';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as WebUser,
} from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

function toAppUser(u: CapUser | WebUser): AppUser {
  return { uid: u.uid, email: u.email ?? null, displayName: u.displayName ?? null };
}

const GUEST: AppUser = { uid: 'guest', email: null, displayName: 'Guest' };

interface AuthContextValue {
  currentUser: AppUser | null;
  authLoading: boolean;
  guestMode: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const isNative = Capacitor.isNativePlatform();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) {
      setCurrentUser(GUEST);
      setAuthLoading(false);
      return;
    }

    if (isNative) {
      // Native: listen via Capacitor plugin
      let mounted = true;
      FirebaseAuthentication.addListener('authStateChange', ({ user }) => {
        if (!mounted) return;
        setCurrentUser(user ? toAppUser(user) : null);
        setAuthLoading(false);
      });
      // Get current user immediately in case already signed in
      FirebaseAuthentication.getCurrentUser().then(({ user }) => {
        if (!mounted) return;
        setCurrentUser(user ? toAppUser(user) : null);
        setAuthLoading(false);
      }).catch(() => setAuthLoading(false));
      return () => { mounted = false; };
    } else {
      // Web: use Firebase JS SDK
      const unsub = onAuthStateChanged(auth, user => {
        setCurrentUser(user ? toAppUser(user) : null);
        setAuthLoading(false);
      });
      return unsub;
    }
  }, []);

  async function signUp(email: string, password: string, displayName: string) {
    if (!firebaseConfigured) return;
    if (isNative) {
      await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password });
      // updateProfile and sendEmailVerification are nice-to-have — never block account creation
      try {
        await FirebaseAuthentication.updateProfile({ displayName });
      } catch (e) {
        console.warn('[auth] updateProfile failed (non-fatal):', e);
      }
      try {
        await FirebaseAuthentication.sendEmailVerification();
      } catch (e) {
        console.warn('[auth] sendEmailVerification failed (non-fatal):', e);
      }
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await updateProfile(cred.user, { displayName });
      } catch (e) {
        console.warn('[auth] updateProfile failed (non-fatal):', e);
      }
      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('[auth] sendEmailVerification failed (non-fatal):', e);
      }
    }
  }

  async function signIn(email: string, password: string) {
    if (!firebaseConfigured) return;
    if (isNative) {
      await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  }

  async function signInWithGoogle() {
    if (!firebaseConfigured) return;
    if (isNative) {
      await FirebaseAuthentication.signInWithGoogle();
    } else {
      await signInWithPopup(auth, new GoogleAuthProvider());
    }
  }

  async function logOut() {
    if (!firebaseConfigured) return;
    if (isNative) {
      await FirebaseAuthentication.signOut();
    } else {
      await signOut(auth);
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser, authLoading,
      guestMode: !firebaseConfigured,
      signUp, signIn, signInWithGoogle, logOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
