/**
 * Recommendation Engine — types, validation, scoring — Phase K3A.
 *
 * Pure compute. No Firestore writes. No third-party calls.
 * Server is authoritative — client-submitted scores would be ignored
 * even if present.
 */

import {
  COMPANY_SIZE_VALUES,
  INDUSTRY_MAX_LEN,
  INTEGRATIONS_MAX_COUNT,
  INTEGRATION_MAX_LEN,
  MATURITY_TO_AGENTS,
  MATURITY_VALUES,
  PLAN_ORDER,
  PLAN_VALUES,
  SCORE_MAX,
  SCORE_MIN,
  SCORING_WEIGHTS,
  TOP_N,
  WORKFLOW_TO_PRIMARY_AGENT,
  WORKFLOW_VALUES,
  type CompanySize,
  type Maturity,
  type MinPlan,
  type Source,
  type Workflow,
} from '../data/recommendation-config';

/* ── Types ────────────────────────────────────────────────── */

export interface RecommendProfile {
  industry?:         string;
  companySize?:      CompanySize;
  targetWorkflow?:   Workflow;
  subscriptionPlan?: MinPlan;
  currentMaturity?:  Maturity;
  integrations?:     string[];
}

export interface AgentForRecommendation {
  agentId:      string;
  source:       Source;
  name:         string;
  status:       string;
  minPlan:      MinPlan;
  fits: {
    industries:  string[];
    companySize: CompanySize[];
  };
  integrations: string[];
}

export interface Recommendation {
  agentId: string;
  score:   number;       // 0–100
  reasons: string[];     // server-generated English
}

export interface RecommendationResult {
  rankings: Recommendation[];
}

/* ── Validation ───────────────────────────────────────────── */

export interface ProfileValidationOk {
  ok: true;
  profile: RecommendProfile;          // normalized
  hasAnyField: boolean;
}
export interface ProfileValidationErr {
  ok: false;
  error: string;
  code:  string;
}

const isStr = (v: unknown): v is string => typeof v === 'string';

function validateIntegrations(raw: unknown): { ok: true; value: string[] } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, value: [] };
  if (!Array.isArray(raw)) return { ok: false, error: 'integrations must be an array of strings' };
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    if (!isStr(r)) return { ok: false, error: 'integrations must be an array of strings' };
    const norm = r.trim().toLowerCase();
    if (norm.length === 0) continue;
    if (norm.length > INTEGRATION_MAX_LEN) {
      return { ok: false, error: `integration too long (max ${INTEGRATION_MAX_LEN} chars)` };
    }
    if (!seen.has(norm)) { seen.add(norm); out.push(norm); }
    if (out.length >= INTEGRATIONS_MAX_COUNT) break;
  }
  return { ok: true, value: out };
}

export function validateProfile(input: unknown): ProfileValidationOk | ProfileValidationErr {
  if (input === undefined || input === null || typeof input !== 'object') {
    return { ok: false, error: 'profile must be an object', code: 'INVALID_PROFILE' };
  }
  const p = input as Record<string, unknown>;
  const out: RecommendProfile = {};

  if (p.industry !== undefined && p.industry !== null) {
    if (!isStr(p.industry)) {
      return { ok: false, error: 'industry must be a string', code: 'INVALID_INDUSTRY' };
    }
    const norm = p.industry.trim().toLowerCase();
    if (norm.length > INDUSTRY_MAX_LEN) {
      return { ok: false, error: `industry too long (max ${INDUSTRY_MAX_LEN} chars)`, code: 'INVALID_INDUSTRY' };
    }
    if (norm.length > 0) out.industry = norm;
  }

  if (p.companySize !== undefined && p.companySize !== null && p.companySize !== '') {
    if (!isStr(p.companySize) || !(COMPANY_SIZE_VALUES as readonly string[]).includes(p.companySize)) {
      return { ok: false, error: 'companySize must be solo | sme | enterprise', code: 'INVALID_COMPANY_SIZE' };
    }
    out.companySize = p.companySize as CompanySize;
  }

  if (p.targetWorkflow !== undefined && p.targetWorkflow !== null && p.targetWorkflow !== '') {
    if (!isStr(p.targetWorkflow) || !(WORKFLOW_VALUES as readonly string[]).includes(p.targetWorkflow)) {
      return { ok: false, error: `targetWorkflow must be one of ${WORKFLOW_VALUES.join(', ')}`, code: 'INVALID_WORKFLOW' };
    }
    out.targetWorkflow = p.targetWorkflow as Workflow;
  }

  if (p.subscriptionPlan !== undefined && p.subscriptionPlan !== null && p.subscriptionPlan !== '') {
    if (!isStr(p.subscriptionPlan) || !(PLAN_VALUES as readonly string[]).includes(p.subscriptionPlan)) {
      return { ok: false, error: `subscriptionPlan must be one of ${PLAN_VALUES.join(', ')}`, code: 'INVALID_PLAN' };
    }
    out.subscriptionPlan = p.subscriptionPlan as MinPlan;
  }

  if (p.currentMaturity !== undefined && p.currentMaturity !== null && p.currentMaturity !== '') {
    if (!isStr(p.currentMaturity) || !(MATURITY_VALUES as readonly string[]).includes(p.currentMaturity)) {
      return { ok: false, error: `currentMaturity must be one of ${MATURITY_VALUES.join(', ')}`, code: 'INVALID_MATURITY' };
    }
    out.currentMaturity = p.currentMaturity as Maturity;
  }

  const integrationsCheck = validateIntegrations(p.integrations);
  if (!integrationsCheck.ok) {
    return { ok: false, error: integrationsCheck.error, code: 'INVALID_INTEGRATIONS' };
  }
  if (integrationsCheck.value.length > 0) out.integrations = integrationsCheck.value;

  const hasAnyField =
    out.industry !== undefined ||
    out.companySize !== undefined ||
    out.targetWorkflow !== undefined ||
    out.subscriptionPlan !== undefined ||
    out.currentMaturity !== undefined ||
    (out.integrations !== undefined && out.integrations.length > 0);

  return { ok: true, profile: out, hasAnyField };
}

