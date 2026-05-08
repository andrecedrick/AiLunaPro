/**
 * Agent catalog shared types + validators — Phase K0.
 *
 * Top-level Firestore collection: /agents/{agentId}
 * Single global catalog. Slug as ID. RBAC enforced at Worker layer
 * (requireRole excludes 'client'). Worker is the only writer (service
 * account); rules block client-side writes.
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

/* ── Validators ─────────────────────────────────────────────── */

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/;

export const SOURCES        = ['ailunapro', 'external'] as const;
export const STATUSES       = ['draft', 'active', 'archived'] as const;
export const MIN_PLANS      = ['free', 'starter', 'professional', 'enterprise'] as const;
export const COMPANY_SIZES  = ['solo', 'sme', 'enterprise'] as const;
export const PRICING_MODELS = ['one-shot', 'subscription', 'usage'] as const;
export const TOKEN_PROFILES = ['low', 'medium', 'high'] as const;
export const COMPLEXITIES   = ['low', 'medium', 'high'] as const;

export const REQUIRED_AFFILIATE_FRAGMENT = 'aff=P60NPGHAAFGD';

/**
 * Validate a candidate agent doc. Returns null when valid; otherwise a
 * human-readable error message. Used by /admin/upsert and /admin/seed
 * to refuse malformed input.
 */
export function validateAgent(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'Agent must be an object';
  const a = input as Record<string, unknown>;

  if (typeof a.agentId !== 'string' || !SLUG_RE.test(a.agentId)) {
    return `Invalid agentId: must match ${SLUG_RE.toString()}`;
  }
  if (!isOneOf(a.source, SOURCES))                  return 'Invalid source';
  if (!isNonEmptyStr(a.name))                       return 'name is required';
  if (!isNonEmptyStr(a.tagline))                    return 'tagline is required';
  if (!isNonEmptyStr(a.description))                return 'description is required';
  if (!isNonEmptyStr(a.problemSolved))              return 'problemSolved is required';

  const fits = a.fits as Record<string, unknown> | undefined;
  if (!fits || typeof fits !== 'object')            return 'fits is required';
  if (!isStrArray(fits.industries))                 return 'fits.industries must be string[]';
  if (!isArrayOfOneOf(fits.companySize, COMPANY_SIZES)) return 'fits.companySize invalid';
  if (fits.budgetMin !== null && typeof fits.budgetMin !== 'number') {
    return 'fits.budgetMin must be number or null';
  }

  if (!isStrArray(a.integrations))                  return 'integrations must be string[]';

  const roi = a.expectedRoi as Record<string, unknown> | undefined;
  if (!roi || typeof roi !== 'object')              return 'expectedRoi is required';
  for (const k of ['timeSavedHoursPerMonth', 'monthlyCostSaved', 'paybackMonths'] as const) {
    if (roi[k] !== null && typeof roi[k] !== 'number') return `expectedRoi.${k} must be number or null`;
  }

  const pricing = a.pricing as Record<string, unknown> | undefined;
  if (!pricing || typeof pricing !== 'object')      return 'pricing is required';
  if (!isOneOf(pricing.model, PRICING_MODELS))      return 'pricing.model invalid';
  if (pricing.stripeProductId !== null && typeof pricing.stripeProductId !== 'string') {
    return 'pricing.stripeProductId must be string or null';
  }
  for (const k of ['installPrice', 'monthlyPrice'] as const) {
    if (pricing[k] !== null && typeof pricing[k] !== 'number') return `pricing.${k} must be number or null`;
  }

  if (!isOneOf(a.minPlan, MIN_PLANS))               return 'minPlan invalid';
  if (!isOneOf(a.tokenUsageProfile, TOKEN_PROFILES)) return 'tokenUsageProfile invalid';
  if (!isOneOf(a.implementationComplexity, COMPLEXITIES)) return 'implementationComplexity invalid';
  if (!isStrArray(a.badges))                        return 'badges must be string[]';

  if (typeof a.affiliateUrl !== 'string' || !a.affiliateUrl.includes(REQUIRED_AFFILIATE_FRAGMENT)) {
    return `affiliateUrl must include "${REQUIRED_AFFILIATE_FRAGMENT}"`;
  }
  if (!isOneOf(a.status, STATUSES))                 return 'status invalid';
  if (a.schemaVersion !== 1)                        return 'schemaVersion must equal 1';

  return null;
}

function isOneOf<T extends readonly string[]>(v: unknown, allowed: T): v is T[number] {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v);
}
function isArrayOfOneOf<T extends readonly string[]>(v: unknown, allowed: T): boolean {
  return Array.isArray(v) && v.every(x => isOneOf(x, allowed));
}
function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(x => typeof x === 'string');
}
function isNonEmptyStr(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}
