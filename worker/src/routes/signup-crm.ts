/**
 * Signup → CRM.
 *
 * A registered user was never reaching either CRM: `upsertLeadContact` and the
 * Twenty client had exactly ONE caller between them (demo-request.ts), so every
 * account created through #/signup existed only as a Firebase user plus its
 * org/member documents. This route is the missing link.
 *
 * POST /api/signup/crm — called by the client immediately after a successful
 * signup. Server-side on purpose: the browser must never write CRM records
 * directly, and membership is re-verified here rather than trusted.
 *
 * Runs the SAME pipeline as a demo request:
 *   organizations/{orgId}/contacts  →  Twenty Company → Person → Note link
 *
 * IDEMPOTENT: upsertLeadContact dedupes on emailKey, and the contact carries the
 * Twenty ids, so a retry (double submit, reload, re-signup of the same address)
 * updates the existing records instead of creating a second person.
 *
 * NEVER fatal to signup. The account already exists by the time this is called;
 * failing the response would tell a user their signup broke when it did not.
 * Every failure raises a durable alert instead.
 */

import { Hono, type Context } from 'hono';
import { verifyIdTokenClaims } from '../middleware/auth';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { recordBillingAlert } from '../lib/billing-alerts';
import { upsertLeadContact } from '../lib/lead-contact';
import { normalizePhone, isValidPhone } from '../lib/support-shared';
import { phoneCountryIso } from '../lib/phone-country';
import { createCompany, createPerson, createNote, createNoteTarget, type TwentyLead } from '../lib/twenty';
import { upsertCompany, linkTwentyCompany } from '../lib/company-registry';
import type { AppEnv } from '../index';

interface Bindings {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
  TWENTY_API_KEY?: string;
  TWENTY_BASE_URL?: string;
}

