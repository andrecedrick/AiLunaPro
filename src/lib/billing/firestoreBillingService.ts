/**
 * Billing — Firestore service (Phase J1).
 * Reads organizations/{orgId}/subscriptions/current.
 * Consumed only by BillingContext when resolveLayer('billing') === 'firebase'.
 */

import { doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firestore';
import type { OrgSubscription } from '../../types/subscription';

function subDoc(orgId: string) {
  return doc(db, 'organizations', orgId, 'subscriptions', 'current');
}

export async function fetchSubscription(orgId: string): Promise<OrgSubscription | null> {
  const snap = await getDoc(subDoc(orgId));
  if (!snap.exists()) return null;
  return snap.data() as OrgSubscription;
}

export function subscribeSubscription(
  orgId: string,
  onData: (sub: OrgSubscription | null) => void,
): Unsubscribe {
  return onSnapshot(subDoc(orgId), snap => {
    onData(snap.exists() ? (snap.data() as OrgSubscription) : null);
  });
}
