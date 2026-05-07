/**
 * Token balance + consume + cycle reset — Phase J1.4A.
 *
 * Paths (corrected):
 *   organizations/{orgId}/tokens/current
 *   organizations/{orgId}/tokens/current/usage/{eventId}
 *   organizations/{orgId}/tokens/current/topups/{stripeSessionId}
 *
 * All writes go through the worker (service account bypasses Firestore rules).
 * Optimistic concurrency via firestoreSetIfMatch (currentDocument.updateTime).
 */

import {
  firestoreGet,
  firestoreSet,
  firestoreGetWithMeta,
  firestoreSetIfMatch,
  firestoreCreateIfNotExists,
} from './firestoreAdmin';
import {
  TOKEN_COSTS,
  CYCLE_DAYS,
  allocationForPlan,
  type TokenAction,
} from './token-costs';

interface TokenBalance {
  balance:           number;
  monthlyAllocation: number;
  consumed:          number;
  rollover:          number;
  topupTotal:        number;
  lastReset:         string;
  cycleEnd:          string;
  updatedAt:         string;
}

const BALANCE_PATH = (orgId: string) => `organizations/${orgId}/tokens/current`;

const cycleEndFromNow = (): string =>
  new Date(Date.now() + CYCLE_DAYS * 24 * 60 * 60 * 1000).toISOString();

/**
 * Defensive numeric coercion. Firestore REST returns integerValue as string;
 * the decoder now converts back to Number, but this guards against any future
 * regression or Firestore docs that historically stored stringified numbers.
 */
function toNum(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/** Force every numeric field on a balance object to be a JS Number. */
function normalizeBalance(raw: unknown): TokenBalance {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    balance:           toNum(r.balance),
    monthlyAllocation: toNum(r.monthlyAllocation),
    consumed:          toNum(r.consumed),
    rollover:          toNum(r.rollover),
    topupTotal:        toNum(r.topupTotal),
    lastReset:         typeof r.lastReset === 'string' ? r.lastReset : '',
    cycleEnd:          typeof r.cycleEnd  === 'string' ? r.cycleEnd  : '',
    updatedAt:         typeof r.updatedAt === 'string' ? r.updatedAt : '',
  };
}

/* ── Bootstrap ──────────────────────────────────────────── */

export async function initBalance(saJson: string, orgId: string, allocation: number): Promise<TokenBalance> {
  const now = new Date().toISOString();
  const balance: TokenBalance = {
    balance:           allocation,
    monthlyAllocation: allocation,
    consumed:          0,
    rollover:          0,
    topupTotal:        0,
    lastReset:         now,
    cycleEnd:          cycleEndFromNow(),
    updatedAt:         now,
  };
  await firestoreSet(saJson, BALANCE_PATH(orgId), { ...balance });
  return balance;
}

/* ── Cycle reset (on-read) ──────────────────────────────── */

export async function ensureTokenCycleFresh(saJson: string, orgId: string, fallbackAllocation = 100): Promise<TokenBalance> {
  const meta = await firestoreGetWithMeta(saJson, BALANCE_PATH(orgId));
  if (!meta) {
    return initBalance(saJson, orgId, fallbackAllocation);
  }
  const data = normalizeBalance(meta.data);
  const now  = Date.now();

  if (Date.parse(data.cycleEnd) < now) {
    // Cycle expired → roll-over (capped at 1× allocation)
    const allocation = toNum(data.monthlyAllocation, fallbackAllocation);
    const rollover   = Math.min(toNum(data.balance), allocation);
    const fresh: TokenBalance = {
      balance:           allocation + rollover,
      monthlyAllocation: allocation,
      consumed:          0,
      rollover,
      topupTotal:        toNum(data.topupTotal),
      lastReset:         new Date(now).toISOString(),
      cycleEnd:          cycleEndFromNow(),
      updatedAt:         new Date(now).toISOString(),
    };
    try {
      await firestoreSetIfMatch(saJson, BALANCE_PATH(orgId), { ...fresh }, meta.updateTime);
    } catch (err) {
      if (err instanceof Error && err.message === 'PRECONDITION_FAILED') {
        // Concurrent reset; re-read and return whatever's there
        const re = await firestoreGet(saJson, BALANCE_PATH(orgId));
        return re ? normalizeBalance(re) : fresh;
      }
      throw err;
    }
    return fresh;
  }
  return data;
}

/* ── Sync allocation on subscription change ─────────────── */

