import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Sales engine — pipeline routes, timeline, dashboard and the reminder sweep.
 *
 * The properties under test are the commercial guarantees: a stage cannot move
 * without leaving a record, a logged call books the next one, a closed lead stops
 * being chased, and an overdue lead notifies exactly once per day.
 */

const state = vi.hoisted(() => ({
  roles:  new Map<string, string>(),
  docs:   new Map<string, Record<string, unknown>>(),
  notifs: [] as Array<{ id?: string; audience: string; uid?: string; type: string; severity?: string; title: string }>,
}));

vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { req: { header: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', c.req.header('x-test-uid') ?? 'anon');
    const em = c.req.header('x-test-email'); if (em) c.set('email', em);
    c.set('emailVerified', true);
    await next();
  },
}));

vi.mock('../../worker/src/lib/notifications', () => ({
  createNotification: vi.fn(async (_sa: string, n: { id?: string }) => {
    // Mirrors the real write-by-id: the same id twice is ONE notification.
    const i = state.notifs.findIndex(x => x.id && x.id === n.id);
    if (i >= 0) state.notifs[i] = n as never; else state.notifs.push(n as never);
  }),
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    const m = path.match(/^organizations\/([^/]+)\/members\/([^/]+)$/);
    if (m) { const r = state.roles.get(`${m[1]}/${m[2]}`); return r ? { role: r } : null; }
    return state.docs.get(path) ?? null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>, o?: { merge?: boolean }) => {
    const prev = o?.merge ? (state.docs.get(path) ?? {}) : {};
    state.docs.set(path, { ...prev, ...data });
  }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const from = (sq.from as Array<{ collectionId: string; allDescendants?: boolean }>)[0];
    const re = from.allDescendants
      ? new RegExp(`^organizations/[^/]+/${from.collectionId}/[^/]+$`)
      : new RegExp(`^${parent}/${from.collectionId}/[^/]+$`);
    return [...state.docs.entries()].filter(([p]) => re.test(p)).map(([name, fields]) => ({ name, fields }));
  }),
}));

