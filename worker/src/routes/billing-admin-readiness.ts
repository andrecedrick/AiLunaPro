/**
 * GET /api/billing/admin/live-readiness — Stripe live-activation preflight (§27 P1.2).
 *
 * Owner-only. Answers one question: if a real customer tried to pay right now,
 * what would break?
 *
 * It does not infer readiness from `stripeMode`. Knowing the secret key starts
 * with `sk_live_` says nothing about whether the price ids still point at test
 * objects, whether the portal has a live configuration, or whether the signing
 * secret is the live one. Each of those fails silently and is discovered by a
 * paying customer.
 *
 * NEVER RETURNS A SECRET VALUE. Only variable names, mode classifications and
 * Stripe's own answers about the objects those variables reference.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import {
  checkStaticReadiness, checkPriceProbes, buildReport,
  type PriceProbe, type ReadinessFinding,
} from '../lib/stripe-readiness';
import type { AppEnv } from '../index';

const readiness = new Hono<AppEnv>();

/** How recently a verified webhook must have been seen to count as proof. */
const WEBHOOK_FRESH_DAYS = 30;

readiness.get('/api/billing/admin/live-readiness', requireAuth(), requireOwner(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'] & Record<string, string | undefined>;

  const stat = checkStaticReadiness(env as Record<string, string | undefined>);
  const findings: ReadinessFinding[] = [...stat.findings];

  let pricesVerified = false;
  let portalVerified = false;
  const portal: { configured: boolean; livemode: boolean | null; error: string } =
    { configured: false, livemode: null, error: '' };

  if (env.STRIPE_SECRET_KEY && (stat.mode === 'live' || stat.mode === 'test')) {
    const stripe = getStripe(env.STRIPE_SECRET_KEY);

    // ── Price ids: the only way to catch test prices left behind after a switch.
    const probes: PriceProbe[] = await Promise.all(stat.priceIds.map(async ({ variable, id }) => {
      try {
        const price = await stripe.prices.retrieve(id);
        return {
          variable, id, found: true,
          livemode: price.livemode, active: price.active,
          currency: price.currency ?? '',
        };
      } catch (err) {
        // A missing price is the expected failure for a stale id; anything else
        // is still reported as not-found rather than swallowed.
        if (!(err instanceof Stripe.errors.StripeError)) console.warn('[readiness] price probe failed');
        return { variable, id, found: false, livemode: null, active: null, currency: '' };
      }
    }));
    findings.push(...checkPriceProbes(stat.mode, probes));
    pricesVerified = probes.length > 0 && probes.every(p => p.found);

    // ── Customer portal: a live account with no portal configuration means every
    //    "manage subscription" click 500s after the customer has already paid.
    try {
      const configs = await stripe.billingPortal.configurations.list({ limit: 1, active: true });
      const cfg = configs.data[0];
      portal.configured = Boolean(cfg);
      portal.livemode = cfg ? cfg.livemode : null;
      portalVerified = Boolean(cfg);
      if (!cfg) {
        findings.push({
          variable: 'STRIPE_PORTAL_CONFIGURATION', code: 'MISSING',
          detail: 'No active billing-portal configuration. Customers could pay but not manage their subscription.',
        });
      } else if (stat.mode === 'live' && cfg.livemode === false) {
        findings.push({
          variable: 'STRIPE_PORTAL_CONFIGURATION', code: 'WRONG_LIVEMODE',
          detail: 'The active portal configuration belongs to test mode.',
        });
      }
    } catch (err) {
      portal.error = err instanceof Stripe.errors.StripeError ? (err.code ?? err.type) : 'unavailable';
    }
  }

  // ── Webhook: durable evidence only. In-memory health resets with the isolate,
  //    so it cannot certify anything minutes after a deploy.
  let webhookObserved = false;
  const webhook: { lastVerifiedAt: string; livemode: boolean | null; eventType: string; fresh: boolean } =
    { lastVerifiedAt: '', livemode: null, eventType: '', fresh: false };

  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const health = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'platform/stripe_webhook_health')
      .catch(() => null) as Record<string, unknown> | null;
    if (health) {
      webhook.lastVerifiedAt = typeof health.lastVerifiedAt === 'string' ? health.lastVerifiedAt : '';
      webhook.livemode = typeof health.lastVerifiedLivemode === 'boolean' ? health.lastVerifiedLivemode : null;
      webhook.eventType = typeof health.lastVerifiedEventType === 'string' ? health.lastVerifiedEventType : '';
      const age = Date.now() - Date.parse(webhook.lastVerifiedAt || '');
      webhook.fresh = Number.isFinite(age) && age < WEBHOOK_FRESH_DAYS * 86_400_000;
      // A verified TEST event proves nothing about the live signing secret.
      webhookObserved = webhook.fresh && (stat.mode !== 'live' || webhook.livemode === true);
    }
  }
  if (stat.mode === 'live' && !webhookObserved) {
    findings.push({
      variable: 'STRIPE_WEBHOOK_SECRET', code: 'MODE_MISMATCH',
      detail: 'No verified LIVE webhook event has been observed. Until one is, payments could succeed while no invoice is ever marked paid.',
    });
  }

  const report = buildReport(stat.mode, findings, {
    staticChecks: true, pricesVerified, portalVerified, webhookObserved,
  });

  return c.json({ ...report, portal, webhook });
});

export default readiness;
