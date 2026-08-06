/**
 * Scrape quota accounting (P2.1a).
 *
 * Counts runs from the EXISTING usage ledger rather than a dedicated counter
 * document. That choice matters:
 *
 *   - no second write path, so a counter cannot drift from the ledger;
 *   - a refunded run stops counting automatically, because the refund flips the
 *     usage row's status and the query only counts consumed rows;
 *   - no migration, no backfill, and the numbers are auditable in the same place
 *     the customer's usage history already lives.
 *
 * The cost is one indexed query per run. That is cheap next to an Apify call,
 * and the query is bounded by the cap itself — we only need to know whether the
 * count has reached a small number, never the exact total.
 */

import { firestoreRunQuery } from './firestoreAdmin';
import { dayKey, monthKey } from './scrape-policy';

/** Usage rows live under the balance document. */
const USAGE_PARENT = (orgId: string) => `organizations/${orgId}/tokens/current`;

/** The action every scrape is billed under. */
export const SCRAPE_ACTION = 'enrichment.scrape';

export interface ScrapeUsage {
  usedToday:     number;
  usedThisMonth: number;
}

/**
 * Count consumed scrape runs in the current UTC day and month.
 *
 * `limit` bounds the read: we never need more than the largest cap plus one to
 * decide, so a workspace with thousands of historical runs does not pay for
 * reading them. The month query is the wider of the two and subsumes the day, so
 * one query answers both.
 *
 * Fail-CLOSED is deliberate on the caller's side: a thrown error must not be
 * turned into "zero used", because that would let a counting outage uncap Apify
 * spend. This function therefore propagates errors rather than defaulting.
 */
export async function countScrapeUsage(
  saJson: string,
  orgId: string,
  now: Date,
  limit = 512,
): Promise<ScrapeUsage> {
  const monthStart = `${monthKey(now)}-01T00:00:00.000Z`;
  const today      = dayKey(now);

  const rows = await firestoreRunQuery(saJson, {
    from: [{ collectionId: 'usage' }],
    where: {
      compositeFilter: {
        op: 'AND',
        filters: [
          { fieldFilter: { field: { fieldPath: 'action' }, op: 'EQUAL', value: { stringValue: SCRAPE_ACTION } } },
          { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'consumed' } } },
          { fieldFilter: { field: { fieldPath: 'at' },     op: 'GREATER_THAN_OR_EQUAL', value: { stringValue: monthStart } } },
        ],
      },
    },
    limit,
  }, USAGE_PARENT(orgId));

  let usedToday = 0;
  for (const row of rows) {
    const at = row.fields?.at as { stringValue?: string } | undefined;
    if (typeof at?.stringValue === 'string' && at.stringValue.startsWith(today)) usedToday += 1;
  }

  return { usedToday, usedThisMonth: rows.length };
}
