import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recoverIfStaleBundle } from '../../src/lib/routing/staleBundle';

/* Deploy-integrity: after a redeploy, an open tab requests old chunk URLs that
 * no longer exist. recoverIfStaleBundle compares the baked __BUILD_ID__ with
 * the server's /version.json: mismatch ⇒ ONE forced reload (convergent);
 * match/unreachable ⇒ false (caller shows the truthful error UI). */

const RUNNING_ID = 'running-build-id';

const reloadSpy = vi.fn();
Object.defineProperty(window, 'location', {
  value: { ...window.location, reload: reloadSpy },
  writable: true,
});

function mockVersion(body: unknown, ok = true) {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok, json: async () => body })));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('__BUILD_ID__', RUNNING_ID); // dev/test path: globalThis lookup
  try { sessionStorage.clear(); } catch { /* noop */ }
});

describe('recoverIfStaleBundle (deploy integrity)', () => {
  it('server has a NEWER build → forces one reload and resolves true', async () => {
    mockVersion({ buildId: 'newer-build-id' });
    expect(await recoverIfStaleBundle()).toBe(true);
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('same upgrade pair is attempted only once (no reload loop)', async () => {
    mockVersion({ buildId: 'newer-build-id' });
    expect(await recoverIfStaleBundle()).toBe(true);
    expect(await recoverIfStaleBundle()).toBe(false); // marker guards re-entry
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('server has the SAME build → not stale → false, no reload', async () => {
    mockVersion({ buildId: RUNNING_ID });
    expect(await recoverIfStaleBundle()).toBe(false);
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('version endpoint unreachable → false, no reload (genuine-failure path)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    expect(await recoverIfStaleBundle()).toBe(false);
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('non-OK version response → false, no reload', async () => {
    mockVersion(null, false);
    expect(await recoverIfStaleBundle()).toBe(false);
    expect(reloadSpy).not.toHaveBeenCalled();
  });
});
