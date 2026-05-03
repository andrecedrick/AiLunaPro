/**
 * BillingMetadata — Phase I.6
 *
 * Non-secret Stripe configuration editable by org owners.
 * Stored at /organizations/{orgId}/billing_config/current.
 *
 * Secrets (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PUBLISHABLE_KEY)
 * are NEVER stored in Firestore. They live only in worker env via
 * `wrangler secret put`.
 */

export type PlanKey = 'starter' | 'professional' | 'enterprise';

export interface BillingMetadata {
  priceIds: {
    starter:      string | null;
    professional: string | null;
    enterprise:   string | null;
  };
  returnUrls: {
    success: string | null;
    cancel:  string | null;
  };
  labels: {
    starter:      string | null;
    professional: string | null;
    enterprise:   string | null;
  };
  updatedAt?: string; // ISO when read back
  updatedBy?: string; // uid when read back
}

export const EMPTY_METADATA: BillingMetadata = {
  priceIds:   { starter: null, professional: null, enterprise: null },
  returnUrls: { success: null, cancel: null },
  labels:     { starter: null, professional: null, enterprise: null },
};
