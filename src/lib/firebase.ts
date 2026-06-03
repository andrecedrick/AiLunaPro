import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
// firebase/app-check is lazy-loaded (see initAppCheckLazy below) to keep it
// out of the main bundle — it's monitor-only, never blocks any request.
// NOTE: Firebase Analytics is intentionally NOT used — product analytics are
// PostHog, consent-first (see src/lib/analytics/*).

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
 * Auth is created in THIS module, immediately after the app — same module, same
 * chunk, sequential evaluation. This guarantees initializeApp() always runs
 * before getAuth(), regardless of how the bundler code-splits/orders chunks.
 * (Splitting init and getAuth across two modules caused the prod
 * "No Firebase App '[DEFAULT]' (app/no-app)" boot crash.)
 */
export const auth: Auth = getAuth(app);

/**
 * Connect to the local Auth emulator when VITE_AUTH_EMULATOR_URL is set (dev).
 * The try/catch tolerates Vite HMR re-evaluation after the connection exists.
 */
if (import.meta.env.DEV && import.meta.env.VITE_AUTH_EMULATOR_URL) {
  try {
    connectAuthEmulator(auth, import.meta.env.VITE_AUTH_EMULATOR_URL, { disableWarnings: false });
  } catch {
    // Already connected — safe to ignore on HMR re-evaluation.
  }
}

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
