/**
 * Audit Enrichment — AI signal detection (cahier §26.4, §26.6 rule 2).
 *
 * PURE and DETERMINISTIC. Same text in, same observations out, in the same order.
 * This is the extraction half of collection: it decides what was OBSERVED, never
 * what it means. No scoring, no findings, no recommendations — Phases 4 and 5.
 *
 * COLLECTOR-NEUTRAL ON PURPOSE. Apify and Agent-Reach both reduce to text plus a
 * URL, so both run through this one catalogue. Two copies of the vendor table
 * would drift, and the symptom would be a vendor detected on a website but missed
 * on a GitHub page for no reason a reader could discover.
 *
 * Detection is a rule table rather than a model. Extraction may legitimately use
 * a model (§26.6 rule 2), but a rule table is reproducible for free and
 * reproducibility is the property the engine rests on.
 *
 * Confidence is NOT set here. It is derived from the signal type by
 * enrichment-evidence.ts, so a detector cannot grade its own finding (§26.15 D4).
 */

import type { RawObservation, SourceType, SignalType, Collector } from './enrichment-evidence';

/** Window of surrounding text kept as the captured excerpt. */
const EXCERPT_WINDOW = 240;
/** Cap per document, so one enormous page cannot dominate a snapshot. */
const MAX_OBSERVATIONS_PER_ITEM = 25;

/**
 * Known AI vendors.
 *
 * `patterns` match a script src, a domain or a product name in text.
 * Deliberately conservative: a false vendor attribution becomes a false claim
 * that a customer failed to declare something. Absence is recoverable; a wrong
 * accusation in a compliance report is not.
 */
export interface VendorRule { name: string; patterns: RegExp[] }

export const AI_VENDORS: readonly VendorRule[] = [
  { name: 'OpenAI',            patterns: [/\bopenai\b/i, /api\.openai\.com/i, /\bchatgpt\b/i, /\bgpt-[345]\b/i] },
  { name: 'Anthropic',         patterns: [/\banthropic\b/i, /api\.anthropic\.com/i, /\bclaude\b(?!\s*monet)/i] },
  { name: 'Google Cloud AI',   patterns: [/\bvertex\s*ai\b/i, /generativelanguage\.googleapis\.com/i, /\bgemini\s*api\b/i] },
  { name: 'Microsoft Azure OpenAI', patterns: [/\bazure\s*openai\b/i, /openai\.azure\.com/i] },
  { name: 'AWS Bedrock',       patterns: [/\bbedrock\b.*\baws\b/i, /bedrock-runtime\./i] },
  { name: 'Hugging Face',      patterns: [/\bhugging\s*face\b/i, /huggingface\.co/i] },
  { name: 'Mistral AI',        patterns: [/\bmistral\s*ai\b/i, /api\.mistral\.ai/i] },
  { name: 'Cohere',            patterns: [/\bcohere\b/i, /api\.cohere\.(ai|com)/i] },
  { name: 'Intercom',          patterns: [/widget\.intercom\.io/i, /\bintercom\b.*\b(ai|fin)\b/i] },
  { name: 'Drift',             patterns: [/js\.driftt\.com/i] },
  { name: 'Zendesk AI',        patterns: [/\bzendesk\b.*\bai\b/i] },
  { name: 'Salesforce Einstein', patterns: [/\beinstein\s*(ai|gpt)\b/i] },
  { name: 'IBM Watson',        patterns: [/\bwatson\b.*\b(assistant|ai)\b/i] },
  { name: 'Algolia',           patterns: [/\balgolia\b.*\b(ai|neural)\b/i] },
  { name: 'Segment',           patterns: [/cdn\.segment\.(com|io)/i] },
  { name: 'Amplitude',         patterns: [/\bamplitude\b.*\bai\b/i] },
];

/** Automated decision-making / profiling language. Maps to a GDPR Art. 22 concern. */
const AUTOMATED_DECISION = [
  /automated\s+decision[- ]?making/i,
  /solely\s+automated\s+processing/i,
  /\bprofiling\b/i,
  /algorithmic\s+decision/i,
];

/** Marketing claims. Weakest class — usually copywriting, not a declared system. */
const MARKETING_CLAIMS = [
  /\bai[- ]powered\b/i, /\bpowered\s+by\s+ai\b/i, /\bai[- ]driven\b/i,
  /\bmachine\s+learning\b/i, /\bintelligent\s+automation\b/i,
];

/** A published AI usage or governance policy. */
const AI_POLICY = [
  /\bai\s+(usage\s+)?policy\b/i, /\bresponsible\s+ai\b/i,
  /\bai\s+governance\b/i, /\bacceptable\s+use\b.*\bai\b/i,
];

/** AI capability described in product docs or a changelog. */
const FEATURE_DOC = [
  /\bai\s+(assistant|agent|feature|model|summar)/i,
  /\bllm\b/i, /\bembedding(s)?\b/i, /\bvector\s+(search|database)\b/i,
];

