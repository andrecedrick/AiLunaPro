import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Notification bell feed + observable email (Global Notification fix).
 *
 * Proves: the bell feed merges open alerts + awaiting tickets + recent feedback;
 * resolved alerts are excluded; count = open-critical + awaiting; newest-first;
 * no-PII (no email/description); and sendObservableEmail records a durable
 * notification_email_failed alert on failure (no silent failures).
 */

const store = vi.hoisted(() => ({
  bytKind: new Map<string, Array<{ name: string; fields: Record<string, unknown> }>>(),
  alerts: [] as Record<string, unknown>[],
  emailOk: true,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async (_sa: string, sq: { from: Array<{ collectionId: string }> }) => {
    const col = sq.from[0].collectionId;
    return store.bytKind.get(col) ?? [];
  }),
  firestoreSet: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>) => {
    if (p.startsWith('platform_alerts/')) store.alerts.push({ path: p, ...data });
  }),
  firestoreGet: vi.fn(async () => null),
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async () => ({ ok: store.emailOk, error: store.emailOk ? undefined : 'template missing' })),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => { c.set('email', 'op@x.com'); await next(); },
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  requirePlatformAdmin: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
}));

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}' };
const doc = (col: string, id: string, fields: Record<string, unknown>) =>
  ({ name: `projects/p/databases/(default)/documents/${col}/${id}`, fields });

async function notif() {
  const route = (await import('../../worker/src/routes/platform-feedback')).default;
  const res = await route.request('/api/platform/notifications', {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

beforeEach(() => { store.bytKind.clear(); store.alerts = []; store.emailOk = true; vi.resetModules(); });

describe('GET /api/platform/notifications (bell feed)', () => {
  it('merges open alerts + awaiting tickets + feedback, newest-first', async () => {
    store.bytKind.set('platform_alerts', [
      doc('platform_alerts', 'al1', { kind: 'topup_credit_failed', severity: 'critical', message: 'credit failed', resolved: false, at: '2026-07-25T03:00:00Z' }),
      doc('platform_alerts', 'al2', { kind: 'feedback_received', severity: 'warning', message: 'fb', resolved: true, at: '2026-07-25T02:00:00Z' }), // resolved → excluded
    ]);
    store.bytKind.set('support_tickets', [
      doc('support_tickets', 't1', { id: 't1', type: 'bug', status: 'open', email: 'cust@x.com', description: 'secret', context: { route: 'quote' }, createdAt: '2026-07-25T04:00:00Z' }),
      doc('support_tickets', 't2', { id: 't2', type: 'bug', status: 'closed', createdAt: '2026-07-25T01:00:00Z' }), // not awaiting
    ]);
    store.bytKind.set('public_feedback', [
      doc('public_feedback', 'f1', { id: 'f1', source: 'roi', createdAt: '2026-07-25T05:00:00Z' }),
    ]);

    const { status, body } = await notif();
    expect(status).toBe(200);
    const items = body.items as unknown as Array<{ type: string; at: string }>;
    // feedback(05) > ticket(04) > alert(03); resolved alert + closed ticket excluded.
    expect(items.map(i => i.type)).toEqual(['feedback', 'ticket', 'alert']);
    // count = open critical (1) + awaiting tickets (1).
    expect(body.count as unknown as number).toBe(2);
    expect(body.openCritical as unknown as number).toBe(1);
    expect(body.awaiting as unknown as number).toBe(1);
  });

  it('emits NO PII — no email/description in the feed', async () => {
    store.bytKind.set('support_tickets', [
      doc('support_tickets', 't1', { id: 't1', type: 'bug', status: 'open', email: 'secret@x.com', description: 'confidential', context: { route: 'quote' }, createdAt: '2026-07-25T04:00:00Z' }),
    ]);
    const s = JSON.stringify((await notif()).body);
    expect(s).not.toContain('secret@x.com');
    expect(s).not.toContain('confidential');
  });

  it('empty when nothing recorded (not an error)', async () => {
    const { status, body } = await notif();
    expect(status).toBe(200);
    expect(body.count as unknown as number).toBe(0);
    expect(body.items as unknown as unknown[]).toHaveLength(0);
  });
});

describe('sendObservableEmail — no silent failures', () => {
  it('records a notification_email_failed alert when the send fails', async () => {
    store.emailOk = false;
    const { sendObservableEmail } = await import('../../worker/src/lib/billing-alerts');
    const r = await sendObservableEmail('sa', 'key', { to: 'a@b.com', slug: 'feedback-admin', variables: {} }, 'ref1');
    expect(r.ok).toBe(false);
    const alert = store.alerts.find(a => (a.path as string).includes('notification_email_failed'));
    expect(alert).toBeTruthy();
    expect(alert!.severity).toBe('warning');
    // The alert carries the template + reason, NOT the recipient.
    const ctx = JSON.parse(alert!.context as string) as Record<string, string>;
    expect(ctx.template).toBe('feedback-admin');
    expect(JSON.stringify(alert)).not.toContain('a@b.com');
  });

  it('does NOT record an alert on a successful send', async () => {
    store.emailOk = true;
    const { sendObservableEmail } = await import('../../worker/src/lib/billing-alerts');
    const r = await sendObservableEmail('sa', 'key', { to: 'a@b.com', slug: 'feedback-admin', variables: {} }, 'ref2');
    expect(r.ok).toBe(true);
    expect(store.alerts.find(a => (a.path as string).includes('notification_email_failed'))).toBeUndefined();
  });
});
