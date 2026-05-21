/**
 * Firebase Auth + Firestore service — Phase E.
 *
 * Implements the same operations as the mock layer (src/lib/auth/storage.ts)
 * but against real Firebase Auth and Firestore.
 *
 * Consumed only by AuthContext when resolveLayer('auth') === 'firebase'.
 * Nothing in the UI tree imports this file directly.
 *
 * Firestore paths used:
 *   /users/{uid}
 *   /organizations/{orgId}
 *   /organizations/{orgId}/members/{userId}
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateAuthProfile,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { auth } from '../firebase-auth';
import { db } from '../firestore';
import { makeInitials } from './storage';
import type { AuthSession, OrgMember, Organization, User, UserRole } from '../../types/auth';

// ─── localStorage key for current-org preference ─────────────────────────────
const CURRENT_ORG_KEY = 'ailunapro-fb-current-org';

function getOrgPref(): string | null {
  try { return localStorage.getItem(CURRENT_ORG_KEY); } catch { return null; }
}
function setOrgPref(orgId: string): void {
  try { localStorage.setItem(CURRENT_ORG_KEY, orgId); } catch { /* swallow */ }
}

// ─── Firestore document shapes ────────────────────────────────────────────────
// We store a superset of the app's UI types so round-trips are lossless.

interface FsUser {
  id: string;
  displayName: string;
  email: string;
  initials: string;
  /** All org IDs this user belongs to. Updated on createOrg / invite. */
  orgIds: string[];
  createdAt: ReturnType<typeof serverTimestamp> | string;
  updatedAt: ReturnType<typeof serverTimestamp> | string;
}

interface FsOrg {
  id: string;
  name: string;
  plan: Organization['plan'];
  initials: string;
  ownerId: string;
  createdAt: ReturnType<typeof serverTimestamp> | string;
  updatedAt: ReturnType<typeof serverTimestamp> | string;
}

interface FsMember {
  userId: string;
  orgId: string;
  role: UserRole;
  status: 'active' | 'pending';
  displayName: string;
  email: string;
  initials: string;
  joinedAt?: ReturnType<typeof serverTimestamp> | string;
  invitedAt?: ReturnType<typeof serverTimestamp> | string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function readUser(uid: string): Promise<FsUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as FsUser) : null;
}

async function readOrg(orgId: string): Promise<FsOrg | null> {
  const snap = await getDoc(doc(db, 'organizations', orgId));
  return snap.exists() ? (snap.data() as FsOrg) : null;
}

async function readMembers(orgId: string): Promise<OrgMember[]> {
  const snap = await getDocs(collection(db, 'organizations', orgId, 'members'));
  return snap.docs.map(d => {
    const m = d.data() as FsMember;
    return {
      userId:      m.userId,
      orgId:       m.orgId,
      role:        m.role,
      status:      m.status,
      displayName: m.displayName,
      email:       m.email,
      initials:    m.initials,
      joinedAt:    typeof m.joinedAt === 'string' ? m.joinedAt : new Date().toISOString(),
      invitedAt:   typeof m.invitedAt === 'string' ? m.invitedAt : undefined,
    } satisfies OrgMember;
  });
}

