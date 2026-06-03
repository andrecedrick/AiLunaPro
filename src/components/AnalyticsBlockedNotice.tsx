/**
 * AnalyticsBlockedNotice — DEV-ONLY diagnostic.
 *
 * Hidden in normal/production usage: the app must just work whether or not
 * analytics ingestion is blocked, with NO user-facing message. We keep this
 * as a developer-only hint (import.meta.env.DEV) so engineers can still spot a
 * blocked environment locally. In production builds it never renders.
 *
 * Changes NO privacy behaviour: consent-first, DNT respected, no PII, no
 * autocapture/replay. Dismiss persists locally (dev only).
 */

import { useEffect, useState } from 'react';
import { isAnalyticsBlocked } from '../lib/analytics/track';

const DEV = import.meta.env.DEV; // false in production builds → notice never renders
const DISMISS_KEY = 'ailunapro-analytics-blocked-dismissed';
const BLOCKED_EVENT = 'ailunapro:analytics-blocked';

function alreadyDismissed(): boolean {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}

export function AnalyticsBlockedNotice() {
  const [visible, setVisible] = useState<boolean>(() => DEV && isAnalyticsBlocked() && !alreadyDismissed());

  useEffect(() => {
    if (!DEV || alreadyDismissed()) return;
    const onBlocked = () => setVisible(true);
    window.addEventListener(BLOCKED_EVENT, onBlocked);
    // Catch the case where the probe resolved before this mounted.
    if (isAnalyticsBlocked()) setVisible(true);
    return () => window.removeEventListener(BLOCKED_EVENT, onBlocked);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 520,
        margin: '0 auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow-glow, 0 8px 30px rgba(0,0,0,0.18))',
        padding: '12px 16px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 220, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Analytics requests are being blocked by your browser or network privacy settings.
        The app works normally either way.{' '}
        <a href="/#/help?section=getting-started" style={{ color: 'var(--violet-text, var(--violet))', whiteSpace: 'nowrap' }}>Learn how to enable</a>
      </div>
      <button
        type="button"
        onClick={dismiss}
        style={{
          padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--text-muted)', fontWeight: 600,
          fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
