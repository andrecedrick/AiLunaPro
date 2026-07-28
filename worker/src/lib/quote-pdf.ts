/**
 * Quote PDF — Phase Q3 + U1 (whitepaper upgrade).
 *
 * Deterministic, dependency-free PDF on the shared PdfBuilder (Base-14 Helvetica,
 * WinAnsi). Same {input} => byte-identical output. 8-section consulting layout:
 * cover · executive summary · proposed solution · scope · pricing + how-it's-
 * calculated · payment model · timeline · disclaimer.
 *
 * Localization: the route receives already-localized display strings (the exact
 * UI text) — Latin localized; RU/ZH fall back to English (resolved client-side
 * via pdfLocale()). The shared PdfBuilder runs text through asciiSanitize which
 * DROPS non-ASCII, so we fold accents to ASCII first (é→e, ñ→n, ß→ss, €→EUR …).
 * Full accent rendering is the deferred B6.3 work. The premium whitepaper
 * primitives (coverPage/conceptBox/flowDiagram) bake ENGLISH labels, so the
 * cover is hand-built from the base API + the logo asset to stay leak-free.
 *
 * No PII logging. No persistence here (the route persists the render payload).
 */

import { PdfBuilder, PDF_COLORS as C } from './pdf/pdf-doc';
import { wrapText } from './pdf/helvetica-metrics';
import { LOGO_ASSET } from './pdf/logo-asset';

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
  '’': "'", '‘': "'", '“': '"', '”': '"', '…': '...', ' ': ' ',
};

export function fold(s: string): string {
  let out = '';
  for (const ch of String(s)) out += (ch in FOLD_MAP) ? FOLD_MAP[ch] : ch;
  return out.replace(/\s{2,}/g, ' ');
}

/** USD-formatted price range for the server-side (email/shared) PDF after an
 *  override — override amounts are stored in USD. e.g. "$30,000 - $80,000". */
export function formatUsdRange(minUsd: number, maxUsd: number, openEnded = false): string {
  const f = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
  return `${f(minUsd)} - ${f(maxUsd)}${openEnded ? '+' : ''}`;
}

/** Deterministic YYYY-MM-DD from an ISO string (+ optional day offset). No
 *  Date.now — derived solely from the provided createdAt. */
