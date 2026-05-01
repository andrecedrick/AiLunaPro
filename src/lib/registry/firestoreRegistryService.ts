/**
 * Registry — Firestore service (Phase F.1).
 *
 * All operations target: /organizations/{orgId}/registry/{itemId}
 *
 * Consumed only by RegistryContext when resolveLayer('registry') === 'firebase'.
 * Nothing in the UI tree imports this file directly.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firestore';
import type { RegistryItem } from '../../types/registry';

// ─── Path helper ──────────────────────────────────────────────────────────────

function registryCol(orgId: string) {
  return collection(db, 'organizations', orgId, 'registry');
}

function registryDoc(orgId: string, itemId: string) {
  return doc(db, 'organizations', orgId, 'registry', itemId);
}

// ─── Firestore document shape ─────────────────────────────────────────────────
// Stored as-is — RegistryItem fields map 1:1 to Firestore doc fields.
// createdAt / updatedAt stored as ISO strings (consistent with mock layer).

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Load all registry items for an org, ordered by createdAt descending.
 * Returns an empty array if the collection does not exist yet.
 */
export async function fsListItems(orgId: string): Promise<RegistryItem[]> {
  const q = query(registryCol(orgId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RegistryItem));
}

/**
 * Write a new registry item.
 * The item already has id/createdAt/updatedAt (set by withTimestamps in context).
 */
export async function fsAddItem(orgId: string, item: RegistryItem): Promise<void> {
  await setDoc(registryDoc(orgId, item.id), item);
}

/**
 * Merge a partial update into an existing registry item.
 * Always refreshes updatedAt.
 */
export async function fsUpdateItem(
  orgId: string,
  itemId: string,
  patch: Partial<RegistryItem>,
): Promise<void> {
  await updateDoc(registryDoc(orgId, itemId), {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Hard-delete a registry item.
 */
export async function fsDeleteItem(orgId: string, itemId: string): Promise<void> {
  await deleteDoc(registryDoc(orgId, itemId));
}
