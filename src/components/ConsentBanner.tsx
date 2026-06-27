/**
 * ConsentBanner — analytics consent-first (discreet, enterprise-friendly).
 *
 * Renders ONLY when consent is unset (under the current consent version) AND
 * Do-Not-Track is not signalled. Allow → store 'granted' + init analytics.
 * No thanks → store 'denied'. No tracking happens before an explicit allow.
 * Once a choice is made it persists (versioned key) and never reappears.
 *
 * Stance: consent-first everywhere (the strictest default), so no geo lookup is
 * needed at boot. No hostnames or legal claims in the copy.
 */

import { useState } from 'react';
import { shouldShowConsentBanner, setConsent } from '../lib/analytics/consent';
import { initAnalyticsIfConsented } from '../lib/analytics/track';
import { useRoute } from '../context/RouteContext';

export function ConsentBanner() {
  const { navigate } = useRoute();
  const [visible, setVisible] = useState<boolean>(() => shouldShowConsentBanner());

  // Deep-link to the Help Center section. The app's hash parser is mount-only
  // (no hashchange listener), so set the section hash THEN navigate via the
  // router — this reliably mounts HelpPage, which reads ?section= on mount.
  const openHelp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try { window.location.hash = '#/help?section=settings-analytics'; } catch { /* ignore */ }
    navigate({ name: 'help' });
  };

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

  const btnBase: React.CSSProperties = {
    padding: '7px 14px', borderRadius: 8, fontSize: 12.5, cursor: 'pointer',
    fontWeight: 600, fontFamily: 'var(--font-body)',
  };

  return (
    <div
      role="dialog"
      aria-label="Optional analytics"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 440,
        margin: '0 auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow, 0 6px 24px rgba(0,0,0,0.10))',
        padding: '14px 16px',
        zIndex: 1000,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Optional analytics
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
        We use privacy-friendly analytics to improve reliability. No personal data is
        collected. You can opt in or out.{' '}
        <a href="#/help?section=settings-analytics" onClick={openHelp} style={{ color: 'var(--violet-text, var(--violet))', whiteSpace: 'nowrap' }}>Learn more</a>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={decline}
          style={{ ...btnBase, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)' }}
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={accept}
          style={{ ...btnBase, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 700 }}
        >
          Allow
        </button>
      </div>
    </div>
  );
}
