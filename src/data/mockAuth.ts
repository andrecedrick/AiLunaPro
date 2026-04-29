/**
 * Seed data for the mock auth layer.
 * ⚠️  NEVER ship real passwords here — this is frontend-only demo data.
 *     Replace with Firebase Auth calls in the backend phase.
 */

import type { OrgMember, Organization, User } from '../types/auth';

export const MOCK_USERS: User[] = [
  { id: 'u1', displayName: 'Sophie Martin',  email: 'sophie@acmecorp.io', initials: 'SM' },
  { id: 'u2', displayName: 'Thomas Leclerc', email: 'thomas@acmecorp.io', initials: 'TL' },
  { id: 'u3', displayName: 'Aiko Nakamura',  email: 'aiko@acmecorp.io',   initials: 'AN' },
];

export const MOCK_ORGS: Organization[] = [
  {
    id: 'org1',
    name: 'Acme Corp',
    plan: 'Professional',
    initials: 'AC',
    createdAt: '2024-01-15T08:00:00.000Z',
  },
];

export const MOCK_MEMBERS: OrgMember[] = [
  {
    userId: 'u1', orgId: 'org1', role: 'owner', status: 'active',
    joinedAt: '2024-01-15T08:00:00.000Z',
    displayName: 'Sophie Martin', email: 'sophie@acmecorp.io', initials: 'SM',
  },
  {
    userId: 'u2', orgId: 'org1', role: 'admin', status: 'active',
    joinedAt: '2024-02-10T10:30:00.000Z',
    displayName: 'Thomas Leclerc', email: 'thomas@acmecorp.io', initials: 'TL',
  },
  {
    userId: 'u3', orgId: 'org1', role: 'member', status: 'active',
    joinedAt: '2024-03-22T09:15:00.000Z',
    displayName: 'Aiko Nakamura', email: 'aiko@acmecorp.io', initials: 'AN',
  },
];

/**
 * Email → password map (mock only).
 * AuthContext mutates this at runtime for newly signed-up users so
 * they can log back in during the same session.
 */
export const MOCK_PASSWORDS: Record<string, string> = {
  'sophie@acmecorp.io': 'password123',
  'thomas@acmecorp.io': 'password123',
  'aiko@acmecorp.io':   'password123',
};

export const ROLE_LABEL: Record<string, string> = {
  owner:   'Owner',
  admin:   'Admin',
  member:  'Member',
  billing: 'Billing',
};

export const ROLE_DESCRIPTION: Record<string, string> = {
  owner:   'Full access — billing, settings, can transfer ownership',
  admin:   'Manage team and content; no billing access',
  member:  'Create and view audits, full registry access',
  billing: 'Billing-only access; read-only on all content',
};
