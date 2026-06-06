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
