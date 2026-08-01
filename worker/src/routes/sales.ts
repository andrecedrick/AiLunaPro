/**
 * Sales dashboard + commercial analytics.
 *
 *   GET /api/sales/dashboard?orgId=   metrics, funnel, analytics, follow-up queue
 *
 * Visibility follows the SAME assignment rule as the contacts list: a rep sees
 * their own numbers, a super admin sees everything. A dashboard that showed a rep
 * the whole org's pipeline would leak exactly what the assignment model exists to
 * separate, and a dashboard that showed a manager only their own leads would be
 * useless — so the scope is decided by the operator allowlist, not by role.
 *
 * Computed on read rather than stored as counters. At this data size one scan is
 * cheaper and always correct; incrementing counters on every stage change is how
 * dashboards drift from the records they claim to describe.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole, type Role } from '../middleware/requireRole';
import { isSuperAdmin } from '../lib/platformAdmin';
import { canViewContact } from '../lib/contact-access';
import { firestoreRunQuery } from '../lib/firestoreAdmin';
import {
  PIPELINE_STATUSES, pipelineFromLegacy, evaluateOverdue, overduePriority, isTerminal,
  type PipelineStatus, type Priority,
} from '../lib/pipeline';
import type { AppEnv } from '../index';

const sales = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const ORG_ROLES: readonly Role[] = ['owner', 'admin', 'member'];
const SCAN_CAP = 2000;
const QUEUE_MAX = 100;
const DAY = 24 * 60 * 60 * 1000;

interface Lead {
  contactId: string; orgId: string; name: string; company: string;
  source: string; owner: string; assignedToUid: string;
  stage: PipelineStatus; priority: Priority;
  createdAt: string; stageEnteredAt: string;
  nextFollowUpAt: string; nextFollowUpChannel: string;
  lastContactAt: string; lastContactChannel: string;
}

const s = (v: unknown): string => (typeof v === 'string' ? v : '');

sales.get('/api/sales/dashboard', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;
  const uid = c.get('uid') as string;
  const isSuper = isSuperAdmin(env, c.get('email'), c.get('emailVerified'));
  const nowIso = new Date().toISOString();
  const now = Date.parse(nowIso);

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = isSuper
      ? await firestoreRunQuery(saJson, { from: [{ collectionId: 'contacts', allDescendants: true }], limit: SCAN_CAP }, '')
      : await firestoreRunQuery(saJson, { from: [{ collectionId: 'contacts' }], limit: SCAN_CAP }, `organizations/${orgId}`);
  } catch (err) {
    console.error('[sales] scan failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load the pipeline.', code: 'QUERY_FAILED' }, 500);
  }

  const leads: Lead[] = rows.map(r => {
    const f = r.fields as Record<string, unknown>;
    const m = r.name.match(/organizations\/([^/]+)\/contacts\/([^/]+)$/);
    return {
      contactId: m ? m[2] : '', orgId: m ? m[1] : '',
      name: s(f.name), company: s(f.company), source: s(f.source) || 'unknown',
      owner: s(f.assignedToEmail) || s(f.owner), assignedToUid: s(f.assignedToUid),
      stage: pipelineFromLegacy(f.pipelineStatus, f.leadStatus, f.assignedToUid),
      priority: (['low', 'normal', 'high', 'urgent'] as const).includes(s(f.priority) as Priority)
        ? (s(f.priority) as Priority) : 'normal',
      createdAt: s(f.createdAt), stageEnteredAt: s(f.stageEnteredAt),
      nextFollowUpAt: s(f.nextFollowUpAt), nextFollowUpChannel: s(f.nextFollowUpChannel),
      lastContactAt: s(f.lastContactAt), lastContactChannel: s(f.lastContactChannel),
      // `createdByUid` is carried only for the visibility check below.
      ...(({ createdByUid: s(f.createdByUid) }) as object),
    } as Lead & { createdByUid: string };
  }).filter(l => l.contactId && canViewContact(
    { assignedToUid: l.assignedToUid, createdByUid: (l as Lead & { createdByUid: string }).createdByUid },
    uid, isSuper,
  ));

  // ── Funnel ──
  const byStage: Record<string, number> = {};
  for (const st of PIPELINE_STATUSES) byStage[st] = 0;
  for (const l of leads) byStage[l.stage]++;

  const won = byStage.won, lost = byStage.lost;
  const closed = won + lost;
  const open = leads.length - won - lost - byStage.archived;

  // ── Follow-up queue ──
  const queue: Array<Lead & { daysOverdue: number; hoursOverdue: number; reason: string; rank: Priority }> = [];
  let dueToday = 0, noNextStep = 0;
  for (const l of leads) {
    if (isTerminal(l.stage)) continue;
    if (!l.nextFollowUpAt) noNextStep++;
    else {
      const due = Date.parse(l.nextFollowUpAt);
      if (Number.isFinite(due) && due >= now && due - now < DAY) dueToday++;
    }
    const v = evaluateOverdue({
      pipelineStatus: l.stage, nextFollowUpAt: l.nextFollowUpAt,
      lastContactAt: l.lastContactAt, stageEnteredAt: l.stageEnteredAt || l.createdAt,
    }, nowIso);
    if (!v.overdue) continue;
    queue.push({
      ...l, daysOverdue: v.daysOverdue, hoursOverdue: v.hoursOverdue, reason: v.reason,
      rank: overduePriority(l.stage, v.daysOverdue, l.priority),
    });
  }
  const RANK: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
  // Ties broken on HOURS, not days: three leads all reporting "0d" were being
  // ordered arbitrarily when one of them was 23 hours later than another.
  queue.sort((a, b) => RANK[a.rank] - RANK[b.rank] || b.hoursOverdue - a.hoursOverdue);

  // ── Analytics ──
  const group = (key: (l: Lead) => string) => {
    const m = new Map<string, { total: number; won: number; lost: number }>();
    for (const l of leads) {
      const k = key(l) || 'unassigned';
      const e = m.get(k) ?? { total: 0, won: 0, lost: 0 };
      e.total++;
      if (l.stage === 'won') e.won++;
      if (l.stage === 'lost') e.lost++;
      m.set(k, e);
    }
    return [...m.entries()]
      .map(([k, v]) => ({
        key: k, ...v,
        // Conversion is won / DECIDED, not won / total: counting leads that have
        // not been worked yet as losses makes a healthy young pipeline look broken.
        conversionRate: v.won + v.lost > 0 ? Math.round((v.won / (v.won + v.lost)) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 25);
  };

  // Average sales cycle over WON deals only — the only ones with a real end date.
  const cycles = leads
    .filter(l => l.stage === 'won' && l.createdAt && l.stageEnteredAt)
    .map(l => Date.parse(l.stageEnteredAt) - Date.parse(l.createdAt))
    .filter(ms => Number.isFinite(ms) && ms >= 0);
  const avgCycleDays = cycles.length
    ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length / DAY) : 0;

  // Follow-up discipline: of the leads that have ever been contacted, how many
  // still have a next step booked. This is the number that predicts whether a
  // lead will be forgotten.
  const contacted = leads.filter(l => l.lastContactAt && !isTerminal(l.stage));
  const withNextStep = contacted.filter(l => l.nextFollowUpAt).length;
  const followUpRate = contacted.length ? Math.round((withNextStep / contacted.length) * 100) : 0;

  return c.json({
    ok: true,
    scope: isSuper ? 'all' : 'assigned',
    generatedAt: nowIso,
    totals: {
      leads: leads.length, open, won, lost, archived: byStage.archived,
      conversionRate: closed ? Math.round((won / closed) * 100) : 0,
      avgCycleDays, followUpRate,
      overdue: queue.length, dueToday, noNextStep,
    },
    funnel: byStage,
    bySource: group(l => l.source),
    byOwner:  group(l => l.owner),
    byCompany: group(l => l.company),
    byOrg: isSuper ? group(l => l.orgId) : [],
    // Names and companies only — no emails or phone numbers in a dashboard payload.
    queue: queue.slice(0, QUEUE_MAX).map(l => ({
      contactId: l.contactId, orgId: l.orgId, name: l.name, company: l.company,
      stage: l.stage, owner: l.owner, priority: l.rank,
      daysOverdue: l.daysOverdue, hoursOverdue: l.hoursOverdue, reason: l.reason,
      nextFollowUpAt: l.nextFollowUpAt, lastContactAt: l.lastContactAt,
    })),
    scanned: rows.length,
  });
});

export default sales;
