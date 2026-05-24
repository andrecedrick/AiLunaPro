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
