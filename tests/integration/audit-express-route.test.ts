import { describe, it, expect, vi, afterEach } from 'vitest';
import auditExpress from '../../worker/src/routes/audit-express';

/*
 * Phase 4 — Audit Express preview route: Turnstile gate + privacy.
 *
 * Production env (APP_ENV=production, TURNSTILE_SECRET_KEY set) so there is NO
 * bypass. Turnstile siteverify is mocked (no network). The preview must be
 * rejected (4xx) without a valid token and must never leak PII.
 */

const PROD_ENV = {
  APP_ENV: 'production',
  TURNSTILE_SECRET_KEY: 'test-secret',
  TURNSTILE_SITE_KEY: 'test-site-key',
} as Record<string, unknown>;

const TAPS = {
  workflow:     'finance',
  monthlyHours: 'medium',
  hourlyCost:   'medium',
  aiUsage:      'team',
  shadowAi:     'partial_visibility',
};

function post(body: unknown, env = PROD_ENV) {
  return auditExpress.request(
    '/api/public/audit-express/preview',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    env,
  );
}

/** Mock the Turnstile siteverify fetch with a fixed success flag. */
function mockSiteverify(success: boolean) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify({ success, 'error-codes': success ? [] : ['invalid-input-response'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/public/audit-express/preview — Turnstile gate', () => {
  it('rejects with 400 when no token is provided (production, no bypass)', async () => {
    const res = await post({ taps: TAPS });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(typeof j.code).toBe('string');
    expect(j.code.startsWith('TURNSTILE')).toBe(true);
  });

  it('rejects with 400 when Turnstile verification fails', async () => {
    mockSiteverify(false);
    const res = await post({ taps: TAPS, turnstileToken: 'bad-token' });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.code).toBe('TURNSTILE_FAILED');
  });

  it('returns 200 with a deterministic preview when Turnstile passes', async () => {
    mockSiteverify(true);
    const res = await post({ taps: TAPS, turnstileToken: 'good-token' });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.k1a).toBeTruthy();
    expect(j.k2a).toBeTruthy();
    expect(typeof j.engineVersion).toBe('string');
  });

  it('rejects invalid taps with 400 even when Turnstile passes', async () => {
    mockSiteverify(true);
    const res = await post({ taps: { ...TAPS, workflow: 'not_a_workflow' }, turnstileToken: 'good-token' });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.code).toBe('INVALID_TAPS');
  });

  it('never returns PII fields in the error or success payloads', async () => {
    mockSiteverify(true);
    const res = await post({ taps: TAPS, turnstileToken: 'good-token' });
    const text = await res.text();
    expect(/"email"|"name"|"phone"|"company"|"lead"|"ip"/i.test(text)).toBe(false);
  });
});

describe('GET /api/public/audit-express/config — public site key', () => {
  it('returns the configured public site key', async () => {
    const res = await auditExpress.request('/api/public/audit-express/config', { method: 'GET' }, PROD_ENV);
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.turnstileSiteKey).toBe('test-site-key');
  });

  it('returns null when the site key is not configured', async () => {
    const res = await auditExpress.request('/api/public/audit-express/config', { method: 'GET' }, { APP_ENV: 'production' });
    const j = await res.json();
    expect(j.turnstileSiteKey).toBeNull();
  });
});
