/**
 * Frontend service for the operator ops-status (J7 Batch 2).
 *
 * Calls GET /api/platform/ops-status (platform-admin gated). Returns booleans
 * only — never secret values. Fail-closed: mock auth / no token / error / 403
 * → null (caller treats as "unavailable", surfaces nothing sensitive).
 */

import { resolveLayer } from '../featureFlags';
import { WORKER_BASE } from '../billing/stripeClient';

export interface OpsStatus {
  appEnv: string;
  stripeMode: 'test' | 'live' | 'unset';
  secrets: {
    stripeSecretKey: boolean;
    stripeWebhookSecret: boolean;
    firebaseServiceAccount: boolean;
    turnstileSecret: boolean;
    sequenzyApiKey: boolean;
    platformAdminEmails: boolean;
    tokenPriceStarter: boolean;
    tokenPricePro: boolean;
    tokenPriceMax: boolean;
    appBaseUrl: boolean;
  };
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

export async function fetchOpsStatus(): Promise<OpsStatus | null> {
  if (resolveLayer('auth') === 'mock') return null;
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/ops-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null; // 403 for non-admins, etc.
    return (await res.json()) as OpsStatus;
  } catch {
    return null;
  }
}
