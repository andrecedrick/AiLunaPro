/**
 * Worksheet (AUDIT TEMPS → ARGENT) client — auth-gated, org-scoped worker routes.
 * Calls with the Firebase ID token; no PII beyond the user's own org data.
 */
import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';
import type { WorksheetInput, WorksheetResult } from './auditWorksheet';

export interface SavedWorksheetItem {
  worksheetId:          string;
  title:                string;
  createdAt:            string;
  taskCount:            number;
  totalAnnualCost:      number;
  annualValueRecovered: number;
}

export interface SavedWorksheetDetail {
  worksheetId:    string;
  title:          string;
  createdAt:      string;
  rulesetVersion: string;
  input:          WorksheetInput | null;
  result:         WorksheetResult | null;
}

const q = (orgId: string) => `orgId=${encodeURIComponent(orgId)}`;

export async function saveWorksheet(orgId: string, input: WorksheetInput, worksheetId?: string): Promise<string> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/worksheet/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, input, worksheetId, createdAt: new Date().toISOString() }),
  });
  if (!res.ok) {
    const code = await res.json().then((j: { code?: string }) => j.code).catch(() => undefined);
    throw new Error(code ?? `HTTP_${res.status}`);
  }
  const j = await res.json() as { worksheetId?: string };
  return j.worksheetId ?? '';
}

export async function listWorksheets(orgId: string): Promise<SavedWorksheetItem[]> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/worksheet/list?${q(orgId)}`, { headers: { Authorization: `Bearer ${idToken}` } });
  if (!res.ok) throw new Error('LIST_FAILED');
  const j = await res.json() as { items?: SavedWorksheetItem[] };
  return Array.isArray(j.items) ? j.items : [];
}

export async function getWorksheet(orgId: string, id: string): Promise<SavedWorksheetDetail> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/worksheet/detail/${encodeURIComponent(id)}?${q(orgId)}`, { headers: { Authorization: `Bearer ${idToken}` } });
  if (!res.ok) throw new Error('DETAIL_FAILED');
  return await res.json() as SavedWorksheetDetail;
}

export async function deleteWorksheet(orgId: string, id: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/worksheet/${encodeURIComponent(id)}?${q(orgId)}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error('DELETE_FAILED');
}
