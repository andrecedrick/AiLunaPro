/**
 * B6.0 — i18n catalog entry point.
 *
 * - English (`EN`) is bundled synchronously and is the permanent fallback.
 * - Every other locale is code-split: `loadDict()` dynamic-imports its module,
 *   so EN-default users never download other locales (§9.24 "lazy chunk per
 *   locale, no heavy SDK at boot"). Static import specifiers let Vite emit one
 *   chunk per locale.
 * - Zero dependencies: this whole layer is plain TS + React context.
 */
import type { Language } from '../../preferences';
import { en, type Dict } from './en';

export type { Dict } from './en';

/** Synchronous English catalog — the default and fallback. */
export const EN: Dict = en;

/** Lazily load a locale's catalog; falls back to English on any failure. */
export async function loadDict(locale: Language): Promise<Dict> {
  try {
    switch (locale) {
      case 'fr': return (await import('./fr')).fr;
      case 'es': return (await import('./es')).es;
      case 'it': return (await import('./it')).it;
      case 'de': return (await import('./de')).de;
      case 'pt': return (await import('./pt')).pt;
      case 'en':
      default:   return EN;
    }
  } catch {
    return EN; // graceful degradation — never crash on a missing/locale chunk
  }
}

/**
 * Minimal `{name}` interpolation — no dependency, deterministic. Unknown
 * placeholders are left intact so missing params are visible, not silent.
 */
export function format(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}
