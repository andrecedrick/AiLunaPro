import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock ONLY verifyIdToken (keep requireAuth real for the full-app import).
vi.mock('../../worker/src/middleware/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../worker/src/middleware/auth')>();
  return { ...actual, verifyIdToken: vi.fn(async (token?: string) => (token === 'valid-token' ? 'uid-1' : null)) };
});

import pdfRoute from '../../worker/src/routes/audit-express-pdf';
// Named import: the default export is now `{ fetch, scheduled }` because the
// worker has a cron handler, so it is no longer the Hono instance.
import { app } from '../../worker/src/index';
import { assembleSnapshot, extractPageSignals, type PageCapture } from '../../worker/src/lib/audit-express-extract';

/*
 * J16 — PDF export now requires authentication (Firebase ID token). Anonymous /
 * invalid-token requests are rejected 401 AUTH_REQUIRED; authenticated requests
 * render the deterministic PDF. The 200 response must carry CORS headers + no-store.
 */

const ORIGIN = 'https://audit.ailunapro.com';
const PROD_ENV = { APP_ENV: 'production', FIREBASE_PROJECT_ID: 'audit-ai', ALLOWED_ORIGINS: ORIGIN } as Record<string, unknown>;
const TAPS = { workflow: 'support', monthlyHours: 'high', hourlyCost: 'medium', aiUsage: 'team', shadowAi: 'no_visibility' };

function validSnapshot() {
  const html = '<!doctype html><html lang="en"><head><title>Acme Store</title><meta name="description" content="Buy now add to cart"><script src="https://js.intercom.io/widget.js"></script></head><body><a href="/shop">Shop</a></body></html>';
  const caps: PageCapture[] = [{ url: 'https://acme.example/', status: 200, contentType: 'text/html', signals: extractPageSignals(html) }];
  return assembleSnapshot('https://acme.example/', caps);
}

function post(body: unknown, opts: { token?: string; env?: Record<string, unknown> } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = 'Bearer ' + opts.token;
  return pdfRoute.request('/api/public/audit-express/pdf',
    { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) }, opts.env ?? PROD_ENV);
}

afterEach(() => { vi.restoreAllMocks(); });

describe('pdf route — auth gate', () => {
  it('rejects anonymous (no Authorization) with AUTH_REQUIRED + no-store', async () => {
    const res = await post({ taps: TAPS });
    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe('AUTH_REQUIRED');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
  it('rejects an invalid token with AUTH_REQUIRED', async () => {
    const res = await post({ taps: TAPS }, { token: 'bad-token' });
    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe('AUTH_REQUIRED');
  });
});

describe('pdf route — authenticated error handling', () => {
  it('rejects invalid JSON body', async () => {
    const res = await post('{not-json', { token: 'valid-token' });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_BODY');
  });
  it('rejects invalid taps', async () => {
    const res = await post({ taps: { workflow: 'support' } }, { token: 'valid-token' });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_TAPS');
  });
  it('rejects a malformed extract snapshot', async () => {
    const res = await post({ taps: TAPS, extractSnapshot: { not: 'a snapshot' } }, { token: 'valid-token' });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_SNAPSHOT');
  });
});

describe('pdf route — authenticated success', () => {
  it('returns a PDF for valid taps (preview-only)', async () => {
    const res = await post({ taps: TAPS, createdAt: '2026-06-04T12:00:00.000Z' }, { token: 'valid-token' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    expect(res.headers.get('cache-control')).toBe('no-store');
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(String.fromCharCode(buf[0], buf[1], buf[2], buf[3])).toBe('%PDF');
  });
  it('returns a PDF when a valid snapshot is included', async () => {
    const res = await post({ taps: TAPS, extractSnapshot: validSnapshot(), createdAt: '2026-06-04T12:00:00.000Z' }, { token: 'valid-token' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
  });
});

describe('pdf route — CORS (full app)', () => {
  it('200 PDF response carries Access-Control-Allow-Origin for an authenticated request', async () => {
    const res = await app.request('/api/public/audit-express/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN, 'Authorization': 'Bearer valid-token' },
      body: JSON.stringify({ taps: TAPS, createdAt: '2026-06-04T12:00:00.000Z' }),
    }, PROD_ENV);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });
});
