/**
 * Quote config — Phase Q0.
 *
 * Server-side authoritative. Indicative 2026 market ranges (USD). Prices are a
 * STATIC reference table — the estimator is a pure lookup over {category, tier}
 * (NO dynamic pricing, no market/API reads). Mirrored partially in
 * src/data/quote-config.ts for the public on-screen estimate + UI labels (kept
 * in sync manually; a parity test guards drift).
 *
 * BUMP QUOTE_RULESET_VERSION (quote-shared.ts) whenever any range, scope set,
 * ops-cost uplift, or category/tier changes.
 *
 * Disclaimer (enforced at every display surface): values are indicative,
 * non-contractual, informational only.
 */

/* ── Service categories ───────────────────────────────────── */

export const QUOTE_CATEGORIES = ['ai_agent', 'automation', 'website', 'audit'] as const;
export type QuoteCategory = typeof QUOTE_CATEGORIES[number];

/** Valid tiers per category. */
export const QUOTE_TIERS = {
  ai_agent:   ['simple', 'contextual', 'autonomous', 'multi_agent'],
  automation: ['simple', 'contextual', 'autonomous', 'multi_agent'],
  website:    ['simple', 'intermediate', 'complex', 'custom'],
  audit:      ['feasibility'],
} as const satisfies Record<QuoteCategory, readonly string[]>;

/** Flat union of every tier string across categories. */
export type QuoteTier =
  | 'simple' | 'contextual' | 'autonomous' | 'multi_agent'
  | 'intermediate' | 'complex' | 'custom'
  | 'feasibility';

export function isQuoteCategory(v: unknown): v is QuoteCategory {
  return typeof v === 'string' && (QUOTE_CATEGORIES as readonly string[]).includes(v);
}

export function isTierForCategory(category: QuoteCategory, tier: unknown): tier is QuoteTier {
  return typeof tier === 'string' && (QUOTE_TIERS[category] as readonly string[]).includes(tier);
}

/* ── Price ranges (USD, indicative 2026) ──────────────────────
 *
 * openEnded=true renders as "min–max+" (e.g. 120k–400k+). Values are USD-base;
 * the display layer converts via the currency system (B6.7). Decision 4:
 * automation reuses the AI-agent scale (same ranges).
 */

export interface PriceRange {
  /** The single fixed published price for the offer (USD, integer). */
  priceUsd: number;
}

/** AI agent & automation scale (shared — decision 4). One published price per tier. */
const AGENT_SCALE: Record<string, PriceRange> = {
  simple:      { priceUsd: 15_000  },
  contextual:  { priceUsd: 30_000  },
  autonomous:  { priceUsd: 60_000  },
  multi_agent: { priceUsd: 120_000 },
};

export const QUOTE_RANGES: Record<QuoteCategory, Record<string, PriceRange>> = {
  ai_agent:   AGENT_SCALE,
  automation: AGENT_SCALE, // decision 4 — automation = same prices as AI agents
  website: {
    simple:       { priceUsd: 3_000  },
    intermediate: { priceUsd: 10_000 },
    complex:      { priceUsd: 30_000 },
    custom:       { priceUsd: 50_000 },
  },
  audit: {
    feasibility:  { priceUsd: 2_000 },
  },
};

/**
 * Operating-cost uplift annotation (tokens, infra). Display-only — NOT added to
 * the range. Applies to AI agents & automation; null elsewhere.
 */
/** Payment split (single source of truth): offers at or below this price use Stripe
 *  self-serve checkout; above it, payment is by bank transfer (no Stripe). */
export const SMB_MAX_USD = 15_000;
export const isBankTransfer = (priceUsd: number): boolean => priceUsd > SMB_MAX_USD;

export const OPS_COST_UPLIFT: Record<QuoteCategory, { minPct: number; maxPct: number } | null> = {
  ai_agent:   { minPct: 40, maxPct: 80 },
  automation: { minPct: 40, maxPct: 80 },
  website:    null,
  audit:      null,
};

/* ── Scope & next-step content keys ───────────────────────────
 *
 * The estimator returns stable KEYS (never localized text) so it stays pure +
 * locale-free; the UI (publicTools.quote.*) and the PDF locale table resolve
 * them to translated strings.
 */

export const SCOPE_KEYS: Record<QuoteCategory, readonly string[]> = {
  ai_agent:   ['discovery', 'design', 'integration', 'deployment', 'monitoring'],
  automation: ['discovery', 'mapping', 'integration', 'deployment', 'monitoring'],
  website:    ['discovery', 'design', 'build', 'content', 'launch'],
  audit:      ['assessment', 'gapAnalysis', 'recommendations', 'roadmap'],
};

export const NEXT_STEP_KEYS = ['discoveryCall', 'scoping', 'proposal'] as const;

/* ── Optional segmentation qualifiers ─────────────────────────
 *
 * Captured for sales segmentation only. They DO NOT affect price (no dynamic
 * pricing) — like teamSize in the ROI model, they are validated-if-present and
 * stored, never fed into the estimate.
 */

export const BUSINESS_SIZES = ['solo', 'small', 'medium', 'large'] as const;
export type BusinessSize = typeof BUSINESS_SIZES[number];

export const URGENCIES = ['low', 'standard', 'high'] as const;
export type Urgency = typeof URGENCIES[number];

export const BUDGET_BANDS = ['under_10k', '10k_50k', '50k_150k', 'over_150k'] as const;
export type BudgetBand = typeof BUDGET_BANDS[number];

export function isBusinessSize(v: unknown): v is BusinessSize {
  return typeof v === 'string' && (BUSINESS_SIZES as readonly string[]).includes(v);
}
export function isUrgency(v: unknown): v is Urgency {
  return typeof v === 'string' && (URGENCIES as readonly string[]).includes(v);
}
export function isBudgetBand(v: unknown): v is BudgetBand {
  return typeof v === 'string' && (BUDGET_BANDS as readonly string[]).includes(v);
}
