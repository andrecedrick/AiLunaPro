import { describe, it, expect, vi, afterEach } from 'vitest';
import { sendTransactional } from '../../worker/src/lib/sequenzy';

/*
 * Live email failures were undiagnosable: the client returned the HTTP status only,
 * so a 401 (bad/rotated API key) and a 404 (unknown slug) were indistinguishable —
 * which is exactly why a total production email outage could hide behind a generic
 * "the email could not be sent". The provider's reason is now surfaced, PII-scrubbed.
 */

afterEach(() => vi.unstubAllGlobals());

const res = (status: number, body: string) => new Response(body, { status, headers: { 'Content-Type': 'application/json' } });

describe('sendTransactional — the failure reason must reach the caller, scrubbed', () => {
  it('401 (bad key) surfaces status AND the provider reason', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res(401, JSON.stringify({ error: 'Invalid API key' }))));
    const r = await sendTransactional('k', { to: 'c@x.com', slug: 'payment-confirmation', variables: {} });
    expect(r.ok).toBe(false);
    expect(r.error).toContain('HTTP 401');
    expect(r.error).toContain('Invalid API key');   // the distinguishing detail
  });

  it('404 (unknown slug) is distinguishable from 401', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res(404, JSON.stringify({ error: 'Transactional email not found' }))));
    const r = await sendTransactional('k', { to: 'c@x.com', slug: 'nope', variables: {} });
    expect(r.error).toContain('HTTP 404');
    expect(r.error).toContain('not found');
  });

  it('NEVER leaks a recipient address from the error body', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res(422, JSON.stringify({ message: 'Recipient client@acme.com is suppressed' }))));
    const r = await sendTransactional('k', { to: 'client@acme.com', slug: 's', variables: {} });
    expect(r.error).toContain('HTTP 422');
    expect(r.error).toContain('<email>');            // redacted
    expect(r.error).not.toContain('client@acme.com'); // PII never reaches logs/UI
  });

  it('a non-JSON body still yields the status without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>gateway timeout</html>', { status: 504 })));
    const r = await sendTransactional('k', { to: 'c@x.com', slug: 's', variables: {} });
    expect(r.ok).toBe(false);
    expect(r.error).toContain('HTTP 504');
  });

  it('a missing key is still reported without a network call', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    const r = await sendTransactional(undefined, { to: 'c@x.com', slug: 's', variables: {} });
    expect(r.error).toBe('SEQUENZY_API_KEY not configured');
    expect(f).not.toHaveBeenCalled();
  });

  it('a 2xx is still a clean success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res(200, JSON.stringify({ success: true }))));
    expect(await sendTransactional('k', { to: 'c@x.com', slug: 's', variables: {} })).toEqual({ ok: true });
  });
});
