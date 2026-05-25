import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
 * Firebase App Check — MONITOR MODE.
 *
 * Initialized only in the browser and only when a reCAPTCHA site key is
 * provided (VITE_RECAPTCHA_APPCHECK_KEY). No key → no-op (safe). Attaches an
 * App Check token to Firebase requests so the console can collect verified vs
 * unverified metrics. Enforcement on Auth/Firestore stays OFF (console) — this
 * does NOT block any request. Enabling enforcement is a separate gated step.
 */
if (typeof window !== "undefined") {
  const appCheckKey = import.meta.env.VITE_RECAPTCHA_APPCHECK_KEY as string | undefined;
  if (appCheckKey) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      // Never let App Check init break app boot (monitor mode, non-critical).
      console.warn("[app-check] init skipped:", err);
    }
  }
}

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