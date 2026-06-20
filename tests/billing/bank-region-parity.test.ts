import { describe, it, expect } from 'vitest';

/*
 * The frontend bank-region schema must match the worker's authoritative one,
 * else the form could collect fields the worker rejects (or miss required ones).
 */
import { REGION_FIELDS as FE, countryToRegion as feRegion } from '../../src/lib/billing/bankSettings';
import { REGION_FIELDS as BE, countryToRegion as beRegion } from '../../worker/src/lib/bank-details';

describe('bank-region parity (frontend ⇄ worker)', () => {
  it('REGION_FIELDS match field-for-field', () => {
    expect(FE).toEqual(BE);
  });

  it('countryToRegion agrees on EU / US / other', () => {
    for (const cc of ['FR', 'DE', 'US', 'JP', 'BR', 'GB', '', 'ZZ']) {
      expect(feRegion(cc)).toBe(beRegion(cc));
    }
  });
});
