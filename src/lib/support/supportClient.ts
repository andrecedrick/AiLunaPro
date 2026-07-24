/**
 * Support ticket API client — S2.
 *
 * Hybrid: attaches the Firebase ID token when the user is authenticated (the
 * worker then uses the verified token email); anonymous users submit an email
 * in the body. Separate from feedback + Luna by design.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export type SupportType = 'bug' | 'question' | 'billing';
export type SupportPriority = 'low' | 'medium' | 'high';

export interface SupportTicketInput {
  type:        SupportType;
  description: string;
  email?:      string;                 // required when anonymous; ignored server-side when authed
  phone:       string;                 // REQUIRED for every ticket — server re-validates
  priority?:   SupportPriority;
  context?:    { route?: string; locale?: string; appVersion?: string };
}

export class SupportError extends Error {
  code:   string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function tryGetIdToken(): Promise<string | null> {
  try { return await getIdToken(); } catch { return null; }
}

export async function submitSupportTicket(input: SupportTicketInput): Promise<{ ok: true; id: string }> {
  const token = await tryGetIdToken();
  const res = await fetch(`${WORKER_BASE}/api/support/ticket`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({})) as { error?: string; code?: string };
    throw new SupportError(j.error ?? `Worker error ${res.status}`, j.code ?? `HTTP_${res.status}`, res.status);
  }
  return res.json() as Promise<{ ok: true; id: string }>;
}

export function friendlySupportError(err: unknown): string {
  if (!(err instanceof SupportError)) {
    return err instanceof Error ? err.message : 'Unexpected error';
  }
  switch (err.code) {
    case 'INVALID_TICKET':       return err.message;   // surface the specific field error
    case 'RATE_LIMITED':         return 'Please wait a moment before sending another message.';
    case 'FIRESTORE_NOT_CONFIGURED':
    case 'PERSIST_FAILED':       return 'Service temporarily unavailable. Please try again later.';
    default:                     return err.message;
  }
}
