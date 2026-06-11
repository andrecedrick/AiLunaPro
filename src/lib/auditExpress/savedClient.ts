/**
 * Saved Audit Express client (J15 P1.1 SPA). Calls the auth-gated, org-scoped
 * worker routes with the Firebase ID token. No PII handled client-side beyond
 * the user's own org metadata.
 */
import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export interface SavedAuditItem {
  auditId:       string;
  title:         string;
  createdAt:     string;
  businessType:  string;
  audience:      string;
  confidence:    string;
  engineVersion: string;
  canonicalUrl:  string;
}

const q = (orgId: string) => `orgId=${encodeURIComponent(orgId)}`;

/** Error carrying the server's non-PII code (e.g. PDF_LIMIT_REACHED). */
export class SavedAuditError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; }
}

export interface SaveAuditInput {
  taps: unknown;
  extractSnapshot?: unknown;
  createdAt: string;
}

/** Auto-save / save an Audit Express snapshot to the org. Idempotent server-side. */
export async function saveAudit(orgId: string, input: SaveAuditInput): Promise<string> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, taps: input.taps, extractSnapshot: input.extractSnapshot ?? undefined, createdAt: input.createdAt }),
  });
  if (!res.ok) {
    const code = await res.json().then((j: { code?: string }) => j.code).catch(() => undefined);
    throw new SavedAuditError(code ?? `HTTP_${res.status}`);
  }
  const j = await res.json() as { auditId?: string };
  return j.auditId ?? '';
}

export async function listSavedAudits(orgId: string): Promise<SavedAuditItem[]> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/list?${q(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error('LIST_FAILED');
  const j = await res.json() as { items?: SavedAuditItem[] };
  return Array.isArray(j.items) ? j.items : [];
}

export interface SavedAuditDetail {
  auditId: string;
  title: string;
  createdAt: string;
  engineVersion: string;
  canonicalUrl: string;
  confidence: string;
  businessType: string;
  audience: string;
  preview: unknown | null;
  understanding: unknown | null;
  shareVersion: number;
  sharedAt: string;
  sharedExpiresAt: string;
  shareRevokedAt: string;
  sharingDisabled: boolean;
  recommendedAgents: RecommendedAgent[];
}

export interface RecommendedAgent {
  agentId: string;
  name: string;
  tagline: string;
  minPlan: string;
  implementationComplexity: string;
  expectedRoi: { timeSavedHoursPerMonth: number; monthlyCostSaved: number; paybackMonths: number };
}

/** Full (recomputed, non-PII) view of one saved audit. */
export async function getSavedAuditDetail(orgId: string, auditId: string): Promise<SavedAuditDetail> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/detail/${encodeURIComponent(auditId)}?${q(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const j = await res.json().catch(() => null) as (SavedAuditDetail & { code?: string }) | null;
  if (!res.ok || !j) throw new SavedAuditError((j && j.code) ?? `HTTP_${res.status}`);
  // Normalize so the SavedAuditDetail contract holds at runtime even against an
  // older/partial worker response (missing fields must never crash consumers).
  return {
    ...j,
    recommendedAgents: Array.isArray(j.recommendedAgents) ? j.recommendedAgents : [],
    shareVersion: typeof j.shareVersion === 'number' ? j.shareVersion : 1,
    sharedAt: typeof j.sharedAt === 'string' ? j.sharedAt : '',
    sharedExpiresAt: typeof j.sharedExpiresAt === 'string' ? j.sharedExpiresAt : '',
    shareRevokedAt: typeof j.shareRevokedAt === 'string' ? j.shareRevokedAt : '',
    sharingDisabled: j.sharingDisabled === true,
  };
}

export interface ShareLink { url: string; expiresAt: string }

/** Create a short-lived shareable PDF link. Minting counts against the PDF quota
 *  (PDF_LIMIT_REACHED → pass useTokens to spend tokens). */
export async function createShareLink(orgId: string, auditId: string, useTokens = false): Promise<ShareLink> {
  const idToken = await getIdToken();
  const url = `${WORKER_BASE}/api/audit-express/${encodeURIComponent(auditId)}/share${useTokens ? '?useTokens=1' : ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId }),
  });
  const j = await res.json().catch(() => null) as (ShareLink & { code?: string }) | null;
  if (!res.ok || !j) throw new SavedAuditError((j && j.code) ?? `HTTP_${res.status}`);
  return j;
}

/** Regenerate the link (bumps shareVersion → old links die). Quota-counted. */
export async function regenerateShareLink(orgId: string, auditId: string, useTokens = false): Promise<ShareLink> {
  const idToken = await getIdToken();
  const url = `${WORKER_BASE}/api/audit-express/${encodeURIComponent(auditId)}/regenerate-share${useTokens ? '?useTokens=1' : ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId }),
  });
  const j = await res.json().catch(() => null) as (ShareLink & { code?: string }) | null;
  if (!res.ok || !j) throw new SavedAuditError((j && j.code) ?? `HTTP_${res.status}`);
  return j;
}

