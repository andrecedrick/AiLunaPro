/**
 * ConnectionBanner — the NON-BLOCKING replacement for the old full-screen
 * "Still connecting…" card (which could dead-end the whole app forever).
 *
 * AuthContext now force-exits the boot gate after its 12s deadline and the app
 * continues in degraded mode; while `connectionPhase === 'failed'` this banner:
 *   - shows a slim, dismiss-proof but non-blocking notice (the app stays usable —
 *     public pages, login, and any last-known session all render underneath);
 *   - diagnoses WHY (captured chunk failure → googleapis reachability probe);
 *   - retries automatically in the background every 20s (logged, non-PII);
 *   - offers a manual "Retry now".
 * It disappears by itself the moment the connection recovers (phase → 'ok').
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Reason = 'FIRESTORE_CHUNK_BLOCKED' | 'GOOGLEAPIS_BLOCKED' | 'TIMEOUT';

const REASON_TEXT: Record<Reason, string> = {
  FIRESTORE_CHUNK_BLOCKED: 'a required app module was blocked from loading',
  GOOGLEAPIS_BLOCKED:      'Google / Firebase endpoints appear to be blocked (ad-blocker / corporate filter?)',
  TIMEOUT:                 'the connection is slower than expected',
};

export function ConnectionBanner() {
  const { connectionPhase, retryAuth } = useAuth();
  const failed = connectionPhase === 'failed';
  const retrying = connectionPhase === 'retrying';
  const [reason, setReason] = useState<Reason>('TIMEOUT');

  // Diagnose once we are in the failed state: prefer a captured lazy-chunk failure,
  // else probe googleapis reachability (no-cors: resolves opaque if reachable).
  useEffect(() => {
    if (!failed) return;
    const captured = (window as Window & { __BOOT_REASON__?: string }).__BOOT_REASON__;
    if (captured === 'FIRESTORE_CHUNK_BLOCKED') { setReason('FIRESTORE_CHUNK_BLOCKED'); return; }
    let cancelled = false;
    fetch('https://firestore.googleapis.com/v1/projects/-/databases/(default)/documents', { mode: 'no-cors' })
      .then(() => { if (!cancelled) setReason('TIMEOUT'); })
      .catch(() => { if (!cancelled) setReason('GOOGLEAPIS_BLOCKED'); });
    return () => { cancelled = true; };
  }, [failed]);

  // Background reconnect while failed — every 20s, logged. retryAuth self-no-ops on a
  // cold boot (the auth subscription recovers on its own once endpoints are reachable).
  useEffect(() => {
    if (!failed) return;
    const iv = window.setInterval(() => {
      console.warn('[conn] background reconnect attempt — reason', reason);
      retryAuth();
    }, 20_000);
    return () => window.clearInterval(iv);
  }, [failed, reason, retryAuth]);

  if (!failed && !retrying) return null;

  return (
    <div role="status" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
      padding: '8px 14px', background: 'var(--amber-soft-bg, #fef3c7)', borderBottom: '1px solid #f59e0b',
      fontSize: 12.5, color: 'var(--text-secondary, #374151)', lineHeight: 1.45,
    }}>
      <span aria-hidden>⚠️</span>
      <span>
        {retrying
          ? 'Connection dropped — reconnecting…'
          : <>Connection issues — {REASON_TEXT[reason]}. Signed-in data may be unavailable; the app keeps retrying in the background.</>}
      </span>
      {failed && (
        <button type="button" onClick={retryAuth} style={{
          padding: '4px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: 'transparent',
          color: 'var(--text-primary, #111827)', fontWeight: 700, fontSize: 12, cursor: 'pointer',
        }}>
          Retry now
        </button>
      )}
    </div>
  );
}
