/**
 * Contacts client — org-scoped CRM-lite, authed worker routes.
 * Org CRUD (owner/admin/member) + super-admin cross-org READ (`listAllContacts`).
 * All calls send the Firebase ID token; the worker enforces RBAC + org scoping.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export type ContactStatus = 'active' | 'inactive' | 'blocked';
export type ContactSource = 'worksheet' | 'quote' | 'manual' | 'visibility' | 'import';

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
  linkedQuoteId?: string;
  linkedAuditId?: string;
}

export interface ContactFilters { tag?: string; source?: string; status?: string }

/** Error carrying the worker's machine code (e.g. DUPLICATE_EMAIL, FORBIDDEN_STATUS). */
export class ContactError extends Error {
  code: string;
  constructor(code: string) { super(code); this.name = 'ContactError'; this.code = code; }
}

async function readError(res: Response): Promise<never> {
  const j = await res.json().catch(() => null) as { code?: string } | null;
  throw new ContactError(j?.code ?? `HTTP_${res.status}`);
}

/** Org-scoped list. owner/admin → all org contacts; member → own only (server-enforced). */
export async function listContacts(orgId: string, filters?: ContactFilters): Promise<Contact[]> {
  const idToken = await getIdToken();
  const q = new URLSearchParams({ orgId });
  if (filters?.tag)    q.set('tag', filters.tag);
  if (filters?.source) q.set('source', filters.source);
  if (filters?.status) q.set('status', filters.status);
  const res = await fetch(`${WORKER_BASE}/api/contacts/list?${q.toString()}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as { contacts?: Contact[] } | null;
  return j?.contacts ?? [];
}

/** Super-admin (platform operator) cross-org READ-ONLY list. */
export async function listAllContacts(): Promise<Contact[]> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/contacts/all`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return readError(res);
  const j = await res.json().catch(() => null) as { contacts?: Contact[] } | null;
  return j?.contacts ?? [];
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

export async function deleteContact(orgId: string, contactId: string): Promise<void> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/contacts/${encodeURIComponent(contactId)}?orgId=${encodeURIComponent(orgId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return readError(res);
}
