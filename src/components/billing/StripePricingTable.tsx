/**
 * StripePricingTable — Phase J1.1
 *
 * Embeds the Stripe-hosted Pricing Table as a Web Component.
 * Stripe Checkout is initiated by clicking a "Subscribe" button inside
 * the embedded iframe — no custom checkout fetch needed for the happy path.
 *
 * Auth/orgId binding:
 *   - client-reference-id={orgId} is forwarded by Stripe to the resulting
 *     Checkout Session (session.client_reference_id), which the webhook
 *     reads to resolve the org.
 *
 * Security:
 *   - Publishable key (pk_test_...) only — server-side STRIPE_SECRET_KEY
 *     never touches this component.
 *   - pricing-table.js loaded once per page load via idempotent injection.
 */

import { useEffect } from 'react';

const SCRIPT_SRC = 'https://js.stripe.com/v3/pricing-table.js';
const SCRIPT_ID  = 'stripe-pricing-table-script';

let scriptPromise: Promise<void> | null = null;

function loadPricingTableScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  // Already injected by another mount?
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.id    = SCRIPT_ID;
    s.src   = SCRIPT_SRC;
    s.async = true;
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Stripe pricing-table.js'));
    document.head.appendChild(s);
  });

  return scriptPromise;
}

interface StripePricingTableProps {
  orgId:           string;
  pricingTableId:  string;
  publishableKey:  string;
  customerEmail?:  string;
}

export function StripePricingTable({
  orgId,
  pricingTableId,
  publishableKey,
  customerEmail,
}: StripePricingTableProps) {
  useEffect(() => {
    loadPricingTableScript().catch(err => {
      console.error('[StripePricingTable]', err);
    });
  }, []);

  if (!pricingTableId || !publishableKey) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: 'var(--red-text)' }}>
        Stripe Pricing Table not configured. Set VITE_STRIPE_PRICING_TABLE_ID and
        VITE_STRIPE_PUBLISHABLE_KEY in .env.local.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'block' }}>
      <stripe-pricing-table
        pricing-table-id={pricingTableId}
        publishable-key={publishableKey}
        client-reference-id={orgId}
        customer-email={customerEmail}
      />
    </div>
  );
}
