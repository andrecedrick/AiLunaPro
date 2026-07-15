// Initialize Firebase FIRST — before any module that uses firebase/auth.
// firebase.ts calls initializeApp() at evaluation time; importing it as the very
// first entry dependency guarantees the default app exists before getAuth() runs
// in any (possibly reordered / code-split) chunk. Prevents the
// "No Firebase App '[DEFAULT]' (app/no-app)" boot crash.
import './lib/firebase'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { captureSrc } from './lib/analytics/srcParam'

// Signal that the JS bundle executed — lets the index.html boot watchdog tell
// "bundle blocked / never loaded" apart from "loaded but slow" (so it does not
// false-positive on a legitimately slow 3G download).
;(window as Window & { __APP_BOOTED__?: boolean }).__APP_BOOTED__ = true

// The bundle executed → clear the one-shot auto-reload marker the index.html
// watchdog sets before its cache-busting reload (see index.html), so a FUTURE
// stale-asset incident gets its own fresh retry.
try { sessionStorage.removeItem('__boot_retry__') } catch { /* storage may be blocked */ }

// A2: capture the SEO landing-page acquisition tag (?src) at the earliest point —
// before React renders and the hash router normalizes the URL (which strips the
// query). srcParam persists it for the session; the public tool pages read it back.
captureSrc()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
