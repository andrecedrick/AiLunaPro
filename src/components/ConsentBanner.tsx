/**
 * ConsentBanner — J13 (analytics consent-first).
 *
 * Renders ONLY when consent is unset AND Do-Not-Track is not signalled.
 * Accept → store 'granted' + init analytics. Decline → store 'denied'.
 * No tracking happens before an explicit accept.
 */

import { useState } from 'react';
import { shouldShowConsentBanner, setConsent } from '../lib/analytics/consent';
import { initAnalyticsIfConsented } from '../lib/analytics/track';

export function ConsentBanner() {
  const [visible, setVisible] = useState<boolean>(() => shouldShowConsentBanner());
  if (!visible) return null;

  const accept = () => {
    setConsent(true);
    initAnalyticsIfConsented();
    setVisible(false);
  };
  const decline = () => {
    setConsent(false);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
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
        padding: '16px 18px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 220, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        We use privacy-friendly product analytics (page views + reliability events) to
        improve AiLunaPro. <strong style={{ color: 'var(--text-primary)' }}>No personal
        data, no session recording, no ad tracking.</strong> You can decline.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={decline}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-muted)', fontWeight: 600,
            fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={accept}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--violet)',
            background: 'var(--violet)', color: '#fff', fontWeight: 700,
            fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
