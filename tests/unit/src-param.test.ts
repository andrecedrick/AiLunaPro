import { describe, it, expect, beforeEach } from 'vitest';
import { captureSrc, getSrc, withSrc, setSrc } from '../../src/lib/analytics/srcParam';

/**
 * A2 — SEO landing-page acquisition tag (?src). Capture from the hash query,
 * persist for the session, append to the affiliate URL. Only short slug-shaped
 * values are accepted (no PII / no injection).
 */
beforeEach(() => {
  try { sessionStorage.clear(); } catch { /* noop */ }
  window.location.hash = '';
});

describe('srcParam', () => {
  it('captures a valid src from the hash query and persists it', () => {
    window.location.hash = '#/roi-calculator?src=lp-roi';
    expect(captureSrc()).toBe('lp-roi');
    window.location.hash = '#/roi-calculator'; // router normalizes; session value survives
    expect(getSrc()).toBe('lp-roi');
  });

  it('ignores oversized or non-slug values (no PII / injection)', () => {
    window.location.hash = '#/roi-calculator?src=' + 'x'.repeat(40);
    expect(captureSrc()).toBeNull();
    window.location.hash = '#/roi-calculator?src=bad%20value';
    expect(captureSrc()).toBeNull();
  });

  it('setSrc persists a valid slug (in-app menu entry) and ignores invalid input', () => {
    setSrc('menu-roi');
    expect(getSrc()).toBe('menu-roi');
    setSrc('bad value!');           // invalid → ignored, previous kept
    expect(getSrc()).toBe('menu-roi');
  });

  it('withSrc appends &src when known and leaves the URL unchanged otherwise', () => {
    window.location.hash = '#/diagnostic?src=lp-diagnostic';
    captureSrc();
    expect(withSrc('https://dashboard.ailunapro.com/register?aff=ABC')).toBe('https://dashboard.ailunapro.com/register?aff=ABC&src=lp-diagnostic');
    try { sessionStorage.clear(); } catch { /* noop */ }
    expect(withSrc('https://dashboard.ailunapro.com/register?aff=ABC')).toBe('https://dashboard.ailunapro.com/register?aff=ABC');
  });
});
