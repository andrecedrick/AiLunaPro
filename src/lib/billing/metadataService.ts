/**
 * Firestore client read/write for billing metadata (Phase I.6).
 *
 * Path: /organizations/{orgId}/billing_config/current
 *
 * Security:
 *   - Owner-only enforced by Firestore rules
 *   - Payload sanitized + secret-stripped before write (defense-in-depth)
 *   - Falls back to in-memory mock when auth layer is mock or Firestore
 *     emulator unavailable, so I.6 stays testable locally without Firebase
 */

import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { db } from '../firestore';
import { resolveLayer } from '../featureFlags';
import { sanitizeMetadata, stripSecrets, validateMetadata } from './billingValidation';
import { EMPTY_METADATA, type BillingMetadata } from '../../types/billingMetadata';

/* ── Mock layer in-memory store (per-org) ─────────────────── */
const mockStore = new Map<string, BillingMetadata>();

function isMockLayer(): boolean {
  return resolveLayer('auth') === 'mock';
}

/* ── Public API ───────────────────────────────────────────── */

export async function readBillingMetadata(orgId: string): Promise<BillingMetadata> {
  if (!orgId) return EMPTY_METADATA;

  if (isMockLayer()) {
    return mockStore.get(orgId) ?? EMPTY_METADATA;
  }

  try {
    const ref  = doc(db, 'organizations', orgId, 'billing_config', 'current');
    const snap = await getDoc(ref);
    if (!snap.exists()) return EMPTY_METADATA;
    const data = snap.data() as Partial<BillingMetadata> & {
      updatedAt?: Timestamp | string;
      updatedBy?: string;
    };
    const sanitized = sanitizeMetadata(data);
    return {
      ...sanitized,
      updatedAt:
        typeof data.updatedAt === 'string'
          ? data.updatedAt
          : data.updatedAt && 'toDate' in data.updatedAt
            ? data.updatedAt.toDate().toISOString()
            : undefined,
      updatedBy: data.updatedBy,
    };
  } catch (err) {
    // Read failure (rules / network) → return empty so UI can render
    console.warn('[metadataService] read failed:', err);
    return EMPTY_METADATA;
  }
}

export interface WriteResult {
  success: boolean;
  error?: string;
  validationErrors?: Partial<Record<string, string>>;
}

export async function writeBillingMetadata(
  orgId: string,
  uid: string,
  input: BillingMetadata,
): Promise<WriteResult> {
  if (!orgId) return { success: false, error: 'Missing orgId' };
  if (!uid)   return { success: false, error: 'Not authenticated' };

  // 1. Validate
  const v = validateMetadata(input);
  if (!v.ok) return { success: false, error: 'Validation failed', validationErrors: v.errors };

  // 2. Strip any forbidden keys (defense-in-depth)
  const { cleaned } = stripSecrets(input);

  // 3. Sanitize to canonical shape (drops extra fields)
  const sanitized = sanitizeMetadata(cleaned);

  // 4. Persist
  if (isMockLayer()) {
    mockStore.set(orgId, {
      ...sanitized,
      updatedAt: new Date().toISOString(),
      updatedBy: uid,
    });
    return { success: true };
  }

  try {
    const ref = doc(db, 'organizations', orgId, 'billing_config', 'current');
    await setDoc(ref, {
      ...sanitized,
      updatedAt: serverTimestamp(),
      updatedBy: uid,
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save';
    return { success: false, error: msg };
  }
}

/** Test-only helper: reset mock store between tests. */
export function _resetMockStoreForTests(): void {
  mockStore.clear();
}
