/**
 * Analytics track() wrapper — J13 (PostHog Phase A).
 *
 * STRICT no-op unless consent === granted AND VITE_POSTHOG_KEY/HOST are set.
 * PostHog SDK is lazy-imported on first track after consent — so non-consenting
 * users (and the whole app pre-consent) never download or run it.
 *
 * Privacy: autocapture OFF, session recording OFF, manual pageview only,
 * anonymous (no identify / no PII), EU host. Event payloads must carry NO PII
 * (callers send route templates / counts only — never ids, emails, content).
 */

import { hasConsent } from './consent';

type Props = Record<string, string | number | boolean | null | undefined>;

const KEY  = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';

let initPromise: Promise<unknown> | null = null;
// Loaded PostHog instance once initialised; null until then.
let ph: { capture: (e: string, p?: Props) => void } | null = null;

function configured(): boolean {
  return typeof KEY === 'string' && KEY.length > 0;
}

/** Lazy init — only called when consent granted + configured. */
async function ensureInit(): Promise<void> {
  if (ph || !configured() || !hasConsent()) return;
  if (!initPromise) {
    initPromise = (async () => {
      const { default: posthog } = await import('posthog-js');
      posthog.init(KEY as string, {
        api_host: HOST,
        autocapture: false,            // no DOM/click autocapture
        disable_session_recording: true,
        capture_pageview: false,       // we emit manual route events
        capture_pageleave: false,
        disable_surveys: true,         // no surveys.js load — minimal footprint
        persistence: 'localStorage',   // no cross-site cookies
        // Anonymous only — we never call identify() with uid/email.
        //
        // PRIVACY: PostHog auto-attaches $current_url/$pathname/$referrer (full
        // window.location.href) to EVERY event — our hash routes carry ids
        // (#/reports/detail/<id>) and query (?topup=, ?session_id=). Strip all
        // URL-bearing props to ORIGIN ONLY. Our explicit `route` prop already
        // carries the id-stripped route name, so no analytic value is lost.
        sanitize_properties: (properties: Record<string, unknown>) => {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const URL_KEYS = [
            '$current_url', '$pathname', '$referrer', '$referring_domain',
            '$initial_current_url', '$initial_pathname', '$initial_referrer',
            '$initial_referring_domain', '$session_entry_url', '$session_entry_pathname',
          ];
          for (const k of URL_KEYS) {
            if (k in properties && properties[k] != null) {
              properties[k] = k.includes('referr') ? '' : origin;
            }
          }
          return properties;
        },
      } as Parameters<typeof posthog.init>[1]);
      ph = posthog as unknown as { capture: (e: string, p?: Props) => void };
    })();
  }
  await initPromise;
}

/**
 * Track an event. No-op without consent or configuration. Fire-and-forget;
 * never throws into callers.
 */
export function track(event: string, props?: Props): void {
  if (!hasConsent() || !configured()) return;
  void ensureInit()
    .then(() => { ph?.capture(event, props); })
    .catch(() => { /* analytics must never break the app */ });
}

/** Initialise eagerly after a fresh consent grant (so the SDK is ready). */
export function initAnalyticsIfConsented(): void {
  if (hasConsent() && configured()) void ensureInit().catch(() => {});
}

/**
 * Emit a page_view with the route NAME only — never dynamic ids. The Route
 * union encodes ids as fields (reportId/agentId/auditId), so route.name is
 * already the template ('reports/detail', 'agents/detail', …) with NO id.
 * We pass only the name string → no enumerable refs, no PII.
 */
export function trackPageView(routeName: string): void {
  track('page_view', { route: routeName });
}
