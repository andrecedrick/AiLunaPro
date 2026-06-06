import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared in-memory state (hoisted so vi.mock factories can close over it).
const state = vi.hoisted(() => ({
  members: new Map<string, string>(),          // `${orgId}/${uid}` -> role
  docs: new Map<string, Record<string, unknown>>(),
  tokenResult: { ok: true, balanceAfter: 100, tokensConsumed: 5 } as Record<string, unknown>,
}));

vi.mock('../../worker/src/lib/tokens', () => ({
  consumeTokens: vi.fn(async () => state.tokenResult),
}));

vi.mock('../../worker/src/middleware/auth', async (orig) => {
  const actual = await orig<typeof import('../../worker/src/middleware/auth')>();
  return {
    ...actual,
    verifyIdToken: vi.fn(async (token?: string) =>
      token === 'owner-token' ? 'uid-1' : token === 'member-token' ? 'uid-2' : token === 'outsider-token' ? 'uid-3' : null),
  };
});

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    const m = path.match(/^organizations\/([^/]+)\/members\/([^/]+)$/);
    if (m) { const role = state.members.get(`${m[1]}/${m[2]}`); return role ? { role } : null; }
    return state.docs.get(path) ?? null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
    const prev = opts?.merge ? (state.docs.get(path) ?? {}) : {};
    state.docs.set(path, { ...prev, ...data });
  }),
}));

import reports from '../../worker/src/routes/reports';

const ANSWERS = { 'profile.industry': 'finance', 'data.types': ['pii'], 'tools.scope': 'customer', 'train.maturity': '3' };
const ENV = { FIREBASE_PROJECT_ID: 'audit-ai', FIREBASE_SERVICE_ACCOUNT_JSON: '{}', AUDIT_SHARE_SECRET: 'test-share-secret' } as unknown as Record<string, unknown>;

function req(method: string, path: string, opts: { token?: string; body?: unknown } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = 'Bearer ' + opts.token;
  return reports.request(path, { method, headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined }, ENV);
}

beforeEach(() => {
  state.members.clear(); state.docs.clear();
  state.members.set('orgA/uid-1', 'owner');
  state.members.set('orgA/uid-2', 'member');
  state.tokenResult = { ok: true, balanceAfter: 100, tokensConsumed: 5 };
  state.docs.set('organizations/orgA/reports/r1', { id: 'r1', title: 'Finance AI Compliance Report', createdAt: '2026-05-24T00:00:00.000Z', status: 'published', answersSnapshot: ANSWERS, industry: 'finance' });
  state.docs.set('organizations/orgA/reports/r2', { id: 'r2', title: 'Draft report', createdAt: '2026-05-25T00:00:00.000Z', status: 'draft', answersSnapshot: ANSWERS });
  vi.clearAllMocks();
});

describe('reports route — detail (server recompute)', () => {
  it('member reads published -> recomputed summary; never leaks answersSnapshot', async () => {
    const res = await req('GET', '/api/reports/detail/r1?orgId=orgA', { token: 'member-token' });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const j = await res.json();
    expect(typeof j.globalScore).toBe('number');
    expect(typeof j.riskLevel).toBe('string');
    expect(j.findingsBySeverity).toBeTruthy();
    expect(Array.isArray(j.sectionScores)).toBe(true);
    expect(JSON.stringify(j)).not.toContain('answersSnapshot');
  });
  it('anon -> 401; outsider -> 403; member+draft -> 404; owner+draft -> 200', async () => {
    expect((await req('GET', '/api/reports/detail/r1?orgId=orgA')).status).toBe(401);
    expect((await req('GET', '/api/reports/detail/r1?orgId=orgA', { token: 'outsider-token' })).status).toBe(403);
    expect((await req('GET', '/api/reports/detail/r2?orgId=orgA', { token: 'member-token' })).status).toBe(404);
    expect((await req('GET', '/api/reports/detail/r2?orgId=orgA', { token: 'owner-token' })).status).toBe(200);
  });
});

describe('reports route — file (regenerated PDF + quota)', () => {
  const dl = (id: string, token: string, useTokens = false) =>
    req('GET', `/api/reports/file/${id}?orgId=orgA${useTokens ? '&useTokens=1' : ''}`, { token });

  it('published -> 200 PDF (no-store); member+draft -> 404', async () => {
    const res = await dl('r1', 'member-token');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    expect(res.headers.get('cache-control')).toBe('no-store');
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(String.fromCharCode(buf[0], buf[1], buf[2], buf[3])).toBe('%PDF');
    expect((await dl('r2', 'member-token')).status).toBe(404);
  });

  it('3 free then PDF_LIMIT_REACHED; useTokens -> 200', async () => {
    for (let i = 0; i < 3; i++) expect((await dl('r1', 'member-token')).status).toBe(200);
    const over = await dl('r1', 'member-token');
    expect(over.status).toBe(402);
    expect((await over.json()).code).toBe('PDF_LIMIT_REACHED');
    expect((await dl('r1', 'member-token', true)).status).toBe(200);
  });

  it('TOKENS_INSUFFICIENT when balance too low', async () => {
    for (let i = 0; i < 3; i++) await dl('r1', 'member-token');
    state.tokenResult = { ok: false, status: 402, balance: 0, required: 5 };
    const paid = await dl('r1', 'member-token', true);
    expect(paid.status).toBe(402);
    expect((await paid.json()).code).toBe('TOKENS_INSUFFICIENT');
  });
});

