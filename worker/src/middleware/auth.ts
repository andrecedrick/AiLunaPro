import type { Context, Next } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Firebase ID token verification middleware.
 *
 * Verifies the Bearer token in Authorization header against Firebase's
 * public JWKS endpoint. Injects `uid` into Hono context variables.
 *
 * Does NOT extract orgId — orgId comes from Firestore, not from the token.
 * Phase G scope: uid-only context.
 *
 * Rejects with 401 if:
 *   - Authorization header is missing or malformed
 *   - Token is expired, tampered, wrong audience, or wrong issuer
 */

const FIREBASE_JWKS_URI =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// Cache the JWKS set for the lifetime of the Worker instance
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(FIREBASE_JWKS_URI));
  }
  return jwks;
}

export function requireAuth() {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or malformed Authorization header', code: 'UNAUTHORIZED' }, 401);
    }

    const token = authHeader.slice(7);
    // Fail-closed: never fall back to a hardcoded project ID. Prod sets
    // FIREBASE_PROJECT_ID via wrangler.toml [vars] + [env.production.vars];
    // a missing binding is a misconfiguration and must not silently verify
    // tokens against the wrong audience.
    const projectId = c.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      return c.json({ error: 'Server auth misconfigured', code: 'CONFIG_ERROR' }, 500);
    }

    try {
      const { payload } = await jwtVerify(token, getJwks(), {
        issuer:   `https://securetoken.google.com/${projectId}`,
        audience: projectId,
        algorithms: ['RS256'],
      });

      // sub = Firebase UID
      const uid = payload.sub;
      if (!uid) {
        return c.json({ error: 'Token missing subject claim', code: 'UNAUTHORIZED' }, 401);
      }

      c.set('uid', uid);
      // Email claims — used by the platform-operator allowlist (lib/platformAdmin).
      // Optional: not all auth methods carry an email; consumers must null-check.
      if (typeof payload.email === 'string') c.set('email', payload.email);
      c.set('emailVerified', payload.email_verified === true);
      await next();
    } catch {
      return c.json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }, 401);
    }
  };
}

/**
 * Verify a Firebase ID token and return the uid, or null if missing/invalid.
 * Reusable by routes that want to gate on auth with their own error code
 * (e.g. the PDF export route → AUTH_REQUIRED). Never throws.
 */
export async function verifyIdToken(token: string | undefined, projectId: string | undefined): Promise<string | null> {
  if (!token || !projectId) return null;
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer:   `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ['RS256'],
    });
    return typeof payload.sub === 'string' && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
