/**
 * Sales engine client — pipeline, activity, timeline and dashboard.
 *
 * Every call is authorised server-side by the same assignment rule the rest of
 * the CRM uses, so this module deliberately carries no permission logic of its
 * own: a client-side check is a hint, never a control.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export const PIPELINE_STATUSES = [
  'new', 'assigned', 'contacted', 'attempted_contact', 'qualified',
  'demo_scheduled', 'demo_completed', 'proposal_sent', 'negotiation',
  'won', 'lost', 'archived',
] as const;
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export const CHANNELS = ['email', 'sms', 'call', 'note'] as const;
export type Channel = (typeof CHANNELS)[number];

export const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const OUTCOMES = ['connected', 'no_answer', 'left_message', 'positive', 'negative', 'bounced'] as const;
export type Outcome = (typeof OUTCOMES)[number];

/** Follow-up presets in days, matching the server's reminder engine. */
export const FOLLOW_UP_PRESETS = [1, 3, 7, 30] as const;

export interface TimelineEvent {
  eventId: string; kind: string; at: string; actor: string; summary: string;
  data: Record<string, string>;
}

export interface QueueItem {
  contactId: string; orgId: string; name: string; company: string;
  stage: PipelineStatus; owner: string; priority: Priority;
  /** `daysOverdue` truncates under 24h; `hoursOverdue` is never 0 when overdue. */
  daysOverdue: number; hoursOverdue: number; reason: string;
  nextFollowUpAt: string; lastContactAt: string;
}

export interface GroupStat { key: string; total: number; won: number; lost: number; conversionRate: number }

export interface SalesDashboard {
  scope: 'all' | 'assigned';
  generatedAt: string;
  totals: {
    leads: number; open: number; won: number; lost: number; archived: number;
    conversionRate: number; avgCycleDays: number; followUpRate: number;
    overdue: number; dueToday: number; noNextStep: number;
  };
  funnel: Record<PipelineStatus, number>;
  bySource: GroupStat[]; byOwner: GroupStat[]; byCompany: GroupStat[]; byOrg: GroupStat[];
  queue: QueueItem[];
  scanned: number;
}

export class SalesError extends Error {
  code: string;
  constructor(code: string) { super(code); this.name = 'SalesError'; this.code = code; }
}

async function readError(res: Response): Promise<never> {
  const j = await res.json().catch(() => null) as { code?: string } | null;
  throw new SalesError(j?.code ?? `HTTP_${res.status}`);
}

async function authed(path: string, init?: RequestInit): Promise<Response> {
  const idToken = await getIdToken();
  return fetch(`${WORKER_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}), Authorization: `Bearer ${idToken}` },
  });
}

export interface PipelinePatch {
  pipelineStatus?:      PipelineStatus;
  nextFollowUpAt?:      string;
  nextFollowUpChannel?: Channel | '';
  priority?:            Priority;
  followUpNotes?:       string;
}

/** Move the stage, book a follow-up, set priority. Every change is timestamped server-side. */
export async function updatePipeline(orgId: string, contactId: string, patch: PipelinePatch): Promise<void> {
  const res = await authed(`/api/contacts/${encodeURIComponent(contactId)}/pipeline`, {
    method: 'PATCH',
    body: JSON.stringify({ orgId, ...patch }),
  });
  if (!res.ok) return readError(res);
}

export interface ActivityResult { pipelineStatus: PipelineStatus; nextFollowUpAt: string; bounced: boolean }

/**
 * Log a contact attempt. The server advances a brand-new lead and books the next
 * touch from the outcome, so the operator does not have to remember either.
 */
export async function logActivity(
  orgId: string, contactId: string,
  input: { channel: Channel; outcome?: Outcome | ''; note?: string; nextFollowUpAt?: string },
): Promise<ActivityResult> {
  const res = await authed(`/api/contacts/${encodeURIComponent(contactId)}/activity`, {
    method: 'POST',
    body: JSON.stringify({ orgId, ...input }),
  });
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as Partial<ActivityResult> | null;
  return { pipelineStatus: j?.pipelineStatus ?? 'new', nextFollowUpAt: j?.nextFollowUpAt ?? '', bounced: j?.bounced ?? false };
}

export async function fetchTimeline(orgId: string, contactId: string): Promise<TimelineEvent[]> {
  const res = await authed(`/api/contacts/${encodeURIComponent(contactId)}/timeline?orgId=${encodeURIComponent(orgId)}`);
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as { events?: TimelineEvent[] } | null;
  return j?.events ?? [];
}

export async function fetchSalesDashboard(orgId: string): Promise<SalesDashboard> {
  const res = await authed(`/api/sales/dashboard?orgId=${encodeURIComponent(orgId)}`);
  if (!res.ok) return readError(res);
  return await res.json() as SalesDashboard;
}
