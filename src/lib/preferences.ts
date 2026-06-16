/**
 * Local preferences persistence (lang + email notifications).
 * Theme is owned by ThemeContext (separate concern).
 *
 * Phase H: localStorage only. Will move to Firestore /users/{uid}/preferences
 * in a later phase.
 */

import { detectCurrencyFromLocale } from './billing/currencyDetect';

/**
 * UI language preference. Shell + Preferences UI are translated (B6.0/B6.5);
 * areas not yet migrated fall back to English. Picker labels show each
 * language in its native spelling (Français, Русский, 中文, …).
 *
 * To add a language: extend this union + the three label/value maps below,
 * create `src/lib/locale/i18n/<code>.ts` (typed `: Dict`), and add one row to
 * `LOCALE_REGISTRY` (src/lib/locale/i18n/registry.ts). The compiler enforces
 * completeness on every step. PDFs render only Latin-script locales; RU/ZH/AR
 * fall back to English in PDFs (see `pdfLocale`).
 */
export type Language = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ru' | 'zh';

export const LANGUAGE_VALUES: readonly Language[] = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh'];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
};

/** Short ISO-style labels — used in the compact sidebar widget. */
export const LANGUAGE_SHORT_LABELS: Record<Language, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  ru: 'RU',
  zh: 'ZH',
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

/** Has the user EXPLICITLY chosen a UI language? (localStorage key present). */
export function hasExplicitLanguage(): boolean {
  try { return localStorage.getItem(KEYS.lang) !== null; } catch { return false; }
}

/**
 * Best-effort UI-language detection from the browser, mapped to a SUPPORTED
 * language. No IP, no network, no PII — only `navigator.language(s)` primary
 * subtag. Returns null when nothing supported matches.
 */
export function detectNavigatorLanguage(): Language | null {
  try {
    const tags = typeof navigator !== 'undefined'
      ? [navigator.language, ...(navigator.languages ?? [])]
      : [];
    for (const tag of tags) {
      const primary = (tag ?? '').toLowerCase().split('-')[0];
      if (isLanguage(primary)) return primary;
    }
  } catch { /* noop */ }
  return null;
}

/**
 * Initial UI language for first paint: an explicit stored choice wins;
 * otherwise fall back to browser detection (NOT persisted — detection stays
 * non-persistent until the user confirms a preference, §9.24); else English.
 */
export function initialLanguage(): Language {
  if (hasExplicitLanguage()) return loadLanguage();
  return detectNavigatorLanguage() ?? 'en';
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

/**
 * Best-effort display-currency detection from the browser — B6.7 P1. Maps the
 * REGION subtag of navigator.language(s) to a SUPPORTED currency (e.g. fr-FR →
 * eur, en-GB → gbp, en-US → usd). No IP, no network, no PII — only
 * navigator.language(s). Region-less tags (e.g. "fr") and unmapped regions
 * deliberately return null so the caller falls back to USD rather than guessing.
 */
export function detectNavigatorCurrency(): DisplayCurrency | null {
  try {
    const tags = typeof navigator !== 'undefined'
      ? [navigator.language, ...(navigator.languages ?? [])]
      : [];
    for (const tag of tags) {
      const c = detectCurrencyFromLocale(tag ?? '');
      if (c && isDisplayCurrency(c)) return c;
    }
  } catch { /* noop */ }
  return null;
}

/**
 * Initial display currency for first paint (B6.7 P1). Priority:
 *   1. explicit stored choice (user selection) — absolute priority
 *   2. browser-language mapping (NON-persisted, like the language detector)
 *   3. 'usd' fallback
 * Detection runs ONCE at init and is never persisted until the user explicitly
 * picks a currency (privacy posture, §9.24). No IP/geolocation.
 */
export function initialDisplayCurrency(): DisplayCurrency {
  if (hasExplicitDisplayCurrency()) return loadDisplayCurrency();
  return detectNavigatorCurrency() ?? 'usd';
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
