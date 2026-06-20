import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* S3 Phase 2 — Luna AI client. On ANY failure (not authed, network, non-200,
 * server fallback) it returns { fallback: true } so the caller uses the
 * deterministic answerLuna(). A 429 surfaces a wait message, not a fallback. */

const { getIdToken } = vi.hoisted(() => ({ getIdToken: vi.fn(async () => 'tok') }));
vi.mock('../../src/lib/team/teamApiClient', () => ({ getIdToken }));
vi.mock('../../src/lib/billing/stripeClient', () => ({ WORKER_BASE: 'https://api.test' }));

import { askLunaAI } from '../../src/lib/luna/lunaChatClient';

const orig = globalThis.fetch;
beforeEach(() => { getIdToken.mockResolvedValue('tok'); });
afterEach(() => { globalThis.fetch = orig; vi.clearAllMocks(); });

function mockFetch(status: number, body: unknown) {
  globalThis.fetch = vi.fn(async () => ({ ok: status >= 200 && status < 300, status, json: async () => body })) as unknown as typeof fetch;
}

describe('askLunaAI', () => {
  it('returns the AI reply + action on success', async () => {
    mockFetch(200, { text: 'Here is help', action: { label: 'View reports', route: 'reports' } });
    const r = await askLunaAI('where are my reports', 'dashboard', [], 'en');
    expect(r).toEqual({ text: 'Here is help', action: { label: 'View reports', route: 'reports' } });
  });

  it('falls back when the server signals fallback', async () => {
    mockFetch(200, { fallback: true });
    expect(await askLunaAI('q', 'dashboard', [], 'en')).toEqual({ fallback: true });
  });

  it('surfaces a wait message on 429 (not a fallback)', async () => {
    mockFetch(429, { error: 'slow down', code: 'RATE_LIMITED' });
    const r = await askLunaAI('q', 'dashboard', [], 'en');
    expect(r.fallback).toBeFalsy();
    expect(r.text).toMatch(/wait a moment/i);
  });

  it('falls back on a non-200 error', async () => {
    mockFetch(500, { error: 'boom' });
    expect(await askLunaAI('q', 'dashboard', [], 'en')).toEqual({ fallback: true });
  });

  it('falls back when not authenticated', async () => {
    getIdToken.mockRejectedValueOnce(new Error('not authed'));
    expect(await askLunaAI('q', 'dashboard', [], 'en')).toEqual({ fallback: true });
  });

  it('falls back on a network error', async () => {
    globalThis.fetch = vi.fn(async () => { throw new Error('network'); }) as unknown as typeof fetch;
    expect(await askLunaAI('q', 'dashboard', [], 'en')).toEqual({ fallback: true });
  });
});
