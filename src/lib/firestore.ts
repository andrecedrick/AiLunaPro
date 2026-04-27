import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { app } from './firebase';

/**
 * Firestore database client.
 * Import `db` wherever you need to read or write Firestore documents.
 *
 * @example
 *   import { db } from '@/lib/firestore';
 *   import { collection, getDocs } from 'firebase/firestore';
 *   const snap = await getDocs(collection(db, 'organizations'));
 */
const db: Firestore = getFirestore(app);

/**
 * Connect to the local Firestore emulator when
 * VITE_FIRESTORE_EMULATOR_HOST is set (development only).
 *
 * Set in .env.local:
 *   VITE_FIRESTORE_EMULATOR_HOST=localhost:8080
 *
 * The try/catch prevents a crash if Vite's HMR re-evaluates this
 * module while the emulator connection is already established.
 */
if (import.meta.env.DEV && import.meta.env.VITE_FIRESTORE_EMULATOR_HOST) {
  const [host, portStr] = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST.split(':');
  try {
    connectFirestoreEmulator(db, host, parseInt(portStr, 10));
  } catch {
    // Already connected — safe to ignore on HMR re-evaluation
  }
}

export { db };
