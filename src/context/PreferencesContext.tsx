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
  loadUserProfile,
  saveUserProfile,
  type Language,
  type DisplayCurrency,
  type UserProfile,
} from '../lib/preferences';

interface PreferencesValue {
  language:           Language;
  setLanguage:        (l: Language) => void;
  displayCurrency:    DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  /** J12: set display currency WITHOUT persisting (smart-locale in-memory
   *  default). Only setDisplayCurrency (explicit user choice) writes storage. */
  setDisplayCurrencyEphemeral: (c: DisplayCurrency) => void;
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

  // J12: in-memory only (no persist) — used by Billing-only smart-locale detect.
  const setDisplayCurrencyEphemeral = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
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
        setDisplayCurrencyEphemeral,
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
