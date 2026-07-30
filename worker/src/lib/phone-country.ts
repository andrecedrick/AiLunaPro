/**
 * Phone → ISO country, by international dialling prefix.
 *
 * WHY A TABLE: dialling prefixes are variable length (1–4 digits) and are NOT
 * self-delimiting. A naive `/^\+\d{1,4}/` on "+33612345678" yields "+3361", which
 * is not a country code at all. Prefix length can only be resolved by matching
 * against known codes, longest first.
 *
 * WHY IT MAY RETURN '': a wrong country on a sales lead is worse than no country —
 * an operator would dial the wrong region or mis-assign the territory. Anything
 * not in this table returns '' rather than a guess. Extend the table when a market
 * matters; never widen the matching rule.
 *
 * This is a DIFFERENT signal from the Cloudflare `CF-IPCountry` geo header. That
 * says where the request came from; this says where the number belongs. A French
 * number submitted while travelling makes them legitimately disagree, which is why
 * the lead stores both.
 */

/** ISO-3166 alpha-2 → E.164 dialling prefix (no '+'). Ordered by match length below. */
const DIAL_CODES: ReadonlyArray<readonly [string, string]> = [
  // 1-digit
  ['US', '1'],
  ['RU', '7'],
  // 2-digit
  ['EG', '20'], ['ZA', '27'], ['GR', '30'], ['NL', '31'], ['BE', '32'], ['FR', '33'],
  ['ES', '34'], ['HU', '36'], ['IT', '39'], ['RO', '40'], ['CH', '41'], ['AT', '43'],
  ['GB', '44'], ['DK', '45'], ['SE', '46'], ['NO', '47'], ['PL', '48'], ['DE', '49'],
  ['PE', '51'], ['MX', '52'], ['AR', '54'], ['BR', '55'], ['CL', '56'], ['CO', '57'],
  ['MY', '60'], ['AU', '61'], ['ID', '62'], ['PH', '63'], ['NZ', '64'], ['SG', '65'],
  ['TH', '66'], ['JP', '81'], ['KR', '82'], ['VN', '84'], ['CN', '86'], ['TR', '90'],
  ['IN', '91'], ['PK', '92'], ['NG', '234'], ['MA', '212'], ['DZ', '213'], ['TN', '216'],
  // 3-digit
  ['PT', '351'], ['LU', '352'], ['IE', '353'], ['IS', '354'], ['FI', '358'], ['LT', '370'],
  ['LV', '371'], ['EE', '372'], ['UA', '380'], ['CZ', '420'], ['SK', '421'],
  ['AE', '971'], ['IL', '972'], ['SA', '966'], ['QA', '974'], ['HK', '852'],
];

/** Longest prefix first — '351' (PT) must win over '35', and '33' over '3'. */
const BY_LENGTH = [...DIAL_CODES].sort((a, b) => b[1].length - a[1].length);

/**
 * ISO-3166 alpha-2 for a normalised phone, or '' when it cannot be determined.
 *
 * Only international-format numbers (leading '+') can be resolved: a national
 * number carries no country information, so it correctly returns ''.
 */
export function phoneCountryIso(normalizedPhone: string): string {
  if (!normalizedPhone.startsWith('+')) return '';
  const digits = normalizedPhone.slice(1);
  for (const [iso, code] of BY_LENGTH) {
    if (digits.startsWith(code)) return iso;
  }
  return '';
}

/**
 * Split an E.164 number into its calling code and national number.
 *
 * Uses the SAME longest-match table as phoneCountryIso rather than a regex. A
 * pattern like /^\+(\d{1,4})(\d+)$/ is greedy and silently wrong: it splits
 * "+33612345678" into "+3361" / "2345678". Prefixes are variable length and not
 * self-delimiting, so only a table can split them correctly.
 *
 * An unknown prefix or a national-format number yields an empty calling code and
 * the digits untouched — never an invented split.
 */
export function splitE164(normalizedPhone: string): { callingCode: string; national: string } {
  const trimmed = normalizedPhone.trim();
  if (!trimmed.startsWith('+')) return { callingCode: '', national: trimmed.replace(/\D/g, '') };
  const digits = trimmed.slice(1).replace(/\D/g, '');
  for (const [, code] of BY_LENGTH) {
    if (digits.startsWith(code)) return { callingCode: `+${code}`, national: digits.slice(code.length) };
  }
  return { callingCode: '', national: digits };
}
