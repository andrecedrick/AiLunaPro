/**
 * lazyWithRetry — wraps React.lazy with automatic retries on dynamic import
 * failure (the typical "Loading chunk failed" / "Failed to fetch dynamically
 * imported module" caused by an ad-blocker, transient network flake, or
 * stale-bundle race after a deploy).
 *
 * Behavior:
 *   - Tries the import once.
 *   - On rejection, retries with growing backoff (600ms then 1800ms) so a
 *     short network blip has ~2.4s to clear.
 *   - If every attempt fails, rejects so ErrorBoundary's chunk-aware branch
 *     shows the clear message with a working Reload action.
 *
 * No code splitting changes — same React.lazy semantics + Suspense.
 */

import { lazy, type ComponentType } from 'react';
import { recoverIfStaleBundle } from './staleBundle';

const RETRY_DELAYS_MS = [600, 1800];

function isChunkError(err: unknown): boolean {
  const msg = (err as Error | undefined)?.message ?? '';
  return /dynamically imported module|Loading chunk .* failed|Importing a module script failed|Failed to fetch/i.test(
    msg,
  );
}

/**
 * A swallowed preload error (e.g. a `vite:preloadError` listener calling
 * preventDefault()) makes the dynamic import RESOLVE WITH UNDEFINED instead of
 * rejecting — React.lazy would then crash on `undefined.default`. Normalize
 * that case into a rejection so the retry/ErrorBoundary path handles it.
 * The message matches isChunkError() so the single retry engages.
 */
function ensureModule<M extends { default: unknown }>(mod: M | undefined): M {
  if (!mod || typeof mod !== 'object' || (mod as { default?: unknown }).default == null) {
    throw new Error('Failed to fetch dynamically imported module (resolved empty)');
  }
  return mod;
}

export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): ReturnType<typeof lazy<T>> {
  return lazy(async () => {
    try {
      return ensureModule(await factory());
    } catch (err) {
      if (!isChunkError(err)) throw err;
      // J13: reliability telemetry (no-op unless consent; no PII).
      void import('../analytics/track').then(m => m.track('chunk_load_failed')).catch(() => {});
      // Bounded retries with growing backoff.
      let lastErr: unknown = err;
      for (const delay of RETRY_DELAYS_MS) {
        await new Promise(res => setTimeout(res, delay));
        try {
          const mod = ensureModule(await factory());
          void import('../analytics/track').then(m => m.track('chunk_retry_recovered')).catch(() => {});
          return mod;
        } catch (err2) {
          lastErr = err2;
          if (!isChunkError(err2)) break;
        }
      }
      // All retries failed. If a NEWER deployment replaced this tab's chunks
      // (verified prod failure mode: redeploy + open tab → old chunk URL →
      // SPA-fallback HTML served as JS), auto-recover with a one-shot reload.
      // Suspend forever while the reload happens so no error UI flashes.
      if (await recoverIfStaleBundle()) {
        return new Promise<never>(() => { /* page is reloading */ });
      }
      void import('../analytics/track').then(m => m.track('chunk_retry_failed')).catch(() => {});
      throw lastErr;
    }
  });
}
