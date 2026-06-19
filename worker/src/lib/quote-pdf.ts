/**
 * Quote (Devis) PDF — Phase Q3.
 *
 * Deterministic, dependency-free PDF built on the shared PdfBuilder (Base-14
 * Helvetica, WinAnsi). Same {input} => byte-identical output.
 *
 * Localization: the route receives already-localized display strings (the exact
 * text the UI shows) — Latin languages localized; RU/ZH fall back to English
 * (resolved client-side via pdfLocale()). The shared PdfBuilder runs text
 * through asciiSanitize which DROPS non-ASCII, so accented Latin would lose
 * letters; we fold accents to ASCII first (é→e, ñ→n, ß→ss, €→EUR …) so localized
 * Latin text stays readable. Full accent rendering is the deferred B6.3 work.
 *
 * No PII logging. No persistence here (the route persists the render payload).
 */

import { PdfBuilder } from './pdf/pdf-doc';

export const QUOTE_PDF_VERSION = 'Quote Engine v1';

/* Fold common Latin-1 / typographic characters to ASCII so the ASCII-only
 * builder renders localized Latin text without dropping accented letters. */
const FOLD_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae',
  'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ñ': 'n',
  'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'œ': 'oe',
  'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ý': 'y', 'ÿ': 'y', 'ß': 'ss',
  'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE',
  'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
  'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N',
  'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Œ': 'OE',
  'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y',
  '€': 'EUR ', '£': 'GBP ', '≈': '', '–': '-', '—': '-',
  '’': "'", '‘': "'", '“': '"', '”': '"', '…': '...', ' ': ' ',
};

export function fold(s: string): string {
  let out = '';
  for (const ch of String(s)) out += (ch in FOLD_MAP) ? FOLD_MAP[ch] : ch;
  // collapse any double spaces introduced by symbol expansion
  return out.replace(/\s{2,}/g, ' ');
}

export interface QuotePdfInput {
  createdAt:        string;
  docTitle:         string;
  solutionLabel:    string;
  summaryHeading:   string;
  summary:          string;
  pricingHeading:   string;
  rangeText:        string;
  scopeHeading:     string;
  scope:            string[];
  nextStepsHeading: string;
  nextSteps:        string[];
  paymentNote:      string;
  disclaimer:       string;
}

/**
 * Build the quote PDF. Pure + deterministic: identical input (incl. createdAt)
 * yields byte-identical output. A summary that folds to <3 chars (e.g. RU/ZH
 * user text the ASCII engine can't render) is skipped rather than shown empty.
 */
export function buildQuotePdf(input: QuotePdfInput): Uint8Array {
  const doc = new PdfBuilder();

  doc.coverHeader(fold(input.docTitle), fold(input.solutionLabel));

  const summary = fold(input.summary);
  if (summary.replace(/\s+/g, '').length >= 3) {
    doc.h2(fold(input.summaryHeading));
    doc.para(summary);
  }

  doc.h2(fold(input.pricingHeading));
  doc.h1(fold(input.rangeText));

  if (input.scope.length) {
    doc.h2(fold(input.scopeHeading));
    for (const s of input.scope) doc.bullet(fold(s));
  }

  if (input.nextSteps.length) {
    doc.h2(fold(input.nextStepsHeading));
    for (const s of input.nextSteps) doc.bullet(fold(s));
  }

  doc.callout(fold(input.paymentNote), 'tint');
  doc.callout(fold(input.disclaimer), 'amber');

  return doc.serialize({
    createdAt:     input.createdAt,
    footerVersion: fold(`${input.docTitle} - ${QUOTE_PDF_VERSION}`),
  });
}
