import { describe, it, expect } from 'vitest';
import {
  PIPELINE_STATUSES, pipelineFromLegacy, legacyFromPipeline, evaluateOverdue,
  overduePriority, suggestFollowUpDays, addDays, isTerminal, STAGE_SLA_DAYS,
  type PipelineStatus,
} from '../../worker/src/lib/pipeline';
import { scrubSummary, buildEvent, isTimelineKind } from '../../worker/src/lib/timeline';

const NOW = '2026-08-01T12:00:00.000Z';
const daysAgo = (n: number) => new Date(Date.parse(NOW) - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(Date.parse(NOW) + n * 86400000).toISOString();

describe('pipeline — stage resolution', () => {
  it('an explicit stage always wins', () => {
    expect(pipelineFromLegacy('negotiation', 'new', '')).toBe('negotiation');
  });

  it('maps every legacy value so no historical contact is stageless', () => {
    expect(pipelineFromLegacy('', 'contacted', '')).toBe('contacted');
    expect(pipelineFromLegacy('', 'qualified', '')).toBe('qualified');
    expect(pipelineFromLegacy('', 'won', '')).toBe('won');
    expect(pipelineFromLegacy('', 'lost', '')).toBe('lost');
  });

  it('distinguishes an unassigned new lead from an assigned one', () => {
    expect(pipelineFromLegacy('', 'new', '')).toBe('new');
    expect(pipelineFromLegacy('', 'new', 'sales1')).toBe('assigned');
    expect(pipelineFromLegacy(undefined, undefined, undefined)).toBe('new');
  });

  it('rejects a bogus stage rather than trusting it', () => {
    expect(pipelineFromLegacy('not_a_stage', 'won', '')).toBe('won');
  });

  it('every stage maps back to a legacy value the table can render', () => {
    const allowed = ['new', 'contacted', 'qualified', 'won', 'lost'];
    for (const st of PIPELINE_STATUSES) expect(allowed).toContain(legacyFromPipeline(st));
  });

  it('a closed stage is terminal, an open one is not', () => {
    expect(isTerminal('won')).toBe(true);
    expect(isTerminal('lost')).toBe(true);
    expect(isTerminal('archived')).toBe(true);
    expect(isTerminal('negotiation')).toBe(false);
  });
});

describe('pipeline — overdue detection', () => {
  const base = { pipelineStatus: 'contacted' as PipelineStatus, nextFollowUpAt: '', lastContactAt: '', stageEnteredAt: '' };

  it('a booked follow-up in the future is not overdue', () => {
    expect(evaluateOverdue({ ...base, nextFollowUpAt: daysAhead(2) }, NOW).overdue).toBe(false);
  });

  it('a MISSED follow-up is overdue, counted in whole days', () => {
    const v = evaluateOverdue({ ...base, nextFollowUpAt: daysAgo(3) }, NOW);
    expect(v).toMatchObject({ overdue: true, daysOverdue: 3, reason: 'follow_up_missed' });
  });

  it('a lead with NO next step goes overdue on its stage SLA', () => {
    // 'contacted' allows 3 days; 5 days in the stage is 2 days past.
    const v = evaluateOverdue({ ...base, stageEnteredAt: daysAgo(5) }, NOW);
    expect(v).toMatchObject({ overdue: true, daysOverdue: 2, reason: 'stage_stale' });
  });

  it('a lead inside its stage SLA is not overdue', () => {
    expect(evaluateOverdue({ ...base, stageEnteredAt: daysAgo(1) }, NOW).overdue).toBe(false);
  });

  it('a CLOSED lead is never overdue', () => {
    for (const st of ['won', 'lost', 'archived'] as PipelineStatus[]) {
      expect(evaluateOverdue({ ...base, pipelineStatus: st, nextFollowUpAt: daysAgo(90) }, NOW).overdue).toBe(false);
    }
  });

  it('an explicit follow-up date OVERRIDES the stage SLA', () => {
    // Stage long stale, but a date was booked for tomorrow: not overdue.
    const v = evaluateOverdue({ ...base, stageEnteredAt: daysAgo(90), nextFollowUpAt: daysAhead(1) }, NOW);
    expect(v.overdue).toBe(false);
  });

  it('a record with no dates at all is not overdue — unknown is not late', () => {
    expect(evaluateOverdue(base, NOW).overdue).toBe(false);
  });

  it('falls back to the last contact when the stage timestamp is missing', () => {
    expect(evaluateOverdue({ ...base, lastContactAt: daysAgo(10) }, NOW).overdue).toBe(true);
  });

  it('survives unparseable dates without throwing or flagging', () => {
    expect(evaluateOverdue({ ...base, nextFollowUpAt: 'not-a-date' }, NOW).overdue).toBe(false);
    expect(evaluateOverdue({ ...base, stageEnteredAt: 'nonsense' }, NOW).overdue).toBe(false);
    expect(evaluateOverdue(base, 'nonsense').overdue).toBe(false);
  });

  it('every non-terminal stage has a usable SLA and every terminal one has none', () => {
    for (const st of PIPELINE_STATUSES) {
      if (isTerminal(st)) expect(STAGE_SLA_DAYS[st]).toBe(0);
      else expect(STAGE_SLA_DAYS[st]).toBeGreaterThan(0);
    }
  });
});

describe('pipeline — queue ranking', () => {
  it('a late-stage deal going quiet outranks an old early-stage one', () => {
    expect(overduePriority('proposal_sent', 2, 'normal')).toBe('urgent');
    expect(overduePriority('negotiation', 3, 'low')).toBe('urgent');
    expect(overduePriority('contacted', 10, 'normal')).toBe('high');
  });

  it('an operator-set urgent is never downgraded', () => {
    expect(overduePriority('new', 0, 'urgent')).toBe('urgent');
  });

  it('a barely-late early lead keeps its stored priority', () => {
    expect(overduePriority('new', 0, 'low')).toBe('low');
  });
});

describe('pipeline — follow-up suggestions', () => {
  it('chases a no-answer tomorrow and a positive signal in three days', () => {
    expect(suggestFollowUpDays('no_answer')).toBe(1);
    expect(suggestFollowUpDays('left_message')).toBe(1);
    expect(suggestFollowUpDays('connected')).toBe(3);
    expect(suggestFollowUpDays('positive')).toBe(3);
    expect(suggestFollowUpDays('negative')).toBe(30);
  });

  it('a BOUNCE schedules nothing — chasing a dead address is how a lead rots', () => {
    expect(suggestFollowUpDays('bounced')).toBe(0);
  });

  it('addDays returns a real ISO instant', () => {
    expect(addDays(NOW, 3)).toBe('2026-08-04T12:00:00.000Z');
  });
});

describe('timeline', () => {
  it('scrubs emails and phone numbers out of a summary', () => {
    expect(scrubSummary('Emailed bob@acme.com on +33 6 12 34 56 78'))
      .toBe('Emailed <email> on <phone>');
  });

  it('caps the summary length', () => {
    expect(scrubSummary('x'.repeat(500))).toHaveLength(200);
  });

  it('prefixes structured data so it cannot collide with a core field', () => {
    const e = buildEvent({ kind: 'call', at: NOW, actor: 'ops@x.com', summary: 'Called', data: { outcome: 'connected', kind: 'spoofed' } });
    expect(e.kind).toBe('call');            // not overwritten by data.kind
    expect(e.data_outcome).toBe('connected');
    expect(e.data_kind).toBe('spoofed');
  });

  it('knows its own event kinds', () => {
    expect(isTimelineKind('status_changed')).toBe(true);
    expect(isTimelineKind('nope')).toBe(false);
  });
});
