/**
 * Auth persistence seam — localStorage only.
 * Replace these helpers with Firebase SDK calls in the backend phase;
 * nothing in the context or UI tree needs to change.
 */

import type { AuthSession, OrgMember, Organization } from '../../types/auth';
import { MOCK_MEMBERS, MOCK_ORGS } from '../../data/mockAuth';

const KEYS = {
  session: 'ailunapro-session',
  members: 'ailunapro-members',
  orgs:    'ailunapro-orgs',
} as const;

/* ── Session ──────────────────────────────────────────────── */

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null): void {
  if (session) {
    localStorage.setItem(KEYS.session, JSON.stringify(session));
  } else {
    localStorage.removeItem(KEYS.session);
  }
}

/* ── Members ──────────────────────────────────────────────── */

function loadMembers(): OrgMember[] | null {
  try {
    const raw = localStorage.getItem(KEYS.members);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OrgMember[]) : null;
  } catch {
    return null;
  }
}

export function saveMembers(members: OrgMember[]): void {
  try { localStorage.setItem(KEYS.members, JSON.stringify(members)); } catch { /* swallow */ }
}

export function getInitialMembers(): OrgMember[] {
  const existing = loadMembers();
  if (existing !== null) return existing;
  saveMembers(MOCK_MEMBERS);
  return [...MOCK_MEMBERS];
}

/* ── Orgs ─────────────────────────────────────────────────── */

function loadOrgs(): Organization[] | null {
  try {
    const raw = localStorage.getItem(KEYS.orgs);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Organization[]) : null;
  } catch {
    return null;
  }
}

export function saveOrgs(orgs: Organization[]): void {
  try { localStorage.setItem(KEYS.orgs, JSON.stringify(orgs)); } catch { /* swallow */ }
}

export function getInitialOrgs(): Organization[] {
  const existing = loadOrgs();
  if (existing !== null) return existing;
  saveOrgs(MOCK_ORGS);
  return [...MOCK_ORGS];
}

/* ── Helpers ──────────────────────────────────────────────── */

export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function makeInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
