/**
 * Audit Express — shared Opportunity Catalog + deterministic selector (Phase 8).
 *
 * PURE, rule-only. NO LLM, NO network, NO Date, NO randomness, NO locale.
 * A fixed catalog of automation opportunities tagged by audience (b2b/b2c/mixed)
 * plus a deterministic `selectOpportunities(context)` that picks the top 3–7 for
 * a given (audience, businessType, detected-signals) context.
 *
 * Guardrails: NO legal/compliance/certification claims, NO guaranteed savings.
 * Every selected item carries `sources[]` (resolved from context evidence) +
 * a stable `ruleRef`. impact/effort are explicitly INDICATIVE enums.
 *
 * CTA: `ctaTarget` must be an EXISTING route. No "quote"/"contact-sales" route
 * exists today and new billing flows are forbidden, so all CTAs point to the
 * existing signup route. Labels vary by audience (copy only).
 */

export type BusinessType =
  | 'consulting' | 'agency' | 'ecommerce' | 'saas' | 'marketplace'
  | 'content' | 'nonprofit' | 'local_service' | 'unknown';
export type Audience = 'b2b' | 'b2c' | 'mixed' | 'unknown';
export type Impact = 'high' | 'medium' | 'low';
export type Effort = 'low' | 'medium' | 'high';

const CTA_TARGET = '/#/signup'; // existing route; no new billing flow

/** A catalog entry (static, deterministic). */
export interface CatalogItem {
  id:                 string;
  audience:           'b2b' | 'b2c' | 'mixed';
  title:              string;
  marketingPitch:     string;       // 1 sentence, no promises
  whyItMatters:       string;       // 1 sentence
  typicalWorkflow:    [string, string]; // exactly 2 bullets
  commonIntegrations: string[];     // optional list (may be empty)
  impact:             Impact;       // indicative
  effort:             Effort;       // indicative
  ruleRef:            string;       // stable
  /** Evidence signal keys that justify this item (any-match → eligible). Empty = universal fallback. */
  sourcesPolicy:      string[];
  ctaLabel:           string;
}

/** A selected opportunity = catalog item + resolved evidence sources. */
export interface AutomationOpportunity {
  id:                 string;
  audience:           'b2b' | 'b2c' | 'mixed';
  title:              string;
  marketingPitch:     string;
  whyItMatters:       string;
  typicalWorkflow:    string[];
  commonIntegrations: string[];
  impact:             Impact;
  effort:             Effort;
  ruleRef:            string;
  sources:            string[];
  ctaLabel:           string;
  ctaTarget:          string;
}

/** Deterministic context for selection. */
export interface OpportunityContext {
  audience:     Audience;
  businessType: BusinessType;
  /** Present evidence signal keys, e.g. 'cat:ai_chat', 'type:ecommerce', 'path:contact'. */
  signals:      Set<string>;
  /** Map an evidence key (or 'identity') → source strings, for traceability. */
  sourceFor:    (key: string) => string[];
}

/* ── Catalog (fixed, ordered by id within audience for readability) ─────── */

