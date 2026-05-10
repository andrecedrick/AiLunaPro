/**
 * ROI Calculator API client — Phase K2A.
 * Public unauth endpoint — no Authorization header.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import type { RoiInputs, RoiResponse } from '../../types/roi';

interface SubmitInput {
  inputs: RoiInputs;
  lead: {
    email:        string;
    companyName?: string;
    consent:      boolean;
  };
  turnstileToken?: string;
}

export class RoiError extends Error {
  code:   string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code   = code;
    this.status = status;
  }
}

export async function submitRoi(input: SubmitInput): Promise<RoiResponse> {
  const res = await fetch(`${WORKER_BASE}/api/public/roi-calculation`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({})) as { error?: string; code?: string };
    throw new RoiError(j.error ?? `Worker error ${res.status}`, j.code ?? `HTTP_${res.status}`, res.status);
  }
  return res.json() as Promise<RoiResponse>;
}

export function friendlyRoiError(err: unknown): string {
  if (!(err instanceof RoiError)) {
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
    case 'INVALID_INPUTS':
    case 'INVALID_LEAD':
      return err.message; // surface specific field error
    default:
      return err.message;
  }
}
