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
import { formatMoney, formatRate, type Currency } from './invoice-model';

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
  /** Sequential accounting number (INV-2026-000042). Falls back to the doc id. */
  invoiceNumber?: string;
  reference:     string;        // quote id
  quoteTitle:    string;
  customerEmail: string;
  /** Legacy net amount in major units. Used only when the minor-unit fields are absent. */
  amountUsd:     number;
  status:        string;        // 'paid' | 'pending' | 'awaiting_transfer' | …
  paymentMethod: string;        // 'stripe' | 'bank_transfer'
  createdAt:     string;
  paidAt:        string | null;

  /* ── Accounting block (§27 P1.1). Absent on legacy invoices. ── */
  supplierLines?: string[];
  billToLines?:   string[];
  currency?:      Currency;
  subtotalMinor?: number;
  taxRateBp?:     number;
  taxMinor?:      number;
  totalMinor?:    number;
  taxLabel?:      string;
  taxNote?:       string;
  dueAt?:         string;
  bankDetails?:   string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  invoiceFooter?: string;
}

/**
 * The invoice PDF. Pure and deterministic: identical input yields identical bytes.
 *
 * Renders a real accounting document — issuer, bill-to, sequential number, net /
 * VAT / gross breakdown, due date, payment references. Legacy invoices written
 * before those fields existed still render: their sections are omitted rather
 * than printed blank, because a blank issuer block looks like a defective invoice
 * while an omitted one is simply an older, simpler document.
 */
export function buildInvoicePdf(i: InvoicePdfInput): Uint8Array {
  const doc = new PdfBuilder();
  const paid = i.status === 'paid';
  const number = i.invoiceNumber || i.invoiceId;
  const currency: Currency = i.currency ?? 'usd';

  // Minor units when present; otherwise the legacy net amount, which IS what an
  // older invoice charged. Never re-derive VAT for a document issued without it.
  const hasBreakdown = typeof i.totalMinor === 'number' && i.totalMinor > 0;
  const subtotal = hasBreakdown ? (i.subtotalMinor ?? 0) : Math.round(i.amountUsd * 100);
  const taxMinor = hasBreakdown ? (i.taxMinor ?? 0) : 0;
  const total    = hasBreakdown ? (i.totalMinor ?? 0) : subtotal;

  const metaRows: Array<[string, string]> = [['Invoice no.', fold(number)], ['Reference', fold(i.reference)]];
  metaRows.push(['Issued', isoDate(i.createdAt)]);
  if (i.dueAt) metaRows.push(['Due', isoDate(i.dueAt)]);
  if (paid && i.paidAt) metaRows.push(['Paid on', isoDate(i.paidAt)]);
  quoteCover(doc, {
    title:    paid ? 'Invoice - PAID' : 'Invoice',
    subtitle: fold(i.quoteTitle || `Quote ${i.reference.slice(0, 8)}`),
    metaRows,
  });

  /* ── Parties ─────────────────────────────────────────────────── */
  if (i.supplierLines?.length) {
    doc.h2('Issued by');
    for (const line of i.supplierLines) doc.muted(fold(line), 10.5);
  }
  if (i.billToLines?.length) {
    doc.h2('Billed to');
    for (const line of i.billToLines) doc.muted(fold(line), 10.5);
  } else if (has(i.customerEmail)) {
    doc.h2('Billed to');
    doc.muted(fold(i.customerEmail), 10.5);
  }

  /* ── Line item + totals ──────────────────────────────────────── */
  doc.h2('Details');
  doc.row(fold(i.quoteTitle || 'Professional services'), formatMoney(subtotal, currency));
  doc.hr();
  doc.row('Subtotal (net)', formatMoney(subtotal, currency));
  const taxLabel = i.taxLabel || 'VAT';
  doc.row(
    `${fold(taxLabel)} ${formatRate(i.taxRateBp ?? 0)}`,
    formatMoney(taxMinor, currency),
  );
  doc.hr();
  doc.h2(paid ? 'Total paid' : 'Total due');
  doc.h1(formatMoney(total, currency));

  if (i.taxNote) doc.callout(fold(i.taxNote), 'tint');

  /* ── Status ──────────────────────────────────────────────────── */
  doc.h2('Status');
  doc.callout(
    paid
      ? `PAID - payment received on ${isoDate(i.paidAt ?? i.createdAt)}. This document also serves as your payment receipt.`
      : i.status === 'awaiting_transfer'
        ? 'AWAITING BANK TRANSFER - this invoice is settled by bank transfer; it becomes a receipt once the transfer is confirmed.'
        : 'PENDING - payment is due. Pay online or by bank transfer using the reference above.',
    paid ? 'tint' : 'amber',
  );

  /* ── Payment information ─────────────────────────────────────── */
  doc.h2('Payment information');
  doc.para(i.paymentMethod === 'bank_transfer'
    ? 'Bank transfer. Quote the reference above on the wire so the payment can be matched.'
    : 'Online payment (secure card checkout).');
  if (i.bankDetails) for (const line of i.bankDetails.split('\n')) if (line.trim()) doc.muted(fold(line), 10);

  // Payment references belong on a paid invoice: they are what a finance team
  // reconciles against in Stripe and on a bank statement.
  if (paid && (i.stripePaymentIntentId || i.stripeSessionId)) {
    if (i.stripePaymentIntentId) doc.kv('Payment intent', fold(i.stripePaymentIntentId));
    if (i.stripeSessionId) doc.kv('Checkout session', fold(i.stripeSessionId));
  }

  if (i.invoiceFooter) { doc.spacer(6); doc.muted(fold(i.invoiceFooter), 9); }

  return doc.serialize({
    createdAt:     i.createdAt,
    footerVersion: fold(`Invoice ${number} - ${QUOTE_PDF_VERSION}`),
  });
}
