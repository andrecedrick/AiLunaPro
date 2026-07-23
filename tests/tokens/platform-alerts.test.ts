import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Platform production alerts route (read-only operator visibility).
 *
 * Proves: newest-first order, severity/status filters, open-critical count,
 * kind-agnostic passthrough of unknown alert types, no-PII (no email/uid in the
 * payload), a missing collection returns empty (not an error), and 503 without
 * Firestore.
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
  const mod = await import('../../worker/src/routes/platform-alerts');
  return mod.default;
}

const alertDoc = (id: string, kind: string, severity: string, at: string, extra: Record<string, unknown> = {}) => ({
  name: `projects/p/databases/(default)/documents/platform_alerts/${id}`,
  fields: { kind, severity, at, resolved: false, message: `${kind} happened`, ...extra },
});

async function call(qs = '') {
  const route = await loadRoute();
  const res = await route.request(`/api/platform/alerts${qs}`, {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

async function callNotify() {
  const route = await loadRoute();
  const res = await route.request('/api/platform/alerts/notify', {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

beforeEach(() => { q.docs = []; q.throwOnQuery = false; vi.resetModules(); });

describe('GET /api/platform/alerts', () => {
  it('returns alerts with an open-critical count', async () => {
    q.docs = [
      alertDoc('a1', 'topup_credit_failed', 'critical', '2026-07-23T02:00:00Z', { orgId: 'orgA', sessionId: 'cs_1', context: JSON.stringify({ tokensAdded: 1000, pack: 'pro' }) }),
      alertDoc('a2', 'invoice_amount_mismatch', 'critical', '2026-07-23T01:00:00Z', { orgId: 'orgB', invoiceId: 'inv_9', resolved: true }),
    ];
    const { status, body } = await call();
    expect(status).toBe(200);
    const alerts = body.alerts as unknown as Array<Record<string, unknown>>;
    expect(alerts).toHaveLength(2);
    expect(body.openCritical as unknown as number).toBe(1); // a1 open, a2 resolved
    // Context parsed from the JSON string.
    expect((alerts[0].context as Record<string, unknown>).tokensAdded).toBe(1000);
    expect(alerts[0].status).toBe('open');
    expect(alerts[1].status).toBe('resolved');
  });

  it('filters by severity and status', async () => {
    q.docs = [
      alertDoc('a1', 'topup_credit_failed', 'critical', '2026-07-23T02:00:00Z'),
      alertDoc('a2', 'some_warning', 'warning', '2026-07-23T01:00:00Z'),
      alertDoc('a3', 'topup_credit_recovered', 'warning', '2026-07-23T00:00:00Z', { resolved: true }),
    ];
    expect(((await call('?severity=critical')).body.alerts as unknown as unknown[]).length).toBe(1);
    expect(((await call('?status=resolved')).body.alerts as unknown as unknown[]).length).toBe(1);
  });

  it('passes through unknown/future alert kinds untouched', async () => {
    q.docs = [alertDoc('a1', 'future_kind_not_yet_defined', 'warning', '2026-07-23T02:00:00Z')];
    const alerts = (await call()).body.alerts as unknown as Array<{ kind: string }>;
    expect(alerts[0].kind).toBe('future_kind_not_yet_defined');
  });

  it('emits no PII — no email / uid in the payload', async () => {
    q.docs = [alertDoc('a1', 'topup_credit_failed', 'critical', '2026-07-23T02:00:00Z', {
      orgId: 'orgA', sessionId: 'cs_1', context: JSON.stringify({ tokensAdded: 500 }),
    })];
    const serialized = JSON.stringify((await call()).body);
    expect(serialized).not.toContain('@');
    expect(serialized).not.toContain('uid');
  });

  it('returns empty (not an error) when the collection has never been written', async () => {
    q.throwOnQuery = true;
    const { status, body } = await call();
    expect(status).toBe(200);
    expect(body.alerts as unknown as unknown[]).toHaveLength(0);
    expect(body.total as unknown as number).toBe(0);
  });

  it('503s when Firestore is not configured', async () => {
    const route = await loadRoute();
    const res = await route.request('/api/platform/alerts', {}, {});
    expect(res.status).toBe(503);
  });
});

describe("GET /api/platform/alerts/notify", () => {
  it("counts only OPEN CRITICAL alerts and reports the newest kind", async () => {
    q.docs = [
      alertDoc("a1", "topup_credit_failed", "critical", "2026-07-23T03:00:00Z"),
      alertDoc("a2", "invoice_amount_mismatch", "critical", "2026-07-23T02:00:00Z", { resolved: true }),
      alertDoc("a3", "some_warning", "warning", "2026-07-23T01:00:00Z"),
    ];
    const { status, body } = await callNotify();
    expect(status).toBe(200);
    expect(body.openCritical as unknown as number).toBe(1);       // a1 only (a2 resolved, a3 warning)
    expect(body.latestKind as unknown as string).toBe("topup_credit_failed");
  });

  it("no PII in the notify signal (count + kind slug + timestamp only)", async () => {
    q.docs = [alertDoc("a1", "topup_credit_failed", "critical", "2026-07-23T03:00:00Z", { orgId: "orgSecret", sessionId: "cs_x" })];
    const s = JSON.stringify((await callNotify()).body);
    expect(s).not.toContain("orgSecret");
    expect(s).not.toContain("@");
    expect(s).not.toContain("uid");
  });

  it("fail-quiet: zero on a missing collection", async () => {
    q.throwOnQuery = true;
    const { status, body } = await callNotify();
    expect(status).toBe(200);
    expect(body.openCritical as unknown as number).toBe(0);
  });
});
