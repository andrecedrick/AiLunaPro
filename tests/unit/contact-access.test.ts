import { describe, it, expect } from 'vitest';
import { effectiveOwnerUid, canViewContact, canEditContact } from '../../worker/src/lib/contact-access';

/**
 * The authorisation predicate the whole CRM leans on. Pinned separately from the
 * routes because a regression here is a cross-tenant data leak, not a UI bug.
 */
describe('contact-access', () => {
  it('an explicit assignment wins over the creator', () => {
    expect(effectiveOwnerUid({ assignedToUid: 'sales1', createdByUid: 'mem9' })).toBe('sales1');
  });

  it('an UNASSIGNED contact falls back to its creator (legacy records)', () => {
    expect(effectiveOwnerUid({ createdByUid: 'mem9' })).toBe('mem9');
    expect(effectiveOwnerUid({ assignedToUid: '', createdByUid: 'mem9' })).toBe('mem9');
  });

  it('a record with neither is owned by nobody — fail closed', () => {
    expect(effectiveOwnerUid({})).toBe('');
    expect(canViewContact({}, '', false)).toBe(false);
    // An empty uid must never match an empty owner.
    expect(canViewContact({ assignedToUid: '', createdByUid: '' }, '', false)).toBe(false);
  });

  it('the holder sees and edits; nobody else does', () => {
    const doc = { assignedToUid: 'sales1', createdByUid: 'mem9' };
    expect(canViewContact(doc, 'sales1', false)).toBe(true);
    expect(canEditContact(doc, 'sales1', false)).toBe(true);
    expect(canViewContact(doc, 'sales2', false)).toBe(false);
    // The CREATOR loses access once the lead is assigned elsewhere.
    expect(canViewContact(doc, 'mem9', false)).toBe(false);
  });

  it('super admin sees and edits everything, including unowned records', () => {
    expect(canViewContact({}, 'ops', true)).toBe(true);
    expect(canEditContact({ assignedToUid: 'sales1' }, 'ops', true)).toBe(true);
  });

  it('a non-string field cannot impersonate an owner', () => {
    expect(effectiveOwnerUid({ assignedToUid: 42, createdByUid: null })).toBe('');
    expect(canViewContact({ assignedToUid: { toString: () => 'sales1' } }, 'sales1', false)).toBe(false);
  });
});
