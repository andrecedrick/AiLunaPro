import { describe, it, expect } from 'vitest';
import { base, splitName, splitPhone, companyPayload, personPayload, notePayload, noteTargetPayload, extractId, type TwentyLead } from '../../worker/src/lib/twenty';

/*
 * Twenty CRM payload mapping.
 *
 * Twenty has no static schema — every workspace exposes its own object and field
 * names — so these payloads follow Twenty's DEFAULT schema and are UNVERIFIED
 * against the live workspace. They are isolated in three builders precisely so a
 * mismatch is a one-function correction.
 *
 * What these tests genuinely lock is the TRANSFORMATION: name splitting, E.164
 * decomposition, and the fact that every commercially useful field reaches the
 * payload. If Twenty's field names turn out to differ, these tests change with
 * the builder; if the transformation regresses, they fail on their own.
 */

const LEAD: TwentyLead = {
  name:          'Ada Lovelace',
  contactEmail:  'ada@acme.com',
  identityEmail: 'ada.lovelace@login.com',
  phone:         '+33612345678',
  countryCode:   'FR',
  phoneCountry:  'FR',
  company:       'Acme',
  message:       'Want a demo of the audit engine',
  source:        'dashboard-cta',
  createdAt:     '2026-07-30T10:00:00.000Z',
  leadId:        'dr_abc_123',
};

describe('base — tolerates a configured URL that already carries /rest', () => {
  it.each([
    ['https://api.twenty.com',        'https://api.twenty.com'],
    ['https://api.twenty.com/',       'https://api.twenty.com'],
    ['https://api.twenty.com/rest',   'https://api.twenty.com'],
    ['https://api.twenty.com/rest/',  'https://api.twenty.com'],
    ['https://ailunapro.twenty.com',  'https://ailunapro.twenty.com'],
  ])('%s → %s', (input, expected) => {
    expect(base(input)).toBe(expected);
  });

  it('never produces a doubled /rest segment', () => {
    // The production incident: base was https://api.twenty.com/rest, the client
    // appended /rest/companies, and Twenty read 'companies' as a record id —
    // "'companies' is not a valid UUID" on every create.
    expect(`${base('https://api.twenty.com/rest')}/rest/companies`).toBe('https://api.twenty.com/rest/companies');
  });
});

describe('extractId — a create with no id is not a success', () => {
  it.each([
    ['nested wrapper',  '{"data":{"createPerson":{"id":"p-1"}}}', 'p-1'],
    ['data.id',         '{"data":{"id":"p-2"}}',                  'p-2'],
    ['top-level id',    '{"id":"p-3"}',                           'p-3'],
  ])('reads %s', (_label, body, expected) => {
    expect(extractId(body)).toBe(expected);
  });

  it.each([
    ['empty body',        ''],
    ['HTML',              '<!doctype html><html></html>'],
    ['JSON without id',   '{"data":{"ok":true}}'],
    ['null data',         '{"data":null}'],
  ])('returns empty for %s so the caller fails loudly', (_label, body) => {
    // The original client returned { ok: true, id: '' } here: a 2xx with an
    // unexpected shape looked like a completed push, stored an empty idempotency
    // key, and raised no alert.
    expect(extractId(body)).toBe('');
  });
});

describe('splitName', () => {
  it.each([
    ['Ada Lovelace',           'Ada',  'Lovelace'],
    ['Ada',                    'Ada',  ''],
    ['Ada Byron King Lovelace','Ada',  'Byron King Lovelace'],
    ['  Ada   Lovelace  ',     'Ada',  'Lovelace'],
    ['',                       '',     ''],
  ])('%s → %s / %s', (input, firstName, lastName) => {
    expect(splitName(input)).toEqual({ firstName, lastName });
  });
});

describe('splitPhone', () => {
  it('decomposes E.164 into calling code + national number', () => {
    expect(splitPhone('+33612345678', 'FR')).toEqual({ callingCode: '+33', number: '612345678', countryCode: 'FR' });
  });

  it('keeps digits when the number is not international, without inventing a prefix', () => {
    // Guessing a calling code here would mis-route a sales call.
    expect(splitPhone('0612345678', 'FR')).toEqual({ callingCode: '', number: '0612345678', countryCode: 'FR' });
  });
});

describe('payload mapping — every commercially useful field survives', () => {
  it('company payload carries the company name', () => {
    expect(companyPayload(LEAD)).toEqual({ name: 'Acme' });
  });

  it('person payload carries name, both emails, phone and country', () => {
    const p = personPayload(LEAD, 'co-1') as Record<string, never>;
    expect(p.name).toEqual({ firstName: 'Ada', lastName: 'Lovelace' });
    expect(p.emails).toEqual({ primaryEmail: 'ada@acme.com', additionalEmails: ['ada.lovelace@login.com'] });
    expect(p.phones).toEqual({
      primaryPhoneNumber: '612345678', primaryPhoneCallingCode: '+33', primaryPhoneCountryCode: 'FR',
    });
    expect(p.companyId).toBe('co-1');
    // "Object person doesn't have any \"city\" field" — must not be sent.
    expect(p).not.toHaveProperty('city');
  });

  it('does not repeat the identity email when it equals the contact email', () => {
    const p = personPayload({ ...LEAD, identityEmail: 'ada@acme.com' }) as Record<string, never>;
    expect((p.emails as unknown as { additionalEmails: string[] }).additionalEmails).toEqual([]);
  });

  it('omits companyId entirely when there is no company', () => {
    expect(personPayload(LEAD)).not.toHaveProperty('companyId');
  });

  it('note carries the prospect message', () => {
    const n = notePayload(LEAD) as Record<string, never>;
    const md = (n.bodyV2 as unknown as { markdown: string }).markdown;
    expect(md).toContain('Want a demo of the audit engine');
    expect(md).toContain('ada@acme.com');
    expect(md).toContain('+33612345678');
    expect(md).toContain('dr_abc_123');          // reconciliation link back to the lead
    // noteTargets is a one-to-many relation: Twenty answers "does not support
    // write operations" if it is sent inline, so it must NOT be on the note.
    expect(n).not.toHaveProperty('noteTargets');
  });

  it('links the note to the person as its own record', () => {
    // noteTarget has no companyId field in this workspace, so the link is
    // person-only; the person already carries companyId.
    expect(noteTargetPayload('n-1', 'p-1')).toEqual({ noteId: 'n-1', personId: 'p-1' });
  });

  it('renders a placeholder rather than an empty section when no message was given', () => {
    const n = notePayload({ ...LEAD, message: '' }) as Record<string, never>;
    expect((n.bodyV2 as unknown as { markdown: string }).markdown).toContain('(no message provided)');
  });
});
