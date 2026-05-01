/**
 * Pure helpers for masking and detecting Stripe key metadata.
 *
 * Used ONLY by the billing-config diagnostic endpoint. Never exposes raw values.
 *
 * - last4(key)     → last 4 chars of a non-empty string, else null.
 *                    Safe for publishable keys (designed for client exposure).
 *                    NEVER call this on STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.
 * - detectMode(pk) → 'test' | 'live' | 'unset' based on Stripe key prefix.
 */

export function last4(key: string | undefined | null): string | null {
  if (!key || typeof key !== 'string') return null;
  const trimmed = key.trim();
  if (trimmed.length < 4) return null;
  return trimmed.slice(-4);
}

export function detectMode(publishableKey: string | undefined | null): 'test' | 'live' | 'unset' {
  if (!publishableKey || typeof publishableKey !== 'string') return 'unset';
  if (publishableKey.startsWith('pk_test_')) return 'test';
  if (publishableKey.startsWith('pk_live_')) return 'live';
  return 'unset';
}

export function isConfigured(value: string | undefined | null): boolean {
  return Boolean(value && typeof value === 'string' && value.trim().length > 0);
}
