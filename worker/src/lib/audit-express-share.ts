/**
 * Audit Express shareable PDF links (HMAC-signed, short-lived).
 *
 * A token is `base64url(payload).base64url(HMAC-SHA256(payload))` where payload
 * is `{ o: orgId, a: auditId, e: expSeconds }`. No PII: opaque ids + an expiry.
 * The HMAC secret is a worker secret (AUDIT_SHARE_SECRET) — never in code.
 *
 * Opening a valid link is a public READ of an already-generated, PII-scrubbed
 * PDF; minting a link is auth-gated and quota-counted (see the route).
 */

export interface SharePayload { orgId: string; auditId: string; exp: number }
export type ShareVerify =
  | { ok: true; payload: SharePayload }
  | { ok: false; code: 'SHARE_INVALID' | 'SHARE_EXPIRED' };

const b64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(pad + '==='.slice((pad.length + 3) % 4)), c => c.charCodeAt(0));
}

async function hmac(secret: string, msg: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return new Uint8Array(sig);
}

/** Constant-time comparison of two equal-length byte arrays. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Sign a share token. `ttlSeconds` from now (default 7 days). `nowSeconds` injectable for tests. */
export async function signShareToken(secret: string, orgId: string, auditId: string, ttlSeconds: number, nowSeconds: number): Promise<{ token: string; exp: number }> {
  const exp = nowSeconds + ttlSeconds;
  const body = b64url(new TextEncoder().encode(JSON.stringify({ o: orgId, a: auditId, e: exp })));
  const sig = b64url(await hmac(secret, body));
  return { token: `${body}.${sig}`, exp };
}

/** Verify a share token: signature first (constant-time), then expiry. */
export async function verifyShareToken(secret: string, token: string, nowSeconds: number): Promise<ShareVerify> {
  const parts = typeof token === 'string' ? token.split('.') : [];
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, code: 'SHARE_INVALID' };
  const [body, sig] = parts;

  let expected: Uint8Array;
  try { expected = await hmac(secret, body); } catch { return { ok: false, code: 'SHARE_INVALID' }; }
  let provided: Uint8Array;
  try { provided = b64urlToBytes(sig); } catch { return { ok: false, code: 'SHARE_INVALID' }; }
  if (!timingSafeEqual(expected, provided)) return { ok: false, code: 'SHARE_INVALID' };

  let parsed: { o?: unknown; a?: unknown; e?: unknown };
  try { parsed = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))); } catch { return { ok: false, code: 'SHARE_INVALID' }; }
  const orgId = typeof parsed.o === 'string' ? parsed.o : '';
  const auditId = typeof parsed.a === 'string' ? parsed.a : '';
  const exp = typeof parsed.e === 'number' ? parsed.e : 0;
  if (!orgId || !auditId || !exp) return { ok: false, code: 'SHARE_INVALID' };
  if (exp <= nowSeconds) return { ok: false, code: 'SHARE_EXPIRED' };

  return { ok: true, payload: { orgId, auditId, exp } };
}
