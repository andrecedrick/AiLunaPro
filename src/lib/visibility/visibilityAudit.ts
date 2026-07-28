/**
 * AI Visibility & Social audit engine (G3 + G4) — deterministic, no LLM.
 *
 * Scores a brand's presence in AI answers (GEO / AI Search — méthode §7.1) and on
 * social media / content (méthode §7.2) from a weighted questionnaire. Pure +
 * deterministic so the page recomputes live; thresholds and ordering are locked by
 * tests/unit/visibility-audit.test.ts.
 *
 * Answers are 0 (Non) · 0.5 (Partiel) · 1 (Oui). Each question carries a weight;
 * the dimension score is the weighted average ×100; the overall score is the
 * weighted average of the two dimensions. Recommendations are emitted for every
 * question answered below `RECO_THRESHOLD`, ranked by weight × gap (impact first).
 */

export type Dimension = 'geo' | 'social';
export type Grade = 'A' | 'B' | 'C' | 'D';

export interface VisibilityQuestion {
  id:        string;
  dimension: Dimension;
  label:     string;
  /** What to do when this is weak (shown as a recommendation). */
  reco:      string;
  weight:    number;
}

export const RECO_THRESHOLD = 0.75;

/**
 * Question bank (method §7.1 GEO / §7.2 social). Order is stable.
 *
 * `label`/`reco` are the ENGLISH source strings and a structural fallback only:
 * the UI resolves display copy from T.auditTools.visibility.questions.byId keyed
 * by the stable `id` (see VisibilityAuditPage). They are kept byte-identical to
 * the `en` locale entries so source and translation never drift.
 */
export const VISIBILITY_QUESTIONS: VisibilityQuestion[] = [
  // ── GEO / AI Search ──
  { id: 'geo_offer',      dimension: 'geo', weight: 3, label: 'Do AI tools (ChatGPT, Perplexity, Gemini) correctly describe your offer and your advantages (USP)?', reco: 'Publish clear "source of truth" pages (offer, USP, pricing) so AI engines cite the right facts.' },
  { id: 'geo_appear',     dimension: 'geo', weight: 3, label: 'Does your brand appear in AI answers for your key queries?', reco: 'Test your 10 key queries in ChatGPT/Perplexity; aim for presence and fix the missing pages.' },
  { id: 'geo_cited',      dimension: 'geo', weight: 2, label: 'Is your site cited as a source by AI engines?', reco: 'Find the third-party sources cited (Reddit, Quora, media) where you are absent → a prioritized digital-PR list.' },
  { id: 'geo_competitor', dimension: 'geo', weight: 2, label: 'Do you know how AI compares you to your competitors (who it highlights)?', reco: 'Audit the competitive positioning in AI answers and identify the argument that makes the competitor win.' },
  { id: 'geo_sentiment',  dimension: 'geo', weight: 2, label: 'Is the AI sentiment about your brand positive and accurate?', reco: 'Fix negative/incorrect facts at the source (your site) so AI engines update their perception.' },
  { id: 'geo_structured', dimension: 'geo', weight: 2, label: 'Do you have structured content (FAQ, schema, pillar pages) optimized to be captured by AI?', reco: 'Add FAQ, structured data (schema.org) and pillar pages to be captured as a source of truth.' },

  // ── Social media & content ──
  { id: 'soc_story',      dimension: 'social', weight: 3, label: 'Does your social content build authority (storytelling) rather than demo spam?', reco: 'Move from feature spam to storytelling (failures/wins) to build authority.' },
  { id: 'soc_meetings',   dimension: 'social', weight: 2, label: 'Do you measure the qualified meetings generated (beyond likes/impressions)?', reco: 'Track the "qualified meetings" metric: that\'s what counts, not likes.' },
  { id: 'soc_cadence',    dimension: 'social', weight: 2, label: 'Do you publish at a regular, sustainable cadence?', reco: 'Set up a regular editorial calendar (a sustainable cadence beats irregular spikes).' },
  { id: 'soc_unique',     dimension: 'social', weight: 2, label: 'Does your content reflect unique expertise that\'s hard to copy ("productize yourself")?', reco: 'Highlight your unique angle/expertise to escape generic competition.' },
  { id: 'soc_repurpose',  dimension: 'social', weight: 1, label: 'Do you repurpose your content into several formats?', reco: 'Repurpose each piece into several formats (post, video, carousel) to multiply reach.' },
  { id: 'soc_oversight',  dimension: 'social', weight: 2, label: 'Is AI-generated content supervised (anti "Shadow Social" / hallucinations)?', reco: 'Add human review on AI content to avoid hallucinations and loss of authenticity.' },
];

export type Answers = Record<string, number>; // id -> 0 | 0.5 | 1

export interface Recommendation {
  id:        string;
  dimension: Dimension;
  text:      string;
  priority:  number; // weight × (1 - answer); higher = do first
}

export interface DimensionScore {
  dimension: Dimension;
  score:     number; // 0–100
  answered:  number;
  total:     number;
}

export interface VisibilityResult {
  overallScore:    number; // 0–100
  grade:           Grade;
  dimensions:      DimensionScore[];
  recommendations: Recommendation[];
}

const round0 = (n: number): number => Math.round(n);
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

function gradeFor(score: number): Grade {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

function answerOf(answers: Answers, id: string): number {
  const v = answers[id];
  return typeof v === 'number' && Number.isFinite(v) ? clamp01(v) : 0;
}

function scoreDimension(answers: Answers, dimension: Dimension): DimensionScore {
  const qs = VISIBILITY_QUESTIONS.filter(q => q.dimension === dimension);
  const totalWeight = qs.reduce((s, q) => s + q.weight, 0);
  const weighted = qs.reduce((s, q) => s + answerOf(answers, q.id) * q.weight, 0);
  const score = totalWeight > 0 ? round0((weighted / totalWeight) * 100) : 0;
  const answered = qs.filter(q => answers[q.id] != null).length;
  return { dimension, score, answered, total: qs.length };
}

export function computeVisibility(answers: Answers): VisibilityResult {
  const dims: Dimension[] = ['geo', 'social'];
  const dimensions = dims.map(d => scoreDimension(answers, d));

  // Overall = weighted by each dimension's total question weight.
  const dimWeights = dims.map(d => VISIBILITY_QUESTIONS.filter(q => q.dimension === d).reduce((s, q) => s + q.weight, 0));
  const totalW = dimWeights.reduce((s, w) => s + w, 0);
  const overallScore = totalW > 0
    ? round0(dimensions.reduce((s, dim, i) => s + dim.score * dimWeights[i], 0) / totalW)
    : 0;

  const recommendations: Recommendation[] = VISIBILITY_QUESTIONS
    .filter(q => answerOf(answers, q.id) < RECO_THRESHOLD)
    .map(q => ({ id: q.id, dimension: q.dimension, text: q.reco, priority: round0(q.weight * (1 - answerOf(answers, q.id)) * 100) / 100 }))
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

  return { overallScore, grade: gradeFor(overallScore), dimensions, recommendations };
}
