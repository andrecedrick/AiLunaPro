/**
 * Admin Portal diagnostic — Phase J1.3B (owner-only, READ-ONLY).
 *
 *   GET /api/billing/admin/portal-diagnostic?orgId=...
 *
 * Reads default Stripe Customer Portal configuration via Stripe API.
 * Reports flags only. Cannot edit — Customer Portal config is dashboard-only.
 *
 * Also reports invoice diagnostic for the org (if customer linked):
 *   - lastInvoiceCount
 *   - lastInvoicePdfAvailable
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import { assertStripeKeyAllowed } from '../lib/env';
import type { AppEnv } from '../index';

const portal = new Hono<AppEnv>();

interface PortalDiagnostic {
  configured:           boolean;
  enabled:              boolean;
  managePaymentMethod:  boolean;
  cancelSubscription:   boolean;
  invoiceHistory:       boolean;
  configurationId:      string | null;
}

interface InvoicesDiagnostic {
  lastInvoiceCount:        number;
  lastInvoicePdfAvailable: boolean;
  customerLinked:          boolean;
}

portal.get('/api/billing/admin/portal-diagnostic', requireAuth(), requireOwner(), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };
  const orgId = c.get('orgId') as string;

  if (!env.STRIPE_SECRET_KEY) return c.json({ error: 'Stripe not configured' }, 503);
  { const blocked = assertStripeKeyAllowed(env); if (blocked) return c.json(blocked.body, blocked.status); }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  // ── Portal configuration ──────────────────────────
  const portalDiag: PortalDiagnostic = {
    configured:          false,
    enabled:             false,
    managePaymentMethod: false,
    cancelSubscription:  false,
    invoiceHistory:      false,
    configurationId:     null,
  };

  try {
    const cfgs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
    const cfg  = cfgs.data[0];
    if (cfg) {
      portalDiag.configured          = true;
      portalDiag.configurationId     = cfg.id;
      portalDiag.enabled             = cfg.active;
      portalDiag.managePaymentMethod = cfg.features.payment_method_update?.enabled ?? false;
      portalDiag.cancelSubscription  = cfg.features.subscription_cancel?.enabled ?? false;
      portalDiag.invoiceHistory      = cfg.features.invoice_history?.enabled ?? false;
    }
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.warn('[admin-portal] config list failed:', err.message);
    }
  }

  // ── Invoices diagnostic ───────────────────────────
  const invoicesDiag: InvoicesDiagnostic = {
    lastInvoiceCount:        0,
    lastInvoicePdfAvailable: false,
    customerLinked:          false,
  };

  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const sub = await firestoreGet(
        env.FIREBASE_SERVICE_ACCOUNT_JSON,
        `organizations/${orgId}/subscriptions/current`,
      );
      const customerId = sub?.stripeCustomerId as string | undefined;
      if (customerId) {
        invoicesDiag.customerLinked = true;
        try {
          const list = await stripe.invoices.list({ customer: customerId, limit: 5 });
          invoicesDiag.lastInvoiceCount = list.data.length;
          invoicesDiag.lastInvoicePdfAvailable = list.data.some(inv => Boolean(inv.invoice_pdf));
        } catch (err) {
          if (err instanceof Stripe.errors.StripeError) {
            console.warn('[admin-portal] invoices.list failed:', err.message);
          }
        }
      }
    } catch (err) {
      console.warn('[admin-portal] firestore read failed:', err);
    }
  }

  return c.json({
    portal:   portalDiag,
    invoices: invoicesDiag,
    note:     'Portal flow is configured in Stripe Dashboard → Settings → Customer Portal. This panel is read-only.',
  });
});

export default portal;
