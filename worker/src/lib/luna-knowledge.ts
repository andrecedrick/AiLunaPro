/**
 * Luna AI — curated product knowledge base + route allowlist (S3 Phase 2).
 *
 * A small, STATIC, hand-curated distillation of the product's help topics. It is
 * the ONLY source Luna may answer from (RAG grounding) — the model is instructed
 * not to invent anything outside it. Plain ASCII text, English only (Luna is
 * English-only, matching the existing panel). No prices, no contractual terms.
 *
 * ROUTE_ALLOWLIST is the closed set of in-app destinations Luna may link to. The
 * model proposes a route id; the server validates it against this map and emits
 * the paired label — anything outside the map is dropped (no hallucinated links).
 */

/** route id (Route['name']) -> human label for the action button. */
export const ROUTE_ALLOWLIST: Record<string, string> = {
  'dashboard':         'Go to dashboard',
  'audit/new':         'Start a new audit',
  'audit/history':     'See past audits',
  'audit-express/run': 'Run Audit Express',
  'reports':           'View reports',
  'agents':            'Browse agents',
  'registry':          'Open the registry',
  'system-builder':    'Open the design guide',
  'billing':           'Open Billing',
  'billing/tokens':    'Manage tokens',
  'team':              'Open Team',
  'settings/profile':  'Profile settings',
  'help':              'Open the Help Center',
};

/** Validate an LLM-proposed route id; returns the action or null if not allowed. */
export function resolveRoute(routeId: string | undefined | null): { label: string; route: string } | null {
  if (!routeId) return null;
  const label = ROUTE_ALLOWLIST[routeId];
  return label ? { label, route: routeId } : null;
}

export const LUNA_KNOWLEDGE = `
PRODUCT: AiLunaPro / Audit AI — a SaaS that helps teams assess and improve their AI governance (EU AI Act readiness), then act on the gaps.

WHAT EACH PART DOES (point users to the matching page via its route id):
- Dashboard [dashboard]: the overview — compliance score, risk level, maturity, recent reports.
- Audit [audit/new]: the full structured questionnaire, answered section by section; progress saves as you go. Produces a score, findings, and recommendations.
- Audit Express [audit-express/run]: a fast ~5-minute AI-readiness snapshot — a few questions, optional website analysis, an indicative result.
- Past audits [audit/history]: every audit submitted in the workspace; open one to review or turn it into a report.
- Audit result: shows the score, findings, recommendations, and a roadmap. From there you can generate a report or see recommended agents.
- Reports [reports]: point-in-time snapshots of an audit you can download (PDF), rename, or share with stakeholders.
- Agents [agents]: a catalog of tools matched to your audit that can automate the work you flagged; each shows fit, integrations, and expected ROI.
- Registry [registry]: your AI tool inventory — purpose, data, oversight, and mitigations for every tool you use.
- Design guide / system builder [system-builder]: a pre-deployment guide to design an AI system responsibly across six dimensions; ticks save on the device.
- Tokens [billing/tokens]: AI features consume tokens; the tokens page shows your balance, what consumes tokens, and how to top up.
- Billing [billing]: compare plans, manage your subscription, and see invoices. Do not advise which plan to buy — point here so the user decides.
- Team [team]: invite members and set roles; roles control who can edit audits and reports.
- Settings [settings/profile]: your profile (name, email, password), organization settings, and product preferences (theme).
- Help Center [help]: how audits, reports, agents, tokens, and team management work.
- Public tools (no login needed): a free Diagnostic (AI maturity score), an ROI Calculator (estimate time/money saved), and a Quote tool (indicative project price range).

TONE: concise, friendly, practical. Answer in 1-4 short sentences. Prefer pointing the user to the right page over long explanations.
`.trim();
