/**
 * Platform-operator allowlist (J5 Batch 3).
 *
 * Platform admins are the AiLunaPro operators — NOT tenant org members.
 * They are never stored in `members/{uid}`, never appear in Team, and have
 * no impersonation capability. The allowlist gates operator-only surfaces
 * (e.g. Stripe platform config). Identity = verified Firebase token email
 * matched against the PLATFORM_ADMIN_EMAILS env (comma-separated).
 *
 * Security:
 *   - Requires a VERIFIED email (email_verified === true). An unverified
 *     email claim is never trusted for elevation.
 *   - Case-insensitive, whitespace-trimmed comparison.
 *   - Empty/unset env → nobody is a platform admin (fail-closed).
 */

import type { Context, Next } from 'hono';
import type { AppEnv } from '../index';

/** Parse the comma-separated allowlist into normalized lowercase emails. */
function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Pure predicate: is this (email, emailVerified) an allowlisted platform admin?
 * Fail-closed: missing email, unverified email, or empty allowlist → false.
 */
export function isPlatformAdmin(
  env: AppEnv['Bindings'],
  email: string | undefined,
  emailVerified: boolean | undefined,
): boolean {
  if (!email || emailVerified !== true) return false;
  const allow = parseAllowlist(env.PLATFORM_ADMIN_EMAILS);
  if (allow.length === 0) return false;
  return allow.includes(email.toLowerCase());
}

/**
 * SUPER_ADMIN — a verified email in PLATFORM_ADMIN_EMAILS OR ADMIN_EMAILS.
 * Platform operators plus the quote/invoice admin recipients. Verified-email
 * gated, fail-closed (empty allowlists → false). Used only to gate the (org-
 * scoped) Admin Center UI; server-side data access stays role-gated per org.
 */
export function isSuperAdmin(
  env: AppEnv['Bindings'],
  email: string | undefined,
  emailVerified: boolean | undefined,
): boolean {
  if (isPlatformAdmin(env, email, emailVerified)) return true;
  if (!email || emailVerified !== true) return false;
  return parseAllowlist(env.ADMIN_EMAILS).includes(email.toLowerCase());
}

/**
 * The admin notification recipients for quote/invoice events: every email in
 * ADMIN_EMAILS, plus the legacy single ADMIN_EMAIL, de-duplicated (case-folded).
 * Empty when neither is configured (callers then skip the notification).
 */
export function adminRecipients(env: AppEnv['Bindings']): string[] {
  const set = new Set<string>(parseAllowlist(env.ADMIN_EMAILS));
  if (env.ADMIN_EMAIL) {
    const single = env.ADMIN_EMAIL.trim().toLowerCase();
    if (single) set.add(single);
  }
  return [...set];
}

/**
 * Hono middleware that rejects (403) any non-platform-admin request.
 * Use to protect operator-only routes. Assumes requireAuth() ran first
 * (so `email`/`emailVerified` context vars are set).
 */
export function requirePlatformAdmin() {
  return async (c: Context<AppEnv>, next: Next): Promise<Response | void> => {
    const email         = c.get('email');
    const emailVerified = c.get('emailVerified');
    if (!isPlatformAdmin(c.env, email, emailVerified)) {
      return c.json({ error: 'Platform operator access required', code: 'FORBIDDEN' }, 403);
    }
    await next();
  };
}