/* ── Scoring ──────────────────────────────────────────────── */

const SIZE_LABELS: Record<CompanySize, string> = {
  solo:       'solo',
  sme:        'SME',
  enterprise: 'enterprise',
};

const clamp = (n: number) => Math.max(SCORE_MIN, Math.min(SCORE_MAX, n));

function scoreAgent(agent: AgentForRecommendation, profile: RecommendProfile): { score: number; reasons: string[] } {
  let raw = 0;
  const reasons: string[] = [];

  // Industry
  if (profile.industry) {
    if (agent.fits.industries.includes(profile.industry)) {
      raw += SCORING_WEIGHTS.industryMatch;
      reasons.push('Fits your industry');
    } else if (agent.fits.industries.includes('all')) {
      raw += SCORING_WEIGHTS.industryAll;
      reasons.push('Suitable across industries');
    }
  }

  // Company size
  if (profile.companySize && agent.fits.companySize.includes(profile.companySize)) {
    raw += SCORING_WEIGHTS.companySizeMatch;
    reasons.push(`Recommended for ${SIZE_LABELS[profile.companySize]} teams`);
  }

  // Integrations
  if (profile.integrations && profile.integrations.length > 0) {
    const agentSet = new Set(agent.integrations.map(i => i.toLowerCase().trim()));
    let hits = 0;
    for (const i of profile.integrations) {
      if (agentSet.has(i)) hits += 1;
    }
    const capped = Math.min(hits, SCORING_WEIGHTS.integrationCap);
    if (capped > 0) {
      raw += capped * SCORING_WEIGHTS.integrationPerHit;
      reasons.push('Compatible with selected integrations');
    }
  }

  // Plan
  if (profile.subscriptionPlan) {
    if (PLAN_ORDER[agent.minPlan] <= PLAN_ORDER[profile.subscriptionPlan]) {
      raw += SCORING_WEIGHTS.planFit;
      reasons.push('Available within your plan');
    } else {
      raw += SCORING_WEIGHTS.planExceedPenalty;
      // No reason text for negative — keep UI positive.
    }
  }

  // Workflow
  if (profile.targetWorkflow) {
    if (WORKFLOW_TO_PRIMARY_AGENT[profile.targetWorkflow] === agent.agentId) {
      raw += SCORING_WEIGHTS.workflowMatch;
      reasons.push('Matches your selected workflow');
    }
  }

  // Maturity
  if (profile.currentMaturity) {
    if (MATURITY_TO_AGENTS[profile.currentMaturity].includes(agent.agentId)) {
      raw += SCORING_WEIGHTS.maturityMatch;
      reasons.push('Fits your current AI maturity stage');
    }
  }

  // Source
  if (agent.source === 'ailunapro') {
    raw += SCORING_WEIGHTS.sourceAilunapro;
    reasons.push('AiLunaPro first-party agent');
  }

  return { score: clamp(raw), reasons };
}

/**
 * Compute top-N recommendations for the given profile against the
 * provided active-agent list. Filter step (status === 'active') is
 * caller's responsibility.
 *
 * Sort:
 *   1. score desc
 *   2. source 'ailunapro' first (tie-break)
 *   3. name asc (tie-break)
 */
export function computeRecommendations(profile: RecommendProfile, agents: AgentForRecommendation[]): Recommendation[] {
  const scored = agents.map(a => {
    const { score, reasons } = scoreAgent(a, profile);
    return { agent: a, score, reasons };
  });

  scored.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    const xPro = x.agent.source === 'ailunapro' ? 0 : 1;
    const yPro = y.agent.source === 'ailunapro' ? 0 : 1;
    if (xPro !== yPro) return xPro - yPro;
    return x.agent.name.localeCompare(y.agent.name);
  });

  return scored.slice(0, TOP_N).map(s => ({
    agentId: s.agent.agentId,
    score:   s.score,
    reasons: s.reasons,
  }));
}
