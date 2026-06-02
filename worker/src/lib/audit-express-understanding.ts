/**
 * Audit Express — V1 rule-only interpretation layer (Phase 7, §7quinquies).
 *
 * PURE. NO LLM, NO network, NO Date, NO randomness, NO locale, NO I/O. Consumes
 * the Phase 5 ExtractSnapshot (already PII-scrubbed) and derives, by fixed
 * deterministic rules only:
 *   - businessProfile (type / audience / offers — controlled enums)
 *   - aiUsageSignals  (AI/chat tooling already in use)
 *   - shadowAiFlags   (governance gaps, rule-derived)
 *   - automationOpportunities (top 3-5, fixed impact/effort placeholders)
 *   - deeperAudit     (indicative EU AI Act band + shadow-AI summary + quick wins)
 *
 * Every produced item carries `sources[]` + a rule/benchmark ref. All ranking is
 * code (fixed weight tables) — never an LLM. Same snapshot => identical output.
 *
 * NO legal/compliance claims: the EU AI Act band is explicitly "indicative" and
 * not a legal classification.
 */

import { ENGINE_VERSION, ruleRef, benchmarkRef, type Trace } from './determinism';
import type { ExtractSnapshot, ExtractDetection } from './audit-express-extract';

export const UNDERSTANDING_RULESET_VERSION = '1.0.0';

/* ── Controlled enums (locked at GO) ────────────────────────────────────── */

export type BusinessType =
  | 'consulting' | 'agency' | 'ecommerce' | 'saas' | 'marketplace'
  | 'content' | 'nonprofit' | 'local_service' | 'unknown';
export type Audience = 'b2b' | 'b2c' | 'mixed' | 'unknown';
export type Confidence = 'low' | 'medium' | 'high';
export type Impact = 'high' | 'medium' | 'low';
export type Effort = 'low' | 'medium' | 'high';

export interface Offer { tag: string; sources: string[] }
export interface SignalItem { id: string; label: string; sources: string[] }
export interface ShadowAiFlag { id: string; severity: 'info' | 'attention'; rationale: string; sources: string[]; ruleRef: string }
export interface AutomationOpportunity {
  id: string; title: string; impact: Impact; effort: Effort;
  rationale: string; sources: string[]; ruleRef: string;
}
export interface BusinessProfile {
  businessType: BusinessType;
  audience:     Audience;
  offers:       Offer[];
  languages:    string[];
  confidence:   Confidence;
  sources:      string[];
}
export interface QuickWin { text: string; sources: string[]; ruleRef: string }
export interface DeeperAudit {
  euAiActLevelIndicative: 'minimal-indicative' | 'limited-indicative';
  euAiActRationale:       string;
  shadowAiSummary:        string;
  quickWins:              QuickWin[];
  sources:                string[];
}
export interface Understanding {
  engineVersion:               string;
  understandingRulesetVersion: string;
  businessProfile:             BusinessProfile;
  aiUsageSignals:              SignalItem[];
  shadowAiFlags:               ShadowAiFlag[];
  automationOpportunities:     AutomationOpportunity[];
  deeperAudit:                 DeeperAudit;
  trace:                       Trace;
}

const DISCLAIMER = 'Indicative only — not a legal classification, certification, or advice.';

/* ── Source-tagged text fragments from the snapshot ─────────────────────── */

interface Fragment { text: string; source: string }

function buildFragments(s: ExtractSnapshot): Fragment[] {
  const frags: Fragment[] = [];
  const id = s.identity || ({} as ExtractSnapshot['identity']);
  if (id.title)       frags.push({ text: id.title.toLowerCase(),       source: 'identity:title' });
  if (id.description) frags.push({ text: id.description.toLowerCase(), source: 'identity:description' });
  for (const k of Object.keys(id.og || {}).sort())      frags.push({ text: String(id.og[k]).toLowerCase(),      source: 'identity:' + k });
  for (const k of Object.keys(id.twitter || {}).sort())  frags.push({ text: String(id.twitter[k]).toLowerCase(), source: 'identity:' + k });
  for (const p of (s.pages || [])) {
    let path = '';
    try { path = new URL(p.url).pathname.toLowerCase(); } catch { path = ''; }
    if (path) frags.push({ text: path, source: 'path:' + path });
  }
  for (const d of (s.detections || [])) frags.push({ text: d.id.toLowerCase(), source: 'detection:' + d.id });
  return frags;
}

