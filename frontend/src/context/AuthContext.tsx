import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase';

// Minimal stub that satisfies the User shape for guest mode
const GUEST_USER = { uid: 'guest', displayName: 'Guest', email: null } as unknown as User;

interface AuthContextValue {
  firebaseUser: User | null;
  authLoading: boolean;
  guestMode: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) {
      // Guest mode — treat as always signed in with local profile
      setFirebaseUser(GUEST_USER);
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, user => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  async function signUp(email: string, password: string, displayName: string) {
    if (!firebaseConfigured) return;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
  }

  async function signIn(email: string, password: string) {
    if (!firebaseConfigured) return;
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    if (!firebaseConfigured) return;
    await signInWithPopup(auth, googleProvider);
  }

  async function logOut() {
    if (!firebaseConfigured) return;
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{
      firebaseUser, authLoading,
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
