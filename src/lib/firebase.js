import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const PRODUCTION_AUTH_DOMAIN = 'organizador-tareas-gemb.vercel.app';
const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : '';
const configuredAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const authDomain = import.meta.env.PROD && runtimeHost === PRODUCTION_AUTH_DOMAIN
  ? PRODUCTION_AUTH_DOMAIN
  : configuredAuthDomain || (import.meta.env.PROD ? PRODUCTION_AUTH_DOMAIN : undefined);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const missingConfigKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key]);
let firebaseConfigReady = missingConfigKeys.length === 0;

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (firebaseConfigReady) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  } catch {
    firebaseConfigReady = false;
    app = null;
    auth = null;
    db = null;
    googleProvider = null;
    console.error('Firebase config could not be initialized. Check VITE_FIREBASE_* environment variables.');
  }
} else {
  console.error('Firebase config is incomplete. Check VITE_FIREBASE_* environment variables.');
}

export { app, auth, db, googleProvider, firebaseConfigReady };
