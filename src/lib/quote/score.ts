/**
 * Client-side Quote preview estimator — Phase Q1 (value-first, free).
 *
 * Mirrors the worker's authoritative `computeQuote` (worker/src/lib/quote-shared.ts)
 * so a visitor sees their indicative price range instantly, with no token and no
 * round-trip. The worker stays authoritative on the token-charged generation (Q2).
 *
 * Strict parity with the worker is locked by tests/unit/quote-score-parity.test.ts.
 * Pure: same inputs => identical output. No Date, no randomness, no locale — the
 * output carries only stable keys (resolved to localized text by the UI).
 */

import {
  QUOTE_RANGES,
  SCOPE_KEYS,
  NEXT_STEP_KEYS,
  OPS_COST_UPLIFT,
  type QuoteCategory,
  type QuoteTier,
} from '../../data/quote-config';

export interface QuotePreviewInputs {
  category: QuoteCategory;
  tier:     QuoteTier;
}

export interface QuotePreview {
  category:    QuoteCategory;
  tier:        QuoteTier;
  priceMinUsd: number;
  priceMaxUsd: number;
  openEnded:   boolean;
  solutionKey: string;
  scopeKeys:    string[];
  nextStepKeys: string[];
  opsCostUpliftPct: { minPct: number; maxPct: number } | null;
}

export function computeQuotePreview(inputs: QuotePreviewInputs): QuotePreview {
  const byTier = QUOTE_RANGES[inputs.category];
  const range = byTier[inputs.tier];
  if (!range) {
    throw new Error(`quote: no range for ${inputs.category}:${inputs.tier}`);
  }
  const uplift = OPS_COST_UPLIFT[inputs.category];
  return {
    category:    inputs.category,
    tier:        inputs.tier,
    priceMinUsd: range.minUsd,
    priceMaxUsd: range.maxUsd,
    openEnded:   range.openEnded,
    solutionKey: `${inputs.category}.${inputs.tier}`,
    scopeKeys:   [...SCOPE_KEYS[inputs.category]],
    nextStepKeys: [...NEXT_STEP_KEYS],
    opsCostUpliftPct: uplift ? { ...uplift } : null,
  };
}
