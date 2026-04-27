import { getAuth, connectAuthEmulator } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { app } from './firebase';

/**
 * Firebase Authentication client.
 * Import `auth` wherever you need to sign users in/out or read auth state.
 *
 * Default persistence: browserLocalPersistence (survives browser refresh).
 * This is the Firebase SDK default in browser environments — no explicit
 * setPersistence call is needed.
 *
 * @example
 *   import { auth } from '@/lib/firebase-auth';
 *   import { onAuthStateChanged } from 'firebase/auth';
 *   onAuthStateChanged(auth, (user) => { ... });
 */
const auth: Auth = getAuth(app);

/**
 * Connect to the local Auth emulator when
 * VITE_AUTH_EMULATOR_URL is set (development only).
 *
 * Set in .env.local:
 *   VITE_AUTH_EMULATOR_URL=http://localhost:9099
 *
 * The try/catch prevents a crash if Vite's HMR re-evaluates this
 * module while the emulator connection is already established.
 */
if (import.meta.env.DEV && import.meta.env.VITE_AUTH_EMULATOR_URL) {
  try {
    connectAuthEmulator(auth, import.meta.env.VITE_AUTH_EMULATOR_URL, {
      disableWarnings: false,
    });
  } catch {
    // Already connected — safe to ignore on HMR re-evaluation
  }
}

export { auth };
