/**
 * Firestore Security Rules — Full Access Matrix Tests (Phase E2)
 *
 * Tests every collection × role × operation combination defined in firestore.rules.
 * Paths are REAL full Firestore paths (not abbreviated).
 * Runs against the Firestore emulator on 127.0.0.1:8080.
 *
 * Uses compat-style Firestore API from @firebase/rules-unit-testing contexts.
 */

import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import {
  setupTestEnv,
  teardownTestEnv,
  seedFirestore,
  asActor,
  asUnauth,
  UID,
  ORG_ID,
  AUDIT_ID,
  ANSWER_ID,
  REPORT_ID,
  SYSTEM_ID,
  EXPORT_ID,
  LOG_ID,
  SUB_ID,
  BILLING_EVENT_ID,
  EMAIL_LOG_ID,
  PATHS,
} from './firestore.rules.helpers';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await setupTestEnv();
});

beforeEach(async () => {
  await env.clearFirestore();
  await seedFirestore(env);
});

afterAll(async () => {
  await teardownTestEnv();
});

// ---------------------------------------------------------------------------
// Helper: get a compat doc ref from a context
// ---------------------------------------------------------------------------
function db(ctx: ReturnType<typeof asActor>) {
  return ctx.firestore();
}

// ═══════════════════════════════════════════════════════════════════════════
// /users/{userId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/users/{userId}', () => {
  it('owner can read own profile at users/u_owner', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.userSelf(UID.owner)).get());
  });

  it('owner CANNOT read another user profile at users/u_admin', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(fs.doc(PATHS.userSelf(UID.admin)).get());
  });

  it('new user can create own profile at users/u_new', async () => {
    const fs = db(asActor(env, 'u_new'));
    await assertSucceeds(
      fs.doc(PATHS.userSelf('u_new')).set({
        id: 'u_new', displayName: 'New', email: 'new@test.io',
        initials: 'NE', orgIds: [], createdAt: new Date(), updatedAt: new Date(),
      }),
    );
  });

  it('owner can update own profile at users/u_owner', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(
      fs.doc(PATHS.userSelf(UID.owner)).update({ displayName: 'Updated' }),
    );
  });

  it('owner CANNOT delete own profile at users/u_owner', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(fs.doc(PATHS.userSelf(UID.owner)).delete());
  });

  it('unauthenticated CANNOT read users/u_owner', async () => {
    const fs = db(asUnauth(env));
    await assertFails(fs.doc(PATHS.userSelf(UID.owner)).get());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /organizations/{orgId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/organizations/{orgId}', () => {
  it('owner can read organizations/org1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.org(ORG_ID)).get());
  });

  it('billing can read organizations/org1', async () => {
    const fs = db(asActor(env, UID.billing));
    await assertSucceeds(fs.doc(PATHS.org(ORG_ID)).get());
  });

  it('outsider CANNOT read organizations/org1', async () => {
    const fs = db(asActor(env, UID.outsider));
    await assertFails(fs.doc(PATHS.org(ORG_ID)).get());
  });

  it('authenticated user can create organizations/org_new with own ownerId', async () => {
    const fs = db(asActor(env, UID.outsider));
    await assertSucceeds(
      fs.doc(PATHS.org('org_new')).set({
        id: 'org_new', name: 'New Org', plan: 'free',
        ownerId: UID.outsider, createdAt: new Date(), updatedAt: new Date(),
      }),
    );
  });

  it('authenticated user CANNOT create org with different ownerId', async () => {
    const fs = db(asActor(env, UID.outsider));
    await assertFails(
      fs.doc(PATHS.org('org_new2')).set({
        id: 'org_new2', name: 'Hijack Org', plan: 'free',
        ownerId: UID.owner, createdAt: new Date(),
      }),
    );
  });

  it('owner can update organizations/org1 (preserving ownerId)', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(
      fs.doc(PATHS.org(ORG_ID)).update({ name: 'Renamed Org' }),
    );
  });

  it('admin CANNOT change ownerId on organizations/org1', async () => {
    const fs = db(asActor(env, UID.admin));
    await assertFails(
      fs.doc(PATHS.org(ORG_ID)).update({ ownerId: UID.admin }),
    );
  });

  it('member CANNOT update organizations/org1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(
      fs.doc(PATHS.org(ORG_ID)).update({ name: 'Nope' }),
    );
  });

  it('owner can delete organizations/org1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.org(ORG_ID)).delete());
  });

  it('admin CANNOT delete organizations/org1', async () => {
    const fs = db(asActor(env, UID.admin));
    await assertFails(fs.doc(PATHS.org(ORG_ID)).delete());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /organizations/{orgId}/members/{memberId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/organizations/{orgId}/members/{memberId}', () => {
  it('member can read organizations/org1/members/u_owner', async () => {
    const fs = db(asActor(env, UID.member));
    await assertSucceeds(fs.doc(PATHS.member(ORG_ID, UID.owner)).get());
  });

  it('outsider CANNOT read organizations/org1/members/u_owner', async () => {
    const fs = db(asActor(env, UID.outsider));
    await assertFails(fs.doc(PATHS.member(ORG_ID, UID.owner)).get());
  });

  it('owner can create organizations/org1/members/u_new_member', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(
      fs.doc(PATHS.member(ORG_ID, 'u_new_member')).set({
        userId: 'u_new_member', orgId: ORG_ID, role: 'member',
        status: 'invited', displayName: 'New', email: 'new@test.io',
      }),
    );
  });

  it('member CANNOT create organizations/org1/members/u_intruder', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(
      fs.doc(PATHS.member(ORG_ID, 'u_intruder')).set({
        userId: 'u_intruder', orgId: ORG_ID, role: 'member',
        status: 'invited', displayName: 'Intruder', email: 'x@test.io',
      }),
    );
  });

  it('admin can delete organizations/org1/members/u_member', async () => {
    const fs = db(asActor(env, UID.admin));
    await assertSucceeds(fs.doc(PATHS.member(ORG_ID, UID.member)).delete());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /organizations/{orgId}/audits/{auditId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/organizations/{orgId}/audits/{auditId}', () => {
  it('member can read organizations/org1/audits/audit1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertSucceeds(fs.doc(PATHS.audit(ORG_ID, AUDIT_ID)).get());
  });

  it('billing CANNOT read organizations/org1/audits/audit1', async () => {
    const fs = db(asActor(env, UID.billing));
    await assertFails(fs.doc(PATHS.audit(ORG_ID, AUDIT_ID)).get());
  });

  it('owner can create organizations/org1/audits/audit_new', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(
      fs.doc(PATHS.audit(ORG_ID, 'audit_new')).set({
        organizationId: ORG_ID, createdBy: UID.owner, status: 'draft',
      }),
    );
  });

  it('member CANNOT create organizations/org1/audits/audit_x', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(
      fs.doc(PATHS.audit(ORG_ID, 'audit_x')).set({
        organizationId: ORG_ID, createdBy: UID.member, status: 'draft',
      }),
    );
  });

  it('owner can delete organizations/org1/audits/audit1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.audit(ORG_ID, AUDIT_ID)).delete());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /organizations/{orgId}/audits/{auditId}/answers/{answerId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/organizations/{orgId}/audits/{auditId}/answers/{answerId}', () => {
  it('member can read organizations/org1/audits/audit1/answers/answer1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertSucceeds(fs.doc(PATHS.answer(ORG_ID, AUDIT_ID, ANSWER_ID)).get());
  });

  it('billing CANNOT read organizations/org1/audits/audit1/answers/answer1', async () => {
    const fs = db(asActor(env, UID.billing));
    await assertFails(fs.doc(PATHS.answer(ORG_ID, AUDIT_ID, ANSWER_ID)).get());
  });

  it('member can create answer with correct auditId and own uid', async () => {
    const fs = db(asActor(env, UID.member));
    await assertSucceeds(
      fs.doc(PATHS.answer(ORG_ID, AUDIT_ID, 'ans_new')).set({
        auditId: AUDIT_ID, answeredBy: UID.member, value: 'no',
      }),
    );
  });

  it('member CANNOT create answer with wrong auditId', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(
      fs.doc(PATHS.answer(ORG_ID, AUDIT_ID, 'ans_bad')).set({
        auditId: 'wrong_audit', answeredBy: UID.member, value: 'no',
      }),
    );
  });

  it('owner can delete organizations/org1/audits/audit1/answers/answer1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.answer(ORG_ID, AUDIT_ID, ANSWER_ID)).delete());
  });

  it('member CANNOT delete answers', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(fs.doc(PATHS.answer(ORG_ID, AUDIT_ID, ANSWER_ID)).delete());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /organizations/{orgId}/reports/{reportId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/organizations/{orgId}/reports/{reportId}', () => {
  it('owner can read organizations/org1/reports/report1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.report(ORG_ID, REPORT_ID)).get());
  });

  it('member can read published report', async () => {
    const fs = db(asActor(env, UID.member));
    await assertSucceeds(fs.doc(PATHS.report(ORG_ID, REPORT_ID)).get());
  });

  it('member CANNOT read draft report', async () => {
    // Seed a draft report via admin
    await env.withSecurityRulesDisabled(async (adminCtx) => {
      await adminCtx.firestore().doc(PATHS.report(ORG_ID, 'report_draft')).set({
        organizationId: ORG_ID, status: 'draft', createdBy: UID.owner,
      });
    });
    const fs = db(asActor(env, UID.member));
    await assertFails(fs.doc(PATHS.report(ORG_ID, 'report_draft')).get());
  });

  it('billing CANNOT read organizations/org1/reports/report1', async () => {
    const fs = db(asActor(env, UID.billing));
    await assertFails(fs.doc(PATHS.report(ORG_ID, REPORT_ID)).get());
  });

  it('owner can create report with matching orgId', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(
      fs.doc(PATHS.report(ORG_ID, 'report_new')).set({
        organizationId: ORG_ID, status: 'draft', createdBy: UID.owner,
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /organizations/{orgId}/registry/{systemId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/organizations/{orgId}/registry/{systemId}', () => {
  it('member can read organizations/org1/registry/system1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertSucceeds(fs.doc(PATHS.registry(ORG_ID, SYSTEM_ID)).get());
  });

  it('billing CANNOT read organizations/org1/registry/system1', async () => {
    const fs = db(asActor(env, UID.billing));
    await assertFails(fs.doc(PATHS.registry(ORG_ID, SYSTEM_ID)).get());
  });

  it('admin can create registry entry with matching orgId', async () => {
    const fs = db(asActor(env, UID.admin));
    await assertSucceeds(
      fs.doc(PATHS.registry(ORG_ID, 'sys_new')).set({
        organizationId: ORG_ID, name: 'New System',
      }),
    );
  });

  it('member CANNOT create registry entry', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(
      fs.doc(PATHS.registry(ORG_ID, 'sys_bad')).set({
        organizationId: ORG_ID, name: 'Nope',
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /organizations/{orgId}/exports/{exportId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/organizations/{orgId}/exports/{exportId}', () => {
  it('member can read organizations/org1/exports/export1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertSucceeds(fs.doc(PATHS.export(ORG_ID, EXPORT_ID)).get());
  });

  it('exports are immutable — update always fails', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(
      fs.doc(PATHS.export(ORG_ID, EXPORT_ID)).update({ storageURL: 'gs://other' }),
    );
  });

  it('owner can delete organizations/org1/exports/export1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.export(ORG_ID, EXPORT_ID)).delete());
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /organizations/{orgId}/activity_logs/{logId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/organizations/{orgId}/activity_logs/{logId}', () => {
  it('owner can read organizations/org1/activity_logs/log1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.activityLog(ORG_ID, LOG_ID)).get());
  });

  it('member CANNOT read organizations/org1/activity_logs/log1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(fs.doc(PATHS.activityLog(ORG_ID, LOG_ID)).get());
  });

  it('all client writes blocked on activity_logs', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(
      fs.doc(PATHS.activityLog(ORG_ID, 'log_new')).set({
        action: 'test', userId: UID.owner, timestamp: new Date(),
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /subscriptions/{subscriptionId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/subscriptions/{subscriptionId}', () => {
  it('owner can read subscriptions/sub1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.subscription(SUB_ID)).get());
  });

  it('billing can read subscriptions/sub1', async () => {
    const fs = db(asActor(env, UID.billing));
    await assertSucceeds(fs.doc(PATHS.subscription(SUB_ID)).get());
  });

  it('member CANNOT read subscriptions/sub1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(fs.doc(PATHS.subscription(SUB_ID)).get());
  });

  it('all client writes blocked on subscriptions', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(
      fs.doc(PATHS.subscription('sub_new')).set({
        organizationId: ORG_ID, status: 'active',
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /billing_events/{eventId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/billing_events/{eventId}', () => {
  it('billing can read billing_events/be1', async () => {
    const fs = db(asActor(env, UID.billing));
    await assertSucceeds(fs.doc(PATHS.billingEvent(BILLING_EVENT_ID)).get());
  });

  it('member CANNOT read billing_events/be1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(fs.doc(PATHS.billingEvent(BILLING_EVENT_ID)).get());
  });

  it('all client writes blocked on billing_events', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(
      fs.doc(PATHS.billingEvent('be_new')).set({
        organizationId: ORG_ID, type: 'test',
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// /email_logs/{emailId}
// ═══════════════════════════════════════════════════════════════════════════

describe('/email_logs/{emailId}', () => {
  it('owner can read email_logs/email1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertSucceeds(fs.doc(PATHS.emailLog(EMAIL_LOG_ID)).get());
  });

  it('member CANNOT read email_logs/email1', async () => {
    const fs = db(asActor(env, UID.member));
    await assertFails(fs.doc(PATHS.emailLog(EMAIL_LOG_ID)).get());
  });

  it('billing CANNOT read email_logs/email1', async () => {
    const fs = db(asActor(env, UID.billing));
    await assertFails(fs.doc(PATHS.emailLog(EMAIL_LOG_ID)).get());
  });

  it('all client writes blocked on email_logs', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(
      fs.doc(PATHS.emailLog('email_new')).set({
        organizationId: ORG_ID, to: 'x@test.io', template: 'test',
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT DENY — unknown paths
// ═══════════════════════════════════════════════════════════════════════════

describe('default deny — unknown paths', () => {
  it('authenticated user CANNOT read unknown_collection/doc1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(fs.doc('unknown_collection/doc1').get());
  });

  it('authenticated user CANNOT write unknown_collection/doc1', async () => {
    const fs = db(asActor(env, UID.owner));
    await assertFails(
      fs.doc('unknown_collection/doc1').set({ data: 'test' }),
    );
  });
});
