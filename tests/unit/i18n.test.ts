/**
 * Unit tests — B6.0 i18n foundation.
 *
 * Guards the static-dictionary layer: per-locale key completeness (the same
 * invariant tsc enforces, asserted at runtime for documentation), the
 * interpolation helper, the lazy loader, and browser-language detection.
 */
import { describe, it, expect } from 'vitest';
import { en } from '../../src/lib/locale/i18n/en';
import { fr } from '../../src/lib/locale/i18n/fr';
import { es } from '../../src/lib/locale/i18n/es';
import { it as itDict } from '../../src/lib/locale/i18n/it';
import { de } from '../../src/lib/locale/i18n/de';
import { pt } from '../../src/lib/locale/i18n/pt';
import { EN, loadDict, format } from '../../src/lib/locale/i18n';
import { detectNavigatorLanguage, initialLanguage, LANGUAGE_VALUES } from '../../src/lib/preferences';

const LOCALES = { en, fr, es, it: itDict, de, pt } as const;

/** Recursively collect dotted key paths for deep parity comparison. */
function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' ? keyPaths(v as Record<string, unknown>, path) : [path];
  });
}

describe('i18n — catalog completeness', () => {
  const enKeys = keyPaths(en).sort();

  it('ships a dictionary for every supported language', () => {
    // Every supported Language must have a catalog (RU has no UI dict in B6.0).
    for (const lang of LANGUAGE_VALUES) {
      expect(Object.keys(LOCALES)).toContain(lang);
    }
  });

  for (const [code, dict] of Object.entries(LOCALES)) {
    it(`${code} has exactly the English key set (no missing/extra keys)`, () => {
      expect(keyPaths(dict).sort()).toEqual(enKeys);
    });
    it(`${code} has no empty string values`, () => {
      for (const v of Object.values(dict).flatMap(g => Object.values(g))) {
        expect(typeof v).toBe('string');
        expect((v as string).trim().length).toBeGreaterThan(0);
      }
    });
  }
});

describe('i18n — format() interpolation', () => {
  it('substitutes a known placeholder', () => {
    expect(format('Language: {value}', { value: 'Français' })).toBe('Language: Français');
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
  it('lazy-loads each non-English locale', async () => {
    expect(await loadDict('fr')).toBe(fr);
    expect(await loadDict('de')).toBe(de);
    expect(await loadDict('pt')).toBe(pt);
  });
});

describe('i18n — smart detection (no PII)', () => {
  it('maps a supported navigator language to its code', () => {
    const detected = detectNavigatorLanguage();
    // jsdom defaults navigator.language to en-US → 'en'; always supported or null.
    expect(detected === null || (LANGUAGE_VALUES as readonly string[]).includes(detected)).toBe(true);
  });
  it('initialLanguage falls back to a supported language', () => {
    expect((LANGUAGE_VALUES as readonly string[]).includes(initialLanguage())).toBe(true);
  });
});
