/**
 * AnalyticsBlockedNotice — J13.
 *
 * Non-intrusive hint shown ONLY when product analytics ingestion is blocked by
 * the environment (browser tracking-prevention, antivirus web-shield, corporate
 * firewall, or DNS sinkhole) — detected by a one-shot probe in lib/analytics/track.
 *
 * This is informational only. It changes NO privacy behaviour: consent-first,
 * DNT respected, no PII, no autocapture/replay. Dismiss persists locally.
 */

import { useEffect, useState } from 'react';
import { isAnalyticsBlocked } from '../lib/analytics/track';

const DISMISS_KEY = 'ailunapro-analytics-blocked-dismissed';
const BLOCKED_EVENT = 'ailunapro:analytics-blocked';

function alreadyDismissed(): boolean {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}

export function AnalyticsBlockedNotice() {
  const [visible, setVisible] = useState<boolean>(() => isAnalyticsBlocked() && !alreadyDismissed());

  useEffect(() => {
    if (alreadyDismissed()) return;
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
        Analytics blocked by your browser or network privacy protection. To enable product
        analytics, allow <strong style={{ color: 'var(--text-primary)' }}>us.i.posthog.com</strong>.
        This is optional — the app works normally either way.
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
