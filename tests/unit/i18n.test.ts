/**
 * Unit tests — B6.0/B6.5 i18n foundation + registry.
 *
 * Registry-driven: locales are enumerated from LANGUAGE_VALUES and loaded via
 * loadDict(), so a newly-added language is covered automatically (no test edit
 * needed). Guards per-locale key completeness (the invariant tsc enforces,
 * asserted at runtime), the interpolation helper, the lazy loader, the
 * PDF-locale fallback policy, and browser-language detection.
 */
import { describe, it, expect } from 'vitest';
import { en } from '../../src/lib/locale/i18n/en';
import { EN, loadDict, format, pdfLocale, localeDir } from '../../src/lib/locale/i18n';
import { detectNavigatorLanguage, initialLanguage, LANGUAGE_VALUES, type Language } from '../../src/lib/preferences';

/** Recursively collect dotted key paths for deep parity comparison. */
function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' ? keyPaths(v as Record<string, unknown>, path) : [path];
  });
}

/** Recursively collect all leaf string values (dicts nest beyond 2 levels). */
function leafValues(obj: Record<string, unknown>): unknown[] {
  return Object.values(obj).flatMap(v =>
    v && typeof v === 'object' ? leafValues(v as Record<string, unknown>) : [v],
  );
}

const PDF_LATIN: Language[] = ['en', 'fr', 'es', 'de', 'it', 'pt'];
const NON_LATIN: Language[] = ['ru', 'zh'];

describe('i18n — catalog completeness (registry-driven)', () => {
  const enKeys = keyPaths(en).sort();

  for (const code of LANGUAGE_VALUES) {
    it(`${code} loads and has exactly the English key set`, async () => {
      const dict = await loadDict(code);
      expect(keyPaths(dict).sort()).toEqual(enKeys);
    });
    it(`${code} has no empty / placeholder string values`, async () => {
      const dict = await loadDict(code);
      for (const v of leafValues(dict)) {
        expect(typeof v).toBe('string');
        expect((v as string).trim().length).toBeGreaterThan(0);
        expect(v as string).not.toMatch(/TODO\[/); // un-validated draft marker
      }
    });
  }
});

describe('i18n — format() interpolation', () => {
  it('substitutes a known placeholder', () => {
    expect(format('Language: {value}', { value: 'Русский' })).toBe('Language: Русский');
  });
  it('leaves unknown placeholders intact (visible, not silent)', () => {
    expect(format('Hi {name}', {})).toBe('Hi {name}');
  });
  it('handles numbers and repeated placeholders', () => {
    expect(format('{n} of {n}', { n: 3 })).toBe('3 of 3');
  });
});

describe('i18n — loadDict()', () => {
  it('returns English synchronously as EN and via loadDict("en")', async () => {
    expect(EN).toBe(en);
    expect(await loadDict('en')).toBe(en);
  });
  it('lazy-loads non-English locales as complete catalogs', async () => {
    const ru = await loadDict('ru');
    const zh = await loadDict('zh');
    expect(ru.nav.dashboard).toBe('Панель');
    expect(zh.shell.signOut).toBe('退出登录');
  });
});

describe('i18n — pdfLocale() fallback policy', () => {
  it('keeps Latin-script locales for PDF rendering', () => {
    for (const code of PDF_LATIN) expect(pdfLocale(code)).toBe(code);
  });
  it('falls non-Latin locales back to English in PDFs', () => {
    for (const code of NON_LATIN) expect(pdfLocale(code)).toBe('en');
  });
});

describe('i18n — direction', () => {
  it('all B6.5 locales are LTR (RTL/Arabic arrives in B6.6)', () => {
    for (const code of LANGUAGE_VALUES) expect(localeDir(code)).toBe('ltr');
  });
});

describe('i18n — smart detection (no PII)', () => {
  it('maps a supported navigator language to its code or null', () => {
    const detected = detectNavigatorLanguage();
    expect(detected === null || (LANGUAGE_VALUES as readonly string[]).includes(detected)).toBe(true);
  });
  it('initialLanguage falls back to a supported language', () => {
    expect((LANGUAGE_VALUES as readonly string[]).includes(initialLanguage())).toBe(true);
  });
});
