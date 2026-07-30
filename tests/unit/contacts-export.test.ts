import { describe, it, expect } from 'vitest';
import { contactsToCsv, escapeCsvField, csvFilename, CSV_COLUMNS } from '../../src/lib/contacts/contactsExport';
import type { Contact } from '../../src/lib/contacts/contactsClient';

/*
 * Contacts CSV export.
 *
 * The export is what an operator hands to another tool, so a malformed field is
 * not cosmetic: an unescaped comma shifts every following column and silently
 * corrupts the import. These tests pin the escaping contract, the column order
 * (which downstream imports depend on), and the rule that only the rows passed in
 * are exported — the caller supplies the filtered set.
 */

const contact = (over: Partial<Contact> = {}): Contact => ({
  contactId: 'c1', name: 'Ada Lovelace', email: 'ada@acme.com', phone: '+33612345678',
  company: 'Acme', tags: [], notes: '', status: 'active', source: 'demo_request',
  linkedQuoteId: '', linkedAuditId: '', createdByUid: 'u1',
  createdAt: '2026-07-30T10:00:00.000Z', updatedAt: '2026-07-30T10:00:00.000Z',
  countryCode: 'FR', leadStatus: 'new', lastActivityAt: '2026-07-30T11:00:00.000Z',
  ...over,
});

describe('escapeCsvField — a broken field corrupts every later column', () => {
  it('leaves a plain value untouched', () => {
    expect(escapeCsvField('Acme')).toBe('Acme');
  });

  it.each([
    ['comma',   'Acme, Inc.',      '"Acme, Inc."'],
    ['quote',   'He said "hi"',    '"He said ""hi"""'],
    ['newline', 'line1\nline2',    '"line1\nline2"'],
    ['CR',      'line1\r\nline2',  '"line1\r\nline2"'],
  ])('wraps a value containing a %s', (_label, input, expected) => {
    expect(escapeCsvField(input)).toBe(expected);
  });

  it.each(['=1+1', '@SUM(A1)', '+SUM(A1)', '-cmd|calc'])('neutralises the formula trigger in %s', v => {
    // Spreadsheets execute a leading =,@,+,- on open. The value must import as text.
    expect(escapeCsvField(v)).toBe(`'${v}`);
  });

  it.each(['+33612345678', '+1 203 755 3072', '-42'])('leaves the numeric value %s alone', v => {
    // A blanket +/- guard prefixed every E.164 phone with a quote, corrupting the
    // most useful column in a sales export. A numeric +/- value is not a formula.
    expect(escapeCsvField(v)).toBe(v);
  });

  it('renders null and undefined as empty, never the words', () => {
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
  });
});

describe('contactsToCsv', () => {
  it('emits the header in the contracted column order', () => {
    const csv = contactsToCsv([]);
    expect(csv.replace('﻿', '')).toBe(CSV_COLUMNS.join(','));
  });

  it('starts with a UTF-8 BOM so Excel renders accented names correctly', () => {
    // Without it, "Corinne Bernier" from a French locale opens as mojibake.
    expect(contactsToCsv([]).startsWith('﻿')).toBe(true);
  });

  it('writes one row per contact with every exported field', () => {
    const csv = contactsToCsv([contact()]);
    const row = csv.split('\r\n')[1];
    expect(row).toBe('Ada Lovelace,ada@acme.com,+33612345678,FR,Acme,demo_request,new,2026-07-30T10:00:00.000Z,2026-07-30T11:00:00.000Z');
  });

  it('falls back to the phone country when the request country is unknown', () => {
    const csv = contactsToCsv([contact({ countryCode: '', phoneCountry: 'GB' })]);
    expect(csv.split('\r\n')[1].split(',')[3]).toBe('GB');
  });

  it('exports exactly the rows given — filtering is the caller\'s job', () => {
    // The page passes its filtered+searched array, so the export matches the
    // screen. Exporting the unfiltered set would leak rows the operator excluded.
    const csv = contactsToCsv([contact({ name: 'A' }), contact({ name: 'B' })]);
    expect(csv.split('\r\n')).toHaveLength(3);   // header + 2
  });

  it('survives a contact whose fields contain commas and quotes', () => {
    const csv = contactsToCsv([contact({ name: 'Lovelace, Ada', company: 'He said "Acme"' })]);
    const row = csv.split('\r\n')[1];
    expect(row.startsWith('"Lovelace, Ada",')).toBe(true);
    expect(row).toContain('"He said ""Acme"""');
  });

  it('tolerates a pre-v3 contact missing the newer fields', () => {
    const legacy = { ...contact() } as Contact;
    delete (legacy as Partial<Contact>).leadStatus;
    delete (legacy as Partial<Contact>).lastActivityAt;
    delete (legacy as Partial<Contact>).countryCode;
    delete (legacy as Partial<Contact>).phoneCountry;
    const row = contactsToCsv([legacy]).split('\r\n')[1];
    expect(row).toBe('Ada Lovelace,ada@acme.com,+33612345678,,Acme,demo_request,,2026-07-30T10:00:00.000Z,');
  });
});

describe('csvFilename', () => {
  it('is date-stamped so successive exports do not overwrite', () => {
    expect(csvFilename(new Date('2026-07-30T21:00:00Z'))).toBe('contacts-2026-07-30.csv');
  });
});
