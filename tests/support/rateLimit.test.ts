import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * S2 (+ shared) — per-IP cooldown. Used by the support, feedback and diagnostic
 * public endpoints to throttle spam. Fails OPEN on infra error so a flaky
 * rate-limit store never blocks a legitimate submission.
 */

const { getMeta, setSpy } = vi.hoisted(() => ({
  getMeta: vi.fn(),
  setSpy: vi.fn(() => Promise.resolve()),
}));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGetWithMeta: getMeta,
  firestoreSet: setSpy,
}));

import { checkCooldown } from '../../worker/src/lib/rateLimit';

beforeEach(() => { vi.clearAllMocks(); });

describe('checkCooldown', () => {
  it('allows and records the first submission from an IP', async () => {
    getMeta.mockResolvedValue(null);
    const r = await checkCooldown('sa', 'support', '1.2.3.4', 15_000);
    expect(r.ok).toBe(true);
    expect(setSpy).toHaveBeenCalledTimes(1);
  });

  it('blocks a repeat within the cooldown window', async () => {
    getMeta.mockResolvedValue({ data: { lastAt: Date.now() } });
    const r = await checkCooldown('sa', 'support', '1.2.3.4', 15_000);
    expect(r.ok).toBe(false);
    expect(r.retryAfterSec).toBeGreaterThan(0);
    expect(setSpy).not.toHaveBeenCalled();
  });

  it('allows again once the window has elapsed', async () => {
    getMeta.mockResolvedValue({ data: { lastAt: Date.now() - 20_000 } });
    const r = await checkCooldown('sa', 'support', '1.2.3.4', 15_000);
    expect(r.ok).toBe(true);
    expect(setSpy).toHaveBeenCalledTimes(1);
  });

  it('skips the check when there is no client IP', async () => {
    const r = await checkCooldown('sa', 'support', undefined, 15_000);
    expect(r.ok).toBe(true);
    expect(getMeta).not.toHaveBeenCalled();
  });

  it('fails open on a store error (never blocks legit users)', async () => {
    getMeta.mockRejectedValue(new Error('firestore down'));
    const r = await checkCooldown('sa', 'support', '1.2.3.4', 15_000);
    expect(r.ok).toBe(true);
  });
});
