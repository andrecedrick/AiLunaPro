import { describe, it, expect } from 'vitest';
import { formatMoney } from '../../src/lib/currency/format';
import { FX_SNAPSHOT, convertFromUsd } from '../../src/lib/currency/fxSnapshot';
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, type Currency } from '../../src/lib/billing/currencyConstants';

/**
 * B6.7 P0 — core currency system. These lock the two guarantees the phased
 * migration depends on: (1) the FX snapshot is deterministic + complete, and
 * (2) USD output is byte-identical to the app's prior hardcoded formatting, so
 * migrating any surface with currency = USD changes nothing visually.
 */
describe('B6.7 — FX snapshot', () => {
  it('covers every supported currency with a positive rate; USD base = 1', () => {
    for (const c of SUPPORTED_CURRENCIES) {
      expect(typeof FX_SNAPSHOT.rates[c]).toBe('number');
      expect(FX_SNAPSHOT.rates[c]).toBeGreaterThan(0);
    }
    expect(FX_SNAPSHOT.rates.usd).toBe(1);
    expect(FX_SNAPSHOT.base).toBe('usd');
    expect(FX_SNAPSHOT.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('convertFromUsd is identity for USD and applies the snapshot rate otherwise', () => {
    expect(convertFromUsd(1000, 'usd')).toBe(1000);
    expect(convertFromUsd(1000, 'eur')).toBe(1000 * FX_SNAPSHOT.rates.eur);
  });
});

describe('B6.7 — formatMoney', () => {
  it('USD output is byte-identical to the prior hardcoded format (safety net)', () => {
    const samples = [0, 1, 7, 42, 99, 100, 1600, 19200, 1234567, 1600.4, 1600.5, 50.49];
    for (const n of samples) {
      const legacy = '$' + Math.round(n).toLocaleString('en-US');
      expect(formatMoney(n, 'usd')).toBe(legacy);
    }
  });

  it('prefixes ≈ and the canonical symbol for converted currencies', () => {
    expect(formatMoney(1600, 'eur')).toBe('≈ €' + Math.round(1600 * FX_SNAPSHOT.rates.eur).toLocaleString('en-US'));
    expect(formatMoney(1000, 'gbp').startsWith('≈ £')).toBe(true);
    expect(formatMoney(1000, 'cad').startsWith('≈ C$')).toBe(true);
    expect(formatMoney(1000, 'aud').startsWith('≈ A$')).toBe(true);
  });

  it('USD never shows the ≈ approximation marker', () => {
    expect(formatMoney(1600, 'usd').includes('≈')).toBe(false);
  });

  it('respects the decimals option', () => {
    expect(formatMoney(49.99, 'usd', { decimals: 2 })).toBe('$49.99');
  });

  it('uses the canonical CURRENCY_SYMBOLS for every supported currency', () => {
    for (const c of SUPPORTED_CURRENCIES as readonly Currency[]) {
      expect(formatMoney(100, c).includes(CURRENCY_SYMBOLS[c])).toBe(true);
    }
  });
});
