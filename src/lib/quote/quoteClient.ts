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
