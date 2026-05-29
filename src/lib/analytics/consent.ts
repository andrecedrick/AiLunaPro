/**
 * Analytics consent — J13 (PostHog Phase A).
 *
 * Consent-first: nothing is tracked until the user explicitly accepts.
 * Do-Not-Track is respected — DNT='1' means auto-decline (no banner, no
 * tracking). Choice persists in localStorage. No PII stored (a single
 * 'granted'|'denied' string).
 */

const KEY = 'ailunapro-analytics-consent';

export type ConsentState = 'granted' | 'denied' | 'unset';

/** Browser Do-Not-Track signal. */
export function isDNT(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { msDoNotTrack?: string };
  const dnt = nav.doNotTrack ?? nav.msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

export function getConsent(): ConsentState {
  // DNT overrides any stored value → always treated as denied.
  if (isDNT()) return 'denied';
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : 'unset';
  } catch {
    return 'unset';
  }
}

export function setConsent(granted: boolean): void {
  try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch { /* noop */ }
}

export function hasConsent(): boolean {
  return getConsent() === 'granted';
}

/** Banner should show only when consent is unset AND DNT is not signalled. */
export function shouldShowConsentBanner(): boolean {
  return !isDNT() && getConsent() === 'unset';
}
