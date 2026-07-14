/**
 * Quote (Devis) UI config — Phase Q1 (frontend mirror).
 *
 * MIRROR of worker/src/data/quote-config.ts (the worker stays authoritative on
 * generation). Kept in sync manually so the public Quote page can show the
 * indicative estimate CLIENT-SIDE, instantly, with no token and no round-trip.
 * Strict parity with the worker is locked by tests/unit/quote-score-parity.test.ts
 * — any drift in ranges, tiers, scope sets, or ops-cost uplift fails the test.
 *
 * Values are indicative, non-contractual, informational only. UI labels live in
 * the i18n layer (publicTools.quote.*); this module holds only stable data/keys.
 */

export const QUOTE_CATEGORIES = ['ai_agent', 'automation', 'website', 'audit'] as const;
export type QuoteCategory = typeof QUOTE_CATEGORIES[number];

export const QUOTE_TIERS = {
  ai_agent:   ['simple', 'contextual', 'autonomous', 'multi_agent'],
  automation: ['simple', 'contextual', 'autonomous', 'multi_agent'],
  website:    ['simple', 'intermediate', 'complex', 'custom'],
  audit:      ['feasibility'],
} as const satisfies Record<QuoteCategory, readonly string[]>;

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
  automation: AGENT_SCALE,
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

export const OPS_COST_UPLIFT: Record<QuoteCategory, { minPct: number; maxPct: number } | null> = {
  ai_agent:   { minPct: 40, maxPct: 80 },
  automation: { minPct: 40, maxPct: 80 },
  website:    null,
  audit:      null,
};

export const SCOPE_KEYS: Record<QuoteCategory, readonly string[]> = {
  ai_agent:   ['discovery', 'design', 'integration', 'deployment', 'monitoring'],
  automation: ['discovery', 'mapping', 'integration', 'deployment', 'monitoring'],
  website:    ['discovery', 'design', 'build', 'content', 'launch'],
  audit:      ['assessment', 'gapAnalysis', 'recommendations', 'roadmap'],
};

export const NEXT_STEP_KEYS = ['discoveryCall', 'scoping', 'proposal'] as const;

/**
 * Smart-form guidance — per-category selectable goal suggestions (chips). Keys
 * resolve to localized labels (publicTools.quote.guided.suggestions.*). Picking
 * chips builds a good project description for non-expert users; free text is
 * combined on top. Frontend-only (the estimate never depends on the text).
 */
export const SUGGESTION_KEYS: Record<QuoteCategory, readonly string[]> = {
  ai_agent:   ['support', 'crm', 'workflows', 'dataEntry', 'reporting'],
  automation: ['workflows', 'crm', 'integrations', 'notifications', 'dataSync'],
  website:    ['showcase', 'leads', 'ecommerce', 'dashboard', 'booking'],
  audit:      ['feasibility', 'readiness', 'vendorCompare', 'roadmap'],
};

/* Optional segmentation qualifiers — captured for the eventual quote; never
 * affect the price (no dynamic pricing). */
export const BUSINESS_SIZES = ['solo', 'small', 'medium', 'large'] as const;
export type BusinessSize = typeof BUSINESS_SIZES[number];

export const URGENCIES = ['low', 'standard', 'high'] as const;
export type Urgency = typeof URGENCIES[number];

export const BUDGET_BANDS = ['under_10k', '10k_50k', '50k_150k', 'over_150k'] as const;
export type BudgetBand = typeof BUDGET_BANDS[number];
