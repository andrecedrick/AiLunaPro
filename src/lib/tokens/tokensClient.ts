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

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const j = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(j.error ?? `Worker error ${res.status}`);
  }
  return res.json() as Promise<T>;
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
