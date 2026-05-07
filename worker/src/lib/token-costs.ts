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

export type TokenPack = 'starter' | 'pro' | 'max';

export interface TokenPackDef {
  pack:        TokenPack;
  tokensAdded: number;
  envVar:      string;            // env name holding the Stripe price ID
}

export const TOKEN_PACKS: Record<TokenPack, TokenPackDef> = {
  starter: { pack: 'starter', tokensAdded:   5_000, envVar: 'STRIPE_TOKEN_PRICE_STARTER' },
  pro:     { pack: 'pro',     tokensAdded:  25_000, envVar: 'STRIPE_TOKEN_PRICE_PRO' },
  max:     { pack: 'max',     tokensAdded: 100_000, envVar: 'STRIPE_TOKEN_PRICE_MAX' },
};

export function isValidPack(s: string): s is TokenPack {
  return s === 'starter' || s === 'pro' || s === 'max';
}

/* ── Cycle ──────────────────────────────────────────────── */
export const CYCLE_DAYS = 30;
