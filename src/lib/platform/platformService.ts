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

async function getIdToken(): Promise<string | null> {
  try {
    const { auth } = await import('../firebase-auth');
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
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
  const apiUrl    = import.meta.env.VITE_API_URL;
  const authLayer = resolveLayer('auth');

  // Mock mode or no API URL → not a platform admin (fail-closed).
  if (authLayer === 'mock' || !apiUrl) return { isPlatformAdmin: false, emailVerified: null };

  const token = await getIdToken();
  if (!token) return { isPlatformAdmin: false, emailVerified: null };

  try {
    const res = await fetch(`${apiUrl}/api/platform/me`, {
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
