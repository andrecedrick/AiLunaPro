/**
 * Quote (Devis) generation route — Phase Q2.
 *
 *   POST /api/quote/generate
 *
 * Auth + org-membership + role gated (owner/admin/billing/member; client → 403).
 * Token-charged (consumeTokens 'quote.generation' = 50), deterministic estimate
 * (reuses scoreQuote from Q0), persisted under the org. No PDF, no email yet
 * (Q3/Q4). No Stripe change. No PII logging.
 *
 * Idempotency / no-double-charge:
 *   - Client sends a stable `quoteId` per estimate session.
 *   - If the quote doc already exists → return it WITHOUT charging.
 *   - consumeTokens is idempotent on eventId = `quote_gen_{quoteId}` (a repeat
 *     within the charge→persist race returns 0 consumed, never double-debits).
 *   - On insufficient funds (402) the failed usage marker is deleted so a later
 *     retry (after a top-up) charges correctly instead of silently succeeding.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  validateInputs,
  scoreQuote,
  type QuoteInputs,
  type QuoteCategory,
  type QuoteTier,
} from '../lib/quote-shared';
import { consumeTokens } from '../lib/tokens';
import { firestoreGet, firestoreSet, firestoreDelete } from '../lib/firestoreAdmin';
import { buildQuotePdf, formatUsdRange, type QuotePdfInput } from '../lib/quote-pdf';
import { sendTransactional } from '../lib/sequenzy';
import { checkCooldown, checkDailyCap } from '../lib/rateLimit';
import { sanitizeText } from '../lib/support-shared';
import { signShareToken, verifyShareToken } from '../lib/audit-express-share';
import type { AppEnv } from '../index';

const quote = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const GEN_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];

const QUOTE_COST = 150; // mirrors TOKEN_COSTS['quote.generation']
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 2000;

const COLLECTION = (orgId: string) => `organizations/${orgId}/quotes`;
// Mirrors tokens.ts BALANCE_PATH(orgId)/usage/{eventId} — kept in sync with the
// token ledger layout so a failed charge marker can be cleared for safe retry.
const USAGE_PATH = (orgId: string, eventId: string) =>
  `organizations/${orgId}/tokens/current/usage/${eventId}`;

/** Sanitize an id segment: alnum + dash/underscore, bounded. Prevents path tricks. */
function safeId(v: unknown): string {
  return typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '';
}

/** Sanitize the project description: drop markup + control chars, collapse
 *  whitespace, cap length. Stored as the user's own org-scoped content; never
 *  logged. Uses a codepoint filter (no control-byte regex in source). */
function sanitizeDescription(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let out = '';
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0;
    out += (code < 0x20 || code === 0x7f) ? ' ' : ch;
  }
  return out
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_MAX);
}

interface GenBody {
  orgId?:        unknown;
  quoteId?:      unknown;
  category?:     unknown;
  tier?:         unknown;
  description?:  unknown;
  businessSize?: unknown;
  urgency?:      unknown;
  budgetBand?:   unknown;
}

/* ── POST /api/quote/generate ─────────────────────────────── */

