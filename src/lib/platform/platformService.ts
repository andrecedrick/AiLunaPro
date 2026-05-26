/**
 * Frontend service for the platform-operator check (J5 Batch 3).
 *
 * Calls GET /api/platform/me and returns whether the current user is an
 * allowlisted platform operator. Fail-closed: mock auth, no API URL, no token,
 * or any error → false (operator surfaces stay hidden).
 *
 * Platform admins are NOT org members — this is independent of session.role.
 */

import { resolveLayer } from '../featureFlags';
import { WORKER_BASE } from '../billing/stripeClient';

async function getIdToken(): Promise<string | null> {
  try {
    const { auth } = await import('../firebase-auth');
    const user = auth.currentUser;
    if (!user) return null;
    // Force refresh: email_verified is baked into the ID token. After verifying
    // an email, the cached token still carries email_verified=false until it
    // expires (~1h). Force a refresh so the platform-admin check sees the
    // current claim without requiring a full sign-out/sign-in.
    return await user.getIdToken(true);
  } catch {
    return null;
  }
}

export interface PlatformMe {
  isPlatformAdmin: boolean;
  /** Caller's own verified-email state. null when unknown (mock/no token/error). */
  emailVerified: boolean | null;
}

export async function fetchPlatformMe(): Promise<PlatformMe> {
  const authLayer = resolveLayer('auth');

  // Mock auth → no real Firebase token → not a platform admin (fail-closed).
  // NOTE: base URL is WORKER_BASE (VITE_WORKER_URL), same as stripeClient.
  // In DEV it is '' (relative, proxied by Vite); in PROD it is the API origin.
  // Do NOT gate on truthiness of the base — '' is a valid relative base.
  if (authLayer === 'mock') return { isPlatformAdmin: false, emailVerified: null };

  const token = await getIdToken();
  if (!token) return { isPlatformAdmin: false, emailVerified: null };

  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { isPlatformAdmin: false, emailVerified: null };
    const data = (await res.json()) as { isPlatformAdmin?: boolean; emailVerified?: boolean };
    return {
      isPlatformAdmin: data.isPlatformAdmin === true,
      emailVerified: typeof data.emailVerified === 'boolean' ? data.emailVerified : null,
    };
  } catch {
    return { isPlatformAdmin: false, emailVerified: null };
  }
}

/** Back-compat boolean helper. */
export async function fetchIsPlatformAdmin(): Promise<boolean> {
  return (await fetchPlatformMe()).isPlatformAdmin;
}
