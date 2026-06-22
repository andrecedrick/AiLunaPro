/**
 * Audit Flow — type definitions (UI shell, mock data only).
 * Phase 3+ will replace these with Firestore-backed schemas.
 */

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'single'
  | 'multi'
  | 'boolean';

export interface ChoiceOption {
  value: string;
  label: string;
  hint?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  helper?: string;
  required?: boolean;
  placeholder?: string;
  options?: ChoiceOption[]; // for single | multi
}

export type SectionKey =
  | 'profile'
  | 'ai-tools'
  | 'data'
  | 'governance'
  | 'security'
  | 'transparency'
  | 'human-oversight'
  | 'training-maturity';

export interface AuditSection {
  key: SectionKey;
  title: string;
  subtitle: string;
  icon: string; // matches NavIcon ids in Sidebar where possible
  questions: Question[];
}

export type AnswerValue = string | string[] | boolean | undefined;
export type AuditAnswers = Record<string, AnswerValue>;

export interface AuditDraft {
  id: string;
  status: 'draft' | 'submitted';
  startedAt: string;
  updatedAt: string;
  submittedAt?: string;
  answers: AuditAnswers;
}

/* ── Routing (lightweight, no router dep) ─────────────────── */

export type Route =
  | { name: 'dashboard' }
  | { name: 'audit/new' }
  | { name: 'audit/result'; auditId?: string }
  | { name: 'audit/assistance'; auditId?: string }
  | { name: 'audit/history' }
  | { name: 'reports' }
  | { name: 'reports/detail'; reportId: string }
  | { name: 'reports/share'; reportId: string }
  | { name: 'registry' }
  | { name: 'login' }
  | { name: 'signup' }
  | { name: 'forgot-password' }
  | { name: 'org/create' }
  | { name: 'team' }
  | { name: 'settings/profile' }
  | { name: 'settings/org' }
  | { name: 'settings/preferences' }
  | { name: 'settings/billing' }
  | { name: 'operator' }
  | { name: 'billing' }
  | { name: 'billing/success' }
  | { name: 'billing/tokens' }
  | { name: 'agents' }
  | { name: 'agents/detail'; agentId: string }
  | { name: 'diagnostic' }
  | { name: 'roi-calculator' }
  | { name: 'quote' }
  | { name: 'quote/result'; quoteId?: string; budgetUsd?: number }
  | { name: 'quote/status'; quoteId?: string; budgetUsd?: number }
  | { name: 'my-quotes' }
  | { name: 'invoices'; quoteId?: string }
  | { name: 'admin' }
  | { name: 'help' }
  | { name: 'system-builder' }
  | { name: 'audit-express/saved' }
  | { name: 'audit-express/run' }
  | { name: 'audit-express/detail'; auditId: string }
  | { name: 'journey/start' }
  | { name: 'accept-invite' };

export type RouteName = Route['name'];