/** ML libraries in a public repository. */
const REPO_DEPENDENCY = [
  /\btensorflow\b/i, /\bpytorch\b/i, /\btorch\b/i, /\btransformers\b/i,
  /\bscikit-learn\b/i, /\blangchain\b/i, /\bllama[- ]?index\b/i, /\bonnxruntime\b/i,
];

/** Hiring signals. */
const JOB_POSTING = [
  /\b(machine\s+learning|ml)\s+engineer\b/i, /\bai\s+engineer\b/i,
  /\bdata\s+scientist\b/i, /\bmlops\b/i,
];

/** Source types where a named vendor is contractual rather than incidental. */
const CONTRACTUAL_SOURCES: readonly SourceType[] = ['dpa', 'processor_list', 'privacy_policy', 'terms', 'legal_page'];

/** Source types that carry code, where a library name means a real dependency. */
const CODE_SOURCES: readonly SourceType[] = ['repository', 'github'];

/**
 * Placeholder subjects used when a pattern fires but names no vendor.
 *
 * "AI/ML dependency" is a CATEGORY, not a system. It must never be treated as
 * the name of something the customer failed to declare — nobody can add
 * "AI/ML dependency" to an AI registry, and a finding demanding it would be
 * both unactionable and wrong. Exported so the comparison engine and the report
 * share one definition instead of each keeping its own guess.
 */
export const GENERIC_SUBJECTS: ReadonlySet<string> = new Set([
  'Automated decision-making', 'AI policy', 'AI/ML dependency',
  'AI capability', 'AI/ML hiring', 'AI marketing claim',
]);

/** True when an observation names no identifiable system. */
export const isGenericSubject = (observedValue: string): boolean =>
  GENERIC_SUBJECTS.has(observedValue);

/**
 * Excerpt around a match, snapped to a fixed window and whitespace-normalised.
 *
 * Deterministic by construction: the same match position in the same text always
 * yields the same excerpt, which is what keeps the evidence hash stable across
 * re-collections of an unchanged page.
 */
export function excerptAround(text: string, index: number, length: number): string {
  const half = Math.floor((EXCERPT_WINDOW - length) / 2);
  const start = Math.max(0, index - Math.max(0, half));
  return text.slice(start, start + EXCERPT_WINDOW).replace(/\s+/g, ' ').trim();
}

export interface Match { signalType: SignalType; observedValue: string; index: number; length: number }

/** First match of each pattern group, in declaration order. */
function scanPatterns(text: string, patterns: readonly RegExp[], signalType: SignalType, label: string): Match[] {
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return [{ signalType, observedValue: label, index: m.index, length: m[0].length }];
  }
  return [];
}

/**
 * Detect signals in one document.
 *
 * Vendors first and once each: a page naming OpenAI six times is one observation
 * about OpenAI, not six. On a contractual page (a DPA or sub-processor list) a
 * vendor is recorded as `ai_processor_named` rather than `ai_vendor_script`,
 * because a name in a contract is a much stronger statement than a name in prose.
 */
export function detectSignals(text: string, sourceType: SourceType): Match[] {
  const out: Match[] = [];
  const contractual = CONTRACTUAL_SOURCES.includes(sourceType);

  for (const vendor of AI_VENDORS) {
    for (const re of vendor.patterns) {
      const m = re.exec(text);
      if (!m) continue;
      out.push({
        signalType: contractual ? 'ai_processor_named' : 'ai_vendor_script',
        observedValue: vendor.name, index: m.index, length: m[0].length,
      });
      break;   // one observation per vendor per document
    }
  }

  out.push(...scanPatterns(text, AUTOMATED_DECISION, 'automated_decision', 'Automated decision-making'));
  out.push(...scanPatterns(text, AI_POLICY, 'ai_policy_published', 'AI policy'));
  if (CODE_SOURCES.includes(sourceType)) {
    out.push(...scanPatterns(text, REPO_DEPENDENCY, 'ai_repo_dependency', 'AI/ML dependency'));
  }
  out.push(...scanPatterns(text, FEATURE_DOC, 'ai_feature_doc', 'AI capability'));
  out.push(...scanPatterns(text, JOB_POSTING, 'ai_job_posting', 'AI/ML hiring'));
  out.push(...scanPatterns(text, MARKETING_CLAIMS, 'ai_marketing_claim', 'AI marketing claim'));

  return out.slice(0, MAX_OBSERVATIONS_PER_ITEM);
}

export interface DocumentInput {
  url:            string;
  text:           string;
  sourceType:     SourceType;
  collector:      Collector;
  collectorRunId: string;
}

/**
 * Map one already-fetched document to observations, whatever fetched it.
 *
 * Returns nothing when the url or the text is missing: an observation with no
 * locatable source cannot become evidence (§26.7).
 */
export function mapDocument(doc: DocumentInput): RawObservation[] {
  if (!doc.url || !doc.text) return [];
  return detectSignals(doc.text, doc.sourceType).map(m => ({
    sourceUrl:        doc.url,
    sourceType:       doc.sourceType,
    collector:        doc.collector,
    collectorRunId:   doc.collectorRunId,
    capturedEvidence: excerptAround(doc.text, m.index, m.length),
    signalType:       m.signalType,
    observedValue:    m.observedValue,
  }));
}
