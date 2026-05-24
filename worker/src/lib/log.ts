/**
 * Debug-gated logging for the worker.
 *
 * Verbose lines (orgId, uid, sessionId, subscriptionId, …) are useful in
 * development but become persistent noise in the Cloudflare tail in production.
 * `dlog` emits only when DEBUG_LOGGING === 'true' (unset in prod). Use plain
 * console.error / console.warn for real failures — those stay unconditional.
 */
export function dlog(env: Record<string, unknown> | undefined, ...args: unknown[]): void {
  if (env?.DEBUG_LOGGING === 'true') {
    console.log(...args);
  }
}
