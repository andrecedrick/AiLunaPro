/**
 * Monthly token-usage rollups — bounded-cost aggregation.
 *
 * WHY: the usage summary scanned up to 1000 raw usage docs and the platform view
 * up to 5000, so accuracy degraded and read cost grew with EVENT volume. A rollup
 * is a single doc per org per month that accumulates per-action counters as
 * events happen, so a summary is O(1) reads regardless of event count.
 *
 *   organizations/{orgId}/tokens/current/rollups/{YYYY-MM} = {
 *     month, actions: { 'luna.message': { count, tokens, free, included, overflow }, … }, updatedAt
 *   }
 *
 * The rollup is ADDITIVE: raw usage docs are still written (audit trail intact).
 * `bumpRollup` is BEST-EFFORT — a rollup failure must never affect a charge, so
 * callers swallow its errors. The summary/platform readers fall back to the raw
 * scan when a rollup doc is absent (pre-rollup data), so no historical usage is
 * lost during the transition.
 */

import { firestoreGetWithMeta, firestoreSet, firestoreSetIfMatch } from './firestoreAdmin';

export type UsageMode = 'free' | 'included' | 'overflow';

export interface ActionRollup {
  count:    number;
  tokens:   number;
  free:     number;
  included: number;
  overflow: number;
  /** Index signature: lets the rollup be written directly as a Firestore map. */
  [k: string]: number;
}

export interface MonthlyRollup {
  month:     string;
  actions:   Record<string, ActionRollup>;
  updatedAt: string;
}

/** organizations/{orgId}/tokens/current/rollups/{YYYY-MM} */
export function rollupPath(orgId: string, month: string): string {
  return `organizations/${orgId}/tokens/current/rollups/${month}`;
}

/** UTC month key YYYY-MM. */
export function rollupMonthKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

function emptyAction(): ActionRollup {
  return { count: 0, tokens: 0, free: 0, included: 0, overflow: 0 };
}

/**
 * Atomically fold one metered event into the current month's rollup.
 * Optimistic-concurrency retry loop (mirrors incrementBalance). Best-effort:
 * callers MUST treat a throw as non-fatal — the raw usage doc is the source of
 * truth; the rollup is a derived accelerator.
 */
export async function bumpRollup(
  saJson: string,
  orgId: string,
  action: string,
  mode: UsageMode,
  tokens: number,
  now: Date = new Date(),
): Promise<void> {
  const month = rollupMonthKey(now);
  const path  = rollupPath(orgId, month);

  const MAX_RETRY = 4;
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    const meta = await firestoreGetWithMeta(saJson, path);

    if (!meta) {
      // Seed the month doc with this single event.
      const actions: Record<string, ActionRollup> = {};
      const a = emptyAction();
      a.count = 1; a.tokens = tokens; a[mode] = 1;
      actions[action] = a;
      try {
        await firestoreSet(saJson, path, { month, actions, updatedAt: now.toISOString() });
        return;
      } catch {
        continue; // lost the create race → retry as an update
      }
    }

    const data = meta.data as unknown as MonthlyRollup;
    const actions = { ...(data.actions ?? {}) };
    const cur = { ...emptyAction(), ...(actions[action] ?? {}) };
    cur.count    += 1;
    cur.tokens   += tokens;
    cur[mode]    += 1;
    actions[action] = cur;

    try {
      await firestoreSetIfMatch(saJson, path, { month, actions, updatedAt: now.toISOString() }, meta.updateTime, { merge: true });
      return;
    } catch (err) {
      if (err instanceof Error && err.message === 'PRECONDITION_FAILED') continue; // concurrent bump → retry
      throw err;
    }
  }
  // Exhausted retries — surface so the caller can log; the charge is unaffected.
  throw new Error('bumpRollup: optimistic concurrency exhausted');
}
