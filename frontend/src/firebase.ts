import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || 'AIzaSyC5PZvtow3hqOFXnO__YlwnCEWFKHbcraY',
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || 'fitiq-dc897.firebaseapp.com',
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || 'fitiq-dc897',
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || 'fitiq-dc897.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '379914270405',
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || '1:379914270405:android:fff562afc807981cda22ac',
};

export const firebaseConfigured = true;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
