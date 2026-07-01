/**
 * Decision engine — pure, display-only (Quote Phase 3).
 *
 * Joins the quote INVESTMENT (from the price range) with the ROI figures the ROI
 * Calculator already computed (monthly/yearly saved) to produce a decision summary:
 * ROI multiple (year 1 + 3-year) and break-even in months. No new business data —
 * only arithmetic over numbers that already exist. USD-base in, formatted by useMoney
 * at the edge. NEVER drives a charge.
 *
 * Honesty: for a large build the year-1 multiple can be < 1× (the investment is a
 * one-time cost, savings recur). `strong` adapts the framing so we lead with the
 * year-1 multiple only when it is genuinely compelling, else with break-even + 3-year.
 */

export interface DecisionInputs {
  investmentUsd:  number; // one-time project cost (USD base)
  yearlySavedUsd: number; // recurring annual saving (USD base)
  monthlySavedUsd: number; // recurring monthly saving (USD base)
}

export interface Decision {
  investmentUsd:  number;
  yearlySavedUsd: number;
  roiYear1:       number;        // yearlySaved / investment
  roi3yr:         number;        // 3 × yearlySaved / investment
  paybackMonths:  number | null; // investment / monthlySaved (null when no monthly saving)
  strong:         boolean;       // true → lead with the year-1 multiple; false → break-even + 3-year
}

/** Threshold above which the first-year return is worth leading with. */
const STRONG_YEAR1_ROI = 1.5;

/**
 * Compute the decision summary, or null when there is no meaningful decision to show
 * (non-positive investment or savings) — callers render nothing in that case.
 */
export function computeDecision(inputs: DecisionInputs): Decision | null {
  const { investmentUsd, yearlySavedUsd, monthlySavedUsd } = inputs;
  if (!(investmentUsd > 0) || !(yearlySavedUsd > 0)) return null;

  const roiYear1 = yearlySavedUsd / investmentUsd;
  const roi3yr   = (yearlySavedUsd * 3) / investmentUsd;
  const paybackMonths = monthlySavedUsd > 0 ? investmentUsd / monthlySavedUsd : null;

  return {
    investmentUsd,
    yearlySavedUsd,
    roiYear1,
    roi3yr,
    paybackMonths,
    strong: roiYear1 >= STRONG_YEAR1_ROI,
  };
}

/**
 * Investment figure for the decision math from a price range. Bounded range → midpoint
 * (both ends known). Open-ended range (max is a floor, real cost can be higher) → use
 * the max, so ROI is never OVERstated. Pure.
 */
export function investmentFromRange(minUsd: number, maxUsd: number, openEnded: boolean): number {
  return openEnded ? maxUsd : (minUsd + maxUsd) / 2;
}
