import { useState } from 'react';
import { SettingsLayout } from './SettingsLayout';
import { useTheme } from '../../context/ThemeContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import { useToast } from '../../hooks/useToast';
import {
  CURRENCY_LABELS,
  CURRENCY_VALUES,
  LANGUAGE_LABELS,
  LANGUAGE_VALUES,
  USER_PROFILE_LABELS,
  USER_PROFILE_VALUES,
  loadNotifPrefs,
  saveNotifPrefs,
  type DisplayCurrency,
  type Language,
  type NotificationPrefs,
  type UserProfile,
} from '../../lib/preferences';

/**
 * Settings — Preferences.
 * Theme (via ThemeContext), language, and email-notification preferences.
 * Lang + notif persist to localStorage; will move to Firestore later.
 */
export function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, displayCurrency, setDisplayCurrency, userProfile, setUserProfile } = usePreferences();
  const T = useLocale();
  const { showToast } = useToast();

  const [notif, setNotif] = useState<NotificationPrefs>(() => loadNotifPrefs());

  const onSelectTheme = (t: 'light' | 'dark') => {
    setTheme(t);
  };

  const onSelectLang = (next: Language) => {
    setLanguage(next);
    showToast(format(T.settings.langToast, { value: LANGUAGE_LABELS[next] }), 'success');
  };

  const onSelectCurrency = (next: DisplayCurrency) => {
    setDisplayCurrency(next);
    showToast(format(T.settings.currencyToast, { value: CURRENCY_LABELS[next] }), 'success');
  };

  const onSelectProfile = (next: UserProfile) => {
    setUserProfile(next);
    showToast(format(T.settings.profileToast, { value: USER_PROFILE_LABELS[next] }), 'success');
  };

  const onToggleNotif = (key: keyof NotificationPrefs) => {
    const updated = { ...notif, [key]: !notif[key] };
    setNotif(updated);
    saveNotifPrefs(updated);
  };

  return (
    <SettingsLayout title={T.settings.title}>
      {/* Theme */}
      <Card title={T.settings.themeTitle} hint={T.settings.themeHint}>
        <div style={{ display: 'flex', gap: 10 }}>
          <ThemeOption
            label={T.settings.light}
            active={theme === 'light'}
            onClick={() => onSelectTheme('light')}
          />
          <ThemeOption
            label={T.settings.dark}
            active={theme === 'dark'}
            onClick={() => onSelectTheme('dark')}
          />
        </div>
      </Card>

      {/* Language */}
      <Card title={T.settings.languageTitle} hint={T.settings.languageHint}>
        <select
          value={language}
          onChange={e => onSelectLang(e.target.value as Language)}
          aria-label={T.settings.languageTitle}
          style={selectStyle()}
        >
          {LANGUAGE_VALUES.map(v => (
            <option key={v} value={v}>{LANGUAGE_LABELS[v]}</option>
          ))}
        </select>
      </Card>

      {/* Display currency */}
      <Card title={T.settings.currencyTitle} hint={T.settings.currencyHint}>
        <select
          value={displayCurrency}
          onChange={e => onSelectCurrency(e.target.value as DisplayCurrency)}
          aria-label={T.settings.currencyTitle}
          style={selectStyle()}
        >
          {CURRENCY_VALUES.map(v => (
            <option key={v} value={v}>{CURRENCY_LABELS[v]}</option>
          ))}
        </select>
      </Card>

      {/* User profile (J9 Phase B-lite) */}
      <Card title={T.settings.profileTitle} hint={T.settings.profileHint}>
        <select
          value={userProfile}
          onChange={e => onSelectProfile(e.target.value as UserProfile)}
          aria-label={T.settings.profileTitle}
          style={selectStyle()}
        >
          {USER_PROFILE_VALUES.map(v => (
            <option key={v} value={v}>{USER_PROFILE_LABELS[v]}</option>
          ))}
        </select>
      </Card>

      {/* Notifications */}
      <Card title={T.settings.notificationsTitle} hint={T.settings.notificationsHint}>
        <ToggleRow
          label={T.settings.weeklyDigest}
          description={T.settings.weeklyDigestDesc}
          checked={notif.weeklyDigest}
          onChange={() => onToggleNotif('weeklyDigest')}
        />
        <ToggleRow
          label={T.settings.reportReady}
          description={T.settings.reportReadyDesc}
          checked={notif.reportReady}
          onChange={() => onToggleNotif('reportReady')}
        />
        <ToggleRow
          label={T.settings.teamActivity}
          description={T.settings.teamActivityDesc}
          checked={notif.teamActivity}
          onChange={() => onToggleNotif('teamActivity')}
        />
      </Card>
    </SettingsLayout>
  );
}

/* ── Local presentational helpers ───────────────────────────── */

function selectStyle(): React.CSSProperties {
  return {
    width: '100%',
    maxWidth: 320,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border-strong)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  };
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 22,
        marginBottom: 18,
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, marginBottom: 4, color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {hint && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0, marginBottom: 14 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function ThemeOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: '0 0 auto',
        padding: '10px 18px',
        borderRadius: 10,
        cursor: 'pointer',
        background: active ? 'var(--brand-tint-bg)' : 'transparent',
        border: active
          ? '1.5px solid var(--violet, #7C3AED)'
          : '1.5px solid var(--border-strong)',
        color: active ? 'var(--violet-text)' : 'var(--text-secondary)',
        fontWeight: 600,
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 0',
        borderTop: '1px solid var(--border)',
        cursor: 'pointer',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {description}
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: 16,
          height: 16,
          marginTop: 2,
          accentColor: 'var(--violet, #7C3AED)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />
    </label>
  );
}
