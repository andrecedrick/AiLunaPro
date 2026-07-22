/**
 * LocaleContext — B6.0 i18n foundation.
 *
 * Exposes the active translation catalog (`Dict`) for the current UI language.
 * Reads `language` from PreferencesContext (the existing source of truth — no
 * new state plumbing).
 *
 * Boot weight: the English catalog is 156 KB. It used to be a SYNCHRONOUS import
 * here, so it landed in the entry chunk and every visitor downloaded it before
 * first paint — non-English visitors then downloaded their own catalog on top.
 * Every catalog, English included, is now a lazy chunk.
 *
 * No untranslated flash and no blank frame: `main.tsx` resolves the catalog for
 * the detected language and calls `primeDict()` BEFORE `createRoot().render()`,
 * so the provider already holds a full catalog on its very first render. The
 * gate below therefore never trips in the browser — it exists only so that a
 * provider mounted without a primed cache waits for a real catalog instead of
 * rendering half-translated UI.
 *
 * Graceful degradation is preserved: `useLocale()` outside a provider returns
 * the last resolved catalog (module cache) rather than crashing.
 *
 * Deterministic, dependency-free, display-layer only. Does not touch routing,
 * Stripe, scoring, or any generated content.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePreferences } from './PreferencesContext';
import { loadDict, type Dict } from '../lib/locale/i18n';

/**
 * Last resolved catalog. Two jobs:
 *  1. seeds `LocaleProvider` so its first render is already translated;
 *  2. backs `useLocale()` for any consumer rendering outside a provider
 *     (the role the static `EN` import used to play).
 */
let cachedDict: Dict | null = null;

/**
 * Install a catalog synchronously. Called by `main.tsx` before the first render
 * (and by the test harness) so no tree ever renders without a catalog.
 */
export function primeDict(dict: Dict): void {
  cachedDict = dict;
}

/** The primed catalog, if any. Exposed for tests/diagnostics. */
export function peekDict(): Dict | null {
  return cachedDict;
}

const LocaleContext = createContext<Dict | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { language } = usePreferences();
  const [dict, setDict] = useState<Dict | null>(cachedDict);

  useEffect(() => {
    let cancelled = false;
    void loadDict(language).then(d => {
      cachedDict = d;
      if (!cancelled) setDict(d);
    });
    return () => { cancelled = true; };
  }, [language]);

  // Only reachable when nothing primed the cache (never in the browser — see the
  // header). Rendering children here would show untranslated UI, so wait.
  if (!dict) return null;

  return <LocaleContext.Provider value={dict}>{children}</LocaleContext.Provider>;
}

/**
 * Active translation catalog for the current UI language.
 *
 * Deliberately does NOT throw when used without a provider: it falls back to the
 * last resolved catalog so a component degrades gracefully rather than crashing
 * (§19.B6 (c) fallback behavior).
 */
export function useLocale(): Dict {
  const ctx = useContext(LocaleContext);
  return (ctx ?? cachedDict) as Dict;
}
