/**
 * Commercial pipeline — statuses, follow-up rules and staleness.
 *
 * Pure: no Firestore, no clock of its own (every function that needs "now" takes
 * it). The routes do the I/O; everything that decides what a lead's state MEANS
 * lives here so it can be tested exhaustively.
 *
 * WHY A NEW FIELD AND NOT `leadStatus`: the CRM already stores a five-value
 * `leadStatus` (new/contacted/qualified/won/lost) that the contacts table renders
 * and the CSV export emits. Widening it in place would silently reinterpret every
 * existing record and break both. `pipelineStatus` is the twelve-value commercial
 * stage; `leadStatus` is kept in step for the surfaces that already read it, and
 * a record that has never been touched by the pipeline is READ through
 * `pipelineFromLegacy` so no contact is stageless.
 */

export const PIPELINE_STATUSES = [
  'new', 'assigned', 'contacted', 'attempted_contact', 'qualified',
  'demo_scheduled', 'demo_completed', 'proposal_sent', 'negotiation',
  'won', 'lost', 'archived',
] as const;
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

/** Closed stages. A closed lead is never chased and never counts as overdue. */
export const TERMINAL_STATUSES: readonly PipelineStatus[] = ['won', 'lost', 'archived'];
export const isTerminal = (s: PipelineStatus): boolean => TERMINAL_STATUSES.includes(s);

export const FOLLOW_UP_CHANNELS = ['email', 'sms', 'call', 'note'] as const;
export type FollowUpChannel = (typeof FOLLOW_UP_CHANNELS)[number];

export const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

/** Outcome of a logged contact attempt. Drives the follow-up suggestion. */
export const OUTCOMES = ['connected', 'no_answer', 'bounced', 'positive', 'negative', 'left_message'] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const isPipelineStatus = (v: unknown): v is PipelineStatus =>
  typeof v === 'string' && (PIPELINE_STATUSES as readonly string[]).includes(v);
export const isChannel = (v: unknown): v is FollowUpChannel =>
  typeof v === 'string' && (FOLLOW_UP_CHANNELS as readonly string[]).includes(v);
export const isPriority = (v: unknown): v is Priority =>
  typeof v === 'string' && (PRIORITIES as readonly string[]).includes(v);
export const isOutcome = (v: unknown): v is Outcome =>
  typeof v === 'string' && (OUTCOMES as readonly string[]).includes(v);

/**
 * Read a pipeline stage off a contact that may predate the pipeline.
 *
 * Order matters: an explicit `pipelineStatus` always wins. Falling back to the
 * legacy five-value field means a contact written months ago still has a stage
 * the dashboard can count, without a migration.
 */
export function pipelineFromLegacy(pipelineStatus: unknown, leadStatus: unknown, assignedToUid: unknown): PipelineStatus {
  if (isPipelineStatus(pipelineStatus)) return pipelineStatus;
  const legacy = typeof leadStatus === 'string' ? leadStatus : '';
  if (legacy === 'contacted')  return 'contacted';
  if (legacy === 'qualified')  return 'qualified';
  if (legacy === 'won')        return 'won';
  if (legacy === 'lost')       return 'lost';
  // 'new' or empty: an assigned lead is further along than an unassigned one, and
  // the dashboard's "assigned but not yet worked" count depends on the difference.
  return typeof assignedToUid === 'string' && assignedToUid ? 'assigned' : 'new';
}