/** Build an AuthSession from Firestore data for a given Firebase user. */
async function buildSession(
  firebaseUser: FirebaseUser,
): Promise<{ session: AuthSession; members: OrgMember[]; orgs: Organization[] } | null> {
  const fsUser = await readUser(firebaseUser.uid);
  if (!fsUser) return null;

  // J1.3C: user has no orgs yet → partial session, will route to org/create.
  if (fsUser.orgIds.length === 0) {
    const user: User = {
      id:          firebaseUser.uid,
      displayName: fsUser.displayName,
      email:       fsUser.email,
      initials:    fsUser.initials,
    };
    const session: AuthSession = {
      userId: firebaseUser.uid,
      orgId:  '',          // empty → AppShell forces org/create
      role:   'member',    // placeholder; no real role yet
      user,
      org: {
        id: '', name: '', plan: 'Free', initials: '', createdAt: new Date().toISOString(),
      },
    };
    return { session, members: [], orgs: [] };
  }

  // Determine active org: preference → first available
  const pref    = getOrgPref();
  const orgId   = (pref && fsUser.orgIds.includes(pref)) ? pref : fsUser.orgIds[0];
  setOrgPref(orgId);

  // Fetch all orgs and current org's members in parallel.
  // CRITICAL: use allSettled, NOT Promise.all. With Promise.all a single
  // transient/denied getDoc among N parallel org reads REJECTS the whole
  // batch → buildSession throws → user appears to "lose" every workspace
  // except the fallback. allSettled keeps every org that read successfully
  // and logs the ones that failed instead of nuking the entire list.
  const [orgSettled, members] = await Promise.all([
    Promise.allSettled(fsUser.orgIds.map(id => readOrg(id))),
    readMembers(orgId),
  ]);

  const orgs: Organization[] = [];
  orgSettled.forEach((r, i) => {
    const id = fsUser.orgIds[i];
    if (r.status === 'rejected') {
      console.warn('[buildSession] org read FAILED, dropped from list:', id, r.reason);
      return;
    }
    const o = r.value;
    if (!o) {
      console.warn('[buildSession] org doc missing for orgId:', id);
      return;
    }
    orgs.push({
      id:        o.id,
      name:      o.name,
      plan:      o.plan,
      initials:  o.initials,
      createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString(),
    });
  });

  const org = orgs.find(o => o.id === orgId);
  if (!org) return null;

  const membership = members.find(m => m.userId === firebaseUser.uid);
  if (!membership) return null;

  const user: User = {
    id:          firebaseUser.uid,
    displayName: fsUser.displayName,
    email:       fsUser.email,
    initials:    fsUser.initials,
  };

  const session: AuthSession = {
    userId: firebaseUser.uid,
    orgId,
    role:   membership.role,
    user,
    org,
  };

  return { session, members, orgs };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Subscribe to Firebase Auth state changes.
 * Calls onResolved with full session data after fetching Firestore.
 * Calls onSignedOut when the user is unauthenticated.
 * Returns an unsubscribe function.
 */
export function subscribeAuthState(
  onResolved: (
    session: AuthSession,
    members: OrgMember[],
    orgs: Organization[],
  ) => void,
  onSignedOut: () => void,
): Unsubscribe {
  return onAuthStateChanged(auth, async firebaseUser => {
    if (!firebaseUser) {
      onSignedOut();
      return;
    }
    try {
      const result = await buildSession(firebaseUser);
      if (result) {
        onResolved(result.session, result.members, result.orgs);
      } else {
        // User exists in Auth but Firestore docs not yet available
        // (e.g. race window right after signup). Do NOT sign out —
        // the signup function will force a fresh onAuthStateChanged
        // after writes complete. Just report signed-out state.
        onSignedOut();
      }
    } catch (err) {
      console.error('[firebaseAuthService] buildSession failed:', err);
      onSignedOut();
    }
  });
}

/** Sign in with email + password. Returns success or a user-facing error string. */
export async function firebaseLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged in AuthContext handles session update
    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    const msg =
      code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
        ? 'Invalid email or password.'
        : code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : 'Sign-in failed. Please try again.';
    return { success: false, error: msg };
  }
}

/**
 * Create a new Firebase Auth user + user profile doc.
 *
 * J1.3C: signup NO LONGER auto-creates a workspace. New users land on the
 * org-create / accept-invite onboarding flow. They become owner only of
 * workspaces they explicitly create, or get the role specified in their
 * invitation when accepting one.
 *
 * The `orgName` parameter is kept as an OPTIONAL "create-workspace-on-signup"
 * shortcut for legacy flows; when provided, user is set as owner of that
 * workspace. When omitted (default), only the user account is created.
 */
export async function firebaseSignup(
  name: string,
  email: string,
  password: string,
  orgName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const cred    = await createUserWithEmailAndPassword(auth, email, password);
    const uid     = cred.user.uid;
    const now     = new Date().toISOString();
    const initials = makeInitials(name);

    if (orgName && orgName.trim()) {
      // Legacy/optional path: user explicitly chose to create a workspace.
      const orgId   = `org_${uid.slice(0, 8)}`;
      const orgInit = makeInitials(orgName);

      await setDoc(doc(db, 'organizations', orgId), {
        id:        orgId,
        name:      orgName.trim(),
        plan:      'Free',
        initials:  orgInit,
        ownerId:   uid,
        createdAt: now,
        updatedAt: now,
      } satisfies FsOrg);

      await Promise.all([
        setDoc(doc(db, 'users', uid), {
          id: uid,
          displayName: name.trim(),
          email: email.toLowerCase().trim(),
          initials,
          orgIds: [orgId],
          createdAt: now,
          updatedAt: now,
        } satisfies FsUser),
        setDoc(doc(db, 'organizations', orgId, 'members', uid), {
          userId:      uid,
          orgId,
          role:        'owner',
          status:      'active',
          displayName: name.trim(),
          email:       email.toLowerCase().trim(),
          initials,
          joinedAt: now,
        } satisfies FsMember),
      ]);

      setOrgPref(orgId);
    } else {
      // Default path: user account only — no workspace, no role.
      // User will land on OrgCreatePage / accept-invite flow.
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        displayName: name.trim(),
        email: email.toLowerCase().trim(),
        initials,
        orgIds: [],
        createdAt: now,
        updatedAt: now,
      } satisfies FsUser);
    }

    // Firestore docs are now committed. Sign out and back in so that
    // onAuthStateChanged fires again with all docs in place.
    await signOut(auth);
    await signInWithEmailAndPassword(auth, email, password);

    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    const msg =
      code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : code === 'auth/weak-password'
        ? 'Password must be at least 6 characters.'
        : 'Sign-up failed. Please try again.';
    return { success: false, error: msg };
  }
}

/** Sign out the current Firebase user. */
export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
}

/**
 * Switch active org. Updates the preference in localStorage and re-fetches
 * Firestore data for the target org.
 */
