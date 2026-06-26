/**
 * ROI Calculator config — Phase K2A.
 * Server-side authoritative. Mirrored partially in src/data/roi-config.ts
 * for UI labels (kept in sync manually).
 */

export const WORKFLOW_VALUES = [
  'support',
  'sales',
  'finance',
  'documents',
  'reporting',
  'admin',
  'compliance',
  'marketing',
  'hr',
] as const;

export type Workflow = typeof WORKFLOW_VALUES[number];

export function isWorkflow(v: unknown): v is Workflow {
  return typeof v === 'string' && (WORKFLOW_VALUES as readonly string[]).includes(v);
}

/**
 * Hardcoded savings rates per workflow. Conservative industry-benchmark
 * estimates. Used only by computeRoi server-side. Never sent from client.
 */
export const SAVINGS_RATE: Record<Workflow, number> = {
  support:    0.40,
  sales:      0.30,
  finance:    0.50,
  documents:  0.55,
  reporting:  0.45,
  admin:      0.50,
  compliance: 0.35,
  marketing:  0.40,
  hr:         0.40,
};

/** Static workflow → 2-agent recommendation (max 2 per workflow). */
export const WORKFLOW_TO_AGENTS: Record<Workflow, [string, string]> = {
  support:    ['support-agent',    'admin-agent'],
  sales:      ['sales-agent',      'marketing-agent'],
  finance:    ['finance-agent',    'reporting-agent'],
  documents:  ['document-agent',   'admin-agent'],
  reporting:  ['reporting-agent',  'audit-agent'],
  admin:      ['admin-agent',      'document-agent'],
  compliance: ['compliance-agent', 'audit-agent'],
  marketing:  ['marketing-agent',  'sales-agent'],
  hr:         ['hr-agent',         'document-agent'],
};

/**
 * Placeholder agent monthly cost used for payback math until Stripe products
 * land for individual agents and `pricing.monthlyPrice` is backfilled.
 * Surfaced in result UI as a disclaimer.
 */
export const AGENT_DEFAULT_MONTHLY_USD = 99;

/* ────────────────────────────────────────────────────────────
 * Advanced ROI engine (G5) — time→money constants.
 * Authoritative copy. Mirrored byte-for-byte in src/data/roi-config.ts;
 * drift is locked by tests/unit/roi-advanced-parity.test.ts.
 * Derived from the "AUDIT TEMPS → ARGENT" method (docs/audit-ia-methode-complete.md §1).
 * ──────────────────────────────────────────────────────────── */

/** Average number of weeks per month (52 / 12). Converts weekly ↔ monthly hours. */
export const WEEKS_PER_MONTH = 4.33;

/** Working days per year — basis for the per-day Cost-of-Inaction figure. */
export const WORKING_DAYS_PER_YEAR = 260;

/** Productive hours per full-time-equivalent per year (net of leave/overhead). */
export const PRODUCTIVE_HOURS_PER_FTE = 1800;

/**
 * Default "loaded cost" coefficient applied to a raw hourly rate to obtain the
 * fully-charged employer cost (salary + charges + leave + tools + overhead).
 * Method range: 1.5–2.3. Default 1.8.
 */
export const LOAD_COEFFICIENT_DEFAULT = 1.8;
export const LOAD_COEFFICIENT_MIN     = 1.0;
export const LOAD_COEFFICIENT_MAX     = 3.0;

/** Hard cap on the share of a task removable by automation (no task is 100%). */
export const AUTOMATION_RATE_MAX = 0.95;
