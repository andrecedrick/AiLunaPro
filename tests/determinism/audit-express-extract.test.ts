import { describe, it, expect } from 'vitest';
import {
  validateAndCanonicalizeUrl,
  canonicalizeUrlString,
  isBlockedHost,
  isPrivateIpv4,
  parseRobots,
  selectSecondaryLinks,
  parseSitemapLocs,
  MAX_SITEMAP_LOCS,
  extractPageSignals,
  scrubPii,
  detect,
  assembleSnapshot,
  EXTRACTOR_VERSION,
  EXTRACT_RULESET_VERSION,
  type PageCapture,
} from '../../worker/src/lib/audit-express-extract';
import { ENGINE_VERSION, stableStringify } from '../../worker/src/lib/determinism';

/*
 * Phase 5 — V1-lite extraction: determinism, SSRF host rules, robots parsing,
 * deterministic link selection, PII scrubbing, and snapshot replay-equality.
 * All pure (no network).
 */

const HOME_HTML = `<!doctype html><html lang="EN"><head>
  <meta charset="UTF-8">
  <title>Acme Robotics — Contact a@b.com or +1 415 555 1234</title>
  <meta name="description" content="We build things. Reach sales@acme.com.">
  <meta name="generator" content="WordPress 6.5">
  <link rel="canonical" href="https://acme.example/">
  <link rel="icon" href="/favicon.ico">
  <meta property="og:title" content="Acme">
  <meta property="og:site_name" content="Acme Robotics">
  <meta name="twitter:card" content="summary">
  <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXX"></script>
  <script src="https://js.intercom.io/widget.js"></script>
  <script src="/_next/static/chunk.js"></script>
</head><body>
  <a href="/about-us">About</a>
  <a href="/pricing">Pricing</a>
  <a href="/blog/post-1">Blog</a>
  <a href="https://other.example/x">External</a>
  <a href="/contact?utm_source=nav#form">Contact</a>
  <a href="#top">Anchor</a>
  <a href="mailto:x@y.com">Mail</a>
</body></html>`;

describe('extract — URL validation + SSRF', () => {
  it('canonicalizes https and strips tracking params', () => {
    const r = validateAndCanonicalizeUrl('https://Acme.Example/Path?utm_source=x&a=1');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.url).toBe('https://acme.example/Path?a=1');
  });
  it('rejects non-https, credentials, non-default port', () => {
    expect(validateAndCanonicalizeUrl('http://acme.example/').ok).toBe(false);
    expect(validateAndCanonicalizeUrl('https://user:pass@acme.example/').ok).toBe(false);
    expect(validateAndCanonicalizeUrl('https://acme.example:8080/').ok).toBe(false);
    expect(validateAndCanonicalizeUrl('').ok).toBe(false);
  });
  it('blocks localhost and IP literals (SSRF)', () => {
    for (const u of ['https://localhost/', 'https://127.0.0.1/', 'https://10.0.0.5/', 'https://192.168.1.1/', 'https://169.254.1.1/', 'https://foo.local/']) {
      const r = validateAndCanonicalizeUrl(u);
      expect(r.ok, u).toBe(false);
      if (!r.ok) expect(['PRIVATE_HOST_BLOCKED', 'INVALID_URL']).toContain(r.code);
    }
  });
  it('isBlockedHost / isPrivateIpv4 classify correctly', () => {
    expect(isBlockedHost('acme.example')).toBe(false);
    expect(isBlockedHost('localhost')).toBe(true);
    expect(isBlockedHost('::1')).toBe(true);
    expect(isPrivateIpv4('172.16.5.5')).toBe(true);
    expect(isPrivateIpv4('172.32.5.5')).toBe(false);
    expect(isPrivateIpv4('8.8.8.8')).toBe(false);
  });
});

describe('extract — robots parsing', () => {
  it('disallow-all blocks every path', () => {
    const r = parseRobots('User-agent: *\nDisallow: /', 'AiLunaProAuditExpress/1.0');
    expect(r.isAllowed('/')).toBe(false);
    expect(r.isAllowed('/about')).toBe(false);
  });
  it('path-specific disallow with longest-match Allow override', () => {
    const r = parseRobots('User-agent: *\nDisallow: /private\nAllow: /private/ok', 'AiLunaProAuditExpress/1.0');
    expect(r.isAllowed('/')).toBe(true);
    expect(r.isAllowed('/private/secret')).toBe(false);
    expect(r.isAllowed('/private/ok/page')).toBe(true);
  });
  it('empty robots allows all', () => {
    expect(parseRobots('', 'AiLunaProAuditExpress/1.0').isAllowed('/anything')).toBe(true);
  });
});

describe('extract — deterministic link selection', () => {
  it('ranks by keyword then lexicographic, same-origin, capped, deduped', () => {
    const links = extractPageSignals(HOME_HTML).links;
    const picked = selectSecondaryLinks('https://acme.example/', links);
    // Keyword priority order: about(0) < pricing(1) < contact(3) < (no-keyword).
    expect(picked).toEqual([
      'https://acme.example/about-us',
      'https://acme.example/pricing',
      'https://acme.example/contact',   // utm stripped, fragment dropped
      'https://acme.example/blog/post-1',
    ]);
    // External origin excluded
    expect(picked.some(u => u.includes('other.example'))).toBe(false);
  });
});

