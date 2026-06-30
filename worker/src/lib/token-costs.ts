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
  'quote.generation':   60,   // Quote/Devis — paid generation (rebalanced 150→60 so a Free plan (100/mo) can complete one quote before the wall; kills the pre-value 402 cliff)
  'luna.message':       50,   // Luna AI chat — per message after the 3 free/day (L2)
} as const;

export type TokenAction = keyof typeof TOKEN_COSTS;

export function isValidAction(s: string): s is TokenAction {
  return s in TOKEN_COSTS;
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
