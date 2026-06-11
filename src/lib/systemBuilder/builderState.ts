/**
 * B3 — System Builder local progress (decision resolved 2026-06-11: v1.x adds
 * localStorage-only persistence of the current step + per-step checklist ticks;
 * cross-device/Firestore persistence explicitly deferred).
 *
 * Same discipline as journeyState/pendingLead: deterministic, client-side only,
 * no PII (ticks are booleans keyed by static step/item indices), best-effort —
 * storage failures must never break the page.
 */

const STEP_KEY  = 'ailunapro.sysbuilder.v1.step';
const TICKS_KEY = 'ailunapro.sysbuilder.v1.ticks';

/** Last visited step index (caller clamps to the live step count). */
export function readBuilderStep(): number {
  try {
    const n = Number(localStorage.getItem(STEP_KEY));
    return Number.isInteger(n) && n >= 0 ? n : 0;
  } catch { return 0; }
}

export function saveBuilderStep(idx: number): void {
  try { localStorage.setItem(STEP_KEY, String(idx)); } catch { /* non-fatal */ }
}

export type BuilderTicks = Record<string, boolean>; // key = `${stepKey}:${itemIdx}`

export function readBuilderTicks(): BuilderTicks {
  try {
    const raw = localStorage.getItem(TICKS_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    if (typeof p !== 'object' || p === null || Array.isArray(p)) return {};
    const out: BuilderTicks = {};
    for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
      if (v === true) out[k] = true;
    }
    return out;
  } catch { return {}; }
}

export function saveBuilderTicks(ticks: BuilderTicks): void {
  try { localStorage.setItem(TICKS_KEY, JSON.stringify(ticks)); } catch { /* non-fatal */ }
}

export function tickKey(stepKey: string, itemIdx: number): string {
  return `${stepKey}:${itemIdx}`;
}
