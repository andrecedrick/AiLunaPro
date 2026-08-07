import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * Scrape quota accounting (P2.1a).
 *
 * REGRESSION THIS FILE EXISTS FOR. The first version of the query filtered on
 * action, status and a date range together. Firestore needs a COMPOSITE INDEX
 * for two equalities plus an inequality, none exists for `usage`, and production
 * answered 400 FAILED_PRECONDITION on every run. No test caught it because the
 * Firestore layer is mocked — so the first test below asserts on the QUERY SHAPE
 * itself, which is the only thing a mock can prove about index requirements.
 *
 * The counting rules are asserted separately: an undercount would GRANT runs the
 * org has already used, which is the one direction this module must never fail.
 */

const query = vi.hoisted(() => ({ last: null as Record<string, unknown> | null, rows: [] as unknown[], throws: false }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async (_sa: string, q: Record<string, unknown>) => {
    query.last = q;
    if (query.throws) throw new Error('firestore down');
    return query.rows;
  }),
}));

import {
  countScrapeUsage, SCRAPE_ACTION, SCRAPE_USAGE_READ_LIMIT, QuotaUnavailableError,
} from '../../worker/src/lib/scrape-quota';

const NOW = new Date('2026-08-15T12:00:00.000Z');

/** A usage row as Firestore REST returns it. */
const row = (at: string, status = 'consumed') => ({
  name: 'x', fields: { at: { stringValue: at }, status: { stringValue: status } },
});

beforeEach(() => { query.last = null; query.rows = []; query.throws = false; });

describe('the query needs no composite index', () => {
  it('filters on ONE field only — action', async () => {
    // Two equalities plus an inequality would require a composite index that
    // does not exist, which is exactly what broke production.
    await countScrapeUsage('{}', 'orgA', NOW);
    const where = query.last!.where as Record<string, unknown>;
    expect(where.fieldFilter).toBeDefined();
    expect(where.compositeFilter).toBeUndefined();
    expect((where.fieldFilter as Record<string, unknown>).field).toEqual({ fieldPath: 'action' });
  });

  it('does not order by a second field, which would also need a composite index', async () => {
    await countScrapeUsage('{}', 'orgA', NOW);
    expect(query.last!.orderBy).toBeUndefined();
  });

  it('scopes the read to the org, so one workspace cannot see another', async () => {
    await countScrapeUsage('{}', 'orgA', NOW);
    expect(query.last!.from).toEqual([{ collectionId: 'usage' }]);
  });

  it('queries the scrape action', async () => {
    await countScrapeUsage('{}', 'orgA', NOW);
    const ff = (query.last!.where as { fieldFilter: { value: { stringValue: string } } }).fieldFilter;
    expect(ff.value.stringValue).toBe(SCRAPE_ACTION);
  });
});

describe('normal counting', () => {
  it('counts consumed rows in the current day and month', async () => {
    query.rows = [
      row('2026-08-15T08:00:00.000Z'),
      row('2026-08-15T09:30:00.000Z'),
      row('2026-08-14T23:59:59.999Z'),
    ];
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 2, usedThisMonth: 3 });
  });

  it('returns zeroes when the org has never scraped', async () => {
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 0, usedThisMonth: 0 });
  });
});

describe('refunded rows do not count', () => {
  it('frees the slot a refunded run occupied', async () => {
    query.rows = [
      row('2026-08-15T08:00:00.000Z', 'consumed'),
      row('2026-08-15T09:00:00.000Z', 'refunded'),
    ];
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 1, usedThisMonth: 1 });
  });

  it('ignores any status that is not a settled charge', async () => {
    query.rows = [row('2026-08-15T08:00:00.000Z', 'pending'), row('2026-08-15T08:05:00.000Z', '')];
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 0, usedThisMonth: 0 });
  });
});

describe('day boundaries are UTC', () => {
  it('excludes the last moment of yesterday from today', async () => {
    query.rows = [row('2026-08-14T23:59:59.999Z')];
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 0, usedThisMonth: 1 });
  });

  it('includes the first moment of today', async () => {
    query.rows = [row('2026-08-15T00:00:00.000Z')];
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 1, usedThisMonth: 1 });
  });

  it('excludes tomorrow', async () => {
    query.rows = [row('2026-08-16T00:00:00.000Z')];
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 0, usedThisMonth: 1 });
  });
});

describe('month boundaries are UTC', () => {
  it('excludes the previous month', async () => {
    query.rows = [row('2026-07-31T23:59:59.999Z'), row('2026-08-01T00:00:00.000Z')];
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 0, usedThisMonth: 1 });
  });

  it('excludes the next month', async () => {
    query.rows = [row('2026-09-01T00:00:00.000Z')];
    expect(await countScrapeUsage('{}', 'orgA', NOW)).toEqual({ usedToday: 0, usedThisMonth: 0 });
  });

  it('counts a whole month regardless of day', async () => {
    query.rows = ['01', '07', '15', '28'].map(d => row(`2026-08-${d}T10:00:00.000Z`));
    expect((await countScrapeUsage('{}', 'orgA', NOW)).usedThisMonth).toBe(4);
  });
});

describe('truncation guard', () => {
  it('throws rather than returning a count that may be truncated', async () => {
    // A truncated read UNDERCOUNTS, and an undercount grants runs the org has
    // already used. Refusing is the only safe direction.
    query.rows = new Array(10).fill(null).map(() => row('2026-08-15T08:00:00.000Z'));
    await expect(countScrapeUsage('{}', 'orgA', NOW, 10)).rejects.toThrow(QuotaUnavailableError);
  });

  it('accepts a page that is one row short of the ceiling', async () => {
    query.rows = new Array(9).fill(null).map(() => row('2026-08-15T08:00:00.000Z'));
    expect((await countScrapeUsage('{}', 'orgA', NOW, 10)).usedToday).toBe(9);
  });

  it('sends the ceiling to Firestore as the query limit', async () => {
    await countScrapeUsage('{}', 'orgA', NOW);
    expect(query.last!.limit).toBe(SCRAPE_USAGE_READ_LIMIT);
  });

  it('the default ceiling is far above any reachable count', async () => {
    // Highest monthly cap is 300, so a year of maximum Enterprise usage is 3600.
    expect(SCRAPE_USAGE_READ_LIMIT).toBeGreaterThan(3600);
  });
});

describe('fail-closed', () => {
  it('propagates a read failure instead of reporting zero usage', async () => {
    // Returning { usedToday: 0 } on an outage would uncap Apify spend.
    query.throws = true;
    await expect(countScrapeUsage('{}', 'orgA', NOW)).rejects.toThrow('firestore down');
  });
});
