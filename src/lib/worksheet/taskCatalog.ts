/**
 * Task catalog + disambiguation (worksheet intelligence) — deterministic, no LLM.
 *
 * Two jobs:
 *  1. TASK_CATALOG — a curated list of frequent tasks with sensible default
 *     who/rules/energy so anyone knows "what to mention" without thinking.
 *  2. suggestForLabel() — when a typed label is ambiguous (e.g. "appel
 *     téléphonique" could be inbound support OR outbound prospecting, which get
 *     DIFFERENT verdicts), returns a hint + ready-to-use precise splits.
 *
 * i18n: every group/task/split carries a STABLE `id` and every rule a stable
 * `id`; the display strings live in T.auditTools.taskCatalog (keyed by those ids)
 * and the UI resolves them there. The French `label`/`hint` fields below are kept
 * only as a structural fallback (and as the matching/verdict source) — the UI
 * never renders them when a translation is present. Locked by
 * tests/unit/worksheet-catalog.test.ts.
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
    id: 'admin', group: 'Administratif',
    tasks: [
      { id: 'emails_reply',  label: 'Répondre aux emails',      who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'appointments',  label: 'Prendre des rendez-vous',  who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'schedule',      label: 'Gestion planning / agenda', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'filing',        label: 'Classement de documents',  who: 'anyone', rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'sales', group: 'Vente & prospection',
    tasks: [
      { id: 'cold_calls',    label: 'Appels sortants (prospection)', who: 'self',   rules: 'no',  energy: 'energizing' },
      { id: 'followups',     label: 'Relances clients',              who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'quotes_write',  label: 'Rédaction de devis',            who: 'self',   rules: 'yes', energy: 'neutral' },
      { id: 'crm_entry',     label: 'Saisie de données CRM',         who: 'anyone', rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'support', group: 'Support client',
    tasks: [
      { id: 'inbound_calls', label: 'Appels entrants (support)', who: 'anyone', rules: 'yes', energy: 'neutral' },
      { id: 'support_l1',    label: 'Support client niveau 1',   who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'reviews_faq',   label: 'Réponses aux avis / FAQ',   who: 'anyone', rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    id: 'marketing', group: 'Marketing & contenu',
    tasks: [
      { id: 'content_social',  label: 'Création de contenu réseaux',   who: 'self',   rules: 'no',  energy: 'energizing' },
      { id: 'social_planning', label: 'Planification réseaux sociaux', who: 'anyone', rules: 'yes', energy: 'neutral' },
      { id: 'market_research', label: 'Veille / recherche marché',     who: 'anyone', rules: 'no',  energy: 'neutral' },
    ],
  },
  {
    id: 'finance', group: 'Finance & RH',
    tasks: [
      { id: 'accounting',    label: 'Comptabilité / facturation', who: 'specialist', rules: 'no',  energy: 'neutral' },
      { id: 'weekly_report', label: 'Reporting hebdomadaire',     who: 'anyone',     rules: 'yes', energy: 'draining' },
      { id: 'cv_screening',  label: 'Tri de CV / présélection',   who: 'anyone',     rules: 'yes', energy: 'draining' },
      { id: 'expenses',      label: 'Note de frais / dépenses',   who: 'anyone',     rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'ops', group: 'Opérations',
    tasks: [
      { id: 'data_entry',   label: 'Saisie de données / encodage', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'inventory',    label: 'Suivi de stock / inventaire',  who: 'anyone', rules: 'yes', energy: 'neutral' },
      { id: 'translation',  label: 'Traduction de contenu',        who: 'anyone', rules: 'no',  energy: 'neutral' },
      { id: 'blog_writing', label: 'Rédaction d’articles / blog',  who: 'self',   rules: 'no',  energy: 'energizing' },
    ],
  },
  {
    id: 'strategy', group: 'Stratégie',
    tasks: [
      { id: 'high_prospecting', label: 'Prospection / rdv haut niveau', who: 'self', rules: 'yes', energy: 'energizing' },
      { id: 'vision',           label: 'Stratégie & vision',            who: 'self', rules: 'no',  energy: 'energizing' },
      { id: 'onboarding',       label: 'Onboarding client',             who: 'self', rules: 'no',  energy: 'energizing' },
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
  keywords: string[];
  hint:     string;
  splits:   CatalogTask[];
}

/** Ambiguity rules. First keyword match wins (order matters). */
const RULES: Rule[] = [
  {
    id: 'calls',
    keywords: ['appel', 'téléphon', 'telephon', 'phone', 'call'],
    hint: 'Ambigu : appels ENTRANTS (support) ou SORTANTS (prospection) ? Leur verdict diffère — sépare-les.',
    splits: [
      { id: 'inbound_calls', label: 'Appels entrants (support)',     who: 'anyone', rules: 'yes', energy: 'neutral' },
      { id: 'cold_calls',    label: 'Appels sortants (prospection)', who: 'self',   rules: 'no',  energy: 'energizing' },
    ],
  },
  {
    id: 'email',
    keywords: ['email', 'e-mail', 'mail', 'courriel', 'slack', 'messagerie'],
    hint: 'Précise : support client, relances commerciales, ou échanges internes ? Chacun a un verdict différent.',
    splits: [
      { id: 'email_support', label: 'Emails support client',  who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'email_sales',   label: 'Relances commerciales',  who: 'anyone', rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'meeting',
    keywords: ['réunion', 'reunion', 'rdv', 'rendez', 'meeting'],
    hint: 'Interne ou client ? Récurrent ou ponctuel ? Les réunions client à fort enjeu se gardent.',
    splits: [
      { id: 'meetings_internal', label: 'Réunions internes',   who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'meetings_client',   label: 'Rendez-vous clients', who: 'self',   rules: 'no',  energy: 'energizing' },
    ],
  },
  {
    id: 'content',
    keywords: ['réseau', 'reseau', 'social', 'post', 'contenu', 'linkedin', 'insta', 'tiktok'],
    hint: 'Sépare CRÉATION (jugement, à garder) et PUBLICATION/planification (réglée, automatisable).',
    splits: [
      { id: 'content_create',  label: 'Création de contenu',         who: 'self',   rules: 'no',  energy: 'energizing' },
      { id: 'content_publish', label: 'Planification / publication', who: 'anyone', rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    id: 'invoice',
    keywords: ['facture', 'facturation', 'devis', 'invoice', 'quote'],
    hint: 'Émission standard (règles claires → automatiser) vs négociation/sur-mesure (jugement → garder/déléguer).',
    splits: [
      { id: 'invoice_issue',  label: 'Émission de factures', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'quotes_custom',  label: 'Devis sur-mesure',     who: 'self',   rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    id: 'report',
    keywords: ['rapport', 'reporting', 'report', 'tableau de bord', 'dashboard', 'kpi'],
    hint: 'Si les données sont déjà structurées, le reporting est souvent automatisable.',
    splits: [],
  },
  {
    id: 'recruit',
    keywords: ['cv', 'recrut', 'candidat', 'entretien', 'hiring'],
    hint: 'Tri de CV (critères clairs → automatisable) vs entretien final (jugement humain → garder).',
    splits: [
      { id: 'cv_screening', label: 'Tri de CV / présélection', who: 'anyone', rules: 'yes', energy: 'draining' },
      { id: 'interviews',   label: 'Entretiens candidats',     who: 'self',   rules: 'no',  energy: 'neutral' },
    ],
  },
  {
    id: 'data',
    keywords: ['saisie', 'encodage', 'donnée', 'donnees', 'data', 'tableur', 'excel', 'copier-coller'],
    hint: 'Entrée structurée ? La saisie/recopie de données est presque toujours automatisable.',
    splits: [],
  },
  {
    id: 'writing',
    keywords: ['rédaction', 'redaction', 'rédiger', 'rediger', 'écrire', 'ecrire', 'article', 'blog', 'copywriting'],
    hint: 'Première version (copilote IA, rapide) vs validation/édition finale (jugement humain).',
    splits: [],
  },
  {
    id: 'translate',
    keywords: ['traduction', 'traduire', 'translate', 'localisation'],
    hint: 'Volume répétitif → automatisable ; nuance marketing/juridique → relecture humaine.',
    splits: [],
  },
  {
    id: 'logistics',
    keywords: ['livraison', 'logistique', 'tournée', 'tournee', 'stock', 'inventaire', 'expédition', 'expedition'],
    hint: 'Optimisation de tournées / suivi de stock → automatisable ; relation transporteur → humain.',
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
