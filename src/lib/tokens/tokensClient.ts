/**
 * Tokens API client — Phase J1.4A.
 * Frontend NEVER passes token amounts. Server resolves from TOKEN_COSTS.
 */

import { WORKER_BASE } from '../billing/stripeClient';

async function authedFetch(path: string, init: RequestInit, idToken: string): Promise<Response> {
  return fetch(`${WORKER_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${idToken}`,
    },
  });
}

/**
 * Worker error with structured code (J1.4A-Hardening). The `code` field is the
 * stable identifier callers should branch on. `error` is for logging.
 * Known codes: PACK_NOT_CONFIGURED, STRIPE_NOT_CONFIGURED, WEBHOOK_NOT_CONFIGURED,
 * FIRESTORE_NOT_CONFIGURED, LIVE_KEY_BLOCKED, INVALID_BODY, INVALID_PACK.
 */
export class TokensWorkerError extends Error {
  code:   string;
  status: number;
  data:   Record<string, unknown>;
  constructor(message: string, code: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.code   = code;
    this.status = status;
    this.data   = data;
  }
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const j = await res.json().catch(() => ({ error: res.statusText })) as Record<string, unknown>;
    const message = (j.error as string) ?? `Worker error ${res.status}`;
    const code    = (j.code  as string) ?? `HTTP_${res.status}`;
    console.warn('[tokensClient] worker error', { status: res.status, code, message });
    throw new TokensWorkerError(message, code, res.status, j);
  }
  return res.json() as Promise<T>;
}

/**
 * Map a worker error code to a user-friendly message. Returns null for codes
 * that should fall through to the raw error (e.g. INVALID_BODY).
 *
 * Pass `isAdmin = true` for owner/admin to surface a more diagnostic hint
 * (still no env var names, still no secrets).
 */
export function friendlyTokenError(err: unknown, isAdmin: boolean = false): string {
  if (!(err instanceof TokensWorkerError)) {
    return err instanceof Error ? err.message : 'Unexpected error';
  }
  switch (err.code) {
    case 'PACK_NOT_CONFIGURED':
    case 'STRIPE_NOT_CONFIGURED':
    case 'WEBHOOK_NOT_CONFIGURED':
      return isAdmin
        ? 'Token packs are not fully configured. A Stripe price or webhook secret is missing in Worker configuration.'
        : 'Token packs are temporarily unavailable. Please contact support.';
    case 'FIRESTORE_NOT_CONFIGURED':
      return isAdmin
        ? 'Firestore service account is not configured on the Worker.'
        : 'Service temporarily unavailable. Please contact support.';
    case 'LIVE_KEY_BLOCKED':
      return isAdmin
        ? 'Live Stripe key was refused — the Worker is not running in production mode.'
        : 'Service temporarily unavailable. Please contact support.';
    case 'INVALID_PACK':
      return 'That token pack is not available.';
    default:
      return err.message;
  }
}

export interface TokenBalance {
  balance:           number;
  monthlyAllocation: number;
  consumed:          number;
  rollover:          number;
  topupTotal:        number;
  lastReset:         string;
  cycleEnd:          string;
  updatedAt:         string;
}

export interface UsageEvent {
  eventId: string;
  module:  string;
  action:  string;
  tokens:  number;
  uid:     string;
  status:  string;
  at:      string;
}

export type TokenPack = 'starter' | 'pro' | 'max';

export async function fetchBalance(orgId: string, idToken: string): Promise<TokenBalance> {
  const res = await authedFetch(`/api/tokens/balance?orgId=${encodeURIComponent(orgId)}`, { method: 'GET' }, idToken);
  return jsonOrThrow<TokenBalance>(res);
}

export async function fetchUsage(orgId: string, idToken: string, limit = 50): Promise<UsageEvent[]> {
  const res = await authedFetch(`/api/tokens/usage?orgId=${encodeURIComponent(orgId)}&limit=${limit}`, { method: 'GET' }, idToken);
  const data = await jsonOrThrow<{ events: UsageEvent[] }>(res);
  return data.events;
}

export async function createTopupCheckout(orgId: string, pack: TokenPack, idToken: string): Promise<string> {
  const res = await authedFetch('/api/tokens/topup', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ orgId, pack }),
  }, idToken);
  const data = await jsonOrThrow<{ url: string }>(res);
  return data.url;
}