describe('extract — HTML signal extraction', () => {
  it('extracts identity + scripts deterministically', () => {
    const s = extractPageSignals(HOME_HTML);
    expect(s.lang).toBe('en');
    expect(s.charset).toBe('utf-8');
    expect(s.hasFavicon).toBe(true);
    expect(s.metaGenerator).toBe('WordPress 6.5');
    expect(s.og['og:site_name']).toBe('Acme Robotics');
    expect(s.scriptSrcs).toEqual([...s.scriptSrcs].sort()); // sorted
  });
});

describe('extract — PII scrubbing', () => {
  it('redacts email and phone patterns', () => {
    expect(scrubPii('Reach a@b.com')).toBe('Reach [redacted-email]');
    expect(scrubPii('Call +1 415 555 1234 now')).toContain('[redacted-phone]');
    expect(scrubPii(null)).toBeNull();
  });
});

describe('extract — detector', () => {
  it('detects known signatures with sources', () => {
    const cap: PageCapture = { url: 'https://acme.example/', status: 200, contentType: 'text/html', signals: extractPageSignals(HOME_HTML) };
    const d = detect([cap]);
    const ids = d.map(x => x.id);
    expect(ids).toContain('analytics.gtm');
    expect(ids).toContain('aichat.intercom');
    expect(ids).toContain('cms.wordpress');
    expect(ids).toContain('framework.nextjs');
    expect(ids).toEqual([...ids].sort()); // sorted by id
    expect(d[0].sources).toEqual(['https://acme.example/']);
  });
});

describe('extract — snapshot determinism & privacy', () => {
  const captures: PageCapture[] = [
    { url: 'https://acme.example/', status: 200, contentType: 'text/html', signals: extractPageSignals(HOME_HTML) },
    { url: 'https://acme.example/pricing', status: 200, contentType: 'text/html', signals: extractPageSignals('<html lang="en"><head><title>Pricing</title></head><body></body></html>') },
  ];

  it('is byte-identical across runs (stableStringify)', () => {
    const a = stableStringify(assembleSnapshot('https://acme.example/', captures));
    const b = stableStringify(assembleSnapshot('https://acme.example/', captures));
    expect(a).toBe(b);
  });

  it('is independent of capture input order', () => {
    const a = stableStringify(assembleSnapshot('https://acme.example/', captures));
    const b = stableStringify(assembleSnapshot('https://acme.example/', [...captures].reverse()));
    expect(a).toBe(b);
  });

  it('stamps versions and inputsHash', () => {
    const snap = assembleSnapshot('https://acme.example/', captures);
    expect(snap.engineVersion).toBe(ENGINE_VERSION);
    expect(snap.extractorVersion).toBe(EXTRACTOR_VERSION);
    expect(snap.rulesetVersion).toBe(EXTRACT_RULESET_VERSION);
    expect(snap.modelId).toBe('rules:none');
    expect(typeof snap.inputsHash).toBe('string');
    expect(snap.inputsHash.length).toBeGreaterThan(0);
    expect(Object.keys(snap.trace).length).toBeGreaterThan(0);
  });

  it('contains NO raw PII (email scrubbed from identity)', () => {
    const snap = assembleSnapshot('https://acme.example/', captures);
    const text = stableStringify(snap);
    expect(/@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text)).toBe(false); // no email-like
    expect(snap.identity.title).toContain('[redacted-email]');
    expect(snap.identity.title).toContain('[redacted-phone]');
  });
});

describe('parseSitemapLocs (deep-mode discovery) — pure + bounded', () => {
  it('keeps same-origin page locs, skips cross-origin + nested .xml', () => {
    const xml = `<urlset>
      <url><loc>https://acme.example/a</loc></url>
      <url><loc>https://acme.example/b</loc></url>
      <url><loc>https://evil.example/x</loc></url>
      <sitemap><loc>https://acme.example/nested.xml</loc></sitemap>
    </urlset>`;
    const locs = parseSitemapLocs(xml, 'https://acme.example');
    expect(locs.some(u => u.includes('/a'))).toBe(true);
    expect(locs.some(u => u.includes('/b'))).toBe(true);
    expect(locs.some(u => u.includes('evil.example'))).toBe(false);
    expect(locs.some(u => u.endsWith('.xml'))).toBe(false);
  });
  it('is deterministic and caps at MAX_SITEMAP_LOCS', () => {
    const many = Array.from({ length: MAX_SITEMAP_LOCS + 25 }, (_, i) => `<url><loc>https://acme.example/p${i}</loc></url>`).join('');
    const a = parseSitemapLocs(`<urlset>${many}</urlset>`, 'https://acme.example');
    const b = parseSitemapLocs(`<urlset>${many}</urlset>`, 'https://acme.example');
    expect(a.length).toBe(MAX_SITEMAP_LOCS);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
