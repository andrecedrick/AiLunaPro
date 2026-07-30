/**
 * Lead → Contact bridge.
 *
 * A demo request IS a sales lead, but until now it stopped at `demo_requests`:
 * the operator saw the lead in the Admin Center and had to retype the person into
 * Contacts by hand. That is manual work on the revenue path, and it silently
 * loses leads whenever nobody gets round to it.
 *
 * This upserts the prospect into the EXISTING org-scoped CRM
 * (`organizations/{orgId}/contacts/{id}`) — no parallel contact store, no new
 * collection, same shape the Contacts page already reads.
 *
 * Deduplication reuses the model the CRM already enforces: one contact per
 * `emailKey` per org. A returning prospect updates their existing record instead
 * of creating a second one.
 *
 * Ownership: the caller (demo-request route) treats a failure here as non-fatal —
 * the LEAD is already stored and is the source of truth. A failure must still be
 * observable, so this THROWS rather than swallowing, and the caller raises a
 * durable alert.
 */

import { firestoreGet, firestoreSet, firestoreRunQuery } from './firestoreAdmin';

const COLLECTION = (orgId: string) => `organizations/${orgId}/contacts`;

export interface LeadContactInput {
  orgId:         string;
  name:          string;
  /** Address the prospect asked to be reached on — the CRM identity for dedup. */
  contactEmail:  string;
  /** Verified account address, kept for reconciliation. Never used as the dedup key. */
  identityEmail: string;
  company:       string;
  /** Normalised phone (support-shared format). Sales calls the lead back. */
  phone:         string;
  /** ISO-3166 alpha-2 of the REQUEST, from Cloudflare edge geo. */
  countryCode:   string;
  /** International dialling prefix typed by the user, e.g. "+33". */
  phoneCountry:  string;
  /** What the prospect asked to discuss. Sales needs it to prepare the call. */
  message:       string;
  /** Verified uid of the submitter, recorded as provenance. */
  uid:           string;
}

export interface LeadContactResult {
  contactId: string;
  created:   boolean;
  /**
   * Twenty CRM ids already recorded on this contact, when any.
   *
   * The contact doubles as the idempotency LEDGER for the CRM push: a returning
   * prospect gets a NEW lead (different dedup bucket) but must not get a second
   * Person in Twenty. Because the contact is deduped by email, a non-empty
   * personId here means "already pushed" — so the push adds only a Note.
   */
  twentyPersonId:  string;
  twentyCompanyId: string;
}

function genId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Existing contact id for this email in this org, else null. */
async function findByEmail(saJson: string, orgId: string, emailKey: string): Promise<string | null> {
  const rows = await firestoreRunQuery(saJson, {
    from:  [{ collectionId: 'contacts' }],
    where: { fieldFilter: { field: { fieldPath: 'emailKey' }, op: 'EQUAL', value: { stringValue: emailKey } } },
    limit: 1,
  }, `organizations/${orgId}`);
  const hit = rows[0];
  return hit ? (hit.name.split('/').pop() ?? null) : null;
}

/**
 * Create or update the contact for a demo-request lead.
 *
 * On UPDATE the write is deliberately narrow: only `lastActivityAt`, `updatedAt`
 * and `identityEmail` are set unconditionally, and `company` only fills a blank.
 * An operator may have corrected the name, re-tagged the contact, or moved it
 * through the pipeline — a new demo request must not undo that work. In
 * particular `source`, `status` and `leadStatus` are never overwritten, so a
 * contact already marked `qualified` does not get demoted back to `new`.
 */
export async function upsertLeadContact(saJson: string, input: LeadContactInput): Promise<LeadContactResult> {
  const now = new Date().toISOString();
  const emailKey = input.contactEmail;

  const existingId = await findByEmail(saJson, input.orgId, emailKey);

  if (existingId) {
    const current = await firestoreGet(saJson, `${COLLECTION(input.orgId)}/${existingId}`) as Record<string, unknown> | null;
    const patch: Record<string, unknown> = {
      identityEmail:  input.identityEmail,
      lastActivityAt: now,
      updatedAt:      now,
    };
    if (input.company && !(typeof current?.company === 'string' && current.company)) patch.company = input.company;
    // Same fill-a-blank rule as company: an operator may have corrected the number
    // by hand, and a repeat request must not overwrite that correction.
    if (input.phone && !(typeof current?.phone === 'string' && current.phone)) patch.phone = input.phone;
    if (input.countryCode && !(typeof current?.countryCode === 'string' && current.countryCode)) patch.countryCode = input.countryCode;
    if (input.phoneCountry && !(typeof current?.phoneCountry === 'string' && current.phoneCountry)) patch.phoneCountry = input.phoneCountry;
    // The latest ask, so an operator opening a returning lead sees what THIS
    // request was about. Older text is preserved in the demo_requests lead, which
    // remains the immutable per-request record.
    if (input.message) patch.lastMessage = input.message;
    await firestoreSet(saJson, `${COLLECTION(input.orgId)}/${existingId}`, patch, { merge: true });
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
      contactId: existingId, created: false,
      twentyPersonId:  str(current?.twentyPersonId),
      twentyCompanyId: str(current?.twentyCompanyId),
    };
  }

  const contactId = genId();
  await firestoreSet(saJson, `${COLLECTION(input.orgId)}/${contactId}`, {
    contactId,
    orgId:          input.orgId,
    name:           input.name,
    email:          emailKey,
    emailKey,                       // dedup key the CRM already indexes
    identityEmail:  input.identityEmail,
    phone:          input.phone,
    countryCode:    input.countryCode,
    phoneCountry:   input.phoneCountry,
    company:        input.company,
    lastMessage:    input.message,
    owner:          '',          // unassigned until an operator takes the lead
    notes:          '',
    tags:           [],
    status:         'active',       // CRM record status (active/inactive/blocked)
    leadStatus:     'new',          // sales pipeline stage, distinct from `status`
    source:         'demo_request',
    twentyPersonId: '',   // filled by the CRM push; also its idempotency key
    twentyCompanyId: '',
    linkedQuoteId:  '',
    linkedAuditId:  '',
    createdByUid:   input.uid,
    createdAt:      now,
    lastActivityAt: now,
    updatedAt:      now,
  });
  return { contactId, created: true, twentyPersonId: '', twentyCompanyId: '' };
}