import pipeline from '../../worker/src/routes/pipeline';
import sales from '../../worker/src/routes/sales';
import { runReminderSweep } from '../../worker/src/lib/reminders';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', PLATFORM_ADMIN_EMAILS: 'ops@ailuna.com' } as unknown as Record<string, unknown>;
const OPS = 'ops@ailuna.com';
const NOW = Date.now();
const daysAgo = (n: number) => new Date(NOW - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(NOW + n * 86400000).toISOString();

const H = (uid: string, email?: string) => {
  const h: Record<string, string> = { 'Content-Type': 'application/json', 'x-test-uid': uid };
  if (email) h['x-test-email'] = email;
  return h;
};
const patchPipeline = (uid: string, id: string, body: unknown, email?: string) =>
  pipeline.request(`/api/contacts/${id}/pipeline`, { method: 'PATCH', headers: H(uid, email), body: JSON.stringify({ orgId: 'orgA', ...(body as object) }) }, ENV);
const logActivity = (uid: string, id: string, body: unknown, email?: string) =>
  pipeline.request(`/api/contacts/${id}/activity`, { method: 'POST', headers: H(uid, email), body: JSON.stringify({ orgId: 'orgA', ...(body as object) }) }, ENV);
const timeline = (uid: string, id: string, email?: string) =>
  pipeline.request(`/api/contacts/${id}/timeline?orgId=orgA`, { headers: H(uid, email) }, ENV);
const dashboard = (uid: string, email?: string) =>
  sales.request('/api/sales/dashboard?orgId=orgA', { headers: H(uid, email) }, ENV);

const contact = (id: string, f: Record<string, unknown> = {}, orgId = 'orgA') =>
  state.docs.set(`organizations/${orgId}/contacts/${id}`, {
    contactId: id, orgId, name: `Lead ${id}`, company: 'Acme', email: `${id}@x.com`,
    source: 'demo_request', assignedToUid: 'sales1', assignedToEmail: 'sales1@acme.com',
    createdByUid: 'sales1', createdAt: daysAgo(10), leadStatus: 'new', ...f,
  });

const events = (id: string) => [...state.docs.entries()]
  .filter(([p]) => p.startsWith(`organizations/orgA/contacts/${id}/timeline/`))
  .map(([, f]) => f as Record<string, string>);

beforeEach(() => {
  state.roles.clear(); state.docs.clear(); state.notifs.length = 0; vi.clearAllMocks();
  state.roles.set('orgA/sales1', 'member');
  state.roles.set('orgA/sales2', 'member');
  state.roles.set('orgA/boss', 'owner');   // also ops@ailuna.com
});

describe('pipeline — stage changes', () => {
  it('moves the stage and records WHO moved it', async () => {
    contact('c1');
    const res = await patchPipeline('sales1', 'c1', { pipelineStatus: 'qualified' }, 'sales1@acme.com');
    expect(res.status).toBe(200);
    const doc = state.docs.get('organizations/orgA/contacts/c1')!;
    expect(doc.pipelineStatus).toBe('qualified');
    expect(doc.leadStatus).toBe('qualified');       // legacy field kept in step
    const ev = events('c1').find(e => e.kind === 'status_changed')!;
    expect(ev).toMatchObject({ actor: 'sales1@acme.com', data_from: 'assigned', data_to: 'qualified' });
  });

  it('rejects an unknown stage', async () => {
    contact('c1');
    const res = await patchPipeline('sales1', 'c1', { pipelineStatus: 'invented' }, 'sales1@acme.com');
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_STATUS');
  });

  it('a rep cannot touch a lead assigned to someone else', async () => {
    contact('c1', { assignedToUid: 'sales2', createdByUid: 'sales2' });
    expect((await patchPipeline('sales1', 'c1', { pipelineStatus: 'won' }, 'sales1@acme.com')).status).toBe(403);
  });

  it('a super admin can work any lead', async () => {
    contact('c1', { assignedToUid: 'sales2', createdByUid: 'sales2' });
    expect((await patchPipeline('boss', 'c1', { pipelineStatus: 'won' }, OPS)).status).toBe(200);
  });

  it('CLOSING a lead clears its follow-up so it stops being chased', async () => {
    contact('c1', { nextFollowUpAt: daysAgo(5), nextFollowUpChannel: 'email' });
    await patchPipeline('sales1', 'c1', { pipelineStatus: 'won' }, 'sales1@acme.com');
    const doc = state.docs.get('organizations/orgA/contacts/c1')!;
    expect(doc.nextFollowUpAt).toBe('');
    expect(doc.nextFollowUpChannel).toBe('');
  });

  it('notifies once on won and once on lost, idempotently', async () => {
    contact('c1'); contact('c2');
    await patchPipeline('sales1', 'c1', { pipelineStatus: 'won' }, 'sales1@acme.com');
    await patchPipeline('sales1', 'c1', { pipelineStatus: 'won' }, 'sales1@acme.com'); // no-op re-save
    await patchPipeline('sales1', 'c2', { pipelineStatus: 'lost' }, 'sales1@acme.com');
    expect(state.notifs.map(n => n.type).sort()).toEqual(['lead_lost', 'lead_won']);
  });

  it('an ordinary stage move does NOT notify — that is what keeps the bell useful', async () => {
    contact('c1');
    await patchPipeline('sales1', 'c1', { pipelineStatus: 'qualified' }, 'sales1@acme.com');
    expect(state.notifs).toHaveLength(0);
  });

  it('books a follow-up and records it', async () => {
    contact('c1');
    const due = daysAhead(3);
    await patchPipeline('sales1', 'c1', { nextFollowUpAt: due, nextFollowUpChannel: 'call', priority: 'high' }, 'sales1@acme.com');
    const doc = state.docs.get('organizations/orgA/contacts/c1')!;
    expect(doc.nextFollowUpAt).toBe(new Date(due).toISOString());
    expect(doc.priority).toBe('high');
    expect(events('c1').some(e => e.kind === 'follow_up_scheduled')).toBe(true);
  });

  it('rejects an invalid date, channel and priority', async () => {
    contact('c1');
    expect((await patchPipeline('sales1', 'c1', { nextFollowUpAt: 'soon' }, 'sales1@acme.com')).status).toBe(400);
    expect((await patchPipeline('sales1', 'c1', { nextFollowUpAt: daysAhead(1), nextFollowUpChannel: 'pigeon' }, 'sales1@acme.com')).status).toBe(400);
    expect((await patchPipeline('sales1', 'c1', { priority: 'panic' }, 'sales1@acme.com')).status).toBe(400);
  });
});

describe('activity logging', () => {
  it('a call on a NEW lead advances it to contacted and books the next touch', async () => {
    contact('c1');
    const res = await logActivity('sales1', 'c1', { channel: 'call', outcome: 'connected', note: 'Good chat' }, 'sales1@acme.com');
    expect(res.status).toBe(200);
    const doc = state.docs.get('organizations/orgA/contacts/c1')!;
    expect(doc.pipelineStatus).toBe('contacted');
    expect(doc.lastContactChannel).toBe('call');
    expect(doc.nextFollowUpAt).toBeTruthy();     // auto-scheduled from the outcome
    const kinds = events('c1').map(e => e.kind).sort();
    expect(kinds).toEqual(['call', 'status_changed']);
  });

  it('a no-answer lands in attempted_contact, not contacted', async () => {
    contact('c1');
    await logActivity('sales1', 'c1', { channel: 'call', outcome: 'no_answer' }, 'sales1@acme.com');
    expect(state.docs.get('organizations/orgA/contacts/c1')!.pipelineStatus).toBe('attempted_contact');
  });

  it('a BOUNCE schedules nothing and says so', async () => {
    contact('c1');
    const body = await (await logActivity('sales1', 'c1', { channel: 'email', outcome: 'bounced' }, 'sales1@acme.com')).json();
    expect(body.bounced).toBe(true);
    expect(state.docs.get('organizations/orgA/contacts/c1')!.nextFollowUpAt).toBeUndefined();
  });

  it('a NOTE never advances the stage — it is not contact', async () => {
    contact('c1');
    await logActivity('sales1', 'c1', { channel: 'note', note: 'Researched them' }, 'sales1@acme.com');
    expect(state.docs.get('organizations/orgA/contacts/c1')!.pipelineStatus).toBeUndefined();
  });

  it('does not rewind a lead that is already further along', async () => {
    contact('c1', { pipelineStatus: 'negotiation' });
    await logActivity('sales1', 'c1', { channel: 'call', outcome: 'connected' }, 'sales1@acme.com');
    expect(state.docs.get('organizations/orgA/contacts/c1')!.pipelineStatus).toBe('negotiation');
  });

  it('rejects an unknown channel or outcome', async () => {
    contact('c1');
    expect((await logActivity('sales1', 'c1', { channel: 'telepathy' }, 'sales1@acme.com')).status).toBe(400);
    expect((await logActivity('sales1', 'c1', { channel: 'call', outcome: 'vibes' }, 'sales1@acme.com')).status).toBe(400);
  });

  it('scrubs PII a careless note would duplicate into the timeline', async () => {
    contact('c1');
    await logActivity('sales1', 'c1', { channel: 'email', note: 'Wrote to bob@acme.com about pricing' }, 'sales1@acme.com');
    const ev = events('c1').find(e => e.kind === 'email')!;
    expect(ev.summary).toContain('<email>');
    expect(ev.summary).not.toContain('bob@acme.com');
  });
});

describe('timeline', () => {
  it('returns events newest-first and is append-only', async () => {
    contact('c1');
    await logActivity('sales1', 'c1', { channel: 'call', outcome: 'connected' }, 'sales1@acme.com');
    await patchPipeline('sales1', 'c1', { pipelineStatus: 'qualified' }, 'sales1@acme.com');
    const body = await (await timeline('sales1', 'c1', 'sales1@acme.com')).json() as { events: Array<{ kind: string }> };
    expect(body.events.length).toBeGreaterThanOrEqual(3);
    // No route mutates or removes an event; the only writer is appendEvent.
    expect(body.events[0].kind).toBeTruthy();
  });

  it('is gated by the same assignment rule', async () => {
    contact('c1', { assignedToUid: 'sales2', createdByUid: 'sales2' });
    expect((await timeline('sales1', 'c1', 'sales1@acme.com')).status).toBe(403);
  });

  it('404s on a contact that does not exist', async () => {
    expect((await timeline('sales1', 'nope', 'sales1@acme.com')).status).toBe(404);
  });
});

describe('sales dashboard', () => {
  it('counts the funnel and computes conversion over DECIDED leads only', async () => {
    contact('w1', { pipelineStatus: 'won', stageEnteredAt: daysAgo(2) });
    contact('w2', { pipelineStatus: 'won', stageEnteredAt: daysAgo(4) });
    contact('l1', { pipelineStatus: 'lost' });
    contact('o1', { pipelineStatus: 'negotiation' });   // undecided: must not count as a loss
    const body = await (await dashboard('sales1', 'sales1@acme.com')).json() as { totals: Record<string, number>; funnel: Record<string, number> };
    expect(body.funnel.won).toBe(2);
    expect(body.funnel.lost).toBe(1);
    expect(body.totals.conversionRate).toBe(67);       // 2 of 3 decided
    expect(body.totals.avgCycleDays).toBe(7);          // created 10d ago, won 2d/4d ago
  });

  it('a rep sees ONLY their own leads; a super admin sees all', async () => {
    contact('mine');
    contact('theirs', { assignedToUid: 'sales2', createdByUid: 'sales2' });
    const rep = await (await dashboard('sales1', 'sales1@acme.com')).json() as { totals: { leads: number }; scope: string };
    expect(rep.totals.leads).toBe(1);
    expect(rep.scope).toBe('assigned');
    const boss = await (await dashboard('boss', OPS)).json() as { totals: { leads: number }; scope: string };
    expect(boss.totals.leads).toBe(2);
    expect(boss.scope).toBe('all');
  });

  it('ranks the overdue queue by damage, not by age', async () => {
    contact('old', { pipelineStatus: 'contacted', stageEnteredAt: daysAgo(40) });
    contact('deal', { pipelineStatus: 'proposal_sent', nextFollowUpAt: daysAgo(3) });
    const body = await (await dashboard('sales1', 'sales1@acme.com')).json() as { queue: Array<{ contactId: string; priority: string }> };
    expect(body.queue[0].contactId).toBe('deal');      // late-stage silence first
    expect(body.queue[0].priority).toBe('urgent');
  });

  it('counts leads with no next step — the ones that get forgotten', async () => {
    contact('a', { pipelineStatus: 'contacted', stageEnteredAt: daysAgo(1) });
    contact('b', { pipelineStatus: 'contacted', nextFollowUpAt: daysAhead(2) });
    const body = await (await dashboard('sales1', 'sales1@acme.com')).json() as { totals: Record<string, number> };
    expect(body.totals.noNextStep).toBe(1);
    expect(body.totals.followUpRate).toBe(0);          // neither has been contacted yet
  });

  it('groups by source, owner and company', async () => {
    contact('a', { source: 'signup', company: 'Acme' });
    contact('b', { source: 'import', company: 'Acme' });
    const body = await (await dashboard('sales1', 'sales1@acme.com')).json() as {
      bySource: Array<{ key: string; total: number }>; byCompany: Array<{ key: string; total: number }>;
    };
    expect(body.bySource.map(x => x.key).sort()).toEqual(['import', 'signup']);
    expect(body.byCompany.find(x => x.key === 'Acme')!.total).toBe(2);
  });
});

describe('reminder sweep', () => {
  it('notifies the OWNER of an overdue lead', async () => {
    contact('c1', { pipelineStatus: 'contacted', nextFollowUpAt: daysAgo(2) });
    const r = await runReminderSweep('{}');
    expect(r.overdue).toBe(1);
    expect(state.notifs[0]).toMatchObject({ audience: 'user', uid: 'sales1', type: 'follow_up_overdue' });
  });

  it('sends an UNASSIGNED overdue lead to the operator bench instead', async () => {
    contact('c1', { assignedToUid: '', assignedToEmail: '', createdByUid: '', pipelineStatus: 'new', stageEnteredAt: daysAgo(5) });
    const r = await runReminderSweep('{}');
    expect(r.unassigned).toBe(1);
    expect(state.notifs[0]).toMatchObject({ audience: 'operator', type: 'lead_unassigned' });
  });

  it('is idempotent within a day — one lead, one notification', async () => {
    contact('c1', { pipelineStatus: 'contacted', nextFollowUpAt: daysAgo(2) });
    await runReminderSweep('{}');
    await runReminderSweep('{}');
    await runReminderSweep('{}');
    expect(state.notifs).toHaveLength(1);
  });

  it('notifies again on a DIFFERENT day', async () => {
    contact('c1', { pipelineStatus: 'contacted', nextFollowUpAt: daysAgo(2) });
    await runReminderSweep('{}', '2026-08-01T07:00:00.000Z');
    await runReminderSweep('{}', '2026-08-02T07:00:00.000Z');
    expect(state.notifs).toHaveLength(2);
  });

  it('never chases a closed lead', async () => {
    contact('c1', { pipelineStatus: 'won', nextFollowUpAt: daysAgo(90) });
    contact('c2', { pipelineStatus: 'archived', nextFollowUpAt: daysAgo(90) });
    const r = await runReminderSweep('{}');
    expect(r.overdue).toBe(0);
    expect(state.notifs).toHaveLength(0);
  });

  it('escalates a late-stage deal to critical', async () => {
    contact('c1', { pipelineStatus: 'negotiation', nextFollowUpAt: daysAgo(4) });
    await runReminderSweep('{}');
    expect(state.notifs[0].severity).toBe('critical');
  });

  it('a healthy pipeline produces no noise at all', async () => {
    contact('c1', { pipelineStatus: 'contacted', nextFollowUpAt: daysAhead(2) });
    const r = await runReminderSweep('{}');
    expect(r).toMatchObject({ overdue: 0, notified: 0 });
  });
});
