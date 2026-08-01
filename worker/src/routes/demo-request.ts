import { Hono, type Context } from 'hono';
import type { AppEnv } from '../index';
import { verifyIdTokenClaims } from '../middleware/auth';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { recordBillingAlert, sendObservableEmail } from '../lib/billing-alerts';
import { upsertLeadContact } from '../lib/lead-contact';
import { upsertCompany, linkTwentyCompany } from '../lib/company-registry';
import { normalizePhone, isValidPhone } from '../lib/support-shared';
import { phoneCountryIso } from '../lib/phone-country';
import { createCompany, createLinkedPerson, createNote, createNoteTarget, type TwentyLead } from '../lib/twenty';

/**
 * B2.2 — Demo-request capture (authed dashboard CTA).
 *
 * POST /api/demo-request — persists a demo request to the worker-only
 * `demo_requests/{id}` collection (client read/write denied in firestore.rules,
 * same discipline as public_diagnostics / public_roi_calculations).
 * The user is authenticated and explicitly asking to be contacted — the request
 * itself is the consent; we store only what the form collects plus org/uid
 * context for follow-up. No PII in logs.
 */

interface Bindings {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
  ADMIN_EMAIL?: string;
  TWENTY_API_KEY?: string;
  TWENTY_BASE_URL?: string;
  SEQUENZY_API_KEY?: string;
  APP_BASE_URL?: string;
}

/** Where the confirmation email's CTA sends the prospect. */
const SIGNUP_PATH = '/#/signup';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Duplicate window. A double-clicked button, a retried request or an impatient
 * resubmit must produce ONE lead, ONE alert and ONE admin email — never a second
 * notification for work the operator has already seen.
 */
const DEDUP_WINDOW_MS = 10 * 60 * 1000;

const demoRequest = new Hono<AppEnv>();

/**
 * Deterministic document id: a content fingerprint plus the time bucket it landed
 * in. Identical content from the same user inside one bucket resolves to the SAME
 * id, so the existence check below collapses it to a single lead.
 *
 * The bucket is part of the id on purpose: a genuine new request from the same
 * person weeks later falls into a different bucket and gets its own document, so
 * deduplication can never overwrite an older lead. Bucket boundaries are handled
 * by also probing the previous bucket (see below) — otherwise two clicks either
 * side of a boundary would slip through.
 */
async function fingerprint(parts: string[]): Promise<string> {
  const data = new TextEncoder().encode(parts.join('\u0000'));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}
const leadId = (fp: string, bucket: number): string => `dr_${fp}_${bucket}`;

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