export const OPPORTUNITY_CATALOG: CatalogItem[] = [
  /* B2B */
  { id: 'b2b.support-assistant', audience: 'b2b', title: 'Customer support assistant',
    marketingPitch: 'Help your team answer repetitive customer questions faster.',
    whyItMatters: 'Support requests tend to repeat, so first-line drafting frees specialists for complex cases.',
    typicalWorkflow: ['Ingest your FAQs and help docs.', 'Draft replies for an agent to review and send.'],
    commonIntegrations: ['Help desk', 'Email', 'Knowledge base'], impact: 'high', effort: 'low',
    ruleRef: 'opp.b2b.supportAssistant', ctaLabel: 'Get a tailored plan',
    sourcesPolicy: ['cat:ai_chat', 'path:contact', 'path:support', 'type:saas', 'type:agency', 'type:consulting'] },
  { id: 'b2b.lead-capture-crm', audience: 'b2b', title: 'Lead capture into your CRM',
    marketingPitch: 'Route inbound interest into your CRM without manual copy-paste.',
    whyItMatters: 'Faster, structured lead handling reduces leakage between your site and sales.',
    typicalWorkflow: ['Detect a new inquiry on your site.', 'Create or update the CRM record and notify the owner.'],
    commonIntegrations: ['CRM', 'Forms', 'Email'], impact: 'high', effort: 'medium',
    ruleRef: 'opp.b2b.leadCaptureCrm', ctaLabel: 'Get a tailored plan',
    sourcesPolicy: ['cat:analytics', 'type:saas', 'type:agency', 'type:consulting'] },
  { id: 'b2b.onboarding-faq', audience: 'b2b', title: 'Self-serve onboarding answers',
    marketingPitch: 'Let new users self-serve common setup questions.',
    whyItMatters: 'Deflecting onboarding questions can shorten time-to-value for new accounts.',
    typicalWorkflow: ['Index your docs and pricing/feature pages.', 'Answer setup questions in-product or on the site.'],
    commonIntegrations: ['Docs', 'In-app widget'], impact: 'high', effort: 'low',
    ruleRef: 'opp.b2b.onboardingFaq', ctaLabel: 'Get a tailored plan',
    sourcesPolicy: ['type:saas', 'path:pricing', 'path:features'] },
  { id: 'b2b.proposal-drafting', audience: 'b2b', title: 'Proposal & scope drafting',
    marketingPitch: 'Draft first-pass proposals from a short brief.',
    whyItMatters: 'A consistent first draft can speed up client turnaround for services teams.',
    typicalWorkflow: ['Capture the client brief and constraints.', 'Generate a structured draft for your review.'],
    commonIntegrations: ['Docs', 'CRM'], impact: 'medium', effort: 'medium',
    ruleRef: 'opp.b2b.proposalDrafting', ctaLabel: 'Get a tailored plan',
    sourcesPolicy: ['type:agency', 'type:consulting'] },
  { id: 'b2b.reporting-automation', audience: 'b2b', title: 'Recurring report automation',
    marketingPitch: 'Assemble recurring reports from your data sources.',
    whyItMatters: 'Automated report assembly reduces repetitive manual collation.',
    typicalWorkflow: ['Pull metrics from your sources.', 'Produce a formatted report on a schedule.'],
    commonIntegrations: ['Analytics', 'Spreadsheets'], impact: 'medium', effort: 'medium',
    ruleRef: 'opp.b2b.reportingAutomation', ctaLabel: 'Get a tailored plan',
    sourcesPolicy: ['cat:analytics', 'type:saas'] },

  /* B2C */
  { id: 'b2c.shopping-assistant', audience: 'b2c', title: 'Shopping assistant',
    marketingPitch: 'Help shoppers find the right product faster.',
    whyItMatters: 'Guided discovery can reduce friction between browsing and checkout.',
    typicalWorkflow: ['Read your catalog and product pages.', 'Answer product questions and suggest matches.'],
    commonIntegrations: ['Store catalog', 'Search'], impact: 'high', effort: 'medium',
    ruleRef: 'opp.b2c.shoppingAssistant', ctaLabel: 'Get started free',
    sourcesPolicy: ['type:ecommerce', 'cat:ecommerce', 'cat:payments', 'path:product'] },
  { id: 'b2c.order-returns-faq', audience: 'b2c', title: 'Order & returns answers',
    marketingPitch: 'Answer common order-status and returns questions automatically.',
    whyItMatters: 'These requests are highly repetitive and easy to template.',
    typicalWorkflow: ['Connect order/returns info.', 'Respond to status and returns questions.'],
    commonIntegrations: ['Store backend', 'Email'], impact: 'high', effort: 'low',
    ruleRef: 'opp.b2c.orderReturnsFaq', ctaLabel: 'Get started free',
    sourcesPolicy: ['type:ecommerce', 'cat:ecommerce'] },
  { id: 'b2c.booking-reminders', audience: 'b2c', title: 'Online booking with reminders',
    marketingPitch: 'Let customers book and get automatic reminders.',
    whyItMatters: 'Self-serve scheduling and reminders can reduce no-shows and phone tag.',
    typicalWorkflow: ['Offer available slots online.', 'Send confirmations and reminders automatically.'],
    commonIntegrations: ['Calendar', 'SMS', 'Email'], impact: 'high', effort: 'medium',
    ruleRef: 'opp.b2c.bookingReminders', ctaLabel: 'Get started free',
    sourcesPolicy: ['type:local_service', 'cat:booking', 'path:contact'] },
  { id: 'b2c.content-recommender', audience: 'b2c', title: 'Content recommendations',
    marketingPitch: 'Suggest relevant articles to keep readers engaged.',
    whyItMatters: 'Better next-read suggestions can increase time on site for content brands.',
    typicalWorkflow: ['Read your published content.', 'Recommend related pieces to each reader.'],
    commonIntegrations: ['CMS'], impact: 'medium', effort: 'medium',
    ruleRef: 'opp.b2c.contentRecommender', ctaLabel: 'Get started free',
    sourcesPolicy: ['type:content', 'path:blog'] },

  /* MIXED (universal fallbacks — always eligible; guarantee min 3) */
  { id: 'mixed.faq-deflection', audience: 'mixed', title: 'FAQ deflection assistant',
    marketingPitch: 'Answer your most common questions in one place.',
    whyItMatters: 'A single answer source reduces repetitive replies across channels.',
    typicalWorkflow: ['Collect your top questions.', 'Answer them on your site automatically.'],
    commonIntegrations: ['Website', 'Knowledge base'], impact: 'medium', effort: 'low',
    ruleRef: 'opp.mixed.faqDeflection', ctaLabel: 'See your plan', sourcesPolicy: [] },
  { id: 'mixed.email-triage', audience: 'mixed', title: 'Inbox triage & drafting',
    marketingPitch: 'Sort incoming messages and draft replies for review.',
    whyItMatters: 'Triage and first-draft replies reduce time spent in the inbox.',
    typicalWorkflow: ['Classify incoming messages.', 'Draft a suggested reply for review.'],
    commonIntegrations: ['Email'], impact: 'medium', effort: 'low',
    ruleRef: 'opp.mixed.emailTriage', ctaLabel: 'See your plan', sourcesPolicy: [] },
  { id: 'mixed.document-qa', audience: 'mixed', title: 'Document Q&A assistant',
    marketingPitch: 'Ask questions across your own documents.',
    whyItMatters: 'Finding answers in existing docs is faster than re-reading them.',
    typicalWorkflow: ['Index your documents.', 'Answer questions with references.'],
    commonIntegrations: ['Docs', 'Storage'], impact: 'low', effort: 'low',
    ruleRef: 'opp.mixed.documentQa', ctaLabel: 'See your plan', sourcesPolicy: [] },
];

