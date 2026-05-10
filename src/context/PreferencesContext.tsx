/**
 * PreferencesContext — Phase H+.
 *
 * Single source of truth for user-level UI preferences:
 *   - language        ('fr' | 'en')
 *   - displayCurrency ('usd' for K2A; multi-currency comes later)
 *
 * Backed by localStorage helpers in lib/preferences.ts. Wrapping in
 * a context lets multiple components (sidebar widget + Settings page)
 * stay in sync within a single render tree without window event hacks.
 *
 * Theme is owned by ThemeContext (separate concern).
 */

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {
  loadLanguage,
  saveLanguage,
  loadDisplayCurrency,
  saveDisplayCurrency,
  type Language,
  type DisplayCurrency,
} from '../lib/preferences';

interface PreferencesValue {
  language:           Language;
  setLanguage:        (l: Language) => void;
  displayCurrency:    DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
}

const PreferencesContext = createContext<PreferencesValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language,        setLanguageState]        = useState<Language>(() => loadLanguage());
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() => loadDisplayCurrency());

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    saveLanguage(l);
  }, []);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    saveDisplayCurrency(c);
  }, []);

  return (
    <PreferencesContext.Provider value={{ language, setLanguage, displayCurrency, setDisplayCurrency }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
