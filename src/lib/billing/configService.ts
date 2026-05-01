/**
 * Frontend service for billing config-status (Phase I.5).
 *
 * Fetches GET /api/billing/config-status from the worker.
 * Falls back to a zero-config mock response when:
 *   - VITE_API_URL is not set, OR
 *   - auth layer is mock (no real Firebase ID token to send)
 *
 * No secret values are ever stored client-side.
 */

import type { BillingConfigStatus } from '../../types/billingConfig';
import { resolveLayer } from '../featureFlags';

const EMPTY_STATUS: BillingConfigStatus = {
  mode: 'unset',
  publishableKey: { configured: false, last4: null },
  secretKey:      { configured: false },
  webhookSecret:  { configured: false },
  priceIds: {
    starter:      { configured: false, last4: null },
    professional: { configured: false, last4: null },
    enterprise:   { configured: false, last4: null },
  },
  webhook: {
    lastEventId:        null,
    lastEventTimestamp: null,
    lastVerified:       null,
    lastError:          null,
  },
};

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

export async function fetchBillingConfigStatus(): Promise<BillingConfigStatus> {
  const apiUrl    = import.meta.env.VITE_API_URL;
  const authLayer = resolveLayer('auth');

  // Mock mode or no API URL → return empty status (UI shows "not configured" everywhere)
  if (authLayer === 'mock' || !apiUrl) {
    return EMPTY_STATUS;
  }

  const token = await getIdToken();
  if (!token) return EMPTY_STATUS;

  const res = await fetch(`${apiUrl}/api/billing/config-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`config-status request failed: ${res.status}`);
  }

  return (await res.json()) as BillingConfigStatus;
}
