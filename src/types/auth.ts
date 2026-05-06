/**
 * Auth + Organisation + Team — type definitions.
 * Mock layer only for now; Firebase Auth will replace the
 * login/signup/logout surface in AuthContext without touching
 * anything here.
 */

export type UserRole = 'owner' | 'admin' | 'member' | 'billing' | 'client';

/** Role display metadata — keep in sync with UI badges. */
export const ROLE_META: Record<UserRole, { label: string; color: 'violet' | 'blue' | 'green' | 'gray' | 'orange'; description: string }> = {
  owner:   { label: 'Owner',   color: 'violet', description: 'Full organization + billing admin + team management.' },
  admin:   { label: 'Admin',   color: 'blue',   description: 'Organization & team management. No Stripe admin.' },
  billing: { label: 'Billing', color: 'green',  description: 'Invoices, subscription, portal. No admin settings.' },
  member:  { label: 'Member',  color: 'gray',   description: 'Audit, reports, registry. No admin settings.' },
  client:  { label: 'Client',  color: 'orange', description: 'Limited viewer access.' },
};

/** Permission helpers — single source of truth for role checks. */
export const ROLE = {
  isOwner:        (r: UserRole | undefined) => r === 'owner',
  isAdminish:     (r: UserRole | undefined) => r === 'owner' || r === 'admin',
  canManageTeam:  (r: UserRole | undefined) => r === 'owner' || r === 'admin',
  canViewBilling: (r: UserRole | undefined) => r === 'owner' || r === 'admin' || r === 'billing',
  canUseFeatures: (r: UserRole | undefined) => r === 'owner' || r === 'admin' || r === 'member',
};

export interface User {
  id: string;
  displayName: string;
  email: string;
  initials: string;
}

/** One membership row — user × org.  Denormalised for pure-frontend convenience. */
export interface OrgMember {
  userId: string;
  orgId: string;
  role: UserRole;
  status: 'active' | 'pending' | 'invited' | 'disabled';
  invitedAt?: string;
  invitedBy?: string;
  joinedAt?: string;
  updatedAt?: string;
  /** Denormalised so the UI never needs a join. */
  displayName: string;
  email: string;
  initials: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  initials: string;
  createdAt: string;
}

/** Everything the app needs after a successful login. */
export interface AuthSession {
  userId: string;
  orgId: string;
  role: UserRole;
  user: User;
  org: Organization;
}
