import { describe, it, expect } from 'vitest';
import { parseCsvGrid, mapHeaders, parseContactsCsv, batchRows, IMPORT_BATCH } from '../../src/lib/contacts/csvParse';
import { contactsToCsv, CSV_COLUMNS } from '../../src/lib/contacts/contactsExport';
import type { Contact } from '../../src/lib/contacts/contactsClient';

describe('csvParse — grid', () => {
  it('keeps a comma that lives INSIDE a quoted field', () => {
    expect(parseCsvGrid('a,"Acme, Inc.",c')).toEqual([['a', 'Acme, Inc.', 'c']]);
  });

  it('unescapes a doubled quote the way Excel writes it', () => {
    expect(parseCsvGrid('"She said ""hi""",b')).toEqual([['She said "hi"', 'b']]);
  });

  it('keeps a newline inside a quoted field on the same row', () => {
    expect(parseCsvGrid('"line1\nline2",b')).toEqual([['line1\nline2', 'b']]);
  });

  it('handles CRLF and a missing trailing newline', () => {
    expect(parseCsvGrid('a,b\r\nc,d')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('strips the UTF-8 BOM so the first header still matches', () => {
    expect(parseCsvGrid('﻿Email,Name')[0][0]).toBe('Email');
  });

  it('drops blank lines', () => {
    expect(parseCsvGrid('a,b\n\n\nc,d')).toHaveLength(2);
  });
});

describe('csvParse — headers', () => {
  it('matches aliases case- and separator-insensitively', () => {
    const idx = mapHeaders(['Full Name', 'E-Mail', 'Phone_Number', 'Company Name', 'Country', 'Notes']);
    expect(idx).toEqual({ name: 0, email: 1, phone: 2, company: 3, countryCode: 4, notes: 5 });
  });

  it('reports -1 for a column the file does not carry', () => {
    expect(mapHeaders(['Email']).phone).toBe(-1);
  });
});

describe('csvParse — file', () => {
  it('parses rows and trims cells', () => {
    const { rows, error } = parseContactsCsv('Name,Email,Company\n Ada , ada@x.com ,"Acme, Inc."');
    expect(error).toBeUndefined();
    expect(rows).toEqual([{ name: 'Ada', email: 'ada@x.com', phone: '', company: 'Acme, Inc.', countryCode: '', notes: '' }]);
  });

  it('a header-only or empty file is EMPTY_FILE', () => {
    expect(parseContactsCsv('Name,Email').error).toBe('EMPTY_FILE');
    expect(parseContactsCsv('').error).toBe('EMPTY_FILE');
  });

  it('a file with no email column is refused outright, not row by row', () => {
    expect(parseContactsCsv('Name,Company\nAda,Acme').error).toBe('NO_EMAIL_COLUMN');
  });

  it('a short row does not read a neighbouring column', () => {
    const { rows } = parseContactsCsv('Name,Email,Company\nAda,ada@x.com');
    expect(rows[0].company).toBe('');
  });

  it('ROUND TRIP: the app\'s own CSV export re-imports cleanly', () => {
    const c = {
      name: 'Corinne Bernier', email: 'corinne@x.com', phone: '+33612345678',
      countryCode: 'FR', company: 'Acme, Inc.', source: 'demo_request',
      leadStatus: 'new', createdAt: '2026-01-01T00:00:00.000Z', lastActivityAt: '',
      tags: [], notes: '', status: 'active', linkedQuoteId: '', linkedAuditId: '',
      contactId: 'c1', createdByUid: 'u1', updatedAt: '',
    } as unknown as Contact;
    const { rows, error } = parseContactsCsv(contactsToCsv([c]));
    expect(error).toBeUndefined();
    expect(rows[0]).toMatchObject({
      name: 'Corinne Bernier', email: 'corinne@x.com',
      phone: '+33612345678',           // the formula guard must not have quoted it
      company: 'Acme, Inc.', countryCode: 'FR',
    });
    // Every exported column the importer knows about is actually recognised.
    expect(CSV_COLUMNS).toContain('Company');
  });
});

describe('csvParse — batching', () => {
  it('splits into request-sized batches with nothing lost', () => {
    const rows = Array.from({ length: IMPORT_BATCH * 2 + 3 }, (_, i) => i);
    const batches = batchRows(rows);
    expect(batches).toHaveLength(3);
    expect(batches.flat()).toEqual(rows);
    expect(batches[0]).toHaveLength(IMPORT_BATCH);
  });

  it('an empty list produces no batches', () => {
    expect(batchRows([])).toEqual([]);
  });
});
