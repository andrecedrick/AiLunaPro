import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
// firebase/app-check is lazy-loaded (see initAppCheckLazy below) to keep it
// out of the main bundle — it's monitor-only, never blocks any request.

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
/**
 * Lazy App Check init — dynamic import of `firebase/app-check` keeps the
 * ~30KB+ module out of the main bundle. Scheduled on idle so it never
 * competes with first paint. Monitor-only; no request is ever blocked.
 */
async function initAppCheckLazy(): Promise<void> {
  const appCheckKey = import.meta.env.VITE_RECAPTCHA_APPCHECK_KEY as string | undefined;
  if (!appCheckKey) return;
  try {
    const { initializeAppCheck, ReCaptchaV3Provider } = await import("firebase/app-check");
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    // Never let App Check init break app boot (monitor mode, non-critical).
    console.warn("[app-check] init skipped:", err);
  }
}

if (typeof window !== "undefined") {
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
  const schedule = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1000));
  schedule(() => { void initAppCheckLazy(); });
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