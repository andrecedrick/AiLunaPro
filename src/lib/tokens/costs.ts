/**
 * TOKEN_COSTS_DISPLAY — frontend DISPLAY mirror of the worker's token costs.
 *
 * The worker (`worker/src/lib/token-costs.ts`) is the SINGLE SOURCE OF TRUTH for
 * billing: the server resolves and charges the cost from there, and the frontend
 * NEVER sends a token amount (see `tokensClient.ts`). This mirror exists ONLY so
 * the UI can show the correct price before an action — it must never be used to
 * drive a charge.
 *
 * Keep it in lock-step with the worker. The parity test
 * (`tests/tokens/token-costs-parity.test.ts`) imports both objects and fails the
 * build on any drift, so the UI can never advertise a price the server won't
 * honor (the exact bug this fixes: quote shown as 50, charged as 150).
 */
export const TOKEN_COSTS_DISPLAY = {
  'audit.full':         50,
  'audit.express':      10,
  'recommendation.run': 30,
  'roi.calculate':       5,
  'agent.call':         20,
  'report.export.pdf':   5,
  'audit_express.pdf':  10,
  'quote.generation':   60,
  'luna.message':       50,
} as const;

export type TokenCostAction = keyof typeof TOKEN_COSTS_DISPLAY;

/** Display-only cost for a paid action (never use to drive a charge). */
export function tokenCost(action: TokenCostAction): number {
  return TOKEN_COSTS_DISPLAY[action];
}
