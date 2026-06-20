import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  callLunaLLM, sanitizeInput, sanitizeOutput, clampHistory, isPricingQuestion,
} from '../../worker/src/lib/luna-llm';
import { resolveRoute, ROUTE_ALLOWLIST } from '../../worker/src/lib/luna-knowledge';

/*
 * S3 Phase 2 — Luna LLM boundary. The model answers from a curated KB; the
 * server sanitises in/out, strips injected links, validates the suggested route
 * against an allowlist, and throws on any failure so the caller falls back to
 * the deterministic responder. No PII, short replies, pricing redirected.
 */

function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.fn(async () => ({ ok, status, json: async () => body })) as unknown as typeof fetch;
}

describe('sanitizeInput', () => {
  it('strips markup + control chars and caps length', () => {
    expect(sanitizeInput('  <b>hello</b> world  ')).toBe('bhello/b world');
    expect(sanitizeInput('x'.repeat(800)).length).toBe(500);
  });
});

describe('sanitizeOutput', () => {
  it('defangs URLs and emails', () => {
    expect(sanitizeOutput('see https://evil.test/x now')).toBe('see [link removed] now');
    expect(sanitizeOutput('mail me@evil.test ok')).toBe('mail [email removed] ok');
  });
});

describe('clampHistory', () => {
  it('keeps at most 6 turns and drops a leading assistant turn', () => {
    const h = [
      { role: 'assistant', text: 'greeting' },
      ...Array.from({ length: 8 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', text: `m${i}` })),
    ];
    const out = clampHistory(h);
    expect(out.length).toBeLessThanOrEqual(6);
    expect(out[0]?.role).toBe('user');
  });
  it('ignores non-array / malformed entries', () => {
    expect(clampHistory(null)).toEqual([]);
    expect(clampHistory([{ role: 'bogus', text: 'x' }, { role: 'user' }])).toEqual([]);
  });
});

describe('isPricingQuestion', () => {
  it.each(['is it worth it', 'which plan should I pick', 'can I get a discount'])('flags %s', (q) => {
    expect(isPricingQuestion(q)).toBe(true);
  });
  it('does not flag a normal question', () => {
    expect(isPricingQuestion('how do I start an audit')).toBe(false);
  });
});

describe('resolveRoute', () => {
  it('accepts an allowlisted route and returns its label', () => {
    expect(resolveRoute('audit/new')).toEqual({ label: ROUTE_ALLOWLIST['audit/new'], route: 'audit/new' });
  });
  it('rejects an unknown route', () => {
    expect(resolveRoute('admin/secret')).toBeNull();
    expect(resolveRoute(undefined)).toBeNull();
  });
});

describe('callLunaLLM', () => {
  const orig = globalThis.fetch;
  beforeEach(() => { /* set per test */ });
  afterEach(() => { globalThis.fetch = orig; });

  it('parses a valid ROUTE marker into an action and strips it from the text', async () => {
    globalThis.fetch = mockFetch({ content: [{ type: 'text', text: 'Start the questionnaire.\nROUTE: audit/new' }] });
    const r = await callLunaLLM('k', 'how do I start an audit', 'dashboard', []);
    expect(r.text).toBe('Start the questionnaire.');
    expect(r.action).toEqual({ label: ROUTE_ALLOWLIST['audit/new'], route: 'audit/new' });
  });

  it('drops an out-of-allowlist ROUTE and keeps the prose', async () => {
    globalThis.fetch = mockFetch({ content: [{ type: 'text', text: 'Here you go.\nROUTE: admin/secret' }] });
    const r = await callLunaLLM('k', 'q', 'dashboard', []);
    expect(r.text).toBe('Here you go.');
    expect(r.action).toBeUndefined();
  });

  it('strips a URL the model emits', async () => {
    globalThis.fetch = mockFetch({ content: [{ type: 'text', text: 'Visit https://x.test for more' }] });
    const r = await callLunaLLM('k', 'q', 'dashboard', []);
    expect(r.text).toBe('Visit [link removed] for more');
  });

  it('throws on a non-200 (caller falls back)', async () => {
    globalThis.fetch = mockFetch({}, false, 500);
    await expect(callLunaLLM('k', 'q', 'dashboard', [])).rejects.toThrow();
  });

  it('throws on a refusal stop_reason', async () => {
    globalThis.fetch = mockFetch({ stop_reason: 'refusal', content: [] });
    await expect(callLunaLLM('k', 'q', 'dashboard', [])).rejects.toThrow();
  });
});
