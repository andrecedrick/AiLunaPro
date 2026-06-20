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

import { checkCooldown, checkDailyCap, getDailyCount, incrDailyCount } from '../../worker/src/lib/rateLimit';

beforeEach(() => { vi.clearAllMocks(); });

const TODAY = new Date().toISOString().slice(0, 10);

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

describe('checkDailyCap', () => {
  it('allows + increments on the first call of the day', async () => {
    getMeta.mockResolvedValue(null);
    const r = await checkDailyCap('sa', 'luna_day', 'uid-1', 100);
    expect(r.ok).toBe(true);
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy.mock.calls[0][2]).toMatchObject({ day: TODAY, count: 1 });
  });

  it('allows while under the cap (same day)', async () => {
    getMeta.mockResolvedValue({ data: { day: TODAY, count: 41 } });
    const r = await checkDailyCap('sa', 'luna_day', 'uid-1', 100);
    expect(r.ok).toBe(true);
    expect(setSpy.mock.calls[0][2]).toMatchObject({ count: 42 });
  });

  it('blocks once the cap is reached (no further write)', async () => {
    getMeta.mockResolvedValue({ data: { day: TODAY, count: 100 } });
    const r = await checkDailyCap('sa', 'luna_day', 'uid-1', 100);
    expect(r.ok).toBe(false);
    expect(setSpy).not.toHaveBeenCalled();
  });

  it('resets the count on a new day', async () => {
    getMeta.mockResolvedValue({ data: { day: '2000-01-01', count: 999 } });
    const r = await checkDailyCap('sa', 'luna_day', 'uid-1', 100);
    expect(r.ok).toBe(true);
    expect(setSpy.mock.calls[0][2]).toMatchObject({ day: TODAY, count: 1 });
  });

  it('fails open on a store error', async () => {
    getMeta.mockRejectedValue(new Error('down'));
    const r = await checkDailyCap('sa', 'luna_day', 'uid-1', 100);
    expect(r.ok).toBe(true);
  });
});

describe('getDailyCount / incrDailyCount (free-quota split)', () => {
  it('reads today\'s count, 0 on a new day / missing / error', async () => {
    getMeta.mockResolvedValueOnce({ data: { day: TODAY, count: 2 } });
    expect(await getDailyCount('sa', 'luna_free', 'uid-1')).toBe(2);
    getMeta.mockResolvedValueOnce({ data: { day: '2000-01-01', count: 9 } });
    expect(await getDailyCount('sa', 'luna_free', 'uid-1')).toBe(0);
    getMeta.mockResolvedValueOnce(null);
    expect(await getDailyCount('sa', 'luna_free', 'uid-1')).toBe(0);
    getMeta.mockRejectedValueOnce(new Error('down'));
    expect(await getDailyCount('sa', 'luna_free', 'uid-1')).toBe(0);
  });

  it('increments today\'s count (resets on a new day)', async () => {
    getMeta.mockResolvedValueOnce({ data: { day: TODAY, count: 2 } });
    await incrDailyCount('sa', 'luna_free', 'uid-1');
    expect(setSpy.mock.calls[0][2]).toMatchObject({ day: TODAY, count: 3 });

    setSpy.mockClear();
    getMeta.mockResolvedValueOnce({ data: { day: '2000-01-01', count: 9 } });
    await incrDailyCount('sa', 'luna_free', 'uid-1');
    expect(setSpy.mock.calls[0][2]).toMatchObject({ day: TODAY, count: 1 });
  });
});
