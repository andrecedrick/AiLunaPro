/// <reference types="vite/client" />

/**
 * Global TypeScript declarations for Vite environment variables.
 * Augments ImportMetaEnv so that import.meta.env.VITE_* vars
 * are fully typed and autocomplete throughout the codebase.
 */

interface ImportMetaEnv {
  // ── Required: Firebase Web App configuration ──────────────────────────
  // Source: Firebase Console → Project Settings → Your apps → Web app
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;

  // ── Optional: Firebase Analytics ──────────────────────────────────────
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;

  // ── Optional: Local Firebase emulators (development only) ─────────────
  readonly VITE_FIRESTORE_EMULATOR_HOST?: string; // e.g. localhost:8080
  readonly VITE_AUTH_EMULATOR_URL?: string;       // e.g. http://localhost:9099

  // ── Optional: J3 feature flag — auto-create a report on audit submit ──
  // 'true' enables; unset/anything else = OFF (default; unchanged behavior).
  readonly VITE_AUTO_REPORT_ON_SUBMIT?: string;

  // ── Optional: Firebase App Check reCAPTCHA v3 site key (public) ────────
  // When set, App Check initializes in MONITOR mode. Unset = no-op.
  readonly VITE_RECAPTCHA_APPCHECK_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Unique per-build identifier injected by vite.config.ts (`define`). Used by
 * the stale-bundle detector (src/lib/routing/staleBundle.ts) to compare the
 * RUNNING bundle against the server's current /version.json after a chunk-load
 * failure. In dev (no define) it falls back via `typeof` guard.
 */
declare const __BUILD_ID__: string;
