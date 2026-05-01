/**
 * API Request / Response Type Contracts
 *
 * Defines the shape of all HTTP request bodies and response payloads
 * for communication between the frontend (React) and backend (Cloudflare Workers).
 *
 * These types MUST align with the Firestore schema in firestore.ts.
 * Phase B goal: Establish contracts before Firebase integration (Phase 2+).
 */

import type {
  User,
  Organization,
  OrganizationMember,
  Audit,
  AuditAnswer,
  Report,
  AISystem,
  UserRole,
  SubscriptionPlan,
  RiskLevel,
} from './firestore';

// ──────────────────────────────────────────────────────────────────────────────
// AUTH ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  user: User;
  organization: Organization;
  token: string; // Firebase ID token or equivalent
  membership: OrganizationMember;
}

export interface AuthSignupRequest {
  email: string;
  password: string;
  displayName: string;
  organizationName: string;
}

export interface AuthSignupResponse {
  user: User;
  organization: Organization;
  token: string;
  membership: OrganizationMember;
}

export interface AuthLogoutRequest {
  // No body needed
}

export interface AuthLogoutResponse {
  success: boolean;
}

export interface AuthVerifyRequest {
  token: string;
}

export interface AuthVerifyResponse {
  valid: boolean;
  user?: User;
  organization?: Organization;
}

// ──────────────────────────────────────────────────────────────────────────────
// AUDIT ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export interface AuditCreateRequest {
  organizationId: string;
  name: string;
  description?: string;
  aiSystemId?: string; // optional link to registry entry
}

export interface AuditCreateResponse {
  audit: Audit;
}

export interface AuditListRequest {
  organizationId: string;
  status?: Audit['status']; // optional filter
  limit?: number;
  offset?: number;
}

export interface AuditListResponse {
  audits: Audit[];
  total: number;
}

export interface AuditGetRequest {
  organizationId: string;
  auditId: string;
}

export interface AuditGetResponse {
  audit: Audit;
  answers: AuditAnswer[];
}

export interface AuditUpdateRequest {
  organizationId: string;
  auditId: string;
  status?: Audit['status'];
  name?: string;
  description?: string;
}

export interface AuditUpdateResponse {
  audit: Audit;
}

export interface AuditAnswerUpsertRequest {
  organizationId: string;
  auditId: string;
  questionId: string;
  section: AuditAnswer['section'];
  answer: string | boolean | string[];
  notes?: string;
}

export interface AuditAnswerUpsertResponse {
  auditAnswer: AuditAnswer;
}

// ──────────────────────────────────────────────────────────────────────────────
// REPORT ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export interface ReportGenerateRequest {
  organizationId: string;
  auditId: string;
  title?: string;
}

export interface ReportGenerateResponse {
  report: Report;
}

export interface ReportListRequest {
  organizationId: string;
  status?: Report['status'];
  limit?: number;
  offset?: number;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
}

export interface ReportGetRequest {
  organizationId: string;
  reportId: string;
}

export interface ReportGetResponse {
  report: Report;
}

export interface ReportPublishRequest {
  organizationId: string;
  reportId: string;
}

export interface ReportPublishResponse {
  report: Report;
}

// ──────────────────────────────────────────────────────────────────────────────
// REGISTRY (AI Systems) ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export interface RegistryCreateRequest {
  organizationId: string;
  name: string;
  department: string;
  purpose: string;
  vendor?: string;
  version?: string;
  dataTypes: string[];
  riskLevel: RiskLevel;
  humanSupervision: boolean;
  mitigations: string[];
}

export interface RegistryCreateResponse {
  system: AISystem;
}

export interface RegistryListRequest {
  organizationId: string;
  status?: AISystem['status'];
  limit?: number;
  offset?: number;
}

export interface RegistryListResponse {
  systems: AISystem[];
  total: number;
}

export interface RegistryGetRequest {
  organizationId: string;
  systemId: string;
}

export interface RegistryGetResponse {
  system: AISystem;
}

export interface RegistryUpdateRequest {
  organizationId: string;
  systemId: string;
  name?: string;
  department?: string;
  purpose?: string;
  riskLevel?: RiskLevel;
  humanSupervision?: boolean;
  mitigations?: string[];
  status?: AISystem['status'];
}

export interface RegistryUpdateResponse {
  system: AISystem;
}

// ──────────────────────────────────────────────────────────────────────────────
// TEAM ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export interface TeamInviteRequest {
  organizationId: string;
  email: string;
  role: UserRole;
}

export interface TeamInviteResponse {
  member: OrganizationMember;
}

export interface TeamListRequest {
  organizationId: string;
}

export interface TeamListResponse {
  members: OrganizationMember[];
}

export interface TeamRemoveRequest {
  organizationId: string;
  userId: string;
}

export interface TeamRemoveResponse {
  success: boolean;
}

export interface TeamUpdateRoleRequest {
  organizationId: string;
  userId: string;
  role: UserRole;
}

export interface TeamUpdateRoleResponse {
  member: OrganizationMember;
}

// ──────────────────────────────────────────────────────────────────────────────
// BILLING ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────────

export interface BillingGetPlanRequest {
  organizationId: string;
}

export interface BillingGetPlanResponse {
  plan: SubscriptionPlan;
  status: string; // Subscription status
  currentPeriodEnd: Date;
  stripeCustomerId?: string;
}

export interface BillingListInvoicesRequest {
  organizationId: string;
  limit?: number;
  offset?: number;
}

export interface BillingListInvoicesResponse {
  invoices: Array<{
    id: string;
    amount: number;
    currency: string;
    date: Date;
    status: string;
    url?: string; // PDF download link
  }>;
  total: number;
}

export interface BillingUpgradeRequest {
  organizationId: string;
  plan: SubscriptionPlan;
}

export interface BillingUpgradeResponse {
  plan: SubscriptionPlan;
  stripeSessionUrl?: string; // Redirect to Stripe Checkout if needed
}
