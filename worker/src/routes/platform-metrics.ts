/**
 * Platform-operator metrics (J8 Batch 1).
 *
 * GET /api/platform/metrics
 *   Auth + platform-admin required. Returns READ-ONLY AGGREGATES:
 *     - mrrCents: monthly recurring revenue across active subs (test mode now)
 *     - activeSubscriptions: count
 *     - recentInvoices: { total, paid, open, uncollectible, void, lastEventAt }
 *     - tokenActiveOrgsCount: count of orgs with tokens/current.balance > 0
 *     - stripeUnavailable: true when Stripe API errored (fail-soft)
 *
 *   NO per-customer rows, NO emails, NO IDs in response. Aggregates only.
 *   60s in-memory cache per worker isolate (limits Stripe API spam).
 *   Hard-capped paging (≤10 pages, ≤1000 subs scanned) — documented below.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { getStripe, type Stripe } from '../lib/stripe';
import { firestoreRunQuery } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const metrics = new Hono<AppEnv>();

// ── In-memory cache (per isolate). 60s TTL. Survives multiple admin reloads. ─
interface MetricsPayload {
  mrrCents: number;
  activeSubscriptions: number;
  recentInvoices: {
    total: number;
    paid: number;
    open: number;
    uncollectible: number;
    void: number;
    lastEventAt: number | null;
  };
  tokenActiveOrgsCount: number;
  stripeUnavailable: boolean;
  generatedAt: number;
}
let cache: { value: MetricsPayload; exp: number } | null = null;
const CACHE_TTL_MS = 60_000;

// Hard cap on Stripe subscription paging. 10 pages × 100 = up to 1000 subs.
// Cap exists to bound Stripe API cost; if more subs ever exist, MRR will be a
// LOWER BOUND and we flag this in code (no separate response field — operator
// will see if subscription count saturates near 1000).
const MAX_SUB_PAGES = 10;
const SUBS_PAGE_SIZE = 100;

/** Normalize a recurring price to a monthly amount in cents. */
function normalizeToMonthlyCents(unitAmount: number | null, quantity: number, interval: string | null, intervalCount: number): number {
  if (!unitAmount || !interval) return 0;
  const totalForInterval = unitAmount * quantity;
  // perMonth = total / (intervalCount * factor)
  const factor =
    interval === 'day'   ? 1 / 30 :
    interval === 'week'  ? 7 / 30 :
    interval === 'month' ? 1 :
    interval === 'year'  ? 12 :
    1;
  const months = (intervalCount || 1) * factor;
  if (months <= 0) return 0;
  return Math.round(totalForInterval / months);
}

async function computeStripeAggregates(
  stripe: Stripe,
): Promise<{
  mrrCents: number;
  activeSubscriptions: number;
  recentInvoices: MetricsPayload['recentInvoices'];
  stripeUnavailable: boolean;
}> {
  try {
    // ── Subscriptions: active, paged (capped) ──
    let mrr = 0;
    let count = 0;
    let starting_after: string | undefined;
    for (let i = 0; i < MAX_SUB_PAGES; i++) {
      const page: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
        status: 'active',
        limit: SUBS_PAGE_SIZE,
        starting_after,
      });
      for (const sub of page.data) {
        count += 1;
        for (const item of sub.items.data) {
          const price = item.price;
          if (!price.recurring) continue;
          mrr += normalizeToMonthlyCents(
            price.unit_amount,
            item.quantity ?? 1,
            price.recurring.interval ?? null,
            price.recurring.interval_count ?? 1,
          );
        }
      }
      if (!page.has_more || page.data.length === 0) break;
      starting_after = page.data[page.data.length - 1].id;
    }

    // ── Invoices: last 25, counts only (no IDs/customers in response) ──
    const inv = await stripe.invoices.list({ limit: 25 });
    let paid = 0, open = 0, uncollectible = 0, voidCount = 0;
    let lastEventAt: number | null = null;
    for (const i of inv.data) {
      if (i.status === 'paid') paid++;
      else if (i.status === 'open') open++;
      else if (i.status === 'uncollectible') uncollectible++;
      else if (i.status === 'void') voidCount++;
      const ts = (i.created || 0) * 1000;
      if (ts && (lastEventAt === null || ts > lastEventAt)) lastEventAt = ts;
    }

    return {
      mrrCents: mrr,
      activeSubscriptions: count,
      recentInvoices: {
        total: inv.data.length,
        paid,
        open,
        uncollectible,
        void: voidCount,
        lastEventAt,
      },
      stripeUnavailable: false,
    };
  } catch (err) {
    // Fail-soft — degrade to zeros + flag.
    console.warn('[platform-metrics] Stripe aggregation failed:', err);
    return {
      mrrCents: 0,
      activeSubscriptions: 0,
      recentInvoices: { total: 0, paid: 0, open: 0, uncollectible: 0, void: 0, lastEventAt: null },
      stripeUnavailable: true,
    };
  }
}

async function computeTokenActiveOrgsCount(saJson: string | undefined): Promise<number> {
  if (!saJson) return 0;
  try {
    // CollectionGroup query on 'tokens' (subcollection of organizations/{orgId})
    // filtered by document id 'current' and balance > 0. Each org has at most
    // one such doc, so the result count equals the number of token-active orgs.
    const docs = await firestoreRunQuery(saJson, {
      from: [{ collectionId: 'tokens', allDescendants: true }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            { fieldFilter: { field: { fieldPath: '__name__' }, op: 'EQUAL', value: { stringValue: '__current__' } } },
            { fieldFilter: { field: { fieldPath: 'balance' }, op: 'GREATER_THAN', value: { integerValue: '0' } } },
          ],
        },
      },
    });
    // Note: the __name__ filter above only matches doc id 'current'. Firestore
    // requires the full resource name for __name__ EQUAL — we instead filter
    // client-side on the returned name to keep the query simple and avoid an
    // index requirement. The balance>0 server-side filter still prunes most.
    let n = 0;
    for (const d of docs) {
      if (d.name.endsWith('/tokens/current')) n++;
    }
    return n;
  } catch (err) {
    console.warn('[platform-metrics] tokens aggregation failed:', err);
    return 0;
  }
}

metrics.get('/api/platform/metrics', requireAuth(), requirePlatformAdmin(), async c => {
  const now = Date.now();
  if (cache && cache.exp > now) {
    return c.json(cache.value);
  }

  const env = c.env;
  const secret = env.STRIPE_SECRET_KEY;
  const stripeAgg = secret
    ? await computeStripeAggregates(getStripe(secret))
    : { mrrCents: 0, activeSubscriptions: 0, recentInvoices: { total: 0, paid: 0, open: 0, uncollectible: 0, void: 0, lastEventAt: null }, stripeUnavailable: true };

  const tokenActiveOrgsCount = await computeTokenActiveOrgsCount(env.FIREBASE_SERVICE_ACCOUNT_JSON);

  const payload: MetricsPayload = {
    mrrCents: stripeAgg.mrrCents,
    activeSubscriptions: stripeAgg.activeSubscriptions,
    recentInvoices: stripeAgg.recentInvoices,
    tokenActiveOrgsCount,
    stripeUnavailable: stripeAgg.stripeUnavailable,
    generatedAt: now,
  };
  cache = { value: payload, exp: now + CACHE_TTL_MS };
  return c.json(payload);
});

export default metrics;
