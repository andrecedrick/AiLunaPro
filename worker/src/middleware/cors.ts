import type { Context, Next } from 'hono';

/**
 * CORS middleware.
 * Reads allowed origins from the ALLOWED_ORIGINS env var (comma-separated).
 * Falls back to localhost dev origins if not set.
 */
export function cors() {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const origin = c.req.header('Origin') ?? '';
    const allowed = (c.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
      .split(',')
      .map((o: string) => o.trim());

    const match = allowed.includes(origin) ? origin : allowed[0];

    c.header('Access-Control-Allow-Origin', match);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Max-Age', '86400');

    // Preflight
    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    await next();
  };
}
