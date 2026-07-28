/**
 * Task catalog + disambiguation (worksheet intelligence) — deterministic, no LLM.
 *
 * Two jobs:
 *  1. TASK_CATALOG — a curated list of frequent tasks with sensible default
 *     who/rules/energy so anyone knows "what to mention" without thinking.
 *  2. suggestForLabel() — when a typed label is ambiguous (e.g. "phone call"
 *     could be inbound support OR outbound prospecting, which get DIFFERENT
 *     verdicts), returns a hint + ready-to-use precise splits.
 *
 * i18n: every group/task/split carries a STABLE `id` and every rule a stable
 * `id`; the display strings live in T.auditTools.taskCatalog (keyed by those ids)
 * and the UI resolves them there. The `label`/`group`/`hint` fields below are the
 * ENGLISH source strings — a structural fallback only; the UI never renders them
 * when a translation is present. Locked by tests/unit/worksheet-catalog.test.ts.
 *
 * `keywords` are NOT display copy: they are match tokens compared against text the
 * USER types, so they must cover every language a user may type in. They were
 * French-only for the ambiguity-specific terms, which meant an English user typing
 * "invoicing" or "data entry" silently got no suggestion at all. Each rule now
 * carries its English and French tokens; add further languages to the same array.
 */

import type { Who, Rules, Energy } from './auditWorksheet';

export interface CatalogTask {
  /** Stable id → T.auditTools.taskCatalog.tasks[id]. */
  id:     string;
  label:  string;
  who:    Who;
  rules:  Rules;
  energy: Energy;
}

export interface CatalogGroup {
  /** Stable id → T.auditTools.taskCatalog.groups[id]. */
  id:    string;
  group: string;
  tasks: CatalogTask[];
}

