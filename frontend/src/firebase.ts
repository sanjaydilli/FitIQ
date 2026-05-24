import { initializeApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || 'YOUR_PROJECT_ID',
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || 'YOUR_APP_ID',
};

export const firebaseConfigured =
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db   = getFirestore(app);
}

export const auth = _auth as Auth;
export const db   = _db   as Firestore;
