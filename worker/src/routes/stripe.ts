import { Hono } from 'hono';
import type { AppEnv } from '../index';

const stripe = new Hono<AppEnv>();

/**
 * POST /api/stripe/webhook
 * No auth middleware — Stripe signs its own webhooks via Stripe-Signature header.
 * Placeholder — webhook signature verification + event handling go here (Phase I).
 * Phase G: skeleton only.
 */
stripe.post('/api/stripe/webhook', c => {
  return c.json({
    ok: true,
    message: 'not yet implemented',
  });
});

export default stripe;
