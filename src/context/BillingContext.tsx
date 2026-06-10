/**
 * BillingContext — Phase J1.1
 *
 * Mock layer:
 *   Local state initialized from MOCK_SUBSCRIPTION (Professional active).
 *
 * Firebase layer:
 *   Initial state = Free (no fake Professional default).
 *   Subscribes to organizations/{orgId}/subscriptions/current.
 *   - doc missing                 → Free, hasActiveSubscription=false
 *   - doc missing stripeSubId     → Free, hasActiveSubscription=false
 *   - doc has subId + status ok   → real plan, hasActiveSubscription=true
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { UISubscription, UIInvoice, UIUsage, PlanTier } from '../types/billing';
import { MOCK_SUBSCRIPTION, MOCK_INVOICES, MOCK_USAGE } from '../data/mockBilling';
import { PLAN_CONFIGS } from '../types/billing';
import { resolveLayer } from '../lib/featureFlags';
import { subscribeSubscription, fetchSubscription } from '../lib/billing/firestoreBillingService';
import { useAuth } from './AuthContext';
import { dlog } from '../lib/log';

const LAYER = resolveLayer('billing');

const FREE_SUBSCRIPTION: UISubscription = {
  plan:               'Free',
  status:             'active',
  billingCycle:       'monthly',
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd:   new Date().toISOString(),
  cancelAtPeriodEnd:  false,
};

interface BillingContextValue {
  subscription:           UISubscription;
  invoices:               UIInvoice[];
  usage:                  UIUsage;
  /** True only when a real Stripe subscription is linked + active/trialing. */
  hasActiveSubscription:  boolean;
  /** Stripe IDs (firebase layer only). Undefined on mock. */
  stripeCustomerId?:      string;
  stripeSubscriptionId?:  string;
  /** Manual one-shot Firestore refetch (firebase layer). No-op on mock. */
  refreshSubscription:    () => Promise<void>;
  upgradePlan: (plan: PlanTier, cycle?: 'monthly' | 'annual') => void;
  cancelPlan:  () => void;
  resumePlan:  () => void;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

interface FirestoreSubDoc {
  plan?:                 string;
  status?:               string;
  cancelAtPeriodEnd?:    boolean;
  currentPeriodStart?:   string;
  currentPeriodEnd?:     string;
  stripeCustomerId?:     string;
  stripeSubscriptionId?: string;
  currency?:             string;
}

function firestoreSubToUI(fsData: FirestoreSubDoc): Partial<UISubscription> {
  return {
    plan:              (fsData.plan as PlanTier | undefined) ?? 'Free',
    status:            (fsData.status as UISubscription['status'] | undefined) ?? 'active',
    cancelAtPeriodEnd: fsData.cancelAtPeriodEnd ?? false,
    ...(fsData.currentPeriodStart ? { currentPeriodStart: fsData.currentPeriodStart } : {}),
    ...(fsData.currentPeriodEnd   ? { currentPeriodEnd:   fsData.currentPeriodEnd   } : {}),
    ...(fsData.currency           ? { currency:           fsData.currency           } : {}),
  };
}

const ACTIVE_STATUSES: ReadonlySet<string> = new Set(['active', 'trialing', 'past_due']);

export function BillingProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const orgId = session?.orgId ?? null;

  // Initial state depends on layer — never default to MOCK on firebase
  const [subscription, setSubscription] = useState<UISubscription>(
    LAYER === 'firebase' ? FREE_SUBSCRIPTION : MOCK_SUBSCRIPTION,
  );
  const [invoices] = useState<UIInvoice[]>(LAYER === 'firebase' ? [] : MOCK_INVOICES);
  const [usage, setUsage] = useState<UIUsage>(MOCK_USAGE);

  const [stripeCustomerId,     setStripeCustomerId]     = useState<string | undefined>(undefined);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<string | undefined>(undefined);

  // Firebase layer: real-time subscription sync (defined later via applyFsDoc)

  const upgradePlan = useCallback((plan: PlanTier, cycle: 'monthly' | 'annual' = 'monthly') => {
    if (LAYER === 'firebase') {
      console.warn('[BillingContext] upgradePlan() ignored on firebase layer — use Stripe Pricing Table');
      return;
    }
    const config = PLAN_CONFIGS[plan];
    setSubscription(prev => ({ ...prev, plan, billingCycle: cycle }));
    setUsage(prev => ({
      ...prev,
      auditsLimit: config.maxAuditsPerMonth,
      seatsLimit:  config.maxSeats,
    }));
  }, []);

  const applyFsDoc = useCallback((rawDoc: unknown) => {
    const fsDoc = rawDoc as FirestoreSubDoc | null;
    if (!fsDoc || !fsDoc.stripeSubscriptionId || !fsDoc.stripeCustomerId) {
      setSubscription(FREE_SUBSCRIPTION);
      setStripeCustomerId(undefined);
      setStripeSubscriptionId(undefined);
      return;
    }
    setSubscription(prev => ({ ...prev, ...firestoreSubToUI(fsDoc) }));
    setStripeCustomerId(fsDoc.stripeCustomerId);
    setStripeSubscriptionId(fsDoc.stripeSubscriptionId);
  }, []);

  // Firebase real-time listener
  useEffect(() => {
    if (LAYER !== 'firebase' || !orgId) return;
    const unsub = subscribeSubscription(orgId, applyFsDoc);
    return unsub;
  }, [orgId, applyFsDoc]);

  const refreshSubscription = useCallback(async (): Promise<void> => {
    if (LAYER !== 'firebase' || !orgId) return;
    try {
      const doc = await fetchSubscription(orgId);
      applyFsDoc(doc);
      dlog('[BillingContext] refreshSubscription → applied doc:', doc);
    } catch (err) {
      console.error('[BillingContext] refreshSubscription failed:', err);
    }
  }, [orgId, applyFsDoc]);

  const cancelPlan = useCallback(() => {
    if (LAYER === 'firebase') return;
    setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: true }));
  }, []);

  const resumePlan = useCallback(() => {
    if (LAYER === 'firebase') return;
    setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: false }));
  }, []);

  const hasActiveSubscription =
    LAYER === 'firebase'
      ? Boolean(stripeSubscriptionId && stripeCustomerId && ACTIVE_STATUSES.has(subscription.status))
      : subscription.plan !== 'Free';

  const value = useMemo<BillingContextValue>(
    () => ({
      subscription,
      invoices,
      usage,
      hasActiveSubscription,
      stripeCustomerId,
      stripeSubscriptionId,
      refreshSubscription,
      upgradePlan,
      cancelPlan,
      resumePlan,
    }),
    [subscription, invoices, usage, hasActiveSubscription, stripeCustomerId, stripeSubscriptionId, refreshSubscription, upgradePlan, cancelPlan, resumePlan],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used inside BillingProvider');
  return ctx;
}
