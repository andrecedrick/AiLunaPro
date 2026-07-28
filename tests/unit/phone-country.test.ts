import { describe, it, expect } from 'vitest';
import { phoneCountryIso } from '../../worker/src/lib/phone-country';

/*
 * Dialling-prefix → ISO country.
 *
 * The first implementation of this used `/^\+\d{1,4}/`, which is greedy and
 * therefore wrong: "+33612345678" produced "+3361" — not a country code at all.
 * Prefixes are variable length and not self-delimiting, so they can only be
 * resolved by longest match against known codes.
 *
 * The contract that matters commercially: an UNKNOWN prefix must return '', never
 * a guess. A wrong country on a sales lead mis-routes the call and mis-assigns the
 * territory, which is worse than no country at all.
 */

describe('phoneCountryIso — longest-match resolution', () => {
  it.each([
    ['+33612345678',  'FR'],   // 2-digit; the case the greedy regex broke on
    ['+441234567890', 'GB'],
    ['+4915112345678','DE'],
    ['+15551234567',  'US'],   // 1-digit
    ['+79161234567',  'RU'],
    ['+351912345678', 'PT'],   // 3-digit — must beat the 2-digit '35' space
    ['+35312345678',  'IE'],
    ['+971501234567', 'AE'],
    ['+861012345678', 'CN'],
  ])('%s → %s', (phone, iso) => {
    expect(phoneCountryIso(phone)).toBe(iso);
  });

  it('prefers the longer prefix when one is a prefix of another', () => {
    // '351' (PT) and '3' must not collide; '1' (US) must not swallow '1...' codes
    // that are genuinely US anyway.
    expect(phoneCountryIso('+351912345678')).toBe('PT');
    expect(phoneCountryIso('+33100000000')).toBe('FR');
  });
});

describe('phoneCountryIso — refuses to guess', () => {
  it('returns empty for a national-format number (no country information)', () => {
    expect(phoneCountryIso('0612345678')).toBe('');
  });

  it('returns empty for an unknown prefix rather than inventing one', () => {
    expect(phoneCountryIso('+9990000000')).toBe('');
  });

  it.each(['', '+', '+0', 'not-a-phone'])('returns empty for %s', v => {
    expect(phoneCountryIso(v)).toBe('');
  });
});
