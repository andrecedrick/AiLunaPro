/**
 * Company registry client — SUPER ADMIN ONLY (server re-enforces the operator
 * allowlist; this module simply cannot succeed for anyone else).
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export interface Company {
  companyId:       string;
  orgId:           string;
  name:            string;
  nameKey:         string;
  source:          string;
  twentyCompanyId: string;
  createdByUid:    string;
  createdAt:       string;
  updatedAt:       string;
  contactCount:    number;
}

export interface ReconcileResult {
  dryRun:       boolean;
  contacts:     number;
  registry:     number;
  unlinked:     number;
  createdCount: number;
  duplicates:   number;
  orphans:      number;
  noTwentyId:   number;
  written:      number;
  sample: {
    created:    Array<{ orgId: string; name: string }>;
    duplicates: Array<{ orgId: string; name: string }>;
    orphans:    Array<{ orgId: string; name: string }>;
  };
}

export class CompanyError extends Error {
  code: string;
  constructor(code: string) { super(code); this.name = 'CompanyError'; this.code = code; }
}

async function readError(res: Response): Promise<never> {
  const j = await res.json().catch(() => null) as { code?: string } | null;
  throw new CompanyError(j?.code ?? `HTTP_${res.status}`);
}

async function authed(path: string, init?: RequestInit): Promise<Response> {
  const idToken = await getIdToken();
  return fetch(`${WORKER_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}), Authorization: `Bearer ${idToken}` },
  });
}

/** The whole cross-org registry, with contact counts. */
export async function listCompanies(): Promise<Company[]> {
  const res = await authed('/api/companies/all');
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as { companies?: Company[] } | null;
  return j?.companies ?? [];
}

/**
 * Rename a company. Every contact carrying it is rewritten too — the contact's
 * `company` string is what the table and the CSV export render, so leaving it
 * stale would show the old name everywhere that matters.
 */
export async function renameCompany(orgId: string, companyId: string, name: string): Promise<void> {
  const res = await authed(`/api/companies/${encodeURIComponent(companyId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ orgId, name }),
  });
  if (!res.ok) return readError(res);
}

/** Fold `mergeId` into `keepId`. The loser survives as a tombstone, not a deletion. */
export async function mergeCompanies(orgId: string, keepId: string, mergeId: string): Promise<number> {
  const res = await authed('/api/companies/merge', {
    method: 'POST',
    body: JSON.stringify({ orgId, keepId, mergeId }),
  });
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as { contactsMoved?: number } | null;
  return j?.contactsMoved ?? 0;
}

/** Report drift; pass `dryRun: false` to repair it. */
export async function reconcileCompanies(dryRun = true): Promise<ReconcileResult> {
  const res = await authed('/api/companies/reconcile', {
    method: 'POST',
    body: JSON.stringify({ dryRun }),
  });
  if (!res.ok) return readError(res);
  return await res.json() as ReconcileResult;
}

export interface TwentySyncResult {
  dryRun:           boolean;
  people:           number;
  checked:          number;
  skipped:          number;
  mismatched:       number;
  corrected:        number;
  companiesCreated: number;
  failures:         number;
  sample: {
    mismatched: Array<{ orgId: string; company: string }>;
    failures:   Array<{ orgId: string; reason: string }>;
  };
}

/**
 * Compare every pushed contact's company against Twenty and repair mismatches.
 *
 * Exposed in the app rather than left as a curl command because the operator is
 * already authenticated here — copying a one-hour Firebase ID token out of the
 * network tab to call the same endpoint is friction with no security benefit,
 * and the token is the thing most likely to be pasted wrong or to expire mid-run.
 */
export async function syncTwentyCompanies(dryRun = true): Promise<TwentySyncResult> {
  const res = await authed('/api/companies/twenty-sync', {
    method: 'POST',
    body: JSON.stringify({ dryRun }),
  });
  if (!res.ok) return readError(res);
  return await res.json() as TwentySyncResult;
}
