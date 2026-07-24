import { describe, it, expect } from 'vitest';
import {
  validateSupport,
  sanitizeText,
  generateSupportId,
  type SupportInput,
} from '../../worker/src/lib/support-shared';

/*
 * S2 — support ticket validation + sanitisation boundary.
 *
 * Hybrid: authed email (verified token) wins over any client-supplied email.
 * Type + description required; description scrubbed + capped 2000. No PII beyond
 * the email is ever produced.
 */

describe('validateSupport', () => {
  it('accepts an anonymous ticket with a provided email', () => {
    const r = validateSupport({ type: 'bug', description: 'it broke', email: 'a@b.com', phone: '+33612345678' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ticket).toEqual({ type: 'bug', description: 'it broke', email: 'a@b.com', phone: '+33612345678', priority: null, context: null });
    }
  });

  it('uses the verified authed email and ignores a client-supplied one', () => {
    const r = validateSupport({ type: 'question', description: 'hi', email: 'spoof@evil.com', phone: '+33612345678' }, 'Real@User.com');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ticket.email).toBe('real@user.com'); // authed wins + normalised
  });

  it('accepts priority + sanitised context', () => {
    const r = validateSupport({
      type: 'billing', description: 'charge issue', email: 'a@b.com', phone: '+33612345678', priority: 'high',
      context: { route: 'billing', locale: 'fr', appVersion: '<b>1.2</b>' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ticket.priority).toBe('high');
      expect(r.ticket.context).toEqual({ route: 'billing', locale: 'fr', appVersion: 'b1.2/b' });
    }
  });

  it('drops an all-empty context to null', () => {
    const r = validateSupport({ type: 'bug', description: 'x', email: 'a@b.com', phone: '+33612345678', context: { route: '  ', locale: '', appVersion: null } });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ticket.context).toBeNull();
  });

  it.each(['bug', 'question', 'billing'])('accepts type %s', (type) => {
    expect(validateSupport({ type, description: 'x', email: 'a@b.com', phone: '+33612345678' }).ok).toBe(true);
  });

  it('rejects an unknown type', () => {
    expect(validateSupport({ type: 'feature', description: 'x', email: 'a@b.com', phone: '+33612345678' } as SupportInput).ok).toBe(false);
  });

  it('rejects an empty / whitespace description', () => {
    expect(validateSupport({ type: 'bug', description: '   ', email: 'a@b.com', phone: '+33612345678' }).ok).toBe(false);
    expect(validateSupport({ type: 'bug', email: 'a@b.com', phone: '+33612345678' }).ok).toBe(false);
  });

  it('rejects an invalid priority', () => {
    expect(validateSupport({ type: 'bug', description: 'x', email: 'a@b.com', phone: '+33612345678', priority: 'urgent' } as SupportInput).ok).toBe(false);
  });

  it('requires a valid email when anonymous', () => {
    expect(validateSupport({ type: 'bug', description: 'x', email: 'not-an-email', phone: '+33612345678' }).ok).toBe(false);
    expect(validateSupport({ type: 'bug', description: 'x' }).ok).toBe(false);
  });

  it('caps the description at 2000 chars', () => {
    const r = validateSupport({ type: 'bug', description: 'x'.repeat(2500), email: 'a@b.com', phone: '+33612345678' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ticket.description.length).toBe(2000);
  });

  it('produces NO PII beyond email (no uid/ip/name/orgId fields)', () => {
    const r = validateSupport({ type: 'bug', description: 'x', email: 'a@b.com', phone: '+33612345678', priority: 'low' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(Object.keys(r.ticket).sort()).toEqual(['context', 'description', 'email', 'phone', 'priority', 'type']);
    }
  });
});

describe('sanitizeText', () => {
  it('defangs markup + strips control chars + collapses whitespace', () => {
    expect(sanitizeText('<script>alert(1)</script>', 2000)).toBe('scriptalert(1)/script');
    expect(sanitizeText('a\t\tb\nc', 2000)).toBe('a b c');
  });
  it('returns null for empty input', () => {
    expect(sanitizeText('   ', 2000)).toBeNull();
  });
});

describe('generateSupportId', () => {
  it('is URL-safe and unique', () => {
    const id = generateSupportId();
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(generateSupportId()).not.toBe(id);
  });
});
