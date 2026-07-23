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
import { initialLanguage } from './lib/preferences'
import { loadDict } from './lib/locale/i18n'
import { primeDict } from './context/LocaleContext'
import { assertProductionLayers } from './lib/featureFlags'

// Fail-closed: a production bundle that lost VITE_AUTH_LAYER/VITE_DATA_LAYER would
// otherwise boot into localStorage mock mode silently. Throw here (before render)
// so the index.html boot watchdog surfaces the actionable error card instead of a
// fake logged-in session over throwaway data. No-op in dev/test builds.
assertProductionLayers()

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

/**
 * Resolve the translation catalog BEFORE the first render.
 *
 * Every catalog (English included) is now a lazy chunk, so it is no longer
 * available synchronously. Priming it here means the provider's first render is
 * already translated: no untranslated flash, no blank frame, no locale-driven
 * layout shift. The index.html boot splash covers this fetch — it is the same
 * splash that already covered bundle download and React mount.
 *
 * Only ONE catalog is fetched: the detected language. A French visitor no longer
 * pays for English + French, which is what the entry-chunk arrangement forced.
 *
 * Fail-open: if the catalog cannot be fetched, render anyway. LocaleProvider
 * then waits for its own load and the ErrorBoundary (which uses hardcoded inline
 * copy) still works — a failed dictionary must never mean a blank product.
 */
async function boot() {
  try {
    primeDict(await loadDict(initialLanguage()))
  } catch {
    /* fall through — provider loads it, ErrorBoundary copy is locale-free */
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void boot()
