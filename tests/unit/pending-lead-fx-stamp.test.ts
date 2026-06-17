import { describe, it, expect, beforeEach } from 'vitest';
import { savePendingResult, readPendingResult } from '../../src/lib/leads/pendingLead';
import { FX_SNAPSHOT } from '../../src/lib/currency/fxSnapshot';

/**
 * B6.7 P4 — persisted results record the FX snapshot version in effect when a
 * (possibly currency-converted) headline was produced, for reproducibility.
 */
beforeEach(() => { try { localStorage.clear(); } catch { /* noop */ } });

describe('pendingLead — FX snapshot stamp', () => {
  it('auto-stamps the active FX snapshot version on save', () => {
    savePendingResult({ kind: 'roi', headline: 'estimated savings of ≈ €1,472/month', createdAt: '2026-06-17T00:00:00.000Z' });
    expect(readPendingResult('roi')?.fxSnapshotVersion).toBe(FX_SNAPSHOT.version);
  });

  it('preserves an explicitly provided version', () => {
    savePendingResult({ kind: 'diagnostic', headline: 'score 72/100', createdAt: '2026-06-17T00:00:00.000Z', fxSnapshotVersion: '2025-01-01' });
    expect(readPendingResult('diagnostic')?.fxSnapshotVersion).toBe('2025-01-01');
  });
});
