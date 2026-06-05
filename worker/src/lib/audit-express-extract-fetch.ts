/**
 * Audit Express — V1-lite extraction fetch orchestrator (Phase 5).
 *
 * Network I/O only. All decision logic is in the pure module
 * audit-express-extract.ts. This module enforces the abuse/cost caps:
 *   - https-only, SSRF host validation on EVERY redirect hop
 *   - per-fetch timeout, max redirects, byte-capped streaming read
 *   - bounded page count + total wall-clock budget + small concurrency
 *
 * No persistence. No PII logging. Returns a deterministic snapshot (the pure
 * assembleSnapshot does the deterministic part).
 */

import {
  validateAndCanonicalizeUrl,
  canonicalizeUrlString,
  isBlockedHost,
  parseRobots,
  extractPageSignals,
  selectSecondaryLinks,
  parseSitemapLocs,
  assembleSnapshot,
  EXTRACT_USER_AGENT,
  MAX_PAGE_BYTES,
  MAX_ROBOTS_BYTES,
  MAX_SITEMAP_BYTES,
  MAX_SECONDARY,
  MAX_SECONDARY_DEEP,
  FETCH_TIMEOUT_MS,
  TOTAL_BUDGET_MS,
  MAX_REDIRECTS,
  MAX_CONCURRENCY,
  type PageCapture,
  type ExtractSnapshot,
  type ExtractErrorCode,
  type ExtractDepth,
} from './audit-express-extract';
import { understand } from './audit-express-understanding';

export type RunResult =
  | { ok: true;  snapshot: ExtractSnapshot }
  | { ok: false; code: ExtractErrorCode };

interface RawFetch {
  status:      number;
  contentType: string | null;
  bodyText:    string;
  truncated:   boolean;
  ok:          boolean;
  blocked?:    boolean;   // SSRF block somewhere in the redirect chain
}

/** Read a response body as text, aborting at maxBytes. */
async function readCapped(res: Response, maxBytes: number): Promise<{ text: string; truncated: boolean }> {
  if (!res.body) {
    const text = await res.text().catch(() => '');
    return { text: text.slice(0, maxBytes), truncated: text.length > maxBytes };
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  let truncated = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      if (received + value.length > maxBytes) {
        chunks.push(value.subarray(0, maxBytes - received));
        received = maxBytes;
        truncated = true;
        try { await reader.cancel(); } catch { /* ignore */ }
        break;
      }
      chunks.push(value);
      received += value.length;
    }
  } catch {
    /* network read error — return what we have */
  }
  const merged = new Uint8Array(received);
  let off = 0;
  for (const c of chunks) { merged.set(c, off); off += c.length; }
  return { text: new TextDecoder('utf-8').decode(merged), truncated };
}

/**
 * Fetch a URL with manual redirects, validating each hop for SSRF, with a
 * per-fetch timeout and byte cap. `maxBytes` bounds the response body.
 */
async function cappedFetch(url: string, maxBytes: number): Promise<RawFetch> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    // Re-validate the target host on every hop (SSRF).
    let host: string;
    try { host = new URL(current).hostname; } catch { return blocked(); }
    if (new URL(current).protocol !== 'https:' || isBlockedHost(host)) return blocked();

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: ctrl.signal,
        headers: { 'User-Agent': EXTRACT_USER_AGENT, 'Accept': 'text/html,*/*;q=0.8' },
      });
    } catch {
      clearTimeout(timer);
      return { status: 0, contentType: null, bodyText: '', truncated: false, ok: false };
    }
    clearTimeout(timer);

    // Redirect handling
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) return { status: res.status, contentType: null, bodyText: '', truncated: false, ok: false };
      let next: string;
      try { next = new URL(loc, current).toString(); } catch { return { status: res.status, contentType: null, bodyText: '', truncated: false, ok: false }; }
      const canon = canonicalizeUrlString(next);
      if (!canon) return blocked();              // non-https / bad target → block
      current = canon;
      continue;
    }

    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      try { await res.body?.cancel(); } catch { /* ignore */ }
      return { status: res.status, contentType, bodyText: '', truncated: false, ok: false };
    }
    // Read the capped body for any 2xx (HTML pages AND robots.txt/text). The
    // caller decides whether to parse signals (HTML only).
    const { text, truncated } = await readCapped(res, maxBytes);
    return { status: res.status, contentType, bodyText: text, truncated, ok: true };
  }
  // Too many redirects
  return { status: 0, contentType: null, bodyText: '', truncated: false, ok: false };
}

