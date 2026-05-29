/**
 * Local preferences persistence (lang + email notifications).
 * Theme is owned by ThemeContext (separate concern).
 *
 * Phase H: localStorage only. Will move to Firestore /users/{uid}/preferences
 * in a later phase.
 */

/**
 * UI language preference. App is currently rendered in English only;
 * setting another value persists the user's preference for when full
 * i18n lands. Picker labels in Sidebar + Settings show in their native
 * spelling (Français, Español, etc.) regardless of selection.
 */
export type Language = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt';

export const LANGUAGE_VALUES: readonly Language[] = ['en', 'fr', 'es', 'de', 'it', 'pt'];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
};

/** Short ISO-style labels — used in the compact sidebar widget. */
export const LANGUAGE_SHORT_LABELS: Record<Language, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
};

export function isLanguage(v: unknown): v is Language {
  return typeof v === 'string' && (LANGUAGE_VALUES as readonly string[]).includes(v);
}

/**
 * UI display currency. Persisted in localStorage. Does NOT change Stripe
 * billing currency (detected server-side per checkout) or token-pack
 * pricing (always USD until multi-currency packs land in J2).
 */
export type DisplayCurrency = 'usd' | 'eur' | 'gbp' | 'cad' | 'aud';

export const CURRENCY_VALUES: readonly DisplayCurrency[] = ['usd', 'eur', 'gbp', 'cad', 'aud'];

export const CURRENCY_LABELS: Record<DisplayCurrency, string> = {
  usd: 'USD $',
  eur: 'EUR €',
  gbp: 'GBP £',
  cad: 'CAD $',
  aud: 'AUD $',
};

export function isDisplayCurrency(v: unknown): v is DisplayCurrency {
  return typeof v === 'string' && (CURRENCY_VALUES as readonly string[]).includes(v);
}

/**
 * J9 Phase B-lite: user profile preference. Affects only result-page tone
 * + resource link (UI/copy switch). Never affects scoring, findings, or any
 * regulatory mapping — those stay deterministic. Per-user only (no org-level
 * override). Persisted in localStorage like other prefs.
 */
export type UserProfile = 'enterprise' | 'entrepreneur' | 'individual';

export const USER_PROFILE_VALUES: readonly UserProfile[] = ['enterprise', 'entrepreneur', 'individual'];

export const USER_PROFILE_LABELS: Record<UserProfile, string> = {
  enterprise:   'Enterprise',
  entrepreneur: 'Entrepreneur / Startup',
  individual:   'Individual',
};

export function isUserProfile(v: unknown): v is UserProfile {
  return typeof v === 'string' && (USER_PROFILE_VALUES as readonly string[]).includes(v);
}

export interface NotificationPrefs {
  weeklyDigest: boolean;
  reportReady: boolean;
  teamActivity: boolean;
}

const KEYS = {
  lang:     'ailunapro-lang',
  notif:    'ailunapro-notif-prefs',
  currency: 'ailunapro-display-currency',
  profile:  'ailunapro-user-profile',
} as const;

const DEFAULT_NOTIF: NotificationPrefs = {
  weeklyDigest: true,
  reportReady:  true,
  teamActivity: false,
};

/* ── Language ─────────────────────────────────────────────── */

export function loadLanguage(): Language {
  try {
    const v = localStorage.getItem(KEYS.lang);
    return isLanguage(v) ? v : 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguage(lang: Language): void {
  try { localStorage.setItem(KEYS.lang, lang); } catch { /* noop */ }
}

/* ── Notifications ────────────────────────────────────────── */

export function loadNotifPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(KEYS.notif);
    if (!raw) return { ...DEFAULT_NOTIF };
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return { ...DEFAULT_NOTIF, ...parsed };
  } catch {
    return { ...DEFAULT_NOTIF };
  }
}

export function saveNotifPrefs(prefs: NotificationPrefs): void {
  try { localStorage.setItem(KEYS.notif, JSON.stringify(prefs)); } catch { /* noop */ }
}

/* ── Display currency (UI-level only, not Stripe billing currency) ── */

export function loadDisplayCurrency(): DisplayCurrency {
  try {
    const v = localStorage.getItem(KEYS.currency);
    return isDisplayCurrency(v) ? v : 'usd';
  } catch {
    return 'usd';
  }
}

export function saveDisplayCurrency(c: DisplayCurrency): void {
  try { localStorage.setItem(KEYS.currency, c); } catch { /* noop */ }
}

/**
 * J12: has the user EXPLICITLY chosen a display currency? (localStorage key
 * present). When false, smart-locale detection may set an in-memory default
 * without persisting — detection is non-persistent until the user confirms.
 */
export function hasExplicitDisplayCurrency(): boolean {
  try { return localStorage.getItem(KEYS.currency) !== null; } catch { return false; }
}

/* ── User profile (J9 Phase B-lite, UI/copy only) ─────────── */

export function loadUserProfile(): UserProfile {
  try {
    const v = localStorage.getItem(KEYS.profile);
    return isUserProfile(v) ? v : 'enterprise';
  } catch {
    return 'enterprise';
  }
}

export function saveUserProfile(p: UserProfile): void {
  try { localStorage.setItem(KEYS.profile, p); } catch { /* noop */ }
}
