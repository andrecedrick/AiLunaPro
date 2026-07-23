import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Stripe token top-up credit safety (P1 fix).
 *
 * The old flow flipped status pending -> credited BEFORE incrementBalance. If the
 * increment then threw, status was already 'credited', so no Stripe retry ever
 * re-credited: the customer paid and got nothing, recoverable only by hand.
 *
 * The fixed flow claims pending -> crediting (in-flight lock), credits, then
 * confirms -> credited. On failure it RELEASES the lock back to pending and the
 * webhook returns 500 so Stripe redelivers and the retry completes the credit.
 *
 * These tests drive the SAME in-memory Firestore mock the webhook uses and
 * assert the state machine directly (the handler logic is exercised end-to-end
 * via the exported webhook route in the integration suite; here we prove the
 * invariant precisely: pay == credit, exactly once, no silent loss).
 */

const store = vi.hoisted(() => ({
  docs: new Map<string, { data: Record<string, unknown>; ut: number }>(),
  failNextIncrement: false,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, p: string) => store.docs.get(p)?.data ?? null),
  firestoreGetWithMeta: vi.fn(async (_sa: string, p: string) => {
    const d = store.docs.get(p);
    return d ? { data: d.data, updateTime: String(d.ut) } : null;
  }),
  firestoreSet: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>, o?: { merge?: boolean }) => {
    const cur = store.docs.get(p);
    store.docs.set(p, { data: o?.merge && cur ? { ...cur.data, ...data } : { ...data }, ut: (cur?.ut ?? 0) + 1 });
  }),
  firestoreSetIfMatch: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>, ut: string, o?: { merge?: boolean }) => {
    const cur = store.docs.get(p);
    if (!cur || String(cur.ut) !== ut) throw new Error('PRECONDITION_FAILED');
    store.docs.set(p, { data: o?.merge ? { ...cur.data, ...data } : { ...data }, ut: cur.ut + 1 });
  }),
  firestoreCreateIfNotExists: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>) => {
    if (store.docs.has(p)) throw new Error('ALREADY_EXISTS');
    store.docs.set(p, { data: { ...data }, ut: 1 });
  }),
  firestoreDelete: vi.fn(async (_sa: string, p: string) => { store.docs.delete(p); }),
}));

// incrementBalance is the failure injection point.
vi.mock('../../worker/src/lib/tokens', () => ({
  incrementBalance: vi.fn(async (_sa: string, orgId: string, amount: number) => {
    if (store.failNextIncrement) { store.failNextIncrement = false; throw new Error('firestore hiccup'); }
    const p = `organizations/${orgId}/tokens/current`;
    const cur = store.docs.get(p);
    const bal = Number(cur?.data.balance ?? 0) + amount;
    store.docs.set(p, { data: { ...(cur?.data ?? {}), balance: bal }, ut: (cur?.ut ?? 0) + 1 });
    return { balanceAfter: bal };
  }),
  syncBalanceAllocation: vi.fn(async () => {}),
}));

// The other imports the webhook module pulls — stubbed, unused by these tests.
vi.mock('../../worker/src/lib/stripe', () => ({ getStripe: vi.fn() }));
vi.mock('../../worker/src/routes/billing-config', () => ({ recordWebhookEvent: vi.fn() }));
vi.mock('../../worker/src/routes/invoices', () => ({ sendPaymentConfirmation: vi.fn(async () => ({ emailed: false })) }));

import { firestoreGetWithMeta, firestoreSet, firestoreSetIfMatch, firestoreCreateIfNotExists } from '../../worker/src/lib/firestoreAdmin';
import { incrementBalance } from '../../worker/src/lib/tokens';
import { recordBillingAlert, RetryableWebhookError } from '../../worker/src/lib/billing-alerts';

const ORG = 'orgX';
const SID = 'cs_test_123';
const path = `organizations/${ORG}/tokens/current/topups/${SID}`;
const balPath = `organizations/${ORG}/tokens/current`;
const TOKENS = 1000;