/** Match keywords against fragments; return hit count + contributing sources. */
function matchKeywords(frags: Fragment[], keywords: string[]): { hits: number; sources: string[] } {
  const sources = new Set<string>();
  let hits = 0;
  for (const f of frags) {
    for (const kw of keywords) {
      if (f.text.indexOf(kw) !== -1) { hits++; sources.add(f.source); }
    }
  }
  return { hits, sources: Array.from(sources).sort() };
}

/* ── Business type classification (deterministic) ───────────────────────── */

const TYPE_KEYWORDS: Record<Exclude<BusinessType, 'unknown'>, string[]> = {
  ecommerce:     ['shop', 'store', 'cart', 'checkout', 'add to cart', 'buy now', 'collections', 'product', '/shop', '/cart', '/checkout', '/product', '/store'],
  saas:          ['platform', 'software', 'dashboard', 'saas', 'free trial', 'sign up', 'signup', '/pricing', '/features', '/login', 'api', 'app'],
  marketplace:   ['marketplace', 'vendors', 'sellers', 'listings', 'browse listings'],
  agency:        ['agency', 'studio', 'our clients', 'portfolio', 'case studies', 'we help', 'for brands'],
  consulting:    ['consulting', 'consultant', 'consultancy', 'advisory', 'coaching', 'strategy'],
  content:       ['blog', 'magazine', 'news', 'articles', '/blog', 'newsletter', 'podcast'],
  nonprofit:     ['nonprofit', 'non-profit', 'ngo', 'donate', 'charity', 'foundation', 'association'],
  local_service: ['book an appointment', 'opening hours', 'near me', 'clinic', 'salon', 'restaurant', 'plumber', 'our location', 'visit us'],
};

// Detection-based boosts toward a type (add hits + the detection source).
const DETECTION_TYPE_BOOST: Record<string, Exclude<BusinessType, 'unknown'>> = {
  'ecommerce.shopify': 'ecommerce',
  'payments.stripe':   'ecommerce',
  'booking.calendly':  'local_service',
};

// Fixed tie-break priority (lower index wins on equal score).
const TYPE_PRIORITY: Exclude<BusinessType, 'unknown'>[] =
  ['ecommerce', 'saas', 'marketplace', 'agency', 'consulting', 'local_service', 'content', 'nonprofit'];

function classifyBusinessType(frags: Fragment[], dets: ExtractDetection[]): { type: BusinessType; sources: string[]; score: number } {
  const scores: Record<string, { hits: number; sources: Set<string> }> = {};
  for (const t of TYPE_PRIORITY) {
    const m = matchKeywords(frags, TYPE_KEYWORDS[t]);
    scores[t] = { hits: m.hits, sources: new Set(m.sources) };
  }
  for (const d of dets) {
    const boosted = DETECTION_TYPE_BOOST[d.id];
    if (boosted) { scores[boosted].hits += 2; scores[boosted].sources.add('detection:' + d.id); }
  }
  let best: Exclude<BusinessType, 'unknown'> | null = null;
  for (const t of TYPE_PRIORITY) {
    if (scores[t].hits <= 0) continue;
    if (best === null || scores[t].hits > scores[best].hits) best = t;
  }
  if (!best) return { type: 'unknown', sources: [], score: 0 };
  return { type: best, sources: Array.from(scores[best].sources).sort(), score: scores[best].hits };
}

const AUDIENCE_B2B = ['for teams', 'enterprise', 'businesses', 'b2b', 'for companies', 'for agencies', 'clients'];
const AUDIENCE_B2C = ['for you', 'families', 'personal', 'shop now', 'b2c', 'for everyone', 'gift'];

function classifyAudience(frags: Fragment[]): { audience: Audience; sources: string[] } {
  const b = matchKeywords(frags, AUDIENCE_B2B);
  const c = matchKeywords(frags, AUDIENCE_B2C);
  const sources = Array.from(new Set([...b.sources, ...c.sources])).sort();
  if (b.hits > 0 && c.hits > 0) return { audience: 'mixed', sources };
  if (b.hits > 0) return { audience: 'b2b', sources: b.sources };
  if (c.hits > 0) return { audience: 'b2c', sources: c.sources };
  return { audience: 'unknown', sources: [] };
}

