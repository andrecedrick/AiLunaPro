import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Demo-request P0 regression suite.
 *
 * The route used to persist `demo_requests/{id}` and RETURN — nothing read that
 * collection, so a commercial lead produced no durable alert, no bell entry, no
 * admin email and no operator surface. These tests pin every leg of the loop:
 *
 *   1. the lead is stored
 *   2. a durable platform_alerts record exists
 *   3. an operator notification exists, routed to the Admin Center
 *   4. the admin email is attempted, replying straight to the prospect
 *   5. alert/email failure NEVER loses an already-captured lead
 *   6. the lead is visible through the operator read surface
 */

const store = vi.hoisted(() => ({
  writes: new Map<string, Record<string, unknown>>(),
  members: new Set<string>(),
  sends: [] as Array<{ to: string; slug: string; variables: Record<string, string>; replyTo?: string }>,
  sendOk: true,
  setThrowsOn: null as string | null,
  queryThrows: false,
  patches: [] as Array<{ path: string; doc: Record<string, unknown>; merge: boolean }>,
  crmCalls: [] as Array<{ path: string; body: unknown }>,
  crmFails: false,
  crmNoId: false,
  crmSeq: 0,
}));

// Twenty CRM is reached over plain fetch; intercept it so no test ever performs a
// real outbound call, and so the exact push sequence can be asserted.
vi.stubGlobal("fetch", vi.fn(async (url: string, init?: { body?: string }) => {
  const path = new URL(String(url)).pathname;
  store.crmCalls.push({ path, body: JSON.parse(init?.body ?? "{}") });
  if (store.crmFails) return { ok: false, status: 400, text: async () => JSON.stringify({ statusCode: 400, messages: ["bad field"], error: "BAD_REQUEST" }) } as unknown as Response;
  if (store.crmNoId) return { ok: true, status: 200, text: async () => "<!doctype html><html></html>" } as unknown as Response;
  store.crmSeq += 1;
  return { ok: true, status: 200, text: async () => JSON.stringify({ data: { record: { id: `id-${store.crmSeq}` } } }) } as unknown as Response;
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  // Reads see what was written (so the duplicate probe can find an existing lead)
  // and, separately, the membership docs the auth gate looks up.
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    if (store.writes.has(path)) return store.writes.get(path)!;
    return store.members.has(path) ? { role: 'owner' } : null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, doc: Record<string, unknown>, opts?: { merge?: boolean }) => {
    if (store.setThrowsOn && path.startsWith(store.setThrowsOn)) throw new Error('firestore down');
    // Record the RAW patch so a test can assert which keys a merge did NOT touch.
    store.patches.push({ path, doc, merge: opts?.merge === true });
    store.writes.set(path, opts?.merge ? { ...(store.writes.get(path) ?? {}), ...doc } : doc);
  }),
  // Models the two things the demo-request path actually relies on: parent-scoped
  // collection queries (organizations/{orgId}/contacts) and a single equality
  // fieldFilter. Without the parent, contact dedup silently matched nothing.
  firestoreRunQuery: vi.fn(async (
    _sa: string,
    q: { from?: Array<{ collectionId?: string }>; where?: { fieldFilter?: { field?: { fieldPath?: string }; value?: { stringValue?: string } } } },
    parent?: string,
  ) => {
    if (store.queryThrows) throw new Error('FAILED_PRECONDITION: index required');
    const cid = q.from?.[0]?.collectionId ?? '';
    const prefix = parent ? `${parent}/${cid}/` : `${cid}/`;
    const ff = q.where?.fieldFilter;
    return [...store.writes.entries()]
      .filter(([k]) => k.startsWith(prefix))
      .filter(([, v]) => !ff?.field?.fieldPath || v[ff.field.fieldPath] === ff.value?.stringValue)
      .map(([k, v]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields: v }));
  }),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  verifyIdTokenClaims: vi.fn(async () => ({ uid: 'user-1', email: 'prospect@acme.com' })),
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', 'admin-1'); c.set('email', 'admin@ailunapro.com'); await next();
  },
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  requirePlatformAdmin: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_k: string | undefined, p: { to: string; slug: string; variables: Record<string, string>; replyTo?: string }) => {
    store.sends.push(p);
    return store.sendOk ? { ok: true } : { ok: false, error: 'Sequenzy send failed (HTTP 404): template not found' };
  }),
}));

const ENV = {
  FIREBASE_PROJECT_ID: 'p',
  FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}',
  ADMIN_EMAIL: 'admin@ailunapro.com',
  SEQUENZY_API_KEY: 'key',
};

