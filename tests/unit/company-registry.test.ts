import { describe, it, expect } from 'vitest';
import { companyNameKey, cleanCompanyName } from '../../worker/src/lib/company-registry';

/**
 * The dedup key is the whole registry. Every duplicate company that ever reaches
 * production gets there by two spellings producing two keys, so this is the
 * function that decides whether the registry works.
 */
describe('companyNameKey', () => {
  it('folds case and collapses whitespace', () => {
    expect(companyNameKey('Acme')).toBe('acme');
    expect(companyNameKey('  ACME   Widgets  ')).toBe('acme widgets');
  });

  it('strips accents so Sté and Ste are one company', () => {
    expect(companyNameKey('Société Générale')).toBe(companyNameKey('Societe Generale'));
  });

  it('strips punctuation', () => {
    expect(companyNameKey('Acme, Inc.')).toBe(companyNameKey('Acme Inc'));
    expect(companyNameKey('A.C.M.E.')).toBe('a c m e');
  });

  it('strips trailing legal suffixes — the most common duplicate source', () => {
    for (const v of ['Acme', 'Acme Ltd', 'Acme Limited', 'Acme LLC', 'Acme, Inc.', 'ACME  GmbH', 'Acme SARL']) {
      expect(companyNameKey(v)).toBe('acme');
    }
  });

  it('strips stacked suffixes', () => {
    expect(companyNameKey('Acme Holdings Ltd Inc')).toBe('acme holdings');
  });

  it('does NOT strip a suffix that is the whole name', () => {
    // "Limited" alone is a company called Limited, not an empty key.
    expect(companyNameKey('Limited')).toBe('limited');
  });

  it('does not merge genuinely different companies', () => {
    expect(companyNameKey('Acme')).not.toBe(companyNameKey('Acme Digital'));
    expect(companyNameKey('Northwind')).not.toBe(companyNameKey('Northwind Traders'));
  });

  it('returns empty for a name carrying no letters or digits', () => {
    // The caller must treat this as "no company", not as a company called nothing.
    expect(companyNameKey('')).toBe('');
    expect(companyNameKey('   ')).toBe('');
    expect(companyNameKey('---')).toBe('');
    expect(companyNameKey('!!!')).toBe('');
  });

  it('survives a non-string without throwing', () => {
    expect(companyNameKey(undefined as unknown as string)).toBe('');
  });
});

describe('cleanCompanyName', () => {
  it('trims and collapses but preserves case and punctuation', () => {
    expect(cleanCompanyName('  Acme,   Inc.  ')).toBe('Acme, Inc.');
  });

  it('caps the length', () => {
    expect(cleanCompanyName('x'.repeat(300))).toHaveLength(120);
  });
});
