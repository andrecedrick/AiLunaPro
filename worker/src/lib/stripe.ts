/**
 * Stripe SDK wrapper for Cloudflare Workers.
 * Uses stripe-js fetch adapter — no Node.js net/http required.
 */

import Stripe from 'stripe';

export function getStripe(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export type { Stripe };