export async function firebaseSwitchOrg(
  firebaseUser: FirebaseUser,
  orgId: string,
): Promise<{ session: AuthSession; members: OrgMember[]; orgs: Organization[] } | null> {
  setOrgPref(orgId);
  return buildSession(firebaseUser);
}

/**
 * Create a new org in Firestore and add the current user as owner.
 * Returns the new org + member row so AuthContext can update state optimistically.
 */
export async function firebaseCreateOrg(
  uid: string,
  displayName: string,
  email: string,
  initials: string,
  orgName: string,
  plan: Organization['plan'],
): Promise<{ org: Organization; member: OrgMember }> {
  const now    = new Date().toISOString();
  // Random suffix prevents orgId collision when two workspaces are created
  // within the same millisecond (rapid succession / double-fire). Without it,
  // the second setDoc overwrites the first org doc and arrayUnion dedups the
  // shared id, silently losing one workspace.
  const rand   = crypto.randomUUID().slice(0, 8);
  const orgId  = `org_${uid.slice(0, 8)}_${Date.now()}_${rand}`;
  const orgInit = makeInitials(orgName);

  const org: Organization = {
    id:        orgId,
    name:      orgName.trim(),
    plan,
    initials:  orgInit,
    createdAt: now,
  };
  const member: OrgMember = {
    userId:      uid,
    orgId,
    role:        'owner',
    status:      'active',
    displayName,
    email,
    initials,
    joinedAt: now,
  };

  // Org doc MUST commit before the member doc: the members-create security
  // rule does get(/organizations/{orgId}).data.ownerId == uid(). Running these
  // concurrently races — the rule can evaluate before the org doc exists,
  // rejecting the member write with permission-denied.
  await setDoc(doc(db, 'organizations', orgId), {
    ...org,
    ownerId:   uid,
    updatedAt: now,
  });
  await Promise.all([
    setDoc(doc(db, 'organizations', orgId, 'members', uid), { ...member }),
    // arrayUnion is atomic server-side; concurrent createOrg calls no longer
    // clobber each other (the old read-modify-write .concat() lost updates).
    updateDoc(doc(db, 'users', uid), {
      orgIds: arrayUnion(orgId),
      updatedAt: now,
    }),
  ]);

  return { org, member };
}

/** Write an invited member doc (status: 'pending') to Firestore. */
export async function firebaseInviteMember(
  orgId: string,
  member: OrgMember,
): Promise<void> {
  await setDoc(
    doc(db, 'organizations', orgId, 'members', member.userId),
    { ...member },
  );
}

/** Update a member's role in Firestore. */
export async function firebaseUpdateMemberRole(
  orgId: string,
  userId: string,
  role: UserRole,
): Promise<void> {
  await updateDoc(
    doc(db, 'organizations', orgId, 'members', userId),
    { role },
  );
}

/** Remove a member doc from Firestore. */
export async function firebaseRemoveMember(
  orgId: string,
  userId: string,
): Promise<void> {
  await deleteDoc(doc(db, 'organizations', orgId, 'members', userId));
}

/** Expose the current Firebase Auth user for switchOrg calls. */
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Update the current user's display name + email.
 * Writes to:
 *   - Firebase Auth profile (displayName)
 *   - /users/{uid}  (displayName, email, initials, updatedAt)
 *   - /organizations/{orgId}/members/{uid}  (displayName, email, initials)
 */
export async function firebaseUpdateProfile(
  uid: string,
  orgId: string,
  name: string,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const initials = makeInitials(name);
    const now = new Date().toISOString();

    const fbUser = auth.currentUser;
    const ops: Promise<unknown>[] = [
      updateDoc(doc(db, 'users', uid), {
        displayName: name,
        email,
        initials,
        updatedAt: now,
      }),
      updateDoc(doc(db, 'organizations', orgId, 'members', uid), {
        displayName: name,
        email,
        initials,
      }),
    ];

    // Update Firebase Auth displayName if available
    if (fbUser) {
      ops.push(firebaseUpdateAuthProfile(fbUser, { displayName: name }));
    }

    await Promise.all(ops);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update profile.';
    return { success: false, error: msg };
  }
}

/**
 * Rename an organization in Firestore.
 * Writes to /organizations/{orgId} (name, initials, updatedAt).
 */
export async function firebaseUpdateOrgName(
  orgId: string,
  name: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, 'organizations', orgId), {
      name,
      initials: makeInitials(name),
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update organization.';
    return { success: false, error: msg };
  }
}

/**
 * Send a Firebase password-reset email.
 * Returns { success: true } on dispatch (Firebase queues delivery).
 * Maps auth/user-not-found to a safe generic message to prevent email enumeration.
 */
export async function firebaseSendPasswordReset(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    // Intentionally map user-not-found → generic to prevent email enumeration
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-email' ||
      code === 'auth/missing-email'
    ) {
      return { success: false, error: 'No account found for that email address.' };
    }
    return { success: false, error: 'Failed to send reset email. Please try again.' };
  }
}
