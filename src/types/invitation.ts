/**
 * Team invitation — Phase J1.3C.
 *
 * Stored at: organizations/{orgId}/invites/{inviteId}
 *
 * Invited user receives a link with the inviteId + token. On signup/accept,
 * member doc is created with role from invitation. Invited users do NOT
 * become owner unless invitation explicitly says so (only owners can invite owners).
 */

import type { UserRole } from './auth';

export type InviteStatus = 'pending' | 'accepted' | 'cancelled' | 'expired';

export interface Invitation {
  id:         string;
  orgId:      string;
  email:      string;
  role:       Exclude<UserRole, 'owner'> | 'owner';  // owner only invitable by another owner
  status:     InviteStatus;
  invitedBy:  string;        // uid
  tokenHash:  string;        // sha256 of one-time token
  createdAt:  string;        // ISO
  expiresAt:  string;        // ISO (default +7 days)
  acceptedAt?: string;
  cancelledAt?: string;
  message?:   string;        // optional from inviter
}

/** Default invite expires 7 days from creation. */
export const INVITE_TTL_DAYS = 7;

/** Default role on invite if unspecified. */
export const DEFAULT_INVITE_ROLE: UserRole = 'member';
