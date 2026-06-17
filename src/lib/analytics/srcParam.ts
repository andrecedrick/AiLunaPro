/**
 * ?src acquisition attribution — A2 (SEO landing pages).
 *
 * The SEO landing pages deep-link into the public tools with a `src` tag, e.g.
 * `#/roi-calculator?src=lp-roi`. We capture it ONCE on entry and persist it for
 * the session (it survives the SPA's hash normalization), then attach it to the
 * funnel analytics events and the affiliate handoff URL.
 *
 * No PII — `src` is a short, slug-shaped campaign tag (validated below); anything
 * else is ignored. Purely client-side; never sent to our own backend.
 */

const KEY = 'ailunapro.src';
// Defensive: accept only a short slug — never free text (no PII, no injection).
const ALLOWED = /^[a-z0-9_-]{1,32}$/i;

function fromHash(): string | null {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash;
  const q = h.includes('?') ? h.slice(h.indexOf('?')) : '';
  const v = new URLSearchParams(q).get('src');
  return v && ALLOWED.test(v) ? v : null;
}

/**
 * Capture `src` from the URL on entry and persist it for the session. Call once on
 * a tool page mount. Returns the active source (fresh from the URL, else the
 * previously-captured session value, else null).
 */
export function captureSrc(): string | null {
  const fresh = fromHash();
  if (fresh) {
    try { sessionStorage.setItem(KEY, fresh); } catch { /* non-fatal */ }
    return fresh;
  }
  return getSrc();
}

/** The captured acquisition source for this session, or null. */
export function getSrc(): string | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v && ALLOWED.test(v) ? v : null;
  } catch { return null; }
}

/** Append `&src=…` to an affiliate/handoff URL when a source is known. */
export function withSrc(url: string): string {
  const s = getSrc();
  if (!s) return url;
  return url + (url.includes('?') ? '&' : '?') + 'src=' + encodeURIComponent(s);
}
