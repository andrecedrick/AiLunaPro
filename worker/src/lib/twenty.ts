/**
 * Twenty CRM — worker-side REST client (one-way push).
 *
 * Twenty is AiLunaPro's OWN sales CRM. Only AiLunaPro's own prospects go here:
 * tenant contacts in `organizations/{orgId}/contacts` are customer-owned data and
 * are NEVER pushed — copying them into our sales workspace would be a purpose
 * change on data we only process on the customer's behalf.
 *
 * ── SCHEMA CAVEAT (read before changing the mapping) ───────────────────────────
 * Twenty has NO static API schema: every workspace exposes its own object and
 * field names, and the authoritative reference lives behind
 * Settings → API & Webhooks in the workspace itself. The field names below follow
 * Twenty's DEFAULT schema and are therefore UNVERIFIED against this workspace.
 *
 * They are deliberately isolated in the three `*Payload` builders so that a
 * mismatch is a one-function correction rather than a rewrite. A wrong field name
 * produces a 4xx, which surfaces as a `crm_push_failed` critical alert — never a
 * lost lead, because the lead is already durable in Firestore before any of this
 * runs.
 *
 * Auth: `Authorization: Bearer <TWENTY_API_KEY>`. Server-side only, never VITE_.
 */

import { splitE164 } from './phone-country';

export interface TwentyResult<T = string> {
  ok:     boolean;
  /** Created record id when ok. */
  id?:    T;
  error?: string;
}

/**
 * Normalise the configured base URL to a bare origin.
 *
 * TWENTY_BASE_URL was set to `https://api.twenty.com/rest`, which already carries
 * the `/rest` prefix this client appends — producing `/rest/rest/companies`.
 * Twenty reads the second segment as a record id and rejects the call with
 * `'companies' is not a valid UUID`, so every create failed with a 400 that named
 * a field nobody sent. Both `https://host` and `https://host/rest` are now
 * accepted, because the value is operator-configured and either is a reasonable
 * thing to paste.
 */
export const base = (url: string): string => url.replace(/\/+$/, '').replace(/\/rest$/i, '');

/**
 * POST a record and return its id.
 *
 * The provider error is PII-scrubbed before it can reach a log or the alert
 * panel: only a short reason survives, with any email address redacted. A CRM
 * push carries name/email/phone, so an unscrubbed error body would leak the whole
 * lead into an operator surface.
 */
async function post(
  apiKey: string,
  baseUrl: string,
  path: string,
  body: Record<string, unknown>,
): Promise<TwentyResult> {
  let res: Response;
  try {
    res = await fetch(`${base(baseUrl)}${path}`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message.slice(0, 140) : 'network error' };
  }

  const raw = await res.text().catch(() => '');

  if (!res.ok) {
    // Twenty's real error shape is {statusCode, messages:[...], error}. Reading
    // only `message`/`error` surfaced the useless half ("UNAUTHENTICATED") and
    // dropped the diagnostic half ("Token invalid."), which is exactly the part
    // that identifies a wrong field name. `messages` is preferred.
    return { ok: false, error: `Twenty ${path} failed (HTTP ${res.status}): ${scrub(raw)}` };
  }

  // A create that returns no id is NOT a success. This previously returned
  // `{ ok: true, id: '' }` whenever the body did not match the assumed wrapper —
  // so a 2xx with an unexpected shape looked like a completed push, stored an
  // empty id as the idempotency key, and raised no alert. Silent, and the exact
  // failure mode a CRM push must never have.
  const id = extractId(raw);
  if (!id) {
    return { ok: false, error: `Twenty ${path} returned HTTP ${res.status} with no record id: ${scrub(raw)}` };
  }
  return { ok: true, id };
}

/**
 * PII-scrub a provider body before it reaches a log or the alert panel. A CRM
 * push carries name/email/phone, so an unscrubbed echo would leak the whole lead
 * into an operator surface.
 */
function scrub(raw: string): string {
  let msg = raw;
  try {
    const j = JSON.parse(raw) as Record<string, unknown>;
    const messages = Array.isArray(j.messages) ? j.messages.join('; ') : '';
    msg = String(messages || j.message || j.error || raw);
  } catch { /* non-JSON body → use the raw text */ }
  return msg.replace(/[\w.+-]+@[\w.-]+\.\w+/g, '<email>').replace(/\s+/g, ' ').trim().slice(0, 200);
}

/**
 * Pull the created record's id out of whatever shape Twenty returns.
 *
 * Tolerates the three plausible wrappers rather than assuming one:
 *   { data: { createPerson: { id } } } · { data: { id } } · { id }
 * Returns '' when none matches, which the caller treats as a failure.
 */
