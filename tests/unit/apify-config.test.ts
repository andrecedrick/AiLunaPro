import { describe, it, expect } from 'vitest';

/*
 * Apify configuration is mandatory in production (P2.1a).
 *
 * DEFAULT_ACTORS is explicitly partial and memoryMb is unbounded when unset, so
 * an incomplete configuration means some source types silently have no collector
 * while others run at whatever Apify defaults to — and the platform pays for it.
 * That is the same silent-fallback shape as the plan products, which cost two
 * days of live debugging (§27.4c).
 */

import { buildApifyConfig, parseActorConfig } from '../../worker/src/lib/apify-collector';

const FULL = { APIFY_TOKEN: 'tok', APIFY_ACTORS: '{"website":"a/b"}', APIFY_MEMORY_MB: '1024' };
const PROD = { ...FULL, APP_ENV: 'production' };

describe('production requires all three variables', () => {
  it('builds a config when everything is present', () => {
    const cfg = buildApifyConfig(PROD);
    expect(cfg).not.toBeNull();
    expect(cfg!.memoryMb).toBe(1024);
    expect(cfg!.actors.website).toBe('a/b');
  });

  it('returns null when APIFY_ACTORS is missing', () => {
    expect(buildApifyConfig({ ...PROD, APIFY_ACTORS: undefined })).toBeNull();
  });

  it('returns null when APIFY_ACTORS parses to nothing usable', () => {
    // A malformed override would otherwise fall through to the partial defaults.
    expect(buildApifyConfig({ ...PROD, APIFY_ACTORS: 'not json' })).toBeNull();
    expect(buildApifyConfig({ ...PROD, APIFY_ACTORS: '{}' })).toBeNull();
    expect(buildApifyConfig({ ...PROD, APIFY_ACTORS: '{"unknown_source":"a/b"}' })).toBeNull();
  });

  it('returns null when APIFY_MEMORY_MB is missing or unusable', () => {
    for (const bad of [undefined, '', 'lots', '0', '-512']) {
      expect(buildApifyConfig({ ...PROD, APIFY_MEMORY_MB: bad })).toBeNull();
    }
  });

  it('returns null without a token, in any environment', () => {
    expect(buildApifyConfig({ ...PROD, APIFY_TOKEN: '' })).toBeNull();
    expect(buildApifyConfig({ APIFY_TOKEN: undefined })).toBeNull();
  });
});

describe('outside production the defaults still stand', () => {
  it('builds from a token alone, so dev needs no further configuration', () => {
    const cfg = buildApifyConfig({ APIFY_TOKEN: 'tok' });
    expect(cfg).not.toBeNull();
    expect(cfg!.memoryMb).toBeUndefined();
  });

  it('treats a non-production APP_ENV as development', () => {
    expect(buildApifyConfig({ APIFY_TOKEN: 'tok', APP_ENV: 'staging' })).not.toBeNull();
  });
});

describe('actor overrides', () => {
  it('ignores unknown source types rather than rejecting the whole config', () => {
    const parsed = parseActorConfig('{"website":"a/b","made_up":"x/y"}');
    expect(parsed.website).toBe('a/b');
    expect('made_up' in parsed).toBe(false);
  });

  it('an override replaces the committed default for that source', () => {
    const cfg = buildApifyConfig({ ...PROD, APIFY_ACTORS: '{"website":"custom/actor"}' });
    expect(cfg!.actors.website).toBe('custom/actor');
  });
});
