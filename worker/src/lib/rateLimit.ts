/**
 * Lightweight per-IP cooldown for unauthenticated public endpoints.
 *
 * Turnstile blocks bots but does NOT throttle a human (or solved-token script)
 * spamming the lead funnel. This adds a Firestore-backed cooldown keyed by a
 * hash of the client IP, so a given IP can submit at most once per window.
 *
 * Storage: /public_rate_limits/{bucket}__{ipHash}. Worker service account only
 * (Firestore rules default-deny for clients). Not a substitute for a
 * Cloudflare WAF rate-limiting rule at scale, but closes the zero-cost spam
 * hole for J2.
 */

import { firestoreGetWithMeta, firestoreSet } from './firestoreAdmin';

async function hashIp(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface CooldownResult {
  ok: boolean;
  retryAfterSec?: number;
}

/**
 * Returns ok:false if `remoteIp` submitted within `cooldownMs`. On ok:true it
 * records the submission time. When `remoteIp` is undefined (no CF header), the
 * check is skipped (ok:true) — we cannot key without an IP.
 */
export async function checkCooldown(
  saJson: string,
  bucket: string,
  remoteIp: string | undefined,
  cooldownMs: number,
): Promise<CooldownResult> {
  if (!remoteIp) return { ok: true };

  let key: string;
  try {
    key = await hashIp(remoteIp);
  } catch {
    return { ok: true }; // hashing failed — fail open, do not block legit users
  }

  const path = `public_rate_limits/${bucket}__${key}`;
  const now  = Date.now();

  try {
    const meta   = await firestoreGetWithMeta(saJson, path);
    const lastAt = typeof meta?.data?.lastAt === 'number' ? (meta.data.lastAt as number) : undefined;
    if (lastAt !== undefined && now - lastAt < cooldownMs) {
      return { ok: false, retryAfterSec: Math.ceil((cooldownMs - (now - lastAt)) / 1000) };
    }
    await firestoreSet(saJson, path, {
      lastAt:    now,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { ok: true };
  } catch (err) {
    // Fail open on infra error — never block legitimate submissions because the
    // rate-limit store hiccuped.
    console.warn('[rateLimit] check failed, allowing:', err);
    return { ok: true };
  }
}

/**
 * Per-key daily counter — a hard ceiling on usage of a metered action (e.g. a
 * paid-API call) per user per calendar day (UTC). Complements checkCooldown
 * (which bounds rate but not total). Read-modify-write, so a tiny overcount is
 * possible under heavy concurrency — acceptable for a cost cap. Fails open.
 *
 * Stores `public_rate_limits/{bucket}__{hash(key)}` = { day, count }.
 */
export async function checkDailyCap(
  saJson: string,
  bucket: string,
  key: string,
  cap: number,
): Promise<{ ok: boolean; remaining?: number }> {
  let h: string;
  try { h = await hashIp(key); } catch { return { ok: true }; }

  const day  = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const path = `public_rate_limits/${bucket}__${h}`;

  try {
    const meta = await firestoreGetWithMeta(saJson, path);
    const d    = meta?.data as { day?: string; count?: number } | undefined;
    const count = (d?.day === day && typeof d.count === 'number') ? d.count : 0;
    if (count >= cap) return { ok: false, remaining: 0 };
    await firestoreSet(saJson, path, {
      day, count: count + 1, updatedAt: new Date().toISOString(),
    }, { merge: false });
    return { ok: true, remaining: cap - count - 1 };
  } catch (err) {
    console.warn('[rateLimit] daily-cap check failed, allowing:', err);
    return { ok: true };
  }
}

/**
 * Read-only today's count for a key (UTC day). Returns 0 on a new day, missing
 * doc, or any error (fail-generous — the caller treats it as "still has free
 * quota"). Pair with incrDailyCount to commit only after the metered action
 * actually succeeds (so failed/fallback calls never consume the free quota).
 */
export async function getDailyCount(saJson: string, bucket: string, key: string): Promise<number> {
  let h: string;
  try { h = await hashIp(key); } catch { return 0; }
  const day = new Date().toISOString().slice(0, 10);
  try {
    const meta = await firestoreGetWithMeta(saJson, `public_rate_limits/${bucket}__${h}`);
    const d = meta?.data as { day?: string; count?: number } | undefined;
    return (d?.day === day && typeof d.count === 'number') ? d.count : 0;
  } catch (err) {
    console.warn('[rateLimit] getDailyCount failed, returning 0:', err);
    return 0;
  }
}

/** Increment today's count for a key by 1 (best-effort; resets on a new day). */
export async function incrDailyCount(saJson: string, bucket: string, key: string): Promise<void> {
  let h: string;
  try { h = await hashIp(key); } catch { return; }
  const day  = new Date().toISOString().slice(0, 10);
  const path = `public_rate_limits/${bucket}__${h}`;
  try {
    const meta = await firestoreGetWithMeta(saJson, path);
    const d = meta?.data as { day?: string; count?: number } | undefined;
    const count = (d?.day === day && typeof d.count === 'number') ? d.count : 0;
    await firestoreSet(saJson, path, { day, count: count + 1, updatedAt: new Date().toISOString() }, { merge: false });
  } catch (err) {
    console.warn('[rateLimit] incrDailyCount failed:', err);
  }
}
