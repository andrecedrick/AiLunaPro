/**
 * Firestore Rules Test Helpers — Phase E2
 *
 * Emulator setup, seed data, and typed actor contexts for the access matrix.
 * Uses @firebase/rules-unit-testing v2+ API.
 */

import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
  type RulesTestContext,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PROJECT_ID = 'audit-ai-test';

/** Actor UIDs — deterministic for readable assertions. */
export const UID = {
  owner: 'u_owner',
  admin: 'u_admin',
  member: 'u_member',
  billing: 'u_billing',
  outsider: 'u_outsider',
  // unauth handled by unauthenticatedContext()
} as const;

export const ORG_ID = 'org1';
export const OTHER_ORG_ID = 'org_other';
export const AUDIT_ID = 'audit1';
export const ANSWER_ID = 'answer1';
export const REPORT_ID = 'report1';
export const SYSTEM_ID = 'system1';
export const EXPORT_ID = 'export1';
export const LOG_ID = 'log1';
export const SUB_ID = 'sub1';
export const BILLING_EVENT_ID = 'be1';
export const EMAIL_LOG_ID = 'email1';

// ---------------------------------------------------------------------------
// Full Firestore document paths (as used in rules)
// ---------------------------------------------------------------------------

export const PATHS = {
  // /users/{userId}
  userSelf: (uid: string) => `users/${uid}`,

  // /organizations/{orgId}
  org: (orgId: string) => `organizations/${orgId}`,

  // /organizations/{orgId}/members/{memberId}
  member: (orgId: string, memberId: string) =>
    `organizations/${orgId}/members/${memberId}`,

  // /organizations/{orgId}/audits/{auditId}
  audit: (orgId: string, auditId: string) =>
    `organizations/${orgId}/audits/${auditId}`,

  // /organizations/{orgId}/audits/{auditId}/answers/{answerId}
  answer: (orgId: string, auditId: string, answerId: string) =>
    `organizations/${orgId}/audits/${auditId}/answers/${answerId}`,

  // /organizations/{orgId}/reports/{reportId}
  report: (orgId: string, reportId: string) =>
    `organizations/${orgId}/reports/${reportId}`,

  // /organizations/{orgId}/registry/{systemId}
  registry: (orgId: string, systemId: string) =>
    `organizations/${orgId}/registry/${systemId}`,

  // /organizations/{orgId}/exports/{exportId}
  export: (orgId: string, exportId: string) =>
    `organizations/${orgId}/exports/${exportId}`,

  // /organizations/{orgId}/activity_logs/{logId}
  activityLog: (orgId: string, logId: string) =>
    `organizations/${orgId}/activity_logs/${logId}`,

  // /subscriptions/{subscriptionId}
  subscription: (subId: string) => `subscriptions/${subId}`,

  // /billing_events/{eventId}
  billingEvent: (eventId: string) => `billing_events/${eventId}`,

  // /email_logs/{emailId}
  emailLog: (emailId: string) => `email_logs/${emailId}`,
} as const;

// ---------------------------------------------------------------------------
// Environment setup / teardown
// ---------------------------------------------------------------------------

let testEnv: RulesTestEnvironment;

export async function setupTestEnv(): Promise<RulesTestEnvironment> {
  const rulesPath = resolve(__dirname, '..', 'firestore.rules');
  const rules = readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules, host: '127.0.0.1', port: 8080 },
  });

  return testEnv;
}

export function getTestEnv(): RulesTestEnvironment {
  if (!testEnv) throw new Error('Call setupTestEnv() first');
  return testEnv;
}

export async function teardownTestEnv(): Promise<void> {
  if (testEnv) await testEnv.cleanup();
}

// ---------------------------------------------------------------------------
// Seed data — written via admin context (bypasses rules)
// ---------------------------------------------------------------------------

export async function seedFirestore(env: RulesTestEnvironment): Promise<void> {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();

    // Members in org1
    await db.doc(PATHS.member(ORG_ID, UID.owner)).set({
      userId: UID.owner, orgId: ORG_ID, role: 'owner',
      status: 'active', displayName: 'Owner', email: 'owner@test.io',
    });
    await db.doc(PATHS.member(ORG_ID, UID.admin)).set({
      userId: UID.admin, orgId: ORG_ID, role: 'admin',
      status: 'active', displayName: 'Admin', email: 'admin@test.io',
    });
    await db.doc(PATHS.member(ORG_ID, UID.member)).set({
      userId: UID.member, orgId: ORG_ID, role: 'member',
      status: 'active', displayName: 'Member', email: 'member@test.io',
    });
    await db.doc(PATHS.member(ORG_ID, UID.billing)).set({
      userId: UID.billing, orgId: ORG_ID, role: 'billing',
      status: 'active', displayName: 'Billing', email: 'billing@test.io',
    });

    // Org document
    await db.doc(PATHS.org(ORG_ID)).set({
      id: ORG_ID, name: 'Test Org', plan: 'pro',
      ownerId: UID.owner, createdAt: new Date(), updatedAt: new Date(),
    });

    // User profiles
    for (const uid of [UID.owner, UID.admin, UID.member, UID.billing]) {
      await db.doc(PATHS.userSelf(uid)).set({
        id: uid, displayName: uid, email: `${uid}@test.io`,
        initials: 'XX', orgIds: [ORG_ID], createdAt: new Date(), updatedAt: new Date(),
      });
    }

    // Audit
    await db.doc(PATHS.audit(ORG_ID, AUDIT_ID)).set({
      organizationId: ORG_ID, createdBy: UID.owner, status: 'in_progress',
    });

    // Answer
    await db.doc(PATHS.answer(ORG_ID, AUDIT_ID, ANSWER_ID)).set({
      auditId: AUDIT_ID, answeredBy: UID.member, value: 'yes',
    });

    // Report (published)
    await db.doc(PATHS.report(ORG_ID, REPORT_ID)).set({
      organizationId: ORG_ID, status: 'published', createdBy: UID.owner,
    });

    // Registry
    await db.doc(PATHS.registry(ORG_ID, SYSTEM_ID)).set({
      organizationId: ORG_ID, name: 'GPT-4 Chatbot',
    });

    // Export
    await db.doc(PATHS.export(ORG_ID, EXPORT_ID)).set({
      organizationId: ORG_ID, storageURL: 'gs://bucket/file.pdf',
    });

    // Activity log
    await db.doc(PATHS.activityLog(ORG_ID, LOG_ID)).set({
      action: 'audit.created', userId: UID.owner, timestamp: new Date(),
    });

    // Subscription (root collection with organizationId)
    await db.doc(PATHS.subscription(SUB_ID)).set({
      organizationId: ORG_ID, status: 'active', plan: 'pro',
    });

    // Billing event
    await db.doc(PATHS.billingEvent(BILLING_EVENT_ID)).set({
      organizationId: ORG_ID, type: 'invoice.paid',
    });

    // Email log
    await db.doc(PATHS.emailLog(EMAIL_LOG_ID)).set({
      organizationId: ORG_ID, to: 'user@test.io', template: 'welcome',
    });
  });
}

// ---------------------------------------------------------------------------
// Actor context helpers
// ---------------------------------------------------------------------------

export function asActor(
  env: RulesTestEnvironment,
  uid: string,
): RulesTestContext {
  return env.authenticatedContext(uid);
}

export function asUnauth(env: RulesTestEnvironment): RulesTestContext {
  return env.unauthenticatedContext();
}
