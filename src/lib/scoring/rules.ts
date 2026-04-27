/**
 * Per-question scoring rules.
 * Each rule maps an answer value to a 0–100 score.
 * Section weights for the global average are defined here too.
 */

import type { AuditAnswers, SectionKey } from '../../types/audit';
import type { QuestionScorer } from '../../types/scoring';

/* ── Helpers ──────────────────────────────────────────────── */

const filledText = (v: unknown): number => {
  if (typeof v !== 'string') return 0;
  return v.trim().length > 0 ? 100 : 0;
};

const filledTextarea = (minChars = 20): QuestionScorer => v => {
  if (typeof v !== 'string') return 0;
  const len = v.trim().length;
  if (len === 0) return 0;
  if (len < minChars) return 50; // partial credit for very short
  return 100;
};

const yesGood: QuestionScorer = v => (v === true ? 100 : v === false ? 0 : 0);

const scaledFiveLevel: QuestionScorer = v => {
  const map: Record<string, number> = { '1': 0, '2': 25, '3': 50, '4': 75, '5': 100 };
  return typeof v === 'string' && v in map ? map[v] : 0;
};

const labelled = (map: Record<string, number>): QuestionScorer => v =>
  typeof v === 'string' && v in map ? map[v] : 0;

const countOutOf = (total: number): QuestionScorer => v => {
  if (!Array.isArray(v)) return 0;
  return Math.min(100, Math.round((v.length / total) * 100));
};

const filledSingle: QuestionScorer = v => (typeof v === 'string' && v.length > 0 ? 100 : 0);

/* ── Section weights (must sum to 1.0) ────────────────────── */

export const SECTION_WEIGHTS: Record<SectionKey, number> = {
  profile: 0.05,
  'ai-tools': 0.10,
  data: 0.15,
  governance: 0.15,
  security: 0.15,
  transparency: 0.10,
  'human-oversight': 0.15,
  'training-maturity': 0.15,
};

/* ── Question scorers, indexed by question id ─────────────── */

export const QUESTION_RULES: Record<string, QuestionScorer> = {
  /* Profile — completeness only */
  'profile.org_name': filledText,
  'profile.industry': filledSingle,
  'profile.size': filledSingle,
  'profile.region': filledSingle,

  /* AI tools */
  'tools.categories': v => (Array.isArray(v) && v.length > 0 ? 100 : 0),
  'tools.vendors': filledTextarea(10),
  'tools.scope': filledSingle, // scope itself is completeness; risk handled via context flag
  'tools.builds_custom': v => (typeof v === 'boolean' ? 100 : 0),

  /* Data */
  'data.types': v => (Array.isArray(v) && v.length > 0 ? 100 : 0),
  'data.residency': labelled({ eu: 100, us: 90, mixed: 70, unknown: 30 }),
  'data.governance_framework': yesGood,
  'data.sources': filledTextarea(15),

  /* Governance */
  'gov.committee': yesGood,
  'gov.written_policy': yesGood,
  'gov.frameworks': v => {
    if (!Array.isArray(v) || v.length === 0) return 0;
    const real = v.filter(x => x !== 'none');
    if (real.length === 0) return 0;
    if (real.length === 1) return 50;
    if (real.length === 2) return 80;
    return 100;
  },
  'gov.structure': filledTextarea(20),

  /* Security */
  'sec.controls': countOutOf(5),
  'sec.red_team': yesGood,
  'sec.incident_readiness': scaledFiveLevel,
  'sec.review_process': filledTextarea(20),

  /* Transparency */
  'trans.disclosure': yesGood,
  'trans.cards': yesGood,
  'trans.explainability': labelled({
    none: 0,
    generic: 25,
    category: 50,
    individual: 75,
    realtime: 100,
  }),
  'trans.measures': filledTextarea(15),

  /* Human oversight */
  'over.model': labelled({ hitl: 100, hotl: 70, oot: 30 }),
  'over.escalation': yesGood,
  'over.review_categories': v => {
    if (!Array.isArray(v)) return 0;
    if (v.length === 0) return 0;
    if (v.length <= 2) return 50;
    return 100;
  },
  'over.processes': filledTextarea(20),

  /* Training & maturity */
  'train.staff_training': yesGood,
  'train.maturity': scaledFiveLevel,
  'train.topics': countOutOf(5),
  'train.program': filledTextarea(15),
};

/* ── Score a question / score a section ──────────────────── */

export function scoreQuestion(questionId: string, answer: unknown): number {
  const rule = QUESTION_RULES[questionId];
  if (!rule) return 0;
  return rule(answer);
}

export function scoreSection(
  questionIds: string[],
  answers: AuditAnswers,
): number {
  if (questionIds.length === 0) return 0;
  const sum = questionIds.reduce((acc, qid) => acc + scoreQuestion(qid, answers[qid]), 0);
  return Math.round(sum / questionIds.length);
}
