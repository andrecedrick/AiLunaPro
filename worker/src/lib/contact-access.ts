/**
 * Contact ownership + visibility rules.
 *
 * The previous model was role-shaped: owner/admin saw EVERY contact in the org and
 * member saw everything they had created. Two sales admins in the same workspace
 * therefore read each other's pipeline, which is exactly what an assignment model
 * exists to prevent.
 *
 * The model implemented here is assignment-shaped:
 *   - SUPER ADMIN (platform operator allowlist) sees and edits everything, and is
 *     the only actor that may assign, transfer or reassign.
 *   - owner / admin / member see and edit ONLY the contacts assigned to them.
 *     Role no longer widens visibility; it only still gates governance actions
 *     (block / activate) on a contact the actor may already edit.
 *
 * LEGACY FALLBACK — read this before "simplifying" effectiveOwnerUid.
 * Contacts created before assignment existed carry no `assignedToUid`. Treating
 * an absent assignment as "nobody" would have hidden every historical contact
 * from the org that created it — a silent loss of access on live data. So an
 * unassigned contact falls back to its creator, which is the same person the old
 * member rule already granted it to. New contacts are assigned at creation, so
 * the fallback only ever applies to pre-existing records and needs no migration.
 */

export interface ContactAccessDoc {
  assignedToUid?: unknown;
  createdByUid?:  unknown;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/**
 * Who owns this contact for access purposes: the explicit assignment when there
 * is one, otherwise the creator (see LEGACY FALLBACK above). Returns '' when the
 * record has neither, which no live actor can match — fail-closed.
 */
export function effectiveOwnerUid(doc: ContactAccessDoc): string {
  return str(doc.assignedToUid) || str(doc.createdByUid);
}

/** Super admin sees all; everyone else sees only what is assigned to them. */
export function canViewContact(doc: ContactAccessDoc, uid: string, isSuper: boolean): boolean {
  if (isSuper) return true;
  if (!uid) return false;
  return effectiveOwnerUid(doc) === uid;
}

/**
 * Edit follows view exactly: you may change a contact if and only if it is yours.
 * Kept as a separate function because they are separate authorisations and a
 * future divergence must be a deliberate edit here, not an accident elsewhere.
 */
export function canEditContact(doc: ContactAccessDoc, uid: string, isSuper: boolean): boolean {
  return canViewContact(doc, uid, isSuper);
}
