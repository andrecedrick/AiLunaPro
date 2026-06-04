import { describe, it, expect, vi, afterEach } from 'vitest';
import pdfRoute from '../../worker/src/routes/audit-express-pdf';
import app from '../../worker/src/index';
import { assembleSnapshot, extractPageSignals, type PageCapture } from '../../worker/src/lib/audit-express-extract';

/*
 * J15 P1 bug-fix — PDF route error handling + success + CORS regression.
 * Network (Turnstile siteverify) is mocked. Asserts deterministic, non-PII
 * error codes and that the 200 PDF response carries CORS headers (the original
 * bug: a raw `new Response` dropped Access-Control-Allow-Origin -> browser
 * blocked the cross-origin download -> generic UI failure).
 */

const ORIGIN = 'https://audit.ailunapro.com';
const PROD_ENV = {
  APP_ENV: 'production',
  TURNSTILE_SECRET_KEY: 'test-secret',
  ALLOWED_ORIGINS: ORIGIN,
} as Record<string, unknown>;

const TAPS = { workflow: 'support', monthlyHours: 'high', hourlyCost: 'medium', aiUsage: 'team', shadowAi: 'no_visibility' };

function mockSiteverify(success: boolean) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (String(url).includes('siteverify')) {
      return new Response(JSON.stringify({ success, 'error-codes': success ? [] : ['timeout-or-duplicate'] }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('', { status: 200 });
  }));
}

function validSnapshot() {
  const html = '<!doctype html><html lang="en"><head><title>Acme Store</title><meta name="description" content="Buy now add to cart"><script src="https://js.intercom.io/widget.js"></script></head><body><a href="/shop">Shop</a></body></html>';
  const caps: PageCapture[] = [{ url: 'https://acme.example/', status: 200, contentType: 'text/html', signals: extractPageSignals(html) }];
  return assembleSnapshot('https://acme.example/', caps);
}

function post(body: unknown, env = PROD_ENV) {
  return pdfRoute.request('/api/public/audit-express/pdf',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) }, env);
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('pdf route — error handling', () => {
  it('rejects tokenless in production (no siteverify call)', async () => {
    mockSiteverify(true);
    const res = await post({ taps: TAPS });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('TURNSTILE_TOKEN_MISSING');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects invalid JSON body', async () => {
    mockSiteverify(true);
    const res = await post('{not-json');
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_BODY');
  });

  it('rejects a failed Turnstile (duplicate/expired token)', async () => {
    mockSiteverify(false);
    const res = await post({ turnstileToken: 'used', taps: TAPS });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('TURNSTILE_FAILED');
  });

  it('rejects invalid taps', async () => {
    mockSiteverify(true);
    const res = await post({ turnstileToken: 'ok', taps: { workflow: 'support' } });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_TAPS');
  });

  it('rejects a malformed extract snapshot', async () => {
    mockSiteverify(true);
    const res = await post({ turnstileToken: 'ok', taps: TAPS, extractSnapshot: { not: 'a snapshot' } });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_SNAPSHOT');
  });
});

describe('pdf route — success', () => {
  it('returns a PDF for valid taps (preview-only)', async () => {
    mockSiteverify(true);
    const res = await post({ turnstileToken: 'ok', taps: TAPS, createdAt: '2026-06-04T12:00:00.000Z' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    expect(res.headers.get('cache-control')).toBe('no-store');
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(String.fromCharCode(buf[0], buf[1], buf[2], buf[3])).toBe('%PDF');
  });

  it('returns a PDF when a valid snapshot is included (recomputes understanding)', async () => {
    mockSiteverify(true);
    const res = await post({ turnstileToken: 'ok', taps: TAPS, extractSnapshot: validSnapshot(), createdAt: '2026-06-04T12:00:00.000Z' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
  });
});

describe('pdf route — CORS regression (full app)', () => {
  it('200 PDF response carries Access-Control-Allow-Origin', async () => {
    mockSiteverify(true);
    const res = await app.request('/api/public/audit-express/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
      body: JSON.stringify({ turnstileToken: 'ok', taps: TAPS, createdAt: '2026-06-04T12:00:00.000Z' }),
    }, PROD_ENV);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });
});
