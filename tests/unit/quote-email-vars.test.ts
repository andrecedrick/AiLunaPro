import { describe, it, expect } from 'vitest';
import { sanitizeQuoteRoiVars, QUOTE_ROI_KEYS } from '../../worker/src/lib/quote-email-vars';

describe('quote email ROI vars — sanitize + fallback (no null, no raw {{VAR}})', () => {
  it('always returns ALL 7 keys, even for an empty/absent payload', () => {
    const out = sanitizeQuoteRoiVars(undefined);
    for (const k of QUOTE_ROI_KEYS) expect(out[k]).toBe('—');
    expect(Object.keys(out).sort()).toEqual([...QUOTE_ROI_KEYS].sort());
  });

  it('passes valid client-formatted strings through unchanged', () => {
    const out = sanitizeQuoteRoiVars({
      MONTHLY_SAVED: '€4,554', YEARLY_SAVED: '€54,648', TIME_SAVED: '90 h/mo',
      PAYBACK: '5 months', ROI_MULTIPLE: '1.1×', BREAKEVEN: '~11 mo', THREE_YEAR: '3.2×',
    });
    expect(out.MONTHLY_SAVED).toBe('€4,554');
    expect(out.ROI_MULTIPLE).toBe('1.1×');
    expect(out.BREAKEVEN).toBe('~11 mo');
    expect(out.THREE_YEAR).toBe('3.2×');
  });

  it('falls back to em dash for a missing/blank/non-string value', () => {
    const out = sanitizeQuoteRoiVars({ MONTHLY_SAVED: '€700', YEARLY_SAVED: '', TIME_SAVED: 42 });
    expect(out.MONTHLY_SAVED).toBe('€700');
    expect(out.YEARLY_SAVED).toBe('—');
    expect(out.TIME_SAVED).toBe('—');   // non-string
    expect(out.PAYBACK).toBe('—');      // absent
  });

  it('strips template/HTML metacharacters (no injection into the email)', () => {
    const out = sanitizeQuoteRoiVars({ MONTHLY_SAVED: '<b>€700</b>', YEARLY_SAVED: '{{EVIL}}€8,400' });
    expect(out.MONTHLY_SAVED).toBe('b€700/b');
    expect(out.YEARLY_SAVED).toBe('EVIL€8,400');
    expect(out.MONTHLY_SAVED).not.toContain('<');
    expect(out.YEARLY_SAVED).not.toContain('{');
  });

  it('caps length at 40 chars', () => {
    const out = sanitizeQuoteRoiVars({ MONTHLY_SAVED: 'x'.repeat(200) });
    expect(out.MONTHLY_SAVED.length).toBeLessThanOrEqual(40);
  });

  it('non-object payloads are safe (all em dash)', () => {
    for (const bad of [null, 'string', 42, true, []]) {
      const out = sanitizeQuoteRoiVars(bad);
      expect(out.THREE_YEAR).toBe('—');
    }
  });
});
