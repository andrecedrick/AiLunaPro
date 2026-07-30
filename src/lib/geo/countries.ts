/**
 * Country directory for phone entry.
 *
 * Free-text phone input produced inconsistent leads: some numbers arrived in
 * national format ("0612345678"), carrying no country information at all, so the
 * CRM could not tell a sales operator which region to call. A country selector
 * makes the dialling code explicit and lets the app store one canonical E.164
 * value.
 *
 * DATA vs DISPLAY, deliberately split:
 *   - the ISO code and dialling code are DATA and live here;
 *   - the country NAME is resolved at runtime with Intl.DisplayNames, so the list
 *     is localised in every locale the app supports without shipping ~250 country
 *     names × 8 locales of translation. Browsers without Intl.DisplayNames fall
 *     back to the ISO code, which is still unambiguous.
 *
 * Mirrors worker/src/lib/phone-country.ts (same dialling codes, reverse lookup),
 * following the existing front/worker config-mirror pattern used by quote-config.
 */

/** ISO-3166 alpha-2 → E.164 dialling code, without the '+'. */
export const COUNTRY_DIAL_CODES: Readonly<Record<string, string>> = {
  AE: '971', AR: '54',  AT: '43',  AU: '61',  BE: '32',  BR: '55',  CA: '1',
  CH: '41',  CL: '56',  CN: '86',  CO: '57',  CZ: '420', DE: '49',  DK: '45',
  DZ: '213', EE: '372', EG: '20',  ES: '34',  FI: '358', FR: '33',  GB: '44',
  GR: '30',  HK: '852', HU: '36',  ID: '62',  IE: '353', IL: '972', IN: '91',
  IS: '354', IT: '39',  JP: '81',  KR: '82',  LT: '370', LU: '352', LV: '371',
  MA: '212', MX: '52',  MY: '60',  NG: '234', NL: '31',  NO: '47',  NZ: '64',
  PE: '51',  PH: '63',  PK: '92',  PL: '48',  PT: '351', QA: '974', RO: '40',
  RU: '7',   SA: '966', SE: '46',  SG: '65',  SK: '421', TH: '66',  TN: '216',
  TR: '90',  UA: '380', US: '1',   VN: '84',  ZA: '27',
};

export interface CountryOption {
  /** ISO-3166 alpha-2, e.g. 'FR'. */
  iso:      string;
  /** Dialling code WITH the '+', e.g. '+33'. */
  dial:     string;
  /** Localised country name, or the ISO code when Intl cannot resolve it. */
  name:     string;
  /** Pre-lowercased "name iso dial" haystack for substring search. */
  haystack: string;
}

/** Localised country name for an ISO code. Falls back to the code itself. */
export function countryName(iso: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}

/** The full directory, localised and sorted by name for the given locale. */
export function countryOptions(locale: string): CountryOption[] {
  return Object.entries(COUNTRY_DIAL_CODES)
    .map(([iso, code]) => {
      const name = countryName(iso, locale);
      const dial = `+${code}`;
      return { iso, dial, name, haystack: `${name} ${iso} ${dial}`.toLowerCase() };
    })
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

/** Filter the directory by a free-text query over name, ISO code and dial code. */
export function searchCountries(options: CountryOption[], query: string): CountryOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter(o => o.haystack.includes(q));
}

/**
 * Compose a canonical E.164 number from a selected country and a typed local
 * number.
 *
 * Tolerates what people actually type: spaces and punctuation, a national trunk
 * prefix ('0' in most of Europe), and a number already pasted in full
 * international form — none of which should produce a double country code.
 */
export function toE164(iso: string, localNumber: string): string {
  const dial = COUNTRY_DIAL_CODES[iso];
  if (!dial) return '';
  const raw = localNumber.trim();

  // Already international: trust the typed country code over the selector.
  if (raw.startsWith('+')) return `+${raw.replace(/\D/g, '')}`;

  let digits = raw.replace(/\D/g, '');
  // '00' international prefix → same as '+'.
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  // Drop a single national trunk '0' (0612345678 → 612345678 for FR).
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '');
  if (!digits) return '';
  return `+${dial}${digits}`;
}
