/**
 * Report & Export — type definitions.
 * Phase 6 — UI-side mocks only. Persistence is localStorage.
 * The shape is intentionally backend-ready: swap the storage layer later
 * with no changes to React/UI code.
 */

import type { AuditAnswers, SectionKey } from './audit';
import type { RiskLevel } from './scoring';

export type ReportStatus = 'draft' | 'published' | 'archived';

export interface Report {
  id: string;
  /** User-visible title (defaults to "<industry> AI Compliance Report — <date>"). */
  title: string;
  /** Source draft id for traceability. */
  draftId: string;
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  /** Snapshot fields for table-listing without recomputing. */
  scoreSnapshot: number;
  riskSnapshot: RiskLevel;
  /** Frozen answers — the report recomputes its result from this on detail render. */
  answersSnapshot: AuditAnswers;
  /** Optional flags lifted from the audit at snapshot time, for table filters / chips. */
  industry?: string;
  weakestSection?: SectionKey;
}

export type ExportKind = 'pdf' | 'email' | 'print' | 'share-link';

export interface ExportEvent {
  id: string;
  reportId: string;
  kind: ExportKind;
  createdAt: string;
  /** Free-form metadata: recipient email for 'email', share URL for 'share-link', etc. */
  meta?: Record<string, string>;
}
