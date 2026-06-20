import { describe, it, expect } from 'vitest';
import { answerLuna } from '../../src/lib/luna/answer';

/*
 * S3 Phase 1 — deterministic Luna responder. Pure keyword match over the
 * product's guidance topics. NO LLM, NO network. Guardrail: pricing / purchase
 * questions are redirected to Billing, never answered with advice.
 */

describe('answerLuna', () => {
  it('matches an audit question to the audit topic + deep link', () => {
    const a = answerLuna('how do I start an audit?', 'dashboard');
    expect(a.text.toLowerCase()).toContain('audit');
    expect(a.actions.some(x => x.route.name === 'audit/new')).toBe(true);
  });

  it('matches a reports question', () => {
    const a = answerLuna('where are my reports', 'dashboard');
    expect(a.actions.some(x => x.route.name === 'reports')).toBe(true);
  });

  it('matches a tokens question', () => {
    const a = answerLuna('what is a token and my balance', 'dashboard');
    expect(a.actions.some(x => x.route.name === 'billing/tokens')).toBe(true);
  });

  it('redirects pricing / purchase questions to Billing WITHOUT advising', () => {
    const a = answerLuna('which plan should I buy, the cheapest one?', 'dashboard');
    expect(a.text.toLowerCase()).toMatch(/can'?t advise|pricing/);
    expect(a.actions).toEqual([{ label: 'Open Billing', route: { name: 'billing' } }]);
  });

  it('falls back to the current page guidance when nothing matches', () => {
    const a = answerLuna('zxqwv blarg', 'reports');
    expect(a.text.toLowerCase()).toContain('this page is for');
    expect(a.actions.length).toBeGreaterThan(0);
  });

  it('is deterministic — same input yields identical output', () => {
    const q = 'how do I invite a team member';
    expect(answerLuna(q, 'dashboard')).toEqual(answerLuna(q, 'dashboard'));
  });

  it('never returns pricing advice for guarded phrasing', () => {
    for (const q of ['is it worth it', 'can I get a discount', 'should I pay for pro']) {
      expect(answerLuna(q, 'dashboard').actions[0].route.name).toBe('billing');
    }
  });
});
