/**
 * Recommendation API client — Phase K3A.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import type { RecommendProfile, RecommendationResult } from '../../types/recommendation';

async function authedFetch(path: string, init: RequestInit, idToken: string): Promise<Response> {
  return fetch(`${WORKER_BASE}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${idToken}` },
  });
}

export class RecommendError extends Error {
  code:   string;
  status: number;
  used?:  number;
  limit?: number;
  constructor(message: string, code: string, status: number, opts?: { used?: number; limit?: number }) {
    super(message);
    this.code   = code;
    this.status = status;
    this.used   = opts?.used;
    this.limit  = opts?.limit;
  }
}

/** Plan-limit usage echoed by the worker on a successful recommend (when enforced). */
export interface RecUsage { mode: string; used: number; limit: number; charged?: number }

/**
 * orgId is needed by the requireRole middleware on the worker.
 * Pass via query string (mirrors the agents-list pattern in K0).
 */
export async function recommendAgents(
  orgId: string,
  profile: RecommendProfile,
  idToken: string,
): Promise<RecommendationResult & { usage?: RecUsage }> {
  const params = new URLSearchParams({ orgId });
  const res = await authedFetch(
    `/api/recommend?${params.toString()}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ profile }),
    },
    idToken,
  );
  if (!res.ok) {
    const j = await res.json().catch(() => ({})) as { error?: string; code?: string; used?: number; limit?: number };
    throw new RecommendError(j.error ?? `Worker error ${res.status}`, j.code ?? `HTTP_${res.status}`, res.status, { used: j.used, limit: j.limit });
  }
  return res.json() as Promise<RecommendationResult & { usage?: RecUsage }>;
}

export function friendlyRecommendError(err: unknown): string {
  if (!(err instanceof RecommendError)) {
    return err instanceof Error ? err.message : 'Unexpected error';
  }
  switch (err.code) {
    case 'UPGRADE_REQUIRED':
      // Fallback string; RecommendPanel renders a dedicated upgrade CTA for this code.
      return "You've reached your monthly limit.";
    case 'INVALID_PROFILE':
      return 'Add at least one preference to personalize recommendations.';
    case 'INVALID_INDUSTRY':
    case 'INVALID_COMPANY_SIZE':
    case 'INVALID_WORKFLOW':
    case 'INVALID_PLAN':
    case 'INVALID_MATURITY':
    case 'INVALID_INTEGRATIONS':
      return err.message;
    case 'FIRESTORE_NOT_CONFIGURED':
    case 'AGENTS_FETCH_FAILED':
      return 'Service temporarily unavailable. Please try again later.';
    case 'FORBIDDEN':
      return 'Recommendations are not available for this account.';
    default:
      if (err.status === 401) return 'Please sign in again.';
      if (err.status === 403) return 'Recommendations are not available for this account.';
      return err.message;
  }
}
