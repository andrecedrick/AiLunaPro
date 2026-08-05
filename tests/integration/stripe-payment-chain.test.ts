import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * BUG 0/4 — THE MISSING SEAM. The Stripe webhook is the module that finalizes every
 * payment (invoice → paid, quote stage mirror, confirmation email) and it had ZERO
 * tests: every quote/invoice regression this arc lived exactly here, in the seam
 * between modules that each looked correct alone.
 *
 * This suite drives the REAL handler end-to-end with only the external edges stubbed
 * (Stripe signature, Firestore, Sequenzy) and asserts the COMPLETE final state:
 *   invoice paid + amount + stripe session id
 *   quote stage mirrored to 'paid'  (feeds admin + platform activity feeds)
 *   payment-confirmation email sent to the customer with the right amount
 *   exact-amount reconcile (a wrong amount must NEVER mark paid)
 *   idempotency (a Stripe retry must not double-send / double-pay)
 */

const state = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>() }));
const seq = vi.hoisted(() => ({ sends: [] as Array<Record<string, unknown>> }));
const evt = vi.hoisted(() => ({ current: null as unknown }));
/** What the route actually handed to Stripe's verifier — the secret is the point. */
const verifyArgs = vi.hoisted(() => ({ secret: null as string | null }));

vi.mock('../../worker/src/lib/stripe', () => ({
  getStripe: () => ({
    webhooks: {
      constructEventAsync: async (_body: string, _sig: string, secret: string) => {
        verifyArgs.secret = secret;
        return evt.current;
      },
    },
  }),
}));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => state.docs.get(path) ?? null),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    state.docs.set(path, { ...(state.docs.get(path) ?? {}), ...data });
  }),
  firestoreGetWithMeta: vi.fn(async () => null),
  firestoreSetIfMatch: vi.fn(async () => true),
  firestoreCreateIfNotExists: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    if (state.docs.has(path)) throw new Error('ALREADY_EXISTS');
    state.docs.set(path, { ...data });
  }),
  firestoreRunQuery: vi.fn(async () => []),
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_k: string, p: Record<string, unknown>) => { seq.sends.push(p); return { ok: true }; }),
}));
vi.mock('../../worker/src/routes/billing-config', () => ({ recordWebhookEvent: vi.fn() }));
vi.mock('../../worker/src/lib/tokens', () => ({ incrementBalance: vi.fn(), syncBalanceAllocation: vi.fn() }));

import stripeRoute from '../../worker/src/routes/stripe';

const ENV = {
  STRIPE_SECRET_KEY: 'sk_test', STRIPE_WEBHOOK_SECRET: 'whsec', FIREBASE_SERVICE_ACCOUNT_JSON: '{}',
  SEQUENZY_API_KEY: 'k', ADMIN_EMAIL: 'admin@x.com', APP_BASE_URL: 'https://audit.ailunapro.com',
} as unknown as Record<string, unknown>;

const postWith = (env: Record<string, unknown>) => stripeRoute.request('/api/stripe/webhook', {
  method: 'POST', headers: { 'Stripe-Signature': 'sig', 'Content-Type': 'application/json' }, body: '{}',
}, env);

const post = () => postWith(ENV);

/** A completed Checkout Session for an invoice payment (what Stripe sends on pay). */
const paymentEvent = (amountTotalCents: number) => ({
  id: 'evt_1', type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_1', amount_total: amountTotalCents, metadata: { type: 'invoice_payment', invoiceId: 'quote_q1', orgId: 'orgA' } } },
});

beforeEach(() => {
  state.docs.clear(); seq.sends.length = 0;
  // The pre-payment world: an invoice awaiting payment + its quote.
  state.docs.set('invoices/quote_q1', {
    id: 'quote_q1', quoteId: 'q1', orgId: 'orgA', quoteTitle: 'Acme bot', customerEmail: 'client@co.com',
    amount: 6500, currency: 'usd', status: 'pending', paymentMethod: 'stripe', createdAt: '2026-07-14T00:00:00.000Z',
  });
  state.docs.set('organizations/orgA/quotes/q1', { price: 6500, stage: 'invoice_sent', customerEmail: 'client@co.com' });
  evt.current = paymentEvent(650_000);   // $6,500 in cents — the exact invoice amount
});

