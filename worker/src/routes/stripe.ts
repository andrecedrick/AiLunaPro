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
import { firestoreSet, firestoreGet } from '../lib/firestoreAdmin';
import { firestoreCreateIfNotExists } from '../lib/firestoreAdmin';
import { incrementBalance, syncBalanceAllocation } from '../lib/tokens';
import { TOKEN_PACKS, isValidPack } from '../lib/token-costs';
import { planLabelFromProductId, extractProductIdFromSubscription } from '../lib/billing-admin-shared';
import { recordWebhookEvent } from './billing-config';
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
    await handleEvent(event, env.FIREBASE_SERVICE_ACCOUNT_JSON, stripeClient);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Event handling failed';
    console.error('[webhook] handler error:', msg);
    recordWebhookEvent(event.id, false, msg);
    // Return 200 to prevent Stripe retries for non-signature errors
    return c.json({ received: true, error: msg });
  }

  return c.json({ received: true });
});

async function handleEvent(
  event: Stripe.Event,
  saJson: string,
  stripeClient: Stripe,
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
        // Idempotency: pending → retry credit. credited → skip. New → create pending.
        let shouldCredit = false;
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
          shouldCredit = true;
        } catch (err) {
          if (err instanceof Error && err.message === 'ALREADY_EXISTS') {
            const existing = await firestoreGet(saJson, topupPath);
            const status   = existing?.status as string | undefined;
            if (status === 'credited') {
              console.log('[webhook] tokens_topup already credited — skipping:', session.id);
              break;
            }
            console.log('[webhook] tokens_topup pending — retrying credit:', session.id);
            shouldCredit = true;
          } else {
            throw err;
          }
        }
        if (shouldCredit) {
          try {
            const result = await incrementBalance(saJson, orgId, tokensAdded);
            await firestoreSet(saJson, topupPath, {
              status:     'credited',
              creditedAt: new Date().toISOString(),
            }, { merge: true });
            console.log('[webhook] tokens_topup credited — orgId:', orgId, 'pack:', pack, 'tokens:', tokensAdded, 'newBalance:', result.balanceAfter);
          } catch (err) {
            console.error('[webhook] tokens_topup increment failed:', err);
          }
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
