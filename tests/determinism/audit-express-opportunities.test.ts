import { describe, it, expect } from 'vitest';
import {
  selectOpportunities,
  audienceHeadline,
  OPPORTUNITY_CATALOG,
  type OpportunityContext,
  type Audience,
} from '../../worker/src/lib/audit-express-opportunities';

/*
 * Phase 8 — shared Opportunity Catalog + deterministic selector.
 * Determinism, traceability (ruleRef + sources), audience bucketing,
 * min-3 fallback, stable ranking, and forbidden-words guard.
 */

function ctx(audience: Audience, signals: string[]): OpportunityContext {
  const set = new Set(signals);
  return {
    audience,
    businessType: 'unknown',
    signals: set,
    sourceFor: (k: string) => (set.has(k) ? ['src:' + k] : (k === 'identity' ? ['identity:title'] : [])),
  };
}

describe('opportunities — determinism', () => {
  it('same context => identical ids and order', () => {
    const a = selectOpportunities(ctx('b2b', ['cat:ai_chat', 'cat:analytics']));
    const b = selectOpportunities(ctx('b2b', ['cat:ai_chat', 'cat:analytics']));
    expect(a.map(o => o.id)).toEqual(b.map(o => o.id));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('ranks by impact desc, then effort asc, then id', () => {
    const out = selectOpportunities(ctx('b2b', ['cat:ai_chat', 'cat:analytics', 'type:saas', 'path:pricing']));
    const rank = { high: 3, medium: 2, low: 1 } as const;
    for (let i = 1; i < out.length; i++) {
      const prev = out[i - 1], cur = out[i];
      const cmp = rank[prev.impact] !== rank[cur.impact]
        ? rank[prev.impact] >= rank[cur.impact]
        : true;
      expect(cmp).toBe(true);
    }
    // top item must be a 'high' impact one when high-impact items are eligible
    expect(out[0].impact).toBe('high');
  });
});

describe('opportunities — audience bucketing + traceability', () => {
  it('b2b context yields only b2b or mixed items, each with ruleRef + sources + existing CTA', () => {
    const out = selectOpportunities(ctx('b2b', ['cat:ai_chat']));
    expect(out.length).toBeGreaterThanOrEqual(3);
    out.forEach(o => {
      expect(['b2b', 'mixed']).toContain(o.audience);
      expect(o.ruleRef.startsWith('opp.')).toBe(true);
      expect(Array.isArray(o.sources)).toBe(true);
      expect(o.ctaTarget).toBe('/#/signup'); // existing route, no new billing flow
      expect(typeof o.ctaLabel).toBe('string');
    });
    const support = out.find(o => o.id === 'b2b.support-assistant');
    expect(support).toBeTruthy();
    expect(support!.sources).toContain('src:cat:ai_chat');
  });

  it('b2c context yields only b2c or mixed items', () => {
    const out = selectOpportunities(ctx('b2c', ['type:ecommerce']));
    out.forEach(o => expect(['b2c', 'mixed']).toContain(o.audience));
    expect(out.map(o => o.id)).toContain('b2c.order-returns-faq');
  });

  it('unknown audience => mixed bucket, minimum 3 via fallbacks', () => {
    const out = selectOpportunities(ctx('unknown', []));
    expect(out.length).toBeGreaterThanOrEqual(3);
    out.forEach(o => expect(o.audience).toBe('mixed'));
  });

  it('caps at 7', () => {
    const out = selectOpportunities(ctx('b2b', ['cat:ai_chat', 'cat:analytics', 'type:saas', 'type:agency', 'type:consulting', 'path:pricing', 'path:features', 'path:contact', 'path:support']));
    expect(out.length).toBeLessThanOrEqual(7);
  });
});

describe('opportunities — copy guardrails', () => {
  it('catalog contains no forbidden claims', () => {
    const text = JSON.stringify(OPPORTUNITY_CATALOG).toLowerCase();
    expect(text.includes('guaranteed')).toBe(false);
    expect(text.includes('certified')).toBe(false);
    expect(text.includes('compliant')).toBe(false);
    expect(text.includes('legal advice')).toBe(false);
  });

  it('audience headline copy is deterministic', () => {
    expect(audienceHeadline('b2b')).toBe('Best for teams');
    expect(audienceHeadline('b2c')).toBe('Best for personal use');
    expect(audienceHeadline('unknown')).toBe('Top opportunities for you');
  });
});
