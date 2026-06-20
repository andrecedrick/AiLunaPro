import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * F1 — Quote monetization funnel analytics.
 *
 * The event registry (src/lib/analytics/events.ts) is the single source of truth
 * for funnel event names + their no-PII payload shapes. We mock track() so emit()
 * forwarding is observable without consent/PostHog, then assert: (1) every event
 * forwards verbatim, (2) NO payload carries PII (only flow/src/enum/bool), and
 * (3) the funnel event names don't drift.
 */

const { trackSpy } = vi.hoisted(() => ({ trackSpy: vi.fn() }));
vi.mock('../../src/lib/analytics/track', () => ({ track: trackSpy }));

import { emit } from '../../src/lib/analytics/events';

// Keys that would signal a PII / sensitive leak in a funnel payload.
const FORBIDDEN_KEYS = [
  'price', 'pricemin', 'pricemax', 'amount', 'usd', 'budget', 'budgetusd',
  'email', 'description', 'text', 'id', 'quoteid', 'orgid', 'uid', 'name',
];
// The only props a funnel event may ever carry.
const ALLOWED_KEYS = new Set(['flow', 'src', 'emailed', 'verdict', 'decision', 'target']);

function emitAllQuoteFunnelEvents() {
  emit('lead_flow_started',    { flow: 'quote', src: 'seo' });
  emit('score_viewed',         { flow: 'quote', src: 'seo' });
  emit('lead_flow_completed',  { flow: 'quote', src: 'seo' });
  emit('quote_pdf_downloaded', { flow: 'quote', src: 'seo' });
  emit('quote_emailed',        { flow: 'quote', emailed: true, src: 'seo' });
  emit('quote_budget_entered', { flow: 'quote', verdict: 'within', src: 'seo' });
  emit('quote_decision',       { flow: 'quote', decision: 'accepted', src: 'seo' });
  emit('cta_clicked',          { flow: 'quote', target: 'signup', src: 'seo' });
}

beforeEach(() => trackSpy.mockClear());

describe('analytics/events — F1 quote funnel registry', () => {
  it('forwards each registered event to track() with its exact payload', () => {
    emitAllQuoteFunnelEvents();
    expect(trackSpy).toHaveBeenCalledTimes(8);
    expect(trackSpy).toHaveBeenCalledWith('quote_pdf_downloaded', { flow: 'quote', src: 'seo' });
    expect(trackSpy).toHaveBeenCalledWith('quote_emailed', { flow: 'quote', emailed: true, src: 'seo' });
    expect(trackSpy).toHaveBeenCalledWith('quote_budget_entered', { flow: 'quote', verdict: 'within', src: 'seo' });
    expect(trackSpy).toHaveBeenCalledWith('quote_decision', { flow: 'quote', decision: 'accepted', src: 'seo' });
    expect(trackSpy).toHaveBeenCalledWith('cta_clicked', { flow: 'quote', target: 'signup', src: 'seo' });
  });

  it('carries NO PII in any funnel payload (only flow / src / enum / bool)', () => {
    emitAllQuoteFunnelEvents();
    for (const [name, props] of trackSpy.mock.calls as [string, Record<string, unknown>][]) {
      for (const k of Object.keys(props ?? {})) {
        expect(FORBIDDEN_KEYS.includes(k.toLowerCase()), `${name}.${k} looks like PII`).toBe(false);
        expect(ALLOWED_KEYS.has(k), `${name}.${k} is not an allow-listed prop`).toBe(true);
      }
    }
  });

  it('emits the exact funnel event names (drift guard)', () => {
    emitAllQuoteFunnelEvents();
    expect(trackSpy.mock.calls.map(c => c[0])).toEqual([
      'lead_flow_started', 'score_viewed', 'lead_flow_completed',
      'quote_pdf_downloaded', 'quote_emailed', 'quote_budget_entered',
      'quote_decision', 'cta_clicked',
    ]);
  });
});

describe('analytics/events — S1 feedback', () => {
  it('forwards feedback events carrying only source / satisfaction / src (no free text)', () => {
    emit('feedback_submitted', { source: 'quote', satisfaction: 5, src: 'seo' });
    emit('feedback_dismissed', { source: 'audit', src: 'seo' });
    expect(trackSpy).toHaveBeenCalledWith('feedback_submitted', { source: 'quote', satisfaction: 5, src: 'seo' });
    expect(trackSpy).toHaveBeenCalledWith('feedback_dismissed', { source: 'audit', src: 'seo' });
    const allowed = new Set(['source', 'satisfaction', 'src']);
    for (const [, props] of trackSpy.mock.calls as [string, Record<string, unknown>][]) {
      for (const k of Object.keys(props ?? {})) {
        expect(allowed.has(k), `feedback payload key ${k}`).toBe(true);
        expect(['blocker', 'suggestion', 'text', 'email']).not.toContain(k);
      }
    }
  });
});
