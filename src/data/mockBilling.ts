/**
 * Mock billing data — Phase I.
 * No real Stripe data. Deterministic for tests.
 */

import type { UISubscription, UIInvoice, UIUsage } from '../types/billing';

export const MOCK_SUBSCRIPTION: UISubscription = {
  plan: 'Professional',
  status: 'active',
  billingCycle: 'monthly',
  currentPeriodStart: '2026-05-01T00:00:00Z',
  currentPeriodEnd: '2026-06-01T00:00:00Z',
  cancelAtPeriodEnd: false,
};

export const MOCK_INVOICES: UIInvoice[] = [
  { id: 'inv_001', date: '2026-05-01', amount: 14900, status: 'paid', description: 'Professional Plan — May 2026' },
  { id: 'inv_002', date: '2026-04-01', amount: 14900, status: 'paid', description: 'Professional Plan — Apr 2026' },
  { id: 'inv_003', date: '2026-03-01', amount: 14900, status: 'paid', description: 'Professional Plan — Mar 2026' },
  { id: 'inv_004', date: '2026-02-01', amount: 14900, status: 'paid', description: 'Professional Plan — Feb 2026' },
  { id: 'inv_005', date: '2026-01-01', amount:  4900, status: 'paid', description: 'Starter Plan — Jan 2026' },
  { id: 'inv_006', date: '2025-12-01', amount:  4900, status: 'paid', description: 'Starter Plan — Dec 2025' },
];

export const MOCK_USAGE: UIUsage = {
  auditsUsed: 34,
  auditsLimit: 100,
  seatsUsed: 7,
  seatsLimit: 20,
  periodStart: '2026-05-01T00:00:00Z',
  periodEnd: '2026-06-01T00:00:00Z',
};
