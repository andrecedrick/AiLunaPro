/**
 * B6.0/B6.5 — i18n catalog entry point.
 *
 * - English (`EN`) is bundled synchronously and is the permanent fallback.
 * - All locale loading + direction + the manual-extension contract live in
 *   `registry.ts` (the single source of truth). This module just re-exports
 *   the public surface and the `format()` interpolation helper.
 * - Zero dependencies: plain TS + React context, no i18n SDK.
 */
export type { Dict } from './en';
export { loadDict, localeDir, pdfLocale, LOCALE_REGISTRY, type Dir, type LocaleMeta } from './registry';

/*
 * There is deliberately no synchronous `EN` export. Re-exporting the 156 KB
 * catalog here pulled it into the ENTRY chunk for every visitor. English is now
 * a lazy chunk reached via `loadDict('en')`, primed before React renders
 * (main.tsx) so nothing ever renders without a catalog. Modules that need the
 * catalog at module scope import `./en` directly — they are themselves lazy.
 */

/**
 * Minimal `{name}` interpolation — no dependency, deterministic. Unknown
 * placeholders are left intact so missing params are visible, not silent.
 */
export function format(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}
