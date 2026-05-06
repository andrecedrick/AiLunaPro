/**
 * Invitations service — Phase J1.3D.
 *
 * Stored at: organizations/{orgId}/invites/{inviteId}
 *
 * Token model: invite link contains the inviteId itself (random) and a
 * one-time token (random) hashed before storage. Tokens are short and
 * URL-safe. Only the hash is stored — the raw token lives only in the
 * invite link. Acceptance verifies hash match.
 *
 * No email delivery yet — caller copies the link to clipboard.
 */

import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firestore';
import type { Invitation, InviteStatus } from '../../types/invitation';
import type { UserRole } from '../../types/auth';

/* ── Token helpers ──────────────────────────────────────── */

/** Generate URL-safe random token (~22 chars, ~128 bits entropy). */
function generateToken(bytes = 16): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** SHA-256 hash → hex. Web Crypto. */
async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Build invite link: app URL + #/invite/{inviteId}/{token} */
export function buildInviteLink(orgId: string, inviteId: string, token: string): string {
  const base = window.location.origin + window.location.pathname.replace(/\/$/, '');
  return `${base}/#/invite/${encodeURIComponent(orgId)}/${encodeURIComponent(inviteId)}/${encodeURIComponent(token)}`;
}

/** Parse hash route #/invite/{orgId}/{inviteId}/{token}. */
export function parseInviteHash(hash: string): { orgId: string; inviteId: string; token: string } | null {
  const m = hash.match(/^#\/invite\/([^/]+)\/([^/]+)\/([^/?#]+)/);
  if (!m) return null;
  try {
    return {
      orgId:    decodeURIComponent(m[1]),
      inviteId: decodeURIComponent(m[2]),
      token:    decodeURIComponent(m[3]),
    };
  } catch { return null; }
}

/* ── CRUD ───────────────────────────────────────────────── */

const INVITE_TTL_DAYS = 7;

export interface CreateInviteInput {
  orgId:     string;
  email:     string;
  role:      UserRole;
  invitedBy: string;       // uid
  message?:  string;
}

export interface CreateInviteResult {
  invite: Invitation;
  link:   string;          // raw token included; UI shows once
  token:  string;          // raw, for clipboard
}

/** Create invite. Returns invite doc + raw link (raw token never persisted). */
export async function createInvite(input: CreateInviteInput): Promise<CreateInviteResult> {
  const inviteId  = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const token     = generateToken();
  const tokenHash = await sha256Hex(token);
  const now       = new Date();
  const expires   = new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const invite: Invitation = {
    id:        inviteId,
    orgId:     input.orgId,
    email:     input.email.toLowerCase().trim(),
    role:      input.role,
    status:    'pending',
    invitedBy: input.invitedBy,
    tokenHash,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    ...(input.message ? { message: input.message } : {}),
  };

  const ref = doc(db, 'organizations', input.orgId, 'invites', inviteId);
  await setDoc(ref, { ...invite, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

  const link = buildInviteLink(input.orgId, inviteId, token);
  return { invite, link, token };
}

/** List invites for an org. Optionally filter by status. */
export async function listInvites(orgId: string, status?: InviteStatus): Promise<Invitation[]> {
  const col = collection(db, 'organizations', orgId, 'invites');
  const snap = status
    ? await getDocs(query(col, where('status', '==', status)))
    : await getDocs(col);
  return snap.docs.map(d => {
    const data = d.data() as Invitation & { createdAt?: unknown };
    let createdAt: string;
    if (typeof data.createdAt === 'string') {
      createdAt = data.createdAt;
    } else if (data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function') {
      createdAt = (data.createdAt as { toDate: () => Date }).toDate().toISOString();
    } else {
      createdAt = new Date().toISOString();
    }
    return { ...data, id: d.id, createdAt } as Invitation;
  });
}

/** Cancel a pending invite. */
export async function cancelInvite(orgId: string, inviteId: string): Promise<void> {
  const ref = doc(db, 'organizations', orgId, 'invites', inviteId);
  await updateDoc(ref, {
    status:      'cancelled',
    cancelledAt: serverTimestamp(),
  });
}

/** Read a single invite. */
export async function getInvite(orgId: string, inviteId: string): Promise<Invitation | null> {
  const ref = doc(db, 'organizations', orgId, 'invites', inviteId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Invitation;
  return { ...data, id: snap.id };
}

/**
 * Verify token + expiry against stored invite. Returns invite if valid.
 * Caller is responsible for atomic accept (writing member doc).
 */
export async function verifyInviteToken(
  orgId: string,
  inviteId: string,
  rawToken: string,
): Promise<{ valid: true; invite: Invitation } | { valid: false; reason: string }> {
  const invite = await getInvite(orgId, inviteId);
  if (!invite)                       return { valid: false, reason: 'Invitation not found' };
  if (invite.status === 'cancelled') return { valid: false, reason: 'Invitation was cancelled' };
  if (invite.status === 'accepted')  return { valid: false, reason: 'Invitation already accepted' };
  if (Date.parse(invite.expiresAt) < Date.now()) return { valid: false, reason: 'Invitation has expired' };

  const hash = await sha256Hex(rawToken);
  if (hash !== invite.tokenHash) return { valid: false, reason: 'Invalid token' };

  return { valid: true, invite };
}

/** Mark invite as accepted. Member doc creation is the caller's responsibility. */
export async function markInviteAccepted(orgId: string, inviteId: string): Promise<void> {
  const ref = doc(db, 'organizations', orgId, 'invites', inviteId);
  await updateDoc(ref, {
    status:     'accepted',
    acceptedAt: serverTimestamp(),
  });
}

/** List invites issued globally for a given email (collectionGroup). */
export async function listInvitesForEmail(email: string): Promise<Invitation[]> {
  try {
    const q = query(
      collectionGroup(db, 'invites'),
      where('email',  '==', email.toLowerCase().trim()),
      where('status', '==', 'pending'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as Invitation), id: d.id }));
  } catch (err) {
    console.warn('[invitationsService] collectionGroup query failed:', err);
    return [];
  }
}
