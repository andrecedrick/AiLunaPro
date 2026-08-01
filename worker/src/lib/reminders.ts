/**
 * Reminder sweep — the thing that makes "no lead is forgotten" true.
 *
 * A dashboard only warns the person who opens it. A rep who stops opening it is
 * exactly the rep whose leads go quiet, so the clock has to speak without being
 * asked. This runs on a cron trigger and turns overdue leads into notifications.
 *
 * ANTI-SPAM is structural, not a rate limiter: the notification id is
 * `<kind>_<contactId>_<YYYY-MM-DD>`, and createNotification writes by id. A lead
 * overdue for three weeks therefore produces one notification per day, not one
 * per sweep — and re-running the sweep by hand is harmless.
 *
 * Addressed to the OWNER (audience 'user') when the lead is assigned, and to the
 * operator bench when it is not. An unassigned overdue lead is a management
 * failure, not a rep's; sending it to nobody is how it stays unassigned.
 */

import { firestoreRunQuery } from './firestoreAdmin';
import { createNotification } from './notifications';
import {
  pipelineFromLegacy, evaluateOverdue, overduePriority, isTerminal, type Priority,
} from './pipeline';

const SCAN_CAP = 2000;
/** Notifications per sweep. A runaway sweep must not become the spam. */
const MAX_NOTIFICATIONS = 200;

export interface SweepResult {
  scanned: number;
  overdue: number;
  unassigned: number;
  notified: number;
  capped: boolean;
}

const s = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Scan every org's contacts and notify on overdue follow-ups. */
export async function runReminderSweep(saJson: string, nowIso = new Date().toISOString()): Promise<SweepResult> {
  const day = nowIso.slice(0, 10);
  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await firestoreRunQuery(saJson, {
      from: [{ collectionId: 'contacts', allDescendants: true }],
      limit: SCAN_CAP,
    }, '');
  } catch (err) {
    console.error('[reminders] scan failed:', err instanceof Error ? err.message : '');
    return { scanned: 0, overdue: 0, unassigned: 0, notified: 0, capped: false };
  }

  let overdue = 0, unassigned = 0, notified = 0, capped = false;

  for (const r of rows) {
    const f = r.fields as Record<string, unknown>;
    const m = r.name.match(/organizations\/([^/]+)\/contacts\/([^/]+)$/);
    if (!m) continue;
    const [, orgId, contactId] = m;

    const stage = pipelineFromLegacy(f.pipelineStatus, f.leadStatus, f.assignedToUid);
    if (isTerminal(stage)) continue;

    const verdict = evaluateOverdue({
      pipelineStatus: stage,
      nextFollowUpAt: s(f.nextFollowUpAt),
      lastContactAt:  s(f.lastContactAt),
      stageEnteredAt: s(f.stageEnteredAt) || s(f.createdAt),
    }, nowIso);
    if (!verdict.overdue) continue;
    overdue++;

    const ownerUid = s(f.assignedToUid);
    if (!ownerUid) unassigned++;

    if (notified >= MAX_NOTIFICATIONS) { capped = true; continue; }

    const stored = (['low', 'normal', 'high', 'urgent'] as const).includes(s(f.priority) as Priority)
      ? (s(f.priority) as Priority) : 'normal';
    const rank = overduePriority(stage, verdict.daysOverdue, stored);
    const late = verdict.daysOverdue >= 1 ? `${verdict.daysOverdue}d` : `${verdict.hoursOverdue}h`;
    // Only the top two bands interrupt anyone. A lead one day past a soft SLA is
    // a dashboard row, not a notification — that distinction is what keeps the
    // bell worth looking at.
    const severity = rank === 'urgent' ? 'critical' : rank === 'high' ? 'warning' : 'info';

    await createNotification(saJson, {
      audience: ownerUid ? 'user' : 'operator',
      uid: ownerUid || undefined,
      type: ownerUid ? 'follow_up_overdue' : 'lead_unassigned',
      targetType: 'contact', targetId: contactId, route: 'contacts',
      // No name, no company: a notification title is the one CRM surface that can
      // reach a phone lock screen.
      // Hours below a day, for the same reason the queue shows them: "overdue by
      // 0d" is a contradiction that reads as noise and gets ignored.
      title: ownerUid
        ? `Follow-up overdue by ${late} (${stage})`
        : `Unassigned lead waiting ${late}`,
      severity,
      id: `${ownerUid ? 'fu' : 'unassigned'}_${orgId}_${contactId}_${day}`,
    });
    notified++;
  }

  console.log(`[reminders] scanned=${rows.length} overdue=${overdue} unassigned=${unassigned} notified=${notified} capped=${capped}`);
  return { scanned: rows.length, overdue, unassigned, notified, capped };
}
