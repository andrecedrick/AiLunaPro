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
  initialLanguage,
  saveLanguage,
  initialDisplayCurrency,
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
  /** J9 Phase B-lite: user profile (UI/copy switch only, never scoring). */
  userProfile:        UserProfile;
  setUserProfile:     (p: UserProfile) => void;
}

const PreferencesContext = createContext<PreferencesValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // First paint (synchronous → no flicker): explicit stored choice → browser
  // detection (non-persisted) → fallback. Same priority for language ('en') and
  // display currency ('usd'). B6.7 P1 wires browser-language currency detection.
  const [language,        setLanguageState]        = useState<Language>(() => initialLanguage());
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() => initialDisplayCurrency());
  const [userProfile,     setUserProfileState]     = useState<UserProfile>(() => loadUserProfile());

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    saveLanguage(l);
  }, []);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    saveDisplayCurrency(c); // explicit user choice → persist
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
