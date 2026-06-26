/**
 * Task catalog + disambiguation (worksheet intelligence) — deterministic, no LLM.
 *
 * Two jobs:
 *  1. COMMON_TASKS — a curated list of frequent tasks with sensible default
 *     who/rules/energy so anyone knows "what to mention" without thinking.
 *  2. suggestForLabel() — when a typed label is ambiguous (e.g. "appel
 *     téléphonique" could be inbound support OR outbound prospecting, which get
 *     DIFFERENT verdicts), returns a hint + ready-to-use precise splits.
 *
 * This replaces the need for a live web search for the common cases while staying
 * deterministic and offline. Locked by tests/unit/worksheet-catalog.test.ts.
 */

import type { Who, Rules, Energy } from './auditWorksheet';

export interface CatalogTask {
  label:  string;
  who:    Who;
  rules:  Rules;
  energy: Energy;
}

export interface CatalogGroup {
  group: string;
  tasks: CatalogTask[];
}

/** Curated common tasks grouped by domain (defaults are typical, user can edit). */
export const TASK_CATALOG: CatalogGroup[] = [
  {
    group: 'Administratif',
    tasks: [
      { label: 'Répondre aux emails',          who: 'anyone',     rules: 'yes', energy: 'draining' },
      { label: 'Prendre des rendez-vous',       who: 'anyone',     rules: 'yes', energy: 'draining' },
      { label: 'Gestion planning / agenda',     who: 'anyone',     rules: 'yes', energy: 'draining' },
      { label: 'Classement de documents',       who: 'anyone',     rules: 'yes', energy: 'draining' },
    ],
  },
  {
    group: 'Vente & prospection',
    tasks: [
      { label: 'Appels sortants (prospection)', who: 'self',       rules: 'no',  energy: 'energizing' },
      { label: 'Relances clients',              who: 'anyone',     rules: 'yes', energy: 'draining' },
      { label: 'Rédaction de devis',            who: 'self',       rules: 'yes', energy: 'neutral' },
      { label: 'Saisie de données CRM',         who: 'anyone',     rules: 'yes', energy: 'draining' },
    ],
  },
  {
    group: 'Support client',
    tasks: [
      { label: 'Appels entrants (support)',     who: 'anyone',     rules: 'yes', energy: 'neutral' },
      { label: 'Support client niveau 1',       who: 'anyone',     rules: 'yes', energy: 'draining' },
      { label: 'Réponses aux avis / FAQ',       who: 'anyone',     rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    group: 'Marketing & contenu',
    tasks: [
      { label: 'Création de contenu réseaux',   who: 'self',       rules: 'no',  energy: 'energizing' },
      { label: 'Planification réseaux sociaux', who: 'anyone',     rules: 'yes', energy: 'neutral' },
      { label: 'Veille / recherche marché',     who: 'anyone',     rules: 'no',  energy: 'neutral' },
    ],
  },
  {
    group: 'Finance & RH',
    tasks: [
      { label: 'Comptabilité / facturation',    who: 'specialist', rules: 'no',  energy: 'neutral' },
      { label: 'Reporting hebdomadaire',        who: 'anyone',     rules: 'yes', energy: 'draining' },
      { label: 'Tri de CV / recrutement',       who: 'anyone',     rules: 'yes', energy: 'draining' },
    ],
  },
  {
    group: 'Stratégie',
    tasks: [
      { label: 'Prospection / rdv haut niveau', who: 'self',       rules: 'yes', energy: 'energizing' },
      { label: 'Stratégie & vision',            who: 'self',       rules: 'no',  energy: 'energizing' },
      { label: 'Onboarding client',             who: 'self',       rules: 'no',  energy: 'energizing' },
    ],
  },
];

export interface Disambiguation {
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
      { label: 'Appels entrants (support)',     who: 'anyone', rules: 'yes', energy: 'neutral' },
      { label: 'Appels sortants (prospection)', who: 'self',   rules: 'no',  energy: 'energizing' },
    ],
  },
  {
    id: 'email',
    keywords: ['email', 'e-mail', 'mail', 'courriel', 'slack', 'messagerie'],
    hint: 'Précise : support client, relances commerciales, ou échanges internes ? Chacun a un verdict différent.',
    splits: [
      { label: 'Emails support client',  who: 'anyone', rules: 'yes', energy: 'draining' },
      { label: 'Relances commerciales',  who: 'anyone', rules: 'yes', energy: 'draining' },
    ],
  },
  {
    id: 'meeting',
    keywords: ['réunion', 'reunion', 'rdv', 'rendez', 'meeting'],
    hint: 'Interne ou client ? Récurrent ou ponctuel ? Les réunions client à fort enjeu se gardent.',
    splits: [
      { label: 'Réunions internes',          who: 'anyone', rules: 'yes', energy: 'draining' },
      { label: 'Rendez-vous clients',        who: 'self',   rules: 'no',  energy: 'energizing' },
    ],
  },
  {
    id: 'content',
    keywords: ['réseau', 'reseau', 'social', 'post', 'contenu', 'linkedin', 'insta', 'tiktok'],
    hint: 'Sépare CRÉATION (jugement, à garder) et PUBLICATION/planification (réglée, automatisable).',
    splits: [
      { label: 'Création de contenu',           who: 'self',   rules: 'no',  energy: 'energizing' },
      { label: 'Planification / publication',   who: 'anyone', rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    id: 'invoice',
    keywords: ['facture', 'facturation', 'devis', 'invoice', 'quote'],
    hint: 'Émission standard (règles claires → automatiser) vs négociation/sur-mesure (jugement → garder/déléguer).',
    splits: [
      { label: 'Émission de factures',      who: 'anyone', rules: 'yes', energy: 'draining' },
      { label: 'Devis sur-mesure',          who: 'self',   rules: 'yes', energy: 'neutral' },
    ],
  },
  {
    id: 'report',
    keywords: ['rapport', 'reporting', 'report', 'tableau de bord', 'dashboard', 'kpi'],
    hint: 'Si les données sont déjà structurées, le reporting est souvent automatisable.',
    splits: [],
  },
];

const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Return a disambiguation hint + suggested splits for an ambiguous label, else null. */
export function suggestForLabel(label: string): Disambiguation | null {
  const n = normalize(label);
  if (n.trim().length < 3) return null;
  for (const rule of RULES) {
    if (rule.keywords.some(k => n.includes(normalize(k)))) {
      return { hint: rule.hint, splits: rule.splits };
    }
  }
  return null;
}
