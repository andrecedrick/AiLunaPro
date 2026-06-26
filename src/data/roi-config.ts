/**
 * ROI Calculator UI labels — Phase K2A.
 * Mirrors WORKFLOW_VALUES from worker/src/data/roi-config.ts.
 * English-only for K2A. i18n is a later phase.
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

export const WORKFLOW_LABELS: Record<Workflow, string> = {
  support:    'Customer support',
  sales:      'Sales and lead follow-up',
  finance:    'Finance and invoicing',
  documents:  'Documents and contracts',
  reporting:  'Reporting and dashboards',
  admin:      'Administrative work',
  compliance: 'Compliance and governance',
  marketing:  'Marketing and content',
  hr:         'HR and people operations',
};

/**
 * Savings rates per workflow + reference agent cost — A1 Change 2b (value-first).
 *
 * MIRROR of worker/src/data/roi-config.ts (the server stays authoritative).
 * Kept in sync manually so the public ROI Calculator can preview the savings
 * CLIENT-SIDE before the email gate. Parity with the worker is locked by
 * tests/unit/roi-score-parity.test.ts — drift fails the test.
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

/** Reference agent monthly cost used for payback math. Mirror of the worker constant. */
export const AGENT_DEFAULT_MONTHLY_USD = 99;

/**
 * Static workflow → 2-agent recommendation. MIRROR of worker/src/data/roi-config.ts.
 * Used by the advanced ROI preview so the client shows the same recommended agents.
 */
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

/* ────────────────────────────────────────────────────────────
 * Advanced ROI engine (G5) — time→money constants.
 * MIRROR of worker/src/data/roi-config.ts (worker stays authoritative).
 * Kept in sync manually; drift fails tests/unit/roi-advanced-parity.test.ts.
 * Method: docs/audit-ia-methode-complete.md §1.
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
