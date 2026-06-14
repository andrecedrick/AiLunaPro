/**
 * B6.0 — i18n foundation: canonical English dictionary.
 *
 * This module defines the SHAPE of the translation catalog: `Dict = typeof en`.
 * Every other locale is typed `: Dict`, so the TypeScript build gate
 * (`tsc -b --force`) FAILS if a locale is missing a key — completeness is
 * enforced at compile time, no runtime key-checking needed.
 *
 * English is also the permanent FALLBACK: it is bundled synchronously and
 * shown for any locale that fails to load (graceful degradation, §19.B6 (c)).
 *
 * SCOPE (B6.0): neutral UI chrome only — navigation, the app shell, and the
 * Preferences page. NO disclaimer / regulatory / audit copy lives here; that
 * is deferred to later batches that carry the mandatory human-review gate
 * (§9.24). Keep this catalog free of legal phrasing.
 */
export const en = {
  /** Primary sidebar navigation labels, keyed by nav-item id (mockNavItems). */
  nav: {
    dashboard:             'Dashboard',
    'new-audit':           'New Audit',
    reports:               'Reports',
    'audit-history':       'Audit history',
    'audit-express-run':   'Run Audit Express',
    'audit-express-saved': 'Saved Audits',
    registry:              'AI Registry',
    'system-builder':      'System Builder',
    agents:                'Agents',
    team:                  'Team',
    settings:              'Settings',
    billing:               'Billing',
    help:                  'Help',
  },
  /** App-shell chrome (sidebar header, org switcher, sign-out, pref widget). */
  shell: {
    complianceSuite:  'Compliance Suite',
    signOut:          'Sign out',
    workspaces:       'Workspaces',
    createWorkspace:  'Create workspace',
    searchWorkspaces: 'Search workspaces…',
    language:         'Language',
    currency:         'Currency',
  },
  /** Settings → Preferences page. */
  settings: {
    title:               'Preferences',
    themeTitle:          'Theme',
    themeHint:           'Choose how AiLunaPro looks. Applies immediately.',
    light:               'Light',
    dark:                'Dark',
    languageTitle:       'Language',
    languageHint:        'Used for UI labels and emails. Translation is rolling out section by section; untranslated areas stay in English.',
    currencyTitle:       'Default currency',
    currencyHint:        'Display preference only. Billing and token packs remain in USD.',
    profileTitle:        'Profile',
    profileHint:         'Tunes the tone of guidance and the recommended starting resource. Never changes scoring, findings, or any regulatory mapping.',
    notificationsTitle:  'Email notifications',
    notificationsHint:   'Choose which emails you receive. Sender setup arrives in a later phase.',
    weeklyDigest:        'Weekly compliance digest',
    weeklyDigestDesc:    'Summary of new findings and resolved actions every Monday.',
    reportReady:         'Report ready',
    reportReadyDesc:     'Email me when a report I requested is generated.',
    teamActivity:        'Team activity',
    teamActivityDesc:    'Invitations, role changes, and member removals in my workspaces.',
    langToast:           'Language: {value}',
    currencyToast:       'Currency: {value}',
    profileToast:        'Profile: {value}',
  },
} as const;

export type Dict = {
  nav:      Record<keyof typeof en.nav, string>;
  shell:    Record<keyof typeof en.shell, string>;
  settings: Record<keyof typeof en.settings, string>;
};
