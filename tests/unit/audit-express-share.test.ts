import { describe, it, expect } from 'vitest';
import { signShareToken, verifyShareToken } from '../../worker/src/lib/audit-express-share';

const SECRET = 'test-share-secret-0123456789';
const NOW = 1_700_000_000; // fixed clock (no Date.now in tests)

describe('audit-express share token', () => {
  it('signs and verifies a valid token incl. shareVersion (no PII)', async () => {
    const { token, exp } = await signShareToken(SECRET, 'orgA', 'audit1', 3, 3600, NOW);
    expect(exp).toBe(NOW + 3600);
    const v = await verifyShareToken(SECRET, token, NOW);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.payload.orgId).toBe('orgA');
      expect(v.payload.auditId).toBe('audit1');
      expect(v.payload.shareVersion).toBe(3);
    }
  });

  it('rejects a tampered payload (signature mismatch)', async () => {
    const { token } = await signShareToken(SECRET, 'orgA', 'audit1', 1, 3600, NOW);
    const [body, sig] = token.split('.');
    const bad = body.slice(0, -1) + (body.endsWith('A') ? 'B' : 'A');
    const v = await verifyShareToken(SECRET, `${bad}.${sig}`, NOW);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe('SHARE_INVALID');
  });

  it('rejects a token signed with a different secret', async () => {
    const { token } = await signShareToken(SECRET, 'orgA', 'audit1', 1, 3600, NOW);
    const v = await verifyShareToken('other-secret', token, NOW);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe('SHARE_INVALID');
  });

  it('rejects an expired token', async () => {
    const { token } = await signShareToken(SECRET, 'orgA', 'audit1', 1, 3600, NOW);
    const v = await verifyShareToken(SECRET, token, NOW + 3601);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.code).toBe('SHARE_EXPIRED');
  });

  it('legacy token without v defaults to shareVersion 1', async () => {
    const b64url = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const body = b64url(new TextEncoder().encode(JSON.stringify({ o: 'orgA', a: 'audit1', e: NOW + 3600 })));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))));
    const v = await verifyShareToken(SECRET, `${body}.${sig}`, NOW);
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.payload.shareVersion).toBe(1);
  });

  it('rejects malformed tokens', async () => {
    for (const t of ['', 'nodot', 'a.b.c', '.x', 'x.']) {
      const v = await verifyShareToken(SECRET, t, NOW);
      expect(v.ok).toBe(false);
    }
  });
});
