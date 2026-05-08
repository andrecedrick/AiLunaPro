/**
 * Frontend Agent Catalog types — Phase K0.
 * Mirror of worker/src/lib/agents-shared.ts schema.
 */

export type AgentSource          = 'ailunapro' | 'external';
export type AgentStatus          = 'draft' | 'active' | 'archived';
export type AgentMinPlan         = 'free' | 'starter' | 'professional' | 'enterprise';
export type AgentCompanySize     = 'solo' | 'sme' | 'enterprise';
export type AgentPricingModel    = 'one-shot' | 'subscription' | 'usage';
export type AgentTokenProfile    = 'low' | 'medium' | 'high';
export type AgentComplexity      = 'low' | 'medium' | 'high';

export interface AgentFits {
  industries:  string[];
  companySize: AgentCompanySize[];
  budgetMin:   number | null;
}

export interface AgentExpectedRoi {
  timeSavedHoursPerMonth: number | null;
  monthlyCostSaved:       number | null;
  paybackMonths:          number | null;
}

export interface AgentPricing {
  model:           AgentPricingModel;
  stripeProductId: string | null;
  installPrice:    number | null;
  monthlyPrice:    number | null;
}

export interface AgentCatalogEntry {
  agentId:                  string;
  source:                   AgentSource;
  name:                     string;
  tagline:                  string;
  description:              string;
  problemSolved:            string;
  fits:                     AgentFits;
  integrations:             string[];
  expectedRoi:              AgentExpectedRoi;
  pricing:                  AgentPricing;
  minPlan:                  AgentMinPlan;
  tokenUsageProfile:        AgentTokenProfile;
  implementationComplexity: AgentComplexity;
  badges:                   string[];
  affiliateUrl:             string;
  status:                   AgentStatus;
  schemaVersion:            1;
  createdAt:                string;
  updatedAt:                string;
}
