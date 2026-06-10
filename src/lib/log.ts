/**
 * DEV-gated diagnostic logger (SPA twin of worker/src/lib/log.ts `dlog`).
 * Verbose flow diagnostics must go through this — never raw console.log —
 * so production bundles stay silent (no payloads/IDs in the user console).
 * console.error/warn in genuine error handlers remain allowed.
 */
export function dlog(...args: unknown[]): void {
  if (import.meta.env.DEV) console.log(...args);
}
