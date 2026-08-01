import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLinkedPerson, getPersonCompanyId, setPersonCompany } from '../../worker/src/lib/twenty';
import type { TwentyLead } from '../../worker/src/lib/twenty';

/**
 * The company-mismatch incident.
 *
 * A Person sent to Twenty WITHOUT a companyId does not stay company-less: the
 * workspace attaches one derived from the email address, which is how a prospect
 * stored internally as "Greyvoid" appeared in Twenty as "inboxbear.com". This
 * codebase contains no domain logic at all, so the name could only have come from
 * Twenty.
 *
 * These tests pin the three properties that make the two CRMs agree:
 *   1. a person is NEVER created without a company link
 *   2. the link is READ BACK, not assumed
 *   3. a wrong link is corrected
 */

const LEAD: TwentyLead = {
  name: 'Derrick Chapman', contactEmail: 'demonst@inboxbear.com', identityEmail: 'demonst@inboxbear.com',
  phone: '+12037553072', countryCode: 'AU', phoneCountry: 'US', company: 'Greyvoid',
  message: '', source: 'signup', createdAt: '2026-08-01T00:00:00.000Z', leadId: 'l1',
};

const K = 'key', U = 'https://ailunapro.twenty.com';

let calls: Array<{ method: string; url: string; body?: unknown }>;
const originalFetch = globalThis.fetch;

/** Fake Twenty: `linked` is the company the workspace reports for the person. */
function mockTwenty(opts: { linked: string; failRead?: boolean; failPatch?: boolean; failCreate?: boolean }) {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    calls.push({ method, url, body: init?.body ? JSON.parse(String(init.body)) : undefined });

    if (method === 'POST' && url.endsWith('/rest/people')) {
      if (opts.failCreate) return new Response(JSON.stringify({ messages: ['nope'] }), { status: 400 });
      return new Response(JSON.stringify({ data: { createPerson: { id: 'person-1' } } }), { status: 201 });
    }
    if (method === 'GET' && url.includes('/rest/people/')) {
      if (opts.failRead) return new Response('boom', { status: 500 });
      return new Response(JSON.stringify({ data: { person: { id: 'person-1', companyId: opts.linked } } }), { status: 200 });
    }
    if (method === 'PATCH' && url.includes('/rest/people/')) {
      if (opts.failPatch) return new Response(JSON.stringify({ messages: ['denied'] }), { status: 403 });
      opts.linked = (init?.body ? JSON.parse(String(init.body)).companyId : '') as string;
      return new Response(JSON.stringify({ data: { person: { id: 'person-1' } } }), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  }) as typeof fetch;
}

beforeEach(() => { calls = []; });
afterEach(() => { globalThis.fetch = originalFetch; });

describe('createLinkedPerson', () => {
  it('REFUSES to create a person with no company link', async () => {
    mockTwenty({ linked: '' });
    const res = await createLinkedPerson(K, U, LEAD, '');
    expect(res.ok).toBe(false);
    expect(res.error).toContain('no company link');
    // The whole point: no request reached Twenty at all.
    expect(calls).toHaveLength(0);
  });

  it('sends companyId on the create', async () => {
    mockTwenty({ linked: 'co-1' });
    await createLinkedPerson(K, U, LEAD, 'co-1');
    const create = calls.find(c => c.method === 'POST')!;
    expect((create.body as { companyId: string }).companyId).toBe('co-1');
  });

  it('reads the link back rather than assuming it', async () => {
    mockTwenty({ linked: 'co-1' });
    const res = await createLinkedPerson(K, U, LEAD, 'co-1');
    expect(res.ok).toBe(true);
    expect(res.corrected).toBe(false);
    expect(calls.some(c => c.method === 'GET' && c.url.includes('/rest/people/person-1'))).toBe(true);
  });

  it('CORRECTS a person Twenty attached to the wrong company', async () => {
    // The incident: Twenty linked the email-domain company instead of ours.
    const workspace = { linked: 'domain-derived-company' };
    mockTwenty(workspace);
    const res = await createLinkedPerson(K, U, LEAD, 'co-greyvoid');
    expect(res.ok).toBe(true);
    expect(res.corrected).toBe(true);
    const patch = calls.find(c => c.method === 'PATCH')!;
    expect((patch.body as { companyId: string }).companyId).toBe('co-greyvoid');
    expect(workspace.linked).toBe('co-greyvoid');
  });

  it('a failed READ-BACK is not a failed push — the person exists', async () => {
    mockTwenty({ linked: 'co-1', failRead: true });
    const res = await createLinkedPerson(K, U, LEAD, 'co-1');
    expect(res.ok).toBe(true);
    expect(res.id).toBe('person-1');
    expect(res.error).toContain('read person failed');   // reported, not swallowed
  });

  it('a failed CORRECTION is a failed push — the CRMs would disagree', async () => {
    mockTwenty({ linked: 'wrong', failPatch: true });
    const res = await createLinkedPerson(K, U, LEAD, 'co-1');
    expect(res.ok).toBe(false);
    expect(res.error).toContain('wrong company');
  });

  it('a failed create never reaches the verification step', async () => {
    mockTwenty({ linked: '', failCreate: true });
    const res = await createLinkedPerson(K, U, LEAD, 'co-1');
    expect(res.ok).toBe(false);
    expect(calls.filter(c => c.method === 'GET')).toHaveLength(0);
  });
});

describe('person company read/write', () => {
  it('reports an empty company as a clean empty, not an error', async () => {
    mockTwenty({ linked: '' });
    const res = await getPersonCompanyId(K, U, 'person-1');
    expect(res.ok).toBe(true);
    expect(res.id).toBe('');
  });

  it('scrubs an email out of a provider error before it can be logged', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ messages: ['no such person demonst@inboxbear.com'] }), { status: 400 })) as typeof fetch;
    const res = await setPersonCompany(K, U, 'p1', 'c1');
    expect(res.ok).toBe(false);
    expect(res.error).toContain('<email>');
    expect(res.error).not.toContain('inboxbear.com');
  });
});
