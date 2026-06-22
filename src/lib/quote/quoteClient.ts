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

/** Already-localized display strings for the 8-section whitepaper PDF (RU/ZH
 *  resolved to English by the caller per the PDF fallback rule). The server adds
 *  createdAt + quoteId + cover dates. */
export interface QuotePdfRender {
  docTitle:             string;
  projectName:          string;
  clientName:           string;
  labelClient:          string;
  labelDate:            string;
  labelValid:           string;
  labelRef:             string;
  execHeading:          string;
  execSummary:          string;
  summary:              string;
  solutionHeading:      string;
  solutionLabel:        string;
  solutionDescription:  string;
  scopeHeading:         string;
  scope:                string[];
  pricingHeading:       string;
  rangeText:            string;
  justificationHeading: string;
  justification:        string[];
  paymentHeading:       string;
  paymentNote:          string;
  timelineHeading:      string;
  timeline:             string[];
  disclaimer:           string;
  negHeading:           string;
  negInitialLabel:      string;
  negBudgetLabel:       string;
  negAdjustedLabel:     string;
  negInitial:           string;
  negBudget:            string;
  negAdjusted:          string;
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

/** Admin (owner/admin) manual price override. Preserves the computed price
 *  server-side; records min/max (USD) + justification. */
export async function overrideQuotePrice(
  orgId: string, quoteId: string, input: { minUsd: number; maxUsd: number; reason: string },
): Promise<{ overrideMinUsd: number; overrideMaxUsd: number }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/quote/${encodeURIComponent(quoteId)}/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, ...input }),
  });
  const j = await res.json().catch(() => null) as ({ overrideMinUsd?: number; overrideMaxUsd?: number; code?: string }) | null;
  if (!res.ok || !j) throw new QuoteGenError(j?.code ?? `HTTP_${res.status}`);
  return { overrideMinUsd: j.overrideMinUsd ?? input.minUsd, overrideMaxUsd: j.overrideMaxUsd ?? input.maxUsd };
}

/** Record the client's pricing decision (accept / discuss) + optional expected
 *  budget (USD) on the quote. Non-binding, intent only. */
export async function recordDecision(
  orgId: string, quoteId: string, input: { decision: 'accepted' | 'discussion'; expectedBudgetUsd?: number; message?: string },
): Promise<{ status: string }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/quote/${encodeURIComponent(quoteId)}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, ...input }),
  });
  const j = await res.json().catch(() => null) as ({ status?: string; code?: string }) | null;
  if (!res.ok || !j) throw new QuoteGenError(j?.code ?? `HTTP_${res.status}`);
  return { status: j.status ?? input.decision };
}

/** Record a decision from the email Accept/Discuss CTA — PUBLIC, no auth. The HMAC
 *  action token (carried in the email link) is the gate; the worker binds it to the
 *  quote, opens the draft invoice, and notifies the admin. */
export async function confirmQuoteDecisionByToken(
  token: string, decision: 'accepted' | 'discussion', opts?: { message?: string },
): Promise<{ status: string }> {
  const res = await fetch(`${WORKER_BASE}/api/quote/decision/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, decision, ...(opts?.message ? { message: opts.message } : {}) }),
  });
  const j = await res.json().catch(() => null) as ({ status?: string; code?: string }) | null;
  if (!res.ok || !j) throw new QuoteGenError(j?.code ?? `HTTP_${res.status}`);
  return { status: j.status ?? decision };
}

/** Email the quote to the signed-in user as a tokenized PDF link (no attachment).
 *  `render` is persisted server-side so the link regenerates the same PDF. */
export async function emailQuote(
  orgId: string, quoteId: string, locale: string, render: QuotePdfRender, sendAdminCopy = false, clientEmail?: string, expectedBudgetUsd?: number,
): Promise<{ emailed: boolean }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/quote/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, quoteId, locale, render, sendAdminCopy, ...(clientEmail ? { clientEmail } : {}), ...(expectedBudgetUsd !== undefined ? { expectedBudgetUsd } : {}) }),
  });
  const j = await res.json().catch(() => null) as ({ emailed?: boolean; code?: string }) | null;
  if (!res.ok || !j) throw new QuoteGenError(j?.code ?? `HTTP_${res.status}`);
  return { emailed: j.emailed === true };
}
