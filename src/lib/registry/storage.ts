/**
 * AI Registry — persistence seam (localStorage).
 * Replace these four functions with API calls in the backend phase;
 * nothing in the UI tree changes.
 */

import { seedRegistryItems } from '../../data/mockRegistry';
import type { RegistryItem } from '../../types/registry';

const ITEMS_KEY = 'ailunapro-registry-items';
/** Marker so we don't re-seed after the user has explicitly cleared their list. */
const SEED_FLAG_KEY = 'ailunapro-registry-seeded';

export function loadItems(): RegistryItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveItems(items: RegistryItem[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    /* swallow — UI shell only */
  }
}

/**
 * Returns the items to use on first render.
 * - If localStorage has items → return them as-is.
 * - Else, on the very first visit → seed with the demo items and persist them.
 * - If the user has emptied the list themselves (seed flag set + 0 items)
 *   → respect the empty state and don't re-seed.
 */
export function getInitialItems(): RegistryItem[] {
  const existing = loadItems();
  if (existing.length > 0) return existing;
  let seeded = false;
  try {
    seeded = localStorage.getItem(SEED_FLAG_KEY) === '1';
  } catch {
    /* ignore */
  }
  if (seeded) return [];
  // First time → seed.
  saveItems(seedRegistryItems);
  try {
    localStorage.setItem(SEED_FLAG_KEY, '1');
  } catch {
    /* ignore */
  }
  return seedRegistryItems;
}

/* ── Factory helpers ─────────────────────────────────────── */

export function makeNewItem(): Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    toolName: '',
    department: 'Engineering',
    purpose: '',
    dataTypes: [],
    approvalStatus: 'pending',
    riskLevel: 'medium',
    humanOversight: 'hotl',
    mitigations: [],
    notes: '',
    reviewDate: null,
  };
}

export function withTimestamps(
  base: Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>,
): RegistryItem {
  const now = new Date().toISOString();
  return {
    id: `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
    ...base,
  };
}
