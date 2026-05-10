/**
 * Recommendation Engine config — Phase K3A.
 *
 * Server-side authoritative scoring. All maps are intentionally COPIED
 * here (not imported from K1A diagnostic-shared or K2A roi-config) to
 * decouple K3 from K1A/K2A internals. Drift between modules is a
 * documentation/QA concern, not a runtime concern.
 */

export type Workflow =
  | 'support' | 'sales' | 'finance' | 'documents' | 'reporting'
  | 'admin' | 'compliance' | 'marketing' | 'hr';

export type CompanySize = 'solo' | 'sme' | 'enterprise';
export type MinPlan      = 'free' | 'starter' | 'professional' | 'enterprise';
export type Maturity     = 'low' | 'medium' | 'high';
export type Source       = 'ailunapro' | 'external';

export const WORKFLOW_VALUES: readonly Workflow[] = [
  'support', 'sales', 'finance', 'documents', 'reporting',
  'admin', 'compliance', 'marketing', 'hr',
];
export const COMPANY_SIZE_VALUES: readonly CompanySize[] = ['solo', 'sme', 'enterprise'];
export const PLAN_VALUES:         readonly MinPlan[]     = ['free', 'starter', 'professional', 'enterprise'];
export const MATURITY_VALUES:     readonly Maturity[]    = ['low', 'medium', 'high'];

/** Plan rank for >= comparison: higher = more capable. */
export const PLAN_ORDER: Record<MinPlan, number> = {
  free:         0,
  starter:      1,
  professional: 2,
  enterprise:   3,
};

/** Workflow → the agent that is its canonical "primary" for K3A scoring.
 *  Copied locally — do NOT import from K2A roi-config. */
export const WORKFLOW_TO_PRIMARY_AGENT: Record<Workflow, string> = {
  support:    'support-agent',
  sales:      'sales-agent',
  finance:    'finance-agent',
  documents:  'document-agent',
  reporting:  'reporting-agent',
  admin:      'admin-agent',
  compliance: 'compliance-agent',
  marketing:  'marketing-agent',
  hr:         'hr-agent',
};

/** Maturity → agent slugs that get the maturity match bonus.
 *  Copied locally — do NOT import from K1A diagnostic-shared. */
export const MATURITY_TO_AGENTS: Record<Maturity, readonly string[]> = {
  low:    ['admin-agent',      'audit-agent',     'support-agent'],
  medium: ['audit-agent',      'document-agent',  'reporting-agent'],
  high:   ['compliance-agent', 'reporting-agent', 'finance-agent'],
};

/** Scoring weights — single source of truth, easy to A/B later. */
export const SCORING_WEIGHTS = {
  industryMatch:       30,    // agent.fits.industries includes profile.industry
  industryAll:         30,    // agent.fits.industries includes 'all'
  companySizeMatch:    20,
  integrationPerHit:    5,
  integrationCap:       4,    // max 4 hits → max +20
  planFit:             10,    // agent.minPlan <= profile.subscriptionPlan
  planExceedPenalty:  -20,    // agent.minPlan >  profile.subscriptionPlan
  workflowMatch:       25,
  maturityMatch:       15,
  sourceAilunapro:     10,
} as const;

/** Output bounds. */
export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

/** Validation bounds. */
export const INDUSTRY_MAX_LEN          = 40;
export const INTEGRATION_MAX_LEN       = 40;
export const INTEGRATIONS_MAX_COUNT    = 10;

/** How many agents to return at most. */
export const TOP_N = 3;
