import { describe, it, expect } from 'vitest';
import {
  indicativeRange, formatHoursRange, formatMoneyRange, formatPaybackRange, getSectionNarrative,
} from '../../src/lib/result/narrative';
import type { SectionKey } from '../../src/types/audit';

/* Deterministic narrative layer: honest ranges (not fake precision), stable
 * per-section copy, safe fallback. No LLM, no PII. */

describe('indicative ranges (honest, not fake precision)', () => {
  it('widens a point estimate by ±15% deterministically', () => {
    expect(indicativeRange(100).low).toBeCloseTo(85);
    expect(indicativeRange(100).high).toBeCloseTo(115);
    expect(formatHoursRange(10)).toBe('~9–12 h/month');
    expect(formatMoneyRange(1800)).toBe('~$1,500–$2,100/mo');
  });
  it('payback uses a wider band, min 1 month, and omits when null/zero', () => {
    expect(formatPaybackRange(2)).toMatch(/month/);
    expect(formatPaybackRange(null)).toBeNull();
    expect(formatPaybackRange(0)).toBeNull();
  });
  it('is safe on non-finite input', () => {
    expect(indicativeRange(NaN)).toEqual({ low: 0, high: 0 });
  });
});

describe('section narrative', () => {
  const keys: SectionKey[] = ['governance', 'data', 'security', 'transparency', 'human-oversight', 'training-maturity', 'ai-tools', 'profile'];
  it('covers every section with the 4 required parts + a flow', () => {
    for (const k of keys) {
      const n = getSectionNarrative(k);
      expect(n.whatItMeans.length).toBeGreaterThan(20);
      expect(n.whyItMatters.length).toBeGreaterThan(20);
      expect(n.example.length).toBeGreaterThan(20);
      expect(n.flow.input && n.flow.process && n.flow.output && n.flow.gain).toBeTruthy();
    }
  });
  it('is deterministic — same key → identical copy', () => {
    expect(getSectionNarrative('human-oversight')).toEqual(getSectionNarrative('human-oversight'));
  });
  it('falls back safely for an unknown key', () => {
    const n = getSectionNarrative('totally-unknown' as SectionKey);
    expect(n.whatItMeans.length).toBeGreaterThan(10);
  });
});
