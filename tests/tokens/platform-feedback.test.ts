import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Customer Feedback Center + Support Inbox (read-only operator surfaces).
 *
 * Proves: feedback aggregation is DETERMINISTIC (exact counts, no inference),
 * positive/negative percentages + average difficulty are arithmetic, signals are
 * case/whitespace-normalised exact tallies, feedback carries no PII, support
 * returns the contact details an operator needs, topPages counts ticket origins,
 * and an unwritten collection returns empty rather than an error.
 */

const q = vi.hoisted(() => ({ docs: [] as Array<{ name: string; fields: Record<string, unknown> }>, throwOnQuery: false }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async (_sa: string, sq: { limit?: number }) => {
    if (q.throwOnQuery) throw new Error('collection missing');
    return q.docs.slice(0, sq.limit ?? q.docs.length);
  }),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  requirePlatformAdmin: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
}));

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}' };

async function loadRoute() {
  const mod = await import('../../worker/src/routes/platform-feedback');
  return mod.default;
}

const fb = (id: string, o: Partial<{ source: string; satisfaction: string; difficulty: string; blocker: string; suggestion: string; country: string; createdAt: string }>) => ({
  name: `projects/p/databases/(default)/documents/public_feedback/${id}`,
  fields: {
    source: o.source ?? 'quote', satisfaction: o.satisfaction ?? '', difficulty: o.difficulty ?? '',
    blocker: o.blocker ?? '', suggestion: o.suggestion ?? '',
    cf: { country: o.country ?? 'FR' }, createdAt: o.createdAt ?? '2026-07-23T10:00:00Z',
  },
});

const tk = (id: string, o: Partial<{ type: string; status: string; email: string; phone: string; route: string; description: string; createdAt: string }>) => ({
  name: `projects/p/databases/(default)/documents/support_tickets/${id}`,
  fields: {
    type: o.type ?? 'bug', status: o.status ?? 'open', email: o.email ?? 'a@b.com',
    phone: o.phone ?? '+33612345678', description: o.description ?? 'it broke',
    context: { route: o.route ?? 'quote' }, cf: { country: 'FR' },
    createdAt: o.createdAt ?? '2026-07-23T10:00:00Z',
  },
});

async function callFeedback() {
  const route = await loadRoute();
  const res = await route.request('/api/platform/feedback', {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}
async function callSupport(qs = '') {
  const route = await loadRoute();
  const res = await route.request(`/api/platform/support${qs}`, {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

beforeEach(() => { q.docs = []; q.throwOnQuery = false; vi.resetModules(); });

describe('GET /api/platform/feedback', () => {
  it('computes positive/negative percentages and average difficulty arithmetically', async () => {
    q.docs = [
      fb('1', { satisfaction: 'good', difficulty: '2' }),
      fb('2', { satisfaction: 'good', difficulty: '4' }),
      fb('3', { satisfaction: 'bad',  difficulty: '3' }),
      fb('4', { satisfaction: '' }),   // unrated → excluded from percentages
    ];
    const { status, body } = await callFeedback();
    expect(status).toBe(200);
    expect(body.total as unknown as number).toBe(4);
    expect(body.rated as unknown as number).toBe(3);
    expect(body.positivePct as unknown as number).toBe(67);  // 2/3
    expect(body.negativePct as unknown as number).toBe(33);  // 1/3
    expect(body.avgDifficulty as unknown as number).toBe(3); // (2+4+3)/3
  });

  it('tallies blockers by EXACT normalised count — no summarisation', async () => {
    q.docs = [
      fb('1', { blocker: 'Quote pricing' }),
      fb('2', { blocker: 'quote pricing' }),   // case-insensitive → same bucket
      fb('3', { blocker: 'Quote pricing.' }),  // trailing punctuation → same bucket
      fb('4', { blocker: 'Login issue' }),
    ];
    const top = (await callFeedback()).body.topBlockers as unknown as Array<{ value: string; count: number }>;
    expect(top[0].count).toBe(3);
    expect(top[0].value.toLowerCase()).toContain('quote pricing');
    expect(top[1].count).toBe(1);
  });

  it('ranks suggestions and sources deterministically', async () => {
    q.docs = [
      fb('1', { suggestion: 'more templates', source: 'roi' }),
      fb('2', { suggestion: 'more templates', source: 'roi' }),
      fb('3', { suggestion: 'faster export', source: 'quote' }),
    ];
    const body = (await callFeedback()).body;
    const sugg = body.topSuggestions as unknown as Array<{ value: string; count: number }>;
    const src  = body.topSources as unknown as Array<{ value: string; count: number }>;
    expect(sugg[0]).toMatchObject({ value: 'more templates', count: 2 });
    expect(src[0]).toMatchObject({ value: 'roi', count: 2 });
  });

  it('returns NO PII — feedback carries no email/uid/orgId', async () => {
    q.docs = [fb('1', { blocker: 'x', satisfaction: 'good' })];
    const s = JSON.stringify((await callFeedback()).body);
    expect(s).not.toContain('@');
    expect(s).not.toContain('uid');
    expect(s).not.toContain('orgId');
  });

  it('returns empty (not an error) when never written', async () => {
    q.throwOnQuery = true;
    const { status, body } = await callFeedback();
    expect(status).toBe(200);
    expect(body.total as unknown as number).toBe(0);
    expect(body.topBlockers as unknown as unknown[]).toHaveLength(0);
  });

  it('503s without Firestore', async () => {
    const route = await loadRoute();
    expect((await route.request('/api/platform/feedback', {}, {})).status).toBe(503);
  });
});

describe('GET /api/platform/support', () => {
  it('returns tickets with the contact details an operator needs', async () => {
    q.docs = [tk('t1', { email: 'ops@corp.com', phone: '+33612345678', type: 'billing', route: 'billing' })];
    const items = (await callSupport()).body.items as unknown as Array<Record<string, string>>;
    expect(items[0].email).toBe('ops@corp.com');
    expect(items[0].phone).toBe('+33612345678');
    expect(items[0].type).toBe('billing');
    expect(items[0].page).toBe('billing');   // from context.route
  });

  it('counts open tickets and the most problematic pages', async () => {
    q.docs = [
      tk('t1', { route: 'quote', status: 'open' }),
      tk('t2', { route: 'quote', status: 'open' }),
      tk('t3', { route: 'billing', status: 'closed' }),
    ];
    const body = (await callSupport()).body;
    expect(body.total as unknown as number).toBe(3);
    expect(body.open as unknown as number).toBe(2);
    const pages = body.topPages as unknown as Array<{ value: string; count: number }>;
    expect(pages[0]).toMatchObject({ value: 'quote', count: 2 });
  });

  it('filters by status', async () => {
    q.docs = [tk('t1', { status: 'open' }), tk('t2', { status: 'closed' })];
    const items = (await callSupport('?status=open')).body.items as unknown as unknown[];
    expect(items).toHaveLength(1);
  });

  it('returns empty (not an error) when never written', async () => {
    q.throwOnQuery = true;
    const { status, body } = await callSupport();
    expect(status).toBe(200);
    expect(body.total as unknown as number).toBe(0);
  });
});
