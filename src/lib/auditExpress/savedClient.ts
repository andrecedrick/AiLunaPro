/**
 * Saved Audit Express client (J15 P1.1 SPA). Calls the auth-gated, org-scoped
 * worker routes with the Firebase ID token. No PII handled client-side beyond
 * the user's own org metadata.
 */
import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export interface SavedAuditItem {
  auditId:       string;
  createdAt:     string;
  businessType:  string;
  audience:      string;
  confidence:    string;
  engineVersion: string;
  canonicalUrl:  string;
}

const q = (orgId: string) => `orgId=${encodeURIComponent(orgId)}`;

export async function listSavedAudits(orgId: string): Promise<SavedAuditItem[]> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/list?${q(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error('LIST_FAILED');
  const j = await res.json() as { items?: SavedAuditItem[] };
  return Array.isArray(j.items) ? j.items : [];
}

export async function deleteSavedAudit(orgId: string, auditId: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/${encodeURIComponent(auditId)}?${q(orgId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error('DELETE_FAILED');
}

/** Fetch the PDF (auth-gated) and trigger a browser download. */
export async function downloadSavedAudit(orgId: string, auditId: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/audit-express/file/${encodeURIComponent(auditId)}?${q(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error('DOWNLOAD_FAILED');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit-express-readiness.pdf';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
