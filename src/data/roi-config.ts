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
