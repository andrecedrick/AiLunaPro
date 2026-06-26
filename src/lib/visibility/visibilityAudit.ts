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

/** Question bank (méthode §7.1 GEO / §7.2 social). Order is stable. */
export const VISIBILITY_QUESTIONS: VisibilityQuestion[] = [
  // ── GEO / AI Search ──
  { id: 'geo_offer',      dimension: 'geo', weight: 3, label: 'Les IA (ChatGPT, Perplexity, Gemini) décrivent-elles correctement ton offre et tes avantages (USP) ?', reco: 'Publie des pages claires « source de vérité » (offre, USP, prix) pour que les IA citent les bons faits.' },
  { id: 'geo_appear',     dimension: 'geo', weight: 3, label: 'Ta marque apparaît-elle dans les réponses IA sur tes requêtes clés ?', reco: 'Teste tes 10 requêtes clés dans ChatGPT/Perplexity ; vise une présence et corrige les pages manquantes.' },
  { id: 'geo_cited',      dimension: 'geo', weight: 2, label: 'Ton site est-il cité comme source par les moteurs IA ?', reco: 'Repère les sources tierces citées (Reddit, Quora, médias) où tu es absent → liste de PR digitale prioritaire.' },
  { id: 'geo_competitor', dimension: 'geo', weight: 2, label: 'Sais-tu comment les IA te comparent à tes concurrents (qui elles mettent en avant) ?', reco: 'Audite le positionnement concurrentiel dans les réponses IA et identifie l’argument qui fait gagner le concurrent.' },
  { id: 'geo_sentiment',  dimension: 'geo', weight: 2, label: 'Le sentiment des IA sur ta marque est-il positif et exact ?', reco: 'Corrige à la source (ton site) les faits négatifs/erronés pour que les IA mettent à jour leur perception.' },
  { id: 'geo_structured', dimension: 'geo', weight: 2, label: 'As-tu du contenu structuré (FAQ, schema, pages piliers) optimisé pour être capté par les IA ?', reco: 'Ajoute FAQ, données structurées (schema.org) et pages piliers pour être capté comme source de vérité.' },

  // ── Social media & content ──
  { id: 'soc_story',      dimension: 'social', weight: 3, label: 'Ton contenu social construit-il une autorité (storytelling) plutôt que du spam de démos ?', reco: 'Passe du spam de fonctionnalités au storytelling (échecs/réussites) pour bâtir l’autorité.' },
  { id: 'soc_meetings',   dimension: 'social', weight: 2, label: 'Mesures-tu les rendez-vous qualifiés générés (au-delà des likes/impressions) ?', reco: 'Suis la métrique « rendez-vous qualifiés » : c’est elle qui compte, pas les likes.' },
  { id: 'soc_cadence',    dimension: 'social', weight: 2, label: 'Publies-tu à une cadence régulière et tenable ?', reco: 'Mets en place un calendrier éditorial régulier (cadence tenable > pics irréguliers).' },
  { id: 'soc_unique',     dimension: 'social', weight: 2, label: 'Ton contenu reflète-t-il une expertise unique difficile à copier (« productize yourself ») ?', reco: 'Mets en avant ton angle/expertise unique pour échapper à la concurrence générique.' },
  { id: 'soc_repurpose',  dimension: 'social', weight: 1, label: 'Réutilises-tu ton contenu en plusieurs formats (repurposing) ?', reco: 'Décline chaque contenu en plusieurs formats (post, vidéo, carrousel) pour démultiplier la portée.' },
  { id: 'soc_oversight',  dimension: 'social', weight: 2, label: 'Le contenu généré par IA est-il supervisé (anti « Shadow Social » / hallucinations) ?', reco: 'Mets une relecture humaine sur le contenu IA pour éviter hallucinations et perte d’authenticité.' },
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
