/**
 * Luna chat — deterministic responder (S3 Phase 1).
 *
 * Phase 1 has NO LLM and NO backend: the user's question is matched, entirely
 * client-side, against a static topic table built from the product's existing
 * guidance/help structure. Nothing is sent anywhere and nothing is stored.
 *
 * Guardrails (constraints): never give a pricing or business decision — such
 * questions are redirected to the Billing page. Reuses LunaAction + the
 * route→guidance map so answers stay consistent with the rest of Luna.
 *
 * Phase 2 (later) will swap the matcher for a Claude-backed endpoint; this
 * module is the deterministic fallback that contract.
 */

import { getLunaGuidance, type LunaAction } from './guidance';
import type { Route } from '../../types/audit';

export interface LunaAnswer {
  text: string;
  actions: LunaAction[];
  helpSection?: string;
}

interface Topic {
  keywords: string[];        // lowercase substrings; any hit counts
  answer: string;
  actions?: LunaAction[];
  helpSection?: string;
}

const TOPICS: Topic[] = [
  {
    keywords: ['express', 'quick', 'fast', '5 min', 'snapshot', 'readiness'],
    answer: 'Audit Express is a fast AI-readiness snapshot — a few questions, optional website analysis, and an indicative result in about five minutes.',
    actions: [{ label: 'Run Audit Express', route: { name: 'audit-express/run' } }],
    helpSection: 'getting-started',
  },
  {
    keywords: ['audit', 'assess', 'questionnaire', 'compliance check'],
    answer: 'An audit is the full structured questionnaire — you answer section by section and your progress is saved as you go. It produces your score, findings and recommendations.',
    actions: [{ label: 'Start a new audit', route: { name: 'audit/new' } }, { label: 'See past audits', route: { name: 'audit/history' } }],
    helpSection: 'filling-the-audit',
  },
  {
    keywords: ['report', 'pdf', 'share', 'download', 'export'],
    answer: 'A report is a point-in-time snapshot of an audit you can download, rename, or share with stakeholders.',
    actions: [{ label: 'View reports', route: { name: 'reports' } }],
    helpSection: 'reports-workspaces',
  },
  {
    keywords: ['score', 'result', 'finding', 'recommendation', 'roadmap'],
    answer: 'Your audit result shows your score, the findings we identified, recommendations, and a roadmap. From there you can generate a report or see recommended agents.',
    actions: [{ label: 'See your audits', route: { name: 'audit/history' } }],
    helpSection: 'audit-vs-report',
  },
  {
    keywords: ['agent', 'automate', 'automation'],
    answer: 'Agents are tools matched to your audit that can automate the work you flagged. The catalog shows fit, integrations and expected ROI.',
    actions: [{ label: 'Browse agents', route: { name: 'agents' } }],
    helpSection: 'agents',
  },
  {
    keywords: ['token', 'credit', 'balance', 'usage'],
    answer: 'Tokens power the AI features. Your token page shows your balance, what consumes tokens, and how to top up.',
    actions: [{ label: 'Manage tokens', route: { name: 'billing/tokens' } }],
    helpSection: 'tokens',
  },
  {
    keywords: ['billing', 'plan', 'subscription', 'invoice', 'upgrade', 'pay'],
    answer: 'Billing is where you compare plans, manage your subscription, and see invoices. The page lays out the details so you can choose.',
    actions: [{ label: 'Open Billing', route: { name: 'billing' } }],
    helpSection: 'billing',
  },
  {
    keywords: ['team', 'member', 'invite', 'role', 'permission', 'colleague'],
    answer: 'Team is where you invite members and set their roles — roles control who can edit audits and reports.',
    actions: [{ label: 'Open Team', route: { name: 'team' } }],
    helpSection: 'team',
  },
  {
    keywords: ['registry', 'inventory', 'catalog of tools', 'tool list'],
    answer: 'The registry is your AI tool inventory — purpose, data, oversight and mitigations for every tool you use.',
    actions: [{ label: 'Open the registry', route: { name: 'registry' } }],
    helpSection: 'getting-started',
  },
  {
    keywords: ['setting', 'profile', 'password', 'preference', 'theme', 'language', 'account'],
    answer: 'Settings cover your profile, your organization, and product preferences like theme.',
    actions: [{ label: 'Profile settings', route: { name: 'settings/profile' } }],
    helpSection: 'settings',
  },
  {
    keywords: ['help', 'how do i', 'how to', 'guide', 'get started', 'begin', 'where do i'],
    answer: "Tell me what you want to do and I'll point you to the right place. The Help Center also covers how everything works.",
    actions: [{ label: 'Open the Help Center', route: { name: 'help' } }],
    helpSection: 'getting-started',
  },
];

// Pricing / purchase-decision phrasing — Luna must NOT advise; redirect to Billing.
const PRICING_GUARD = ['cheap', 'cheaper', 'discount', 'negotiate', 'worth it', 'should i pay', 'should i buy', 'refund', 'best plan for me', 'which plan should'];

/**
 * Deterministic answer for a user question on the given route. Pure: same input
 * → same output. No network, no storage, no PII leaves the function.
 */
export function answerLuna(query: string, routeName: Route['name']): LunaAnswer {
  const q = query.toLowerCase().trim();

  if (PRICING_GUARD.some(k => q.includes(k))) {
    return {
      text: "I can't advise on pricing or what to buy — but the Billing page lays out the plans so you can decide what fits.",
      actions: [{ label: 'Open Billing', route: { name: 'billing' } }],
      helpSection: 'billing',
    };
  }

  let best: Topic | null = null;
  let bestScore = 0;
  for (const t of TOPICS) {
    const score = t.keywords.reduce((n, k) => n + (q.includes(k) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = t; }
  }

  if (best && bestScore > 0) {
    return { text: best.answer, actions: best.actions ?? [], helpSection: best.helpSection };
  }

  // No match → fall back to what the current page is for.
  const g = getLunaGuidance(routeName);
  return {
    text: `I'm not sure about that one yet. Here's what this page is for: ${g.purpose}`,
    actions: g.actions,
    helpSection: g.helpSection,
  };
}
