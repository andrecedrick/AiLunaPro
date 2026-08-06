/**
 * Scrape enforcement policy — plan gate, caps, cost, balance floor (P2.1a).
 *
 * WHY THIS EXISTS. `/api/enrichment/run` reaches Apify, and an Apify run costs
 * real money at the provider. Before this module the route checked auth and the
 * org role and nothing else: any owner on a Free plan could spend the platform's
 * Apify budget without limit. Privilege was the only control, and privilege is
 * not a budget.
 *
 * Every rule here is PURE. The route supplies the plan, the counters and the
 * balance; this module decides. That keeps the decision testable without
 * Firestore, Stripe or Apify, and it keeps the money-critical logic in one file
 * rather than spread across a request handler.
 *
 * COST IS CONFIGURATION, NOT CODE. The values below are defaults that seed
 * `platform_config/billing`; the live numbers come from that document. Pricing
 * is a business rule, and a business rule in a deploy artifact means a worker
 * rollback silently changes what customers are charged — the same reasoning that
 * moved the billing scope out of wrangler.toml (see billing-config-store.ts).
 */

/** What a run collects. Priced separately: social is proxy-bound and far dearer. */
export type ScrapeClass = 'website' | 'social';

export interface ScrapePolicy {
  /** Token cost per class. */
  costs:        Record<ScrapeClass, number>;
  /** Runs per calendar day (UTC), by lowercase plan. */
  dailyCaps:    Record<string, number>;
  /** Runs per calendar month (UTC), by lowercase plan. */
  monthlyCaps:  Record<string, number>;
  /** Balance below which the caller is WARNED (never blocked). 0 disables. */
  minBalance:   number;
  /** Hard page ceiling for a website crawl. Protects the thinner margin. */
  maxPages:     number;
}

/**
 * Committed defaults.
 *
 * `social` is 84× `website` deliberately. Social collection carries residential
 * proxy cost, higher blocking risk and higher maintenance, and the price also
 * positions it as premium and bounds large-scale competitive harvesting. At
 * current token-pack rates 4200 tokens is roughly €5 of customer spend.
 *
 * The caps are the CUSTOMER-FACING quota: "20 website analyses per month" is
 * `monthlyCaps.starter`, and 20 × 50 tokens is exactly the Starter allocation of
 * 1000. The two constraints coincide by design, so the plan card and the ledger
 * cannot disagree.
 *
 * Social is deliberately NOT affordable from a Starter allocation (4200 > 1000).
 * A Starter customer must buy tokens to run one. That is the upsell, not an
 * oversight.
 */
export const SCRAPE_POLICY_DEFAULTS: ScrapePolicy = {
  costs:       { website: 50, social: 4200 },
  dailyCaps:   { free: 0, starter: 2,  professional: 10,  enterprise: 30  },
  monthlyCaps: { free: 0, starter: 20, professional: 100, enterprise: 300 },
  minBalance:  60,
  maxPages:    50,
};

/* ── Config parsing ───────────────────────────────────────── */

