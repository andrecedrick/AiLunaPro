/**
 * lazyWithRetry — wraps React.lazy with a single automatic retry on dynamic
 * import failure (the typical "Loading chunk failed" / "Failed to fetch
 * dynamically imported module" caused by an ad-blocker, transient network
 * flake, or stale-bundle race after a deploy).
 *
 * Behavior:
 *   - Tries the import once.
 *   - On rejection, waits a short backoff and tries ONCE more.
 *   - If the second attempt also fails, rejects with the original error so
 *     ErrorBoundary's chunk-aware branch shows the clear message.
 *
 * No code splitting changes — same React.lazy semantics + Suspense.
 */

import { lazy, type ComponentType } from 'react';

const RETRY_DELAY_MS = 600;

function isChunkError(err: unknown): boolean {
  const msg = (err as Error | undefined)?.message ?? '';
  return /dynamically imported module|Loading chunk .* failed|Importing a module script failed|Failed to fetch/i.test(
    msg,
  );
}

export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): ReturnType<typeof lazy<T>> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (!isChunkError(err)) throw err;
      // J13: reliability telemetry (no-op unless consent; no PII).
      void import('../analytics/track').then(m => m.track('chunk_load_failed')).catch(() => {});
      // Single retry with small backoff.
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      try {
        const mod = await factory();
        void import('../analytics/track').then(m => m.track('chunk_retry_recovered')).catch(() => {});
        return mod;
      } catch (err2) {
        void import('../analytics/track').then(m => m.track('chunk_retry_failed')).catch(() => {});
        throw err2;
      }
    }
  });
}