quote.post('/api/quote/generate', requireAuth(), requireRole(GEN_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const uid   = c.get('uid')   as string;
  const orgId = c.get('orgId') as string; // set by requireRole

  let body: GenBody;
  try { body = (await c.req.json()) as GenBody; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const quoteId = safeId(body.quoteId);
  if (!quoteId) return c.json({ error: 'quoteId required.', code: 'INVALID_QUOTE_ID' }, 400);

  // Validate the structured estimate inputs (category + category-scoped tier +
  // optional qualifiers). Reuses the Q0 authoritative validator.
  const inputErr = validateInputs({
    category:     body.category,
    tier:         body.tier,
    businessSize: body.businessSize,
    urgency:      body.urgency,
    budgetBand:   body.budgetBand,
  });
  if (inputErr) return c.json({ error: inputErr, code: 'INVALID_INPUT' }, 400);

  const description = sanitizeDescription(body.description);
  if (description.length < DESCRIPTION_MIN) {
    return c.json({ error: 'A project description is required.', code: 'INVALID_DESCRIPTION' }, 400);
  }

  const path = `${COLLECTION(orgId)}/${quoteId}`;

  // Idempotency: an existing quote (same quoteId) is returned without charging.
  const existing = await firestoreGet(saJson, path);
  if (existing) {
    let estimate: unknown = null;
    try { estimate = existing.estimateJson ? JSON.parse(String(existing.estimateJson)) : null; }
    catch { estimate = null; }
    return c.json({
      quoteId,
      estimate,
      engineVersion:  existing.engineVersion ?? '',
      rulesetVersion: existing.rulesetVersion ?? '',
      tokensConsumed: 0,
      idempotent:     true,
    });
  }

  // Charge tokens (idempotent on eventId). 50 tokens for 'quote.generation'.
  const eventId = `quote_gen_${quoteId}`;
  const charge = await consumeTokens(saJson, orgId, 'quote.generation', uid, eventId, { quoteId });
  if (!charge.ok) {
    // Clear the failed usage marker so a retry after a top-up charges correctly.
    try { await firestoreDelete(saJson, USAGE_PATH(orgId, eventId)); } catch { /* best-effort */ }
    return c.json(
      { error: 'Not enough tokens.', code: 'INSUFFICIENT_TOKENS', balance: charge.balance, required: charge.required },
      402,
    );
  }

  // Deterministic estimate (pure; reuses Q0 engine).
  const inputs: QuoteInputs = {
    category: body.category as QuoteCategory,
    tier:     body.tier as QuoteTier,
    ...(typeof body.businessSize === 'string' ? { businessSize: body.businessSize as QuoteInputs['businessSize'] } : {}),
    ...(typeof body.urgency === 'string'      ? { urgency: body.urgency as QuoteInputs['urgency'] } : {}),
    ...(typeof body.budgetBand === 'string'   ? { budgetBand: body.budgetBand as QuoteInputs['budgetBand'] } : {}),
  };
  const scored = scoreQuote(inputs);
  const now = new Date().toISOString();

  // Persist (no PII logging; org-scoped). Flat scalars stay queryable; the full
  // estimate + trace are stored as JSON strings (same pattern as snapshotJson) so
  // the doc remains a Record<string, scalar> and round-trips deterministically.
  const doc = {
    id:             quoteId,
    orgId,
    createdBy:      uid,
    createdAt:      now,
    updatedAt:      now,
    status:         'generated',
    category:       inputs.category,
    tier:           inputs.tier,
    businessSize:   typeof body.businessSize === 'string' ? body.businessSize : null,
    urgency:        typeof body.urgency === 'string' ? body.urgency : null,
    budgetBand:     typeof body.budgetBand === 'string' ? body.budgetBand : null,
    description,
    priceMinUsd:    scored.estimate.priceMinUsd,
    priceMaxUsd:    scored.estimate.priceMaxUsd,
    openEnded:      scored.estimate.openEnded,
    solutionKey:    scored.estimate.solutionKey,
    estimateJson:   JSON.stringify(scored.estimate),
    traceJson:      JSON.stringify(scored.trace),
    engineVersion:  scored.engineVersion,
    rulesetVersion: scored.rulesetVersion,
    tokensConsumed: QUOTE_COST,
  };

  try {
    await firestoreSet(saJson, path, doc);
  } catch (err) {
    console.error('[quote] persist failed for org:', orgId, 'ray:', c.req.header('CF-Ray') ?? 'n/a', err instanceof Error ? err.message : '');
    // The token was already consumed (idempotent eventId). A client retry with
    // the SAME quoteId returns ok via the existing-doc path once persisted, or
    // re-attempts persist without re-charging (consumeTokens returns 0).
    return c.json({ error: 'Could not save the quote.', code: 'PERSIST_FAILED' }, 500);
  }

  return c.json({
    quoteId,
    estimate:       scored.estimate,
    engineVersion:  scored.engineVersion,
    rulesetVersion: scored.rulesetVersion,
    tokensConsumed: charge.tokensConsumed,
    balanceAfter:   charge.balanceAfter,
  });
});

/* ── POST /api/quote/pdf — deterministic, localized quote PDF ──────────────
 *
 * Renders the EXACT display strings the UI shows (client-supplied, already
 * localized; RU/ZH resolved to English client-side). Bound to a real stored
 * quote (auth + org + existence). createdAt comes from the stored quote so the
 * output is stable. The render payload is persisted for later server-side
 * regeneration (Q4 email). No PII logging.
 */

const STR_MAX = 600;
const LIST_MAX = 12;
const ITEM_MAX = 200;

function str(v: unknown, max = STR_MAX): string {
  return typeof v === 'string' ? v.slice(0, max) : '';
}
function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.slice(0, LIST_MAX).map(x => str(x, ITEM_MAX)).filter(Boolean) : [];
}

