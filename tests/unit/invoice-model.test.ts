import { describe, it, expect } from 'vitest';

/**
 * P1.1 — invoice money, tax treatment and numbering.
 *
 * These are the tests that stop an invoice from being wrong in a way a customer's
 * accountant will find: totals that do not add up, VAT charged where it must be
 * reverse-charged, and numbers that repeat or skip.
 */

import {
  decideTax, computeTotals, toMinor, formatMoney, formatRate,
  toParty, partyLines, missingSupplierFields,
  isWellFormedVatNumber, normaliseVatNumber, EU_VAT_COUNTRIES,
} from '../../worker/src/lib/invoice-model';
import { formatInvoiceNumber, parseInvoiceNumber } from '../../worker/src/lib/invoice-number';
import { validateInvoiceSettings, readInvoiceSettings, dueDateIso, MAX_TAX_RATE_BP } from '../../worker/src/lib/invoice-settings';

const party = (o: Record<string, unknown> = {}) => toParty({
  legalName: 'Acme SARL', addressLines: ['1 rue de la Paix'], postalCode: '75002',
  city: 'Paris', country: 'FR', vatNumber: 'FR12345678901', ...o,
});

describe('money is exact', () => {
  it('subtotal plus tax always equals the total', () => {
    // The property that makes an invoice an invoice. Checked across awkward
    // amounts and rates where float arithmetic drifts.
    for (const net of [1, 7, 33, 999, 100_00, 123_45, 999_999_99]) {
      for (const bp of [0, 550, 1900, 2000, 2100, 2700]) {
        const t = computeTotals(net, 'eur', { treatment: 'standard', rateBp: bp, note: '', customerVatWellFormed: false });
        expect(t.subtotalMinor + t.taxMinor).toBe(t.totalMinor);
        expect(Number.isInteger(t.taxMinor)).toBe(true);
      }
    }
  });

  it('computes a familiar case exactly', () => {
    const t = computeTotals(100_00, 'eur', { treatment: 'standard', rateBp: 2000, note: '', customerVatWellFormed: false });
    expect(t).toMatchObject({ subtotalMinor: 10000, taxMinor: 2000, totalMinor: 12000 });
  });

  it('rounds the tax line half-up, once', () => {
    // 33.33 at 19.6% = 6.53268 → 6.53, not 6.54 and not a float tail.
    const t = computeTotals(33_33, 'eur', { treatment: 'standard', rateBp: 1960, note: '', customerVatWellFormed: false });
    expect(t.taxMinor).toBe(653);
    expect(t.totalMinor).toBe(3986);
  });

  it('never produces negative or fractional money', () => {
    const t = computeTotals(-500, 'usd', { treatment: 'standard', rateBp: 2000, note: '', customerVatWellFormed: false });
    expect(t.subtotalMinor).toBe(0);
    expect(t.totalMinor).toBe(0);
  });

  it('converts major units without float drift', () => {
    expect(toMinor(0.1 + 0.2)).toBe(30);   // 0.30000000000000004 in floats
    expect(toMinor(1234.56)).toBe(123456);
    expect(toMinor(Number.NaN)).toBe(0);
  });

  it('formats money identically everywhere, without locale data', () => {
    expect(formatMoney(123456789, 'eur')).toBe('1,234,567.89 EUR');
    expect(formatMoney(5, 'usd')).toBe('0.05 USD');
    expect(formatMoney(0, 'gbp')).toBe('0.00 GBP');
    expect(formatMoney(-250, 'cad')).toBe('-2.50 CAD');
  });

  it('formats rates from basis points', () => {
    expect(formatRate(2000)).toBe('20.00%');
    expect(formatRate(1960)).toBe('19.60%');
    expect(formatRate(0)).toBe('0.00%');
  });
});

describe('tax treatment', () => {
  const FR = party();
  const supplierFR = party({ vatNumber: 'FR99999999999' });

  it('charges the standard rate on a domestic supply', () => {
    const d = decideTax(supplierFR, FR, 2000);
    expect(d).toMatchObject({ treatment: 'standard', rateBp: 2000 });
  });

  it('REVERSE CHARGES an EU B2B supply with a valid VAT number', () => {
    // Charging VAT here overcharges a business customer who cannot reclaim it.
    const de = party({ country: 'DE', vatNumber: 'DE123456789' });
    const d = decideTax(supplierFR, de, 2000);
    expect(d.treatment).toBe('reverse_charge');
    expect(d.rateBp).toBe(0);
    expect(d.note).toContain('Article 196');
  });

  it('charges VAT to an EU customer with NO VAT number', () => {
    // Treated as B2C. Over-charged VAT is refundable; under-charged VAT is the
    // supplier's own liability, so charging is the safe direction.
    const de = party({ country: 'DE', vatNumber: '' });
    expect(decideTax(supplierFR, de, 2000).treatment).toBe('standard');
  });

  it('charges VAT when the customer VAT number is malformed', () => {
    const de = party({ country: 'DE', vatNumber: 'DE-NOT-A-NUMBER' });
    const d = decideTax(supplierFR, de, 2000);
    expect(d.treatment).toBe('standard');
    expect(d.customerVatWellFormed).toBe(false);
  });

  it('zero-rates an export outside the EU', () => {
    const us = party({ country: 'US', vatNumber: '' });
    const d = decideTax(supplierFR, us, 2000);
    expect(d).toMatchObject({ treatment: 'export', rateBp: 0 });
    expect(d.note).toContain('Outside the scope');
  });

  it('charges no EU VAT when the supplier is outside the EU', () => {
    const supplierUS = party({ country: 'US', vatNumber: '' });
    expect(decideTax(supplierUS, party({ country: 'DE' }), 2000).treatment).toBe('none');
  });

  it('falls back to charging when the customer country is unknown', () => {
    expect(decideTax(supplierFR, party({ country: '', vatNumber: '' }), 2000).treatment).toBe('standard');
  });

  it('reverse charge produces a zero tax line, not a hidden one', () => {
    const de = party({ country: 'DE', vatNumber: 'DE123456789' });
    const t = computeTotals(100_00, 'eur', decideTax(supplierFR, de, 2000));
    expect(t).toMatchObject({ taxMinor: 0, totalMinor: 10000, treatment: 'reverse_charge' });
  });
});

