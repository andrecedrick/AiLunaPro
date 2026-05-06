/**
 * Team API client — Phase J1.3E.
 * All privileged team writes go through the worker.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import type { UserRole } from '../../types/auth';
import type { Invitation } from '../../types/invitation';

async function authedFetch(path: string, init: RequestInit, idToken: string): Promise<Response> {
  return fetch(`${WORKER_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${idToken}`,
    },
  });
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const j = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(j.error ?? `Worker error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/* ── Invites ──────────────────────────────────────────── */

export interface CreateInviteResponse {
  invite:   Invitation;
  inviteId: string;
  rawToken: string;
}

export async function apiCreateInvite(
  input: { orgId: string; email: string; displayName: string; role: UserRole; message?: string },
  idToken: string,
): Promise<CreateInviteResponse> {
  const res = await authedFetch('/api/team/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  }, idToken);
  return jsonOrThrow<CreateInviteResponse>(res);
}

export async function apiListInvites(orgId: string, idToken: string): Promise<Invitation[]> {
  const res = await authedFetch(`/api/team/invites?orgId=${encodeURIComponent(orgId)}`, { method: 'GET' }, idToken);
  const data = await jsonOrThrow<{ invites: Invitation[] }>(res);
  return data.invites;
}

export interface RegenerateInviteResponse {
  inviteId:  string;
  rawToken:  string;
  expiresAt: string;
}

export async function apiRegenerateInvite(orgId: string, inviteId: string, idToken: string): Promise<RegenerateInviteResponse> {
  const res = await authedFetch(`/api/team/invites/${encodeURIComponent(inviteId)}/regenerate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ orgId }),
  }, idToken);
  return jsonOrThrow<RegenerateInviteResponse>(res);
}

/* ── sessionStorage cache for fresh tokens ────────────── */

const TOKEN_CACHE_PREFIX = 'ailunapro:inviteLinks:';

export function cacheInviteLink(inviteId: string, link: string): void {
  try { sessionStorage.setItem(`${TOKEN_CACHE_PREFIX}${inviteId}`, link); } catch { /* ignore */ }
}

export function readInviteLink(inviteId: string): string | null {
  try { return sessionStorage.getItem(`${TOKEN_CACHE_PREFIX}${inviteId}`); }
  catch { return null; }
}

export function clearInviteLink(inviteId: string): void {
  try { sessionStorage.removeItem(`${TOKEN_CACHE_PREFIX}${inviteId}`); } catch { /* ignore */ }
}

export async function apiCancelInvite(orgId: string, inviteId: string, idToken: string): Promise<void> {
  const res = await authedFetch(`/api/team/invites/${encodeURIComponent(inviteId)}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ orgId }),
  }, idToken);
  await jsonOrThrow<{ ok: true }>(res);
}

export async function apiAcceptInvite(input: { orgId: string; inviteId: string; token: string }, idToken: string): Promise<{ ok: true; orgId: string; role: UserRole }> {
  const res = await authedFetch('/api/team/invites/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  }, idToken);
  return jsonOrThrow<{ ok: true; orgId: string; role: UserRole }>(res);
}

/* ── Members ──────────────────────────────────────────── */

export async function apiChangeRole(orgId: string, uid: string, role: UserRole, idToken: string): Promise<void> {
  const res = await authedFetch(`/api/team/members/${encodeURIComponent(uid)}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ orgId, role }),
  }, idToken);
  await jsonOrThrow<{ ok: true }>(res);
}

export async function apiRemoveMember(orgId: string, uid: string, idToken: string): Promise<void> {
  const res = await authedFetch(`/api/team/members/${encodeURIComponent(uid)}?orgId=${encodeURIComponent(orgId)}`, {
    method: 'DELETE',
  }, idToken);
  await jsonOrThrow<{ ok: true }>(res);
}

export async function apiDisableMember(orgId: string, uid: string, idToken: string): Promise<void> {
  const res = await authedFetch(`/api/team/members/${encodeURIComponent(uid)}/disable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ orgId }),
  }, idToken);
  await jsonOrThrow<{ ok: true }>(res);
}

export async function apiEnableMember(orgId: string, uid: string, idToken: string): Promise<void> {
  const res = await authedFetch(`/api/team/members/${encodeURIComponent(uid)}/enable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ orgId }),
  }, idToken);
  await jsonOrThrow<{ ok: true }>(res);
}

/* ── Token helper ─────────────────────────────────────── */

export async function getIdToken(): Promise<string> {
  const { auth } = await import('../firebase-auth');
  const t = await auth.currentUser?.getIdToken();
  if (!t) throw new Error('Not authenticated');
  return t;
}
