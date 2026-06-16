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
