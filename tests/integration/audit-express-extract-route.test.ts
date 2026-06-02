import { describe, it, expect, vi, afterEach } from 'vitest';
import extractRoute from '../../worker/src/routes/audit-express-extract';

/*
 * Phase 5 — extract route: Turnstile gate, SSRF blocks, robots compliance,
 * caps, no-PII, and route-level determinism. Network is fully mocked.
 */

const PROD_ENV = { APP_ENV: 'production', TURNSTILE_SECRET_KEY: 'test-secret' } as Record<string, unknown>;

const HOME_HTML = `<!doctype html><html lang="en"><head>
  <title>Acme — email founder@acme.example</title>
  <meta name="description" content="Hello">
  <script src="https://js.intercom.io/widget.js"></script>
  </head><body>
  <a href="/about">About</a><a href="/pricing">Pricing</a><a href="/services">Services</a>
  <a href="/contact">Contact</a><a href="/product">Product</a><a href="/extra">Extra</a>
  </body></html>`;

let fetched: string[] = [];

/** Route the mocked fetch by URL. `pages` maps pathname -> Response factory. */
function installFetch(opts: {
  turnstile?: boolean;
  robots?: string | null;        // null => 404
  homeStatus?: number;
  homeHtml?: string;
  homeRedirectTo?: string;       // if set, homepage returns 301 to this
  big?: boolean;                 // homepage body > 512KB
}) {
  fetched = [];
  const { turnstile = true, robots = '', homeHtml = HOME_HTML } = opts;
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    fetched.push(url);
    if (String(url).includes('siteverify')) {
      return new Response(JSON.stringify({ success: turnstile, 'error-codes': turnstile ? [] : ['x'] }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (String(url).endsWith('/robots.txt')) {
      if (robots == null) return new Response('not found', { status: 404 });
      return new Response(robots, { status: 200, headers: { 'content-type': 'text/plain' } });
    }
    // Homepage
    if (/\/$/.test(String(url)) || String(url) === 'https://acme.example/') {
      if (opts.homeRedirectTo) return new Response(null, { status: 301, headers: { location: opts.homeRedirectTo } });
      if (opts.big) return new Response('x'.repeat(600 * 1024) + homeHtml, { status: 200, headers: { 'content-type': 'text/html' } });
      return new Response(homeHtml, { status: opts.homeStatus ?? 200, headers: { 'content-type': 'text/html' } });
    }
    // Secondary pages
    return new Response('<html lang="en"><head><title>Sub</title></head><body></body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
  }));
}

function post(body: unknown, env = PROD_ENV) {
  return extractRoute.request('/api/public/audit-express/extract',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, env);
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('extract route — Turnstile gate', () => {
  it('rejects tokenless in production WITHOUT any fetch', async () => {
    installFetch({});
    const res = await post({ url: 'https://acme.example/' });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.code).toBe('TURNSTILE_TOKEN_MISSING');
    expect(fetched.length).toBe(0); // no outbound fetch before gate
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});

describe('extract route — SSRF', () => {
  it('blocks IP-literal host and never fetches it', async () => {
    installFetch({});
    const res = await post({ url: 'https://127.0.0.1/', turnstileToken: 'good' });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.code).toBe('PRIVATE_HOST_BLOCKED');
    expect(fetched.some(u => u.includes('127.0.0.1'))).toBe(false);
  });

  it('blocks a redirect to a private host (homepage skipped, no GET to private)', async () => {
    installFetch({ homeRedirectTo: 'https://127.0.0.1/' });
    const res = await post({ url: 'https://acme.example/', turnstileToken: 'good' });
    expect(res.status).toBe(200);
    const j = await res.json();
    const home = j.pages.find((p: { url: string }) => p.url === 'https://acme.example/');
    expect(home.skippedReason).toBe('PRIVATE_HOST_BLOCKED');
    // The 301 was fetched once, but the private target was never GET-ed.
    expect(fetched.filter(u => u === 'https://127.0.0.1/').length).toBe(0);
  });
});

describe('extract route — robots compliance', () => {
  it('disallow-all returns 403 and never fetches the homepage', async () => {
    installFetch({ robots: 'User-agent: *\nDisallow: /' });
    const res = await post({ url: 'https://acme.example/', turnstileToken: 'good' });
    expect(res.status).toBe(403);
    const j = await res.json();
    expect(j.code).toBe('ROBOTS_DISALLOWED');
    expect(fetched.some(u => u.endsWith('/robots.txt'))).toBe(true);
    expect(fetched.some(u => u === 'https://acme.example/')).toBe(false); // homepage never fetched
  });
});

describe('extract route — caps & success', () => {
  it('caps homepage body at 512KB (truncated flag)', async () => {
    installFetch({ big: true });
    const res = await post({ url: 'https://acme.example/', turnstileToken: 'good' });
    expect(res.status).toBe(200);
    const j = await res.json();
    const home = j.pages.find((p: { url: string }) => p.url === 'https://acme.example/');
    expect(home.truncated).toBe(true);
  });

  it('fetches at most 5 pages total and returns a stamped snapshot', async () => {
    installFetch({});
    const res = await post({ url: 'https://acme.example/', turnstileToken: 'good' });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.pages.length).toBeLessThanOrEqual(5);   // homepage + max 4
    expect(j.extractorVersion).toBe('1.0.0');
    expect(typeof j.inputsHash).toBe('string');
    expect(typeof j.createdAt).toBe('string');
    expect(j.detections.map((d: { id: string }) => d.id)).toContain('aichat.intercom');
    // Phase 7 — understanding block attached (rule-only interpretation).
    expect(j.understanding).toBeTruthy();
    expect(typeof j.understanding.businessProfile.businessType).toBe('string');
    expect(Array.isArray(j.understanding.automationOpportunities)).toBe(true);
  });

  it('returns NO raw PII (identity scrubbed)', async () => {
    installFetch({});
    const res = await post({ url: 'https://acme.example/', turnstileToken: 'good' });
    const text = await res.text();
    expect(/founder@acme\.example/.test(text)).toBe(false);
    expect(text).toContain('[redacted-email]');
  });
});

describe('extract route — determinism', () => {
  it('same site => identical snapshot (ignoring createdAt)', async () => {
    installFetch({});
    const a = await (await post({ url: 'https://acme.example/', turnstileToken: 'good' })).json();
    installFetch({});
    const b = await (await post({ url: 'https://acme.example/', turnstileToken: 'good' })).json();
    delete a.createdAt; delete b.createdAt;
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.inputsHash).toBe(b.inputsHash);
  });
});
