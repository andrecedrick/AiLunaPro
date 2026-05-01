/**
 * Frontend type for GET /api/billing/config-status (Phase I.5).
 * Mirrors worker response shape. No secret values cross the wire.
 */

export type StripeMode = 'test' | 'live' | 'unset';

export interface KeyStatus {
  configured: boolean;
  last4: string | null;
}

export interface BillingConfigStatus {
  mode: StripeMode;
  publishableKey: KeyStatus;
  secretKey: { configured: boolean };
  webhookSecret: { configured: boolean };
  priceIds: {
    starter:      KeyStatus;
    professional: KeyStatus;
    enterprise:   KeyStatus;
  };
  webhook: {
    lastEventId:        string | null;
    lastEventTimestamp: string | null;
    lastVerified:       boolean | null;
    lastError:          string | null;
  };
}