const signupCrm = new Hono<AppEnv>();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function gate(c: Context<AppEnv>, orgId: string): Promise<{ uid: string; email?: string } | Response> {
  const env = c.env as unknown as Bindings;
  c.header('Cache-Control', 'no-store');
  const authHeader = c.req.header('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const claims = await verifyIdTokenClaims(bearer, env.FIREBASE_PROJECT_ID);
  if (!claims) return c.json({ error: 'Sign in required.', code: 'AUTH_REQUIRED' }, 401);
  if (!orgId) return c.json({ error: 'orgId required.', code: 'ORG_REQUIRED' }, 400);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 500);
  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/members/${claims.uid}`);
  if (!member) return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
  return { uid: claims.uid, email: claims.email };
}

signupCrm.post('/api/signup/crm', async c => {
  const env = c.env as unknown as Bindings;
  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { c.header('Cache-Control', 'no-store'); return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const name    = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  let company   = typeof body.company === 'string' ? body.company.trim().slice(0, 120) : '';
  // The signup form makes company mandatory, but it reaches this route through a
  // sessionStorage stash that a reload, a private-mode tab or a resumed invite can
  // lose. Falling back to the workspace name means a prospect can never land in
  // the CRM as "Company —" again: it is the same self-reported organisation the
  // account holder typed on the very next screen.
  if (!company) {
    const org = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}`).catch(() => null);
    company = typeof org?.name === 'string' ? org.name.trim().slice(0, 120) : '';
  }
  // Identity is the VERIFIED token email — never the client-supplied value.
  const email = (g.email ?? '').trim().toLowerCase().slice(0, 200);
  if (!EMAIL_RE.test(email)) return c.json({ error: 'Verified email required.', code: 'INVALID_EMAIL' }, 400);

  // Phone is optional at signup: a failed CRM write must never block account
  // creation, and an account with no number is still a prospect worth having.
  // When present it is validated and normalised with the SAME helpers the demo
  // request and support tickets use, so the CRM holds one phone format.
  const rawPhone = typeof body.phone === 'string' ? body.phone : '';
  const phone = rawPhone.trim() && isValidPhone(rawPhone) ? normalizePhone(rawPhone) : '';

  // Country of the request from Cloudflare's edge geo — unspoofable by the form.
  const countryCode = (c.req.header('CF-IPCountry') ?? '').trim().toUpperCase();
  const phoneCountry = phoneCountryIso(phone);

  let contactId = '';
  let created = false;
  let twentyPersonId = '';
  let twentyCompanyId = '';

  // Company registry entry FIRST, so the contact is born linked rather than
  // needing a reconciliation pass to attach it later.
  let companyId = '';
  try {
    const reg = await upsertCompany(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      orgId, name: company, source: 'signup', uid: g.uid,
    });
    companyId = reg.companyId;
    // The registry's stored spelling wins: an operator may already have corrected
    // this company's name, and a new signup must not reintroduce the old one.
    if (reg.name) company = reg.name;
  } catch (err) {
    console.warn('[signup-crm] company registry upsert failed:', err instanceof Error ? err.message : '');
  }

  try {
    const contact = await upsertLeadContact(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      orgId, name: name || email, contactEmail: email, identityEmail: email,
      phone, countryCode, phoneCountry, company, companyId,
      message: '', uid: g.uid, source: 'signup',
    });
    contactId = contact.contactId;
    created = contact.created;
    twentyPersonId = contact.twentyPersonId;
    twentyCompanyId = contact.twentyCompanyId;
  } catch (err) {
    await recordBillingAlert(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      kind: 'lead_contact_failed', severity: 'critical', orgId, refId: `signup_${g.uid}`,
      message: 'Signup completed but the user did NOT reach the internal CRM',
      context: { reason: (err instanceof Error ? err.message : 'unknown').slice(0, 140) },
    }).catch(() => { /* never fail signup */ });
    return c.json({ ok: false, code: 'CRM_FAILED' });
  }

  // ── Twenty CRM push ────────────────────────────────────────────────────────
  // Same sequence and same idempotency ledger as the demo-request path: a stored
  // twentyPersonId means this person already exists in Twenty.
  if (env.TWENTY_API_KEY && env.TWENTY_BASE_URL) {
    const key = env.TWENTY_API_KEY, url = env.TWENTY_BASE_URL;
    const contactPath = `organizations/${orgId}/contacts/${contactId}`;
    const lead: TwentyLead = {
      name: name || email, contactEmail: email, identityEmail: email,
      phone, countryCode, phoneCountry, company,
      message: 'Created an AiLunaPro account.',
      source: 'signup', createdAt: new Date().toISOString(), leadId: `signup_${g.uid}`,
    };
    try {
      if (!twentyPersonId) {
        // The Twenty company id is read from the REGISTRY, not from this contact.
        // Reading it off the contact meant the second person at a company had no
        // id to find and created a SECOND Twenty company — one duplicate per
        // colleague who signed up. The registry holds one id per company.
        if (company && !twentyCompanyId && companyId) {
          const reg = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/companies/${companyId}`);
          if (reg && typeof reg.twentyCompanyId === 'string') twentyCompanyId = reg.twentyCompanyId;
        }
        if (company && !twentyCompanyId) {
          const co = await createCompany(key, url, lead);
          if (!co.ok) throw new Error(co.error ?? 'company create failed');
          twentyCompanyId = co.id ?? '';
          // Record it on the company, so the next colleague reuses it.
          await linkTwentyCompany(env.FIREBASE_SERVICE_ACCOUNT_JSON, orgId, companyId, twentyCompanyId)
            .catch(err => console.warn('[signup-crm] twenty link failed:', err instanceof Error ? err.message : ''));
        }
        const person = await createPerson(key, url, lead, twentyCompanyId || undefined);
        if (!person.ok) throw new Error(person.error ?? 'person create failed');
        twentyPersonId = person.id ?? '';
        // Persist BEFORE the note so a later failure cannot double-create.
        await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, contactPath,
          { twentyPersonId, twentyCompanyId }, { merge: true });

        const note = await createNote(key, url, lead);
        if (!note.ok) throw new Error(note.error ?? 'note create failed');
        const link = await createNoteTarget(key, url, note.id ?? '', twentyPersonId, twentyCompanyId || undefined);
        if (!link.ok) throw new Error(link.error ?? 'note link failed');
      }
    } catch (err) {
      await recordBillingAlert(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
        kind: 'crm_push_failed', severity: 'critical', orgId, refId: `signup_${g.uid}`,
        message: 'Signup reached the internal CRM but NOT Twenty — sales will not see this account',
        context: { reason: (err instanceof Error ? err.message : 'unknown').slice(0, 140), source: 'signup' },
      }).catch(() => { /* never fail signup */ });
    }
  } else {
    console.warn('[signup-crm] Twenty not configured — account not pushed:', g.uid);
  }

  return c.json({ ok: true, contactId, created, twentyPersonId, twentyCompanyId });
});

export default signupCrm;
