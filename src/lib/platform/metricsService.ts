/**
 * Frontend service for platform metrics (J8 Batch 2).
 *
 * Calls GET /api/platform/metrics (platform-admin gated). Returns aggregates
 * only — never PII, IDs, or secret values. Fail-closed: mock auth / no token /
 * error / 403 → null (caller renders "unavailable" message, no fabrication).
 */

import { resolveLayer } from '../featureFlags';
import { WORKER_BASE } from '../billing/stripeClient';

export interface PlatformMetrics {
  mrrCents: number;
  activeSubscriptions: number;
  recentInvoices: {
    total: number;
    paid: number;
    open: number;
    uncollectible: number;
    void: number;
    lastEventAt: number | null;
  };
  tokenActiveOrgsCount: number;
  stripeUnavailable: boolean;
  generatedAt: number;
}

async function getIdToken(): Promise<string | null> {
  try {
    const { auth } = await import('../firebase-auth');
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(true);
  } catch {
    return null;
  }
}

export async function fetchPlatformMetrics(): Promise<PlatformMetrics | null> {
  if (resolveLayer('auth') === 'mock') return null;
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null; // 403 non-admin, 5xx, etc.
    return (await res.json()) as PlatformMetrics;
  } catch {
    return null;
  }
}
