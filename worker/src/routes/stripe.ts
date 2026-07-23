/**
 * POST /api/stripe/webhook — Phase J1.1
 *
 * Real webhook handler with Stripe signature verification.
 * No auth middleware — Stripe signs its own events via Stripe-Signature header.
 * Syncs subscription state to Firestore after each relevant event.
 *
 * Pricing Table flow (J1.1):
 *   1. checkout.session.completed →
 *        orgId  = session.client_reference_id (Pricing Table) OR session.metadata.orgId (custom)
 *        plan   = PRODUCT_TO_PLAN[ subscription.items[0].price.product ]
 *        write  organizations/{orgId}/subscriptions/current
 *        update sub.metadata { orgId, plan } so future events resolve natively
 *   2. customer.subscription.updated/created → read sub.metadata.orgId
 *   3. customer.subscription.deleted → read sub.metadata.orgId, set Free/canceled
 *
 * Secrets: STRIPE_WEBHOOK_SECRET server-side only.
 */

import { Hono } from 'hono';
import { getStripe } from '../lib/stripe';
import { firestoreSet, firestoreGet, firestoreGetWithMeta, firestoreSetIfMatch } from '../lib/firestoreAdmin';
import { firestoreCreateIfNotExists } from '../lib/firestoreAdmin';
import { incrementBalance, syncBalanceAllocation } from '../lib/tokens';
import { TOKEN_PACKS, isValidPack } from '../lib/token-costs';
import { planLabelFromProductId, extractProductIdFromSubscription } from '../lib/billing-admin-shared';
import { recordWebhookEvent } from './billing-config';
import { sendPaymentConfirmation } from './invoices';
import { recordBillingAlert, RetryableWebhookError } from '../lib/billing-alerts';
import type { AppEnv } from '../index';
import type Stripe from 'stripe';

const stripe = new Hono<AppEnv>();

stripe.post('/api/stripe/webhook', async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return c.json({
      error: 'Stripe webhook is not configured',
      code:  'WEBHOOK_NOT_CONFIGURED',
    }, 503);
  }

  const sig = c.req.header('Stripe-Signature');
  if (!sig) {
    return c.json({ error: 'Missing Stripe-Signature' }, 400);
  }

  const rawBody = await c.req.text();
  console.log('[stripe:webhook] inbound request received, verifying signature…');
  const stripeClient = getStripe(env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = await stripeClient.webhooks.constructEventAsync(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed';
    recordWebhookEvent('unknown', false, msg);
    return c.json({ error: msg }, 400);
  }

  recordWebhookEvent(event.id, true);
  // Explicit observability log — fires for every verified event, even when
  // handleEvent has no branch for event.type. Searchable tag: [stripe:webhook].
  console.log('[stripe:webhook] event=', event.type, 'id=', event.id);

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ received: true, warning: 'No service account — sync skipped' });
  }

  try {
    await handleEvent(event, env.FIREBASE_SERVICE_ACCOUNT_JSON, stripeClient, env as AppEnv['Bindings']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Event handling failed';
    console.error('[webhook] handler error:', msg);
    recordWebhookEvent(event.id, false, msg);
    // A RetryableWebhookError means work was claimed but not completed (e.g. a
    // token credit failed after its claim, lock already released). Return 500 so
    // Stripe REDELIVERS and the retry completes the credit — no silent loss.
    if (err instanceof RetryableWebhookError) {
      return c.json({ received: false, retry: true, error: msg }, 500);
    }
    // Any other handler error stays 2xx so Stripe does not retry a permanently
    // bad event forever (unchanged behaviour).
    return c.json({ received: true, error: msg });
  }

  return c.json({ received: true });
});

