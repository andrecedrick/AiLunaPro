/**
 * BillingContext — Phase I (mock-only).
 * Provides plan, invoices, usage, and mock upgrade/downgrade.
 * No Stripe SDK, no Firestore, no backend calls.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { UISubscription, UIInvoice, UIUsage, PlanTier } from '../types/billing';
import { MOCK_SUBSCRIPTION, MOCK_INVOICES, MOCK_USAGE } from '../data/mockBilling';
import { PLAN_CONFIGS } from '../types/billing';

interface BillingContextValue {
  subscription: UISubscription;
  invoices: UIInvoice[];
  usage: UIUsage;
  /**
   * Mock upgrade/downgrade. Updates local state only.
   * Real Stripe checkout deferred to a later phase.
   */
  upgradePlan: (plan: PlanTier, cycle?: 'monthly' | 'annual') => void;
  cancelPlan: () => void;
  resumePlan: () => void;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<UISubscription>(MOCK_SUBSCRIPTION);
  const [invoices] = useState<UIInvoice[]>(MOCK_INVOICES);
  const [usage, setUsage] = useState<UIUsage>(MOCK_USAGE);

  const upgradePlan = useCallback((plan: PlanTier, cycle: 'monthly' | 'annual' = 'monthly') => {
    const config = PLAN_CONFIGS[plan];
    setSubscription(prev => ({ ...prev, plan, billingCycle: cycle }));
    setUsage(prev => ({
      ...prev,
      auditsLimit: config.maxAuditsPerMonth,
      seatsLimit: config.maxSeats,
    }));
  }, []);

  const cancelPlan = useCallback(() => {
    setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: true }));
  }, []);

  const resumePlan = useCallback(() => {
    setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: false }));
  }, []);

  const value = useMemo<BillingContextValue>(
    () => ({ subscription, invoices, usage, upgradePlan, cancelPlan, resumePlan }),
    [subscription, invoices, usage, upgradePlan, cancelPlan, resumePlan],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used inside BillingProvider');
  return ctx;
}
