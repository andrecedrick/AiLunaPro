/**
 * Members service — Phase J1.3D.
 *
 * Firestore-backed CRUD for organizations/{orgId}/members/{uid}.
 * Permission gates here (last-owner protection, role escalation rules)
 * mirror Firestore rules — checks happen client-side for UX, but Firestore
 * rules enforce them server-side too.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firestore';
import type { OrgMember, UserRole } from '../../types/auth';

/** Read all members for an org. */
export async function listMembers(orgId: string): Promise<OrgMember[]> {
  const col = collection(db, 'organizations', orgId, 'members');
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ ...(d.data() as OrgMember), userId: d.id }));
}

export interface UpdateRoleInput {
  orgId:        string;
  targetUid:    string;
  newRole:      UserRole;
  viewerRole:   UserRole;
  /** Existing members list — needed for last-owner protection. */
  members:      OrgMember[];
}

/**
 * Update a member's role with safeguards:
 * - last owner cannot be demoted
 * - admin cannot promote to owner / cannot demote owner
 * - cannot demote self if last owner
 */
export async function updateMemberRole(input: UpdateRoleInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const { orgId, targetUid, newRole, viewerRole, members } = input;

  const target = members.find(m => m.userId === targetUid);
  if (!target) return { ok: false, error: 'Member not found' };

  const ownerCount = members.filter(m => m.role === 'owner' && m.status === 'active').length;

  // Guard: only owner can promote to owner
  if (newRole === 'owner' && viewerRole !== 'owner') {
    return { ok: false, error: 'Only owners can promote to owner' };
  }
  // Guard: admin cannot edit owner
  if (target.role === 'owner' && viewerRole !== 'owner') {
    return { ok: false, error: 'Only owners can edit owners' };
  }
  // Guard: last owner cannot be demoted
  if (target.role === 'owner' && newRole !== 'owner' && ownerCount <= 1) {
    return { ok: false, error: 'Cannot demote the last owner. Promote another member first.' };
  }

  try {
    await updateDoc(doc(db, 'organizations', orgId, 'members', targetUid), {
      role:      newRole,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

export interface RemoveMemberInput {
  orgId:      string;
  targetUid:  string;
  viewerUid:  string;
  viewerRole: UserRole;
  members:    OrgMember[];
}

export async function removeMember(input: RemoveMemberInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const { orgId, targetUid, viewerUid, viewerRole, members } = input;
  const target = members.find(m => m.userId === targetUid);
  if (!target) return { ok: false, error: 'Member not found' };

  const ownerCount = members.filter(m => m.role === 'owner' && m.status === 'active').length;

  if (target.userId === viewerUid && target.role === 'owner' && ownerCount <= 1) {
    return { ok: false, error: 'Cannot remove yourself as the last owner' };
  }
  if (target.role === 'owner' && viewerRole !== 'owner') {
    return { ok: false, error: 'Only owners can remove owners' };
  }
  if (target.role === 'owner' && ownerCount <= 1) {
    return { ok: false, error: 'Cannot remove the last owner' };
  }

  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'members', targetUid));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Remove failed' };
  }
}

/** Disable (soft) a member. Sets status to 'disabled'. */
export async function disableMember(orgId: string, targetUid: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'members', targetUid), {
      status:    'disabled',
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Disable failed' };
  }
}

/** Re-enable a disabled member. */
export async function enableMember(orgId: string, targetUid: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'members', targetUid), {
      status:    'active',
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Enable failed' };
  }
}

/** Create a member doc atomically — used by accept-invite flow. */
export async function createMemberFromInvite(input: {
  orgId:       string;
  uid:         string;
  email:       string;
  displayName: string;
  initials:    string;
  role:        UserRole;
  invitedBy:   string;
}): Promise<void> {
  const now = new Date().toISOString();
  await setDoc(doc(db, 'organizations', input.orgId, 'members', input.uid), {
    userId:      input.uid,
    orgId:       input.orgId,
    role:        input.role,
    status:      'active',
    displayName: input.displayName,
    email:       input.email.toLowerCase().trim(),
    initials:    input.initials,
    invitedBy:   input.invitedBy,
    joinedAt:    now,
    updatedAt:   serverTimestamp(),
  });
}
