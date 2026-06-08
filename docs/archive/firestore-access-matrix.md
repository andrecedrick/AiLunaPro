> ⚠️ **OBSOLETE / SUPERSEDED — archived 2026-06-07.** The single authoritative source of truth is `docs/cahier-des-charges-v2.md` (§0bis Master Ledger). This file is reference-only and carries **no agreed scope**.

# Firestore Security Rules — Access Test Matrix

**Phase:** E2  
**Rules file:** `firestore.rules`  
**Test file:** `tests/firestore.rules.test.ts`  
**Status:** PENDING (run tests to fill "Actual" column)

## Actors

| Actor | UID | Role in org1 |
|-------|-----|-------------|
| Owner | `u_owner` | `owner` |
| Admin | `u_admin` | `admin` |
| Member | `u_member` | `member` |
| Billing | `u_billing` | `billing` |
| Outsider | `u_outsider` | (none) |
| Unauth | — | (none) |

## Matrix

### `/users/{userId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Owner reads own profile | `users/u_owner` | read | ALLOW | |
| Owner reads other user | `users/u_admin` | read | DENY | |
| New user creates own profile | `users/u_new` | create | ALLOW | |
| Owner updates own profile | `users/u_owner` | update | ALLOW | |
| Owner deletes own profile | `users/u_owner` | delete | DENY | |
| Unauth reads user | `users/u_owner` | read | DENY | |

### `/organizations/{orgId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Owner reads org | `organizations/org1` | read | ALLOW | |
| Billing reads org | `organizations/org1` | read | ALLOW | |
| Outsider reads org | `organizations/org1` | read | DENY | |
| Auth user creates org (own ownerId) | `organizations/org_new` | create | ALLOW | |
| Auth user creates org (wrong ownerId) | `organizations/org_new2` | create | DENY | |
| Owner updates org | `organizations/org1` | update | ALLOW | |
| Admin changes ownerId | `organizations/org1` | update | DENY | |
| Member updates org | `organizations/org1` | update | DENY | |
| Owner deletes org | `organizations/org1` | delete | ALLOW | |
| Admin deletes org | `organizations/org1` | delete | DENY | |

### `/organizations/{orgId}/members/{memberId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Member reads member list | `organizations/org1/members/u_owner` | read | ALLOW | |
| Outsider reads member | `organizations/org1/members/u_owner` | read | DENY | |
| Owner creates member | `organizations/org1/members/u_new_member` | create | ALLOW | |
| Member creates member | `organizations/org1/members/u_intruder` | create | DENY | |
| Admin deletes member | `organizations/org1/members/u_member` | delete | ALLOW | |

### `/organizations/{orgId}/audits/{auditId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Member reads audit | `organizations/org1/audits/audit1` | read | ALLOW | |
| Billing reads audit | `organizations/org1/audits/audit1` | read | DENY | |
| Owner creates audit | `organizations/org1/audits/audit_new` | create | ALLOW | |
| Member creates audit | `organizations/org1/audits/audit_x` | create | DENY | |
| Owner deletes audit | `organizations/org1/audits/audit1` | delete | ALLOW | |

### `/organizations/{orgId}/audits/{auditId}/answers/{answerId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Member reads answer | `organizations/org1/audits/audit1/answers/answer1` | read | ALLOW | |
| Billing reads answer | `organizations/org1/audits/audit1/answers/answer1` | read | DENY | |
| Member creates answer (correct auditId) | `organizations/org1/audits/audit1/answers/ans_new` | create | ALLOW | |
| Member creates answer (wrong auditId) | `organizations/org1/audits/audit1/answers/ans_bad` | create | DENY | |
| Owner deletes answer | `organizations/org1/audits/audit1/answers/answer1` | delete | ALLOW | |
| Member deletes answer | `organizations/org1/audits/audit1/answers/answer1` | delete | DENY | |

### `/organizations/{orgId}/reports/{reportId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Owner reads report | `organizations/org1/reports/report1` | read | ALLOW | |
| Member reads published report | `organizations/org1/reports/report1` | read | ALLOW | |
| Member reads draft report | `organizations/org1/reports/report_draft` | read | DENY | |
| Billing reads report | `organizations/org1/reports/report1` | read | DENY | |
| Owner creates report | `organizations/org1/reports/report_new` | create | ALLOW | |

### `/organizations/{orgId}/registry/{systemId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Member reads registry | `organizations/org1/registry/system1` | read | ALLOW | |
| Billing reads registry | `organizations/org1/registry/system1` | read | DENY | |
| Admin creates registry entry | `organizations/org1/registry/sys_new` | create | ALLOW | |
| Member creates registry entry | `organizations/org1/registry/sys_bad` | create | DENY | |

### `/organizations/{orgId}/exports/{exportId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Member reads export | `organizations/org1/exports/export1` | read | ALLOW | |
| Export update (immutable) | `organizations/org1/exports/export1` | update | DENY | |
| Owner deletes export | `organizations/org1/exports/export1` | delete | ALLOW | |

### `/organizations/{orgId}/activity_logs/{logId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Owner reads activity log | `organizations/org1/activity_logs/log1` | read | ALLOW | |
| Member reads activity log | `organizations/org1/activity_logs/log1` | read | DENY | |
| Owner writes activity log | `organizations/org1/activity_logs/log_new` | write | DENY | |

### `/subscriptions/{subscriptionId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Owner reads subscription | `subscriptions/sub1` | read | ALLOW | |
| Billing reads subscription | `subscriptions/sub1` | read | ALLOW | |
| Member reads subscription | `subscriptions/sub1` | read | DENY | |
| Owner writes subscription | `subscriptions/sub_new` | write | DENY | |

### `/billing_events/{eventId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Billing reads billing event | `billing_events/be1` | read | ALLOW | |
| Member reads billing event | `billing_events/be1` | read | DENY | |
| Owner writes billing event | `billing_events/be_new` | write | DENY | |

### `/email_logs/{emailId}`

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Owner reads email log | `email_logs/email1` | read | ALLOW | |
| Member reads email log | `email_logs/email1` | read | DENY | |
| Billing reads email log | `email_logs/email1` | read | DENY | |
| Owner writes email log | `email_logs/email_new` | write | DENY | |

### Default Deny

| Test | Real Path | Operation | Expected | Actual |
|------|-----------|-----------|----------|--------|
| Auth reads unknown collection | `unknown_collection/doc1` | read | DENY | |
| Auth writes unknown collection | `unknown_collection/doc1` | write | DENY | |

---

**Total assertions:** 53  
**Collections covered:** 12 + default deny  
**Actors tested:** 6 (owner, admin, member, billing, outsider, unauth)
