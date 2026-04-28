/**
 * AI Registry — type definitions.
 * Phase 7 — UI-side mocks only. Persistence is localStorage.
 */

export type ApprovalStatus = 'approved' | 'pending' | 'under-review' | 'rejected';

export type OversightModel = 'hitl' | 'hotl' | 'oot';

export type RegistryRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RegistryItem {
  id: string;
  toolName: string;
  department: string;
  purpose: string;
  /** Reuses the audit's data-type vocabulary (pii, health, biometric, etc.). */
  dataTypes: string[];
  approvalStatus: ApprovalStatus;
  riskLevel: RegistryRiskLevel;
  humanOversight: OversightModel;
  /** Free-form short bullets — added one-by-one in the modal. */
  mitigations: string[];
  notes: string;
  /** ISO date (YYYY-MM-DD) or null if no review scheduled. */
  reviewDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegistryFilters {
  search: string;
  department: string; // 'all' | <department label>
  risk: string;       // 'all' | RegistryRiskLevel
  approvalStatus: string; // 'all' | ApprovalStatus
}

export const EMPTY_FILTERS: RegistryFilters = {
  search: '',
  department: 'all',
  risk: 'all',
  approvalStatus: 'all',
};
