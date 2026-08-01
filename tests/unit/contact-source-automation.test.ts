import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Source automation — every contact must be born with a source.
 *
 * This is a SOURCE-LEVEL audit rather than a behavioural one because the writers
 * live in five different files and the failure mode is omission: a sixth writer
 * added later that forgets `source` produces contacts the funnel cannot classify,
 * and no behavioural test of the existing five would notice.
 *
 * The bug this locks down: lib/lead-contact.ts hard-coded `source: 'demo_request'`
 * and served BOTH the demo-request route and the signup route, so every account
 * created through signup was filed as a demo request.
 */

const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

describe('every contact writer sets a source', () => {
  it('lead-contact takes the source from its caller, never hard-codes one', () => {
    const src = read('worker/src/lib/lead-contact.ts');
    expect(src).toContain('source:         input.source');
    // The old hard-code must not come back.
    expect(src).not.toMatch(/source:\s*'demo_request'/);
    // And it must be required, so a new caller cannot inherit someone else's.
    expect(src).toMatch(/source:\s+string;/);
  });

  it('signup writes source=signup', () => {
    const src = read('worker/src/routes/signup-crm.ts');
    expect(src).toMatch(/source:\s*'signup'/);
  });

  it('demo request writes source=demo_request', () => {
    const src = read('worker/src/routes/demo-request.ts');
    expect(src).toMatch(/source:\s*'demo_request'/);
  });

  it('CSV import writes source=import', () => {
    const src = read('worker/src/routes/contacts-import.ts');
    expect(src).toMatch(/source:\s*'import'/);
  });

  it('manual create defaults to source=manual and never writes an empty one', () => {
    const src = read('worker/src/routes/contacts.ts');
    expect(src).toContain("source: f.source ?? 'manual'");
    // validate() supplies 'manual' when the field is absent on a create.
    expect(src).toContain("const source = typeof body.source === 'string' ? body.source : 'manual'");
  });

  it('reconciliation-created companies are labelled, not left blank', () => {
    expect(read('worker/src/routes/companies.ts')).toMatch(/source:\s*'reconcile'/);
  });
});

describe('the source allowlist covers every source the platform writes', () => {
  const contactsSrc = read('worker/src/routes/contacts.ts');
  const allow = /const SOURCE_VALUES: readonly string\[\] = \[([\s\S]*?)\];/.exec(contactsSrc)?.[1] ?? '';
  const values = [...allow.matchAll(/'([a-z_]+)'/g)].map(m => m[1]);

  it('parses the allowlist', () => {
    expect(values.length).toBeGreaterThan(0);
  });

  for (const s of ['signup', 'demo_request', 'import', 'manual', 'quote', 'worksheet', 'visibility', 'reconcile']) {
    it(`accepts '${s}'`, () => {
      // A source the platform writes but validate() rejects would 400 an operator
      // trying to edit a contact the platform itself created.
      expect(values).toContain(s);
    });
  }

  it('the client type mirrors the server allowlist exactly', () => {
    const client = read('src/lib/contacts/contactsClient.ts');
    const decl = /export type ContactSource =([\s\S]*?);/.exec(client)?.[1] ?? '';
    const clientValues = [...decl.matchAll(/'([a-z_]+)'/g)].map(m => m[1]);
    expect(clientValues.sort()).toEqual([...values].sort());
  });

  it('every source has a translation in the base locale', () => {
    const en = read('src/lib/locale/i18n/en.ts');
    const block = /sources: \{([\s\S]*?)\},/.exec(en)?.[1] ?? '';
    for (const s of values) expect(block).toContain(`${s}:`);
  });
});
