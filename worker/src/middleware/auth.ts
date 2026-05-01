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
    const projectId: string = c.env.FIREBASE_PROJECT_ID ?? 'audit-ai-cc9e2';

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
      await next();
    } catch {
      return c.json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }, 401);
    }
  };
}
