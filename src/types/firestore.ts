/**
 * Firestore Data Model — TypeScript Types
 *
 * Project:   AI Luna Pro
 * Branch:    audit
 * Phase:     1B — Firestore data model
 *
 * Covers every Firestore collection and subcollection in the platform:
 *
 *   Root collections
 *     /users/{userId}
 *     /organizations/{orgId}
 *     /subscriptions/{subscriptionId}   ← Stripe extension managed
 *     /billing_events/{eventId}         ← Stripe extension managed
 *     /email_logs/{emailId}             ← Cloud Functions only
 *
 *   Organization subcollections
 *     /organizations/{orgId}/members/{memberId}
 *     /organizations/{orgId}/audits/{auditId}
 *     /organizations/{orgId}/audits/{auditId}/answers/{answerId}
 *     /organizations/{orgId}/reports/{reportId}
 *     /organizations/{orgId}/registry/{systemId}
 *     /organizations/{orgId}/exports/{exportId}
 *     /organizations/{orgId}/activity_logs/{logId}
 *
 * Timestamp convention:
 *   All timestamp fields are typed as Date (browser-friendly).
 *   The service layer (introduced in Phase 2+) is responsible for
 *   converting Firestore Timestamp → Date on read and
 *   Date → serverTimestamp() / Timestamp on write.
 *
 * Multi-tenant convention:
 *   Every document carries organizationId.
 *   Firestore security rules enforce org isolation using this field.
 */

// ─────────────────────────────────────────────────────────────────────────────
// LOCALSTORAGE ↔ FIRESTORE MAPPING
// Phase 1B: Feature-flag strategy for progressive migration from mock to real DB
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Mock Layer → Real Layer Migration Path
 *
 * During Phase 1B–1D, UI layer uses localStorage + mock data (controlled by
 * VITE_*_LAYER feature flags). This mapping documents how mock keys translate
 * to Firestore collections when services are enabled in Phase 2+.
 *
 * **Storage Layer (auth.ts, audit.ts):**
 *   localStorage key               → Firestore path                      → Type
 *   ─────────────────────────────────────────────────────────────────────────
 *   'ailunapro-session'            → Firebase Auth (currentUser)         → User
 *   'ailunapro-user'               → /users/{userId}                     → User
 *   'ailunapro-orgs'               → /organizations/{orgId}              → Organization[]
 *   'ailunapro-org-active'         → /organizations/{orgId}              → Organization
 *   'ailunapro-audits'             → /organizations/{orgId}/audits       → Audit[]
 *   'ailunapro-audit-current'      → /organizations/{orgId}/audits/{id}  → Audit
 *   'ailunapro-audit-answers'      → /organizations/{orgId}/audits/{id}  → AuditAnswer[]
 *   'ailunapro-reports'            → /organizations/{orgId}/reports      → Report[]
 *   'ailunapro-registry'           → /organizations/{orgId}/registry     → AISystem[]
 *   'ailunapro-team-members'       → /organizations/{orgId}/members      → OrganizationMember[]
 *   'ailunapro-subscription'       → /subscriptions/{subscriptionId}     → Subscription
 *   'ailunapro-billing-invoices'   → /billing_events (filtered)          → BillingEvent[]
 *
 * **Timestamp Conversion:**
 *   Mock Layer:   ISO string (e.g., "2026-04-29T10:30:00Z")
 *   Firestore:    Date object (browser representation of same instant)
 *   Service:      Converts ISO → Date on read, Date → serverTimestamp() on write
 *   API Contract: All timestamps in api.ts use Date type (not ISO strings)
 *   Firestore.ts: All timestamp fields typed as Date
 *
 * **ID Format Differences:**
 *   Mock Layer:   'u_ts_<random>'    (string prefix + timestamp-based)
 *   Firestore:    Firebase UIDs      (22-char alphanumeric, auto-generated)
 *   Migration:    Services abstract away differences; UI types never change
 *
 * **Multi-Tenant Enforcement:**
 *   Every read/write operation includes organizationId parameter.
 *   Firestore security rules match organizationId from token + doc field.
 *   Mock layer silently uses localStorage + parameter validation.
 *
 * **Feature Flags (Phase 1C):**
 *   VITE_AUTH_LAYER      'mock' | 'firebase'    — Auth service source
 *   VITE_DATA_LAYER      'mock' | 'firestore'   — CRUD service source
 *   VITE_BILLING_LAYER   'mock' | 'stripe'      — Billing/subscription source
 */

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE UNION TYPES
// Note: enum is intentionally avoided — incompatible with erasableSyntaxOnly.
// ─────────────────────────────────────────────────────────────────────────────

