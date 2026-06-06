/**
 * Reports worker client (Batch B). Calls the auth-gated, org-scoped worker
 * routes with the Firebase ID token. The PDF is regenerated server-side from the
 * report's answer snapshot (premium, deterministic). No PII handled client-side
 * beyond the user's own org metadata.
 */
import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

/** Error carrying the server's non-PII code (e.g. PDF_LIMIT_REACHED, FORBIDDEN). */
export class ReportApiError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; }
}

const q = (orgId: string) => `orgId=${encodeURIComponent(orgId)}`;

/** Download the premium report PDF (auth-gated, quota-enforced). */
export async function downloadReport(orgId: string, reportId: string, useTokens = false): Promise<void> {
  const idToken = await getIdToken();
  const extra = useTokens ? '&useTokens=1' : '';
  const res = await fetch(`${WORKER_BASE}/api/reports/file/${encodeURIComponent(reportId)}?${q(orgId)}${extra}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    const code = await res.json().then((j: { code?: string }) => j.code).catch(() => undefined);
    throw new ReportApiError(code ?? `HTTP_${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ai-compliance-report.pdf';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Rename a report (owners/admins). Server sanitizes; returns the stored title. */
export async function renameReport(orgId: string, reportId: string, title: string): Promise<string> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/reports/${encodeURIComponent(reportId)}/title`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, title }),
  });
  const j = await res.json().catch(() => null) as ({ title?: string; code?: string }) | null;
  if (!res.ok || !j) throw new ReportApiError((j && j.code) ?? `HTTP_${res.status}`);
  return j.title ?? title;
}

export interface ReportShareState {
  shareVersion: number;
  sharedAt: string;
  sharedExpiresAt: string;
  shareRevokedAt: string;
  sharingDisabled: boolean;
}
export interface ReportShareLink { url: string; expiresAt: string }

/** Read share metadata (from the recompute detail route). Returns null if the
 *  report isn't readable (e.g. member viewing a draft) — sharing card hidden. */
export async function getReportShareState(orgId: string, reportId: string): Promise<ReportShareState | null> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/reports/detail/${encodeURIComponent(reportId)}?${q(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return null;
  const j = await res.json().catch(() => null) as Partial<ReportShareState> | null;
  if (!j) return null;
  return {
    shareVersion: typeof j.shareVersion === 'number' ? j.shareVersion : 1,
    sharedAt: typeof j.sharedAt === 'string' ? j.sharedAt : '',
    sharedExpiresAt: typeof j.sharedExpiresAt === 'string' ? j.sharedExpiresAt : '',
    shareRevokedAt: typeof j.shareRevokedAt === 'string' ? j.shareRevokedAt : '',
    sharingDisabled: j.sharingDisabled === true,
  };
}

/** Create a public share link (owners/admins). Quota-counted. */
export async function createReportShareLink(orgId: string, reportId: string, useTokens = false): Promise<ReportShareLink> {
  return mintReportShare(`${WORKER_BASE}/api/reports/${encodeURIComponent(reportId)}/share`, orgId, useTokens);
}
/** Regenerate the link (bumps shareVersion → old links die). Quota-counted. */
export async function regenerateReportShareLink(orgId: string, reportId: string, useTokens = false): Promise<ReportShareLink> {
  return mintReportShare(`${WORKER_BASE}/api/reports/${encodeURIComponent(reportId)}/regenerate-share`, orgId, useTokens);
}
async function mintReportShare(base: string, orgId: string, useTokens: boolean): Promise<ReportShareLink> {
  const idToken = await getIdToken();
  const res = await fetch(`${base}${useTokens ? '?useTokens=1' : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId }),
  });
  const j = await res.json().catch(() => null) as (ReportShareLink & { code?: string }) | null;
  if (!res.ok || !j) throw new ReportApiError((j && j.code) ?? `HTTP_${res.status}`);
  return j;
}

/** Instantly revoke all outstanding links for a report (owners/admins). */
export async function revokeReportShare(orgId: string, reportId: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/reports/${encodeURIComponent(reportId)}/revoke-share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId }),
  });
  if (!res.ok) {
    const code = await res.json().then((x: { code?: string }) => x.code).catch(() => undefined);
    throw new ReportApiError(code ?? `HTTP_${res.status}`);
  }
}

/** Enable/disable sharing for a report (owners/admins). */
export async function setReportSharingDisabled(orgId: string, reportId: string, disabled: boolean): Promise<boolean> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/reports/${encodeURIComponent(reportId)}/sharing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, disabled }),
  });
  const j = await res.json().catch(() => null) as ({ sharingDisabled?: boolean; code?: string }) | null;
  if (!res.ok || !j) throw new ReportApiError((j && j.code) ?? `HTTP_${res.status}`);
  return j.sharingDisabled === true;
}
