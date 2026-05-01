/**
 * Local preferences persistence (lang + email notifications).
 * Theme is owned by ThemeContext (separate concern).
 *
 * Phase H: localStorage only. Will move to Firestore /users/{uid}/preferences
 * in a later phase.
 */

export type Language = 'fr' | 'en';

export interface NotificationPrefs {
  weeklyDigest: boolean;
  reportReady: boolean;
  teamActivity: boolean;
}

const KEYS = {
  lang:  'ailunapro-lang',
  notif: 'ailunapro-notif-prefs',
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
    return v === 'en' || v === 'fr' ? v : 'fr';
  } catch {
    return 'fr';
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
