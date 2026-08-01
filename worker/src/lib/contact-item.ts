/**
 * Contact → API shape.
 *
 * Extracted from routes/contacts.ts so the list, the cross-org list and the
 * single-contact fetch all project the SAME fields. Two copies of this mapping
 * would drift the moment a field is added, and the symptom would be a panel that
 * silently renders a blank value depending on which route loaded it.
 *
 * `pipelineStatus` and the follow-up fields are included: the detail panel reads
 * them, and the sales queue opens straight into that panel.
 */

const s = (v: unknown): string => (typeof v === 'string' ? v : '');

/** `id` is the document id; `f` the decoded Firestore fields. */
export function toContactItem(id: string, f: Record<string, unknown>) {
  return {
    contactId:     id,
    name:          s(f.name),
    email:         s(f.email),
    phone:         s(f.phone),
    company:       s(f.company),
    companyId:     s(f.companyId),
    tags:          Array.isArray(f.tags) ? f.tags.filter((t): t is string => typeof t === 'string') : [],
    notes:         s(f.notes),
    status:        s(f.status) || 'active',
    source:        s(f.source) || 'manual',
    linkedQuoteId: s(f.linkedQuoteId),
    linkedAuditId: s(f.linkedAuditId),
    createdByUid:  s(f.createdByUid),
    createdAt:     s(f.createdAt),
    updatedAt:     s(f.updatedAt),
    // Written by the lead → contact bridge. Manually-created contacts have
    // neither, so both default rather than rendering as undefined.
    identityEmail:  s(f.identityEmail),
    leadStatus:     s(f.leadStatus),
    countryCode:    s(f.countryCode),
    phoneCountry:   s(f.phoneCountry),
    lastActivityAt: s(f.lastActivityAt),
    owner:          s(f.owner),
    // Ownership ledger. `assignedToUid` is the authorisation key; the *Email and
    // *At fields exist so an operator can see WHO holds the lead and WHEN it
    // changed hands without resolving uids by hand.
    assignedToUid:         s(f.assignedToUid),
    assignedToEmail:       s(f.assignedToEmail),
    assignedByEmail:       s(f.assignedByEmail),
    assignedAt:            s(f.assignedAt),
    lastReassignedByEmail: s(f.lastReassignedByEmail),
    lastReassignedAt:      s(f.lastReassignedAt),
    // Commercial pipeline. Absent on a contact that has never been worked; the
    // client resolves the stage from `leadStatus` in that case.
    pipelineStatus:      s(f.pipelineStatus),
    priority:            s(f.priority),
    nextFollowUpAt:      s(f.nextFollowUpAt),
    nextFollowUpChannel: s(f.nextFollowUpChannel),
    lastContactAt:       s(f.lastContactAt),
    lastContactChannel:  s(f.lastContactChannel),
    followUpNotes:       s(f.followUpNotes),
    stageEnteredAt:      s(f.stageEnteredAt),
    // Reconciliation link into Twenty. Written by the CRM push; empty for
    // manually-created contacts and for leads captured before the integration.
    twentyPersonId:  s(f.twentyPersonId),
    twentyCompanyId: s(f.twentyCompanyId),
    lastMessage:     s(f.lastMessage),
  };
}
