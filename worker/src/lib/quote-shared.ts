/**
 * Quote — types, validation, estimation — Phase Q0.
 *
 * Server-side authoritative. The estimate is a PURE deterministic lookup over
 * {category, tier} against the static QUOTE_RANGES table — same inputs => byte-
 * identical output. No randomness, no Date, no locale, no I/O. Optional
 * qualifiers (businessSize/urgency/budgetBand) are validated + stored for
 * segmentation but NEVER affect the price (no dynamic pricing).
 *
 * Output carries only stable KEYS (solutionKey/scopeKeys/nextStepKeys) — never
 * localized text — so the engine stays locale-free; the UI + PDF resolve them.
 */

import {
  QUOTE_CATEGORIES,
  QUOTE_RANGES,
  SCOPE_KEYS,
  NEXT_STEP_KEYS,
  OPS_COST_UPLIFT,
  isQuoteCategory,
  isTierForCategory,
  isBusinessSize,
  isUrgency,
  isBudgetBand,
  type QuoteCategory,
  type QuoteTier,
  type BusinessSize,
  type Urgency,
  type BudgetBand,
} from '../data/quote-config';
import {
  stamp,
  ruleRef,
  benchmarkRef,
  type DeterminismStamp,
  type Trace,
} from './determinism';

export type { QuoteCategory, QuoteTier, BusinessSize, Urgency, BudgetBand };

/**
 * Quote ruleset version (ranges, scope sets, ops-cost uplift, rounding).
 * BUMP whenever any pricing rule or content set changes, so historical quotes
 * remain reproducible against the rules in force when they were issued.
 */
export const QUOTE_RULESET_VERSION = '2026.2';

export interface QuoteInputs {
  category: QuoteCategory;
  tier:     QuoteTier;
  /** Optional segmentation. Stored for sales context; NOT used in pricing. */
  businessSize?: BusinessSize;
  urgency?:      Urgency;
  budgetBand?:   BudgetBand;
}

export interface QuoteEstimate {
  category:    QuoteCategory;
  tier:        QuoteTier;
  /** The single fixed published price for the offer (USD, integer). */
  priceUsd:    number;
  /** i18n key suffix, e.g. 'ai_agent.contextual'. */
  solutionKey: string;
  /** i18n key suffixes for the implementation-scope bullets. */
  scopeKeys:    string[];
  /** i18n key suffixes for the next-steps list. */
  nextStepKeys: string[];
  /** Operating-cost uplift annotation (display-only), or null. */
  opsCostUpliftPct: { minPct: number; maxPct: number } | null;
}

/** Deterministic, stamped + traced scored output. */
export interface QuoteScored extends DeterminismStamp {
  estimate: QuoteEstimate;
  /** field name -> reason references (rule ids / benchmark keys). */
  trace:    Trace;
}

/* ── Validation ───────────────────────────────────────────────
 *
 * Shape + enum membership. Returns null on success, error string otherwise.
 * Client cannot bypass — server is the only estimation source.
 */

export function validateInputs(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'inputs must be an object';
  const i = input as Record<string, unknown>;

  if (!isQuoteCategory(i.category)) {
    return `category must be one of: ${QUOTE_CATEGORIES.join(', ')}`;
  }
  if (!isTierForCategory(i.category, i.tier)) {
    return `tier is not valid for category ${i.category}`;
  }

  // Optional qualifiers: validate only when present.
  if (i.businessSize !== undefined && !isBusinessSize(i.businessSize)) {
    return 'businessSize is invalid';
  }
  if (i.urgency !== undefined && !isUrgency(i.urgency)) {
    return 'urgency is invalid';
  }
  if (i.budgetBand !== undefined && !isBudgetBand(i.budgetBand)) {
    return 'budgetBand is invalid';
  }

  return null;
}

/* ── Estimate ──────────────────────────────────────────────────
 *
 * Pure lookup. Assumes inputs are pre-validated (call validateInputs first).
 * Price comes solely from QUOTE_RANGES[category][tier]; qualifiers are ignored.
 */

export function computeQuote(inputs: QuoteInputs): QuoteEstimate {
  const byTier = QUOTE_RANGES[inputs.category];
  const range = byTier[inputs.tier];
  if (!range) {
    // Defensive: validateInputs guarantees this never fires.
    throw new Error(`quote: no range for ${inputs.category}:${inputs.tier}`);
  }
  const uplift = OPS_COST_UPLIFT[inputs.category];
  return {
    category:    inputs.category,
    tier:        inputs.tier,
    priceUsd:    range.priceUsd,
    solutionKey: `${inputs.category}.${inputs.tier}`,
    scopeKeys:   [...SCOPE_KEYS[inputs.category]],
    nextStepKeys: [...NEXT_STEP_KEYS],
    opsCostUpliftPct: uplift ? { ...uplift } : null,
  };
}

/**
 * Deterministic scoring entry point.
 *
 * Pure: same inputs => identical output. No randomness, no Date, no locale.
 * Returns the estimate + version stamp + traceability references.
 */
export function scoreQuote(inputs: QuoteInputs): QuoteScored {
  const estimate = computeQuote(inputs);
  const rangeRef = ruleRef(`quote.range.${inputs.category}.${inputs.tier}`);
  const trace: Trace = {
    priceUsd:         [rangeRef],
    solutionKey:      [ruleRef(`quote.solution.${inputs.category}.${inputs.tier}`)],
    scopeKeys:        [ruleRef(`quote.scope.${inputs.category}`)],
    nextStepKeys:     [ruleRef('quote.nextSteps')],
    opsCostUpliftPct: estimate.opsCostUpliftPct
      ? [benchmarkRef(`quote.opsCostUplift.${inputs.category}`)]
      : [ruleRef('quote.opsCostUplift.none')],
  };
  return { ...stamp(QUOTE_RULESET_VERSION), estimate, trace };
}

/* ── Canonical price (fixed-price model) ─────────────────────────
 *
 * The single fixed published price (USD, integer). `price` is the locked value on
 * the quote doc (= the offer's priceUsd, set at send). Legacy quotes fall back to
 * priceUsd → finalAmountUsd → expectedBudgetUsd → priceMinUsd so historical docs
 * (issued before this model) never read as null. No floor, no range, no override.
 */
export function quotePrice(q: Record<string, unknown>): number | null {
  const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;
  return num(q.price) ?? num(q.finalPriceUsd) ?? num(q.priceUsd) ?? num(q.finalAmountUsd) ?? num(q.expectedBudgetUsd) ?? num(q.priceMinUsd);
}

/* ── ID helper (local, generic body) ─────────────────────────── */

export function generateQuoteId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
