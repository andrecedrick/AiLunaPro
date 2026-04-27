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
  | { name: 'audit/result'; auditId?: string };

export type RouteName = Route['name'];
