import { afterEach, vi, beforeEach } from 'vitest';

// jsdom localStorage polyfill — some versions lack .clear().
// Replace the whole storage with a Map-backed implementation that mirrors
// the full Web Storage API so all tests get a consistent, resettable store.
const store = new Map<string, string>();
const localStorageMock: Storage = {
  get length() { return store.size; },
  key: (i) => Array.from(store.keys())[i] ?? null,
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: (k) => { store.delete(k); },
  clear: () => { store.clear(); },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  store.clear();
});

// Mock Firebase before any imports
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps:       vi.fn(() => []),
  getApp:        vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth:                          vi.fn(() => ({ currentUser: null })),
  onAuthStateChanged:               vi.fn((_auth, cb) => { cb(null); return () => {}; }),
  signInWithEmailAndPassword:       vi.fn(),
  createUserWithEmailAndPassword:   vi.fn(),
  signOut:                          vi.fn(async () => {}),
  sendPasswordResetEmail:           vi.fn(async () => {}),
  updateProfile:                    vi.fn(async () => {}),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  // P2-a: firestore.ts now uses initializeFirestore (autoDetectLongPolling).
  initializeFirestore: vi.fn(() => ({})),
  connectFirestoreEmulator: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(async () => ({ exists: () => false, data: () => undefined })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
}));

// Force mock layer in all tests regardless of .env.local
// (prevents any VITE_*_LAYER=firebase from .env.local bleeding into tests).
// Domain-specific vars take precedence over VITE_DATA_LAYER (see resolveLayer),
// so set every domain explicitly — otherwise a domain var inlined from .env.local
// (e.g. VITE_BILLING_LAYER=firebase) overrides the global mock.
import.meta.env.VITE_DATA_LAYER     = 'mock';
import.meta.env.VITE_AUTH_LAYER     = 'mock';
import.meta.env.VITE_BILLING_LAYER  = 'mock';
import.meta.env.VITE_REGISTRY_LAYER = 'mock';
import.meta.env.VITE_AUDIT_LAYER    = 'mock';
import.meta.env.VITE_REPORTS_LAYER  = 'mock';
import.meta.env.VITE_API_URL        = 'http://localhost:5173';

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
