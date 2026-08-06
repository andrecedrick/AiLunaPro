/**
 * TOKEN_VALUE_USD — display-only "value delivered" per paid action, in USD base.
 *
 * The human-facing WORTH of an action's output (what the deliverable replaces),
 * NOT its price. Amounts are USD-base and MUST be rendered through the currency
 * system (`useMoney().format(...)`) so they show in the user's display currency
 * ($ by default, auto-detected, override in settings) — never a hardcoded symbol.
 * This keeps token value, pricing, and value display on ONE currency path (no €/$
 * mixing). DISPLAY-ONLY — like costs.ts, it must never drive a charge.
 *
 * Numbers are defensible starting points (real-world equivalent worth) to
 * calibrate against analytics — not contractual amounts.
 */
import type { TokenCostAction } from './costs';

export const TOKEN_VALUE_USD: Record<TokenCostAction, number> = {
  'audit.full':         8,   // full EU-AI-Act compliance audit + action plan
  'audit.express':      2,   // quick Shadow-AI / exposure scan
  'recommendation.run': 6,   // curated agent recommendation plan
  'roi.calculate':      2,   // financial ROI projection (free hook)
  'agent.call':         1,   // single agent detail / pricing
  'report.export.pdf':  2,   // branded shareable report PDF
  'audit_express.pdf':  2,   // branded audit PDF
  'quote.generation':   5,   // personalized project quote
  'luna.message':       1.5, // expert AI compliance answer
  'enrichment.scrape':  3,   // website / social evidence collection
};

/** Display-only "value delivered" (USD base) for a paid action. Format via useMoney. */
export function tokenValueUsd(action: TokenCostAction): number {
  return TOKEN_VALUE_USD[action];
}

/** Sum of delivered value (USD base) across a list of actions this session. */
export function sessionValueUsd(actions: TokenCostAction[]): number {
  return actions.reduce((sum, a) => sum + (TOKEN_VALUE_USD[a] ?? 0), 0);
}

/**
 * Actions the worker actually DEBITS today — mirror of the wired consumeTokens
 * call sites (luna.ts, quote.ts, reports.ts, audit-express-quota.ts). Everything
 * else (roi.calculate, audit.full, recommendation.run, agent.call, audit.express)
 * delivers value at ZERO token cost right now, so the UI must not claim a charge.
 * When a charge is activated (e.g. recommendation.run via its flag), add it here.
 */
export const CHARGED_ACTIONS: ReadonlySet<TokenCostAction> = new Set<TokenCostAction>([
  'luna.message', 'quote.generation', 'report.export.pdf', 'audit_express.pdf',
]);

/** True when the action is actually token-charged today (else it's free). */
export function isCharged(action: TokenCostAction): boolean {
  return CHARGED_ACTIONS.has(action);
}