describe('BUG 0/4 — Stripe payment → complete finalized state (the previously untested seam)', () => {
  it('an exact-amount payment finalizes EVERYTHING: invoice paid + quote mirrored + confirmation email', async () => {
    const res = await post();
    expect(res.status).toBe(200);
    expect((await res.json() as { received: boolean }).received).toBe(true);

    // 1 — invoice is the final paid state
    const inv = state.docs.get('invoices/quote_q1')!;
    expect(inv.status).toBe('paid');
    expect(inv.paidAmount).toBe(650_000);
    expect(inv.stripeSessionId).toBe('cs_test_1');
    expect(typeof inv.paidAt).toBe('string');

    // 2 — quote synchronized (this mirror feeds the admin + platform activity feeds)
    const quote = state.docs.get('organizations/orgA/quotes/q1')!;
    expect(quote.stage).toBe('paid');
    expect(typeof quote.paidAt).toBe('string');

    // 3 — the customer gets the payment confirmation, with the right amount
    const conf = seq.sends.find(s => s.slug === 'payment-confirmation');
    expect(conf).toBeTruthy();
    expect(conf!.to).toBe('client@co.com');
    expect((conf!.variables as Record<string, string>).AMOUNT).toBe('$6,500');
    expect((conf!.variables as Record<string, string>).REFERENCE).toBe('q1');
  });

  it('a WRONG amount never marks paid — flagged for review, no confirmation email, quote untouched', async () => {
    evt.current = paymentEvent(100);   // $1 against a $6,500 invoice
    const res = await post();
    expect(res.status).toBe(200);
    const inv = state.docs.get('invoices/quote_q1')!;
    expect(inv.status).toBe('pending');            // NOT paid
    expect(inv.amountMismatch).toBe(true);         // flagged
    expect(state.docs.get('organizations/orgA/quotes/q1')!.stage).toBe('invoice_sent');   // no false mirror
    expect(seq.sends.find(s => s.slug === 'payment-confirmation')).toBeFalsy();           // no false receipt
  });

  it('idempotent: a Stripe retry of the same event does not re-pay or re-send', async () => {
    await post();
    const paidAt = state.docs.get('invoices/quote_q1')!.paidAt;
    seq.sends.length = 0;
    await post();                                   // Stripe retries the same event
    expect(state.docs.get('invoices/quote_q1')!.paidAt).toBe(paidAt);   // unchanged
    expect(seq.sends.find(s => s.slug === 'payment-confirmation')).toBeFalsy();  // no duplicate receipt
  });

  /*
   * P1.2 LIVE INCIDENT, 2026-08-05. `STRIPE_WEBHOOK_SECRET` was stored with a
   * trailing whitespace character. Every live delivery failed signature
   * verification with a 400 that reads exactly like a WRONG secret, so nothing
   * distinguished "padded" from "incorrect". A real customer paid 9.99 USD and
   * received nothing for 80 minutes; Stripe's own error text was the only clue.
   *
   * The route now trims before verifying. These tests assert the VALUE HANDED
   * TO STRIPE, not the outcome — a mocked verifier accepts anything, so only
   * the argument itself can prove the padding is gone.
   */
  it('a padded signing secret is trimmed before verification', async () => {
    verifyArgs.secret = null;
    await postWith({ ...ENV, STRIPE_WEBHOOK_SECRET: '  whsec_padded_value\n' });
    expect(verifyArgs.secret).toBe('whsec_padded_value');
  });

  it('a clean signing secret passes through untouched', async () => {
    verifyArgs.secret = null;
    await post();
    expect(verifyArgs.secret).toBe('whsec');
  });

  it('cross-org guard: a session whose metadata org != invoice org is ignored', async () => {
    evt.current = { id: 'evt_2', type: 'checkout.session.completed', data: { object: { id: 'cs_x', amount_total: 650_000, metadata: { type: 'invoice_payment', invoiceId: 'quote_q1', orgId: 'orgEVIL' } } } };
    await post();
    expect(state.docs.get('invoices/quote_q1')!.status).toBe('pending');   // untouched
    expect(seq.sends.length).toBe(0);
  });
});
