import { describe, it, expect } from 'vitest';
import {
  detectSignals, mapItem, mapDataset, excerptAround, itemText, itemUrl, AI_VENDORS,
} from '../../worker/src/lib/apify-signals';
import {
  parseActorConfig, buildApifyConfig, buildActorInput, DEFAULT_ACTORS,
} from '../../worker/src/lib/apify-collector';
import { classifyFailure, safeReason, seedCoverage, makeDeadline } from '../../worker/src/lib/enrichment-collector';

/**
 * Phase 2 — pure halves: signal detection, actor configuration, failure
 * classification. Detection must be deterministic, because the evidence hash and
 * therefore snapshot reproducibility depend on the same page producing the same
 * excerpt every time.
 */

describe('signal detection', () => {
  it('finds a named AI vendor in page text', () => {
    const hits = detectSignals('Our support desk is built on OpenAI models.', 'website');
    expect(hits.some(h => h.observedValue === 'OpenAI' && h.signalType === 'ai_vendor_script')).toBe(true);
  });

  it('a vendor on a CONTRACTUAL page is a named processor, not a script', () => {
    // A name in a DPA is a much stronger statement than a name in prose.
    const hits = detectSignals('Sub-processor: OpenAI, L.L.C.', 'dpa');
    expect(hits[0]).toMatchObject({ observedValue: 'OpenAI', signalType: 'ai_processor_named' });
  });

  it('records one observation per vendor per page, not one per mention', () => {
    const text = 'OpenAI. We love OpenAI. Did we mention OpenAI? OpenAI.';
    expect(detectSignals(text, 'website').filter(h => h.observedValue === 'OpenAI')).toHaveLength(1);
  });

  it('detects several distinct vendors on one page', () => {
    const hits = detectSignals('We use OpenAI and Anthropic and Hugging Face.', 'website');
    const vendors = hits.map(h => h.observedValue);
    expect(vendors).toContain('OpenAI');
    expect(vendors).toContain('Anthropic');
    expect(vendors).toContain('Hugging Face');
  });

  it('detects automated decision-making language', () => {
    const hits = detectSignals('We engage in automated decision-making including profiling.', 'privacy_policy');
    expect(hits.some(h => h.signalType === 'automated_decision')).toBe(true);
  });

  it('detects a published AI policy', () => {
    expect(detectSignals('Our Responsible AI commitments', 'ai_policy')
      .some(h => h.signalType === 'ai_policy_published')).toBe(true);
  });

  it('grades a marketing claim as its own weaker signal', () => {
    const hits = detectSignals('Our AI-powered dashboard delights users.', 'website');
    expect(hits.some(h => h.signalType === 'ai_marketing_claim')).toBe(true);
  });

  it('detects ML dependencies ONLY on repository sources', () => {
    expect(detectSignals('import torch', 'repository').some(h => h.signalType === 'ai_repo_dependency')).toBe(true);
    // The same word on a marketing page is not a dependency.
    expect(detectSignals('import torch', 'website').some(h => h.signalType === 'ai_repo_dependency')).toBe(false);
  });

  it('detects AI/ML hiring signals', () => {
    expect(detectSignals('We are hiring a Machine Learning Engineer.', 'website')
      .some(h => h.signalType === 'ai_job_posting')).toBe(true);
  });

  it('finds nothing in a page with no AI signal — silence is a valid answer', () => {
    expect(detectSignals('We sell artisanal cheese from Normandy.', 'website')).toEqual([]);
  });

  it('does not mistake Claude Monet for Anthropic', () => {
    // A false vendor attribution becomes a false claim that a customer failed to
    // declare something.
    expect(detectSignals('Our gallery features Claude Monet.', 'website')
      .some(h => h.observedValue === 'Anthropic')).toBe(false);
  });

  it('every vendor rule carries at least one pattern', () => {
    for (const v of AI_VENDORS) expect(v.patterns.length).toBeGreaterThan(0);
  });
});

