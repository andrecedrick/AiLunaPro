/**
 * LocaleContext — B6.0 i18n foundation.
 *
 * Exposes the active translation catalog (`Dict`) for the current UI language.
 * Reads `language` from PreferencesContext (the existing source of truth — no
 * new state plumbing) and lazily swaps in that locale's catalog; English is
 * shown synchronously until a non-English catalog resolves.
 *
 * Deliberately does NOT throw when used without a provider: it defaults to the
 * English catalog so any component degrades gracefully to English rather than
 * crashing (§19.B6 (c) fallback behavior). Consume via `useLocale()`.
 *
 * Deterministic, dependency-free, display-layer only. Does not touch routing,
 * Stripe, scoring, or any generated content.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePreferences } from './PreferencesContext';
import { EN, loadDict, type Dict } from '../lib/locale/i18n';

const LocaleContext = createContext<Dict>(EN);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { language } = usePreferences();
  const [dict, setDict] = useState<Dict>(EN);

  useEffect(() => {
    if (language === 'en') { setDict(EN); return; }
    let cancelled = false;
    void loadDict(language).then(d => { if (!cancelled) setDict(d); });
    return () => { cancelled = true; };
  }, [language]);

  return <LocaleContext.Provider value={dict}>{children}</LocaleContext.Provider>;
}

/** Active translation catalog for the current UI language (English fallback). */
export function useLocale(): Dict {
  return useContext(LocaleContext);
}
