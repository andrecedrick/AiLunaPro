import { describe, it, expect } from 'vitest';

/*
 * Support ticket phone — MANDATORY + format-validated (Phase 1).
 *
 * The server is the boundary: a ticket with a missing, empty or malformed phone
 * must be REJECTED, never stored blank. Phone is required for authed users too
 * (the Firebase token carries no phone claim).
 */

import { validateSupport, isValidPhone, normalizePhone } from '../../worker/src/lib/support-shared';

const base = { type: 'bug', description: 'something broke', email: 'user@example.com' };

describe('phone helpers', () => {
  it('normalises to + and digits, dropping separators', () => {
    expect(normalizePhone('+33 6 12 34 56 78')).toBe('+33612345678');
    expect(normalizePhone('(555) 010-9999')).toBe('5550109999');
  });

  it('accepts 7–15 digits, rejects too short / too long / junk', () => {
    expect(isValidPhone('+33 6 12 34 56 78')).toBe(true);
    expect(isValidPhone('5550109')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);              // too short
    expect(isValidPhone('1234567890123456')).toBe(false);   // too long
    expect(isValidPhone('not a phone')).toBe(false);
  });
});

describe('validateSupport — phone is mandatory', () => {
  it('rejects a ticket with NO phone field', () => {
    const r = validateSupport({ ...base });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/phone/i);
  });

  it('rejects an empty / whitespace phone', () => {
    expect(validateSupport({ ...base, phone: '' }).ok).toBe(false);
    expect(validateSupport({ ...base, phone: '   ' }).ok).toBe(false);
  });

  it('rejects a malformed phone', () => {
    const r = validateSupport({ ...base, phone: '123' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/valid phone/i);
  });

  it('accepts and normalises a valid phone', () => {
    const r = validateSupport({ ...base, phone: '+33 6 12 34 56 78' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ticket.phone).toBe('+33612345678');
  });

  it('still requires a phone for AUTHED users (token carries no phone)', () => {
    const r = validateSupport({ type: 'bug', description: 'x' }, 'authed@example.com');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/phone/i);
  });

  it('authed email still wins, with a valid phone supplied', () => {
    const r = validateSupport({ ...base, email: 'ignored@x.com', phone: '5550109999' }, 'authed@example.com');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ticket.email).toBe('authed@example.com');
      expect(r.ticket.phone).toBe('5550109999');
    }
  });
});
