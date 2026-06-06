import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Shared in-memory state (hoisted so the vi.mock factories can close over it).
const state = vi.hoisted(() => ({
  members: new Set<string>(),                 // `${orgId}/${uid}`
  docs: new Map<string, Record<string, unknown>>(),
  r2: new Map<string, Uint8Array>(),
  tokenResult: { ok: true, balanceAfter: 100, tokensConsumed: 10 } as Record<string, unknown>,
}));

// consumeTokens is exercised by the PDF quota helper; mock it for deterministic tests.
vi.mock('../../worker/src/lib/tokens', () => ({
  consumeTokens: vi.fn(async () => state.tokenResult),
}));

vi.mock('../../worker/src/middleware/auth', async (orig) => {
  const actual = await orig<typeof import('../../worker/src/middleware/auth')>();
  return { ...actual, verifyIdToken: vi.fn(async (token?: string) => (token === 'valid-token' ? 'uid-1' : null)) };
});

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    const m = path.match(/^organizations\/([^/]+)\/members\/([^/]+)$/);
    if (m) return state.members.has(`${m[1]}/${m[2]}`) ? { role: 'owner' } : null;
    return state.docs.get(path) ?? null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => { state.docs.set(path, data); }),
  firestoreDelete: vi.fn(async (_sa: string, path: string) => { state.docs.delete(path); }),
  firestoreRunQuery: vi.fn(async (_sa: string, _q: unknown, parent: string) => {
    const out: Array<{ name: string; fields: Record<string, unknown> }> = [];
    for (const [p, f] of state.docs) if (p.startsWith(`${parent}/auditExpress/`)) out.push({ name: p, fields: f });
    return out;
  }),
}));

import store from '../../worker/src/routes/audit-express-store';
import { consumeTokens } from '../../worker/src/lib/tokens';
import { assembleSnapshot, extractPageSignals, type PageCapture } from '../../worker/src/lib/audit-express-extract';

const TAPS = { workflow: 'support', monthlyHours: 'high', hourlyCost: 'medium', aiUsage: 'team', shadowAi: 'no_visibility' };

const fakeR2 = {
  put: vi.fn(async (k: string, b: Uint8Array) => { state.r2.set(k, b); }),
  get: vi.fn(async (k: string) => (state.r2.has(k) ? { body: state.r2.get(k) } : null)),
  delete: vi.fn(async (k: string) => { state.r2.delete(k); }),
};
const ENV = { FIREBASE_PROJECT_ID: 'audit-ai', FIREBASE_SERVICE_ACCOUNT_JSON: '{}', AUDIT_PDFS: fakeR2, AUDIT_SHARE_SECRET: 'test-share-secret' } as unknown as Record<string, unknown>;
const ENV_NO_SHARE = { FIREBASE_PROJECT_ID: 'audit-ai', FIREBASE_SERVICE_ACCOUNT_JSON: '{}', AUDIT_PDFS: fakeR2 } as unknown as Record<string, unknown>;

function snapshot() {
  const html = '<!doctype html><html lang="en"><head><title>Acme Store</title></head><body><a href="/shop">Shop</a></body></html>';
  const caps: PageCapture[] = [{ url: 'https://acme.example/', status: 200, contentType: 'text/html', signals: extractPageSignals(html) }];
  return assembleSnapshot('https://acme.example/', caps);
}

function req(method: string, path: string, opts: { token?: string; body?: unknown } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = 'Bearer ' + opts.token;
  return store.request(path, { method, headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined }, ENV);
}

beforeEach(() => {
  state.members.clear(); state.docs.clear(); state.r2.clear();
  state.members.add('orgA/uid-1'); // uid-1 is a member of orgA only
  state.tokenResult = { ok: true, balanceAfter: 100, tokensConsumed: 10 };
  vi.clearAllMocks();
});
afterEach(() => { vi.unstubAllGlobals(); });

async function save(orgId: string, token = 'valid-token') {
  const res = await req('POST', '/api/audit-express/save', { token, body: { orgId, taps: TAPS, extractSnapshot: snapshot(), createdAt: '2026-06-05T00:00:00.000Z' } });
  return res;
}