/* ── Deterministic ranking ──────────────────────────────────────────────── */

const IMPACT_RANK: Record<Impact, number> = { high: 3, medium: 2, low: 1 };
const EFFORT_RANK: Record<Effort, number> = { low: 1, medium: 2, high: 3 };

function toOpportunity(item: CatalogItem, sources: string[]): AutomationOpportunity {
  return {
    id: item.id, audience: item.audience, title: item.title,
    marketingPitch: item.marketingPitch, whyItMatters: item.whyItMatters,
    typicalWorkflow: [...item.typicalWorkflow], commonIntegrations: [...item.commonIntegrations],
    impact: item.impact, effort: item.effort, ruleRef: item.ruleRef,
    sources, ctaLabel: item.ctaLabel, ctaTarget: CTA_TARGET,
  };
}

function uniqueSorted(xs: string[]): string[] {
  return Array.from(new Set(xs)).sort();
}

/**
 * Select the top 3–7 opportunities for a context. Deterministic:
 *   - audience bucket chosen first (unknown → mixed)
 *   - candidates = items in the bucket OR universal 'mixed' fallbacks
 *   - an item is eligible if a sourcesPolicy key is present (or policy is empty)
 *   - rank by (impact desc, effort asc, id asc); mixed fallbacks guarantee ≥3
 *   - cap at 7
 */
export function selectOpportunities(ctx: OpportunityContext): AutomationOpportunity[] {
  const bucket: 'b2b' | 'b2c' | 'mixed' = ctx.audience === 'unknown' ? 'mixed' : ctx.audience;
  const selected: AutomationOpportunity[] = [];

  for (const item of OPPORTUNITY_CATALOG) {
    if (item.audience !== bucket && item.audience !== 'mixed') continue;
    if (item.sourcesPolicy.length === 0) {
      // Universal fallback — always eligible.
      selected.push(toOpportunity(item, uniqueSorted(ctx.sourceFor('identity'))));
      continue;
    }
    const matchedKeys = item.sourcesPolicy.filter(k => ctx.signals.has(k));
    if (matchedKeys.length === 0) continue;
    const sources = uniqueSorted(matchedKeys.flatMap(k => ctx.sourceFor(k)));
    selected.push(toOpportunity(item, sources.length ? sources : uniqueSorted(ctx.sourceFor('identity'))));
  }

  selected.sort((a, b) => {
    const i = IMPACT_RANK[b.impact] - IMPACT_RANK[a.impact];
    if (i !== 0) return i;
    const e = EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort];
    if (e !== 0) return e;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  return selected.slice(0, 7);
}

/** Audience-tailored section headline (copy only, deterministic). */
export function audienceHeadline(audience: Audience): string {
  switch (audience) {
    case 'b2b': return 'Best for teams';
    case 'b2c': return 'Best for personal use';
    default:    return 'Top opportunities for you';
  }
}