describe('reports route — title (rename, owner/admin only)', () => {
  it('owner renames (sanitized); member -> 403; missing -> 404', async () => {
    const ok = await req('POST', '/api/reports/r1/title', { token: 'owner-token', body: { orgId: 'orgA', title: '  My Report <b>x</b> me@example.com  ' } });
    expect(ok.status).toBe(200);
    const { title } = await ok.json();
    expect(title).toContain('My Report');
    expect(title).not.toContain('me@example.com');
    expect(title).not.toContain('<b>');
    expect(String(state.docs.get('organizations/orgA/reports/r1')!.title)).toBe(title);

    expect((await req('POST', '/api/reports/r1/title', { token: 'member-token', body: { orgId: 'orgA', title: 'X' } })).status).toBe(403);
    expect((await req('POST', '/api/reports/nope/title', { token: 'owner-token', body: { orgId: 'orgA', title: 'X' } })).status).toBe(404);
  });
});

describe('reports route — org isolation', () => {
  it('a member of orgA cannot read an orgB report', async () => {
    state.docs.set('organizations/orgB/reports/x1', { id: 'x1', status: 'published', answersSnapshot: ANSWERS, createdAt: '2026-05-01T00:00:00.000Z' });
    expect((await req('GET', '/api/reports/detail/x1?orgId=orgB', { token: 'owner-token' })).status).toBe(403);
    expect((await req('GET', '/api/reports/file/x1?orgId=orgB', { token: 'owner-token' })).status).toBe(403);
  });
});

describe('reports route — share lifecycle (Batch C)', () => {
  const tokenFrom = (url: string) => url.split('/shared/')[1] as string;
  const open = (token: string) => reports.request(`/api/reports/shared/${token}`, { method: 'GET' }, ENV);

  it('share: owner -> 200 {url}; member -> 403; published gating respected', async () => {
    const ok = await req('POST', '/api/reports/r1/share', { token: 'owner-token', body: { orgId: 'orgA' } });
    expect(ok.status).toBe(200);
    const j = await ok.json();
    expect(j.url).toContain('/api/reports/shared/');
    expect(typeof j.expiresAt).toBe('string');
    expect(ok.headers.get('cache-control')).toBe('no-store');

    expect((await req('POST', '/api/reports/r1/share', { token: 'member-token', body: { orgId: 'orgA' } })).status).toBe(403);
    expect((await req('POST', '/api/reports/r1/share', { body: { orgId: 'orgA' } })).status).toBe(401);
  });

  it('public open: valid -> PDF; tampered -> 401', async () => {
    const token = tokenFrom((await (await req('POST', '/api/reports/r1/share', { token: 'owner-token', body: { orgId: 'orgA' } })).json()).url);
    const res = await open(token);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    expect(res.headers.get('cache-control')).toBe('no-store');
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(String.fromCharCode(buf[0], buf[1], buf[2], buf[3])).toBe('%PDF');

    const [body, sig] = token.split('.');
    const bad = `${body.slice(0, -1)}${body.endsWith('A') ? 'B' : 'A'}.${sig}`;
    const tampered = await open(bad);
    expect(tampered.status).toBe(401);
    expect((await tampered.json()).code).toBe('SHARE_INVALID');
  });

  it('revoke: outstanding link dies immediately (SHARE_REVOKED 410)', async () => {
    const token = tokenFrom((await (await req('POST', '/api/reports/r1/share', { token: 'owner-token', body: { orgId: 'orgA' } })).json()).url);
    expect((await open(token)).status).toBe(200);
    const rev = await req('POST', '/api/reports/r1/revoke-share', { token: 'owner-token', body: { orgId: 'orgA' } });
    expect(rev.status).toBe(200);
    expect((await rev.json()).status).toBe('revoked');
    const after = await open(token);
    expect(after.status).toBe(410);
    expect((await after.json()).code).toBe('SHARE_REVOKED');
  });

  it('regenerate: old token dies, new token works', async () => {
    const oldTok = tokenFrom((await (await req('POST', '/api/reports/r1/share', { token: 'owner-token', body: { orgId: 'orgA' } })).json()).url);
    const newTok = tokenFrom((await (await req('POST', '/api/reports/r1/regenerate-share', { token: 'owner-token', body: { orgId: 'orgA' } })).json()).url);
    expect((await open(oldTok)).status).toBe(410);
    expect((await open(newTok)).status).toBe(200);
  });

  it('disable sharing: blocks create (403) and existing live links (403)', async () => {
    const token = tokenFrom((await (await req('POST', '/api/reports/r1/share', { token: 'owner-token', body: { orgId: 'orgA' } })).json()).url);
    const toggle = await req('POST', '/api/reports/r1/sharing', { token: 'owner-token', body: { orgId: 'orgA', disabled: true } });
    expect(toggle.status).toBe(200);
    expect((await toggle.json()).sharingDisabled).toBe(true);
    expect((await req('POST', '/api/reports/r1/share', { token: 'owner-token', body: { orgId: 'orgA' } })).status).toBe(403);
    const opened = await open(token);
    expect(opened.status).toBe(403);
    expect((await opened.json()).code).toBe('SHARE_DISABLED');
  });

  it('detail returns share metadata; cross-tenant share is forbidden', async () => {
    await req('POST', '/api/reports/r1/share', { token: 'owner-token', body: { orgId: 'orgA' } });
    const d = await req('GET', '/api/reports/detail/r1?orgId=orgA', { token: 'owner-token' });
    const j = await d.json();
    expect(typeof j.shareVersion).toBe('number');
    expect(j.sharedAt).toBeTruthy();
    expect(j.sharingDisabled).toBe(false);
    expect((await req('POST', '/api/reports/x1/share', { token: 'owner-token', body: { orgId: 'orgB' } })).status).toBe(403);
  });
});
