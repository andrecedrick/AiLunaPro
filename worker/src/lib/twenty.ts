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

/** Strip the workspace host's trailing slash so path joins stay predictable. */
const base = (url: string): string => url.replace(/\/+$/, '');

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

  if (!res.ok) {
    let detail = '';
    try {
      const raw = await res.text();
      let msg = raw;
      try {
        const j = JSON.parse(raw) as Record<string, unknown>;
        msg = String(j.message ?? j.error ?? raw);
      } catch { /* non-JSON body → use the raw text */ }
      detail = msg.replace(/[\w.+-]+@[\w.-]+\.\w+/g, '<email>').replace(/\s+/g, ' ').trim().slice(0, 140);
    } catch { /* body unreadable → status only */ }
    return { ok: false, error: `Twenty ${path} failed (HTTP ${res.status})${detail ? `: ${detail}` : ''}` };
  }

  try {
    const json = await res.json() as { data?: Record<string, { id?: string }> };
    // Twenty wraps a created record as { data: { createPerson: { id } } } (or the
    // equivalent key for the object). Take the first id we find rather than
    // hard-coding the wrapper key, which also varies by object name.
    const id = Object.values(json.data ?? {}).map(v => v?.id).find(Boolean);
    return { ok: true, id: id ?? '' };
  } catch {
    // Created but unparseable: still a success — do not retry and double-create.
    return { ok: true, id: '' };
  }
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
    city: lead.countryCode,
    ...(companyId ? { companyId } : {}),
  };
}

export function notePayload(lead: TwentyLead, personId: string, companyId?: string): Record<string, unknown> {
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
    noteTargets: [
      { personId },
      ...(companyId ? [{ companyId }] : []),
    ],
  };
}

/* ── Public API ─────────────────────────────────────────────────────────────── */

export const createCompany = (k: string, u: string, lead: TwentyLead) => post(k, u, '/rest/companies', companyPayload(lead));
export const createPerson  = (k: string, u: string, lead: TwentyLead, companyId?: string) => post(k, u, '/rest/people', personPayload(lead, companyId));
export const createNote    = (k: string, u: string, lead: TwentyLead, personId: string, companyId?: string) => post(k, u, '/rest/notes', notePayload(lead, personId, companyId));
