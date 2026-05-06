/**
 * Real subscription state — Phase J1.
 * Shape mirrors Firestore organizations/{orgId}/subscriptions/current.
 */

import type { PlanTier } from './billing';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

export interface OrgSubscription {
  stripeCustomerId:     string;
  stripeSubscriptionId: string;
  plan:                 PlanTier;
  status:               SubscriptionStatus;
  currentPeriodStart?:  string; // ISO
  currentPeriodEnd?:    string; // ISO
  cancelAtPeriodEnd:    boolean;
  updatedAt:            string; // ISO
}