/** Keep the legacy field in step so the table and CSV export stay correct. */
export function legacyFromPipeline(s: PipelineStatus): string {
  if (s === 'new' || s === 'assigned') return 'new';
  if (s === 'won' || s === 'lost') return s;
  if (s === 'qualified' || s === 'demo_scheduled' || s === 'demo_completed'
    || s === 'proposal_sent' || s === 'negotiation') return 'qualified';
  if (s === 'archived') return 'lost';
  return 'contacted';   // contacted, attempted_contact
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * How long a lead may sit in a stage before it is chased, in days.
 *
 * These are the reminder engine. They are per-STAGE rather than a single global
 * interval because the cost of silence differs: a sent proposal going quiet for a
 * week is a lost deal, whereas an unassigned lead is a queue problem measured in
 * hours. Terminal stages have no interval — a won deal is not overdue.
 */
export const STAGE_SLA_DAYS: Record<PipelineStatus, number> = {
  new:               1,
  assigned:          1,
  contacted:         3,
  attempted_contact: 1,
  qualified:         3,
  demo_scheduled:    1,
  demo_completed:    2,
  proposal_sent:     3,
  negotiation:       3,
  won:               0,
  lost:              0,
  archived:          0,
};

/** Follow-up offsets an operator can pick, in days. */
export const FOLLOW_UP_PRESETS = [1, 3, 7, 30] as const;

export const addDays = (nowIso: string, days: number): string =>
  new Date(new Date(nowIso).getTime() + days * DAY).toISOString();

/**
 * Suggest the next follow-up after a logged contact attempt.
 *
 * A no-answer is chased tomorrow; a positive signal gets three days so the
 * prospect can reply; a bounce is not chased on the same channel at all and
 * returns 0, which the caller reads as "do not schedule — fix the address".
 */
export function suggestFollowUpDays(outcome: Outcome): number {
  switch (outcome) {
    case 'no_answer':
    case 'left_message': return 1;
    case 'connected':
    case 'positive':     return 3;
    case 'negative':     return 30;
    case 'bounced':      return 0;
  }
}

export interface FollowUpState {
  pipelineStatus: PipelineStatus;
  /** ISO, or '' when nothing is scheduled. */
  nextFollowUpAt: string;
  /** ISO of the last logged contact of any channel, or ''. */
  lastContactAt:  string;
  /** ISO the stage was entered. Used when nothing has been scheduled. */
  stageEnteredAt: string;
}

export interface OverdueVerdict {
  overdue:     boolean;
  /** Whole days past due. 0 when not overdue — and 0 for anything under 24h. */
  daysOverdue: number;
  /**
   * Whole HOURS past due. Carried because `daysOverdue` truncates: a lead that
   * went overdue twenty hours ago reported "0d late" while sitting in an overdue
   * queue, which reads as "not late" and is the one number the operator uses to
   * decide whether to act. Always ≥ 1 when `overdue` is true.
   */
  hoursOverdue: number;
  reason:      'follow_up_missed' | 'stage_stale' | '';
}

/**
 * Is this lead being neglected?
 *
 * Two independent ways to be overdue, deliberately kept apart because they are
 * different failures:
 *   - a scheduled follow-up date has passed  → someone committed to a date and missed it
 *   - no follow-up scheduled AND the stage has exceeded its SLA → nobody committed at all
 *
 * The second is the one that actually loses deals: a lead with no next step is
 * invisible to a to-do list, so it needs the clock to speak for it.
 */
export function evaluateOverdue(state: FollowUpState, nowIso: string): OverdueVerdict {
  const none = { overdue: false, daysOverdue: 0, hoursOverdue: 0, reason: '' as const };
  if (isTerminal(state.pipelineStatus)) return none;
  const now = new Date(nowIso).getTime();
  if (!Number.isFinite(now)) return none;

  /** Lateness in ms → the verdict. `hoursOverdue` never rounds down to 0. */
  const late = (ms: number, reason: 'follow_up_missed' | 'stage_stale'): OverdueVerdict => ({
    overdue: true,
    daysOverdue: Math.floor(ms / DAY),
    hoursOverdue: Math.max(1, Math.floor(ms / HOUR)),
    reason,
  });

  if (state.nextFollowUpAt) {
    const due = new Date(state.nextFollowUpAt).getTime();
    if (!Number.isFinite(due)) return none;
    if (now <= due) return none;
    return late(now - due, 'follow_up_missed');
  }

  const sla = STAGE_SLA_DAYS[state.pipelineStatus];
  if (sla <= 0) return none;
  // Fall back to the last contact when the stage timestamp is missing: an old
  // record may have neither, and treating "unknown" as overdue would flood the
  // dashboard on day one.
  const since = state.stageEnteredAt || state.lastContactAt;
  if (!since) return none;
  const from = new Date(since).getTime();
  if (!Number.isFinite(from)) return none;
  const elapsed = now - from;
  if (elapsed <= sla * DAY) return none;
  // Lateness is measured from the moment the SLA expired, not from stage entry.
  // Subtracting whole days AFTER flooring lost the fraction and reported a lead
  // twenty hours late as "0d".
  return late(elapsed - sla * DAY, 'stage_stale');
}

/**
 * Priority for an overdue lead. Used to rank the follow-up queue so the operator
 * works the most damaging silence first rather than the oldest row.
 */
export function overduePriority(status: PipelineStatus, daysOverdue: number, stored: Priority): Priority {
  if (stored === 'urgent') return 'urgent';
  const lateStage = status === 'proposal_sent' || status === 'negotiation' || status === 'demo_scheduled';
  if (lateStage && daysOverdue >= 2) return 'urgent';
  if (lateStage || daysOverdue >= 7) return 'high';
  if (daysOverdue >= 2) return 'normal';
  return stored;
}
