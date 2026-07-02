/**
 * B2.3/B2.4 — anonymous→authenticated continuity + abandoned-flow resume for
 * the public lead-magnet flows (Diagnostic, ROI Calculator). Extends the J16.1
 * Audit Express pattern: localStorage only (same-origin), deterministic,
 * no server round-trips, no PII beyond what the user already typed locally.
 * Everything is best-effort: storage failures must never break the flows.
 */

import { FX_SNAPSHOT } from '../currency/fxSnapshot';

export type LeadFlowKind = 'diagnostic' | 'roi' | 'quote';

/* ── Pending result (continuity): saved on successful submit, surfaced after
      auth on the guided journey start, cleared once seen/used. No email is
      stored here — only the non-PII headline numbers for the banner. ───────── */

/**
 * Non-PII structured ROI figures carried from the ROI Calculator so a later surface
 * (e.g. the value-first Quote) can render the SAME numbers without recomputing. Field
 * names mirror RoiResult (src/types/roi.ts) — no new calculation, display-only.
 */
export interface PendingRoiSummary {
  estimatedMonthlyCostSaved:       number;
  estimatedYearlyCostSaved:        number;
  estimatedTimeSavedHoursPerMonth: number;
  estimatedPaybackMonths:          number | null;
}

function isValidRoiSummary(v: unknown): v is PendingRoiSummary {
  if (!v || typeof v !== 'object') return false;
  const r = v as Record<string, unknown>;
  const num = (x: unknown) => typeof x === 'number' && Number.isFinite(x);
  return num(r.estimatedMonthlyCostSaved) && num(r.estimatedYearlyCostSaved)
    && num(r.estimatedTimeSavedHoursPerMonth)
    && (r.estimatedPaybackMonths === null || num(r.estimatedPaybackMonths));
}

export interface PendingLeadResult {
  kind: LeadFlowKind;
  /** Headline for the post-auth banner, e.g. score or monthly savings. */
  headline: string;
  createdAt: string;
  /**
   * B6.7: the FX snapshot version in effect when this (possibly currency-converted)
   * headline was produced — recorded for reproducibility/traceability of any money
   * figure. Display conversion is deterministic per deploy (single versioned snapshot).
   */
  fxSnapshotVersion?: string;
  /**
   * Optional structured ROI numbers (set by the ROI Calculator). Consumed by the
   * value-first Quote to display monthly/yearly savings, time saved, and payback.
   * Absent for other flows → consumers must fall back gracefully.
   */
  roi?: PendingRoiSummary;
  /**
   * D2 — the quote this ROI is bound to. Stamped when the Quote page attaches the
   * (fresh) ROI to a specific generated quote so the numbers can NEVER bleed into a
   * different quote's client email. Unset until bound.
   */
  quoteId?: string;
}

const RESULT_KEY = (k: LeadFlowKind) => `ailunapro.lead.v1.${k}.result`;

/** D2 — ROI figures older than this are considered stale and are NOT reused on the
 *  Quote (block hidden, email gets em-dashes). Kept short so a client email can only
 *  ever carry ROI the user computed for THIS session. */
export const PENDING_ROI_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function savePendingResult(r: PendingLeadResult): void {
  try {
    const stamped: PendingLeadResult = { ...r, fxSnapshotVersion: r.fxSnapshotVersion ?? FX_SNAPSHOT.version };
    localStorage.setItem(RESULT_KEY(r.kind), JSON.stringify(stamped));
  } catch { /* non-fatal */ }
}

export function readPendingResult(kind: LeadFlowKind): PendingLeadResult | null {
  try {
    const raw = localStorage.getItem(RESULT_KEY(kind));
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingLeadResult;
    if (p?.kind !== kind || typeof p.headline !== 'string' || typeof p.createdAt !== 'string') return null;
    if (p.roi !== undefined && !isValidRoiSummary(p.roi)) delete p.roi; // graceful: drop malformed ROI, keep the result
    return p;
  } catch { return null; }
}

export function clearPendingResult(kind: LeadFlowKind): void {
  try { localStorage.removeItem(RESULT_KEY(kind)); } catch { /* non-fatal */ }
}

/**
 * D2 — read the pending ROI ONLY when it is safe to attach to a quote:
 *  - it exists and is well-formed,
 *  - it is FRESH (createdAt within PENDING_ROI_TTL_MS of `nowMs`), and
 *  - if `quoteId` is given AND the stored ROI is already bound, the binding matches.
 * Returns null otherwise → the caller hides the ROI block / sends no ROI to the email
 * (never wrong/stale values). `nowMs` is injected so this stays pure + testable.
 */
export function readFreshRoi(nowMs: number, quoteId?: string | null): PendingRoiSummary | null {
  const p = readPendingResult('roi');
  if (!p || !p.roi) return null;
  const age = nowMs - Date.parse(p.createdAt);
  if (!Number.isFinite(age) || age < 0 || age > PENDING_ROI_TTL_MS) return null; // stale / bad timestamp
  if (quoteId && p.quoteId && p.quoteId !== quoteId) return null;                // bound to a different quote
  return p.roi;
}

/**
 * D2 — attach the current pending ROI to a specific quote (stamp its quoteId). The
 * original createdAt is preserved so freshness is still measured from the ROI
 * computation, not the binding. Best-effort; no-op when there is no ROI to bind.
 */
export function bindRoiToQuote(quoteId: string): void {
  const p = readPendingResult('roi');
  if (!p || !p.roi) return;
  savePendingResult({ ...p, quoteId });
}

/** Most recent pending result across flows (for the journey-start banner). */
export function readLatestPendingResult(): PendingLeadResult | null {
  const all = (['diagnostic', 'roi'] as const).map(readPendingResult).filter(Boolean) as PendingLeadResult[];
  if (all.length === 0) return null;
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

/* ── Abandoned-flow progress (resume): in-progress answers persisted locally
      while the user fills the public form; cleared on submit or reset. The
      next visit offers "Resume where you left off". Client-side only. ──────── */

export interface FlowProgress {
  kind: LeadFlowKind;
  /** Opaque page-owned state (answers/step); never sent to a server. */
  state: Record<string, unknown>;
  updatedAt: string;
}

const PROGRESS_KEY = (k: LeadFlowKind) => `ailunapro.lead.v1.${k}.progress`;

export function saveFlowProgress(kind: LeadFlowKind, state: Record<string, unknown>): void {
  try {
    localStorage.setItem(PROGRESS_KEY(kind), JSON.stringify({ kind, state, updatedAt: new Date().toISOString() }));
  } catch { /* non-fatal */ }
}

export function readFlowProgress(kind: LeadFlowKind): FlowProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY(kind));
    if (!raw) return null;
    const p = JSON.parse(raw) as FlowProgress;
    if (p?.kind !== kind || typeof p.updatedAt !== 'string' || typeof p.state !== 'object' || p.state === null) return null;
    return p;
  } catch { return null; }
}

export function clearFlowProgress(kind: LeadFlowKind): void {
  try { localStorage.removeItem(PROGRESS_KEY(kind)); } catch { /* non-fatal */ }
}
