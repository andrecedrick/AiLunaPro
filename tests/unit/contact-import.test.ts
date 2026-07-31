import { describe, it, expect } from 'vitest';
import { planImport, IMPORT_MAX_ROWS } from '../../worker/src/lib/contact-import';

const row = (o: Record<string, string>) => ({ name: 'Ada Lovelace', company: 'Acme', ...o });
const none = new Set<string>();

describe('contact-import — planImport', () => {
  it('accepts a complete row and normalises the phone', () => {
    const { valid, rejected } = planImport([row({ email: 'Ada@Example.COM', phone: '+33 6 12 34 56 78', countryCode: 'fr' })], none);
    expect(rejected).toEqual([]);
    expect(valid[0]).toMatchObject({
      email: 'ada@example.com',       // lowercased — it is the dedup key
      phone: '+33612345678',
      countryCode: 'FR',
      phoneCountry: 'FR',             // derived from the dial code, not the column
      company: 'Acme',
    });
  });

  it('rejects a bad email, a missing name and a missing company', () => {
    const { valid, rejected } = planImport([
      row({ email: 'not-an-email' }),
      { email: 'a@x.com', company: 'Acme' },
      { email: 'b@x.com', name: 'Bob' },
    ], none);
    expect(valid).toEqual([]);
    expect(rejected.map(r => r.code)).toEqual(['INVALID_EMAIL', 'MISSING_NAME', 'MISSING_COMPANY']);
    // Row numbers are 1-based so they map to the operator's spreadsheet.
    expect(rejected.map(r => r.row)).toEqual([1, 2, 3]);
  });

  it('rejects an unusable phone rather than storing a number sales cannot dial', () => {
    expect(planImport([row({ email: 'a@x.com', phone: '12' })], none).rejected[0].code).toBe('INVALID_PHONE');
    // Absent is fine — phone is optional.
    expect(planImport([row({ email: 'a@x.com' })], none).valid[0].phone).toBe('');
  });

  it('rejects a country that is not ISO-3166 alpha-2', () => {
    expect(planImport([row({ email: 'a@x.com', countryCode: 'France' })], none).rejected[0].code).toBe('INVALID_COUNTRY');
    expect(planImport([row({ email: 'a@x.com', countryCode: '' })], none).valid[0].countryCode).toBe('');
  });

  it('DEDUPES within the file — first occurrence wins', () => {
    const { valid, rejected } = planImport([
      row({ email: 'dup@x.com', company: 'First' }),
      row({ email: 'DUP@x.com', company: 'Second' }),
    ], none);
    expect(valid).toHaveLength(1);
    expect(valid[0].company).toBe('First');
    expect(rejected[0]).toMatchObject({ row: 2, code: 'DUPLICATE_IN_FILE' });
  });

  it('DEDUPES against contacts already in the org', () => {
    const { valid, rejected } = planImport([row({ email: 'known@x.com' })], new Set(['known@x.com']));
    expect(valid).toEqual([]);
    expect(rejected[0].code).toBe('DUPLICATE_EXISTING');
  });

  it('a bad row never blocks the good ones — partial import is the point', () => {
    const { valid, rejected } = planImport([
      row({ email: 'good1@x.com' }),
      row({ email: 'bad' }),
      row({ email: 'good2@x.com' }),
    ], none);
    expect(valid.map(v => v.email)).toEqual(['good1@x.com', 'good2@x.com']);
    expect(rejected).toHaveLength(1);
  });

  it('handles a full batch without choking', () => {
    const rows = Array.from({ length: IMPORT_MAX_ROWS }, (_, i) => row({ email: `u${i}@x.com` }));
    expect(planImport(rows, none).valid).toHaveLength(IMPORT_MAX_ROWS);
  });

  it('ignores non-string cells instead of stringifying them', () => {
    const { rejected } = planImport([{ name: 42, email: 'a@x.com', company: null } as never], none);
    expect(rejected[0].code).toBe('MISSING_NAME');
  });
});
