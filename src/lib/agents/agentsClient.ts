/**
 * Agents API client — Phase K0.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import type { AgentCatalogEntry } from '../../types/agents';

interface AgentFilters {
  industry?:    string;
  integration?: string;
  minPlan?:     string;
  source?:      string;
}

async function authedFetch(path: string, init: RequestInit, idToken: string): Promise<Response> {
  return fetch(`${WORKER_BASE}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${idToken}` },
  });
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const j = await res.json().catch(() => ({ error: res.statusText })) as { error?: string; code?: string };
    throw new Error(j.error ?? `Worker error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/**
 * orgId is required on every agent-catalog request because the worker's
 * requireRole middleware reads role from /organizations/{orgId}/members/{uid}.
 * Without it the worker returns 400 "Missing orgId". Caller must pass the
 * current session.orgId.
 */
export async function fetchAgents(orgId: string, idToken: string, filters: AgentFilters = {}): Promise<AgentCatalogEntry[]> {
  const params = new URLSearchParams();
  params.set('orgId', orgId);
  if (filters.industry)    params.set('industry',    filters.industry);
  if (filters.integration) params.set('integration', filters.integration);
  if (filters.minPlan)     params.set('minPlan',     filters.minPlan);
  if (filters.source)      params.set('source',      filters.source);
  const res = await authedFetch(`/api/agents?${params.toString()}`, { method: 'GET' }, idToken);
  const data = await jsonOrThrow<{ agents: AgentCatalogEntry[]; total: number }>(res);
  return data.agents;
}

export async function fetchAgent(orgId: string, agentId: string, idToken: string): Promise<AgentCatalogEntry> {
  // Worker route uses query-string instead of path param to keep TS
  // inference shallow (TS2589). orgId required for requireRole middleware.
  const params = new URLSearchParams();
  params.set('orgId', orgId);
  params.set('id', agentId);
  const res = await authedFetch(`/api/agents/lookup?${params.toString()}`, { method: 'GET' }, idToken);
  return jsonOrThrow<AgentCatalogEntry>(res);
}
