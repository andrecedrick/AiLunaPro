/**
 * B6.2 — typed accessors for the `questions` namespace.
 *
 * The dictionary is keyed by the audit's STABLE identifiers (SectionKey, the
 * dotted question id, and `${qid}.${value}` for options) — those identifiers
 * stay byte-stable in mockAuditQuestions.ts and feed scoring; only the display
 * copy lives here. Because `Dict` is a deep, fixed-shape map (no index
 * signature), dynamic lookup by a runtime id needs a localized cast — kept here
 * so call sites stay clean and always fall back to the English data label.
 */
import type { Dict } from './en';

export interface QSection { title: string; subtitle: string }
export interface QField { label: string; helper?: string; placeholder?: string }

/** Translated section {title, subtitle} for a SectionKey, or undefined. */
export function qSection(T: Dict, key: string): QSection | undefined {
  return (T.questions.section as unknown as Record<string, QSection>)[key];
}

/** Translated {label, helper?, placeholder?} for a question id, or undefined. */
export function qField(T: Dict, id: string): QField | undefined {
  return (T.questions.field as unknown as Record<string, QField>)[id];
}

/** Translated option label for a question id + option value, or undefined. */
export function qOption(T: Dict, id: string, value: string): string | undefined {
  return (T.questions.option as unknown as Record<string, string>)[`${id}.${value}`];
}

/* ── Audit Express (B6.2c) — keyed by AX_QUESTIONS key + option value ── */

/** Translated label for an Audit Express question key, or undefined. */
export function axLabel(T: Dict, key: string): string | undefined {
  return (T.audit.express.q as unknown as Record<string, { label: string }>)[key]?.label;
}

/** Translated option label for an Audit Express question key + value, or undefined. */
export function axOption(T: Dict, key: string, value: string): string | undefined {
  return (T.audit.express.q as unknown as Record<string, { opt: Record<string, string> }>)[key]?.opt?.[value];
}