describe('store route — auth + isolation', () => {
  it('anonymous save -> AUTH_REQUIRED + no-store', async () => {
    const res = await req('POST', '/api/audit-express/save', { body: { orgId: 'orgA', taps: TAPS } });
    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe('AUTH_REQUIRED');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
  it('member of A cannot save into org B (FORBIDDEN, no R2 write)', async () => {
    const res = await save('orgB');
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('FORBIDDEN');
    expect(state.r2.size).toBe(0);
  });
});

describe('store route — save/list/file/delete', () => {
  it('saves, lists (metadata only), downloads, and deletes', async () => {
    const s = await save('orgA');
    expect(s.status).toBe(200);
    const { auditId } = await s.json();
    expect(auditId).toBeTruthy();
    expect(state.r2.has(`pdf/orgA/${auditId}.pdf`)).toBe(true);

    const list = await req('GET', '/api/audit-express/list?orgId=orgA', { token: 'valid-token' });
    expect(list.status).toBe(200);
    const items = (await list.json()).items;
    expect(items.length).toBe(1);
    expect(items[0].auditId).toBe(auditId);
    expect(JSON.stringify(items[0])).not.toContain('snapshotJson'); // never leak inputs
    expect(JSON.stringify(items[0])).not.toContain('pdfKey');

    const file = await req('GET', `/api/audit-express/file/${auditId}?orgId=orgA`, { token: 'valid-token' });
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toContain('application/pdf');
    expect(file.headers.get('cache-control')).toBe('no-store');
    const buf = new Uint8Array(await file.arrayBuffer());
    expect(String.fromCharCode(buf[0], buf[1], buf[2], buf[3])).toBe('%PDF');

    const del = await req('DELETE', `/api/audit-express/${auditId}?orgId=orgA`, { token: 'valid-token' });
    expect(del.status).toBe(200);
    expect(state.r2.has(`pdf/orgA/${auditId}.pdf`)).toBe(false);
    expect(state.docs.has(`organizations/orgA/auditExpress/${auditId}`)).toBe(false);
  });

  it('no IDOR: a member of A cannot download an audit under org B', async () => {
    // Seed an audit that physically lives under orgB.
    state.docs.set('organizations/orgB/auditExpress/x1', { auditId: 'x1', pdfKey: 'pdf/orgB/x1.pdf' });
    state.r2.set('pdf/orgB/x1.pdf', new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    const file = await req('GET', '/api/audit-express/file/x1?orgId=orgB', { token: 'valid-token' });
    expect(file.status).toBe(403);
    expect((await file.json()).code).toBe('FORBIDDEN');
  });

  it('rejects invalid taps (authed)', async () => {
    const res = await req('POST', '/api/audit-express/save', { token: 'valid-token', body: { orgId: 'orgA', taps: { workflow: 'support' } } });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_TAPS');
  });

  it('dedupes: saving the same audit twice yields the same auditId (one doc)', async () => {
    const a = await (await save('orgA')).json();
    const b = await (await save('orgA')).json();
    expect(a.auditId).toBe(b.auditId);
    expect(state.docs.size).toBe(1);
    expect(state.r2.size).toBe(1);
  });
});

describe('store route — PDF fair-usage quota (3 free, then tokens)', () => {
  async function setupOneSavedAudit() {
    const { auditId } = await (await save('orgA')).json();
    return auditId as string;
  }
  function dl(auditId: string, useTokens = false) {
    return req('GET', `/api/audit-express/file/${auditId}?orgId=orgA${useTokens ? '&useTokens=1' : ''}`, { token: 'valid-token' });
  }

  it('allows 3 free downloads then returns PDF_LIMIT_REACHED', async () => {
    const id = await setupOneSavedAudit();
    for (let i = 0; i < 3; i++) expect((await dl(id)).status).toBe(200);
    const over = await dl(id);
    expect(over.status).toBe(402);
    expect((await over.json()).code).toBe('PDF_LIMIT_REACHED');
  });

  it('spends tokens past the free tier when useTokens=1', async () => {
    const id = await setupOneSavedAudit();
    for (let i = 0; i < 3; i++) await dl(id);
    const paid = await dl(id, true);
    expect(paid.status).toBe(200);
    expect(paid.headers.get('content-type')).toContain('application/pdf');
  });

  it('paid re-download of the SAME audit is idempotent (one charge id, not per-count)', async () => {
    const id = await setupOneSavedAudit();
    for (let i = 0; i < 3; i++) await dl(id);
    expect((await dl(id, true)).status).toBe(200);
    expect((await dl(id, true)).status).toBe(200);
    const calls = vi.mocked(consumeTokens).mock.calls;
    expect(calls.length).toBe(2);
    expect(calls[0][4]).toBe(calls[1][4]);     // same eventId => no double-charge
    expect(String(calls[0][4])).toContain(id); // idempotency keyed per audit
  });

  it('returns TOKENS_INSUFFICIENT when the balance is too low', async () => {
    const id = await setupOneSavedAudit();
    for (let i = 0; i < 3; i++) await dl(id);
    state.tokenResult = { ok: false, status: 402, balance: 0, required: 10 };
    const paid = await dl(id, true);
    expect(paid.status).toBe(402);
    expect((await paid.json()).code).toBe('TOKENS_INSUFFICIENT');
  });
});

describe('store route — authenticated in-app capture (preview / extract)', () => {
  it('preview: anonymous -> AUTH_REQUIRED; non-member -> FORBIDDEN; member -> 200', async () => {
    const anon = await req('POST', '/api/audit-express/preview', { body: { orgId: 'orgA', taps: TAPS } });
    expect(anon.status).toBe(401);
    expect((await anon.json()).code).toBe('AUTH_REQUIRED');

    const other = await req('POST', '/api/audit-express/preview', { token: 'valid-token', body: { orgId: 'orgB', taps: TAPS } });
    expect(other.status).toBe(403);

    const ok = await req('POST', '/api/audit-express/preview', { token: 'valid-token', body: { orgId: 'orgA', taps: TAPS } });
    expect(ok.status).toBe(200);
    expect(ok.headers.get('cache-control')).toBe('no-store'); // APIs must not be cached
    const j = await ok.json();
    expect(j.k1a).toBeTruthy();
    expect(j.k2a?.result?.estimatedMonthlyCostSaved).toBeGreaterThanOrEqual(0);
  });

  it('preview: invalid taps -> INVALID_TAPS', async () => {
    const res = await req('POST', '/api/audit-express/preview', { token: 'valid-token', body: { orgId: 'orgA', taps: { workflow: 'support' } } });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_TAPS');
  });

  it('extract: member + public site -> 200 snapshot (no Turnstile)', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (String(url).endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /', { status: 200, headers: { 'content-type': 'text/plain' } });
      return new Response('<!doctype html><html lang="en"><head><title>Acme Store</title></head><body><a href="/about">About</a></body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
    }));
    const res = await req('POST', '/api/audit-express/extract', { token: 'valid-token', body: { orgId: 'orgA', url: 'https://acme.example/' } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(typeof j.inputsHash).toBe('string');
    expect(j.understanding).toBeTruthy();
  });

  it('extract: missing url -> INVALID_URL; anonymous -> AUTH_REQUIRED', async () => {
    const noUrl = await req('POST', '/api/audit-express/extract', { token: 'valid-token', body: { orgId: 'orgA' } });
    expect(noUrl.status).toBe(400);
    expect((await noUrl.json()).code).toBe('INVALID_URL');

    const anon = await req('POST', '/api/audit-express/extract', { body: { orgId: 'orgA', url: 'https://acme.example/' } });
    expect(anon.status).toBe(401);
    expect((await anon.json()).code).toBe('AUTH_REQUIRED');
  });
});

describe('store route — titles + rename', () => {
  it('save assigns a meaningful default title (never "Unknown · Unknown")', async () => {
    const { auditId } = await (await save('orgA')).json();
    const list = await req('GET', '/api/audit-express/list?orgId=orgA', { token: 'valid-token' });
    const item = (await list.json()).items.find((i: { auditId: string }) => i.auditId === auditId);
    expect(item.title).toBeTruthy();
    expect(item.title).not.toBe('Unknown · Unknown');
    expect(item.title).not.toMatch(/unknown/i);
  });

  it('rename: sanitizes (PII + markup), regenerates the PDF, updates the list', async () => {
    const { auditId } = await (await save('orgA')).json();
    const before = state.r2.get(`pdf/orgA/${auditId}.pdf`);
    const res = await req('POST', `/api/audit-express/${auditId}/title`, { token: 'valid-token', body: { orgId: 'orgA', title: '  My Custom Audit <b>x</b> me@example.com  ' } });
    expect(res.status).toBe(200);
    const { title } = await res.json();
    expect(title).toContain('My Custom Audit');
    expect(title).not.toContain('me@example.com'); // PII scrubbed
    expect(title).not.toContain('<b>');            // markup stripped
    expect(state.r2.size).toBe(1);                 // same object, regenerated
    expect(state.r2.get(`pdf/orgA/${auditId}.pdf`)).not.toEqual(before);
    const list = await req('GET', '/api/audit-express/list?orgId=orgA', { token: 'valid-token' });
    expect((await list.json()).items[0].title).toBe(title);
  });

  it('rename: anonymous -> AUTH_REQUIRED; non-member -> FORBIDDEN; missing -> NOT_FOUND', async () => {
    const { auditId } = await (await save('orgA')).json();
    const anon = await req('POST', `/api/audit-express/${auditId}/title`, { body: { orgId: 'orgA', title: 'X' } });
    expect(anon.status).toBe(401);
    const other = await req('POST', `/api/audit-express/${auditId}/title`, { token: 'valid-token', body: { orgId: 'orgB', title: 'X' } });
    expect(other.status).toBe(403);
    const missing = await req('POST', '/api/audit-express/does-not-exist/title', { token: 'valid-token', body: { orgId: 'orgA', title: 'X' } });
    expect(missing.status).toBe(404);
  });
});

describe('store route — detail view (recomputed, no leak)', () => {
  it('member -> 200 with preview + understanding; never leaks snapshotJson/pdfKey', async () => {
    const { auditId } = await (await save('orgA')).json();
    const res = await req('GET', `/api/audit-express/detail/${auditId}?orgId=orgA`, { token: 'valid-token' });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const j = await res.json();
    expect(j.preview?.k2a?.result?.estimatedMonthlyCostSaved).toBeGreaterThanOrEqual(0);
    expect(j.understanding).toBeTruthy();
    expect(j.title).toBeTruthy();
    const raw = JSON.stringify(j);
    expect(raw).not.toContain('snapshotJson');
    expect(raw).not.toContain('pdfKey');
  });

  it('anonymous -> AUTH_REQUIRED; non-member -> FORBIDDEN; missing -> NOT_FOUND', async () => {
    const { auditId } = await (await save('orgA')).json();
    const anon = await req('GET', `/api/audit-express/detail/${auditId}?orgId=orgA`);
    expect(anon.status).toBe(401);
    const other = await req('GET', `/api/audit-express/detail/${auditId}?orgId=orgB`, { token: 'valid-token' });
    expect(other.status).toBe(403);
    const missing = await req('GET', '/api/audit-express/detail/nope?orgId=orgA', { token: 'valid-token' });
    expect(missing.status).toBe(404);
  });
});

describe('store route — shareable PDF links', () => {
  async function setup() {
    const { auditId } = await (await save('orgA')).json();
    return auditId as string;
  }
  const shareReq = (auditId: string, token = 'valid-token', orgId = 'orgA') =>
    req('POST', `/api/audit-express/${auditId}/share`, { token, body: { orgId } });

  it('member -> 200 { url, expiresAt }; anon -> 401; non-member -> 403; missing -> 404', async () => {
    const id = await setup();
    const ok = await shareReq(id);
    expect(ok.status).toBe(200);
    const j = await ok.json();
    expect(j.url).toContain('/api/audit-express/shared/');
    expect(typeof j.expiresAt).toBe('string');
    expect(ok.headers.get('cache-control')).toBe('no-store');

    expect((await req('POST', `/api/audit-express/${id}/share`, { body: { orgId: 'orgA' } })).status).toBe(401);
    expect((await shareReq(id, 'valid-token', 'orgB')).status).toBe(403);
    expect((await shareReq('nope')).status).toBe(404);
  });

  it('minting a link counts against the PDF quota (4th export blocked)', async () => {
    const id = await setup();
    for (let i = 0; i < 3; i++) await req('GET', `/api/audit-express/file/${id}?orgId=orgA`, { token: 'valid-token' });
    const blocked = await shareReq(id);
    expect(blocked.status).toBe(402);
    expect((await blocked.json()).code).toBe('PDF_LIMIT_REACHED');
  });

  it('public open: valid token -> PDF; tampered -> 401', async () => {
    const id = await setup();
    const j = await (await shareReq(id)).json();
    const token = j.url.split('/shared/')[1] as string;

    const open = await store.request(`/api/audit-express/shared/${token}`, { method: 'GET' }, ENV);
    expect(open.status).toBe(200);
    expect(open.headers.get('content-type')).toContain('application/pdf');
    expect(open.headers.get('cache-control')).toBe('no-store');
    const buf = new Uint8Array(await open.arrayBuffer());
    expect(String.fromCharCode(buf[0], buf[1], buf[2], buf[3])).toBe('%PDF');

    const [body, sig] = token.split('.');
    const bad = `${body.slice(0, -1)}${body.endsWith('A') ? 'B' : 'A'}.${sig}`;
    const tampered = await store.request(`/api/audit-express/shared/${bad}`, { method: 'GET' }, ENV);
    expect(tampered.status).toBe(401);
    expect((await tampered.json()).code).toBe('SHARE_INVALID');
  });

  it('SHARE_DISABLED (503) when the secret is unset', async () => {
    const id = await setup();
    const res = await store.request(`/api/audit-express/${id}/share`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer valid-token' }, body: JSON.stringify({ orgId: 'orgA' }),
    }, ENV_NO_SHARE);
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe('SHARE_DISABLED');
  });
});
