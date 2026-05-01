/**
 * Billing UI types — Phase I (mock-only).
 * No Stripe SDK, no Firestore. Real integration deferred to a later phase.
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
    monthlyPrice: 49,
    annualPrice: 39,
    maxSeats: 5,
    maxAuditsPerMonth: 25,
    features: ['25 audits/month', '5 seats', 'Full reports', 'Priority support', 'AI assistance'],
  },
  Professional: {
    tier: 'Professional',
    monthlyPrice: 149,
    annualPrice: 119,
    maxSeats: 20,
    maxAuditsPerMonth: 100,
    features: ['100 audits/month', '20 seats', 'Full reports', 'Priority support', 'AI assistance', 'Custom branding', 'Registry'],
  },
  Enterprise: {
    tier: 'Enterprise',
    monthlyPrice: 499,
    annualPrice: 399,
    maxSeats: -1,
    maxAuditsPerMonth: -1,
    features: ['Unlimited audits', 'Unlimited seats', 'Full reports', 'Dedicated support', 'AI assistance', 'Custom branding', 'Registry', 'SSO', 'SLA'],
  },
};

export interface UISubscription {
  plan: PlanTier;
  status: BillingStatus;
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
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
