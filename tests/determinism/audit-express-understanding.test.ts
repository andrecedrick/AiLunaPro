import { describe, it, expect } from 'vitest';
import { understand, UNDERSTANDING_RULESET_VERSION } from '../../worker/src/lib/audit-express-understanding';
import { assembleSnapshot, extractPageSignals, type PageCapture } from '../../worker/src/lib/audit-express-extract';
import { ENGINE_VERSION, stableStringify } from '../../worker/src/lib/determinism';

/*
 * Phase 7 — rule-only interpretation: determinism (byte-identical replay),
 * no-PII, rule coverage (business type / shadow-AI / automation / deeper audit),
 * and stable ordering. All pure (no network).
 */

const ECOM_HTML = `<!doctype html><html lang="en"><head>
  <title>Acme Store — Shop our products</title>
  <meta name="description" content="Buy now. Add to cart. Best products for you and your family.">
  <script src="https://js.intercom.io/widget.js"></script>
  <script src="https://www.googletagmanager.com/gtm.js?id=GTM-X"></script>
  </head><body>
  <a href="/shop">Shop</a><a href="/product/1">Product</a><a href="/cart">Cart</a><a href="/contact">Contact</a>
  </body></html>`;

function ecomSnapshot() {
  const caps: PageCapture[] = [
    { url: 'https://acme.example/', status: 200, contentType: 'text/html', signals: extractPageSignals(ECOM_HTML) },
    { url: 'https://acme.example/product/1', status: 200, contentType: 'text/html', signals: extractPageSignals('<html lang="en"><head><title>Product</title></head><body></body></html>') },
  ];
  return assembleSnapshot('https://acme.example/', caps);
}

describe('understanding — determinism', () => {
  it('is byte-identical across runs', () => {
    const s = ecomSnapshot();
    expect(stableStringify(understand(s))).toBe(stableStringify(understand(s)));
  });
  it('stamps engine + ruleset versions and a trace', () => {
    const u = understand(ecomSnapshot());
    expect(u.engineVersion).toBe(ENGINE_VERSION);
    expect(u.understandingRulesetVersion).toBe(UNDERSTANDING_RULESET_VERSION);
    expect(Object.keys(u.trace).length).toBeGreaterThan(0);
  });
});

describe('understanding — rule coverage', () => {
  it('classifies an e-commerce site with sources', () => {
    const u = understand(ecomSnapshot());
    expect(u.businessProfile.businessType).toBe('ecommerce');
    expect(['b2c', 'mixed', 'b2b']).toContain(u.businessProfile.audience);
    expect(u.businessProfile.sources.length).toBeGreaterThan(0);
    expect(u.businessProfile.offers.map(o => o.tag)).toContain('online-store');
  });

  it('flags AI chat without a consent tool (shadow-AI)', () => {
    const u = understand(ecomSnapshot());
    const ids = u.shadowAiFlags.map(f => f.id);
    expect(ids).toContain('ai-chat-without-consent-tool');
    u.shadowAiFlags.forEach(f => { expect(f.sources.length).toBeGreaterThan(0); expect(typeof f.ruleRef).toBe('string'); });
  });

  it('produces 3-5 automation opportunities, each with ruleRef + sources, stable order', () => {
    const u = understand(ecomSnapshot());
    expect(u.automationOpportunities.length).toBeGreaterThanOrEqual(3);
    expect(u.automationOpportunities.length).toBeLessThanOrEqual(5);
    u.automationOpportunities.forEach(o => {
      expect(typeof o.ruleRef).toBe('string');
      expect(Array.isArray(o.sources)).toBe(true);
      expect(['high', 'medium', 'low']).toContain(o.impact);
      expect(['low', 'medium', 'high']).toContain(o.effort);
    });
    // Detected AI tool => the "expand assistant" opportunity is present.
    expect(u.automationOpportunities.map(o => o.id)).toContain('expand-assistant-coverage');
  });

  it('gives an indicative EU AI Act band (limited when AI detected) — never a legal claim', () => {
    const u = understand(ecomSnapshot());
    expect(u.deeperAudit.euAiActLevelIndicative).toBe('limited-indicative');
    expect(u.deeperAudit.euAiActRationale.toLowerCase()).toContain('indicative');
    expect(u.deeperAudit.quickWins.length).toBeGreaterThan(0);
  });

  it('returns unknown type + fallback opportunities for a bare site', () => {
    const bare = assembleSnapshot('https://x.example/', [
      { url: 'https://x.example/', status: 200, contentType: 'text/html', signals: extractPageSignals('<html lang="en"><head><title>Hello</title></head><body></body></html>') },
    ]);
    const u = understand(bare);
    expect(u.businessProfile.businessType).toBe('unknown');
    expect(u.businessProfile.confidence).toBe('low');
    expect(u.automationOpportunities.length).toBeGreaterThanOrEqual(3); // fallbacks
    expect(u.deeperAudit.euAiActLevelIndicative).toBe('minimal-indicative');
  });
});

describe('understanding — no PII', () => {
  it('contains no email-like / no raw IP values', () => {
    const piiHtml = ECOM_HTML.replace('</title>', ' contact founder@acme.example</title>');
    const s = assembleSnapshot('https://acme.example/', [
      { url: 'https://acme.example/', status: 200, contentType: 'text/html', signals: extractPageSignals(piiHtml) },
    ]);
    const text = stableStringify(understand(s));
    expect(/@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text)).toBe(false);
    expect(/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(text)).toBe(false);
  });
});