/** Role a user holds within an organization. */
export type UserRole = 'owner' | 'admin' | 'member' | 'billing';

/** Subscription plan tier. */
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';

/**
 * Subscription lifecycle status.
 *
 * Mapped from Stripe status values:
 *   active / trialing             → 'active'
 *   past_due / unpaid             → 'past_due'
 *   canceled / incomplete_expired → 'cancelled'
 *   incomplete                    → 'pending_cancellation'
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'pending_cancellation';

/** Audit session lifecycle status. */
export type AuditStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

/**
 * The eight sections of a compliance audit.
 * Drives the multi-step audit flow (Phase 4).
 */
export type AuditSection =
  | 'profile'
  | 'ai_tools'
  | 'data'
  | 'governance'
  | 'security'
  | 'transparency'
  | 'human_oversight'
  | 'training_maturity';

/** Risk classification used in audits, reports, and the AI registry. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Lifecycle status of an AI system entry in the registry. */
export type AISystemStatus = 'active' | 'inactive' | 'pending_review';

/** Report publication status. */
export type ReportStatus = 'draft' | 'published' | 'archived';

/**
 * Stripe webhook event types logged by the Firebase extension.
 * See: /billing_events collection and stripe-extension-mapping.md
 */
export type BillingEventType =
  | 'charge.succeeded'
  | 'charge.failed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.deleted'
  | 'customer.subscription.deleted'
  | 'invoice.created'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'invoice.payment_action_required'
  | 'customer.created'
  | 'customer.deleted';

/** Category of transactional email sent by the platform. */
export type EmailType =
  | 'audit_report'
  | 'weekly_summary'
  | 'payment_failed'
  | 'invitation'
  | 'cancellation_notice'
  | 'alert';

/** Email delivery outcome. */
export type EmailStatus = 'sent' | 'failed' | 'bounced';

/** Supported report export formats. */
export type ExportFormat = 'pdf' | 'csv' | 'json';

/** Resource types that appear in the activity log audit trail. */
export type ActivityResourceType =
  | 'organization'
  | 'member'
  | 'audit'
  | 'report'
  | 'registry'
  | 'subscription'
  | 'export';

// ─────────────────────────────────────────────────────────────────────────────
// NESTED / UTILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single remediation action in the 30/60/90-day roadmap.
 * Embedded inside Report.roadmap[].
 */
