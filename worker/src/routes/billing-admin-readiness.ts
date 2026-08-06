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
  checkStaticReadiness, checkPriceProbes, checkProductProbes, buildReport,
  checkProductUniqueness, checkProductFallback, checkOverrideProbes, checkCustomerProbe,
  type PriceProbe, type ProductProbe, type ReadinessFinding,
  type OverrideProbe, type CustomerProbe,
} from '../lib/stripe-readiness';
import { resolvePlanProducts, DEFAULT_PLAN_PRODUCTS } from '../lib/billing-admin-shared';
import type { AppEnv } from '../index';

const readiness = new Hono<AppEnv>();

/** How recently a verified webhook must have been seen to count as proof. */
const WEBHOOK_FRESH_DAYS = 30;

readiness.get('/api/billing/admin/live-readiness', requireAuth(), requireOwner(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'] & Record<string, string | undefined>;

  const stat = checkStaticReadiness(env as Record<string, string | undefined>);
  const findings: ReadinessFinding[] = [...stat.findings];

  /**
   * Currencies a plan must be purchasable in.
   *
   * Taken from the org's own billing config rather than the full supported list:
   * demanding prices in currencies the business does not sell would be a
   * permanent false failure. `usd` is always included because it is checkout's
   * last fallback — without it a customer in an unpriced currency has nothing to
   * fall back to.
   */
  const orgId = c.get('orgId') as string;
  let requiredCurrencies: string[] = ['usd'];
  // Hoisted: the same document also carries activePriceIdsByCurrency, which the
  // override probe below needs.
  let cfg: Record<string, unknown> | null = null;
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    cfg = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/billing_config/current`)
      .catch(() => null) as Record<string, unknown> | null;
    const cs = (cfg?.currencySettings ?? {}) as { enabledCurrencies?: unknown };
    if (Array.isArray(cs.enabledCurrencies)) {
      requiredCurrencies = [...new Set(['usd', ...cs.enabledCurrencies.filter((x): x is string => typeof x === 'string')])].sort();
    }
  }

  let pricesVerified = false;
  let productsVerified = false;
  let portalVerified = false;
  let products: ProductProbe[] = [];
  let overrideProbes: OverrideProbe[] = [];
  let customerProbe: CustomerProbe | null = null;
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

    // ── Plan products: what checkout ACTUALLY resolves against.
    //    Checkout never reads STRIPE_PRICE_*; it lists prices for the plan's
    //    product. Skipping this is what let the preflight report ready while
    //    every plan purchase failed.
    const planProducts = resolvePlanProducts(env);
    const productVars: Record<string, string> = {
      starter: 'STRIPE_PRODUCT_STARTER',
      professional: 'STRIPE_PRODUCT_PROFESSIONAL',
      enterprise: 'STRIPE_PRODUCT_ENTERPRISE',
    };

    const productProbes: ProductProbe[] = await Promise.all(
      (Object.keys(planProducts) as Array<keyof typeof planProducts>).map(async plan => {
        const productId = planProducts[plan];
        const base: ProductProbe = {
          plan, variable: productVars[plan], productId,
          found: false, livemode: null, active: null, currencies: [],
        };
        try {
          const product = await stripe.products.retrieve(productId);
          base.found = true;
          base.livemode = product.livemode;
          base.active = product.active;
        } catch {
          return base;   // absent in this mode — the finding says so
        }
        try {
          // Same filter checkout uses: active recurring prices for the product.
          const prices = await stripe.prices.list({ product: productId, active: true, type: 'recurring', limit: 100 });
          base.currencies = [...new Set(prices.data.map(p => p.currency))].sort();
        } catch {
          // Leave currencies empty: reported as missing rather than assumed present.
        }
        return base;
      }),
    );

    findings.push(...checkProductProbes(stat.mode, productProbes, requiredCurrencies));
    // Two plans sharing one product passes every per-id check — only the SET
    // catches it. See the 2026-08-05 shifted-secret incident (§27.4c).
    findings.push(...checkProductUniqueness(productProbes));
    // A plan silently using the committed TEST default, or no product at all
    // because production refuses to fall back.
    findings.push(...checkProductFallback(stat.mode, planProducts, DEFAULT_PLAN_PRODUCTS));
    productsVerified = productProbes.length > 0 && productProbes.every(p => p.found);
    products = productProbes;

    // ── Per-org price overrides. `activePriceIdsByCurrency` short-circuits the
    //    product lookup in checkout, so a value written during the test era
    //    outranks a perfectly correct live catalog — and nothing else in this
    //    report is per-org.
    const activeMap = (cfg?.activePriceIdsByCurrency ?? {}) as Record<string, Record<string, string>>;
    const overrideEntries: Array<{ plan: string; currency: string; priceId: string }> = [];
    for (const [plan, byCurrency] of Object.entries(activeMap)) {
      for (const [currency, priceId] of Object.entries(byCurrency ?? {})) {
        const id = String(priceId ?? '').trim();
        if (id) overrideEntries.push({ plan, currency, priceId: id });
      }
    }
    overrideProbes = await Promise.all(overrideEntries.map(async e => {
      const base: OverrideProbe = { ...e, found: false, livemode: null, active: null };
      try {
        const price = await stripe.prices.retrieve(e.priceId);
        base.found = true;
        base.livemode = price.livemode;
        base.active = price.active;
      } catch { /* absent in this mode — the finding says so */ }
      return base;
    }));
    findings.push(...checkOverrideProbes(stat.mode, overrideProbes));

    // ── The org's stored Stripe customer. A `cus_` created in test is invisible
    //    to a live key, and the symptom lands on a customer who has ALREADY
    //    paid: the billing portal and the invoice list both 404.
    if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sub = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/subscriptions/current`)
        .catch(() => null) as Record<string, unknown> | null;
      const customerId = String(sub?.stripeCustomerId ?? '').trim();
      if (customerId) {
        customerProbe = { customerId, found: false, livemode: null };
        try {
          const customer = await stripe.customers.retrieve(customerId);
          customerProbe.found = true;
          customerProbe.livemode = 'livemode' in customer ? customer.livemode : null;
        } catch { /* absent in this mode — the finding says so */ }
        findings.push(...checkCustomerProbe(stat.mode, customerProbe));
      }
    }

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
    staticChecks: true, pricesVerified, productsVerified, portalVerified, webhookObserved,
  });

  return c.json({ ...report, requiredCurrencies, products, portal, webhook, overrides: overrideProbes, customer: customerProbe });
});

export default readiness;
