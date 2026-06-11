import type { Route } from '../../types/audit';

/**
 * B4 — Luna AI Copilot (Option A: rule-based, decision resolved 2026-06-11).
 * A STATIC, DETERMINISTIC route→guidance map: what each page is for, the next
 * sensible actions (in-app deep links only), and the matching Help section.
 * No LLM, no scoring, no PII, no legal advice — guidance copy is descriptive
 * and reuses the product's established wording.
 */

export interface LunaAction {
  label: string;
  route: Route;
}

export interface LunaGuidance {
  /** Plain-language "why you're here" for the current page. */
  purpose: string;
  /** 1–3 deterministic next actions (deep links). */
  actions: LunaAction[];
  /** Optional Help Center section id (src/data/help/sections.tsx). */
  helpSection?: string;
}

const G: Partial<Record<Route['name'], LunaGuidance>> = {
  'dashboard': {
    purpose: 'Your compliance overview — score, risk level, maturity, and recent reports at a glance.',
    actions: [
      { label: 'Start a new audit', route: { name: 'audit/new' } },
      { label: 'Run Audit Express (5 min)', route: { name: 'audit-express/run' } },
      { label: 'View reports', route: { name: 'reports' } },
    ],
    helpSection: 'getting-started',
  },
  'journey/start': {
    purpose: 'Choose how to begin: a quick Audit Express snapshot or the full structured audit.',
    actions: [
      { label: 'Start Audit Express', route: { name: 'audit-express/run' } },
      { label: 'Create a New Audit', route: { name: 'audit/new' } },
    ],
    helpSection: 'getting-started',
  },
  'audit/new': {
    purpose: 'The full structured questionnaire — answer section by section; your progress is saved as you go.',
    actions: [{ label: 'See past audits', route: { name: 'audit/history' } }],
    helpSection: 'filling-the-audit',
  },
  'audit/result': {
    purpose: 'Your audit outcome — score, findings, recommendations, and a roadmap. Generate a report to share it.',
    actions: [
      { label: 'View reports', route: { name: 'reports' } },
      { label: 'See recommended agents', route: { name: 'agents' } },
    ],
    helpSection: 'audit-vs-report',
  },
  'audit/assistance': {
    purpose: 'A guided action plan derived from your audit — prioritized steps to improve your posture.',
    actions: [{ label: 'Back to your result', route: { name: 'audit/result' } }],
    helpSection: 'audit-vs-report',
  },
  'audit/history': {
    purpose: 'Every audit submitted in this workspace — open one to review or turn it into a report.',
    actions: [{ label: 'Start a new audit', route: { name: 'audit/new' } }],
    helpSection: 'audit-vs-report',
  },
  'reports': {
    purpose: 'Point-in-time snapshots of your audits — download, rename, or share them with stakeholders.',
    actions: [{ label: 'Start a new audit', route: { name: 'audit/new' } }],
    helpSection: 'reports-workspaces',
  },
  'reports/detail': {
    purpose: 'A single report — download the PDF, rename it, or manage its share link.',
    actions: [{ label: 'All reports', route: { name: 'reports' } }],
    helpSection: 'reports-workspaces',
  },
  'audit-express/run': {
    purpose: 'A fast AI-readiness snapshot — a few questions, optional website analysis, indicative ROI.',
    actions: [{ label: 'View saved audits', route: { name: 'audit-express/saved' } }],
    helpSection: 'getting-started',
  },
  'audit-express/saved': {
    purpose: 'Your saved Audit Express runs — open one for details, agents, and PDF export.',
    actions: [{ label: 'Run a new Audit Express', route: { name: 'audit-express/run' } }],
    helpSection: 'getting-started',
  },
  'audit-express/detail': {
    purpose: 'A saved Audit Express run — review the snapshot, recommended agents, and sharing options.',
    actions: [{ label: 'All saved audits', route: { name: 'audit-express/saved' } }],
    helpSection: 'getting-started',
  },
  'registry': {
    purpose: 'Your AI tool inventory — purpose, data, oversight, and mitigations for every tool you use.',
    actions: [
      { label: 'Open the design guide', route: { name: 'system-builder' } },
      { label: 'Run an audit', route: { name: 'audit/new' } },
    ],
    helpSection: 'getting-started',
  },
  'system-builder': {
    purpose: 'A pre-deployment design guide — six dimensions to design an AI system responsibly. Your ticks save on this device.',
    actions: [{ label: 'Record a tool in the registry', route: { name: 'registry' } }],
  },
  'agents': {
    purpose: 'The agent catalog — tools matched to your audits that can automate the work you flagged.',
    actions: [{ label: 'See your audit results', route: { name: 'audit/history' } }],
    helpSection: 'agents',
  },
  'agents/detail': {
    purpose: 'One agent in detail — fit, integrations, expected ROI, and how to get it.',
    actions: [{ label: 'Back to the catalog', route: { name: 'agents' } }],
    helpSection: 'agents',
  },
  'billing': {
    purpose: 'Plans and subscription — compare tiers, manage your plan, and see invoices.',
    actions: [{ label: 'Manage tokens', route: { name: 'billing/tokens' } }],
    helpSection: 'billing',
  },
  'billing/tokens': {
    purpose: 'Your AI token balance — usage, top-ups, and what consumes tokens.',
    actions: [{ label: 'See plans', route: { name: 'billing' } }],
    helpSection: 'tokens',
  },
  'team': {
    purpose: 'Workspace members and invitations — roles control who can edit audits and reports.',
    actions: [],
    helpSection: 'team',
  },
  'settings/profile': {
    purpose: 'Your personal profile — name, email, and password reset.',
    actions: [{ label: 'Organization settings', route: { name: 'settings/org' } }],
    helpSection: 'settings',
  },
  'settings/org': {
    purpose: 'Workspace settings — rename your organization; plan management lives in Billing.',
    actions: [{ label: 'Open Billing', route: { name: 'billing' } }],
    helpSection: 'settings',
  },
  'settings/preferences': {
    purpose: 'Product preferences — theme and personalization for this workspace.',
    actions: [],
    helpSection: 'settings',
  },
  'help': {
    purpose: 'The Help Center — how audits, reports, agents, tokens, and team management work.',
    actions: [{ label: 'Back to dashboard', route: { name: 'dashboard' } }],
  },
};

const FALLBACK: LunaGuidance = {
  purpose: 'Explore the app at your own pace — the dashboard is always one click away.',
  actions: [{ label: 'Go to dashboard', route: { name: 'dashboard' } }],
  helpSection: 'getting-started',
};

/** Deterministic lookup with a safe generic fallback for unmapped routes. */
export function getLunaGuidance(routeName: Route['name']): LunaGuidance {
  return G[routeName] ?? FALLBACK;
}