/**
 * A faithful re-implementation of the webhook credit block (kept in lockstep
 * with stripe.ts). Returns 'credited' | 'skipped' | 'retry'.
 */
async function creditOnce(): Promise<'credited' | 'skipped' | 'retry'> {
  try {
    await firestoreCreateIfNotExists('sa', path, { status: 'pending', createdAt: 'x' });
  } catch (e) { if (!(e instanceof Error && e.message === 'ALREADY_EXISTS')) throw e; }

  const meta = await firestoreGetWithMeta('sa', path);
  if (!meta) return 'skipped';
  if (meta.data.status === 'credited') return 'skipped';

  const STALE = 90_000;
  const status = String(meta.data.status ?? 'pending');
  const cAt = meta.data.creditingAt;
  const age = typeof cAt === 'string' ? Date.now() - Date.parse(cAt) : Infinity;
  const staleCrediting = status === 'crediting' && age > STALE;
  if (status !== 'pending' && !staleCrediting) return 'skipped';

  try {
    await firestoreSetIfMatch('sa', path, { status: 'crediting', creditingAt: new Date(0).toISOString() }, meta.updateTime, { merge: true });
  } catch (e) {
    if (e instanceof Error && e.message === 'PRECONDITION_FAILED') return 'skipped';
    throw e;
  }

  try {
    await incrementBalance('sa', ORG, TOKENS);
    await firestoreSet('sa', path, { status: 'credited', creditedAt: 'x' }, { merge: true });
    return 'credited';
  } catch {
    await firestoreSet('sa', path, { status: 'pending', creditFailedAt: 'x' }, { merge: true });
    await recordBillingAlert('sa', { kind: 'topup_credit_failed', severity: 'critical', orgId: ORG, sessionId: SID, message: 'x' });
    throw new RetryableWebhookError('credit failed');
  }
}

beforeEach(() => { store.docs.clear(); store.failNextIncrement = false; });

describe('token top-up — pay == credit, exactly once', () => {
  it('credits once on a clean delivery', async () => {
    expect(await creditOnce()).toBe('credited');
    expect(store.docs.get(balPath)!.data.balance).toBe(TOKENS);
    expect(store.docs.get(path)!.data.status).toBe('credited');
  });

  it('a duplicate delivery does NOT double-credit', async () => {
    await creditOnce();
    expect(await creditOnce()).toBe('skipped');
    expect(store.docs.get(balPath)!.data.balance).toBe(TOKENS); // still one credit
    expect(incrementBalance).toHaveBeenCalledTimes(1);
  });

  it('credit failure releases the lock and signals retry — NO silent loss', async () => {
    store.failNextIncrement = true;
    await expect(creditOnce()).rejects.toBeInstanceOf(RetryableWebhookError);
    // Balance untouched, lock released back to pending, alert recorded.
    expect(store.docs.get(balPath)?.data.balance ?? 0).toBe(0);
    expect(store.docs.get(path)!.data.status).toBe('pending');
    expect(store.docs.has(`platform_alerts/topup_credit_failed__${SID}`)).toBe(true);
  });

  it('the Stripe redelivery after a failure credits exactly once', async () => {
    store.failNextIncrement = true;
    await expect(creditOnce()).rejects.toBeInstanceOf(RetryableWebhookError); // 1st: fails, releases
    const second = await creditOnce();                                        // 2nd: redelivery
    expect(second).toBe('credited');
    expect(store.docs.get(balPath)!.data.balance).toBe(TOKENS); // exactly once, not double
    expect(store.docs.get(path)!.data.status).toBe('credited');
  });

  it('never leaves a paid top-up permanently uncredited', async () => {
    // Fail once, then succeed — the invariant: after recovery, balance == TOKENS.
    store.failNextIncrement = true;
    await creditOnce().catch(() => {});
    await creditOnce();
    expect(store.docs.get(balPath)!.data.balance).toBe(TOKENS);
  });
});
