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
  minUsd:    number;
  maxUsd:    number;
  openEnded: boolean;
}

/** AI agent & automation scale (shared — decision 4). */
const AGENT_SCALE: Record<string, PriceRange> = {
  simple:      { minUsd: 15_000,  maxUsd: 40_000,  openEnded: false },
  contextual:  { minUsd: 30_000,  maxUsd: 80_000,  openEnded: false },
  autonomous:  { minUsd: 60_000,  maxUsd: 150_000, openEnded: false },
  multi_agent: { minUsd: 120_000, maxUsd: 400_000, openEnded: true  },
};

export const QUOTE_RANGES: Record<QuoteCategory, Record<string, PriceRange>> = {
  ai_agent:   AGENT_SCALE,
  automation: AGENT_SCALE,
  website: {
    simple:       { minUsd: 3_000,  maxUsd: 10_000,  openEnded: false },
    intermediate: { minUsd: 10_000, maxUsd: 30_000,  openEnded: false },
    complex:      { minUsd: 30_000, maxUsd: 100_000, openEnded: true  },
    custom:       { minUsd: 50_000, maxUsd: 250_000, openEnded: true  },
  },
  audit: {
    feasibility:  { minUsd: 2_000,  maxUsd: 5_000,   openEnded: false },
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