export interface RoadmapItem {
  /** Target time horizon for completing this action. */
  horizon: '30d' | '60d' | '90d';
  /** Plain-text description of the action to take. */
  action: string;
  /** Priority relative to other roadmap items. */
  priority: RiskLevel;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COLLECTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * /users/{userId}
 *
 * Created (or updated) on every Firebase Auth sign-in via a Cloud Function
 * or client-side merge write. The document ID equals the Firebase Auth UID.
 */
export interface User {
  /** Firebase Auth UID — matches the Firestore document ID. */
  id: string;
  email: string;
  displayName: string;
  /** Profile photo URL (Firebase Auth provider or custom upload). */
  photoURL?: string;
  /**
   * Multi-tenant isolation key.
   * Required by Firestore security rules: getUserOrgId() reads this field.
   */
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * /organizations/{orgId}
 *
 * Top-level SaaS account. One organization per workspace.
 * Created by the user who first sets up the workspace.
 */
export interface Organization {
  id: string;
  name: string;
  /** URL-friendly identifier used in routing. */
  slug?: string;
  /** Company domain — used for invite validation or future SSO. */
  domain?: string;
  logoURL?: string;
  /** Firebase Auth UID of the account owner. */
  ownerId: string;
  /**
   * Stripe customer ID.
   * Set by the createStripeCustomer Cloud Function after org creation.
   */
  stripeCustomerId?: string;
  /** Reference path to /subscriptions/{subscriptionId}. */
  subscriptionId?: string;
  /**
   * Denormalized from the linked Subscription for fast UI access
   * (avoids an extra Firestore read on every page load).
   */
  plan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
  /** Soft delete — document is retained for compliance; not hard-deleted. */
  deletedAt?: Date;
}

/**
 * /subscriptions/{subscriptionId}
 *
 * Managed by the Stripe Firebase Extension.
 * The document ID equals the Stripe subscription ID.
 *
 * Fields populated by the extension automatically:
 *   stripeSubscriptionId, stripeCustomerId, status,
 *   currentPeriodStart, currentPeriodEnd, cancelledAt, trialEnd,
 *   createdAt, updatedAt
 *
 * Fields that MUST be set by the application:
 *   organizationId — enriched by the onStripeSubscriptionCreated Cloud Function,
 *                    which queries organizations by stripeCustomerId.
 *   plan           — read from the Stripe price metadata field "plan".
 */
export interface Subscription {
  /** = Stripe subscription ID. Also the Firestore document ID. */
  id: string;
  /**
   * Populated by Cloud Function, not by the extension.
   * Cloud Function queries: organizations WHERE stripeCustomerId = subscription.customer
   */
  organizationId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * /billing_events/{eventId}
 *
 * Written by the Stripe Firebase Extension for every incoming webhook.
 * Client writes are blocked by Firestore security rules.
 *
 * The organizationId is NOT set by the extension — it must be enriched
 * by the onStripeBillingEvent Cloud Function via Stripe customer metadata.
 */
export interface BillingEvent {
  id: string;
  /** Enriched by the onStripeBillingEvent Cloud Function. */
  organizationId: string;
  /** Stripe event.id — use for deduplication. */
  stripeEventId: string;
  type: BillingEventType;
  /** Complete Stripe webhook payload — stored as-is for audit compliance. */
  data: Record<string, unknown>;
  /** When Stripe created the event (event.created timestamp). */
  processedAt: Date;
  /** When the extension wrote this document to Firestore. */
  createdAt: Date;
}

/**
 * /email_logs/{emailId}
 *
 * Written by Cloud Functions only (client writes blocked by security rules).
 * Provides a full audit trail of every outbound email sent by the platform.
 */
export interface EmailLog {
  id: string;
  organizationId: string;
  to: string;
  subject: string;
  type: EmailType;
  status: EmailStatus;
  /** Null if the email has not yet been dispatched (e.g. queued). */
  sentAt?: Date;
  createdAt: Date;
  /** Optional context: templateId, reportId, invitedUserId, etc. */
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION SUBCOLLECTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * /organizations/{orgId}/members/{memberId}
 *
 * memberId = userId.
 * This is the SINGLE SOURCE OF TRUTH for a user's role within an org.
 * Firestore security rules read this document via getUserRole(orgId).
 *
 * email and displayName are denormalized here so member lists can be
 * rendered without fetching /users for each row.
 */
export interface OrganizationMember {
  /** = userId and Firestore document ID. */
  id: string;
  userId: string;
  organizationId: string;
  /** Denormalized from User — for display without extra reads. */
  email: string;
  /** Denormalized from User — for display without extra reads. */
  displayName: string;
  role: UserRole;
  invitedAt: Date;
  /** userId of the org member who sent the invitation. */
  invitedBy: string;
  /** Set when the user accepts the invitation. Null = pending. */
  joinedAt?: Date;
  /** Soft delete — set when a member is removed from the org. */
  removedAt?: Date;
}

/**
 * /organizations/{orgId}/audits/{auditId}
 *
 * An AI compliance audit session.
 * Drives the 8-section multi-step audit flow introduced in Phase 4.
 *
 * score and riskLevel are computed by the scoring engine (Phase 5)
 * and written back to this document when status transitions to 'completed'.
 */
export interface Audit {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: AuditStatus;
  /** Optional reference to the AI system being audited (/registry/{systemId}). */
  aiSystemId?: string;
  /** userId of the person who created this audit session. */
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  /** Set when status transitions to 'completed'. */
  completedAt?: Date;
  /** Computed compliance score 0–100. Null until audit is completed. */
  score?: number;
  /** Derived from score by the scoring engine. Null until completed. */
  riskLevel?: RiskLevel;
}

/**
 * /organizations/{orgId}/audits/{auditId}/answers/{answerId}
 *
 * A single response to a single audit question.
 * Created or updated by any authenticated org member.
 *
 * answerId is typically derived from questionId for upsert semantics
 * (one answer per question per audit).
 */
export interface AuditAnswer {
  id: string;
  /** Parent audit — kept on the document for collection group queries. */
  auditId: string;
  /** Identifier from the question bank (e.g. 'q_governance_01'). */
  questionId: string;
  section: AuditSection;
  /**
   * Flexible answer value:
   *   boolean  — yes/no questions
   *   string   — free-text or single-choice
   *   string[] — multi-select or checklist
   */
  answer: string | boolean | string[];
  /** Free-text annotation the user can add to any answer. */
  notes?: string;
  /** userId of the member who answered this question. */
  answeredBy: string;
  answeredAt: Date;
  updatedAt: Date;
}

/**
 * /organizations/{orgId}/reports/{reportId}
 *
 * Generated from a completed audit by the scoring engine (Phase 5).
 *
 * Access rules:
 *   - org members can read reports with status 'published'
 *   - owners and admins can read reports in any status
 *   - only owners/admins can create, update, or delete
 */
export interface Report {
  id: string;
  organizationId: string;
  /** Source audit that produced this report. */
  auditId: string;
  title: string;
  status: ReportStatus;
  /** Compliance score 0–100, copied from the audit on generation. */
  score: number;
  riskLevel: RiskLevel;
  /** Key findings identified during the audit. */
  findings: string[];
  /** Actionable recommendations for each finding. */
  recommendations: string[];
  /**
   * 30/60/90-day remediation roadmap (Phase 5).
   * Optional until the scoring engine populates it.
   */
  roadmap?: RoadmapItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  /** Set when status transitions to 'published'. */
  publishedAt?: Date;
  /** For time-limited report sharing links. Null = no expiry. */
  expiresAt?: Date;
}

/**
 * /organizations/{orgId}/registry/{systemId}
 *
 * AI system registry entry (Phase 8).
 * Tracks every AI tool or model the organization deploys.
 */
export interface AISystem {
  id: string;
  organizationId: string;
  name: string;
  /** Business unit or team that owns this system. */
  department: string;
  /** Plain-text description of what the system does. */
  purpose: string;
  /** Software vendor or model provider (e.g. 'OpenAI', 'internal'). */
  vendor?: string;
  /** Version or release identifier. */
  version?: string;
  /** Categories of personal or sensitive data this system processes. */
  dataTypes: string[];
  riskLevel: RiskLevel;
  /** Whether a human reviews or approves system outputs/decisions. */
  humanSupervision: boolean;
  /** Descriptions of risk mitigations currently in place. */
  mitigations: string[];
  status: AISystemStatus;
  /** userId who registered this system. */
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  /** Date of the most recent compliance review. */
  reviewedAt?: Date;
}

/**
 * /organizations/{orgId}/exports/{exportId}
 *
 * A record of a generated report export.
 * The actual file is stored in Firebase Storage; storageURL is the download link.
 */
export interface Export {
  id: string;
  organizationId: string;
  /** The report this export was generated from. */
  reportId: string;
  format: ExportFormat;
  /** Firebase Storage signed download URL. */
  storageURL: string;
  /** userId who triggered the export. */
  createdBy: string;
  createdAt: Date;
  /** When the storageURL expires. Null = permanent link. */
  expiresAt?: Date;
  /** Set on first download for analytics. */
  downloadedAt?: Date;
}

/**
 * /organizations/{orgId}/activity_logs/{logId}
 *
 * Immutable audit trail written exclusively by Cloud Functions.
 * Client writes are blocked by Firestore security rules.
 *
 * userEmail is denormalized so log entries remain readable even
 * after a member is removed from the organization.
 */
export interface ActivityLog {
  id: string;
  organizationId: string;
  userId: string;
  /** Denormalized — preserved even if the user is later removed. */
  userEmail: string;
  /**
   * Machine-readable action identifier.
   * Examples: 'audit.completed', 'report.published', 'member.invited'
   */
  action: string;
  resourceType: ActivityResourceType;
  /** Firestore document ID of the affected resource. */
  resourceId: string;
  /**
   * Field-level diff for update operations.
   * Shape: { fieldName: { before: unknown; after: unknown } }
   */
  changes?: Record<string, { before: unknown; after: unknown }>;
  createdAt: Date;
}
