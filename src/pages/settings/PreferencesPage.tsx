import { useState } from 'react';
import { SettingsLayout } from './SettingsLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import {
  loadLanguage,
  saveLanguage,
  loadNotifPrefs,
  saveNotifPrefs,
  type Language,
  type NotificationPrefs,
} from '../../lib/preferences';

const LANGS: { value: Language; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

/**
 * Settings — Preferences.
 * Theme (via ThemeContext), language, and email-notification preferences.
 * Lang + notif persist to localStorage; will move to Firestore later.
 */
export function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [lang, setLang]   = useState<Language>(() => loadLanguage());
  const [notif, setNotif] = useState<NotificationPrefs>(() => loadNotifPrefs());

  const onSelectTheme = (t: 'light' | 'dark') => {
    setTheme(t);
  };

  const onSelectLang = (next: Language) => {
    setLang(next);
    saveLanguage(next);
    showToast(
      next === 'fr' ? 'Langue : Français.' : 'Language: English.',
      'success',
    );
  };

  const onToggleNotif = (key: keyof NotificationPrefs) => {
    const updated = { ...notif, [key]: !notif[key] };
    setNotif(updated);
    saveNotifPrefs(updated);
  };

  return (
    <SettingsLayout title="Preferences">
      {/* Theme */}
      <Card title="Theme" hint="Choose how AiLunaPro looks. Applies immediately.">
        <div style={{ display: 'flex', gap: 10 }}>
          <ThemeOption
            label="Light"
            active={theme === 'light'}
            onClick={() => onSelectTheme('light')}
          />
          <ThemeOption
            label="Dark"
            active={theme === 'dark'}
            onClick={() => onSelectTheme('dark')}
          />
        </div>
      </Card>

      {/* Language */}
      <Card title="Language" hint="Used for UI labels and emails. Some labels are not translated yet.">
        <div style={{ display: 'flex', gap: 10 }}>
          {LANGS.map((l) => (
            <Button
              key={l.value}
              variant={l.value === lang ? 'secondary' : 'ghost'}
              size="md"
              onClick={() => onSelectLang(l.value)}
            >
              {l.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Email notifications" hint="Choose which emails you receive. Sender setup arrives in a later phase.">
        <ToggleRow
          label="Weekly compliance digest"
          description="Summary of new findings and resolved actions every Monday."
          checked={notif.weeklyDigest}
          onChange={() => onToggleNotif('weeklyDigest')}
        />
        <ToggleRow
          label="Report ready"
          description="Email me when a report I requested is generated."
          checked={notif.reportReady}
          onChange={() => onToggleNotif('reportReady')}
        />
        <ToggleRow
          label="Team activity"
          description="Invitations, role changes, and member removals in my workspaces."
          checked={notif.teamActivity}
          onChange={() => onToggleNotif('teamActivity')}
        />
      </Card>
    </SettingsLayout>
  );
}

/* ── Local presentational helpers ───────────────────────────── */

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
