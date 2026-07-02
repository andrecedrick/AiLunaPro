import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePendingResult, readPendingResult, clearPendingResult, readLatestPendingResult,
  saveFlowProgress, readFlowProgress, clearFlowProgress,
  readFreshRoi, bindRoiToQuote, PENDING_ROI_TTL_MS,
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

describe('D2 — ROI freshness + quote binding (no stale/unrelated ROI in the email)', () => {
  const ROI = {
    estimatedMonthlyCostSaved: 4554, estimatedYearlyCostSaved: 54648,
    estimatedTimeSavedHoursPerMonth: 90, estimatedPaybackMonths: 5,
  };
  const now = Date.parse('2026-07-01T12:00:00.000Z');
  const iso = (ms: number) => new Date(ms).toISOString();
  const saveRoi = (createdMs: number) =>
    savePendingResult({ kind: 'roi', headline: 'savings', createdAt: iso(createdMs), roi: ROI });

  it('returns a FRESH ROI (within the 30-min TTL)', () => {
    saveRoi(now - 10 * 60_000);
    expect(readFreshRoi(now)).toEqual(ROI);
  });

  it('rejects a STALE ROI (older than the TTL) → null (block hidden / no email ROI)', () => {
    saveRoi(now - (PENDING_ROI_TTL_MS + 60_000));
    expect(readFreshRoi(now)).toBeNull();
  });

  it('accepts the exact TTL boundary but rejects one ms past it', () => {
    saveRoi(now - PENDING_ROI_TTL_MS);
    expect(readFreshRoi(now)).toEqual(ROI);
    saveRoi(now - (PENDING_ROI_TTL_MS + 1));
    expect(readFreshRoi(now)).toBeNull();
  });

  it('rejects a future / bad timestamp', () => {
    saveRoi(now + 60_000);                                   // clock-skew / tampered future stamp
    expect(readFreshRoi(now)).toBeNull();
    savePendingResult({ kind: 'roi', headline: 'x', createdAt: 'not-a-date', roi: ROI });
    expect(readFreshRoi(now)).toBeNull();
  });

  it('an UNBOUND fresh ROI is usable for any quote', () => {
    saveRoi(now - 5 * 60_000);
    expect(readFreshRoi(now, 'q-anything')).toEqual(ROI);
  });

  it('once BOUND, the ROI only matches its own quote (never a different one)', () => {
    saveRoi(now - 5 * 60_000);
    bindRoiToQuote('qA');
    expect(readFreshRoi(now, 'qA')).toEqual(ROI);            // same quote → used
    expect(readFreshRoi(now, 'qB')).toBeNull();              // different quote → hidden
    expect(readFreshRoi(now)).toEqual(ROI);                  // no quoteId asked → freshness only
  });

  it('binding preserves createdAt (freshness still measured from the ROI computation)', () => {
    const created = now - 20 * 60_000;
    saveRoi(created);
    bindRoiToQuote('qA');
    const p = readPendingResult('roi')!;
    expect(p.createdAt).toBe(iso(created));                  // clock NOT reset by binding
    expect(p.quoteId).toBe('qA');
    // a bound-but-now-stale ROI is still rejected
    expect(readFreshRoi(created + PENDING_ROI_TTL_MS + 1, 'qA')).toBeNull();
  });

  it('bindRoiToQuote is a no-op when there is no ROI to bind', () => {
    bindRoiToQuote('qA');
    expect(readPendingResult('roi')).toBeNull();
  });

  it('a result without an roi field yields null', () => {
    savePendingResult({ kind: 'roi', headline: 'no-roi', createdAt: iso(now) });
    expect(readFreshRoi(now)).toBeNull();
  });
});