describe('detection is deterministic', () => {
  it('the same text yields identical results across runs', () => {
    const text = 'We use OpenAI. Our AI-powered search relies on embeddings.';
    expect(JSON.stringify(detectSignals(text, 'website')))
      .toBe(JSON.stringify(detectSignals(text, 'website')));
  });

  it('the excerpt around a match is stable', () => {
    const text = 'x'.repeat(500) + 'OpenAI' + 'y'.repeat(500);
    expect(excerptAround(text, 500, 6)).toBe(excerptAround(text, 500, 6));
  });

  it('excerpts are whitespace-normalised and bounded', () => {
    const text = 'a\n\n\n   b   OpenAI \t\t c';
    const ex = excerptAround(text, text.indexOf('OpenAI'), 6);
    expect(ex).not.toMatch(/\s{2,}/);
    expect(ex.length).toBeLessThanOrEqual(240);
  });

  it('handles a match at the very start without going negative', () => {
    expect(excerptAround('OpenAI is used here', 0, 6)).toContain('OpenAI');
  });
});

describe('item mapping', () => {
  const item = { url: 'https://acme.example/privacy', text: 'Sub-processor: OpenAI, L.L.C.' };

  it('maps an item to observations tagged with the apify collector', () => {
    const obs = mapItem(item, { sourceType: 'dpa', collectorRunId: 'apify:x' });
    expect(obs[0]).toMatchObject({
      collector: 'apify', sourceType: 'dpa', sourceUrl: 'https://acme.example/privacy',
      observedValue: 'OpenAI', collectorRunId: 'apify:x',
    });
    expect(obs[0].capturedEvidence).toContain('OpenAI');
  });

  it('prefers loadedUrl over url — the page actually fetched after redirects', () => {
    expect(itemUrl({ url: 'https://a.example', loadedUrl: 'https://b.example' })).toBe('https://b.example');
  });

  it('picks the longest textual representation available', () => {
    expect(itemText({ text: 'short', markdown: 'a much longer markdown body' }))
      .toBe('a much longer markdown body');
  });

  it('discards an item with no url or no text', () => {
    expect(mapItem({ text: 'OpenAI' }, { sourceType: 'website', collectorRunId: 'r' })).toEqual([]);
    expect(mapItem({ url: 'https://a.example' }, { sourceType: 'website', collectorRunId: 'r' })).toEqual([]);
  });

  it('maps a whole dataset and survives junk entries', () => {
    const obs = mapDataset([item, {}, { url: 'x' }], { sourceType: 'dpa', collectorRunId: 'r' });
    expect(obs.length).toBeGreaterThan(0);
  });
});

describe('actor configuration', () => {
  it('defaults ONLY verified actors, leaving social sources unconfigured', () => {
    expect(DEFAULT_ACTORS.website).toBe('apify/website-content-crawler');
    // Guessing an actor id would produce a source that silently collects nothing.
    expect(DEFAULT_ACTORS.linkedin).toBeUndefined();
    expect(DEFAULT_ACTORS.instagram).toBeUndefined();
    expect(DEFAULT_ACTORS.youtube).toBeUndefined();
  });

  it('parses an override and ignores unknown source types', () => {
    const cfg = parseActorConfig('{"linkedin":"foo/bar","not_a_source":"x/y"}');
    expect(cfg.linkedin).toBe('foo/bar');
    expect(Object.keys(cfg)).toEqual(['linkedin']);
  });

  it('survives malformed or absent config', () => {
    expect(parseActorConfig(undefined)).toEqual({});
    expect(parseActorConfig('not json')).toEqual({});
    expect(parseActorConfig('[1,2,3]')).toEqual({});
    expect(parseActorConfig('{"linkedin":123}')).toEqual({});
  });

  it('returns null without a token, so the collector is never constructed blind', () => {
    expect(buildApifyConfig({})).toBeNull();
    expect(buildApifyConfig({ APIFY_TOKEN: '   ' })).toBeNull();
  });

  it('lets an override replace a retired default without a deploy', () => {
    const cfg = buildApifyConfig({ APIFY_TOKEN: 't', APIFY_ACTORS: '{"website":"custom/crawler"}' })!;
    expect(cfg.actors.website).toBe('custom/crawler');
  });

  it('ignores a nonsense memory value', () => {
    expect(buildApifyConfig({ APIFY_TOKEN: 't', APIFY_MEMORY_MB: 'lots' })!.memoryMb).toBeUndefined();
    expect(buildApifyConfig({ APIFY_TOKEN: 't', APIFY_MEMORY_MB: '2048' })!.memoryMb).toBe(2048);
  });
});