export function extractId(raw: string): string {
  let json: Record<string, unknown>;
  try { json = JSON.parse(raw) as Record<string, unknown>; } catch { return ''; }

  const asId = (v: unknown): string =>
    (v && typeof v === 'object' && typeof (v as { id?: unknown }).id === 'string')
      ? (v as { id: string }).id
      : '';

  if (typeof json.id === 'string') return json.id;
  const data = json.data;
  if (data && typeof data === 'object') {
    const direct = asId(data);
    if (direct) return direct;
    for (const v of Object.values(data as Record<string, unknown>)) {
      const nested = asId(v);
      if (nested) return nested;
    }
  }
  return '';
}

/** Split a display name into Twenty's firstName / lastName pair. */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

/**
 * Split E.164 into Twenty's calling-code + national-number pair.
 * A number that is not in international form yields an empty calling code, which
 * Twenty accepts — better than inventing a prefix.
 */
export function splitPhone(e164: string, isoCountry: string): { callingCode: string; number: string; countryCode: string } {
  // Delegates to the shared dial table. A regex like /^\+(\d{1,4})(\d+)$/ is
  // greedy and splits "+33612345678" into "+3361" / "2345678".
  const { callingCode, national } = splitE164(e164);
  return { callingCode, number: national, countryCode: isoCountry };
}

export interface TwentyLead {
  name:          string;
  contactEmail:  string;
  identityEmail: string;
  phone:         string;
  countryCode:   string;
  phoneCountry:  string;
  company:       string;
  message:       string;
  source:        string;
  createdAt:     string;
  leadId:        string;
}

/* ── Payload builders — the ONLY place the Twenty schema is assumed ─────────── */

export function companyPayload(lead: TwentyLead): Record<string, unknown> {
  return { name: lead.company };
}

export function personPayload(lead: TwentyLead, companyId?: string): Record<string, unknown> {
  const { firstName, lastName } = splitName(lead.name);
  const phone = splitPhone(lead.phone, lead.phoneCountry || lead.countryCode);
  return {
    name:   { firstName, lastName },
    emails: {
      primaryEmail:              lead.contactEmail,
      // The account address is kept as a secondary so an operator can reconcile
      // the prospect with their AiLunaPro login without a second record.
      additionalEmails: lead.identityEmail && lead.identityEmail !== lead.contactEmail
        ? [lead.identityEmail]
        : [],
    },
    phones: {
      primaryPhoneNumber:       phone.number,
      primaryPhoneCallingCode:  phone.callingCode,
      primaryPhoneCountryCode:  phone.countryCode,
    },
    ...(companyId ? { companyId } : {}),
  };
}

export function notePayload(lead: TwentyLead): Record<string, unknown> {
  return {
    title: `Demo request — ${lead.source}`,
    bodyV2: {
      markdown: [
        `**What they want to discuss**`,
        lead.message || '(no message provided)',
        '',
        `Contact email: ${lead.contactEmail}`,
        `Account email: ${lead.identityEmail}`,
        `Phone: ${lead.phone}`,
        `Country: ${lead.countryCode || '-'} (number: ${lead.phoneCountry || '-'})`,
        `Requested at: ${lead.createdAt}`,
        `Lead id: ${lead.leadId}`,
      ].join('\n'),
    },
  };
}

/**
 * Note → record links.
 *
 * noteTargets CANNOT be written inline on the note: Twenty answers
 * "One-to-many relation noteTargets field does not support write operations."
 * Each link is its own record, created after the note exists.
 */
export function noteTargetPayload(noteId: string, personId: string, companyId?: string): Record<string, unknown> {
  // The relation columns are target-PREFIXED. Confirmed against this workspace's
  // OpenAPI document (components.schemas.NoteTarget), which declares noteId,
  // targetPersonId, targetCompanyId and targetOpportunityId. The unprefixed names
  // are rejected: "Object noteTarget doesn't have any \"personId\" field."
  return {
    noteId,
    targetPersonId: personId,
    ...(companyId ? { targetCompanyId: companyId } : {}),
  };
}

/* ── Public API ─────────────────────────────────────────────────────────────── */

export const createCompany = (k: string, u: string, lead: TwentyLead) => post(k, u, '/rest/companies', companyPayload(lead));
export const createPerson  = (k: string, u: string, lead: TwentyLead, companyId?: string) => post(k, u, '/rest/people', personPayload(lead, companyId));
export const createNote    = (k: string, u: string, lead: TwentyLead) => post(k, u, '/rest/notes', notePayload(lead));
export const createNoteTarget = (k: string, u: string, noteId: string, personId: string, companyId?: string) =>
  post(k, u, '/rest/noteTargets', noteTargetPayload(noteId, personId, companyId));
