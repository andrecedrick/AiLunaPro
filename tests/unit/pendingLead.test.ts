import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePendingResult, readPendingResult, clearPendingResult, readLatestPendingResult,
  saveFlowProgress, readFlowProgress, clearFlowProgress,
} from '../../src/lib/leads/pendingLead';

/* B2.3/B2.4 — pending-lead continuity + abandoned-flow helpers (localStorage,
 * deterministic, malformed-data safe, no PII beyond local form state). */

beforeEach(() => { try { localStorage.clear(); } catch { /* noop */ } });

describe('pending result (continuity)', () => {
  it('round-trips and clears', () => {
    savePendingResult({ kind: 'diagnostic', headline: 'AI maturity score 62/100 (medium)', createdAt: '2026-06-10T00:00:00.000Z' });
    expect(readPendingResult('diagnostic')?.headline).toContain('62/100');
    clearPendingResult('diagnostic');
    expect(readPendingResult('diagnostic')).toBeNull();
  });

  it('latest-across-flows picks the most recent', () => {
    savePendingResult({ kind: 'diagnostic', headline: 'score', createdAt: '2026-06-09T00:00:00.000Z' });
    savePendingResult({ kind: 'roi', headline: 'savings', createdAt: '2026-06-10T00:00:00.000Z' });
    expect(readLatestPendingResult()?.kind).toBe('roi');
  });

  it('is safe on malformed stored JSON', () => {
    localStorage.setItem('ailunapro.lead.v1.diagnostic.result', '{not json');
    expect(readPendingResult('diagnostic')).toBeNull();
    expect(readLatestPendingResult()).toBeNull();
  });
});

describe('flow progress (abandoned-flow resume)', () => {
  it('round-trips opaque state and clears', () => {
    saveFlowProgress('roi', { teamSize: '12', workflow: 'support' });
    expect(readFlowProgress('roi')?.state.teamSize).toBe('12');
    clearFlowProgress('roi');
    expect(readFlowProgress('roi')).toBeNull();
  });

  it('flows are isolated from each other', () => {
    saveFlowProgress('diagnostic', { answers: { q1: 'a' } });
    expect(readFlowProgress('roi')).toBeNull();
    expect(readFlowProgress('diagnostic')?.state.answers).toEqual({ q1: 'a' });
  });

  it('is safe on malformed stored JSON', () => {
    localStorage.setItem('ailunapro.lead.v1.roi.progress', '[broken');
    expect(readFlowProgress('roi')).toBeNull();
  });
});
