/**
 * User feedback — shared validation + sanitisation (S1).
 *
 * Anonymous, no-PII product feedback captured after a tool result (quote /
 * diagnostic / roi / audit). The worker is the only writer; this module is the
 * server-authoritative boundary: it validates shape, clamps enums, and scrubs
 * the two free-text fields. NEVER stores uid / email / orgId — feedback stays
 * anonymous even when submitted from an authenticated surface.
 *
 * Kept separate from support tickets (S2) and Luna (S3) by design: feedback has
 * its own collection, endpoint, and shape.
 */

export const FEEDBACK_SOURCES = ['quote', 'diagnostic', 'roi', 'audit'] as const;
export type FeedbackSource = typeof FEEDBACK_SOURCES[number];

export const FEEDBACK_DIFFICULTIES = ['easy', 'ok', 'hard'] as const;
export type FeedbackDifficulty = typeof FEEDBACK_DIFFICULTIES[number];

const TEXT_MAX = 500;
const RETENTION_DAYS = 90;

export interface FeedbackInput {
  source?:       unknown;
  satisfaction?: unknown;
  difficulty?:   unknown;
  blocker?:      unknown;  // "What prevented you from going further?"
  suggestion?:   unknown;
}

export interface ValidatedFeedback {
  source:       FeedbackSource;
  satisfaction: number;                 // integer 1..5
  difficulty:   FeedbackDifficulty | null;
  blocker:      string | null;
  suggestion:   string | null;
}

/**
 * Scrub a free-text field to a safe, no-markup, length-capped string:
 * strip control characters (codepoint filter — no control-char regex), drop
 * angle brackets to defang markup, collapse whitespace, trim, cap length.
 * Returns null for empty/whitespace-only input.
 */
export function sanitizeText(raw: string, max = TEXT_MAX): string | null {
  let out = '';
  for (const ch of raw) {
    const cp = ch.codePointAt(0) ?? 0;
    // Drop C0/C1 control chars except tab/newline (which we normalise below).
    if (cp < 0x20 && ch !== '\t' && ch !== '\n' && ch !== '\r') continue;
    if (cp >= 0x7f && cp <= 0x9f) continue;
    if (ch === '<' || ch === '>') continue; // defang markup
    out += ch;
  }
  out = out.replace(/\s+/g, ' ').trim();
  if (out.length === 0) return null;
  return out.length > max ? out.slice(0, max) : out;
}

/**
 * Validate the request body. Satisfaction (1..5 integer) is required; everything
 * else is optional. Returns the cleaned, no-PII feedback or a short error.
 */
export function validateFeedback(
  body: FeedbackInput,
): { ok: true; feedback: ValidatedFeedback } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'feedback is required' };

  if (typeof body.source !== 'string' || !FEEDBACK_SOURCES.includes(body.source as FeedbackSource)) {
    return { ok: false, error: 'Invalid feedback source' };
  }
  const source = body.source as FeedbackSource;

  const sat = typeof body.satisfaction === 'number' ? body.satisfaction : NaN;
  if (!Number.isInteger(sat) || sat < 1 || sat > 5) {
    return { ok: false, error: 'satisfaction must be an integer 1–5' };
  }

  let difficulty: FeedbackDifficulty | null = null;
  if (body.difficulty !== undefined && body.difficulty !== null && body.difficulty !== '') {
    if (typeof body.difficulty !== 'string' || !FEEDBACK_DIFFICULTIES.includes(body.difficulty as FeedbackDifficulty)) {
      return { ok: false, error: 'Invalid difficulty' };
    }
    difficulty = body.difficulty as FeedbackDifficulty;
  }

  const blocker = typeof body.blocker === 'string' ? sanitizeText(body.blocker) : null;
  const suggestion = typeof body.suggestion === 'string' ? sanitizeText(body.suggestion) : null;

  return { ok: true, feedback: { source, satisfaction: sat, difficulty, blocker, suggestion } };
}

export function generateFeedbackId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function feedbackExpiresAt(now = Date.now()): string {
  return new Date(now + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