async function handleEvent(
  event: Stripe.Event,
  saJson: string,
  stripeClient: Stripe,
  env?: AppEnv['Bindings'],
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // J1.4A: branch on tokens_topup vs subscription
      if (session.metadata?.type === 'tokens_topup') {
        const orgId        = session.client_reference_id ?? session.metadata.orgId;
        const pack         = session.metadata.tokensPack;
        // Numeric coercion is critical — Stripe metadata is always strings.
        const rawAdded     = session.metadata.tokensAdded ?? '0';
        const tokensAdded  = Number.parseInt(rawAdded, 10);
        if (!orgId || !pack || !Number.isFinite(tokensAdded) || tokensAdded <= 0) {
          console.warn('[webhook] tokens_topup invalid metadata — orgId/pack/tokensAdded:', orgId, pack, rawAdded);
          break;
        }
        // Validate against server-side TOKEN_PACKS — never trust Stripe metadata
        // for actual credit amounts. Frontend or attacker could have tampered.
        if (!isValidPack(pack)) {
          console.warn('[webhook] tokens_topup unknown pack:', pack);
          break;
        }
        const expected = TOKEN_PACKS[pack].tokensAdded;
        if (tokensAdded !== expected) {
          console.warn('[webhook] tokens_topup amount mismatch — pack:', pack, 'expected:', expected, 'got:', tokensAdded);
          break;
        }
        const topupPath = `organizations/${orgId}/tokens/current/topups/${session.id}`;

        // Idempotent credit. The double-credit hazard: if we credit first and
        // then mark the doc, a failure in between lets a Stripe retry credit
        // again. Instead we CLAIM the credit atomically (pending → credited,
        // guarded by updateTime) BEFORE incrementing. Only one webhook delivery
        // wins the claim; retries see 'credited' (skip) or lose the compare
        // (412 → skip). If the increment fails after a won claim, we log for
        // manual reconciliation rather than risk a second credit.
        try {
          await firestoreCreateIfNotExists(saJson, topupPath, {
            stripeSessionId:       session.id,
            stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? ''),
            stripeEventId:         event.id,
            pack,
            tokensAdded,
            amount:                session.amount_total ?? 0,
            currency:              session.currency ?? 'usd',
            status:                'pending',
            createdAt:             new Date().toISOString(),
          });
        } catch (err) {
          if (!(err instanceof Error && err.message === 'ALREADY_EXISTS')) throw err;
        }

        // Read with meta for the atomic claim.
        const topupMeta = await firestoreGetWithMeta(saJson, topupPath);
        if (!topupMeta) {
          console.error('[webhook] tokens_topup doc missing after create — skipping:', session.id);
          break;
        }
        if (topupMeta.data.status === 'credited') {
          console.log('[webhook] tokens_topup already credited — skipping:', session.id);
          break;
        }

        // Recoverable credit — the ordering guarantees exactly-once WITHOUT a
        // silent-loss window:
        //   pending → crediting → (incrementBalance) → credited
        // The claim only advances to 'crediting' (an in-flight lock), NOT to
        // 'credited'. Tokens are marked credited ONLY after the balance write
        // confirms. If the credit fails, the lock is RELEASED back to 'pending'
        // and the handler throws RetryableWebhookError so Stripe redelivers and
        // the next delivery re-credits. incrementBalance is atomic (optimistic
        // concurrency), so a failed attempt never applies a partial credit — a
        // reclaim after failure can never double-credit.
        //
        // Crash safety: if an isolate dies between 'crediting' and 'credited',
        // the increment (which runs after the claim) never completed, so a
        // 'crediting' doc older than STALE_MS is safely reclaimable.
        const STALE_CREDITING_MS = 90_000;
        const status    = String(topupMeta.data.status ?? 'pending');
        const creditingAtRaw = topupMeta.data.creditingAt;
        const creditingAge = typeof creditingAtRaw === 'string' ? Date.now() - Date.parse(creditingAtRaw) : Infinity;
        const isStaleCrediting = status === 'crediting' && creditingAge > STALE_CREDITING_MS;

        if (status !== 'pending' && !isStaleCrediting) {
          // Another delivery holds a fresh 'crediting' lock — it will finish, or
          // fail and release for the next retry. Do not race it.
          console.log('[webhook] tokens_topup in-flight (status=', status, ') — skipping this delivery:', session.id);
          break;
        }

        // Claim → 'crediting'. setIfMatch(updateTime) ⇒ exactly one delivery wins.
        try {
          await firestoreSetIfMatch(saJson, topupPath, {
            status:      'crediting',
            creditingAt: new Date().toISOString(),
          }, topupMeta.updateTime, { merge: true });
        } catch (err) {
          if (err instanceof Error && err.message === 'PRECONDITION_FAILED') {
            console.log('[webhook] tokens_topup claim lost to another delivery — skipping:', session.id);
            break;
          }
          throw err;
        }

        // Won the claim — credit, then confirm. On failure release + ask for retry.
        try {
          const result = await incrementBalance(saJson, orgId, tokensAdded);
          await firestoreSet(saJson, topupPath, {
            status:     'credited',
            creditedAt: new Date().toISOString(),
          }, { merge: true });
          console.log('[webhook] tokens_topup credited — orgId:', orgId, 'pack:', pack, 'tokens:', tokensAdded, 'newBalance:', result.balanceAfter);
        } catch (err) {
          // Release the lock so a Stripe redelivery re-credits (no permanent loss).
          try {
            await firestoreSet(saJson, topupPath, {
              status:         'pending',
              lastCreditError: err instanceof Error ? err.message : 'credit failed',
              creditFailedAt:  new Date().toISOString(),
            }, { merge: true });
          } catch { /* best-effort release — Stripe retry + stale-reclaim still recover */ }
          await recordBillingAlert(saJson, {
            kind: 'topup_credit_failed', severity: 'critical', orgId, sessionId: session.id,
            message: 'Token top-up paid but credit failed; lock released, awaiting Stripe redelivery.',
            context: { tokensAdded, pack },
          });
          // Non-2xx to the webhook entrypoint → Stripe redelivers the event.
          throw new RetryableWebhookError(`tokens_topup credit failed for session ${session.id}`);
        }
        break;
      }

      // ISSUE 6 — one-time invoice payment → mark the invoice paid (idempotent,
      // org-verified). The link is created at finalise with type='invoice_payment'.
      if (session.metadata?.type === 'invoice_payment') {
        const payOrg = session.metadata.orgId;
        const invoiceId = session.metadata.invoiceId;
        if (!payOrg || !invoiceId) { console.warn('[webhook] invoice_payment missing metadata orgId/invoiceId'); break; }
        const inv = await firestoreGet(saJson, `invoices/${invoiceId}`) as Record<string, unknown> | null;
        if (!inv) { console.warn('[webhook] invoice_payment unknown invoice:', invoiceId); break; }
        if (inv.orgId !== payOrg) { console.warn('[webhook] invoice_payment org mismatch:', invoiceId); break; }
        if (inv.status === 'paid') { console.log('[webhook] invoice already paid — skipping:', invoiceId); break; }
        // Reconcile: the settled total MUST equal the invoice amount (USD → cents).
        // Only an exact match marks paid; a mismatch is flagged for manual review and
        // left pending (never silently mark a wrong-amount payment as fully settled).
        const expectedCents = Math.round(Number(inv.amount) || 0) * 100;
        const paidCents = typeof session.amount_total === 'number' ? session.amount_total : -1;
        if (expectedCents > 0 && paidCents === expectedCents) {
          const paidIso = new Date().toISOString();
          await firestoreSet(saJson, `invoices/${invoiceId}`, {
            status: 'paid', paidAt: paidIso, paidAmount: paidCents, stripeSessionId: session.id, updatedAt: paidIso,
          }, { merge: true });
          // BUG 5 — mirror the quote lifecycle to 'paid' (parity with admin mark-paid)
          // so admin/platform panels and activity feeds see the settled state.
          if (typeof inv.quoteId === 'string' && inv.quoteId) {
            try { await firestoreSet(saJson, `organizations/${payOrg}/quotes/${inv.quoteId}`, { stage: 'paid', paidAt: paidIso }, { merge: true }); }
            catch { /* best-effort mirror */ }
          }
          // BUG 1 — the customer gets a payment confirmation (receipt) on successful
          // Stripe payment. Best-effort: a mail hiccup never fails the webhook ack.
          if (env) {
            try {
              const appBase = ((env as { APP_BASE_URL?: string }).APP_BASE_URL ?? 'https://audit.ailunapro.com').replace(/\/+$/, '');
              const project = typeof inv.quoteTitle === 'string' && inv.quoteTitle ? inv.quoteTitle
                : typeof inv.quoteId === 'string' ? `Quote ${inv.quoteId.slice(0, 8)}` : invoiceId;
              const { emailed } = await sendPaymentConfirmation(env, saJson, {
                orgId: payOrg, invoiceId, project,
                customer: typeof inv.customerEmail === 'string' ? inv.customerEmail : '',
                amount: Math.round(paidCents / 100), appBase,
                reference: typeof inv.quoteId === 'string' ? inv.quoteId : invoiceId,
                paidAt: paidIso, paymentMethod: 'stripe',
              });
              console.log('[webhook] payment confirmation emailed:', emailed, 'invoice:', invoiceId);
            } catch (e) { console.warn('[webhook] payment confirmation send failed:', e instanceof Error ? e.message : ''); }
          }
          console.log('[webhook] invoice marked paid:', invoiceId, 'org:', payOrg);
        } else {
          await firestoreSet(saJson, `invoices/${invoiceId}`, {
            amountMismatch: true, paidAmount: paidCents, stripeSessionId: session.id, updatedAt: new Date().toISOString(),
          }, { merge: true });
          console.warn('[webhook] invoice_payment AMOUNT MISMATCH — invoice:', invoiceId, 'expectedCents:', expectedCents, 'paidCents:', paidCents, '(left pending for review)');
          await recordBillingAlert(saJson, {
            kind: 'invoice_amount_mismatch', severity: 'critical', orgId: payOrg, invoiceId, sessionId: session.id,
            message: 'Stripe settled an amount that does not equal the invoice total; invoice left pending for review.',
            context: { expectedCents, paidCents },
          });
        }
        break;
      }

      // Pricing Table: client_reference_id. Custom checkout: metadata.orgId.
      const orgId = session.client_reference_id ?? session.metadata?.orgId;
      if (!orgId) {
        console.warn('[webhook] checkout.completed missing orgId (no client_reference_id or metadata.orgId)');
        break;
      }
      if (!session.customer || !session.subscription) {
        console.warn('[webhook] checkout.completed missing customer or subscription');
        break;
      }

      const subId = String(session.subscription);

      // Retrieve subscription with price expanded → resolve product → plan
      const sub = await stripeClient.subscriptions.retrieve(subId, {
        expand: ['items.data.price'],
      });

      const productId = extractProductIdFromSubscription(sub);
      const plan      = planLabelFromProductId(productId);
      const item      = sub.items?.data?.[0];

      await firestoreSet(saJson, `organizations/${orgId}/subscriptions/current`, {
        stripeCustomerId:     String(session.customer),
        stripeSubscriptionId: subId,
        stripeProductId:      productId ?? null,
        plan,
        status:               sub.status,
        currency:             sub.currency ?? null,
        currentPeriodStart:   item ? new Date(item.current_period_start * 1000).toISOString() : null,
        currentPeriodEnd:     item ? new Date(item.current_period_end * 1000).toISOString() : null,
        cancelAtPeriodEnd:    sub.cancel_at_period_end,
        updatedAt:            new Date().toISOString(),
      });

      // Persist orgId + plan onto subscription metadata so future events
      // (subscription.updated/deleted) can resolve without client_reference_id.
      await stripeClient.subscriptions.update(subId, {
        metadata: { orgId, plan },
      });

      // J1: sync token allocation defensively here. Mirrors
      // customer.subscription.created/updated path — guards against missed
      // or out-of-order subscription events.
      try { await syncBalanceAllocation(saJson, orgId, plan); }
      catch (err) { console.warn('[webhook] syncBalanceAllocation (checkout.completed) failed:', err); }

      console.log('[webhook] checkout synced — orgId:', orgId, 'plan:', plan, 'product:', productId);
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;
      if (!orgId) {
        console.warn('[webhook] subscription.', event.type, 'missing metadata.orgId — skipping');
        break;
      }

      const productId = extractProductIdFromSubscription(sub);
      const plan      = planLabelFromProductId(productId);
      const item      = sub.items?.data?.[0];

      await firestoreSet(saJson, `organizations/${orgId}/subscriptions/current`, {
        stripeCustomerId:     String(sub.customer),
        stripeSubscriptionId: sub.id,
        stripeProductId:      productId ?? null,
        plan,
        status:               sub.status,
        currency:             sub.currency ?? null,
        currentPeriodStart:   item ? new Date(item.current_period_start * 1000).toISOString() : null,
        currentPeriodEnd:     item ? new Date(item.current_period_end * 1000).toISOString() : null,
        cancelAtPeriodEnd:    sub.cancel_at_period_end,
        updatedAt:            new Date().toISOString(),
      });

      // J1.4A: sync token allocation to plan
      try { await syncBalanceAllocation(saJson, orgId, plan); }
      catch (err) { console.warn('[webhook] syncBalanceAllocation failed:', err); }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;
      if (!orgId) {
        console.warn('[webhook] subscription.deleted missing metadata.orgId — skipping');
        break;
      }

      await firestoreSet(saJson, `organizations/${orgId}/subscriptions/current`, {
        stripeCustomerId:     String(sub.customer),
        stripeSubscriptionId: sub.id,
        stripeProductId:      null,
        plan:                 'Free',
        status:               'canceled',
        cancelAtPeriodEnd:    false,
        updatedAt:            new Date().toISOString(),
      });

      // J1.4A: drop allocation back to Free
      try { await syncBalanceAllocation(saJson, orgId, 'Free'); }
      catch (err) { console.warn('[webhook] syncBalanceAllocation (deleted) failed:', err); }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const rawInvoice = invoice as unknown as Record<string, unknown>;
      const subId = typeof rawInvoice.subscription === 'string'
        ? rawInvoice.subscription
        : null;
      console.warn('[webhook] payment_failed for subscription:', subId ?? 'unknown');
      break;
    }

    default:
      break;
  }
}

export default stripe;