describe('actor input', () => {
  it('targets the legal path hints for a DPA rather than the site root', () => {
    const input = buildActorInput('dpa', 'acme.example') as { startUrls: Array<{ url: string }> };
    expect(input.startUrls.map(u => u.url)).toContain('https://acme.example/dpa');
  });

  it('crawls the root for a plain website with a wider page budget', () => {
    const input = buildActorInput('website', 'acme.example') as { startUrls: Array<{ url: string }>; maxCrawlPages: number };
    expect(input.startUrls[0].url).toBe('https://acme.example');
    expect(input.maxCrawlPages).toBeGreaterThan(5);
  });

  it('is deterministic for the same source and domain', () => {
    expect(JSON.stringify(buildActorInput('terms', 'a.example')))
      .toBe(JSON.stringify(buildActorInput('terms', 'a.example')));
  });
});

describe('failure classification', () => {
  it('separates retryable throttling from a permanent block', () => {
    // Telling a customer a source is blocked when it was busy misrepresents
    // their own estate.
    expect(classifyFailure(429)).toBe('rate_limited');
    expect(classifyFailure(401)).toBe('blocked');
    expect(classifyFailure(403)).toBe('blocked');
  });

  it('maps missing and broken sources to unavailable', () => {
    expect(classifyFailure(404)).toBe('unavailable');
    expect(classifyFailure(500)).toBe('unavailable');
    expect(classifyFailure(503)).toBe('unavailable');
  });

  it('treats a timeout as partial — something may have been collected', () => {
    expect(classifyFailure(408)).toBe('partial');
    expect(classifyFailure(0, 'request timed out')).toBe('partial');
  });

  it('reads quota language out of a message when the status is uninformative', () => {
    expect(classifyFailure(400, 'monthly quota exceeded')).toBe('rate_limited');
  });
});

describe('reason strings are safe to show a customer', () => {
  it('redacts emails and token-like strings', () => {
    const r = safeReason('failed for ops@acme.com using apify_api_AbCdEfGhIjKlMnOpQrStUvWxYz012345');
    expect(r).toContain('<email>');
    expect(r).toContain('<redacted>');
    expect(r).not.toContain('acme.com');
  });

  it('accepts an Error and caps length', () => {
    expect(safeReason(new Error('x'.repeat(400))).length).toBeLessThanOrEqual(140);
  });

  it('returns empty for non-text input rather than "[object Object]"', () => {
    expect(safeReason({ a: 1 })).toBe('');
    expect(safeReason(undefined)).toBe('');
  });
});

describe('coverage seeding', () => {
  it('seeds every requested source as not_attempted', () => {
    // The anti-silent-failure primitive: a source can never simply vanish.
    const seeded = seedCoverage(['website', 'linkedin'], 'apify', '2026-08-02T00:00:00.000Z');
    expect([...seeded.keys()]).toEqual(['website', 'linkedin']);
    expect(seeded.get('linkedin')!.state).toBe('not_attempted');
  });
});

describe('deadline', () => {
  it('reports remaining budget and expiry', () => {
    const d = makeDeadline(10_000, Date.now());
    expect(d.expired()).toBe(false);
    expect(d.remaining()).toBeGreaterThan(0);
    expect(makeDeadline(0, Date.now()).expired()).toBe(true);
  });

  it('never reports negative remaining time', () => {
    expect(makeDeadline(-5000, Date.now()).remaining()).toBe(0);
  });
});