function isoDate(iso: string, addDays = 0): string {
  const parsed = Date.parse(iso);
  const base = Number.isNaN(parsed) ? Date.parse('2026-01-01T00:00:00Z') : parsed;
  const d = new Date(base + addDays * 86_400_000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

export interface QuotePdfInput {
  createdAt:    string;
  docTitle:     string;
  projectName:  string;
  clientName:   string;
  quoteId:      string;
  // Cover meta labels (localized; RU/ZH -> English).
  labelClient:  string;
  labelDate:    string;
  labelValid:   string;
  labelRef:     string;
  // §2 Executive summary
  execHeading:  string;
  execSummary:  string;
  summary:      string;
  // §3 Proposed solution
  solutionHeading:     string;
  solutionLabel:       string;
  solutionDescription: string;
  // §4 Scope of work
  scopeHeading: string;
  scope:        string[];
  // §5 Pricing + how it's calculated
  pricingHeading:       string;
  rangeText:            string;
  justificationHeading: string;
  justification:        string[];
  // §6 Payment model
  paymentHeading: string;
  paymentNote:    string;
  // §7 Timeline
  timelineHeading: string;
  timeline:        string[];
  // §8 Disclaimer
  disclaimer:      string;
}

/** Hand-built localized cover (logo + title + subtitle + meta rows). Mirrors the
 *  whitepaper coverPage WITHOUT its baked-in English label, so no locale leaks. */
function quoteCover(doc: PdfBuilder, opts: { title: string; subtitle: string; metaRows: Array<[string, string]> }): void {
  const { pageW, pageH, margin, contentW } = doc.metrics;

  doc.gradientBar(0, pageH - 6, pageW, 6);
  const logoW = 156, logoH = (logoW * LOGO_ASSET.height) / LOGO_ASSET.width;
  const logoTop = pageH - 40;
  doc.image(LOGO_ASSET.deflatedRgbB64, LOGO_ASSET.width, LOGO_ASSET.height, margin, logoTop - logoH, logoW, logoH);

  let ty = pageH * 0.56;
  for (const line of wrapText(opts.title, 'bold', 26, contentW)) {
    doc.textAbs(margin, ty, 26, 'bold', C.ink, line);
    ty -= 32;
  }
  ty -= 6;
  for (const line of wrapText(opts.subtitle, 'regular', 13, contentW * 0.86)) {
    doc.textAbs(margin, ty, 13, 'regular', C.muted, line);
    ty -= 18;
  }

  const metaTop = pageH * 0.30;
  doc.lineAbs(margin, metaTop, margin + 180, metaTop, C.violet);
  let my = metaTop - 18;
  for (const [label, value] of opts.metaRows) {
    doc.textAbs(margin, my, 9, 'bold', C.muted, label);
    doc.textAbs(margin + 120, my, 9, 'regular', C.ink, value);
    my -= 15;
  }

  doc.pageBreak();
}

const has = (s: string): boolean => s.replace(/\s+/g, '').length >= 3;

/**
 * Build the 8-section whitepaper quote PDF. Pure + deterministic: identical
 * input (incl. createdAt) yields byte-identical output. Sections whose content
 * folds to empty (e.g. RU/ZH free text the ASCII engine can't render) are
 * skipped rather than shown blank.
 */
export function buildQuotePdf(input: QuotePdfInput): Uint8Array {
  const doc = new PdfBuilder();

  // §1 Cover
  const metaRows: Array<[string, string]> = [];
  if (has(input.clientName)) metaRows.push([fold(input.labelClient), fold(input.clientName)]);
  metaRows.push([fold(input.labelDate), isoDate(input.createdAt)]);
  metaRows.push([fold(input.labelValid), isoDate(input.createdAt, 30)]);
  metaRows.push([fold(input.labelRef), input.quoteId]);
  quoteCover(doc, {
    title:    fold(input.docTitle),
    subtitle: fold(input.projectName || input.solutionLabel),
    metaRows,
  });

  // §2 Executive summary
  doc.h2(fold(input.execHeading));
  if (has(input.execSummary)) doc.para(fold(input.execSummary));
  if (has(input.summary)) doc.para(fold(input.summary));

  // §3 Proposed solution
  doc.h2(fold(input.solutionHeading));
  doc.paraKey(fold(`${input.solutionLabel}. ${input.solutionDescription}`));

  // §4 Scope of work
  if (input.scope.length) {
    doc.h2(fold(input.scopeHeading));
    for (const s of input.scope) doc.bullet(fold(s));
  }

  // §5 Pricing + how this estimate is calculated
  doc.h2(fold(input.pricingHeading));
  doc.h1(fold(input.rangeText));
  if (input.justification.length) {
    doc.h3(fold(input.justificationHeading));
    for (const j of input.justification) doc.bullet(fold(j));
  }

  // §6 Payment model
  doc.h2(fold(input.paymentHeading));
  doc.callout(fold(input.paymentNote), 'tint');

  // §7 Timeline
  if (input.timeline.length) {
    doc.h2(fold(input.timelineHeading));
    for (const t of input.timeline) doc.bullet(fold(t));
  }

  // §8 Disclaimer
  doc.callout(fold(input.disclaimer), 'amber');

  return doc.serialize({
    createdAt:     input.createdAt,
    footerVersion: fold(`${input.docTitle} - ${QUOTE_PDF_VERSION}`),
  });
}

/* ── Invoice PDF (BUG 2) — the downloadable document for every invoice ──────
 * Same deterministic engine + brand cover as the quote PDF. English-only (the
 * ASCII engine; matches the quote PDF behavior for RU/ZH). Status-aware: a paid
 * invoice doubles as the payment receipt. */

export interface InvoicePdfInput {
  invoiceId:     string;
  reference:     string;        // quote id
  quoteTitle:    string;
  customerEmail: string;
  amountUsd:     number;
  status:        string;        // 'paid' | 'pending' | 'awaiting_transfer' | …
  paymentMethod: string;        // 'stripe' | 'bank_transfer'
  createdAt:     string;
  paidAt:        string | null;
}

export function buildInvoicePdf(i: InvoicePdfInput): Uint8Array {
  const doc = new PdfBuilder();
  const paid = i.status === 'paid';

  const metaRows: Array<[string, string]> = [['Invoice no.', i.invoiceId], ['Reference', i.reference]];
  if (has(i.customerEmail)) metaRows.push(['Billed to', fold(i.customerEmail)]);
  metaRows.push(['Issued', isoDate(i.createdAt)]);
  if (paid && i.paidAt) metaRows.push(['Paid on', isoDate(i.paidAt)]);
  quoteCover(doc, {
    title:    paid ? 'Invoice - PAID' : 'Invoice',
    subtitle: fold(i.quoteTitle || `Quote ${i.reference.slice(0, 8)}`),
    metaRows,
  });

  doc.h2('Amount');
  doc.h1(`$${Math.round(i.amountUsd).toLocaleString('en-US')} USD`);

  doc.h2('Status');
  doc.callout(
    paid
      ? `PAID - payment received on ${isoDate(i.paidAt ?? i.createdAt)}. This document also serves as your payment receipt.`
      : i.status === 'awaiting_transfer'
        ? 'AWAITING BANK TRANSFER - this invoice is settled by bank transfer; it becomes a receipt once the transfer is confirmed.'
        : 'PENDING - payment is due. Pay online or by bank transfer using the reference above.',
    paid ? 'tint' : 'amber',
  );

  doc.h2('Payment method');
  doc.para(i.paymentMethod === 'bank_transfer' ? 'Bank transfer (reference above).' : 'Online payment (secure card checkout).');

  return doc.serialize({
    createdAt:     i.createdAt,
    footerVersion: fold(`Invoice ${i.invoiceId} - ${QUOTE_PDF_VERSION}`),
  });
}
