/**
 * Auth + Organisation + Team — type definitions.
 * Mock layer only for now; Firebase Auth will replace the
 * login/signup/logout surface in AuthContext without touching
 * anything here.
 */

export type UserRole = 'owner' | 'admin' | 'member' | 'billing';

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
  status: 'active' | 'pending';
  invitedAt?: string;
  joinedAt?: string;
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