/** Instantly revoke all outstanding links for an audit (bumps shareVersion). */
export async function revokeShare(orgId: string, auditId: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/${encodeURIComponent(auditId)}/revoke-share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId }),
  });
  if (!res.ok) {
    const code = await res.json().then((x: { code?: string }) => x.code).catch(() => undefined);
    throw new SavedAuditError(code ?? `HTTP_${res.status}`);
  }
}

/** Enable/disable sharing for an audit. When disabled, create/regenerate and
 *  existing live links are blocked. */
export async function setSharingDisabled(orgId: string, auditId: string, disabled: boolean): Promise<boolean> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/${encodeURIComponent(auditId)}/sharing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, disabled }),
  });
  const j = await res.json().catch(() => null) as ({ sharingDisabled?: boolean; code?: string }) | null;
  if (!res.ok || !j) throw new SavedAuditError((j && j.code) ?? `HTTP_${res.status}`);
  return j.sharingDisabled === true;
}

/** Authenticated in-app preview (no Turnstile). Same deterministic engine. */
export async function runPreview(orgId: string, taps: unknown): Promise<unknown> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, taps }),
  });
  if (!res.ok) {
    const code = await res.json().then((j: { code?: string }) => j.code).catch(() => undefined);
    throw new SavedAuditError(code ?? `HTTP_${res.status}`);
  }
  return res.json();
}

/** Authenticated in-app website extraction (no Turnstile; capped + robots-safe). */
export async function runExtract(orgId: string, url: string, depth: 'quick' | 'deep' = 'quick'): Promise<unknown> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, url, depth }),
  });
  const j = await res.json().catch(() => null) as ({ code?: string } & Record<string, unknown>) | null;
  if (!res.ok) throw new SavedAuditError((j && j.code) ?? `HTTP_${res.status}`);
  return j;
}

/** B5 — deterministic document analysis: client-extracted text only (raw bytes
 *  never leave the browser); the server derives signals and discards the text. */
export async function analyzeDocument(orgId: string, name: string, text: string): Promise<unknown> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/analyze-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, name, text }),
  });
  const j = await res.json().catch(() => null) as ({ code?: string } & Record<string, unknown>) | null;
  if (!res.ok) throw new SavedAuditError((j && j.code) ?? `HTTP_${res.status}`);
  return j;
}

export async function deleteSavedAudit(orgId: string, auditId: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/${encodeURIComponent(auditId)}?${q(orgId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error('DELETE_FAILED');
}

/** Rename an audit (metadata only). Server sanitizes + regenerates the PDF header.
 *  Returns the stored (sanitized) title. */
export async function renameAudit(orgId: string, auditId: string, title: string): Promise<string> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/${encodeURIComponent(auditId)}/title`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, title }),
  });
  const j = await res.json().catch(() => null) as ({ code?: string; title?: string }) | null;
  if (!res.ok) throw new SavedAuditError((j && j.code) ?? `HTTP_${res.status}`);
  return (j && j.title) ?? title;
}

/** Fetch the PDF (auth-gated) and trigger a browser download.
 *  Past the free tier the server returns 402 PDF_LIMIT_REACHED; pass
 *  useTokens=true to spend tokens (TOKENS_INSUFFICIENT if the balance is short). */
export async function downloadSavedAudit(orgId: string, auditId: string, useTokens = false): Promise<void> {
  const idToken = await getIdToken();
  const extra = useTokens ? '&useTokens=1' : '';
  const res = await fetch(`${WORKER_BASE}/api/audit-express/file/${encodeURIComponent(auditId)}?${q(orgId)}${extra}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    const code = await res.json().then((j: { code?: string }) => j.code).catch(() => undefined);
    throw new SavedAuditError(code ?? `HTTP_${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit-express-readiness.pdf';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
