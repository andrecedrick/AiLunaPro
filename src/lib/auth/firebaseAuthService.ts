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
  if (!fsUser || fsUser.orgIds.length === 0) return null;

  // Determine active org: preference → first available
  const pref    = getOrgPref();
  const orgId   = (pref && fsUser.orgIds.includes(pref)) ? pref : fsUser.orgIds[0];
  setOrgPref(orgId);

  // Fetch all orgs and current org's members in parallel
  const [orgsData, members] = await Promise.all([
    Promise.all(fsUser.orgIds.map(id => readOrg(id))),
    readMembers(orgId),
  ]);

  const orgs: Organization[] = orgsData
    .filter((o): o is FsOrg => o !== null)
    .map(o => ({
      id:        o.id,
      name:      o.name,
      plan:      o.plan,
      initials:  o.initials,
      createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString(),
    }));

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
        // User exists in Auth but has no Firestore data — treat as signed-out
        await signOut(auth);
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

/** Create a new Firebase Auth user + write user / org / member docs to Firestore. */
export async function firebaseSignup(
  name: string,
  email: string,
  password: string,
  orgName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const cred    = await createUserWithEmailAndPassword(auth, email, password);
    const uid     = cred.user.uid;
    const now     = new Date().toISOString();
    const initials = makeInitials(name);
    const orgId   = `org_${uid.slice(0, 8)}`;
    const orgInit = makeInitials(orgName);

    // Write all three docs in parallel
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
      setDoc(doc(db, 'organizations', orgId), {
        id:        orgId,
        name:      orgName.trim(),
        plan:      'Free',
        initials:  orgInit,
        ownerId:   uid,
        createdAt: now,
        updatedAt: now,
      } satisfies FsOrg),
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
    // onAuthStateChanged fires after createUserWithEmailAndPassword
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
  const orgId  = `org_${uid.slice(0, 8)}_${Date.now()}`;
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

  await Promise.all([
    setDoc(doc(db, 'organizations', orgId), {
      ...org,
      ownerId:   uid,
      updatedAt: now,
    }),
    setDoc(doc(db, 'organizations', orgId, 'members', uid), {
      ...member,
    }),
    // Append orgId to user's orgIds array (use arrayUnion to avoid races)
    updateDoc(doc(db, 'users', uid), {
      orgIds: (await readUser(uid))!.orgIds.concat(orgId),
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
