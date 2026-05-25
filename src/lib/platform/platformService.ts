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

export async function fetchIsPlatformAdmin(): Promise<boolean> {
  const apiUrl    = import.meta.env.VITE_API_URL;
  const authLayer = resolveLayer('auth');

  // Mock mode or no API URL → not a platform admin (fail-closed).
  if (authLayer === 'mock' || !apiUrl) return false;

  const token = await getIdToken();
  if (!token) return false;

  try {
    const res = await fetch(`${apiUrl}/api/platform/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { isPlatformAdmin?: boolean };
    return data.isPlatformAdmin === true;
  } catch {
    return false;
  }
}
