/**
 * B6.5 — Locale registry: the single source of truth for which languages
 * exist and how to load them. `LOCALE_REGISTRY: Record<Language, LocaleMeta>`
 * means the compiler FAILS if any `Language` lacks an entry — so adding a
 * language is: (1) extend the `Language` union + label maps (preferences.ts),
 * (2) create `<code>.ts` typed `: Dict`, (3) add ONE row here. Completeness is
 * enforced on every step at compile time; no runtime registration, no service.
 *
 * English is synchronous (the bundled fallback); every other locale is a lazy
 * dynamic import, so Vite emits one code-split chunk per locale and
 * English-default users download nothing extra.
 */
import type { Language } from '../../preferences';
import { en, type Dict } from './en';

export type Dir = 'ltr' | 'rtl';

export interface LocaleMeta {
  /** Writing direction. RTL layout mirroring is a later batch (B6.6). */
  dir: Dir;
  /** Lazy catalog loader. */
  load: () => Promise<Dict>;
}

export const LOCALE_REGISTRY: Record<Language, LocaleMeta> = {
  en: { dir: 'ltr', load: async () => en },
  fr: { dir: 'ltr', load: () => import('./fr').then(m => m.fr) },
  es: { dir: 'ltr', load: () => import('./es').then(m => m.es) },
  de: { dir: 'ltr', load: () => import('./de').then(m => m.de) },
  it: { dir: 'ltr', load: () => import('./it').then(m => m.it) },
  pt: { dir: 'ltr', load: () => import('./pt').then(m => m.pt) },
  ru: { dir: 'ltr', load: () => import('./ru').then(m => m.ru) },
  zh: { dir: 'ltr', load: () => import('./zh').then(m => m.zh) },
};

/** Writing direction for a locale (defaults LTR). */
export function localeDir(locale: Language): Dir {
  return LOCALE_REGISTRY[locale]?.dir ?? 'ltr';
}

/**
 * Load a locale's catalog.
 *
 * On failure to load a NON-English locale, the dominant cause is a STALE OPEN
 * TAB after a redeploy: the old bundle requests an old locale-chunk URL, which
 * Cloudflare's SPA fallback answers with index.html (served as JS) → import
 * fails. Silently returning English there is misleading — the user picked a
 * language and gets English with no explanation (the recurring "still in
 * English after deploy" symptom). So we run the SAME deterministic recovery the
 * route chunks use (lazyWithRetry → recoverIfStaleBundle): if this tab is
 * provably stale (running build id ≠ server /version.json), force ONE reload to
 * fetch the fresh assets — which include the up-to-date locale catalog. Only
 * when staleness can't be proven (genuine offline / blocked request) do we fall
 * back to English so the app still renders.
 */
export async function loadDict(locale: Language): Promise<Dict> {
  try {
    return await LOCALE_REGISTRY[locale].load();
  } catch {
    if (locale !== 'en') {
      try {
        const { recoverIfStaleBundle } = await import('../../routing/staleBundle');
        if (await recoverIfStaleBundle()) {
          // Provably stale → a reload is in flight; suspend so no English flash.
          return await new Promise<Dict>(() => { /* page is reloading */ });
        }
      } catch { /* recovery unavailable — fall through to the English fallback */ }
    }
    return en;
  }
}

/**
 * Locales whose CONTENT the deterministic PDF writer can render today
 * (Latin-1 / WinAnsi, no font embedding). Every other UI locale falls back to
 * English in PDFs — RU (Cyrillic), ZH (CJK), and AR (Arabic/RTL) are NOT
 * rendered in PDFs yet. This keeps PDF output ASCII/Latin-only and
 * byte-deterministic. (Latin-5 PDF text rendering itself lands in B6.3.)
 */
const PDF_RENDERABLE: ReadonlySet<Language> = new Set<Language>(['en', 'fr', 'es', 'de', 'it', 'pt']);

/** Map a UI locale to the locale the PDF will actually render in. */
export function pdfLocale(locale: Language): Language {
  return PDF_RENDERABLE.has(locale) ? locale : 'en';
}
