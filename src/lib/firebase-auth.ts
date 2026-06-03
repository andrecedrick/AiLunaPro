/**
 * Firebase Authentication client.
 *
 * `auth` is now created in src/lib/firebase.ts — in the SAME module as the app
 * init — so auth can never be requested before the app is initialized, no matter
 * how the bundler splits chunks (this re-export keeps the existing
 * `import { auth } from '@/lib/firebase-auth'` call sites working).
 *
 * @example
 *   import { auth } from '@/lib/firebase-auth';
 *   import { onAuthStateChanged } from 'firebase/auth';
 *   onAuthStateChanged(auth, (user) => { ... });
 */
export { auth } from './firebase';
