import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Analytics is optional.
 * Only initialize it in the browser and only if supported.
 */
let analyticsInstance: Analytics | null = null;

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported) return null;

  if (!analyticsInstance) {
    analyticsInstance = getAnalytics(app);
  }

  return analyticsInstance;
};