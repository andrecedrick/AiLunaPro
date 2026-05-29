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
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  loadLanguage,
  saveLanguage,
  loadDisplayCurrency,
  saveDisplayCurrency,
  loadUserProfile,
  saveUserProfile,
  hasExplicitDisplayCurrency,
  type Language,
  type DisplayCurrency,
  type UserProfile,
} from '../lib/preferences';
import { fetchSuggestedCurrency } from '../lib/locale/geoService';

interface PreferencesValue {
  language:           Language;
  setLanguage:        (l: Language) => void;
  displayCurrency:    DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  /** J9 Phase B-lite: user profile (UI/copy switch only, never scoring). */
  userProfile:        UserProfile;
  setUserProfile:     (p: UserProfile) => void;
}

const PreferencesContext = createContext<PreferencesValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language,        setLanguageState]        = useState<Language>(() => loadLanguage());
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() => loadDisplayCurrency());
  const [userProfile,     setUserProfileState]     = useState<UserProfile>(() => loadUserProfile());

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    saveLanguage(l);
  }, []);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    saveDisplayCurrency(c); // explicit user choice → persist
  }, []);

  // J12 smart-locale: if the user has NOT explicitly chosen a currency, set an
  // in-memory default from geo (display-only). NON-PERSISTENT — only an explicit
  // selector change (setDisplayCurrency) writes localStorage.
  useEffect(() => {
    if (hasExplicitDisplayCurrency()) return;
    let active = true;
    fetchSuggestedCurrency()
      .then(c => { if (active && c) setDisplayCurrencyState(c); })
      .catch(() => { /* keep usd default */ });
    return () => { active = false; };
  }, []);

  const setUserProfile = useCallback((p: UserProfile) => {
    setUserProfileState(p);
    saveUserProfile(p);
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        language,
        setLanguage,
        displayCurrency,
        setDisplayCurrency,
        userProfile,
        setUserProfile,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