demoRequest.post('/api/demo-request', async c => {
  const env = c.env as unknown as Bindings;
  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { c.header('Cache-Control', 'no-store'); return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  // Validate at the boundary; trim + cap lengths so the store stays bounded.
  const name    = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  // Reassigned below when the company registry returns a canonical spelling.
  let company = typeof body.company === 'string' ? body.company.trim().slice(0, 120) : '';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';
  // Two DISTINCT emails, deliberately kept apart:
  //
  //  identityEmail — the VERIFIED token email. Never client-supplied, because an
  //    authenticated member could otherwise file a request as anyone. This is WHO
  //    the lead is.
  //  contactEmail  — the "Work email" the user typed in the modal. This is WHERE
  //    they asked to be reached, and it is frequently NOT their login address.
  //
  // The typed value used to be discarded outright: identity silently replaced the
  // contact address, so the confirmation went to the account mailbox and the
  // operator followed up on an address the prospect never nominated. A field the
  // UI asks for must not be thrown away.
  //
  // contactEmail is untrusted input, so it is validated and never used for
  // identity — only for delivery. Invalid or absent → fall back to identityEmail
  // so a lead is never lost over a typo.
  const bodyEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
  const identityEmail = g.email ? g.email.trim().toLowerCase().slice(0, 200) : bodyEmail;
  if (!name) return c.json({ error: 'Name is required.', code: 'INVALID_NAME' }, 400);
  if (!EMAIL_RE.test(identityEmail)) return c.json({ error: 'A valid email is required.', code: 'INVALID_EMAIL' }, 400);
  const contactEmail = EMAIL_RE.test(bodyEmail) ? bodyEmail : identityEmail;

  // Phone is REQUIRED: a sales operator calls a demo lead back, and a lead with no
  // reachable number is half a lead. Validated at the boundary with the SAME
  // helpers support tickets use (support-shared), so there is one phone format in
  // the system rather than a second, subtly different one.
  //
  // There is no verified phone on the token, so this is always client-supplied and
  // is normalised before storage: '+33 6 12 34 56 78' and '+33612345678' must not
  // become two different CRM values.
  const rawPhone = typeof body.phone === 'string' ? body.phone : '';
  if (!rawPhone.trim()) return c.json({ error: 'Phone number is required.', code: 'INVALID_PHONE' }, 400);
  if (!isValidPhone(rawPhone)) return c.json({ error: 'A valid phone number is required.', code: 'INVALID_PHONE' }, 400);
  const phone = normalizePhone(rawPhone);

  // Country of the request, from Cloudflare's edge geo header — the same source
  // support tickets use. Never client-supplied, so it cannot be spoofed by the
  // form. '' when the header is absent (local dev, unknown region).
  const countryCode = (c.req.header('CF-IPCountry') ?? '').trim().toUpperCase();
  // ISO country the NUMBER belongs to, by longest dialling-prefix match. Distinct
  // from countryCode: a French number can be submitted from anywhere, so both are
  // stored. '' when the prefix is unknown or the number is national — never a
  // guess, because a wrong country mis-routes a sales call.
  const phoneCountry = phoneCountryIso(phone);

  // ── Duplicate protection ───────────────────────────────────────────────────
  // Probe the current AND previous bucket so two clicks either side of a bucket
  // boundary still collapse to one lead. A hit short-circuits BEFORE any alert or
  // email, so a duplicate can never produce a second bell entry or a second admin
  // email. The response stays 200 with the original id — the customer sees the
  // same success either way; only the operator side is de-duplicated.
  const now = Date.now();
  const bucket = Math.floor(now / DEDUP_WINDOW_MS);
  // contactEmail is part of the fingerprint: resubmitting with a corrected work
  // email is a DIFFERENT request the operator needs to see, not a duplicate.
  const fp = await fingerprint([g.uid, identityEmail, contactEmail, phone, company, message]);

  for (const b of [bucket, bucket - 1]) {
    const candidate = leadId(fp, b);
    let existing: unknown = null;
    try { existing = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `demo_requests/${candidate}`); }
    catch (err) {
      // A failed probe must not block a lead: fall through and write. Worst case
      // is a duplicate lead, which is strictly better than a lost one.
      console.warn('[demo-request] duplicate probe failed (writing anyway):', err instanceof Error ? err.message : err);
      break;
    }
    if (existing) return c.json({ ok: true, id: candidate, duplicate: true });
  }

  const id = leadId(fp, bucket);
  const nowIso = new Date(now).toISOString();
  const doc = {
    id,
    name,
    // `email` is RETAINED as the identity address so pre-v3 leads and any reader
    // that still expects it keep working. identityEmail duplicates it under an
    // unambiguous name; contactEmail is the new, previously-discarded value.
    email:         identityEmail,
    identityEmail,
    contactEmail,
    phone,
    countryCode,
    phoneCountry,
    company: company || null,
    message: message || null,
    orgId,
    uid: g.uid,
    source: 'dashboard-cta',
    // ── Lead-management fields ──
    status: 'new',        // new → contacted → qualified → closed (operator-driven)
    owner: '',            // unassigned until an operator picks the lead up
    lastContactAt: '',    // set when an operator first replies; '' = never contacted
    schemaVersion: 4,
    createdAt: nowIso,
  };

  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `demo_requests/${id}`, doc as unknown as Parameters<typeof firestoreSet>[2]);
  } catch (err) {
    console.error('[demo-request] firestoreSet failed:', err instanceof Error ? err.message : 'unknown');
    return c.json({ error: 'Could not record your request. Please try again.', code: 'STORE_FAILED' }, 500);
  }

  // The lead is now safe in Firestore. Everything below is best-effort ALERTING:
  // it must never turn a captured lead into a 500 the customer sees.
  //
  // Until this existed the route stopped at the write above — the doc landed in a
  // worker-only collection that NOTHING read, so a commercial lead was invisible
  // to the operator: no bell entry, no alert, no email, no admin surface.
  //
  // No PII in the durable alert / bell title (same posture as feedback + tickets).
  // The name/email/company travel only in the admin email and the gated
  // /api/platform/demo-requests panel.
  try {
    await recordBillingAlert(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      kind: 'demo_request_received', severity: 'warning', orgId, refId: id,
      message: 'New demo request — a customer asked to be contacted',
      context: { source: 'dashboard-cta', hasCompany: Boolean(company), hasMessage: Boolean(message) },
    });
  } catch (err) {
    // recordBillingAlert already swallows its own write failure internally, so
    // reaching here means the alerting path itself threw. Nothing durable can be
    // written at this point (recording that durable recording failed is circular),
    // so this log is the honest ceiling — deliberately console.error, not a silent
    // swallow, so `wrangler tail` shows it and the lead is still safely stored.
    console.error('[demo-request] ALERTING FAILED for a stored lead:', id, err instanceof Error ? err.message : err);
  }

  // Lead → CRM. A demo request IS a sales lead, and it used to stop at
  // `demo_requests`: the operator had to retype the prospect into Contacts by
  // hand, so a lead nobody got round to was silently never worked.
  //
  // Best-effort like the rest of this block — the lead is already stored and is
  // the source of truth, so a CRM failure must not 500 the customer. It must NOT
  // be silent either: upsertLeadContact throws, and the failure becomes a durable
  // alert routed to the Contacts page.
  let contact: Awaited<ReturnType<typeof upsertLeadContact>> | null = null;
  // Registry entry first, so the contact is born linked to a company record
  // rather than needing a later reconciliation pass to attach one.
  let registryCompanyId = '';
  try {
    const reg = await upsertCompany(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      orgId, name: company, source: 'demo_request', uid: g.uid,
    });
    registryCompanyId = reg.companyId;
    // The registry's spelling wins — an operator may already have corrected it.
    if (reg.name) company = reg.name;
  } catch (err) {
    console.warn('[demo-request] company registry upsert failed:', err instanceof Error ? err.message : '');
  }
  try {
    contact = await upsertLeadContact(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      orgId, name, contactEmail, identityEmail, phone, countryCode, phoneCountry,
      company, companyId: registryCompanyId, message, uid: g.uid, source: 'demo_request',
    });
  } catch (err) {
    await recordBillingAlert(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      kind: 'lead_contact_failed', severity: 'critical', orgId, refId: id,
      message: 'Demo lead captured but NOT added to Contacts — follow-up needs manual entry',
      context: { reason: (err instanceof Error ? err.message : 'unknown').slice(0, 140) },
    }).catch(() => { /* alert path already logs; never fail a stored lead */ });
  }

  // ── Twenty CRM push (one-way) ──────────────────────────────────────────────
  // Twenty is the SALES CRM and owns AiLunaPro's own prospects. Only this lead is
  // pushed — tenant contacts are customer-owned and never leave Firestore.
  //
  // Idempotency uses the Firestore contact as the ledger: it is deduped by email,
  // so a stored twentyPersonId means "this person already exists in Twenty". A
  // returning prospect therefore adds only a NOTE, never a second Person.
  //
  // Unconfigured key = feature off. That is a deliberate state, not a failure, so
  // it logs rather than raising a critical alert every single lead.
  if (!env.TWENTY_API_KEY || !env.TWENTY_BASE_URL) {
    console.warn('[demo-request] Twenty CRM not configured — lead not pushed:', id);
  } else if (contact) {
    const lead: TwentyLead = {
      name, contactEmail, identityEmail, phone, countryCode, phoneCountry,
      company, message, source: 'dashboard-cta', createdAt: nowIso, leadId: id,
    };
    const key = env.TWENTY_API_KEY, url = env.TWENTY_BASE_URL;
    const contactPath = `organizations/${orgId}/contacts/${contact.contactId}`;
    try {
      let personId  = contact.twentyPersonId;
      let companyId = contact.twentyCompanyId;

      if (!personId) {
        // Read the Twenty company id from the REGISTRY, not from this contact:
        // reading it off the contact gave the second person at a company nothing
        // to find, so they created a SECOND Twenty company — one duplicate per
        // colleague. The registry holds exactly one id per company.
        if (company && !companyId && registryCompanyId) {
          const reg = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/companies/${registryCompanyId}`);
          if (reg && typeof reg.twentyCompanyId === 'string') companyId = reg.twentyCompanyId;
        }
        // Same rule as signup: an empty company here is a DEFECT. Skipping the
        // company create handed Twenty an unlinked person, which Twenty then
        // filled from the email domain — the source of the CRM mismatch.
        if (!company) throw new Error('company missing at Twenty push — refusing to create an unlinked person');
        if (!companyId) {
          const co = await createCompany(key, url, lead);
          if (!co.ok) throw new Error(co.error ?? 'company create failed');
          companyId = co.id ?? '';
          await linkTwentyCompany(env.FIREBASE_SERVICE_ACCOUNT_JSON, orgId, registryCompanyId, companyId)
            .catch(err => console.warn('[demo-request] twenty link failed:', err instanceof Error ? err.message : ''));
        }
        const person = await createLinkedPerson(key, url, lead, companyId);
        if (!person.ok) throw new Error(person.error ?? 'person create failed');
        if (person.corrected) console.warn('[demo-request] Twenty had attached the wrong company; corrected:', person.id);
        personId = person.id ?? '';
        // Persist BEFORE the note: if the note then fails, a retry must not
        // create a second Person.
        await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, contactPath,
          { twentyPersonId: personId, twentyCompanyId: companyId }, { merge: true });
      }

      const note = await createNote(key, url, lead);
      if (!note.ok) throw new Error(note.error ?? 'note create failed');

      // noteTargets is a one-to-many relation and rejects inline writes
      // ("One-to-many relation noteTargets field does not support write
      // operations"), so each link is its own record created after the note.
      // Linking the note to the person is BEST-EFFORT and deliberately does not
      // fail the push. This workspace's noteTarget object exposes neither
      // `personId` nor `companyId` ("Object noteTarget doesn't have any
      // \"personId\" field"), and the correct relation field name could not be
      // determined — the collection is empty, so there is no record to inspect.
      //
      // Company, Person and Note all create successfully, and the note body
      // carries the contact email, phone, country, message and the Firestore lead
      // id. An unlinked note is findable and complete; losing the whole push over
      // a missing association would be strictly worse.
      // One link record carries both targets. The relation columns are
      // target-prefixed (targetPersonId / targetCompanyId) — see lib/twenty.ts.
      const link = await createNoteTarget(key, url, note.id ?? '', personId, companyId || undefined);
      if (!link.ok) throw new Error(link.error ?? 'note link failed');
    } catch (err) {
      await recordBillingAlert(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
        kind: 'crm_push_failed', severity: 'critical', orgId, refId: id,
        message: 'Demo lead captured but NOT pushed to Twenty CRM — sales will not see it',
        context: { reason: (err instanceof Error ? err.message : 'unknown').slice(0, 140) },
      }).catch(() => { /* never fail a stored lead */ });
    }
  }

  if (env.ADMIN_EMAIL) {
    await sendObservableEmail(env.FIREBASE_SERVICE_ACCOUNT_JSON, env.SEQUENZY_API_KEY, {
      to: env.ADMIN_EMAIL, slug: 'demo-request-admin',
      variables: {
        NAME:           name,
        // EMAIL is kept pointing at the ACTIONABLE address so the already-published
        // template keeps working unchanged; the two explicit names below let the
        // template show both without guessing which one it is holding.
        EMAIL:          contactEmail,
        IDENTITY_EMAIL: identityEmail,
        CONTACT_EMAIL:  contactEmail,
        PHONE:          phone,
        COUNTRY:        countryCode || '-',
        COMPANY:        company || '-',
        MESSAGE:        message || '-',
        ORG_ID:         orgId,
      },
      // Reply reaches the prospect on the address THEY nominated, not their login.
      replyTo: contactEmail,
    }, id);
  }

  // Confirmation to the PROSPECT, at the address they asked to be contacted on.
  // Sent after the admin email so a confirmation can never be the reason the
  // operator misses a lead. Failure raises its own notification_email_failed alert
  // via sendObservableEmail, distinguishable from the admin one by the template
  // slug carried in the alert context.
  await sendObservableEmail(env.FIREBASE_SERVICE_ACCOUNT_JSON, env.SEQUENZY_API_KEY, {
    to: contactEmail, slug: 'demo-request-confirmation',
    // CTA_URL makes the button destination CODE-controlled instead of hardcoded in
    // the Sequenzy template, which pointed at the public marketing site. The
    // template must use {{CTA_URL}} as the button href for this to take effect.
    variables: {
      NAME:    name,
      COMPANY: company || '-',
      CTA_URL: `${(env.APP_BASE_URL ?? 'https://audit.ailunapro.com').replace(/\/+$/, '')}${SIGNUP_PATH}`,
    },
    // Replies reach a human operator, not a no-reply void.
    ...(env.ADMIN_EMAIL ? { replyTo: env.ADMIN_EMAIL } : {}),
  }, `confirm_${id}`);

  return c.json({ ok: true, id, duplicate: false });
});

export default demoRequest;
