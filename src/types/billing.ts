/**
 * Billing types + canonical plan config.
 *
 * PLAN_CONFIGS is the single source of truth for plan LIMITS (audits/seats) and
 * display prices. Prices mirror the live Stripe products ($49.99 / $149.99 /
 * $499.99); Stripe price IDs remain the source of truth for actual charging.
 * Audit limits (3 / 15 / 30 / 90) feed the usage bar and the (flag-gated, not yet
 * enforced) plan-limit → token-overflow layer — see worker/src/lib/usage-limits.ts.
 */

export type PlanTier = 'Free' | 'Starter' | 'Professional' | 'Enterprise';
export type BillingStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type InvoiceStatus = 'paid' | 'open' | 'void';

export interface PlanConfig {
  tier: PlanTier;
  monthlyPrice: number; // USD, 0 = free
  annualPrice: number;  // USD per month when billed annually
  maxSeats: number;     // -1 = unlimited
  maxAuditsPerMonth: number; // -1 = unlimited
  features: string[];
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  Free: {
    tier: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    maxSeats: 2,
    maxAuditsPerMonth: 3,
    features: ['3 audits/month', '2 seats', 'Basic reports', 'Email support'],
  },
  Starter: {
    tier: 'Starter',
    monthlyPrice: 49.99,
    annualPrice: 39,
    maxSeats: 5,
    maxAuditsPerMonth: 15,
    features: ['15 audits/month', '5 seats', 'Full reports', 'Priority support', 'AI assistance'],
  },
  Professional: {
    tier: 'Professional',
    monthlyPrice: 149.99,
    annualPrice: 119,
    maxSeats: 20,
    maxAuditsPerMonth: 30,
    features: ['30 audits/month', '20 seats', 'Full reports', 'Priority support', 'AI assistance', 'Custom branding', 'Registry'],
  },
  Enterprise: {
    tier: 'Enterprise',
    monthlyPrice: 499.99,
    annualPrice: 399,
    maxSeats: -1,
    // 90 included audits/month, then premium token overflow (PART 1). Seats stay unlimited.
    maxAuditsPerMonth: 90,
    features: ['90 audits/month', 'Unlimited seats', 'Full reports', 'Dedicated support', 'AI assistance', 'Custom branding', 'Registry', 'SSO', 'SLA'],
  },
};

export interface UISubscription {
  plan: PlanTier;
  status: BillingStatus;
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  currency?: string; // Stripe normalized lowercase (J1.3)
}

export interface UIInvoice {
  id: string;
  date: string;          // ISO
  amount: number;        // USD cents
  status: InvoiceStatus;
  description: string;
  pdfUrl?: string;       // placeholder, no real URL in mock
}

export interface UIUsage {
  auditsUsed: number;
  auditsLimit: number;   // -1 = unlimited
  seatsUsed: number;
  seatsLimit: number;    // -1 = unlimited
  periodStart: string;
  periodEnd: string;
}
