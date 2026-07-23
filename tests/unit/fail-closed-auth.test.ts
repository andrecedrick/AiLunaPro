import { describe, it, expect, vi, afterEach } from 'vitest';

/*
 * Fail-closed auth (P0 fix).
 *
 * A production bundle that lost VITE_AUTH_LAYER / VITE_DATA_LAYER used to boot
 * silently into localStorage mock mode. assertProductionLayers() must instead
 * throw a loud, diagnosable error in a PROD build, while staying a no-op in
 * dev/test.
 */

import { assertProductionLayers } from '../../src/lib/featureFlags';

const ENV = import.meta.env as Record<string, unknown>;

afterEach(() => { vi.unstubAllEnvs(); });

describe('assertProductionLayers', () => {
  it('is a no-op in a non-production build (PROD=false)', () => {
    vi.stubEnv('PROD', false as unknown as string);
    vi.stubEnv('VITE_AUTH_LAYER', '');        // mock — but dev, so allowed
    expect(() => assertProductionLayers()).not.toThrow();
  });

  it('throws in a PROD build when auth resolves to mock (env vars absent)', () => {
    vi.stubEnv('PROD', true as unknown as string);
    vi.stubEnv('VITE_AUTH_LAYER', '');
    vi.stubEnv('VITE_DATA_LAYER', '');
    vi.stubEnv('VITE_BILLING_LAYER', '');
    expect(() => assertProductionLayers()).toThrow(/fail-closed/i);
  });

  it('names the offending env var in the diagnosis', () => {
    vi.stubEnv('PROD', true as unknown as string);
    vi.stubEnv('VITE_AUTH_LAYER', '');
    vi.stubEnv('VITE_DATA_LAYER', 'firebase');   // billing satisfied via global…
    // …but AUTH domain has no specific var and global IS firebase, so auth passes too.
    // Force the auth-only failure: global mock, no auth override.
    vi.stubEnv('VITE_DATA_LAYER', 'mock');
    expect(() => assertProductionLayers()).toThrow(/VITE_AUTH_LAYER/);
  });

  it('passes in a PROD build when auth + billing resolve to firebase', () => {
    vi.stubEnv('PROD', true as unknown as string);
    vi.stubEnv('VITE_AUTH_LAYER', 'firebase');
    vi.stubEnv('VITE_BILLING_LAYER', 'firebase');
    vi.stubEnv('VITE_DATA_LAYER', 'firebase');
    expect(() => assertProductionLayers()).not.toThrow();
    void ENV;
  });
});
