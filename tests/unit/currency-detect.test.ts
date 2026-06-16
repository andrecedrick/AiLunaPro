import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectNavigatorCurrency, initialDisplayCurrency } from '../../src/lib/preferences';

/**
 * B6.7 P1 — browser-language currency detection at boot. Locks the priority
 * order (explicit stored choice → browser language → USD), the region→currency
 * mapping, and the conservative "no guess" behavior for region-less/unmapped
 * locales. No IP/geolocation is involved — detection reads navigator.language(s)
 * only.
 */
const KEY = 'ailunapro-display-currency';

function setNavigatorLanguage(primary: string, list?: string[]) {
  Object.defineProperty(globalThis.navigator, 'language', { value: primary, configurable: true });
  Object.defineProperty(globalThis.navigator, 'languages', { value: list ?? [primary], configurable: true });
}

beforeEach(() => { try { localStorage.clear(); } catch { /* noop */ } });
afterEach(() => { try { localStorage.clear(); } catch { /* noop */ } });

describe('detectNavigatorCurrency', () => {
  it('maps the region subtag of the browser locale to a supported currency', () => {
    setNavigatorLanguage('fr-FR'); expect(detectNavigatorCurrency()).toBe('eur');
    setNavigatorLanguage('en-GB'); expect(detectNavigatorCurrency()).toBe('gbp');
    setNavigatorLanguage('en-US'); expect(detectNavigatorCurrency()).toBe('usd');
    setNavigatorLanguage('en-CA'); expect(detectNavigatorCurrency()).toBe('cad');
    setNavigatorLanguage('en-AU'); expect(detectNavigatorCurrency()).toBe('aud');
  });

  it('returns null for unmapped or region-less locales (no guess)', () => {
    setNavigatorLanguage('ja-JP'); expect(detectNavigatorCurrency()).toBeNull();
    setNavigatorLanguage('fr');    expect(detectNavigatorCurrency()).toBeNull();
  });

  it('scans the navigator.languages list for the first supported match', () => {
    setNavigatorLanguage('ja-JP', ['ja-JP', 'de-DE', 'en-US']);
    expect(detectNavigatorCurrency()).toBe('eur'); // de-DE → eur, ahead of en-US
  });
});

describe('initialDisplayCurrency — priority order', () => {
  it('1) explicit stored choice wins over browser language', () => {
    setNavigatorLanguage('fr-FR');     // would detect eur
    localStorage.setItem(KEY, 'usd');  // explicit user override
    expect(initialDisplayCurrency()).toBe('usd');
  });

  it('2) browser language is used when there is no explicit choice', () => {
    setNavigatorLanguage('fr-FR');
    expect(initialDisplayCurrency()).toBe('eur');
  });

  it('3) falls back to USD when nothing matches', () => {
    setNavigatorLanguage('ja-JP');
    expect(initialDisplayCurrency()).toBe('usd');
  });
});
