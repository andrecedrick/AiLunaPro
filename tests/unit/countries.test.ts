import { describe, it, expect } from 'vitest';
import { COUNTRY_DIAL_CODES, countryOptions, searchCountries, toE164 } from '../../src/lib/geo/countries';
import { phoneCountryIso } from '../../worker/src/lib/phone-country';

/*
 * Country directory + E.164 composition.
 *
 * Free-text phone entry produced national-format leads ("0612345678") carrying no
 * country at all, so the CRM could not tell a sales operator which region to call.
 * The selector makes the dialling code explicit and the app stores one canonical
 * E.164 value.
 *
 * toE164 must tolerate what people actually type — trunk '0', spaces, '00', or a
 * number already pasted in full international form — without ever producing a
 * double country code.
 */

describe('toE164 — composition from country + local number', () => {
  it.each([
    ['FR', '612345678',        '+33612345678'],
    ['FR', '0612345678',       '+33612345678'],   // national trunk '0' dropped
    ['FR', '06 12 34 56 78',   '+33612345678'],   // spacing ignored
    ['FR', '06.12.34.56.78',   '+33612345678'],   // punctuation ignored
    ['GB', '07700900123',      '+447700900123'],
    ['US', '5551234567',       '+15551234567'],
    ['DE', '015112345678',     '+4915112345678'],
  ])('%s + %s → %s', (iso, local, expected) => {
    expect(toE164(iso, local)).toBe(expected);
  });

  it('does not double the country code when the number is already international', () => {
    expect(toE164('FR', '+33612345678')).toBe('+33612345678');
    // Even if the selector disagrees with the typed prefix, the TYPED one wins —
    // the user was explicit.
    expect(toE164('GB', '+33612345678')).toBe('+33612345678');
  });

  it("treats a '00' international prefix like '+'", () => {
    expect(toE164('FR', '0033612345678')).toBe('+33612345678');
  });

  it('returns empty for an unknown country or an empty number', () => {
    expect(toE164('ZZ', '612345678')).toBe('');
    expect(toE164('FR', '')).toBe('');
    expect(toE164('FR', '   ')).toBe('');
  });
});

describe('country directory', () => {
  it('every entry has a numeric dialling code', () => {
    for (const [iso, dial] of Object.entries(COUNTRY_DIAL_CODES)) {
      expect(iso, `${iso} must be ISO-3166 alpha-2`).toMatch(/^[A-Z]{2}$/);
      expect(dial, `${iso} dial code must be digits`).toMatch(/^\d{1,4}$/);
    }
  });

  it('is localised and sorted by name', () => {
    const en = countryOptions('en');
    expect(en.length).toBe(Object.keys(COUNTRY_DIAL_CODES).length);
    const names = en.map(o => o.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
    // Intl.DisplayNames resolves real names, not raw ISO codes.
    expect(en.find(o => o.iso === 'FR')?.name).toBe('France');
    expect(en.find(o => o.iso === 'FR')?.dial).toBe('+33');
  });

  it('renders country names in the active locale', () => {
    const fr = countryOptions('fr');
    expect(fr.find(o => o.iso === 'DE')?.name).toBe('Allemagne');
  });

  it('search matches on name, ISO code and dial code', () => {
    const opts = countryOptions('en');
    expect(searchCountries(opts, 'franc').map(o => o.iso)).toContain('FR');
    expect(searchCountries(opts, 'FR').map(o => o.iso)).toContain('FR');
    expect(searchCountries(opts, '+33').map(o => o.iso)).toContain('FR');
    expect(searchCountries(opts, '')).toHaveLength(opts.length);
    expect(searchCountries(opts, 'zzzz')).toHaveLength(0);
  });
});

describe('front directory and worker lookup agree', () => {
  it('a number composed for a country resolves back to that country', () => {
    // Guards the front/worker config mirror: if the two dial tables drift, the CRM
    // would record a phoneCountry that contradicts what the user picked.
    for (const iso of Object.keys(COUNTRY_DIAL_CODES)) {
      const e164 = toE164(iso, '612345678');
      const resolved = phoneCountryIso(e164);
      // '1' is shared by US and CA, so a round trip legitimately normalises to US.
      const expected = COUNTRY_DIAL_CODES[iso] === '1' ? 'US' : iso;
      expect(resolved, `${iso} → ${e164} resolved to ${resolved}`).toBe(expected);
    }
  });
});
