/**
 * Diagnostic Express API client — Phase K1A.
 * Public unauth endpoint — no Authorization header needed.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import type { DiagnosticResult } from '../../types/diagnostic';

interface SubmitInput {
  answers: Record<string, string>;
  lead: {
    email:        string;
    companyName?: string;
    consent:      boolean;
  };
  turnstileToken?: string;
}

export class DiagnosticError extends Error {
  code:   string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code   = code;
    this.status = status;
  }
}

export async function submitDiagnostic(input: SubmitInput): Promise<DiagnosticResult> {
  const res = await fetch(`${WORKER_BASE}/api/public/diagnostic`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({})) as { error?: string; code?: string };
    throw new DiagnosticError(j.error ?? `Worker error ${res.status}`, j.code ?? `HTTP_${res.status}`, res.status);
  }
  return res.json() as Promise<DiagnosticResult>;
}

export function friendlyDiagnosticError(err: unknown): string {
  if (!(err instanceof DiagnosticError)) {
    return err instanceof Error ? err.message : 'Unexpected error';
  }
  switch (err.code) {
    case 'TURNSTILE_FAILED':
    case 'TURNSTILE_TOKEN_MISSING':
    case 'TURNSTILE_VERIFY_REQUEST_FAILED':
      return 'Captcha verification failed. Please try again.';
    case 'TURNSTILE_NOT_CONFIGURED':
    case 'FIRESTORE_NOT_CONFIGURED':
    case 'PERSIST_FAILED':
      return 'Service temporarily unavailable. Please try again later.';
    case 'INVALID_LEAD':
      return err.message;       // surface specific lead error (e.g. invalid email)
    case 'INVALID_ANSWERS':
      return 'Some answers are missing. Please fill out every question.';
    default:
      return err.message;
  }
}
