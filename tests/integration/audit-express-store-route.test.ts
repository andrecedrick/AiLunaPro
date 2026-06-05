import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared in-memory state (hoisted so the vi.mock factories can close over it).
const state = vi.hoisted(() => ({
  members: new Set<string>(),                 // `${orgId}/${uid}`
  docs: new Map<string, Record<string, unknown>>(),
  r2: new Map<string, Uint8Array>(),
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
import { assembleSnapshot, extractPageSignals, type PageCapture } from '../../worker/src/lib/audit-express-extract';

const TAPS = { workflow: 'support', monthlyHours: 'high', hourlyCost: 'medium', aiUsage: 'team', shadowAi: 'no_visibility' };

const fakeR2 = {
  put: vi.fn(async (k: string, b: Uint8Array) => { state.r2.set(k, b); }),
  get: vi.fn(async (k: string) => (state.r2.has(k) ? { body: state.r2.get(k) } : null)),
  delete: vi.fn(async (k: string) => { state.r2.delete(k); }),
};
const ENV = { FIREBASE_PROJECT_ID: 'audit-ai', FIREBASE_SERVICE_ACCOUNT_JSON: '{}', AUDIT_PDFS: fakeR2 } as unknown as Record<string, unknown>;

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
  vi.clearAllMocks();
});

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
    expect(state.docs.size).toBe(0);
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
});
