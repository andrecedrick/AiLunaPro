/**
 * Support tickets — shared validation + sanitisation (S2).
 *
 * A structured issue report (bug / question / billing). Hybrid: the worker
 * resolves the email from a verified token when authenticated, otherwise the
 * client must provide one. The worker is the only writer; this module is the
 * server-authoritative boundary: it clamps enums, scrubs the description +
 * context, and validates the email. No PII beyond the email is stored.
 *
 * Deliberately self-contained — NO import from feedback-shared (the two systems
 * stay decoupled by design).
 */

export const SUPPORT_TYPES = ['bug', 'question', 'billing'] as const;
export type SupportType = typeof SUPPORT_TYPES[number];

export const SUPPORT_PRIORITIES = ['low', 'medium', 'high'] as const;
export type SupportPriority = typeof SUPPORT_PRIORITIES[number];

const DESC_MAX = 2000;
const CTX_MAX = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SupportInput {
  type?:        unknown;
  description?: unknown;
  email?:       unknown;
  priority?:    unknown;
  context?:     unknown;
}

export interface SupportContext {
  route:      string | null;
  locale:     string | null;
  appVersion: string | null;
}

export interface ValidatedSupport {
  type:        SupportType;
  description: string;
  email:       string;
  priority:    SupportPriority | null;
  context:     SupportContext | null;
}

/**
 * Scrub free text: strip control chars (codepoint filter — no control-char
 * regex), drop angle brackets to defang markup, collapse whitespace, trim, cap.
 * Returns null for empty/whitespace-only input.
 */
export function sanitizeText(raw: string, max: number): string | null {
  let out = '';
  for (const ch of raw) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 0x20 && ch !== '\t' && ch !== '\n' && ch !== '\r') continue;
    if (cp >= 0x7f && cp <= 0x9f) continue;
    if (ch === '<' || ch === '>') continue;
    out += ch;
  }
  out = out.replace(/\s+/g, ' ').trim();
  if (out.length === 0) return null;
  return out.length > max ? out.slice(0, max) : out;
}

function cleanContext(raw: unknown): SupportContext | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const pick = (v: unknown) => (typeof v === 'string' ? sanitizeText(v, CTX_MAX) : null);
  const ctx: SupportContext = { route: pick(r.route), locale: pick(r.locale), appVersion: pick(r.appVersion) };
  if (ctx.route === null && ctx.locale === null && ctx.appVersion === null) return null;
  return ctx;
}

/**
 * Validate a ticket. `authedEmail` (the verified token email, if the request is
 * authenticated) takes precedence over any client-supplied email. Description +
 * type are required; an email is always required (auto from token, or provided).
 */
export function validateSupport(
  body: SupportInput,
  authedEmail?: string,
): { ok: true; ticket: ValidatedSupport } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'ticket is required' };

  if (typeof body.type !== 'string' || !SUPPORT_TYPES.includes(body.type as SupportType)) {
    return { ok: false, error: 'Invalid ticket type' };
  }
  const type = body.type as SupportType;

  if (typeof body.description !== 'string') return { ok: false, error: 'description is required' };
  const description = sanitizeText(body.description, DESC_MAX);
  if (!description) return { ok: false, error: 'description is required' };

  let priority: SupportPriority | null = null;
  if (body.priority !== undefined && body.priority !== null && body.priority !== '') {
    if (typeof body.priority !== 'string' || !SUPPORT_PRIORITIES.includes(body.priority as SupportPriority)) {
      return { ok: false, error: 'Invalid priority' };
    }
    priority = body.priority as SupportPriority;
  }

  // Authed email (verified) wins; otherwise the client must provide one.
  const rawEmail = authedEmail ?? (typeof body.email === 'string' ? body.email : '');
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Valid email is required' };

  return { ok: true, ticket: { type, description, email, priority, context: cleanContext(body.context) } };
}

export function generateSupportId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
