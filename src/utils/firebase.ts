import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FB_API_KEY,
  authDomain: import.meta.env.VITE_APP_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FB_APP_ID,
  measurementId: import.meta.env.VITE_APP_FB_MEASUREMENT_ID,
};
console.log('firebaseConfig', {firebaseConfig:firebaseConfig});

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
auth.languageCode = navigator.language;

export { auth, firebaseApp };