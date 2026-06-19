/**
 * Quote generation client — Phase Q2.
 *
 * Calls the auth-gated, org-scoped, token-charged worker route with the Firebase
 * ID token. The server is authoritative on the estimate + the token charge; this
 * only sends the validated inputs and surfaces the result / non-PII error code.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';
import type { QuoteCategory, QuoteTier, BusinessSize, Urgency, BudgetBand } from '../../data/quote-config';
import type { QuotePreview } from './score';

export interface GenerateQuoteInput {
  quoteId:       string;
  category:      QuoteCategory;
  tier:          QuoteTier;
  description:   string;
  businessSize?: BusinessSize;
  urgency?:      Urgency;
  budgetBand?:   BudgetBand;
}

export interface GenerateQuoteResult {
  quoteId:        string;
  estimate:       QuotePreview;
  engineVersion:  string;
  rulesetVersion: string;
  tokensConsumed: number;
  balanceAfter?:  number;
  idempotent?:    boolean;
}

/** Error carrying the server's non-PII code; balance/required set on 402. */
export class QuoteGenError extends Error {
  code: string;
  balance?: number;
  required?: number;
  constructor(code: string, balance?: number, required?: number) {
    super(code);
    this.code = code;
    this.balance = balance;
    this.required = required;
  }
}

/**
 * Generate (and persist) a quote — consumes tokens server-side. Idempotent on
 * `quoteId`: a repeat returns the existing quote without re-charging.
 * Throws QuoteGenError('INSUFFICIENT_TOKENS', balance, required) on 402.
 */
export async function generateQuote(orgId: string, input: GenerateQuoteInput): Promise<GenerateQuoteResult> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/quote/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, ...input }),
  });
  const j = await res.json().catch(() => null) as
    (Partial<GenerateQuoteResult> & { code?: string; balance?: number; required?: number }) | null;
  if (!res.ok || !j) {
    throw new QuoteGenError(j?.code ?? `HTTP_${res.status}`, j?.balance, j?.required);
  }
  return j as GenerateQuoteResult;
}

/** Already-localized display strings sent to the PDF endpoint (RU/ZH resolved to
 *  English by the caller per the PDF fallback rule). */
export interface QuotePdfRender {
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
 * Download the deterministic quote PDF for an existing quote. The server binds
 * it to the stored quote (auth + org) and renders the supplied display strings.
 * Throws QuoteGenError(code) on failure.
 */
export async function downloadQuotePdf(orgId: string, quoteId: string, render: QuotePdfRender): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/quote/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, quoteId, render }),
  });
  if (!res.ok) {
    const code = await res.json().then((x: { code?: string }) => x.code).catch(() => undefined);
    throw new QuoteGenError(code ?? `HTTP_${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quote-${quoteId}.pdf`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