function blocked(): RawFetch {
  return { status: 0, contentType: null, bodyText: '', truncated: false, ok: false, blocked: true };
}

/** Fetch one page → PageCapture (signals parsed only for OK HTML). */
async function fetchCapture(url: string): Promise<PageCapture> {
  const r = await cappedFetch(url, MAX_PAGE_BYTES);
  if (r.blocked) return { url, status: 0, contentType: null, skippedReason: 'PRIVATE_HOST_BLOCKED' };
  if (!r.ok)     return { url, status: r.status, contentType: r.contentType, skippedReason: r.status === 0 ? 'UNREACHABLE' : 'NON_OK' };
  const isHtml = !r.contentType || /text\/html|application\/xhtml/i.test(r.contentType);
  if (!isHtml)   return { url, status: r.status, contentType: r.contentType, truncated: r.truncated, skippedReason: 'NOT_HTML' };
  const signals = extractPageSignals(r.bodyText);
  return { url, status: r.status, contentType: r.contentType, truncated: r.truncated, signals };
}

/** Run pages with bounded concurrency, respecting a wall-clock deadline. */
async function runPool(urls: string[], deadline: number): Promise<PageCapture[]> {
  const results: PageCapture[] = [];
  let i = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const idx = i++;
      if (idx >= urls.length) return;
      if (Date.now() > deadline) {
        results.push({ url: urls[idx], status: 0, contentType: null, skippedReason: 'BUDGET_EXCEEDED' });
        continue;
      }
      results.push(await fetchCapture(urls[idx]));
    }
  }
  const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, urls.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Orchestrate the full V1-lite extraction. Turnstile + rate limit are enforced
 * by the route BEFORE this is called.
 */
export async function runExtraction(rawUrl: string, depth: ExtractDepth = 'quick'): Promise<RunResult> {
  const v = validateAndCanonicalizeUrl(rawUrl);
  if (!v.ok) return { ok: false, code: v.code };

  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const cap = depth === 'deep' ? MAX_SECONDARY_DEEP : MAX_SECONDARY;

  // robots.txt (conservative: missing/5xx => allow root only).
  const robotsRes = await cappedFetch(v.origin + '/robots.txt', MAX_ROBOTS_BYTES);
  const robots = (robotsRes.ok && robotsRes.bodyText)
    ? parseRobots(robotsRes.bodyText, EXTRACT_USER_AGENT)
    : { isAllowed: (p: string) => p === '/' };

  const homePath = new URL(v.url).pathname || '/';
  if (!robots.isAllowed(homePath)) return { ok: false, code: 'ROBOTS_DISALLOWED' };

  // Homepage.
  const homeCapture = await fetchCapture(v.url);
  const captures: PageCapture[] = [homeCapture];

  // Deterministic secondary selection (only if homepage parsed).
  if (homeCapture.signals) {
    let candidateLinks = homeCapture.signals.links;
    // Deep mode: also discover same-origin pages from sitemap.xml (robots-gated,
    // byte-capped, no nested sitemaps). Merged candidates are still deduped,
    // sorted and capped deterministically by selectSecondaryLinks.
    if (depth === 'deep' && robots.isAllowed('/sitemap.xml') && Date.now() < deadline) {
      const sm = await cappedFetch(v.origin + '/sitemap.xml', MAX_SITEMAP_BYTES);
      if (sm.ok && sm.bodyText) {
        candidateLinks = [...candidateLinks, ...parseSitemapLocs(sm.bodyText, v.origin)];
      }
    }
    const candidates = selectSecondaryLinks(v.url, candidateLinks, cap);
    const allowed = candidates.filter(u => {
      try { return robots.isAllowed(new URL(u).pathname || '/'); } catch { return false; }
    });
    if (allowed.length && Date.now() < deadline) {
      const secondary = await runPool(allowed, deadline);
      captures.push(...secondary);
    }
  }

  const snapshot = assembleSnapshot(v.url, captures);
  // Phase 7 — pure, rule-only interpretation over the captured snapshot.
  // No network, no Date, no randomness; same capture => same understanding.
  snapshot.understanding = understand(snapshot);
  return { ok: true, snapshot };
}