const posInt = (v: unknown, fallback: number): number => {
  const n = typeof v === 'number' ? v : Number.parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

const capMap = (v: unknown, fallback: Record<string, number>): Record<string, number> => {
  if (!v || typeof v !== 'object') return { ...fallback };
  const raw = v as Record<string, unknown>;
  const out: Record<string, number> = { ...fallback };
  for (const plan of Object.keys(fallback)) {
    if (plan in raw) out[plan] = posInt(raw[plan], fallback[plan]);
  }
  return out;
};

/**
 * Merge the stored document over the committed defaults.
 *
 * A malformed or missing field falls back to its default rather than to zero: a
 * config typo must not silently make every scrape free, nor silently block every
 * customer.
 */
export function resolveScrapePolicy(doc: Record<string, unknown> | null | undefined): ScrapePolicy {
  const d = doc ?? {};
  const costs = (d.scrapeCosts ?? {}) as Record<string, unknown>;
  return {
    costs: {
      website: posInt(costs.website, SCRAPE_POLICY_DEFAULTS.costs.website),
      social:  posInt(costs.social,  SCRAPE_POLICY_DEFAULTS.costs.social),
    },
    dailyCaps:   capMap(d.scrapeDailyCaps,   SCRAPE_POLICY_DEFAULTS.dailyCaps),
    monthlyCaps: capMap(d.scrapeMonthlyCaps, SCRAPE_POLICY_DEFAULTS.monthlyCaps),
    minBalance:  posInt(d.scrapeMinBalance,  SCRAPE_POLICY_DEFAULTS.minBalance),
    maxPages:    Math.max(1, posInt(d.scrapeMaxPages, SCRAPE_POLICY_DEFAULTS.maxPages)),
  };
}

/* ── Plan normalisation ───────────────────────────────────── */

/**
 * Plan names are written capitalised to `subscriptions/current.plan`
 * ("Starter"), and an org with no subscription document has none at all. Both
 * normalise to a cap lookup; anything unrecognised is treated as Free, which is
 * the safe direction — an unknown plan gets no scrapes rather than unlimited.
 */
export function planKey(plan: string | null | undefined): string {
  const k = (plan ?? '').trim().toLowerCase();
  return k === 'starter' || k === 'professional' || k === 'enterprise' ? k : 'free';
}

export function canScrape(plan: string | null | undefined, policy: ScrapePolicy): boolean {
  return (policy.monthlyCaps[planKey(plan)] ?? 0) > 0;
}

/* ── The decision ─────────────────────────────────────────── */

export type ScrapeDenialCode =
  | 'PLAN_REQUIRED'
  | 'DAILY_CAP_REACHED'
  | 'MONTHLY_CAP_REACHED'
  | 'INSUFFICIENT_TOKENS';

export interface ScrapeRequest {
  plan:        string | null | undefined;
  scrapeClass: ScrapeClass;
  /** Runs already made in the current UTC day / month. */
  usedToday:   number;
  usedThisMonth: number;
  balance:     number;
}

export interface ScrapeDecision {
  allowed:  boolean;
  /** Tokens to reserve. Always populated so the caller can quote the price. */
  cost:     number;
  code?:    ScrapeDenialCode;
  /** HTTP status the route should return when denied. */
  status?:  402 | 429;
  /** Non-blocking: balance would drop below the floor after this run. */
  warnLowBalance: boolean;
  /** Numbers the UI needs to render an actionable message. */
  detail: {
    plan: string; cost: number; balance: number;
    usedToday: number; dailyCap: number;
    usedThisMonth: number; monthlyCap: number;
    minBalance: number;
  };
}

/**
 * Decide whether a run may proceed.
 *
 * ORDER IS DELIBERATE and each denial is distinct, because the customer's next
 * action differs:
 *   1. PLAN_REQUIRED       → upgrade         (Free has no scraping at all)
 *   2. DAILY_CAP_REACHED   → wait, or upgrade
 *   3. MONTHLY_CAP_REACHED → upgrade
 *   4. INSUFFICIENT_TOKENS → buy tokens
 * Collapsing these into one "not allowed" would send a Free user to the token
 * shop, where buying tokens would not help them.
 *
 * The balance floor NEVER blocks. A caller who can afford the run may make it;
 * they are warned that little will remain. Blocking a purchase the customer can
 * afford is a stronger action than the goal requires.
 */
export function decideScrape(req: ScrapeRequest, policy: ScrapePolicy): ScrapeDecision {
  const key         = planKey(req.plan);
  const cost        = policy.costs[req.scrapeClass];
  const dailyCap    = policy.dailyCaps[key] ?? 0;
  const monthlyCap  = policy.monthlyCaps[key] ?? 0;
  const detail = {
    plan: key, cost, balance: req.balance,
    usedToday: req.usedToday, dailyCap,
    usedThisMonth: req.usedThisMonth, monthlyCap,
    minBalance: policy.minBalance,
  };
  const deny = (code: ScrapeDenialCode, status: 402 | 429): ScrapeDecision =>
    ({ allowed: false, cost, code, status, warnLowBalance: false, detail });

  if (monthlyCap <= 0)                     return deny('PLAN_REQUIRED', 402);
  if (req.usedToday     >= dailyCap)       return deny('DAILY_CAP_REACHED', 429);
  if (req.usedThisMonth >= monthlyCap)     return deny('MONTHLY_CAP_REACHED', 429);
  if (req.balance < cost)                  return deny('INSUFFICIENT_TOKENS', 402);

  return {
    allowed: true,
    cost,
    warnLowBalance: policy.minBalance > 0 && (req.balance - cost) < policy.minBalance,
    detail,
  };
}

/* ── Counter windows ──────────────────────────────────────── */

/** UTC day key, `YYYY-MM-DD`. UTC so a cap cannot be reset by changing timezone. */
export const dayKey = (at: Date): string => at.toISOString().slice(0, 10);

/** UTC month key, `YYYY-MM`. */
export const monthKey = (at: Date): string => at.toISOString().slice(0, 7);
