import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* S3 Phase 2 + L2 — Luna AI client. On ANY failure → { fallback: true } (caller
 * uses answerLuna). 429 → wait message. 402 → { needTokens } (caller shows the
 * InsufficientTokensModal). */

const { getIdToken } = vi.hoisted(() => ({ getIdToken: vi.fn(async () => 'tok') }));
vi.mock('../../src/lib/team/teamApiClient', () => ({ getIdToken }));
vi.mock('../../src/lib/billing/stripeClient', () => ({ WORKER_BASE: 'https://api.test' }));

import { askLunaAI } from '../../src/lib/luna/lunaChatClient';

const orig = globalThis.fetch;
const INPUT = { message: 'q', routeName: 'dashboard', history: [], lang: 'en', orgId: 'o1', eventId: 'e1' };
beforeEach(() => { getIdToken.mockResolvedValue('tok'); });
afterEach(() => { globalThis.fetch = orig; vi.clearAllMocks(); });

function mockFetch(status: number, body: unknown) {
  globalThis.fetch = vi.fn(async () => ({ ok: status >= 200 && status < 300, status, json: async () => body })) as unknown as typeof fetch;
}

describe('askLunaAI', () => {
  it('returns the AI reply + action on success', async () => {
    mockFetch(200, { text: 'Here is help', action: { label: 'View reports', route: 'reports' } });
    const r = await askLunaAI({ ...INPUT });
    expect(r).toEqual({ text: 'Here is help', action: { label: 'View reports', route: 'reports' } });
  });

  it('sends message/lang/orgId/eventId in the body', async () => {
    let sent: Record<string, unknown> = {};
    globalThis.fetch = vi.fn(async (_url: unknown, init: { body: string }) => {
      sent = JSON.parse(init.body);
      return { ok: true, status: 200, json: async () => ({ text: 'ok' }) };
    }) as unknown as typeof fetch;
    await askLunaAI({ ...INPUT, lang: 'fr' });
    expect(sent).toMatchObject({ message: 'q', lang: 'fr', orgId: 'o1', eventId: 'e1' });
  });

  it('returns needTokens on 402 (free exhausted + insufficient)', async () => {
    mockFetch(402, { code: 'INSUFFICIENT_TOKENS', balance: 10, required: 50 });
    const r = await askLunaAI({ ...INPUT });
    expect(r).toEqual({ needTokens: { balance: 10, required: 50 } });
  });

  it('falls back when the server signals fallback', async () => {
    mockFetch(200, { fallback: true });
    expect(await askLunaAI({ ...INPUT })).toEqual({ fallback: true });
  });

  it('surfaces a wait message on 429', async () => {
    mockFetch(429, { code: 'RATE_LIMITED' });
    const r = await askLunaAI({ ...INPUT });
    expect(r.fallback).toBeFalsy();
    expect(r.text).toMatch(/wait a moment/i);
  });

  it('falls back on a non-200 / not-authed / network error', async () => {
    mockFetch(500, {});
    expect(await askLunaAI({ ...INPUT })).toEqual({ fallback: true });

    getIdToken.mockRejectedValueOnce(new Error('not authed'));
    expect(await askLunaAI({ ...INPUT })).toEqual({ fallback: true });

    globalThis.fetch = vi.fn(async () => { throw new Error('network'); }) as unknown as typeof fetch;
    expect(await askLunaAI({ ...INPUT })).toEqual({ fallback: true });
  });
});
