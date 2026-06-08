/**
 * B8.1 — Guided User Journey state (deterministic, client-side, no LLM).
 *
 * v1 persistence = localStorage (per the B8 pre-flight decision; Firestore
 * cross-device resume is a later phase). The journey is DEFAULT-ON for a user's
 * first post-auth landing, but fully reversible: once the user makes a choice or
 * skips, we never force the guided entry again, and the dashboard is always
 * reachable. No PII is stored — a single boolean flag only.
 */
const KEY = 'ailunapro.journey.v1.started';

/** True once the user has made the guided choice (or skipped). */
export function isJourneyStarted(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

/** Mark the guided entry as completed/skipped so we don't force it again. */
export function markJourneyStarted(): void {
  try { localStorage.setItem(KEY, '1'); } catch { /* storage unavailable — no-op */ }
}

/** Where a freshly-authenticated user should land: guided choice on first run,
 *  otherwise the dashboard. Pure + deterministic given storage state. */
export function postAuthRoute(): 'journey/start' | 'dashboard' {
  return isJourneyStarted() ? 'dashboard' : 'journey/start';
}
