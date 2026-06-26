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

/**
 * Average number of weeks per month (52 / 12). Converts weekly ↔ monthly hours.
 * Authoritative copy used by the Audit Temps→Argent worksheet engine
 * (worker/src/lib/audit-worksheet.ts); mirrored in src/data/roi-config.ts.
 */
export const WEEKS_PER_MONTH = 4.33;