/** Map a client render payload (already-localized display strings) + the stored
 *  createdAt + quoteId into the validated 8-section QuotePdfInput. Single source
 *  of truth for both the download and the email/shared regeneration. */
function parseRender(r: Record<string, unknown>, createdAt: string, quoteId: string): QuotePdfInput {
  return {
    createdAt,
    docTitle:             str(r.docTitle) || 'Project quote',
    projectName:          str(r.projectName),
    clientName:           str(r.clientName, 120),
    quoteId,
    labelClient:          str(r.labelClient, 60),
    labelDate:            str(r.labelDate, 60),
    labelValid:           str(r.labelValid, 60),
    labelRef:             str(r.labelRef, 60),
    execHeading:          str(r.execHeading),
    execSummary:          str(r.execSummary, 800),
    summary:              str(r.summary, 2000),
    solutionHeading:      str(r.solutionHeading),
    solutionLabel:        str(r.solutionLabel),
    solutionDescription:  str(r.solutionDescription, 600),
    scopeHeading:         str(r.scopeHeading),
    scope:                strList(r.scope),
    pricingHeading:       str(r.pricingHeading),
    rangeText:            str(r.rangeText, 120),
    justificationHeading: str(r.justificationHeading),
    justification:        strList(r.justification),
    paymentHeading:       str(r.paymentHeading),
    paymentNote:          str(r.paymentNote, 600),
    timelineHeading:      str(r.timelineHeading),
    timeline:             strList(r.timeline),
    disclaimer:           str(r.disclaimer, 600),
    negHeading:           str(r.negHeading, 120),
    negInitialLabel:      str(r.negInitialLabel, 60),
    negBudgetLabel:       str(r.negBudgetLabel, 60),
    negAdjustedLabel:     str(r.negAdjustedLabel, 60),
    negInitial:           str(r.negInitial, 120),
    negBudget:            str(r.negBudget, 120),
    negAdjusted:          str(r.negAdjusted, 120),
  };
}

interface PdfBody { orgId?: unknown; quoteId?: unknown; render?: unknown }

