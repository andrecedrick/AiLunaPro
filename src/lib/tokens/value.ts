/**
 * TOKEN_VALUE_EUR — display-only "value delivered" per paid action.
 *
 * This is the human-facing WORTH of an action's output (what the deliverable
 * replaces in the real world), NOT its price. Price = tokens × ~€0.0015 retail
 * (see token packs); this map is the *value* side used to show
 * "Estimated value: €X" and the session value tracker.
 *
 * It is DISPLAY-ONLY — like `costs.ts`, it must never drive a charge. The worker
 * never reads it. Keys mirror the worker's TOKEN_COSTS actions so a value can be
 * looked up for any priced action.
 *
 * Numbers are defensible starting points (real-world equivalent worth of the
 * output) to calibrate against analytics — not contractual amounts.
 */
import type { TokenCostAction } from './costs';

export const TOKEN_VALUE_EUR: Record<TokenCostAction, number> = {
  'audit.full':         8,   // full EU-AI-Act compliance audit + action plan
  'audit.express':      2,   // quick Shadow-AI / exposure scan
  'recommendation.run': 6,   // curated agent recommendation plan
  'roi.calculate':      2,   // financial ROI projection (free hook)
  'agent.call':         1,   // single agent detail / pricing
  'report.export.pdf':  2,   // branded shareable report PDF
  'audit_express.pdf':  2,   // branded audit PDF
  'quote.generation':   5,   // personalized project quote
  'luna.message':       1.5, // expert AI compliance answer
};

/** Display-only "value delivered" in € for a paid action. Never use to charge. */
export function tokenValueEur(action: TokenCostAction): number {
  return TOKEN_VALUE_EUR[action];
}

/** Sum of delivered value (€) across a list of actions taken this session. */
export function sessionValueEur(actions: TokenCostAction[]): number {
  return actions.reduce((sum, a) => sum + (TOKEN_VALUE_EUR[a] ?? 0), 0);
}

/** Format a €-value-delivered amount for display, e.g. "€8", "€1.50". */
export function formatValueEur(v: number): string {
  return Number.isInteger(v) ? `€${v}` : `€${v.toFixed(2)}`;
}