export async function syncBalanceAllocation(saJson: string, orgId: string, plan: string | null | undefined): Promise<void> {
  const allocation = allocationForPlan(plan);
  const meta = await firestoreGetWithMeta(saJson, BALANCE_PATH(orgId));
  if (!meta) {
    await initBalance(saJson, orgId, allocation);
    return;
  }
  // Update monthlyAllocation only — balance + consumed kept until next cycle reset
  await firestoreSet(saJson, BALANCE_PATH(orgId), {
    monthlyAllocation: allocation,
    updatedAt:         new Date().toISOString(),
  }, { merge: true });
}

/* ── Increment balance (top-up) ─────────────────────────── */

export async function incrementBalance(
  saJson: string,
  orgId: string,
  amount: number,
): Promise<{ balanceAfter: number }> {
  const add = toNum(amount);
  if (!Number.isFinite(add) || add <= 0) {
    throw new Error(`incrementBalance: invalid amount ${String(amount)}`);
  }
  const MAX_RETRY = 3;
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    const meta = await firestoreGetWithMeta(saJson, BALANCE_PATH(orgId));
    if (!meta) {
      // bootstrap with default; topup adds on top
      const init = await initBalance(saJson, orgId, 100);
      const initBal   = toNum(init.balance);
      const newBal    = initBal + add;
      const newTopup  = add;
      await firestoreSet(saJson, BALANCE_PATH(orgId), {
        balance:    newBal,
        topupTotal: newTopup,
        updatedAt:  new Date().toISOString(),
      }, { merge: true });
      return { balanceAfter: newBal };
    }
    const data       = normalizeBalance(meta.data);
    const newBalance = data.balance + add;
    const newTopup   = data.topupTotal + add;
    try {
      await firestoreSetIfMatch(saJson, BALANCE_PATH(orgId), {
        balance:    newBalance,
        topupTotal: newTopup,
        updatedAt:  new Date().toISOString(),
      }, meta.updateTime, { merge: true });
      return { balanceAfter: newBalance };
    } catch (err) {
      if (err instanceof Error && err.message === 'PRECONDITION_FAILED') continue;
      throw err;
    }
  }
  throw new Error('incrementBalance: optimistic concurrency exhausted');
}

/* ── Consume tokens (internal helper) ───────────────────── */

export interface ConsumeOk    { ok: true;  balanceAfter: number; tokensConsumed: number; }
export interface ConsumeFail  { ok: false; status: 402; balance: number; required: number; }
export type ConsumeResult = ConsumeOk | ConsumeFail;

export async function consumeTokens(
  saJson: string,
  orgId: string,
  action: TokenAction,
  uid: string,
  eventId: string,
  metadata: Record<string, unknown> = {},
): Promise<ConsumeResult> {
  const required = TOKEN_COSTS[action];
  const usagePath = `${BALANCE_PATH(orgId)}/usage/${eventId}`;

  // Idempotency: try to create usage doc first; if already exists, return current balance
  try {
    await firestoreCreateIfNotExists(saJson, usagePath, {
      eventId,
      module:   action.split('.')[0] ?? 'unknown',
      action,
      tokens:   required,
      uid,
      status:   'consumed',
      metadata: JSON.stringify(metadata),
      at:       new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'ALREADY_EXISTS') {
      // Already consumed; return current balance
      const fresh = await ensureTokenCycleFresh(saJson, orgId);
      return { ok: true, balanceAfter: fresh.balance, tokensConsumed: 0 };
    }
    throw err;
  }

  // Decrement with optimistic concurrency
  const MAX_RETRY = 3;
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    const fresh = await ensureTokenCycleFresh(saJson, orgId);
    if (fresh.balance < required) {
      // Mark usage event as failed (best-effort)
      try {
        await firestoreSet(saJson, usagePath, { status: 'failed' }, { merge: true });
      } catch { /* ignore */ }
      return { ok: false, status: 402, balance: fresh.balance, required };
    }
    const meta = await firestoreGetWithMeta(saJson, BALANCE_PATH(orgId));
    if (!meta) continue;
    const data        = normalizeBalance(meta.data);
    const newBalance  = data.balance - required;
    const newConsumed = data.consumed + required;
    try {
      await firestoreSetIfMatch(saJson, BALANCE_PATH(orgId), {
        balance:   newBalance,
        consumed:  newConsumed,
        updatedAt: new Date().toISOString(),
      }, meta.updateTime, { merge: true });
      return { ok: true, balanceAfter: newBalance, tokensConsumed: required };
    } catch (err) {
      if (err instanceof Error && err.message === 'PRECONDITION_FAILED') continue;
      throw err;
    }
  }
  throw new Error('consumeTokens: optimistic concurrency exhausted');
}
