import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';
import { requestNotificationRefresh } from '../platform/platformService';

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
  // The worker just created an operator notification. Tell any mounted bell to
  // refetch so it is not stale until the next full page load. A duplicate creates
  // no new notification, so no signal is emitted for one.
  if (body.duplicate !== true) requestNotificationRefresh();
  return { id: body.id ?? '', duplicate: body.duplicate === true };
}
