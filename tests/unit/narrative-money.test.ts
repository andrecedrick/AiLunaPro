import { describe, it, expect } from 'vitest';
import { formatMoneyRange } from '../../src/lib/result/narrative';

/**
 * B6.7 P2b — the audit-results monthly cost RANGE now goes through the unified
 * money formatter. USD output must stay byte-identical to the prior
 * `~$lo–$hi/mo`; converted currencies get a single leading "≈" and snapshot rates.
 */
const DASH = '–'; // en dash, as used by the range builder

describe('narrative.formatMoneyRange (B6.7 P2b)', () => {
  it('USD is byte-identical (default + explicit)', () => {
    expect(formatMoneyRange(1600)).toBe(`~$1,400${DASH}$1,800/mo`);
    expect(formatMoneyRange(1600, 'usd')).toBe(`~$1,400${DASH}$1,800/mo`);
  });

  it('converted currency is ≈-prefixed and uses the FX snapshot', () => {
    expect(formatMoneyRange(1600, 'eur')).toBe(`≈ ~€1,288${DASH}€1,656/mo`);
  });

  it('USD never carries the ≈ marker', () => {
    expect(formatMoneyRange(5000, 'usd').includes('≈')).toBe(false);
  });
});
