/**
 * Stripe SDK wrapper for Cloudflare Workers.
 * Uses stripe-js fetch adapter — no Node.js net/http required.
 */

import Stripe from 'stripe';

/**
 * `.trim()` is not cosmetic. A whitespace-padded STRIPE_WEBHOOK_SECRET took live
 * fulfilment down for 80 minutes on 2026-08-05 (§27.4c) — a paste artefact that
 * no static check can see, because a padded secret and a wrong secret fail
 * identically. Every secret installed by hand is exposed to the same mistake, so
 * the trim belongs at the single choke point rather than at each call site.
 */
export function getStripe(secretKey: string): Stripe {
  return new Stripe(secretKey.trim(), {
    apiVersion: '2026-04-22.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export type { Stripe };
