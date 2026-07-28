import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Notification refresh signal.
 *
 * The bell loads on mount and on filter change only (Topbar.tsx), so a demo
 * request submitted in the SAME session created an operator notification the user
 * could not see until a full page reload — the data was written, the UI was stale.
 *
 * These tests pin the one-shot signal that fixes it. It is explicitly NOT a poll:
 * nothing fires unless an action reports having created a notification.
 */

const fetchMock = vi.hoisted(() => vi.fn());
vi.stubGlobal('fetch', fetchMock);

vi.mock('../../src/lib/billing/stripeClient', () => ({ WORKER_BASE: 'https://api.test' }));
vi.mock('../../src/lib/team/teamApiClient', () => ({ getIdToken: vi.fn(async () => 'tok') }));

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

beforeEach(() => { fetchMock.mockReset(); vi.resetModules(); });

describe('notification refresh signal', () => {
  it('delivers the signal to every subscriber', async () => {
    const { subscribeNotificationRefresh, requestNotificationRefresh } = await import('../../src/lib/platform/platformService');
    const a = vi.fn(); const b = vi.fn();
    subscribeNotificationRefresh(a);
    subscribeNotificationRefresh(b);
    requestNotificationRefresh();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('stops delivering after unsubscribe (no leak on unmount)', async () => {
    const { subscribeNotificationRefresh, requestNotificationRefresh } = await import('../../src/lib/platform/platformService');
    const fn = vi.fn();
    const off = subscribeNotificationRefresh(fn);
    off();
    requestNotificationRefresh();
    expect(fn).not.toHaveBeenCalled();
  });

  it('one throwing subscriber does not block the others', async () => {
    const { subscribeNotificationRefresh, requestNotificationRefresh } = await import('../../src/lib/platform/platformService');
    const good = vi.fn();
    subscribeNotificationRefresh(() => { throw new Error('bad listener'); });
    subscribeNotificationRefresh(good);
    expect(() => requestNotificationRefresh()).not.toThrow();
    expect(good).toHaveBeenCalledTimes(1);
  });

  it('never fires on its own — no timer, no poll', async () => {
    vi.useFakeTimers();
    const { subscribeNotificationRefresh } = await import('../../src/lib/platform/platformService');
    const fn = vi.fn();
    subscribeNotificationRefresh(fn);
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    expect(fn).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('submitDemoRequest — refreshes the bell', () => {
  it('signals a refresh after a lead is created', async () => {
    const svc = await import('../../src/lib/platform/platformService');
    const { submitDemoRequest } = await import('../../src/lib/leads/demoRequestClient');
    const fn = vi.fn();
    svc.subscribeNotificationRefresh(fn);

    fetchMock.mockResolvedValueOnce(ok({ ok: true, id: 'dr_1', duplicate: false }));
    const res = await submitDemoRequest({ orgId: 'org-1', name: 'Ada', email: 'a@b.co' });

    expect(res).toEqual({ id: 'dr_1', duplicate: false });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT signal for a duplicate — no new notification was created', async () => {
    const svc = await import('../../src/lib/platform/platformService');
    const { submitDemoRequest } = await import('../../src/lib/leads/demoRequestClient');
    const fn = vi.fn();
    svc.subscribeNotificationRefresh(fn);

    fetchMock.mockResolvedValueOnce(ok({ ok: true, id: 'dr_1', duplicate: true }));
    const res = await submitDemoRequest({ orgId: 'org-1', name: 'Ada', email: 'a@b.co' });

    expect(res.duplicate).toBe(true);
    expect(fn).not.toHaveBeenCalled();
  });

  it('does not signal when the request fails', async () => {
    const svc = await import('../../src/lib/platform/platformService');
    const { submitDemoRequest } = await import('../../src/lib/leads/demoRequestClient');
    const fn = vi.fn();
    svc.subscribeNotificationRefresh(fn);

    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'boom' }) });
    await expect(submitDemoRequest({ orgId: 'org-1', name: 'Ada', email: 'a@b.co' })).rejects.toThrow('boom');
    expect(fn).not.toHaveBeenCalled();
  });
});
