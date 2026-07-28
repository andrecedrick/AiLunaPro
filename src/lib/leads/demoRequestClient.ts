import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

/** B2.2 — submit a dashboard demo request to the worker-only store. */
export interface DemoRequestInput {
  orgId: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
}

export interface DemoRequestResult {
  id: string;
  /** True when the server collapsed this into an existing lead (double-click, retry). */
  duplicate: boolean;
}

export async function submitDemoRequest(input: DemoRequestInput): Promise<DemoRequestResult> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/demo-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(e.error ?? `Request failed (${res.status})`);
  }
  const body = (await res.json().catch(() => ({}))) as { id?: string; duplicate?: boolean };
  return { id: body.id ?? '', duplicate: body.duplicate === true };
}