async function submit(body: Record<string, unknown>, env: Record<string, unknown> = ENV) {
  const route = (await import('../../worker/src/routes/demo-request')).default;
  const res = await route.request('/api/demo-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok', 'CF-IPCountry': 'FR' },
    body: JSON.stringify(body),
  }, env);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

async function listAsAdmin() {
  const route = (await import('../../worker/src/routes/platform-demo-requests')).default;
  const res = await route.request('/api/platform/demo-requests', {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

const VALID = { orgId: 'org-1', name: 'Ada Lovelace', email: 'typed@acme.com', phone: '+33 6 12 34 56 78', company: 'Acme', message: 'Want a demo' };

const find = (prefix: string) => [...store.writes.entries()].find(([k]) => k.startsWith(prefix));

beforeEach(() => {
  store.writes.clear();
  store.members.clear();
  store.members.add('organizations/org-1/members/user-1');
  store.sends = [];
  store.sendOk = true;
  store.setThrowsOn = null;
  store.queryThrows = false;
  store.patches = [];
  store.crmCalls = [];
  store.crmFails = false;
  store.crmNoId = false;
  store.crmSeq = 0;
  vi.resetModules();
});

const adminSends = () => store.sends.filter(s => s.slug === 'demo-request-admin');
const prospectSends = () => store.sends.filter(s => s.slug === 'demo-request-confirmation');

describe('demo request — capture', () => {
  it('stores the lead and returns its id', async () => {
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const stored = find('demo_requests/');
    expect(stored).toBeDefined();
    expect(stored?.[1]).toMatchObject({ name: 'Ada Lovelace', company: 'Acme', orgId: 'org-1', status: 'new', source: 'dashboard-cta' });
  });

  it('keeps identity and contact emails apart instead of discarding the typed one', async () => {
    await submit(VALID);
    const lead = find('demo_requests/')?.[1] ?? {};
    // Identity is the VERIFIED token email — a member must not file a lead as anyone.
    expect(lead.identityEmail).toBe('prospect@acme.com');
    // The typed "Work email" used to be thrown away entirely.
    expect(lead.contactEmail).toBe('typed@acme.com');
    // Legacy field retained, still the identity address, for pre-v3 readers.
    expect(lead.email).toBe('prospect@acme.com');
    expect(lead.schemaVersion).toBe(4);
  });

  it('stores a normalised phone plus both country signals', async () => {
    await submit(VALID);
    const lead = find('demo_requests/')?.[1] ?? {};
    // '+33 6 12 34 56 78' must not become a second CRM format.
    expect(lead.phone).toBe('+33612345678');
    expect(lead.countryCode).toBe('FR');    // CF-IPCountry — where the request came from
    expect(lead.phoneCountry).toBe('FR');    // resolved from the dialling prefix
  });

  it.each([
    ['missing',   undefined],
    ['blank',     '   '],
    ['too short', '+33 6'],
    ['too long',  '+3361234567890123456'],
  ])('rejects a %s phone at the boundary', async (_label, phone) => {
    const res = await submit({ ...VALID, phone });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PHONE');
    expect(find('demo_requests/')).toBeUndefined();   // nothing half-written
  });

  it('leaves countryCode empty when the edge sends no geo header', async () => {
    const route = (await import('../../worker/src/routes/demo-request')).default;
    await route.request('/api/demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
      body: JSON.stringify(VALID),
    }, ENV);
    expect(find('demo_requests/')?.[1].countryCode).toBe('');
  });

  it('falls back to the identity email when the typed one is invalid', async () => {
    await submit({ ...VALID, email: 'not-an-email' });
    const lead = find('demo_requests/')?.[1] ?? {};
    expect(lead.contactEmail).toBe('prospect@acme.com');   // never lose a lead over a typo
    expect(lead.identityEmail).toBe('prospect@acme.com');
  });

  it('rejects a non-member of the workspace', async () => {
    store.members.clear();
    expect((await submit(VALID)).status).toBe(403);
  });
});

describe('demo request — operator alerting (the P0 gap)', () => {
  it('writes a durable platform_alerts record', async () => {
    await submit(VALID);
    const alert = find('platform_alerts/demo_request_received__');
    expect(alert).toBeDefined();
    expect(alert?.[1]).toMatchObject({ kind: 'demo_request_received', resolved: false });
  });

  it('keeps PII out of the durable alert and its context', async () => {
    await submit(VALID);
    const alert = find('platform_alerts/demo_request_received__')?.[1] ?? {};
    const blob = JSON.stringify(alert);
    expect(blob).not.toContain('Ada Lovelace');
    expect(blob).not.toContain('prospect@acme.com');
    expect(blob).not.toContain('typed@acme.com');
    expect(blob).not.toContain('Acme');
  });

  it('creates an operator notification routed to the Admin Center', async () => {
    await submit(VALID);
    const notif = find('notifications/notif_demo_request_received__');
    expect(notif).toBeDefined();
    expect(notif?.[1]).toMatchObject({ audience: 'operator', type: 'demo', route: 'admin', read: false });
  });

  it('attempts the demo-request-admin email, replying to the prospect', async () => {
    await submit(VALID);
    expect(adminSends()).toHaveLength(1);
    // Reply reaches the address the prospect nominated, not their login.
    expect(adminSends()[0]).toMatchObject({ to: 'admin@ailunapro.com', slug: 'demo-request-admin', replyTo: 'typed@acme.com' });
    expect(adminSends()[0].variables).toMatchObject({
      NAME: 'Ada Lovelace', COMPANY: 'Acme', ORG_ID: 'org-1',
      IDENTITY_EMAIL: 'prospect@acme.com',
      CONTACT_EMAIL:  'typed@acme.com',
      EMAIL:          'typed@acme.com',
    });
  });

  it('attempts the prospect confirmation, replying to a human operator', async () => {
    await submit(VALID);
    expect(prospectSends()).toHaveLength(1);
    expect(prospectSends()[0]).toMatchObject({
      to: 'typed@acme.com', slug: 'demo-request-confirmation', replyTo: 'admin@ailunapro.com',
    });
    expect(prospectSends()[0].variables).toMatchObject({ NAME: 'Ada Lovelace', COMPANY: 'Acme' });
  });

  it('sends the admin email BEFORE the prospect confirmation', async () => {
    await submit(VALID);
    // A confirmation must never be the reason the operator misses a lead.
    expect(store.sends.map(s => s.slug)).toEqual(['demo-request-admin', 'demo-request-confirmation']);
  });

  it('surfaces a failed email as its own durable alert', async () => {
    store.sendOk = false;
    await submit(VALID);
    const failed = find('platform_alerts/notification_email_failed__');
    expect(failed).toBeDefined();
    expect(String(failed?.[1].context)).toContain('demo-request-admin');
  });
});

describe('demo request — a captured lead is never lost to alerting', () => {
  it('still returns 200 when the email send fails', async () => {
    store.sendOk = false;
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(find('demo_requests/')).toBeDefined();
  });

  it('still returns 200 when the alert write fails', async () => {
    store.setThrowsOn = 'platform_alerts/';
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(find('demo_requests/')).toBeDefined();
  });

  it('skips the ADMIN email when ADMIN_EMAIL is unset, without failing the lead', async () => {
    const { ADMIN_EMAIL: _drop, ...noAdmin } = ENV;
    const res = await submit(VALID, noAdmin);
    expect(res.status).toBe(200);
    expect(adminSends()).toHaveLength(0);
    // The prospect is still confirmed — that path does not depend on ADMIN_EMAIL.
    expect(prospectSends()).toHaveLength(1);
    expect(find('demo_requests/')).toBeDefined();
  });
});

describe('demo request — lead-management fields', () => {
  it('every lead carries createdAt, status=new, owner and lastContactAt', async () => {
    await submit(VALID);
    const lead = find('demo_requests/')?.[1] ?? {};
    expect(lead.status).toBe('new');
    expect(lead.owner).toBe('');              // unassigned
    expect(lead.lastContactAt).toBe('');      // never contacted
    expect(String(lead.createdAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(lead.schemaVersion).toBe(4);
  });

  it('the operator surface returns the lead-management fields', async () => {
    await submit(VALID);
    const items = (await listAsAdmin()).body.items as unknown as Array<Record<string, string>>;
    expect(items[0]).toMatchObject({ status: 'new', owner: '', lastContactAt: '' });
  });
});

describe('demo request — duplicate protection', () => {
  it('a repeated identical submission yields ONE lead, ONE alert, ONE admin email', async () => {
    const first  = await submit(VALID);
    const second = await submit(VALID);

    expect(first.body.duplicate).toBe(false);
    expect(second.body.duplicate).toBe(true);
    expect(second.body.id).toBe(first.body.id);

    const leads = [...store.writes.keys()].filter(k => k.startsWith('demo_requests/'));
    expect(leads).toHaveLength(1);
    const alerts = [...store.writes.keys()].filter(k => k.startsWith('platform_alerts/demo_request_received__'));
    expect(alerts).toHaveLength(1);
    expect(adminSends()).toHaveLength(1);
    expect(prospectSends()).toHaveLength(1);
  });

  it('a DIFFERENT message from the same prospect is a separate lead', async () => {
    await submit(VALID);
    const other = await submit({ ...VALID, message: 'Actually, two demos please' });
    expect(other.body.duplicate).toBe(false);
    expect([...store.writes.keys()].filter(k => k.startsWith('demo_requests/'))).toHaveLength(2);
  });

  it('a different prospect submitting identical content is a separate lead', async () => {
    await submit(VALID);
    const { verifyIdTokenClaims } = await import('../../worker/src/middleware/auth');
    vi.mocked(verifyIdTokenClaims).mockResolvedValueOnce({ uid: 'user-2', email: 'other@acme.com' } as never);
    store.members.add('organizations/org-1/members/user-2');
    const other = await submit(VALID);
    expect(other.body.duplicate).toBe(false);
    expect([...store.writes.keys()].filter(k => k.startsWith('demo_requests/'))).toHaveLength(2);
  });

  it('a failed duplicate probe writes the lead anyway (never lose a lead)', async () => {
    const { firestoreGet } = await import('../../worker/src/lib/firestoreAdmin');
    vi.mocked(firestoreGet).mockImplementationOnce(async () => ({ role: 'owner' }));       // membership gate
    vi.mocked(firestoreGet).mockImplementationOnce(async () => { throw new Error('probe down'); });
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(find('demo_requests/')).toBeDefined();
  });
});

describe('demo request — lead reaches the CRM', () => {
  const contacts = () => [...store.writes.entries()].filter(([k]) => k.startsWith('organizations/org-1/contacts/'));

  it('creates a contact from the lead, keyed on the contact email', async () => {
    await submit(VALID);
    expect(contacts()).toHaveLength(1);
    expect(contacts()[0][1]).toMatchObject({
      name:          'Ada Lovelace',
      email:         'typed@acme.com',
      emailKey:      'typed@acme.com',   // dedup key = where they asked to be reached
      identityEmail: 'prospect@acme.com',
      company:       'Acme',
      phone:         '+33612345678',
      countryCode:   'FR',
      phoneCountry:  'FR',
      source:        'demo_request',
      leadStatus:    'new',
      status:        'active',
    });
    const doc = contacts()[0][1];
    expect(String(doc.createdAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(String(doc.lastActivityAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('carries the prospect message onto the contact so sales can prepare the call', async () => {
    await submit(VALID);
    // Previously the "what would you like to discuss?" text lived ONLY on the
    // demo_requests lead, so a sales operator working the CRM could not see it.
    expect(contacts()[0][1].lastMessage).toBe('Want a demo');
    expect(contacts()[0][1].owner).toBe('');   // unassigned until an operator takes it
  });

  it('refreshes lastMessage on a returning lead', async () => {
    await submit(VALID);
    await submit({ ...VALID, message: 'Now about enterprise pricing' });
    const patch = store.patches.filter(p => p.path.startsWith('organizations/org-1/contacts/')).pop()!.doc;
    expect(patch.lastMessage).toBe('Now about enterprise pricing');
  });

  it('updates the existing contact instead of creating a duplicate', async () => {
    store.writes.set('organizations/org-1/contacts/c-1', {
      contactId: 'c-1', name: 'Ada L.', email: 'typed@acme.com', emailKey: 'typed@acme.com',
      company: 'Acme Corp', source: 'manual', status: 'active', leadStatus: 'qualified',
      createdAt: '2026-01-01T00:00:00Z',
    });
    await submit({ ...VALID, message: 'second touch' });

    expect(contacts()).toHaveLength(1);
    const doc = contacts()[0][1];
    expect(String(doc.lastActivityAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(doc.identityEmail).toBe('prospect@acme.com');
  });

  it('never demotes operator work on an existing contact', async () => {
    store.writes.set('organizations/org-1/contacts/c-1', {
      contactId: 'c-1', name: 'Corrected Name', email: 'typed@acme.com', emailKey: 'typed@acme.com',
      company: 'Acme Corp', source: 'manual', status: 'active', leadStatus: 'qualified',
      tags: ['vip'], createdAt: '2026-01-01T00:00:00Z',
    });
    await submit(VALID);
    const patch = store.patches.find(p => p.path.startsWith('organizations/org-1/contacts/'))!.doc;
    // A merge patch must not carry these keys at all — a qualified lead cannot be
    // reset to 'new', nor a corrected name overwritten, by a repeat request.
    expect(patch).not.toHaveProperty('leadStatus');
    expect(patch).not.toHaveProperty('source');
    expect(patch).not.toHaveProperty('status');
    expect(patch).not.toHaveProperty('name');
    expect(patch).not.toHaveProperty('company');   // already set → not overwritten
  });

  it('a CRM failure raises a durable critical alert and never loses the lead', async () => {
    store.setThrowsOn = 'organizations/org-1/contacts/';
    const res = await submit(VALID);

    expect(res.status).toBe(200);                       // the lead still succeeded
    expect(find('demo_requests/')).toBeDefined();
    const alert = find('platform_alerts/lead_contact_failed__');
    expect(alert).toBeDefined();
    expect(alert?.[1]).toMatchObject({ kind: 'lead_contact_failed', severity: 'critical' });
  });

  it('a duplicate demo request does not touch the CRM twice', async () => {
    await submit(VALID);
    const before = contacts().length;
    await submit(VALID);                                // same content, same window
    expect(contacts()).toHaveLength(before);
  });
});

describe('demo request — Twenty CRM push', () => {
  const CRM_ENV = { ...ENV, TWENTY_API_KEY: 'tk', TWENTY_BASE_URL: 'https://ailunapro.twenty.com' };
  const contacts = () => [...store.writes.entries()].filter(([k]) => k.startsWith('organizations/org-1/contacts/'));

  it('creates company, person and note, then records the ids for idempotency', async () => {
    await submit(VALID, CRM_ENV);
    // The two /rest/people/id-2 calls are the company-link VERIFICATION: a GET to
    // read the company Twenty actually attached, then a PATCH because this stub
    // returns a person with no company — which is exactly the incident that put
    // "inboxbear.com" in Twenty against a prospect stored as "Greyvoid".
    expect(store.crmCalls.map(c => c.path)).toEqual([
      '/rest/companies', '/rest/people', '/rest/people/id-2', '/rest/people/id-2',
      '/rest/notes', '/rest/noteTargets',
    ]);
    expect(contacts()[0][1]).toMatchObject({ twentyPersonId: 'id-2', twentyCompanyId: 'id-1' });
  });

  it('the person is created WITH the company id, never unlinked', async () => {
    await submit(VALID, CRM_ENV);
    const create = store.crmCalls.find(c => c.path === '/rest/people')!;
    expect((create.body as { companyId?: string }).companyId).toBe('id-1');
    // And the correction points at the same company, never at anything derived
    // from the email address.
    const patch = store.crmCalls.filter(c => c.path === '/rest/people/id-2').pop()!;
    expect((patch.body as { companyId?: string }).companyId).toBe('id-1');
  });

  it('a returning prospect adds only a NOTE — never a second person', async () => {
    await submit(VALID, CRM_ENV);
    store.crmCalls = [];
    // Different message → a new lead (new dedup bucket content), same contact.
    await submit({ ...VALID, message: 'Following up' }, CRM_ENV);
    expect(store.crmCalls.map(c => c.path)).toEqual(['/rest/notes', '/rest/noteTargets']);
  });

  it('sends the prospect message in the note body', async () => {
    await submit(VALID, CRM_ENV);
    const note = store.crmCalls.find(c => c.path === '/rest/notes')!;
    expect(JSON.stringify(note.body)).toContain('Want a demo');
  });

  it('a CRM failure raises a critical alert and never loses the lead', async () => {
    store.crmFails = true;
    const res = await submit(VALID, CRM_ENV);

    expect(res.status).toBe(200);                    // the lead still succeeded
    expect(find('demo_requests/')).toBeDefined();
    const alert = find('platform_alerts/crm_push_failed__');
    expect(alert).toBeDefined();
    expect(alert?.[1]).toMatchObject({ kind: 'crm_push_failed', severity: 'critical' });
  });

  it('a 2xx carrying no record id raises an alert instead of passing silently', async () => {
    // The original client treated any 2xx as success even when it could not find
    // an id, so a push that created nothing looked complete and alerted nobody.
    store.crmNoId = true;
    const res = await submit(VALID, CRM_ENV);

    expect(res.status).toBe(200);                     // lead still safe
    const alert = find('platform_alerts/crm_push_failed__');
    expect(alert).toBeDefined();
    // The empty id must never be stored as the idempotency key.
    expect(contacts()[0][1].twentyPersonId ?? '').toBe('');
  });

  it('surfaces Twenty\'s own diagnostic message, not just its error code', async () => {
    // Twenty replies {statusCode, messages:[...], error}. Reading only `error`
    // yielded "UNAUTHENTICATED" and dropped "Token invalid." — the half that
    // actually identifies the problem.
    store.crmFails = true;
    await submit(VALID, CRM_ENV);
    const alert = find('platform_alerts/crm_push_failed__');
    expect(String(alert?.[1].context)).toContain('bad field');
  });

  it('is skipped entirely when Twenty is not configured — no alert storm', async () => {
    await submit(VALID);                             // ENV has no TWENTY_* keys
    expect(store.crmCalls).toHaveLength(0);
    // An unconfigured integration is a deliberate state, not a failure.
    expect(find('platform_alerts/crm_push_failed__')).toBeUndefined();
    expect(find('demo_requests/')).toBeDefined();
  });

  it('never pushes tenant contact data — only the demo lead', async () => {
    await submit(VALID, CRM_ENV);
    // Every outbound body must relate to THIS lead. A payload containing another
    // contact would mean customer-owned data leaving Firestore.
    const blob = JSON.stringify(store.crmCalls.map(c => c.body));
    expect(blob).toContain('typed@acme.com');
    expect(blob).not.toContain('organizations/');
  });
});

describe('demo request — confirmation CTA destination', () => {
  it('sends the signup URL so the button is not hardcoded to the marketing site', async () => {
    await submit(VALID, { ...ENV, APP_BASE_URL: 'https://audit.ailunapro.com' });
    expect(prospectSends()[0].variables.CTA_URL).toBe('https://audit.ailunapro.com/#/signup');
  });

  it('tolerates a trailing slash on APP_BASE_URL', async () => {
    await submit(VALID, { ...ENV, APP_BASE_URL: 'https://audit.ailunapro.com/' });
    expect(prospectSends()[0].variables.CTA_URL).toBe('https://audit.ailunapro.com/#/signup');
  });

  it('falls back to the production app URL when APP_BASE_URL is unset', async () => {
    await submit(VALID);
    expect(prospectSends()[0].variables.CTA_URL).toBe('https://audit.ailunapro.com/#/signup');
  });
});

describe('demo request — admin visibility failure is observable', () => {
  it('a broken read fails loudly instead of rendering an empty inbox', async () => {
    await submit(VALID);
    store.queryThrows = true;
    const res = await listAsAdmin();
    // An empty list here would be a comfortable lie: real leads exist.
    expect(res.status).toBe(500);
    expect(res.body.code).toBe('QUERY_FAILED');
  });

  it('and raises a durable critical alert for the operator', async () => {
    store.queryThrows = true;
    await listAsAdmin();
    const alert = find('platform_alerts/demo_visibility_failed__');
    expect(alert).toBeDefined();
    expect(alert?.[1]).toMatchObject({ kind: 'demo_visibility_failed', severity: 'critical' });
  });
});

describe('demo request — operator visibility', () => {
  it('a submitted lead is readable through the platform surface', async () => {
    await submit(VALID);
    const res = await listAsAdmin();
    expect(res.status).toBe(200);
    const items = res.body.items as unknown as Array<{ name: string; email: string; status: string }>;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: 'Ada Lovelace', identityEmail: 'prospect@acme.com', contactEmail: 'typed@acme.com', status: 'new',
    });
    expect(res.body.newCount).toBe(1);
  });

  it('a pre-v3 lead (only `email`) still renders both addresses', async () => {
    // Historical leads carry no identityEmail/contactEmail. Both must fall back to
    // the legacy field rather than rendering two blanks in the operator panel.
    store.writes.set('demo_requests/legacy-1', {
      id: 'legacy-1', name: 'Old Lead', email: 'legacy@acme.com',
      status: 'new', createdAt: '2026-01-01T00:00:00Z',
    });
    const items = (await listAsAdmin()).body.items as unknown as Array<Record<string, string>>;
    expect(items[0]).toMatchObject({
      identityEmail: 'legacy@acme.com',
      contactEmail:  'legacy@acme.com',
    });
  });

  it('an empty collection renders as an empty inbox, not an error', async () => {
    const res = await listAsAdmin();
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });
});
