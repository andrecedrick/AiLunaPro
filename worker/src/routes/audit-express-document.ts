import { Hono, type Context } from 'hono';
import type { AppEnv } from '../index';
import { verifyIdToken } from '../middleware/auth';
import { firestoreGet } from '../lib/firestoreAdmin';
import { assembleSnapshot, extractPageSignals, type PageCapture } from '../lib/audit-express-extract';
import { understand } from '../lib/audit-express-understanding';

/**
 * B5 — Document upload → audit analysis (decision resolved 2026-06-11:
 * deterministic/rule-based only; K5 RAG/LLM remains a separate future item).
 *
 * POST /api/audit-express/analyze-document — authed + org-gated. The CLIENT
 * extracts the text (raw bytes never reach the server); this route runs the
 * SAME deterministic signal pipeline as the website analysis (extractPageSignals
 * → assembleSnapshot → understand, all PII-scrubbed) and returns the snapshot.
 * ANALYZE → DERIVE → DISCARD: nothing is persisted here; the client feeds the
 * snapshot into the existing Audit Express save path exactly like a URL run.
 *
 * v1 formats: plain text / markdown (client-side). Caps: 200 KB of text.
 */

interface Bindings {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
}

export const MAX_DOC_TEXT_CHARS = 200_000;

const doc = new Hono<AppEnv>();

async function gate(c: Context<AppEnv>, orgId: string): Promise<{ uid: string } | Response> {
  const env = c.env as unknown as Bindings;
  c.header('Cache-Control', 'no-store');
  const authHeader = c.req.header('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const uid = await verifyIdToken(bearer, env.FIREBASE_PROJECT_ID);
  if (!uid) return c.json({ error: 'Sign in required.', code: 'AUTH_REQUIRED' }, 401);
  if (!orgId) return c.json({ error: 'orgId required.', code: 'ORG_REQUIRED' }, 400);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 500);
  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/members/${uid}`);
  if (!member) return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
  return { uid };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Filename → bounded, path-free, URL-safe label (display/source id only). */
function sanitizeDocName(raw: unknown): string {
  const base = (typeof raw === 'string' ? raw : '').split(/[\\/]/).pop() ?? '';
  const clean = base.replace(/[^\w.\- ]+/g, '').trim().slice(0, 80);
  return clean || 'document.txt';
}

/**
 * Plain text / markdown → minimal pseudo-HTML so the EXISTING page-signal
 * extractor (titles, headings, keyword tokenizer, caps, PII scrub) applies
 * unchanged — one signal pipeline, zero drift.
 */
export function documentTextToHtml(text: string): string {
  const lines = text.split(/\r?\n/);
  const firstLine = lines.find(l => l.trim().length > 0)?.trim().slice(0, 120) ?? 'Document';
  const headings = lines
    .map(l => /^#{1,6}\s+(.+)$/.exec(l.trim())?.[1])
    .filter((h): h is string => Boolean(h))
    .slice(0, 12);
  const headingTags = headings.map(h => `<h2>${escapeHtml(h)}</h2>`).join('\n');
  return `<html><head><title>${escapeHtml(firstLine)}</title></head><body>\n${headingTags}\n<p>${escapeHtml(text)}</p>\n</body></html>`;
}

doc.post('/api/audit-express/analyze-document', async c => {
  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { c.header('Cache-Control', 'no-store'); return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const rawText = typeof body.text === 'string' ? body.text : '';
  const text = rawText.slice(0, MAX_DOC_TEXT_CHARS).trim();
  if (!text) return c.json({ error: 'Document text is required.', code: 'INVALID_TEXT' }, 400);

  const name = sanitizeDocName(body.name);
  const canonicalUrl = `document://${encodeURIComponent(name)}`;

  const capture: PageCapture = {
    url: canonicalUrl,
    status: 200,
    contentType: 'text/plain',
    truncated: rawText.length > MAX_DOC_TEXT_CHARS,
    signals: extractPageSignals(documentTextToHtml(text)),
  };

  const snapshot = assembleSnapshot(canonicalUrl, [capture]);
  snapshot.understanding = understand(snapshot);

  // Derive → return → discard: no persistence of the text or the snapshot here.
  return c.json({ ...snapshot, createdAt: new Date().toISOString() });
});

export default doc;
