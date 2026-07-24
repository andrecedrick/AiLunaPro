/**
 * Platform feedback + support visibility (read-only operator surfaces).
 *
 *   GET /api/platform/feedback   — public_feedback, newest first + signals
 *   GET /api/platform/support    — support_tickets, newest first
 *
 * Both are auth + platform-admin gated and STRICTLY READ-ONLY: nothing here
 * writes, resolves, or mutates a record.
 *
 * PII posture differs by collection, deliberately:
 *  - feedback is anonymous BY DESIGN (no uid / email / orgId is ever stored), so
 *    this route returns exactly what was captured: source, satisfaction,
 *    difficulty, blocker, suggestion, country, createdAt.
 *  - support tickets DO carry the submitter's email + phone. That contact detail
 *    IS the point of a ticket — an operator cannot answer without it — so it is
 *    returned to platform admins only. It is never logged and never leaves this
 *    gated surface.
 *
 * Customer Signals (§ aggregation) are computed here, deterministically: exact
 * string counting over normalised free text. NO LLM, no summarisation, no
 * inference — a "top blocker" is literally the most frequently submitted string.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreRunQuery } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const platformFeedback = new Hono<AppEnv>();

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 200;
/** How many entries each signal list returns. */
const TOP_N = 10;

/* ── Feedback ─────────────────────────────────────────── */

interface FeedbackRow {
  id:           string;
  source:       string;
  satisfaction: string;
  difficulty:   string;
  blocker:      string;
  suggestion:   string;
  country:      string;
  createdAt:    string;
}

function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

function mapFeedback(name: string, f: Record<string, unknown>): FeedbackRow {
  const cf = (f.cf ?? {}) as Record<string, unknown>;
  return {
    id:           name.split('/').pop() ?? '',
    source:       str(f.source),
    satisfaction: str(f.satisfaction),
    difficulty:   str(f.difficulty),
    blocker:      str(f.blocker),
    suggestion:   str(f.suggestion),
    country:      str(cf.country),
    createdAt:    str(f.createdAt),
  };
}

/**
 * Normalise free text for exact-match counting: lowercase, collapse whitespace,
 * strip trailing punctuation. Deterministic and lossless enough that two users
 * typing the same complaint land in the same bucket — no fuzzy matching, no NLP.
 */
function normalizeSignal(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/g, '').trim();
}

/** Count occurrences of a normalised string, keeping the first-seen original. */
function tally(values: string[]): Array<{ value: string; count: number }> {
  const counts = new Map<string, { value: string; count: number }>();
  for (const raw of values) {
    const key = normalizeSignal(raw);
    if (!key) continue;
    const cur = counts.get(key);
    if (cur) cur.count += 1;
    else counts.set(key, { value: raw.trim(), count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Satisfaction buckets — tolerant of both word and numeric encodings. */
function isPositive(s: string): boolean {
  const v = s.toLowerCase();
  return v === 'good' || v === 'positive' || v === 'yes' || v === '1' || v === '5' || v === '4';
}
function isNegative(s: string): boolean {
  const v = s.toLowerCase();
  return v === 'bad' || v === 'negative' || v === 'no' || v === '0' || v === '1_bad' || v === '2';
}

/** Difficulty → numeric, for an average. Non-numeric words map to a scale. */
function difficultyScore(d: string): number | null {
  const v = d.toLowerCase().trim();
  if (v === '') return null;
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  const map: Record<string, number> = { easy: 1, ok: 2, medium: 2, hard: 3, 'very hard': 4, blocked: 5 };
  return map[v] ?? null;
}

platformFeedback.get('/api/platform/feedback', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }
  const limit = Math.min(parseInt(c.req.query('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, MAX_LIMIT);

  try {
    const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      from:    [{ collectionId: 'public_feedback' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit,
    });
    const items = rows.map(r => mapFeedback(r.name, r.fields));

    const rated    = items.filter(i => i.satisfaction !== '');
    const positive = rated.filter(i => isPositive(i.satisfaction)).length;
    const negative = rated.filter(i => isNegative(i.satisfaction)).length;
    const diffs    = items.map(i => difficultyScore(i.difficulty)).filter((n): n is number => n !== null);
    const avgDifficulty = diffs.length ? Number((diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(2)) : null;

    return c.json({
      items,
      total:    items.length,
      rated:    rated.length,
      positive,
      negative,
      positivePct: rated.length ? Math.round((positive / rated.length) * 100) : 0,
      negativePct: rated.length ? Math.round((negative / rated.length) * 100) : 0,
      avgDifficulty,
      // Customer Signals — pure deterministic counting, no LLM.
      topBlockers:    tally(items.map(i => i.blocker)).slice(0, TOP_N),
      topSuggestions: tally(items.map(i => i.suggestion)).slice(0, TOP_N),
      topSources:     tally(items.map(i => i.source)).slice(0, TOP_N),
      capped:      rows.length === limit,
      generatedAt: Date.now(),
    });
  } catch (err) {
    // Collection never written → empty, not an error.
    console.warn('[platform-feedback] query failed:', err instanceof Error ? err.message : err);
    return c.json({
      items: [], total: 0, rated: 0, positive: 0, negative: 0, positivePct: 0, negativePct: 0,
      avgDifficulty: null, topBlockers: [], topSuggestions: [], topSources: [], capped: false, generatedAt: Date.now(),
    });
  }
});

/* ── Support tickets ──────────────────────────────────── */

interface TicketRow {
  id:          string;
  type:        string;
  status:      string;
  email:       string;
  phone:       string;
  page:        string;
  description: string;
  priority:    string;
  country:     string;
  createdAt:   string;
}

function mapTicket(name: string, f: Record<string, unknown>): TicketRow {
  const cf  = (f.cf ?? {}) as Record<string, unknown>;
  const ctx = (f.context ?? {}) as Record<string, unknown>;
  return {
    id:          name.split('/').pop() ?? '',
    type:        str(f.type),
    status:      str(f.status) || 'open',
    email:       str(f.email),
    phone:       str(f.phone),
    // `page` is the route captured in the ticket context at submit time.
    page:        str(ctx.route),
    description: str(f.description),
    priority:    str(f.priority),
    country:     str(cf.country),
    createdAt:   str(f.createdAt),
  };
}

platformFeedback.get('/api/platform/support', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }
  const limit = Math.min(parseInt(c.req.query('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, MAX_LIMIT);
  const statusFilter = c.req.query('status');

  try {
    const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      from:    [{ collectionId: 'support_tickets' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit,
    });
    let items = rows.map(r => mapTicket(r.name, r.fields));
    if (statusFilter) items = items.filter(t => t.status === statusFilter);

    return c.json({
      items,
      total:      items.length,
      open:       items.filter(t => t.status === 'open').length,
      byType:     tally(items.map(t => t.type)),
      // Most problematic pages — deterministic count of ticket origin routes.
      topPages:   tally(items.map(t => t.page)).slice(0, TOP_N),
      capped:      rows.length === limit,
      generatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('[platform-support] query failed:', err instanceof Error ? err.message : err);
    return c.json({ items: [], total: 0, open: 0, byType: [], topPages: [], capped: false, generatedAt: Date.now() });
  }
});

export default platformFeedback;