quote.post('/api/quote/pdf', requireAuth(), requireRole(GEN_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;

  let body: PdfBody;
  try { body = (await c.req.json()) as PdfBody; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const quoteId = safeId(body.quoteId);
  if (!quoteId) return c.json({ error: 'quoteId required.', code: 'INVALID_QUOTE_ID' }, 400);

  // Bind to a real, org-owned quote (auth + isolation + existence).
  const stored = await firestoreGet(saJson, `${COLLECTION(orgId)}/${quoteId}`);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  const r = (body.render && typeof body.render === 'object') ? body.render as Record<string, unknown> : {};
  const createdAt = typeof stored.createdAt === 'string' ? stored.createdAt : new Date().toISOString();
  const pdfInput = parseRender(r, createdAt, quoteId);

  let bytes: Uint8Array;
  try {
    bytes = buildQuotePdf(pdfInput);
  } catch (err) {
    console.error('[quote] PDF render failed for org:', orgId, 'ray:', c.req.header('CF-Ray') ?? 'n/a', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not render the quote PDF.', code: 'PDF_RENDER_FAILED' }, 500);
  }

  // Persist the render payload (idempotent merge) so Q4 email can regenerate the
  // same PDF server-side without the client. Best-effort: never block the download.
  try {
    await firestoreSet(saJson, `${COLLECTION(orgId)}/${quoteId}`, {
      renderJson: JSON.stringify(pdfInput),
      pdfAt:      new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('[quote] render persist failed for org:', orgId, err instanceof Error ? err.message : '');
  }

  return c.body(bytes as unknown as Uint8Array<ArrayBuffer>, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="quote-${quoteId}.pdf"`,
    'Cache-Control': 'no-store',
  });
});

/* ── POST /api/quote/:quoteId/override — admin manual price adjustment ──────
 *
 * Owner/admin only. Records an override (min/max USD) + justification while
 * PRESERVING the original computed price + estimate. Keeps the persisted render
 * payload consistent so the email/shared PDF reflects the adjusted price.
 */

const OVERRIDE_ROLES: RoleList = ['owner', 'admin'];
const PRICE_MAX = 100_000_000;

interface OverrideBody { orgId?: unknown; minUsd?: unknown; maxUsd?: unknown; reason?: unknown }

quote.post('/api/quote/:quoteId/override', requireAuth(), requireRole(OVERRIDE_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid') as string;
  const quoteId = safeId(c.req.param('quoteId'));
  if (!quoteId) return c.json({ error: 'quoteId required.', code: 'INVALID_QUOTE_ID' }, 400);

  let body: OverrideBody;
  try { body = (await c.req.json()) as OverrideBody; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const min = typeof body.minUsd === 'number' ? body.minUsd : NaN;
  const max = typeof body.maxUsd === 'number' ? body.maxUsd : NaN;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0 || min > PRICE_MAX || max > PRICE_MAX) {
    return c.json({ error: 'min/max must be valid USD amounts.', code: 'INVALID_PRICE' }, 400);
  }
  if (min > max) return c.json({ error: 'min must be <= max.', code: 'INVALID_PRICE_ORDER' }, 400);
  const reason = sanitizeDescription(body.reason).slice(0, 500);
  if (reason.length < 3) return c.json({ error: 'A justification is required.', code: 'INVALID_REASON' }, 400);

  const path = `${COLLECTION(orgId)}/${quoteId}`;
  const stored = await firestoreGet(saJson, path);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  const overrideMinUsd = Math.round(min);
  const overrideMaxUsd = Math.round(max);

  const patch: Record<string, string | number> = {
    overrideMinUsd,
    overrideMaxUsd,
    overrideReason: reason,
    overriddenBy:   uid,
    overriddenAt:   new Date().toISOString(),
    status:         'overridden',
    updatedAt:      new Date().toISOString(),
  };

  // Keep the persisted render (used by the email/shared PDF) consistent with the
  // override so a regenerated document shows the adjusted price (USD).
  if (typeof stored.renderJson === 'string') {
    try {
      const r = JSON.parse(stored.renderJson) as QuotePdfInput;
      r.rangeText = formatUsdRange(overrideMinUsd, overrideMaxUsd);
      r.negAdjusted = formatUsdRange(overrideMinUsd, overrideMaxUsd);
      patch.renderJson = JSON.stringify(r);
    } catch { /* leave renderJson as-is */ }
  }

  await firestoreSet(saJson, path, patch, { merge: true });
  // Original price preserved: priceMinUsd/priceMaxUsd + estimateJson are untouched.
  return c.json({ quoteId, overrideMinUsd, overrideMaxUsd, status: 'overridden' });
});

/* ── POST /api/quote/email — send the quote as a tokenized PDF link ─────────
 *
 * Member+ roles. Sends to the caller's VERIFIED token email (never a client-
 * supplied address). PDF is delivered as an HMAC-signed, short-lived LINK (not
 * an attachment — Sequenzy does not support attachments). Per-locale template
 * slug (RU/ZH -> English, matching the PDF rule). Best-effort / non-fatal.
 */

const EMAIL_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];
const PDF_LANGS = new Set(['en', 'fr', 'es', 'de', 'it', 'pt']);
const SHARE_TTL = 14 * 24 * 3600; // 14 days
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Anti-abuse caps for the now-arbitrary-recipient email endpoint (B2).
const EMAIL_COOLDOWN_MS = 15_000;
const EMAIL_DAILY_CAP = 20;

// Part 4 — last-resort language inference from the Cloudflare edge country when
// the client doesn't supply a usable locale. Only the 6 templated languages map;
// everything else (incl. ru/zh) falls back to English, matching the PDF rule.
const COUNTRY_LANG: Record<string, string> = {
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  DE: 'de', AT: 'de', CH: 'de',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  IT: 'it',
  PT: 'pt', BR: 'pt',
};
function countryToLang(cc: string | undefined): string {
  return cc ? (COUNTRY_LANG[cc.toUpperCase()] ?? 'en') : 'en';
}

interface EmailBody { orgId?: unknown; quoteId?: unknown; locale?: unknown; render?: unknown; sendAdminCopy?: unknown; clientEmail?: unknown }

quote.post('/api/quote/email', requireAuth(), requireRole(EMAIL_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;
  const uid = c.get('uid') as string;
  const tokenEmail = c.get('email') as string | undefined;

  const secret = env.AUDIT_SHARE_SECRET;
  if (!secret) return c.json({ error: 'Email links are not enabled.', code: 'SHARE_DISABLED' }, 503);

  let body: EmailBody;
  try { body = (await c.req.json()) as EmailBody; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  // B2 — optional client recipient. The user may send the quote to their client;
  // if no valid client email is given, it goes to the caller's own token email.
  // The verified token email is always the reply-to, so client replies reach the
  // sender — and the client address is never trusted as the caller's identity.
  const clientEmailRaw = typeof body.clientEmail === 'string' ? body.clientEmail.trim().toLowerCase().slice(0, 200) : '';
  const clientEmail = clientEmailRaw && EMAIL_RE.test(clientEmailRaw) ? clientEmailRaw : '';
  const recipient = clientEmail || tokenEmail;
  if (!recipient) return c.json({ error: 'No email to send to.', code: 'NO_EMAIL' }, 400);

  const quoteId = safeId(body.quoteId);
  if (!quoteId) return c.json({ error: 'quoteId required.', code: 'INVALID_QUOTE_ID' }, 400);

  const path = `${COLLECTION(orgId)}/${quoteId}`;
  const stored = await firestoreGet(saJson, path);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  // Persist the render payload if supplied (so the shared link can regenerate it).
  let render: QuotePdfInput | null = null;
  if (body.render && typeof body.render === 'object') {
    const r = body.render as Record<string, unknown>;
    const createdAt = typeof stored.createdAt === 'string' ? stored.createdAt : new Date().toISOString();
    render = parseRender(r, createdAt, quoteId);
    if (typeof stored.overrideMinUsd === 'number' && typeof stored.overrideMaxUsd === 'number') {
      render.rangeText = formatUsdRange(stored.overrideMinUsd, stored.overrideMaxUsd);
    }
    try { await firestoreSet(saJson, path, { renderJson: JSON.stringify(render), pdfAt: new Date().toISOString() }, { merge: true }); }
    catch (err) { console.error('[quote] email render persist failed:', err instanceof Error ? err.message : ''); }
  } else if (typeof stored.renderJson === 'string') {
    try { render = JSON.parse(stored.renderJson) as QuotePdfInput; } catch { render = null; }
  }
  if (!render) return c.json({ error: 'Generate the quote PDF first.', code: 'PDF_NOT_READY' }, 400);

  // B2 anti-abuse: cap the per-user send rate so this endpoint can't be used to
  // relay mail to arbitrary addresses. Both checks fail open on a store error so
  // a legitimate send is never blocked by a flaky rate-limit store.
  const cd = await checkCooldown(saJson, 'quote_email', uid, EMAIL_COOLDOWN_MS);
  if (!cd.ok) return c.json({ error: 'Please wait a moment before sending another email.', code: 'RATE_LIMITED', retryAfterSec: cd.retryAfterSec }, 429);
  const cap = await checkDailyCap(saJson, 'quote_email', uid, EMAIL_DAILY_CAP);
  if (!cap.ok) return c.json({ error: 'Daily email limit reached. Please try again tomorrow.', code: 'DAILY_LIMIT' }, 429);

  const now = Math.floor(Date.now() / 1000);
  const { token } = await signShareToken(secret, orgId, quoteId, 1, SHARE_TTL, now);
  const pdfUrl = `${new URL(c.req.url).origin}/api/quote/shared/${token}`;

  // Part 4 — resolve the email language: client-provided locale first (app
  // language → browser language are already merged client-side), then the CF edge
  // country, then English. Only the 6 templated languages are honored.
  const baseLocale = (typeof body.locale === 'string' ? body.locale : '').toLowerCase().split('-')[0];
  const slugLang = PDF_LANGS.has(baseLocale)
    ? baseLocale
    : countryToLang(c.req.header('CF-IPCountry'));
  const variables: Record<string, string> = {
    QUOTE_TITLE:  render.docTitle,
    SOLUTION:     render.solutionLabel,
    RANGE:        render.rangeText,
    NEG_INITIAL:  render.negInitial,
    NEG_BUDGET:   render.negBudget,
    NEG_ADJUSTED: render.negAdjusted,
    PDF_URL:      pdfUrl,
  };

  const result = await sendTransactional(env.SEQUENZY_API_KEY, { to: recipient, slug: `quote-${slugLang}`, variables, replyTo: tokenEmail });

  if (body.sendAdminCopy === true && env.ADMIN_EMAIL) {
    await sendTransactional(env.SEQUENZY_API_KEY, {
      to: env.ADMIN_EMAIL,
      slug: 'quote-admin',
      variables: { ...variables, CUSTOMER_EMAIL: recipient },
      replyTo: tokenEmail,
    });
  }

  // Non-fatal: a missing template / unconfigured key surfaces emailed=false, not a 5xx.
  return c.json({ ok: true, emailed: result.ok, pdfUrlMinted: true });
});

/* ── GET /api/quote/shared/:token — public, HMAC-gated PDF for email links ──
 *
 * No auth: the short-lived HMAC token IS the gate. Regenerates the deterministic
 * PDF from the quote's persisted render payload (override reflected). no-store.
 */
quote.get('/api/quote/shared/:token', async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const secret = env.AUDIT_SHARE_SECRET;
  if (!secret) return c.json({ error: 'Links are not enabled.', code: 'SHARE_DISABLED' }, 503);

  const v = await verifyShareToken(secret, c.req.param('token'), Math.floor(Date.now() / 1000));
  if (!v.ok) {
    return c.json(
      { error: v.code === 'SHARE_EXPIRED' ? 'This link has expired.' : 'This link is invalid.', code: v.code },
      v.code === 'SHARE_EXPIRED' ? 410 : 401,
    );
  }

  const { orgId, auditId: quoteId } = v.payload;
  const stored = await firestoreGet(saJson, `${COLLECTION(orgId)}/${quoteId}`);
  if (!stored || typeof stored.renderJson !== 'string') {
    return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);
  }

  let render: QuotePdfInput;
  try { render = JSON.parse(stored.renderJson) as QuotePdfInput; }
  catch { return c.json({ error: 'Quote unavailable.', code: 'RENDER_UNAVAILABLE' }, 500); }
  if (typeof stored.overrideMinUsd === 'number' && typeof stored.overrideMaxUsd === 'number') {
    render.rangeText = formatUsdRange(stored.overrideMinUsd, stored.overrideMaxUsd);
  }

  let bytes: Uint8Array;
  try { bytes = buildQuotePdf(render); }
  catch (err) {
    console.error('[quote] shared PDF render failed ray:', c.req.header('CF-Ray') ?? 'n/a', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not render the quote PDF.', code: 'PDF_RENDER_FAILED' }, 500);
  }

  return c.body(bytes as unknown as Uint8Array<ArrayBuffer>, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="quote-${quoteId}.pdf"`,
    'Cache-Control': 'no-store',
  });
});

/* ── POST /api/quote/:quoteId/decision — client pricing decision ───────────
 *
 * Member+ roles. Records a NON-BINDING intent (accept | discuss) + an optional
 * expected budget (USD). "discuss" notifies the admin (best-effort) if
 * ADMIN_EMAIL is set. No pricing/billing change.
 */

interface DecisionBody { orgId?: unknown; decision?: unknown; expectedBudgetUsd?: unknown; message?: unknown }

quote.post('/api/quote/:quoteId/decision', requireAuth(), requireRole(EMAIL_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;
  const quoteId = safeId(c.req.param('quoteId'));
  if (!quoteId) return c.json({ error: 'quoteId required.', code: 'INVALID_QUOTE_ID' }, 400);

  let body: DecisionBody;
  try { body = (await c.req.json()) as DecisionBody; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const decision = body.decision === 'accepted' ? 'accepted'
    : body.decision === 'discussion' ? 'discussion' : null;
  if (!decision) return c.json({ error: 'Invalid decision.', code: 'INVALID_DECISION' }, 400);

  const budget = typeof body.expectedBudgetUsd === 'number' ? body.expectedBudgetUsd : NaN;
  const hasBudget = Number.isFinite(budget) && budget >= 0 && budget <= PRICE_MAX;

  // B3 — optional negotiation message (sanitized: control chars stripped, markup
  // defanged, capped 2000). Stored on the quote doc only — no separate collection.
  const message = typeof body.message === 'string' ? sanitizeText(body.message, 2000) : null;

  const path = `${COLLECTION(orgId)}/${quoteId}`;
  const stored = await firestoreGet(saJson, path);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  const patch: Record<string, string | number> = {
    decision,
    status:    decision,
    decidedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (message) patch.discussionMessage = message;
  if (hasBudget) {
    patch.expectedBudgetUsd = Math.round(budget);
    // Keep the persisted render in sync so the email/shared PDF shows the budget row.
    if (typeof stored.renderJson === 'string') {
      try {
        const r = JSON.parse(stored.renderJson) as Record<string, unknown>;
        r.negBudget = `$${Math.round(budget).toLocaleString('en-US')}`;
        patch.renderJson = JSON.stringify(r);
      } catch { /* leave renderJson as-is */ }
    }
  }
  await firestoreSet(saJson, path, patch, { merge: true });

  // Part 2 — on accept, open a DRAFT invoice. No amount, no email, no Stripe, no
  // charge: the admin confirms the final amount (Step B) before any invoice email
  // or payment link is generated. Idempotent — one invoice per quote, and an
  // already-created invoice is never reset (preserves a confirmed amount/status).
  if (decision === 'accepted') {
    const invPath = `invoices/quote_${quoteId}`;
    const existingInv = await firestoreGet(saJson, invPath);
    if (!existingInv) {
      const customerEmail = c.get('email') as string | undefined;
      const rangeMinUsd = typeof stored.overrideMinUsd === 'number' ? stored.overrideMinUsd
        : typeof stored.priceMinUsd === 'number' ? stored.priceMinUsd : null;
      const rangeMaxUsd = typeof stored.overrideMaxUsd === 'number' ? stored.overrideMaxUsd
        : typeof stored.priceMaxUsd === 'number' ? stored.priceMaxUsd : null;
      const invoice = {
        id:            `quote_${quoteId}`,
        quoteId,
        orgId,
        customerEmail: customerEmail ?? '',
        rangeMinUsd,
        rangeMaxUsd,
        amount:        null,     // admin sets at confirm time (Step B)
        currency:      'usd',
        status:        'draft',
        source:        'quote',
        schemaVersion: 1,
        createdAt:     new Date().toISOString(),
      };
      try { await firestoreSet(saJson, invPath, invoice as unknown as Parameters<typeof firestoreSet>[2]); }
      catch (err) { console.error('[quote] invoice draft create failed:', err instanceof Error ? err.message : ''); }
    }
  }

  // Discuss → best-effort admin notification (sales signal). Non-fatal.
  if (decision === 'discussion' && env.ADMIN_EMAIL) {
    const customerEmail = c.get('email') as string | undefined;
    // Non-PII context line composed from the stored quote (title · solution · range).
    let context = quoteId;
    if (typeof stored.renderJson === 'string') {
      try {
        const r = JSON.parse(stored.renderJson) as Record<string, unknown>;
        const parts = [r.docTitle, r.solutionLabel, r.rangeText].filter((v): v is string => typeof v === 'string');
        if (parts.length) context = parts.join(' · ');
      } catch { /* keep quoteId as context */ }
    }
    await sendTransactional(env.SEQUENZY_API_KEY, {
      to:      env.ADMIN_EMAIL,
      slug:    'quote-discussion-admin',
      replyTo: customerEmail,
      variables: {
        TYPE:     'discussion',
        MESSAGE:  message ?? '',
        EMAIL:    customerEmail ?? '',
        CONTEXT:  context,
        BUDGET:   hasBudget ? `$${Math.round(budget).toLocaleString('en-US')}` : '',
        QUOTE_ID: quoteId,
      },
    });
  }

  return c.json({ ok: true, status: decision });
});

export default quote;
