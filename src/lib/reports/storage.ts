/**
 * Reports & exports — persistence seam.
 * Phase 6: localStorage only. Replace these four functions with API calls
 * in the backend phase; nothing in the UI tree changes.
 */

import type { AuditDraft } from '../../types/audit';
import type { Report, ExportEvent } from '../../types/report';
import type { AuditResult } from '../../types/scoring';
import { auditSections } from '../../data/mockAuditQuestions';

const REPORTS_KEY = 'ailunapro-reports';
const EXPORTS_KEY = 'ailunapro-export-events';

/* ── Reports ─────────────────────────────────────────────── */

export function loadReports(): Report[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReports(reports: Report[]): void {
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch {
    /* swallow — UI shell only */
  }
}

/* ── Exports ─────────────────────────────────────────────── */

export function loadExports(): ExportEvent[] {
  try {
    const raw = localStorage.getItem(EXPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExports(events: ExportEvent[]): void {
  try {
    localStorage.setItem(EXPORTS_KEY, JSON.stringify(events));
  } catch {
    /* swallow */
  }
}

/* ── Factory: draft + result → report ────────────────────── */

const INDUSTRY_LABEL: Record<string, string> = {
  finance: 'Finance',
  health: 'Healthcare',
  tech: 'Technology',
  retail: 'Retail',
  public: 'Public sector',
  other: 'Cross-industry',
};

export function createReportFromDraft(
  draft: AuditDraft,
  result: AuditResult,
): Report {
  const now = new Date();
  const industryRaw =
    typeof draft.answers['profile.industry'] === 'string'
      ? (draft.answers['profile.industry'] as string)
      : 'other';
  const industryLabel = INDUSTRY_LABEL[industryRaw] ?? 'Cross-industry';
  const dateLabel = now.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const weakest = [...result.sectionScores].sort((a, b) => a.score - b.score)[0];

  // Validate weakest.key against known section keys (defensive — table filtering relies on it).
  const knownKeys = new Set(auditSections.map(s => s.key));
  const weakestKey =
    weakest && knownKeys.has(weakest.key) ? weakest.key : undefined;

  return {
    id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: `${industryLabel} AI Compliance Report — ${dateLabel}`,
    draftId: draft.id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'published',
    scoreSnapshot: result.globalScore,
    riskSnapshot: result.riskLevel,
    answersSnapshot: { ...draft.answers },
    industry: industryRaw,
    weakestSection: weakestKey,
  };
}
