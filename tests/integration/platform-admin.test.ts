import { describe, it, expect } from 'vitest';
import { isSuperAdmin, adminRecipients } from '../../worker/src/lib/platformAdmin';

type Env = Parameters<typeof isSuperAdmin>[0];
const env = (o: Record<string, string>): Env => o as unknown as Env;

describe('isSuperAdmin (PART 4)', () => {
  it('true for a verified platform-admin email', () => {
    expect(isSuperAdmin(env({ PLATFORM_ADMIN_EMAILS: 'op@x.com' }), 'op@x.com', true)).toBe(true);
  });
  it('true for a verified email in ADMIN_EMAILS (case-insensitive)', () => {
    expect(isSuperAdmin(env({ ADMIN_EMAILS: 'a@x.com, b@x.com' }), 'B@x.com', true)).toBe(true);
  });
  it('false when the email is unverified (fail-closed)', () => {
    expect(isSuperAdmin(env({ ADMIN_EMAILS: 'a@x.com' }), 'a@x.com', false)).toBe(false);
  });
  it('false when not allowlisted or allowlist empty', () => {
    expect(isSuperAdmin(env({}), 'x@x.com', true)).toBe(false);
    expect(isSuperAdmin(env({ ADMIN_EMAILS: 'a@x.com' }), 'c@x.com', true)).toBe(false);
  });
});

describe('adminRecipients (PART 3)', () => {
  it('merges ADMIN_EMAILS + ADMIN_EMAIL, de-duped + lower-cased', () => {
    expect(new Set(adminRecipients(env({ ADMIN_EMAILS: 'A@x.com, b@x.com', ADMIN_EMAIL: 'a@x.com' }))))
      .toEqual(new Set(['a@x.com', 'b@x.com']));
  });
  it('is empty when neither is configured', () => {
    expect(adminRecipients(env({}))).toEqual([]);
  });
});
