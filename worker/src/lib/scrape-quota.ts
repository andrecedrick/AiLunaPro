/**
 * Scrape quota accounting (P2.1a).
 *
 * Counts runs from the EXISTING usage ledger rather than a dedicated counter
 * document. That choice matters:
 *
 *   - no second write path, so a counter cannot drift from the ledger;
 *   - a refunded run stops counting automatically, because the refund flips the
 *     usage row's status and only 'consumed' rows are counted;
 *   - no migration, no backfill, and the numbers are auditable in the same place
 *     the customer's usage history already lives.
 *
 * WHY THE QUERY IS SHAPED THIS WAY. The first version filtered on action, status
 * and a date range together. Firestore needs a COMPOSITE INDEX for two
 * equalities plus an inequality, none exists for `usage`, and production
 * answered 400 FAILED_PRECONDITION on every run — QUOTA_UNAVAILABLE, before a
 * single token or actor was spent.
 *
 * A single equality on `action` is served by Firestore's automatic single-field
 * index, so no index deployment is required. Status and the date windows are
 * applied in code. The row count is bounded by the caps themselves — at most 300
 * scrape rows per org per month — so reading them is cheap and exact.
 */

import { firestoreRunQuery } from './firestoreAdmin';
import { dayKey, monthKey } from './scrape-policy';

/** Usage rows live under the balance document. */
const USAGE_PARENT = (orgId: string) => `organizations/${orgId}/tokens/current`;

/** The action every scrape is billed under. */
export const SCRAPE_ACTION = 'enrichment.scrape';

/**
 * Hard read ceiling.
 *
 * Generous against any reachable count: the highest monthly cap is 300, so even
 * a year of maximum Enterprise usage is 3600 rows. Hitting this limit means the
 * result may be TRUNCATED, and a truncated count UNDERCOUNTS usage — which would
 * grant extra runs rather than deny them. That is the one failure direction this
 * module must never take, so a full page is treated as unusable rather than as
 * an answer.
 */
export const SCRAPE_USAGE_READ_LIMIT = 5000;

/** Raised when the count cannot be trusted. The caller must fail closed. */
export class QuotaUnavailableError extends Error {}

export interface ScrapeUsage {
  usedToday:     number;
  usedThisMonth: number;
}

/** Firestore REST returns typed values; `at` and `status` are strings. */
const str = (v: unknown): string => {
  const f = v as { stringValue?: unknown } | undefined;
  return typeof f?.stringValue === 'string' ? f.stringValue : '';
};

/**
 * Count consumed scrape runs in the current UTC day and month.
 *
 * Fail-CLOSED by contract: this function throws rather than returning a partial
 * or assumed count. A counting outage that resolved to "zero used" would uncap
 * Apify spend, which is precisely the exposure the quota exists to prevent.
 */
export async function countScrapeUsage(
  saJson: string,
  orgId: string,
  now: Date,
  limit: number = SCRAPE_USAGE_READ_LIMIT,
): Promise<ScrapeUsage> {
  // ONE equality filter — served by the automatic single-field index on
  // `action`. Adding status or a date range here would require a composite
  // index (see the header note).
  const rows = await firestoreRunQuery(saJson, {
    from: [{ collectionId: 'usage' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'action' },
        op: 'EQUAL',
        value: { stringValue: SCRAPE_ACTION },
      },
    },
    limit,
  }, USAGE_PARENT(orgId));

  // A full page means the result may be truncated, and a truncated count
  // undercounts — it would GRANT runs the org has already used.
  if (rows.length >= limit) {
    throw new QuotaUnavailableError(
      `scrape usage read hit the ${limit}-row ceiling for ${orgId}; the count would undercount`,
    );
  }

  const today = dayKey(now);
  const month = monthKey(now);

  let usedToday = 0;
  let usedThisMonth = 0;
  for (const row of rows) {
    // Only a settled charge counts. A refunded run must free its slot, and a row
    // in any other state was never a completed charge.
    if (str(row.fields?.status) !== 'consumed') continue;
    const at = str(row.fields?.at);
    if (!at.startsWith(month)) continue;
    usedThisMonth += 1;
    if (at.startsWith(today)) usedToday += 1;
  }

  return { usedToday, usedThisMonth };
}
