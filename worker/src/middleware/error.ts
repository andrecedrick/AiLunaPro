import type { Context, Next } from 'hono';

/**
 * Global error handler middleware.
 * Must be registered FIRST so it wraps all subsequent handlers.
 *
 * Catches any unhandled throw and returns a structured JSON error:
 *   { error: string, code: string }
 *
 * Never leaks stack traces or internal details to the client.
 */
export function errorHandler() {
  return async (c: Context, next: Next): Promise<Response | void> => {
    try {
      await next();
    } catch (err: unknown) {
      console.error('[worker] Unhandled error:', err);

      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';

      return c.json(
        { error: message, code: 'INTERNAL_SERVER_ERROR' },
        500,
      );
    }
  };
}
