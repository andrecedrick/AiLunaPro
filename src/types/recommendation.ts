/**
 * Frontend Recommendation types — Phase K3A.
 * Mirror of worker/src/lib/recommendation.ts.
 */

export type Workflow =
  | 'support' | 'sales' | 'finance' | 'documents' | 'reporting'
  | 'admin' | 'compliance' | 'marketing' | 'hr';

export type CompanySize = 'solo' | 'sme' | 'enterprise';
export type MinPlan      = 'free' | 'starter' | 'professional' | 'enterprise';
export type Maturity     = 'low' | 'medium' | 'high';

export interface RecommendProfile {
  industry?:         string;
  companySize?:      CompanySize;
  targetWorkflow?:   Workflow;
  subscriptionPlan?: MinPlan;
  currentMaturity?:  Maturity;
  integrations?:     string[];
}

export interface Recommendation {
  agentId: string;
  score:   number;
  reasons: string[];
}

export interface RecommendationResult {
  rankings: Recommendation[];
}