/* ── Offers (rule-only tagged phrases) ──────────────────────────────────── */

const OFFER_RULES: Array<{ tag: string; keywords: string[] }> = [
  { tag: 'online-store',          keywords: ['shop', 'store', 'cart', 'checkout', 'product', '/shop', '/product'] },
  { tag: 'subscription-plans',    keywords: ['pricing', '/pricing', 'free trial', 'subscription', 'plans'] },
  { tag: 'professional-services', keywords: ['services', 'consulting', 'agency', 'advisory', '/services'] },
  { tag: 'content-articles',      keywords: ['blog', '/blog', 'articles', 'newsletter', 'podcast'] },
  { tag: 'booking-appointments',  keywords: ['book', 'appointment', 'contact', '/contact', 'calendly'] },
  { tag: 'portfolio',             keywords: ['portfolio', 'case studies', 'our work'] },
];

function deriveOffers(frags: Fragment[]): Offer[] {
  const offers: Offer[] = [];
  for (const rule of OFFER_RULES) {
    const m = matchKeywords(frags, rule.keywords);
    if (m.hits > 0) offers.push({ tag: rule.tag, sources: m.sources });
  }
  offers.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
  return offers;
}

/* ── AI usage + shadow-AI flags ─────────────────────────────────────────── */

function aiUsageSignals(dets: ExtractDetection[]): SignalItem[] {
  return dets
    .filter(d => d.category === 'ai_chat')
    .map(d => ({ id: d.id, label: d.label, sources: [...d.sources].sort() }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function shadowAiFlags(dets: ExtractDetection[]): ShadowAiFlag[] {
  const has = (cat: string) => dets.some(d => d.category === cat);
  const srcOf = (cat: string) => dets.filter(d => d.category === cat).flatMap(d => d.sources);
  const flags: ShadowAiFlag[] = [];
  const hasConsent = has('consent');
  if (has('ai_chat') && !hasConsent) {
    flags.push({ id: 'ai-chat-without-consent-tool', severity: 'attention',
      rationale: 'An AI/chat widget was detected but no consent/cookie tool was found on the pages read.',
      sources: Array.from(new Set(srcOf('ai_chat'))).sort(), ruleRef: 'understanding.shadowAi.aiChatNoConsent' });
  }
  if (has('analytics') && !hasConsent) {
    flags.push({ id: 'analytics-without-consent-tool', severity: 'info',
      rationale: 'Analytics/tracking was detected but no consent/cookie tool was found on the pages read.',
      sources: Array.from(new Set(srcOf('analytics'))).sort(), ruleRef: 'understanding.shadowAi.analyticsNoConsent' });
  }
  const aiCount = dets.filter(d => d.category === 'ai_chat').length;
  if (aiCount >= 2) {
    flags.push({ id: 'multiple-ai-tools-detected', severity: 'info',
      rationale: 'More than one AI/chat tool was detected; consider consolidating for consistent oversight.',
      sources: Array.from(new Set(srcOf('ai_chat'))).sort(), ruleRef: 'understanding.shadowAi.multipleAiTools' });
  }
  flags.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return flags;
}

/* ── Automation opportunities (rule-based map) ──────────────────────────── */

const IMPACT_RANK: Record<Impact, number> = { high: 3, medium: 2, low: 1 };
const EFFORT_RANK: Record<Effort, number> = { low: 1, medium: 2, high: 3 };

interface OppRule {
  id: string; title: string; impact: Impact; effort: Effort; rationale: string; ruleRef: string;
  test: (ctx: Ctx) => boolean;
  sources: (ctx: Ctx) => string[];
}
interface Ctx {
  type: BusinessType;
  frags: Fragment[];
  dets: ExtractDetection[];
  has: (cat: string) => boolean;
  pathHas: (kw: string) => string[];   // returns matching path sources
  detSources: (cat: string) => string[];
}

const OPP_RULES: OppRule[] = [
  { id: 'expand-assistant-coverage', title: 'Expand your existing assistant to more journeys', impact: 'medium', effort: 'low',
    rationale: 'An AI/chat tool is already in use; extend it to deflect more repetitive questions.',
    ruleRef: 'understanding.automation.aiChatPresent', test: c => c.has('ai_chat'), sources: c => c.detSources('ai_chat') },
  { id: 'add-support-assistant', title: 'Add a support assistant for common questions', impact: 'high', effort: 'low',
    rationale: 'Support/contact pages exist with no AI assistant detected; automate first-line answers.',
    ruleRef: 'understanding.automation.supportNoAi', test: c => !c.has('ai_chat') && (c.pathHas('contact').length > 0 || c.pathHas('support').length > 0),
    sources: c => [...c.pathHas('contact'), ...c.pathHas('support')] },
  { id: 'automate-order-status', title: 'Automate order-status & returns replies', impact: 'high', effort: 'medium',
    rationale: 'E-commerce signals detected; automate repetitive order/returns messages.',
    ruleRef: 'understanding.automation.ecommerce', test: c => c.type === 'ecommerce', sources: c => c.detSources('ecommerce').concat(c.pathHas('product')) },
  { id: 'self-serve-faq-deflection', title: 'Self-serve FAQ deflection for onboarding', impact: 'high', effort: 'low',
    rationale: 'SaaS signals detected; deflect onboarding questions with a self-serve assistant.',
    ruleRef: 'understanding.automation.saas', test: c => c.type === 'saas', sources: c => c.pathHas('pricing').concat(c.pathHas('features')) },
  { id: 'automate-lead-capture-crm', title: 'Automate lead capture into a CRM', impact: 'high', effort: 'medium',
    rationale: 'Analytics present but no booking/CRM signal; automate lead routing.',
    ruleRef: 'understanding.automation.leadCapture', test: c => c.has('analytics') && !c.has('booking'), sources: c => c.detSources('analytics') },
  { id: 'add-online-booking-automation', title: 'Add online booking with reminders', impact: 'high', effort: 'medium',
    rationale: 'Local-service signals with no booking tool detected; automate scheduling + reminders.',
    ruleRef: 'understanding.automation.localBooking', test: c => c.type === 'local_service' && !c.has('booking'), sources: c => c.pathHas('contact') },
  { id: 'repurpose-content-pipeline', title: 'Automate content repurposing', impact: 'medium', effort: 'medium',
    rationale: 'Content signals detected; automate turning articles into summaries/social posts.',
    ruleRef: 'understanding.automation.content', test: c => c.type === 'content', sources: c => c.pathHas('blog') },
  { id: 'automate-inbound-triage', title: 'Automate inbound message triage', impact: 'medium', effort: 'low',
    rationale: 'A contact page exists; automate routing/triage of inbound requests.',
    ruleRef: 'understanding.automation.contactTriage', test: c => c.pathHas('contact').length > 0, sources: c => c.pathHas('contact') },
];

// Generic fallbacks (low confidence) to always offer at least 3 ideas.
const FALLBACK_OPPS: AutomationOpportunity[] = [
  { id: 'document-qa-assistant', title: 'Document Q&A assistant for your team', impact: 'medium', effort: 'low', rationale: 'A general, high-leverage starting point.', sources: ['identity:title'], ruleRef: 'understanding.automation.fallback' },
  { id: 'reporting-automation',  title: 'Automate recurring reports', impact: 'medium', effort: 'medium', rationale: 'A general, high-leverage starting point.', sources: ['identity:title'], ruleRef: 'understanding.automation.fallback' },
  { id: 'email-triage',          title: 'Automate email triage & drafting', impact: 'low', effort: 'low', rationale: 'A general, high-leverage starting point.', sources: ['identity:title'], ruleRef: 'understanding.automation.fallback' },
];

function buildOpportunities(ctx: Ctx): AutomationOpportunity[] {
  const out: AutomationOpportunity[] = [];
  const seen = new Set<string>();
  for (const r of OPP_RULES) {
    if (!r.test(ctx)) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push({ id: r.id, title: r.title, impact: r.impact, effort: r.effort, rationale: r.rationale,
      sources: Array.from(new Set(r.sources(ctx))).sort(), ruleRef: r.ruleRef });
  }
  for (const f of FALLBACK_OPPS) {
    if (out.length >= 3) break;
    if (seen.has(f.id)) continue;
    seen.add(f.id);
    out.push({ ...f });
  }
  out.sort((a, b) => {
    const i = IMPACT_RANK[b.impact] - IMPACT_RANK[a.impact];
    if (i !== 0) return i;
    const e = EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort];
    if (e !== 0) return e;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return out.slice(0, 5);
}

/* ── Deeper audit (indicative) ──────────────────────────────────────────── */

function deeperAudit(dets: ExtractDetection[], flags: ShadowAiFlag[]): DeeperAudit {
  const hasAi = dets.some(d => d.category === 'ai_chat');
  const aiSources = dets.filter(d => d.category === 'ai_chat').flatMap(d => d.sources);
  const band: DeeperAudit['euAiActLevelIndicative'] = hasAi ? 'limited-indicative' : 'minimal-indicative';
  const rationale = hasAi
    ? 'AI-facing widgets were detected; transparency practices toward users may be worth reviewing. ' + DISCLAIMER
    : 'No public AI-facing widgets were detected on the pages read. ' + DISCLAIMER;
  const shadowAiSummary = flags.length
    ? 'AI/measurement tools were detected without a visible consent tool on the pages read.'
    : 'No shadow-AI governance gaps were detected on the pages read.';
  const quickWins: QuickWin[] = [];
  if (hasAi) quickWins.push({ text: 'Add a short notice when users interact with an AI assistant.', sources: Array.from(new Set(aiSources)).sort(), ruleRef: 'understanding.quickWin.aiNotice' });
  for (const f of flags) {
    if (f.id.indexOf('without-consent-tool') !== -1) {
      quickWins.push({ text: 'Add a consent/cookie tool covering tracking and AI widgets.', sources: f.sources, ruleRef: 'understanding.quickWin.consentTool' });
      break;
    }
  }
  quickWins.push({ text: 'Document which AI tools are used and who owns them.', sources: ['identity:title'], ruleRef: 'understanding.quickWin.aiInventory' });
  return {
    euAiActLevelIndicative: band,
    euAiActRationale:       rationale,
    shadowAiSummary,
    quickWins:              quickWins.slice(0, 3),
    sources:                Array.from(new Set(aiSources)).sort(),
  };
}

/* ── Public entry point (pure) ──────────────────────────────────────────── */

export function understand(s: ExtractSnapshot): Understanding {
  const frags = buildFragments(s);
  const dets = (s.detections || []) as ExtractDetection[];

  const bt = classifyBusinessType(frags, dets);
  const aud = classifyAudience(frags);
  const offers = deriveOffers(frags);
  const langs = s.identity?.lang ? [s.identity.lang] : [];

  const profileSources = Array.from(new Set([...bt.sources, ...aud.sources])).sort();
  const confidence: Confidence = bt.score >= 3 ? 'high' : bt.score >= 1 ? 'medium' : 'low';

  const ctx: Ctx = {
    type: bt.type,
    frags,
    dets,
    has: (cat: string) => dets.some(d => d.category === cat),
    pathHas: (kw: string) => frags.filter(f => f.source.startsWith('path:') && f.text.indexOf(kw) !== -1).map(f => f.source),
    detSources: (cat: string) => Array.from(new Set(dets.filter(d => d.category === cat).flatMap(d => d.sources))).sort(),
  };

  const flags = shadowAiFlags(dets);
  const opportunities = buildOpportunities(ctx);
  const audit = deeperAudit(dets, flags);

  const trace: Trace = {
    businessProfile:         [ruleRef('understanding.businessType.keywordScore'), ruleRef('understanding.audience.keywordScore'), ruleRef('understanding.offers.keywordTags')],
    aiUsageSignals:          [ruleRef('understanding.aiUsage.detectionCategory')],
    shadowAiFlags:           [ruleRef('understanding.shadowAi.governanceGap')],
    automationOpportunities: [ruleRef(`understanding.automation.map@${UNDERSTANDING_RULESET_VERSION}`)],
    deeperAudit:             [ruleRef('understanding.euAiAct.indicativeBand'), benchmarkRef('understanding.euAiAct.disclaimer')],
  };

  return {
    engineVersion:               ENGINE_VERSION,
    understandingRulesetVersion: UNDERSTANDING_RULESET_VERSION,
    businessProfile: {
      businessType: bt.type,
      audience:     aud.audience,
      offers,
      languages:    langs,
      confidence,
      sources:      profileSources,
    },
    aiUsageSignals: aiUsageSignals(dets),
    shadowAiFlags:  flags,
    automationOpportunities: opportunities,
    deeperAudit:    audit,
    trace,
  };
}
