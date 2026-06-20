/**
 * Analytics event registry — F1.
 *
 * Central, typed source of truth for funnel event names AND their payload
 * shapes, so the lead/monetization funnels stay consistent across the public
 * tools (quote / roi / diagnostic) and event names never drift.
 *
 * PRIVACY (hard rule): payloads carry ONLY enums / booleans / the acquisition
 * tag (src). NEVER a price, email, project text, or any id. This is enforced at
 * compile time — emit() takes the exact EventMap shape, so an object literal
 * with an extra property (e.g. a USD amount or email) is a type error, not a
 * silent leak. Runtime no-op/consent/sanitize rules still live in track.ts.
 */

import { track } from './track';

/** Which public tool a funnel event belongs to. */
export type Flow = 'quote' | 'roi' | 'diagnostic';
/** U2 budget-vs-range comparison — the verdict only, never the amount. */
export type BudgetVerdict = 'below' | 'within' | 'above';
/** U2 client pricing decision. */
export type QuoteDecision = 'accepted' | 'discussion';
/** S1 — which tool result a feedback submission came from. */
export type FeedbackSource = 'quote' | 'diagnostic' | 'roi' | 'audit';

/** Acquisition tag (?src) — added to every funnel event for attribution. */
type Src = { src?: string };

/**
 * Event name → its no-PII payload shape. Adding an entry here is the ONLY way to
 * emit that event through emit(), which keeps names + payloads consistent and
 * PII-free by construction.
 */
export interface EventMap {
  lead_flow_started:    { flow: Flow } & Src;
  score_viewed:         { flow: Flow } & Src;
  lead_flow_completed:  { flow: Flow } & Src;
  cta_clicked:          { flow: Flow; target: string } & Src;
  quote_pdf_downloaded: { flow: 'quote' } & Src;
  quote_emailed:        { flow: 'quote'; emailed: boolean } & Src;
  quote_budget_entered: { flow: 'quote'; verdict: BudgetVerdict } & Src;
  quote_decision:       { flow: 'quote'; decision: QuoteDecision } & Src;
  // S1 — feedback. NO free-text / PII in events; the blocker/suggestion text is
  // stored server-side only. satisfaction is a 1–5 rating (not PII).
  feedback_submitted:   { source: FeedbackSource; satisfaction: number } & Src;
  feedback_dismissed:   { source: FeedbackSource } & Src;
}

/** All registered event names (for tests / reference). */
export type EventName = keyof EventMap;

/**
 * Typed, no-PII event emit. Thin pass-through to track() (same consent-gated,
 * fire-and-forget, never-throws behaviour) — the value it adds is the compile-
 * time payload contract above.
 */
export function emit<K extends EventName>(event: K, props: EventMap[K]): void {
  track(event, props);
}