describe('VAT number format checking', () => {
  it('normalises spacing and case', () => {
    expect(normaliseVatNumber(' fr 123 456 789.01 ')).toBe('FR12345678901');
  });

  it('accepts well-formed numbers per country', () => {
    expect(isWellFormedVatNumber('DE123456789', 'DE')).toBe(true);
    expect(isWellFormedVatNumber('NL123456789B01', 'NL')).toBe(true);
    expect(isWellFormedVatNumber('IT12345678901', 'IT')).toBe(true);
  });

  it('rejects the wrong shape for the country', () => {
    expect(isWellFormedVatNumber('DE12345', 'DE')).toBe(false);
    expect(isWellFormedVatNumber('', 'DE')).toBe(false);
  });

  it('accepts a plausible shape for a country we have no rule for', () => {
    // Rejecting a valid number just because we lack a pattern would wrongly
    // charge VAT to a legitimate business.
    expect(isWellFormedVatNumber('NO123456789MVA', 'NO')).toBe(true);
  });

  it('covers the whole EU in the country set', () => {
    expect(EU_VAT_COUNTRIES.size).toBe(27);
    expect(EU_VAT_COUNTRIES.has('FR')).toBe(true);
    expect(EU_VAT_COUNTRIES.has('GB')).toBe(false);  // post-Brexit
  });
});

describe('parties', () => {
  it('reports the fields a legal invoice cannot omit', () => {
    expect(missingSupplierFields(toParty({}))).toEqual(['legalName', 'addressLines', 'city', 'country']);
    expect(missingSupplierFields(party())).toEqual([]);
  });

  it('renders an address block without empty lines', () => {
    expect(partyLines(party())).toEqual([
      'Acme SARL', '1 rue de la Paix', '75002 Paris', 'FR', 'VAT: FR12345678901',
    ]);
  });

  it('accepts flat address fields as well as an array', () => {
    const p = toParty({ legalName: 'X', addressLine1: 'A', addressLine2: 'B', country: 'de' });
    expect(p.addressLines).toEqual(['A', 'B']);
    expect(p.country).toBe('DE');
  });

  it('never throws on malformed input', () => {
    expect(toParty(null).legalName).toBe('');
    expect(toParty({ legalName: 42, addressLines: 'nope' }).legalName).toBe('');
  });
});

describe('settings', () => {
  it('clamps an out-of-range tax rate and says so', () => {
    // A typo of 200 for 20% must not bill anyone at 200% VAT.
    const r = validateInvoiceSettings({ taxRateBp: 20000 });
    expect(r.value.taxRateBp).toBe(MAX_TAX_RATE_BP);
    expect(r.errors.taxRateBp).toBe('clamped_to_max');
  });

  it('rejects an unsupported currency without breaking the save', () => {
    const r = validateInvoiceSettings({ currency: 'xyz' });
    expect(r.value.currency).toBe('usd');
    expect(r.errors.currency).toBe('unsupported');
  });

  it('flags a malformed supplier VAT number', () => {
    expect(validateInvoiceSettings({ supplier: { country: 'DE', vatNumber: 'nope' } }).errors.supplierVatNumber)
      .toBe('malformed');
  });

  it('parses the supplier back out of its stored JSON string', () => {
    // Stored flat as a string; reading it as an object would blank the issuer
    // block on every invoice.
    const stored = { supplier: JSON.stringify(party()), taxRateBp: 2000, currency: 'eur' };
    const s = readInvoiceSettings(stored);
    expect(s.supplier.legalName).toBe('Acme SARL');
    expect(s.taxRateBp).toBe(2000);
    expect(s.currency).toBe('eur');
  });

  it('survives a corrupt stored supplier', () => {
    expect(readInvoiceSettings({ supplier: '{not json' }).supplier.legalName).toBe('');
  });

  it('computes the due date from the issue date', () => {
    expect(dueDateIso('2026-08-02T09:00:00.000Z', 14).slice(0, 10)).toBe('2026-08-16');
    expect(dueDateIso('not-a-date', 14)).toBe('');
  });
});

describe('invoice numbering format', () => {
  it('zero-pads so numbers sort lexically as well as numerically', () => {
    expect(formatInvoiceNumber(2026, 42)).toBe('INV-2026-000042');
    const sorted = [1, 2, 10, 100].map(n => formatInvoiceNumber(2026, n));
    expect([...sorted].sort()).toEqual(sorted);
  });

  it('round-trips', () => {
    expect(parseInvoiceNumber('INV-2026-000042')).toEqual({ year: 2026, sequence: 42 });
  });

  it('rejects anything that is not one of ours', () => {
    expect(parseInvoiceNumber('quote_abc123')).toBeNull();
    expect(parseInvoiceNumber('INV-26-42')).toBeNull();
  });
});
