/**
 * B2.3/B2.4 — anonymous→authenticated continuity + abandoned-flow resume for
 * the public lead-magnet flows (Diagnostic, ROI Calculator). Extends the J16.1
 * Audit Express pattern: localStorage only (same-origin), deterministic,
 * no server round-trips, no PII beyond what the user already typed locally.
 * Everything is best-effort: storage failures must never break the flows.
 */

export type LeadFlowKind = 'diagnostic' | 'roi';

/* ── Pending result (continuity): saved on successful submit, surfaced after
      auth on the guided journey start, cleared once seen/used. No email is
      stored here — only the non-PII headline numbers for the banner. ───────── */

export interface PendingLeadResult {
  kind: LeadFlowKind;
  /** Headline for the post-auth banner, e.g. score or monthly savings. */
  headline: string;
  createdAt: string;
}

const RESULT_KEY = (k: LeadFlowKind) => `ailunapro.lead.v1.${k}.result`;

export function savePendingResult(r: PendingLeadResult): void {
  try { localStorage.setItem(RESULT_KEY(r.kind), JSON.stringify(r)); } catch { /* non-fatal */ }
}

export function readPendingResult(kind: LeadFlowKind): PendingLeadResult | null {
  try {
    const raw = localStorage.getItem(RESULT_KEY(kind));
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingLeadResult;
    if (p?.kind !== kind || typeof p.headline !== 'string' || typeof p.createdAt !== 'string') return null;
    return p;
  } catch { return null; }
}

export function clearPendingResult(kind: LeadFlowKind): void {
  try { localStorage.removeItem(RESULT_KEY(kind)); } catch { /* non-fatal */ }
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
