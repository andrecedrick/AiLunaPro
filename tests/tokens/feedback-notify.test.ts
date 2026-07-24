import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Feedback notification (Customer Response Center, Phase 1).
 *
 * Proves: a submitted feedback still SAVES, and additionally records a durable
 * platform_alerts/feedback_received__{id} alert (severity 'warning' so it does
 * not inflate open-critical) and sends the feedback-admin email to ADMIN_EMAIL.
 * Both notifications are best-effort: a failure in either never fails the save.
 */

const store = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), alertThrows: false, emailThrows: false, emailCalls: [] as Array<Record<string, unknown>> }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreSet: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>) => {
    if (store.alertThrows && p.startsWith('platform_alerts/')) throw new Error('alert write failed');
    store.docs.set(p, { ...data });
  }),
  fsTimestamp: vi.fn((iso: string) => ({ timestampValue: iso })),
}));
vi.mock('../../worker/src/lib/rateLimit', () => ({
  checkCooldown: vi.fn(async () => ({ ok: true })),
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_key: string, payload: Record<string, unknown>) => {
    if (store.emailThrows) throw new Error('email failed');
    store.emailCalls.push(payload); return { ok: true };
  }),
}));

import { sendTransactional } from '../../worker/src/lib/sequenzy';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}', ADMIN_EMAIL: 'ops@ailunapro.com', SEQUENZY_API_KEY: 'k' };

async function submit(fb: Record<string, unknown>, env: Record<string, unknown> = ENV) {
  const route = (await import('../../worker/src/routes/feedback-public')).default;
  const res = await route.request('/api/public/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fb),
  }, env);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

const validFb = { source: 'quote', satisfaction: 5, difficulty: 'easy', blocker: 'Quote pricing', suggestion: 'cheaper' };

beforeEach(() => { store.docs.clear(); store.alertThrows = false; store.emailThrows = false; store.emailCalls = []; vi.resetModules(); });

describe('feedback notification', () => {
  it('saves the feedback AND records a durable alert AND emails the admin', async () => {
    const { status, body } = await submit(validFb);
    expect(status).toBe(200);
    const id = body.id as unknown as string;
    // Feedback persisted.
    expect(store.docs.has(`public_feedback/${id}`)).toBe(true);
    // Durable alert, warning severity, idempotent id keyed by the feedback id.
    const alert = [...store.docs.entries()].find(([k]) => k.startsWith('platform_alerts/feedback_received__'));
    expect(alert).toBeTruthy();
    expect(alert![1].severity).toBe('warning');
    expect(alert![1].resolved).toBe(false);
    // Admin email sent with the non-PII fields.
    expect(sendTransactional).toHaveBeenCalled();
    expect(store.emailCalls[0].slug).toBe('feedback-admin');
  });

  it('still saves feedback when the ALERT write fails', async () => {
    store.alertThrows = true;
    const { status, body } = await submit(validFb);
    expect(status).toBe(200);
    expect(store.docs.has(`public_feedback/${body.id as unknown as string}`)).toBe(true);
  });

  it('still saves feedback when the EMAIL fails', async () => {
    store.emailThrows = true;
    const { status, body } = await submit(validFb);
    expect(status).toBe(200);
    expect(store.docs.has(`public_feedback/${body.id as unknown as string}`)).toBe(true);
  });

  it('does not email when ADMIN_EMAIL is unset', async () => {
    await submit(validFb, { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}' });
    expect(sendTransactional).not.toHaveBeenCalled();
  });
});
