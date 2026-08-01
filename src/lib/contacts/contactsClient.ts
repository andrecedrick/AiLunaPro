/**
 * Contacts client — org-scoped CRM-lite, authed worker routes.
 * Org CRUD (owner/admin/member) + super-admin cross-org READ (`listAllContacts`).
 * All calls send the Firebase ID token; the worker enforces RBAC + org scoping.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export type ContactStatus = 'active' | 'inactive' | 'blocked';
/**
 * Every source the platform writes. `signup` and `reconcile` are system-written
 * only — they appear in filters and in the table, but an operator cannot select
 * them when creating a contact by hand, because claiming a contact arrived via
 * signup when it did not would corrupt the funnel the source field exists to
 * measure.
 */
export type ContactSource =
  | 'worksheet' | 'quote' | 'manual' | 'visibility' | 'import' | 'demo_request'
  | 'signup' | 'reconcile';
/** Sales funnel stage. Distinct from ContactStatus (the CRM record state). */
export type LeadStatus = '' | 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface Contact {
  contactId:     string;
  orgId?:        string;        // present only in the super-admin cross-org view
  name:          string;
  email:         string;
  phone:         string;
  company:       string;
  tags:          string[];
  notes:         string;
  status:        ContactStatus;
  source:        ContactSource;
  linkedQuoteId: string;
  linkedAuditId: string;
  createdByUid:  string;
  createdAt:     string;
  updatedAt:     string;
  // Written by the demo-request → CRM bridge. Manually-created contacts carry
  // none of these, so each is optional and defaults at the API boundary.
  identityEmail?:  string;
  countryCode?:    string;
  phoneCountry?:   string;
  leadStatus?:     LeadStatus;
  owner?:          string;
  lastActivityAt?: string;
  /** The prospect's most recent "what would you like to discuss?" text. */
  lastMessage?:    string;
  /** Reconciliation link into Twenty CRM. Empty for manually-created contacts. */
  twentyPersonId?:  string;
  twentyCompanyId?: string;
  // Ownership ledger. `assignedToUid` is what the server authorises on; the rest
  // is for display. Absent on records created before assignment existed, where
  // the server falls back to the creator.
  assignedToUid?:         string;
  assignedToEmail?:       string;
  assignedByEmail?:       string;
  assignedAt?:            string;
  lastReassignedByEmail?: string;
  lastReassignedAt?:      string;
}

export interface ContactInput {
  name:           string;
  email:          string;
  phone?:         string;
  company?:       string;
  tags?:          string[];
  notes?:         string;
  status?:        ContactStatus;
  source?:        ContactSource;
  leadStatus?:    LeadStatus;
  owner?:         string;
  countryCode?:   string;
  linkedQuoteId?: string;
  linkedAuditId?: string;
}

export interface ContactFilters { tag?: string; source?: string; status?: string }

/**
 * One page of contacts. `nextCursor` is empty when the server reached the end —
 * it is the ONLY correct way to ask for more, because paging by offset over a
 * collection that is still receiving signups would skip or repeat rows.
 */
export interface ContactPage {
  contacts:   Contact[];
  nextCursor: string;
  /** Documents the server READ to build this page. Surfaced for measurement. */
  scanned:    number;
}

export interface PageQuery { limit?: number; cursor?: string }

function applyPaging(q: URLSearchParams, page?: PageQuery): void {
  if (page?.limit)  q.set('limit', String(page.limit));
  if (page?.cursor) q.set('cursor', page.cursor);
}

async function readPage(res: Response): Promise<ContactPage> {
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as Partial<ContactPage> | null;
  return { contacts: j?.contacts ?? [], nextCursor: j?.nextCursor ?? '', scanned: j?.scanned ?? 0 };
}

/** Error carrying the worker's machine code (e.g. DUPLICATE_EMAIL, FORBIDDEN_STATUS). */
export class ContactError extends Error {
  code: string;
  constructor(code: string) { super(code); this.name = 'ContactError'; this.code = code; }
}

async function readError(res: Response): Promise<never> {
  const j = await res.json().catch(() => null) as { code?: string } | null;
  throw new ContactError(j?.code ?? `HTTP_${res.status}`);
}

/**
 * One page of the org's contacts. Assignment-scoped server-side: a super admin
 * gets the whole org, everyone else gets what is assigned to them.
 *
 * Filters are sent to the SERVER rather than applied to the result, because the
 * server applies them while filling the page — filtering a page after the fact
 * would return a handful of rows for a page size of fifty.
 */
export async function listContacts(orgId: string, filters?: ContactFilters, page?: PageQuery): Promise<ContactPage> {
  const idToken = await getIdToken();
  const q = new URLSearchParams({ orgId });
  if (filters?.tag)    q.set('tag', filters.tag);
  if (filters?.source) q.set('source', filters.source);
  if (filters?.status) q.set('status', filters.status);
  applyPaging(q, page);
  return readPage(await fetch(`${WORKER_BASE}/api/contacts/list?${q.toString()}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  }));
}

/** Super-admin (platform operator) cross-org READ-ONLY page. */
export async function listAllContacts(page?: PageQuery): Promise<ContactPage> {
  const idToken = await getIdToken();
  const q = new URLSearchParams();
  applyPaging(q, page);
  const qs = q.toString();
  return readPage(await fetch(`${WORKER_BASE}/api/contacts/all${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  }));
}

export async function createContact(orgId: string, input: ContactInput): Promise<string> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/contacts/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, ...input }),
  });
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as { contactId?: string } | null;
  return j?.contactId ?? '';
}

/** Patch fields (name/email/phone/company/tags/notes/status/source/links).
 *  status change (block/activate) is owner/admin only — server-enforced. */
export async function patchContact(orgId: string, contactId: string, input: Partial<ContactInput>): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/contacts/${encodeURIComponent(contactId)}?orgId=${encodeURIComponent(orgId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, ...input }),
  });
  if (!res.ok) return readError(res);
}

/* ── Assignment — SUPER ADMIN ONLY (server-enforced via the operator allowlist) ── */

export interface AssignableMember { uid: string; email: string; role: string }

/** Members of `orgId` who may hold a lead. Super-admin only. */
export async function listAssignable(orgId: string): Promise<AssignableMember[]> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/contacts/assignable?orgId=${encodeURIComponent(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as { members?: AssignableMember[] } | null;
  return j?.members ?? [];
}

/**
 * Assign, transfer or reassign a contact — one operation server-side.
 * Pass an empty `assignToUid` to UNASSIGN (returns the lead to the super-admin pool).
 */
export async function assignContact(orgId: string, contactId: string, assignToUid: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/contacts/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, contactId, assignToUid }),
  });
  if (!res.ok) return readError(res);
}

/* ── CSV import — owner/admin/member ───────────────────────────────────────── */

export interface ImportRejection { row: number; code: string; email: string }
export interface ImportResult { imported: number; rejected: ImportRejection[] }

/** Post ONE batch. The caller splits the file (see lib/contacts/csvParse.ts). */
export async function importContacts(
  orgId: string,
  rows: readonly Record<string, string>[],
  assignToUid?: string,
): Promise<ImportResult> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/contacts/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, rows, ...(assignToUid ? { assignToUid } : {}) }),
  });
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as Partial<ImportResult> | null;
  return { imported: j?.imported ?? 0, rejected: j?.rejected ?? [] };
}

export async function deleteContact(orgId: string, contactId: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/contacts/${encodeURIComponent(contactId)}?orgId=${encodeURIComponent(orgId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return readError(res);
}
