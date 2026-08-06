/**
 * Token costs + plan allocations + packs — Phase J1.4A.
 * Server-side source of truth. Frontend NEVER passes token amounts.
 */

export const TOKEN_COSTS = {
  'audit.full':         50,
  'audit.express':      10,
  'recommendation.run': 30,
  'roi.calculate':       5,
  'agent.call':         20,
  'report.export.pdf':   5,
  'audit_express.pdf':  10,   // J16.1 — PDF export beyond the 3 free downloads
  'quote.generation':   60,   // Quote — paid generation (rebalanced 150→60 so a Free plan (100/mo) can complete one quote before the wall; kills the pre-value 402 cliff)
  'luna.message':       50,   // Luna AI chat — per message after the 3 free/day (L2)
  // P2.1a — Apify collection. This entry is the FLOOR and the fallback: the live
  // price is per class (website 50 / social 4200) and comes from
  // platform_config/billing, passed to consumeTokens as an override. The table
  // value is what a caller gets if the config is unreadable, so it is set to the
  // cheaper class — a config outage must not overcharge.
  'enrichment.scrape':  50,
} as const;

export type TokenAction = keyof typeof TOKEN_COSTS;

export function isValidAction(s: string): s is TokenAction {
  return s in TOKEN_COSTS;
}

/* ── Usage-record traceability (observability MVP) ───────── */

/**
 * Usage-record schema version. Rows written WITHOUT this marker are legacy
 * (pre-traceability): they carry no `mode` and no `priceSnapshot`. Legacy rows
 * stay visible and are NEVER backfilled — an inferred billing history would be
 * worse than an honest gap. Readers must render them as mode 'unknown'.
 */
export const USAGE_SCHEMA_V = 2;

/** How a metered event was settled. */
export type UsageMode = 'free' | 'included' | 'overflow';

export function isUsageMode(s: unknown): s is UsageMode {
  return s === 'free' || s === 'included' || s === 'overflow';
}

/**
 * Delivered value per action (USD base) — server-side mirror of
 * `src/lib/tokens/value.ts`. DISPLAY / TRACEABILITY ONLY: never drives a debit.
 * Kept here so a stored priceSnapshot is server-authoritative.
 */
export const TOKEN_VALUE_USD: Record<TokenAction, number> = {
  'audit.full':         8,
  'audit.express':      2,
  'recommendation.run': 6,
  'roi.calculate':      2,
  'agent.call':         1,
  'report.export.pdf':  2,
  'audit_express.pdf':  2,
  'quote.generation':   5,
  'luna.message':       1.5,
  'enrichment.scrape':  3,
};

/** Target top-up / overflow token price (USD). */
export const TOKEN_PRICE_USD = 0.10;

/** Commercial terms frozen at charge time — the dispute-defence record. */
export interface PriceSnapshot {
  costTokens:    number;
  valueUsd:      number;
  tokenPriceUsd: number;
  /** Index signature: lets the snapshot be written directly as a Firestore map. */
  [k: string]:   number;
}

/**
 * Snapshot the terms for `action`. `tokensCharged` overrides the table cost so a
 * free event (0 tokens) records what it would have cost.
 */
export function priceSnapshotFor(action: TokenAction, tokensCharged?: number): PriceSnapshot {
  return {
    costTokens:    tokensCharged ?? TOKEN_COSTS[action],
    valueUsd:      TOKEN_VALUE_USD[action] ?? 0,
    tokenPriceUsd: TOKEN_PRICE_USD,
  };
}

/* ── SaaS plan monthly allocation ───────────────────────── */
// Lowercase plan keys; normalize input plan to lowercase before lookup.
export const PLAN_TOKEN_ALLOCATION: Record<string, number> = {
  free:         100,
  starter:      1_000,
  professional: 10_000,
  enterprise:   100_000,
};

export function allocationForPlan(plan: string | undefined | null): number {
  const key = (plan ?? 'free').toLowerCase();
  return PLAN_TOKEN_ALLOCATION[key] ?? 100;
}

/* ── Top-up packs (USD only, MVP) ───────────────────────── */

export type TokenPack = 'overage' | 'starter' | 'pro' | 'max';

export interface TokenPackDef {
  pack:        TokenPack;
  tokensAdded: number;
  envVar:      string;            // env name holding the Stripe price ID
}

// `overage` = small self-serve top-up sized to the overflow model: 300 tokens =
// 10 recommendations (30 tokens each) ≈ $30 at the $0.10/token anchor (cahier §23).
// Exists so a paid user who just hit their monthly cap can refill the exact amount
// they need instead of the next pack up (5 000). Stripe price ID via the env var
// (operator-set, live mode) — until set, /api/tokens/topup returns PACK_NOT_CONFIGURED.
export const TOKEN_PACKS: Record<TokenPack, TokenPackDef> = {
  overage: { pack: 'overage', tokensAdded:     300, envVar: 'STRIPE_TOKEN_PRICE_OVERAGE' },
  starter: { pack: 'starter', tokensAdded:   5_000, envVar: 'STRIPE_TOKEN_PRICE_STARTER' },
  pro:     { pack: 'pro',     tokensAdded:  25_000, envVar: 'STRIPE_TOKEN_PRICE_PRO' },
  max:     { pack: 'max',     tokensAdded: 100_000, envVar: 'STRIPE_TOKEN_PRICE_MAX' },
};

export function isValidPack(s: string): s is TokenPack {
  return s === 'overage' || s === 'starter' || s === 'pro' || s === 'max';
}

/* ── Cycle ──────────────────────────────────────────────── */
export const CYCLE_DAYS = 30;
