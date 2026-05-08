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

export async function fetchAgents(idToken: string, filters: AgentFilters = {}): Promise<AgentCatalogEntry[]> {
  const params = new URLSearchParams();
  if (filters.industry)    params.set('industry',    filters.industry);
  if (filters.integration) params.set('integration', filters.integration);
  if (filters.minPlan)     params.set('minPlan',     filters.minPlan);
  if (filters.source)      params.set('source',      filters.source);
  const qs = params.toString();
  const res = await authedFetch(`/api/agents${qs ? `?${qs}` : ''}`, { method: 'GET' }, idToken);
  const data = await jsonOrThrow<{ agents: AgentCatalogEntry[]; total: number }>(res);
  return data.agents;
}

export async function fetchAgent(agentId: string, idToken: string): Promise<AgentCatalogEntry> {
  // Worker route uses query-string instead of path param to keep TS
  // inference shallow (TS2589). Functionally identical.
  const res = await authedFetch(`/api/agents/lookup?id=${encodeURIComponent(agentId)}`, { method: 'GET' }, idToken);
  return jsonOrThrow<AgentCatalogEntry>(res);
}
