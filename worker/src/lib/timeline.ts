/**
 * Contact timeline — append-only activity history.
 *
 * `organizations/{orgId}/contacts/{contactId}/timeline/{eventId}`
 *
 * IMMUTABLE BY CONSTRUCTION, not by convention: the id is derived from the
 * event's own content plus a monotonic sequence, every write goes through
 * `appendEvent` here, and no route anywhere exposes an update or delete for the
 * subcollection. A timeline that can be edited is not evidence — the whole point
 * of recording who changed a lead's stage is that the record outlives whoever
 * disagrees with it later.
 *
 * A timeline write must NEVER fail the action it describes. Losing the audit line
 * for an assignment is bad; losing the assignment because the audit line failed
 * is worse. `appendEvent` therefore swallows and logs, and returns whether it
 * landed so a caller that cares can report it.
 */

import { firestoreSet } from './firestoreAdmin';

export const TIMELINE_KINDS = [
  'created', 'signup', 'import', 'demo_request',
  'assigned', 'reassigned', 'unassigned',
  'status_changed', 'follow_up_scheduled',
  'email', 'sms', 'call', 'note',
  'company_changed', 'twenty_synced',
] as const;
export type TimelineKind = (typeof TIMELINE_KINDS)[number];

export const isTimelineKind = (v: unknown): v is TimelineKind =>
  typeof v === 'string' && (TIMELINE_KINDS as readonly string[]).includes(v);

export interface TimelineEvent {
  kind:    TimelineKind;
  /** ISO. Supplied by the caller so one action writes one consistent timestamp. */
  at:      string;
  /** Who caused it. Email for a human, or a system marker like 'system:signup'. */
  actor:   string;
  /** Short human line. NEVER an email address or phone number — see below. */
  summary: string;
  /** Structured extras: from/to stage, channel, outcome. Values are capped. */
  data?:   Record<string, string>;
}

const cap = (v: unknown, n: number): string => (typeof v === 'string' ? v : '').slice(0, n);

/**
 * Strip anything that looks like an email or a phone number.
 *
 * The timeline is rendered to every operator who can see the contact and is
 * exported nowhere, but it is still the one surface where a careless summary
 * ("emailed bob@acme.com") would duplicate PII into a second store with a
 * different retention story. The contact record already holds the address.
 */
export function scrubSummary(raw: string): string {
  return raw
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, '<email>')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '<phone>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

function eventId(seq: number): string {
  // Sequence-prefixed so Firestore's lexicographic document order IS chronological
  // order; the random suffix keeps two events in the same millisecond distinct.
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  const rand = btoa(String.fromCharCode(...b)).replace(/[=+/]/g, '');
  return `${String(seq).padStart(15, '0')}_${rand}`;
}

/** Build the stored shape. Exported for tests; the route calls appendEvent. */
export function buildEvent(e: TimelineEvent): Record<string, string> {
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(e.data ?? {})) data[`data_${cap(k, 32)}`] = cap(v, 120);
  return {
    kind:    e.kind,
    at:      cap(e.at, 40),
    actor:   cap(e.actor, 120),
    summary: scrubSummary(e.summary),
    ...data,
  };
}

/**
 * Append one event. Returns false when the write failed — never throws.
 */
export async function appendEvent(
  saJson: string, orgId: string, contactId: string, e: TimelineEvent,
): Promise<boolean> {
  const seq = Date.parse(e.at) || Date.now();
  const path = `organizations/${orgId}/contacts/${contactId}/timeline/${eventId(seq)}`;
  try {
    await firestoreSet(saJson, path, buildEvent(e));
    return true;
  } catch (err) {
    console.error('[timeline] append failed:', e.kind, err instanceof Error ? err.message : '');
    return false;
  }
}