/** Curated common tasks grouped by domain (defaults are typical, user can edit). */
export const TASK_CATALOG: CatalogGroup[] = [
  {
    id: 'admin', group: 'Administrative',
    tasks: [
      { id: 'emails_reply',  label: 'Replying to emails',        who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'appointments',  label: 'Booking appointments',      who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'schedule',      label: 'Calendar / schedule admin', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'filing',        label: 'Filing documents',          who: 'anyone', rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'sales', group: 'Sales & prospecting',
    tasks: [
      { id: 'cold_calls',    label: 'Outbound calls (prospecting)', who: 'self',   rules: 'no',  energy: 'energizing' },
      { id: 'followups',     label: 'Customer follow-ups',          who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'quotes_write',  label: 'Writing quotes',               who: 'self',   rules: 'yes', energy: 'neutral' },
      { id: 'crm_entry',     label: 'CRM data entry',               who: 'anyone', rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'support', group: 'Customer support',
    tasks: [
      { id: 'inbound_calls', label: 'Inbound calls (support)', who: 'anyone', rules: 'yes', energy: 'neutral' },
      { id: 'support_l1',    label: 'Tier 1 customer support', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'reviews_faq',   label: 'Answering reviews / FAQ', who: 'anyone', rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    id: 'marketing', group: 'Marketing & content',
    tasks: [
      { id: 'content_social',  label: 'Creating social content',  who: 'self',   rules: 'no',  energy: 'energizing' },
      { id: 'social_planning', label: 'Social media scheduling',  who: 'anyone', rules: 'yes', energy: 'neutral' },
      { id: 'market_research', label: 'Market research / watch',  who: 'anyone', rules: 'no',  energy: 'neutral' },
    ],
  },
  {
    id: 'finance', group: 'Finance & HR',
    tasks: [
      { id: 'accounting',    label: 'Accounting / invoicing', who: 'specialist', rules: 'no',  energy: 'neutral' },
      { id: 'weekly_report', label: 'Weekly reporting',       who: 'anyone',     rules: 'yes', energy: 'draining' },
      { id: 'cv_screening',  label: 'CV screening / shortlist', who: 'anyone',   rules: 'yes', energy: 'draining' },
      { id: 'expenses',      label: 'Expense reports',        who: 'anyone',     rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'ops', group: 'Operations',
    tasks: [
      { id: 'data_entry',   label: 'Data entry / encoding',   who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'inventory',    label: 'Stock / inventory follow-up', who: 'anyone', rules: 'yes', energy: 'neutral' },
      { id: 'translation',  label: 'Translating content',     who: 'anyone', rules: 'no',  energy: 'neutral' },
      { id: 'blog_writing', label: 'Writing articles / blog', who: 'self',   rules: 'no',  energy: 'energizing' },
    ],
  },
  {
    id: 'strategy', group: 'Strategy',
    tasks: [
      { id: 'high_prospecting', label: 'High-level prospecting / meetings', who: 'self', rules: 'yes', energy: 'energizing' },
      { id: 'vision',           label: 'Strategy & vision',                 who: 'self', rules: 'no',  energy: 'energizing' },
      { id: 'onboarding',       label: 'Customer onboarding',               who: 'self', rules: 'no',  energy: 'energizing' },
    ],
  },
];

export interface Disambiguation {
  /** Stable rule id → T.auditTools.taskCatalog.hints[id]. */
  id:     string;
  hint:   string;
  splits: CatalogTask[];
}

interface Rule {
  id:       string;
  /** Match tokens, not display copy. Multilingual by design — see the file header. */
  keywords: string[];
  hint:     string;
  splits:   CatalogTask[];
}

/** Ambiguity rules. First keyword match wins (order matters). */
const RULES: Rule[] = [
  {
    id: 'calls',
    keywords: ['call', 'phone', 'dial', 'appel', 'téléphon', 'telephon'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'Ambiguous: INBOUND calls (support) or OUTBOUND calls (prospecting)? Their verdicts differ — split them.',
    splits: [
      { id: 'inbound_calls', label: 'Inbound calls (support)',       who: 'anyone', rules: 'yes', energy: 'neutral' },
      { id: 'cold_calls',    label: 'Outbound calls (prospecting)',  who: 'self',   rules: 'no',  energy: 'energizing' },
    ],
  },
  {
    id: 'email',
    keywords: ['email', 'e-mail', 'mail', 'inbox', 'slack', 'courriel', 'messagerie'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'Be specific: customer support, sales follow-ups, or internal threads? Each gets a different verdict.',
    splits: [
      { id: 'email_support', label: 'Customer support emails', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'email_sales',   label: 'Sales follow-ups',        who: 'anyone', rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'meeting',
    keywords: ['meeting', 'appointment', 'booking', 'réunion', 'reunion', 'rdv', 'rendez'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'Internal or customer-facing? Recurring or one-off? High-stakes customer meetings are worth keeping.',
    splits: [
      { id: 'meetings_internal', label: 'Internal meetings',  who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'meetings_client',   label: 'Customer meetings',  who: 'self',   rules: 'no',  energy: 'energizing' },
    ],
  },
  {
    id: 'content',
    keywords: ['content', 'social', 'post', 'linkedin', 'insta', 'tiktok', 'réseau', 'reseau', 'contenu'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'Split CREATION (judgement, keep it) from PUBLISHING/scheduling (rule-based, automatable).',
    splits: [
      { id: 'content_create',  label: 'Content creation',        who: 'self',   rules: 'no',  energy: 'energizing' },
      { id: 'content_publish', label: 'Scheduling / publishing', who: 'anyone', rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    id: 'invoice',
    keywords: ['invoice', 'invoicing', 'billing', 'quote', 'estimate', 'facture', 'facturation', 'devis'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'Standard issuing (clear rules → automate) vs negotiation / bespoke work (judgement → keep or delegate).',
    splits: [
      { id: 'invoice_issue',  label: 'Issuing invoices', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'quotes_custom',  label: 'Bespoke quotes',   who: 'self',   rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    id: 'report',
    keywords: ['report', 'reporting', 'dashboard', 'kpi', 'rapport', 'tableau de bord'],
    hint: 'If the data is already structured, reporting is usually automatable.',
    splits: [],
  },
  {
    id: 'recruit',
    keywords: ['recruit', 'hiring', 'candidate', 'interview', 'resume', 'cv', 'recrut', 'candidat', 'entretien'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'CV screening (clear criteria → automatable) vs final interview (human judgement → keep).',
    splits: [
      { id: 'cv_screening', label: 'CV screening / shortlist', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'interviews',   label: 'Candidate interviews',     who: 'self',   rules: 'no',  energy: 'neutral' },
    ],
  },
  {
    id: 'data',
    keywords: ['data', 'data entry', 'spreadsheet', 'excel', 'copy-paste', 'encoding', 'saisie', 'encodage', 'donnée', 'donnees', 'tableur', 'copier-coller'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'Structured input? Data entry and re-keying is almost always automatable.',
    splits: [],
  },
  {
    id: 'writing',
    keywords: ['writing', 'write', 'drafting', 'article', 'blog', 'copywriting', 'rédaction', 'redaction', 'rédiger', 'rediger', 'écrire', 'ecrire'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'First draft (AI copilot, fast) vs final review / edit (human judgement).',
    splits: [],
  },
  {
    id: 'translate',
    keywords: ['translate', 'translation', 'localisation', 'localization', 'traduction', 'traduire'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'Repetitive volume → automatable; marketing or legal nuance → human review.',
    splits: [],
  },
  {
    id: 'logistics',
    keywords: ['delivery', 'shipping', 'logistics', 'stock', 'inventory', 'route', 'livraison', 'logistique', 'tournée', 'tournee', 'inventaire', 'expédition', 'expedition'],  // LANG-EXEMPT: match tokens compared against user-typed text, not display copy.
    hint: 'Route optimisation and stock tracking → automatable; carrier relationships → human.',
    splits: [],
  },
];

const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Return a disambiguation rule id + hint + suggested splits for an ambiguous label, else null. */
export function suggestForLabel(label: string): Disambiguation | null {
  const n = normalize(label);
  if (n.trim().length < 3) return null;
  for (const rule of RULES) {
    if (rule.keywords.some(k => n.includes(normalize(k)))) {
      return { id: rule.id, hint: rule.hint, splits: rule.splits };
    }
  }
  return null;
}
