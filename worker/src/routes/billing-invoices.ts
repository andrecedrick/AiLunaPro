/**
 * GET /api/billing/invoices?orgId=... — Phase J1.2
 *
 * Returns the recent Stripe invoices for the org's customer.
 *
 * Resolution:
 *   1. read organizations/{orgId}/subscriptions/current → stripeCustomerId
 *   2. invoices.list({ customer, limit: 12 })
 *   3. project to a safe subset (no raw Stripe payload)
 *
 * Auth:    requires Firebase JWT
 * Secrets: STRIPE_SECRET_KEY + FIREBASE_SERVICE_ACCOUNT_JSON
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const invoices = new Hono<AppEnv>();

interface SafeInvoice {
  id:               string;
  number:           string | null;
  status:           string | null;
  amountPaid:       number;       // cents
  amountDue:        number;       // cents
  currency:         string;
  created:          number;       // unix seconds
  hostedInvoiceUrl: string | null;
  invoicePdf:       string | null;
  periodStart:      number | null;
  periodEnd:        number | null;
}

invoices.get('/api/billing/invoices', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };

  if (!env.STRIPE_SECRET_KEY)            return c.json({ error: 'Stripe not configured' }, 503);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Service account not configured' }, 503);

  const orgId = c.req.query('orgId');
  if (!orgId) return c.json({ error: 'Missing orgId query param' }, 400);

  console.log('[invoices] orgId=', orgId);

  // Read customer id from subscriptions/current
  const sub = await firestoreGet(
    env.FIREBASE_SERVICE_ACCOUNT_JSON,
    `organizations/${orgId}/subscriptions/current`,
  );
  const customerId = (sub?.stripeCustomerId as string | undefined) ?? null;
  if (!customerId) {
    return c.json({ invoices: [], note: 'No Stripe customer linked yet' });
  }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  let list: Stripe.ApiList<Stripe.Invoice>;
  try {
    list = await stripe.invoices.list({ customer: customerId, limit: 12 });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[invoices] list failed:', err.message);
      return c.json({ error: err.message, code: err.code ?? err.type }, 400);
    }
    throw err;
  }

  const safe: SafeInvoice[] = list.data.map(inv => {
    // period dates moved into invoice.lines.data[0] in newer Stripe API versions
    const firstLine = inv.lines?.data?.[0];
    return {
      id:               inv.id ?? '',
      number:           inv.number ?? null,
      status:           inv.status ?? null,
      amountPaid:       inv.amount_paid ?? 0,
      amountDue:        inv.amount_due  ?? 0,
      currency:         inv.currency,
      created:          inv.created,
      hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
      invoicePdf:       inv.invoice_pdf ?? null,
      periodStart:      firstLine?.period?.start ?? null,
      periodEnd:        firstLine?.period?.end   ?? null,
    };
  });

  console.log('[invoices] count=', safe.length);
  return c.json({ invoices: safe });
});

export default invoices;
