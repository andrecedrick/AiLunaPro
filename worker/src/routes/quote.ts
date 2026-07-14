/**
 * Quote (Devis) generation route — Phase Q2.
 *
 *   POST /api/quote/generate
 *
 * Auth + org-membership + role gated (owner/admin/billing/member; client → 403).
 * Token-charged (consumeTokens 'quote.generation' = 150), deterministic estimate
 * (reuses scoreQuote from Q0), persisted under the org. This module also serves
 * the PDF, the localized email (Sequenzy), and the accept/discuss decision (which
 * advances the quote state machine but creates NO invoice — the invoice is born
 * only when the admin finalises the amount). No payment / Stripe / charge beyond
 * the generation token cost. No PII logging.
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
  quotePrice,
  type QuoteInputs,
  type QuoteCategory,
  type QuoteTier,
} from '../lib/quote-shared';
import { consumeTokens } from '../lib/tokens';
import { firestoreGet, firestoreSet, firestoreDelete, firestoreRunQuery } from '../lib/firestoreAdmin';
import { buildQuotePdf, type QuotePdfInput } from '../lib/quote-pdf';
import { sendTransactional } from '../lib/sequenzy';
import { sanitizeQuoteRoiVars, sanitizeEmailVar } from '../lib/quote-email-vars';
import { finalizeQuoteInvoice } from './invoices';
import { checkCooldown, checkDailyCap } from '../lib/rateLimit';
import { signShareToken, verifyShareToken } from '../lib/audit-express-share';
import { adminRecipients, isSuperAdmin } from '../lib/platformAdmin';
import type { AppEnv } from '../index';

const quote = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const GEN_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];

const QUOTE_COST = 60; // mirrors TOKEN_COSTS['quote.generation'] (rebalanced 150→60)
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
    priceUsd:       scored.estimate.priceUsd,
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

// Shared admin roles + the max price bound (used by send + PATCH governance).
// Fixed-price model: there is NO admin price override — the price is locked at send.
const OVERRIDE_ROLES: RoleList = ['owner', 'admin'];

/* ── POST /api/quote/email — send the quote as a tokenized PDF link ─────────
 *
 * Member+ roles. Sends to the caller's VERIFIED token email (never a client-
 * supplied address). PDF is delivered as an HMAC-signed, short-lived LINK (not
 * an attachment — Sequenzy does not support attachments). Per-locale template
 * slug (RU/ZH -> English, matching the PDF rule). Best-effort / non-fatal.
 */

const EMAIL_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];
// Terminal stages: the quote has been finalised / invoiced / paid, so a live
// invoice exists downstream. A new accept/discuss decision here would regress
// the stage back into the pricing queue and desync the invoice — it is locked
// (audit D1). 'accepted'/'paid' are defensive: no code sets them on the quote
// doc today (accept → 'client_responded'; 'paid' is an invoice status), so
// including them never blocks the legitimate pre-finalise negotiation flow.
const TERMINAL_STAGES = ['accepted', 'finalized', 'invoice_sent', 'paid'];
const PDF_LANGS = new Set(['en', 'fr', 'es', 'de', 'it', 'pt']);
const SHARE_TTL = 14 * 24 * 3600; // 14 days
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Anti-abuse caps for the now-arbitrary-recipient email endpoint (B2).
const EMAIL_COOLDOWN_MS = 15_000;
const EMAIL_DAILY_CAP = 20;
// Public token-confirm: a per-quote cooldown bounds replay bursts of the 14-day
// bearer token (the primary control is the single-effect "already decided" guard).
const CONFIRM_COOLDOWN_MS = 10_000;

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

interface EmailBody { orgId?: unknown; quoteId?: unknown; locale?: unknown; render?: unknown; sendAdminCopy?: unknown; clientEmail?: unknown; roi?: unknown }

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

  // FIXED PUBLISHED PRICE — the amount is the offer's priceUsd (set at generation from
  // QUOTE_RANGES), locked on this send. No client budget, no floor, no range, no override.
  // Idempotent: a re-send keeps the same price. quotePrice = price ?? priceUsd ?? legacy.
  const price = quotePrice(stored);
  if (price === null) {
    return c.json({ error: 'This quote has no published price.', code: 'NO_PRICE' }, 500);
  }

  // Persist the recipient so a later token-gated email accept addresses the draft
  // invoice + client invoice email to the right person (the unauthenticated email
  // caller's identity is never trusted — only this server-recorded value is used).
  // STEP 1 — the quote has been sent. A RE-SEND must NEVER regress the lifecycle: a
  // quote the client already responded to (or that's finalised) keeps its stage, so a
  // resend can't pull it out of the admin pricing queue. sentAt is set once.
  const REACHED = ['client_responded', 'finalized', 'invoice_sent'];
  const curStage = typeof stored.stage === 'string' ? stored.stage : '';
  const nextStage = REACHED.includes(curStage) ? curStage : 'sent';
  // Lock the single fixed price (+ currency) here. priceUsd mirrors price as the canonical
  // published-price field; quotePrice reads price first, so both stay consistent.
  try { await firestoreSet(saJson, path, { customerEmail: recipient, stage: nextStage, price, priceUsd: price, currency: 'usd', ...(typeof stored.sentAt === 'string' && stored.sentAt ? {} : { sentAt: new Date().toISOString() }) }, { merge: true }); }
  catch (err) { console.error('[quote] recipient persist failed:', err instanceof Error ? err.message : ''); }

  // Persist the render payload if supplied (so the shared link can regenerate it).
  let render: QuotePdfInput | null = null;
  if (body.render && typeof body.render === 'object') {
    const r = body.render as Record<string, unknown>;
    const createdAt = typeof stored.createdAt === 'string' ? stored.createdAt : new Date().toISOString();
    render = parseRender(r, createdAt, quoteId);
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
  // Distinct action token (v2) for the Accept/Discuss CTAs — only this version is
  // accepted by POST /api/quote/decision/confirm, so a forwarded PDF link can't accept.
  const { token: actionToken } = await signShareToken(secret, orgId, quoteId, QUOTE_ACTION_SHARE_VERSION, SHARE_TTL, now);

  // Part 4 — resolve the email language: client-provided locale first (app
  // language → browser language are already merged client-side), then the CF edge
  // country, then English. Only the 6 templated languages are honored.
  const baseLocale = (typeof body.locale === 'string' ? body.locale : '').toLowerCase().split('-')[0];
  const slugLang = PDF_LANGS.has(baseLocale)
    ? baseLocale
    : countryToLang(c.req.header('CF-IPCountry'));
  // FIX 2 — Accept / Discuss deep-links into the app (the user completes the
  // action in-UI). Deliberately NOT a mutate-on-GET link, so an email scanner
  // that prefetches the URL can never accidentally accept a proposal.
  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  // Fixed-price email: BUDGET is the single locked price (USD — the exact amount the
  // invoice + Stripe will charge, so the number is identical everywhere). The Accept
  // CTA carries it so the in-app confirm + status pages show the same figure.
  const budgetSuffix = `&budgetUsd=${price}`;
  const budgetDisplay = `$${price.toLocaleString('en-US')}`;
  // Every CLIENT-derived display string is sanitized (strip <>{}, cap, em-dash
  // fallback) so a sender can't inject HTML or a nested {{VAR}} into their client's
  // mail. URLs are server-generated (signed token + encoded quoteId) and are NOT
  // sanitized — the length cap would break them; they carry no client markup.
  // Fixed-price email: ONE price (BUDGET), Accept only. No range, no negotiation
  // ("Request changes") button, no neg-* triplet — those inconsistent price sources
  // are gone. All client-derived strings stay sanitized (S1 — no HTML/{{VAR}} inject).
  const variables: Record<string, string> = {
    QUOTE_TITLE:  sanitizeEmailVar(render.docTitle),
    ACCEPT_URL:   `${appBase}/#/quote/result?action=accept&src=email&t=${actionToken}&quoteId=${encodeURIComponent(quoteId)}${budgetSuffix}`,
    SOLUTION:     sanitizeEmailVar(render.solutionLabel),
    BUDGET:       sanitizeEmailVar(budgetDisplay),
    PDF_URL:      pdfUrl,
    // ROI + decision figures (client formats them exactly like the in-app blocks;
    // sanitized + always-present here → no raw {{VAR}} and no null in the email).
    ...sanitizeQuoteRoiVars(body.roi),
  };

  const clientSlug = `quote-${slugLang}`;
  const result = await sendTransactional(env.SEQUENZY_API_KEY, { to: recipient, slug: clientSlug, variables, replyTo: tokenEmail });
  // Debug (non-PII): which template slug actually fired + whether Sequenzy accepted
  // it. Lets `wrangler tail` confirm the resolved slug/lang and the send outcome
  // without exposing the recipient. keyConfigured guards the silent-no-op case.
  console.log('[quote] proposal email', JSON.stringify({
    slug: clientSlug,
    slugLang,
    baseLocale: baseLocale || null,
    cfCountry: c.req.header('CF-IPCountry') ?? null,
    keyConfigured: !!env.SEQUENZY_API_KEY,
    emailed: result.ok,
    err: result.ok ? undefined : result.error,
  }));

  if (body.sendAdminCopy === true && env.ADMIN_EMAIL) {
    await sendTransactional(env.SEQUENZY_API_KEY, {
      to: env.ADMIN_EMAIL,
      slug: 'quote-admin',
      variables: { ...variables, CUSTOMER_EMAIL: sanitizeEmailVar(recipient) },
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

/* ── GET /api/quote/list — full-lifecycle quote tracking (sender + admin) ───
 *
 * Member+ roles, org-scoped (parent-path query, no stage filter → no composite index).
 * Two scopes:
 *   - ?mine=1 → ONLY the caller's own quotes (createdBy == uid), drafts hidden. Powers
 *     /my-quotes (each sender tracks what THEY sent, regardless of role).
 *   - default → admin full visibility: owner/admin see EVERY quote in the org at every
 *     stage INCLUDING never-sent 'generated' drafts (ISSUE 2 — no hidden states); a
 *     non-admin caller still sees only their own staged quotes (fail-safe).
 * Returns stage + status + adminState (blocked/suspended) so the UI derives the label.
 */
quote.get('/api/quote/list', requireAuth(), requireRole(EMAIL_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string; // membership-verified by requireRole
  const uid   = c.get('uid') as string;
  const role  = c.get('role') as string | undefined;
  const mine  = c.req.query('mine') === '1';
  // FULL VISIBILITY: an org owner/admin OR a platform super-admin sees EVERY quote.
  // (The Admin Center page is gated to exactly this set, so the data scope must match —
  // a super-admin whose org role is 'member' must still get the full list, not just own.)
  const superAdmin = isSuperAdmin(env, c.get('email') as string | undefined, c.get('emailVerified') as boolean | undefined);
  const adminAll = !mine && (role === 'owner' || role === 'admin' || superAdmin);

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    // Order by createdAt DESC (every quote doc has createdAt) so the result is the
    // NEWEST quotes, never an arbitrary key-ordered page — recent quotes are never
    // silently dropped past the limit. 500 covers any realistic org.
    rows = await firestoreRunQuery(saJson, {
      from: [{ collectionId: 'quotes' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit: 500,
    }, `organizations/${orgId}`);
  } catch (err) {
    console.error('[quote] list query failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load quotes.', code: 'QUERY_FAILED' }, 500);
  }

  const quotes = rows
    .filter(r => {
      const f = r.fields as Record<string, unknown>;
      if (adminAll) return true;                                        // admin full visibility (incl. drafts)
      if (f.createdBy !== uid) return false;                            // otherwise: own quotes only
      if (typeof f.stage !== 'string' || !f.stage) return false;        // hide own never-sent drafts
      return true;
    })
    .map(r => {
      const f = r.fields as Record<string, unknown>;
      const rangeMinUsd = typeof f.priceMinUsd === 'number' ? f.priceMinUsd : null;
      const rangeMaxUsd = typeof f.priceMaxUsd === 'number' ? f.priceMaxUsd : null;
      let quoteTitle = '';
      if (typeof f.renderJson === 'string') {
        try { const rj = JSON.parse(f.renderJson) as Record<string, unknown>; if (typeof rj.docTitle === 'string') quoteTitle = rj.docTitle; } catch { /* ignore */ }
      }
      return {
        quoteId:           r.name.split('/').pop() ?? '',
        quoteTitle,
        customerEmail:     typeof f.customerEmail === 'string' ? f.customerEmail : '',
        // PART 3 — superadmin visibility (all already-persisted fields, no IP capture).
        createdBy:         typeof f.createdBy === 'string' ? f.createdBy : '',   // client/sender uid
        orgId,
        source:            typeof f.source === 'string' ? f.source : '',
        price:             quotePrice(f),                                        // single locked price (USD)
        currency:          typeof f.currency === 'string' ? f.currency : 'usd',
        rangeMinUsd, rangeMaxUsd,
        stage:             typeof f.stage === 'string' ? f.stage : '',
        status:            typeof f.status === 'string' ? f.status : '',
        adminState:        typeof f.adminState === 'string' ? f.adminState : '',
        decision:          typeof f.decision === 'string' ? f.decision : '',
        createdAt:         typeof f.createdAt === 'string' ? f.createdAt : '',
        sentAt:            typeof f.sentAt === 'string' ? f.sentAt : '',
        decidedAt:         typeof f.decidedAt === 'string' ? f.decidedAt : '',   // accepted-at
        updatedAt:         typeof f.updatedAt === 'string' ? f.updatedAt : '',
        // Payment (filled by the invoice join below, admin scope only).
        paymentStatus:     '',
        paidAt:            '',
        stripePaymentId:   '',
        paymentUrl:        '',
        invoiceAmount:     null as number | null,
      };
    });

  // PART 3 — join the invoice per quote so the superadmin panel shows payment status /
  // Stripe id / paid-at. Bounded: admin scope only, and only for quotes that could
  // have an invoice (accepted / finalised). Best-effort — a failed join leaves blanks.
  if (adminAll) {
    await Promise.all(quotes.map(async q => {
      if (!q.decidedAt && q.stage !== 'finalized' && q.stage !== 'invoice_sent') return;
      try {
        const inv = await firestoreGet(saJson, `invoices/quote_${q.quoteId}`) as Record<string, unknown> | null;
        if (!inv || inv.orgId !== orgId) return;
        q.paymentStatus   = typeof inv.status === 'string' ? inv.status : '';
        q.paidAt          = typeof inv.paidAt === 'string' ? inv.paidAt : '';
        q.stripePaymentId = typeof inv.paymentSessionId === 'string' ? inv.paymentSessionId : '';
        q.paymentUrl      = typeof inv.paymentUrl === 'string' ? inv.paymentUrl : '';
        q.invoiceAmount   = typeof inv.amount === 'number' ? inv.amount : null;
      } catch { /* best-effort join */ }
    }));
  }

  // Newest activity first (decidedAt → sentAt → createdAt).
  const ts = (q: { decidedAt: string; sentAt: string; createdAt: string }) => q.decidedAt || q.sentAt || q.createdAt || '';
  quotes.sort((a, b) => (ts(a) < ts(b) ? 1 : ts(a) > ts(b) ? -1 : 0));

  return c.json({ ok: true, quotes });
});

/* ── PATCH /api/quote/:quoteId — admin GOVERNANCE only (block / suspend) ────
 *
 * Owner/admin only, org-scoped (membership-verified orgId — no cross-tenant).
 * Fixed-price model: an admin can NO LONGER edit the price/budget or messages — only
 * govern the quote (block / suspend / re-activate). `adminState` is a SEPARATE
 * governance flag layered over the lifecycle stage. A blocked/suspended quote can no
 * longer be accepted (its auto-invoice is skipped) — the only admin control that stays.
 */
interface PatchBody { orgId?: unknown; adminState?: unknown }
const ADMIN_STATES = new Set(['blocked', 'suspended', 'active']);

quote.patch('/api/quote/:quoteId', requireAuth(), requireRole(OVERRIDE_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string; // membership-verified by requireRole
  const uid = c.get('uid') as string;
  const quoteId = safeId(c.req.param('quoteId'));
  if (!quoteId) return c.json({ error: 'quoteId required.', code: 'INVALID_QUOTE_ID' }, 400);

  let body: PatchBody;
  try { body = (await c.req.json()) as PatchBody; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const path = `${COLLECTION(orgId)}/${quoteId}`;
  const stored = await firestoreGet(saJson, path);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  const patch: Record<string, string | number | null> = { updatedAt: new Date().toISOString(), updatedBy: uid };
  let touched = false;

  // Governance: block / suspend / re-activate ('active' clears the flag).
  if (typeof body.adminState === 'string') {
    const s = body.adminState.toLowerCase();
    if (!ADMIN_STATES.has(s)) return c.json({ error: 'Invalid state.', code: 'INVALID_STATE' }, 400);
    patch.adminState = s === 'active' ? null : s;
    touched = true;
  }

  if (!touched) return c.json({ error: 'Nothing to update.', code: 'NO_FIELDS' }, 400);

  await firestoreSet(saJson, path, patch, { merge: true });
  const effState = patch.adminState === null ? '' : typeof patch.adminState === 'string' ? patch.adminState : (typeof stored.adminState === 'string' ? stored.adminState : '');
  return c.json({ ok: true, quoteId, adminState: effState });
});

/* ── POST /api/quote/:quoteId/decision — client pricing decision ───────────
 *
 * Member+ roles. Records a NON-BINDING intent (accept | discuss) + an optional
 * expected budget (USD); advances the quote stage and notifies the admin. No
 * invoice is created here (that happens at admin finalise).
 */

// Action-token version for the email Accept/Discuss CTAs. Distinct from the v1
// PDF-link token so a forwarded PDF URL can never be used to accept a proposal.
const QUOTE_ACTION_SHARE_VERSION = 2;

/* Shared core for both the authed in-app decision and the public token-gated email
 * confirm. FIXED-PRICE MODEL: accepting a quote records the accept AND immediately
 * auto-invoices at the LOCKED price (quotePrice) → Stripe link → the buyer pays now.
 * No admin pricing step, no negotiation. Idempotent (one invoice per quote → no
 * duplicate payment). Governance block/suspend is the only thing that stops it — then
 * the admins are notified to follow up. Best-effort emails (non-fatal). */
async function applyQuoteDecision(env: AppEnv['Bindings'], saJson: string, a: {
  orgId: string; quoteId: string; stored: Record<string, unknown>;
  customerEmail: string | undefined; appBase: string;
}): Promise<{ locked: false; paymentUrl: string | null } | { locked: true; stage: string }> {
  const { orgId, quoteId, stored, customerEmail, appBase } = a;

  // Integrity guard (D1): a finalised/invoiced/paid quote is locked — never re-decide.
  const curStage = typeof stored.stage === 'string' ? stored.stage : '';
  if (TERMINAL_STAGES.includes(curStage)) return { locked: true, stage: curStage };

  // Record the accept.
  await firestoreSet(saJson, `${COLLECTION(orgId)}/${quoteId}`, {
    decision: 'accepted', status: 'accepted', stage: 'client_responded',
    decidedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Fixed-price auto-invoice: charge the LOCKED price NOW (no admin review). Skipped
  // only when the quote is governance-blocked/suspended or has no price. Reuses the
  // exact invoice-birth path (idempotent: one invoice per quote → no duplicate payment).
  const price = quotePrice(stored);
  const blocked = stored.adminState === 'blocked' || stored.adminState === 'suspended';
  let autoPaymentUrl: string | null = null;
  let autoFinalized = false;
  if (price !== null && price > 0 && !blocked) {
    try {
      const fin = await finalizeQuoteInvoice(env, saJson, { orgId, quoteId, quote: stored, amount: price, appBase });
      autoPaymentUrl = fin.paymentUrl;
      autoFinalized = true;
    } catch (e) {
      console.warn('[quote] auto-invoice on accept failed (admin can re-send from the panel):', e instanceof Error ? e.message : '');
    }
  }

  // Only notify admins when NO invoice was created (blocked/suspended, missing price, or
  // a transient finalise error) so a human can follow up. When auto-finalised the admin
  // sees the pending invoice in the panel and the client already has the invoice email.
  if (!autoFinalized) {
    const admins = adminRecipients(env);
    let quoteTitle = `Quote ${quoteId.slice(0, 8)}`;
    let solutionLabel = '';
    if (typeof stored.renderJson === 'string') {
      try {
        const r = JSON.parse(stored.renderJson) as Record<string, unknown>;
        if (typeof r.docTitle === 'string' && r.docTitle) quoteTitle = r.docTitle;
        if (typeof r.solutionLabel === 'string') solutionLabel = r.solutionLabel;
      } catch { /* keep defaults */ }
    }
    const budgetText = price !== null ? `$${price.toLocaleString('en-US')}` : 'Not specified';
    if (admins.length) {
      for (const to of admins) {
        const r = await sendTransactional(env.SEQUENZY_API_KEY, {
          to, slug: 'invoice-admin-pending', replyTo: customerEmail,
          variables: {
            QUOTE_TITLE: quoteTitle, CUSTOMER_EMAIL: customerEmail ?? '', RANGE: solutionLabel,
            BUDGET: budgetText, PANEL_URL: `${appBase}/#/invoices?quoteId=${encodeURIComponent(quoteId)}`,
          },
        });
        if (!r.ok) console.warn('[quote] accept admin-notify NOT sent (check SEQUENZY_API_KEY / invoice-admin-pending):', r.error ?? 'unknown');
      }
    } else {
      console.warn('[quote] accepted quote not auto-invoiced and no admin recipients set:', quoteId);
    }
  }

  return { locked: false, paymentUrl: autoPaymentUrl };
}

interface DecisionBody { orgId?: unknown; decision?: unknown }

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

  // Fixed-price model: ACCEPT only. Negotiation is disabled.
  if (body.decision === 'discussion') return c.json({ error: 'Negotiation is disabled — this quote is fixed-price.', code: 'NEGOTIATION_DISABLED' }, 400);
  if (body.decision !== 'accepted') return c.json({ error: 'Invalid decision.', code: 'INVALID_DECISION' }, 400);

  const stored = await firestoreGet(saJson, `${COLLECTION(orgId)}/${quoteId}`);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const res = await applyQuoteDecision(env, saJson, {
    orgId, quoteId, stored, customerEmail: c.get('email') as string | undefined, appBase,
  });
  // D1 — a finalised/invoiced/paid quote is locked; refuse the regression.
  if (res.locked) return c.json({ error: 'Quote cannot be modified after finalization.', code: 'QUOTE_LOCKED', stage: res.stage }, 409);
  // Accept auto-invoices at the locked price → surface the instant pay link.
  return c.json({ ok: true, status: 'accepted', ...(res.paymentUrl ? { paymentUrl: res.paymentUrl } : {}) });
});

/* ── POST /api/quote/decision/confirm — PUBLIC, token-gated email accept ────
 *
 * The quote email's Accept CTA carries an HMAC action token (shareVersion 2, distinct
 * from the v1 PDF-link token so a forwarded PDF URL can't accept). The unauthenticated
 * recipient lands on #/quote/result and clicks Confirm, which POSTs here — POST-only by
 * design, so an email scanner prefetching the GET link can never accept. Fixed-price:
 * accepting AUTO-INVOICES at the locked price → Stripe pay link. Idempotent (single-
 * effect: the decidedAt guard blocks token replay). */
interface TokenDecisionBody { token?: unknown; decision?: unknown }

quote.post('/api/quote/decision/confirm', async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const secret = env.AUDIT_SHARE_SECRET;
  if (!secret) return c.json({ error: 'Links are not enabled.', code: 'SHARE_DISABLED' }, 503);

  let body: TokenDecisionBody;
  try { body = (await c.req.json()) as TokenDecisionBody; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  // The HMAC token IS the gate (no auth): verify signature + expiry, then require
  // the dedicated ACTION version so a v1 PDF-link token can never accept.
  const token = typeof body.token === 'string' ? body.token : '';
  const v = await verifyShareToken(secret, token, Math.floor(Date.now() / 1000));
  if (!v.ok) return c.json(
    { error: v.code === 'SHARE_EXPIRED' ? 'This link has expired.' : 'This link is invalid.', code: v.code },
    v.code === 'SHARE_EXPIRED' ? 410 : 401,
  );
  if (v.payload.shareVersion !== QUOTE_ACTION_SHARE_VERSION) {
    return c.json({ error: 'This link is invalid.', code: 'SHARE_INVALID' }, 401);
  }

  // Fixed-price model: ACCEPT only. Negotiation is disabled.
  if (body.decision === 'discussion') return c.json({ error: 'Negotiation is disabled — this quote is fixed-price.', code: 'NEGOTIATION_DISABLED' }, 400);
  if (body.decision !== 'accepted') return c.json({ error: 'Invalid decision.', code: 'INVALID_DECISION' }, 400);

  const { orgId, auditId: quoteId } = v.payload;

  // Per-quote cooldown bounds replay bursts of the 14-day bearer token (fail-open:
  // a flaky rate-limit store never blocks a legitimate confirm).
  const cd = await checkCooldown(saJson, 'quote_confirm', `${orgId}:${quoteId}`, CONFIRM_COOLDOWN_MS);
  if (!cd.ok) return c.json({ error: 'Please wait a moment before retrying.', code: 'RATE_LIMITED', retryAfterSec: cd.retryAfterSec }, 429);

  const stored = await firestoreGet(saJson, `${COLLECTION(orgId)}/${quoteId}`);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  // Single-effect guard: this token is a replayable bearer credential, so a repeat
  // POST must NOT re-write the decision or re-notify the admin. First confirm wins;
  // later ones are idempotent no-ops (closes admin-email flooding + decision tampering
  // via a leaked/forwarded link). The authed in-app path is unaffected.
  if (typeof stored.decidedAt === 'string' && stored.decidedAt) {
    return c.json({ ok: true, status: typeof stored.decision === 'string' ? stored.decision : 'accepted', alreadyRecorded: true });
  }

  // Address the invoice + client email to the recipient persisted when the quote
  // was emailed (the unauthenticated caller's identity is never trusted).
  const customerEmail = typeof stored.customerEmail === 'string' && stored.customerEmail ? stored.customerEmail : undefined;
  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const res = await applyQuoteDecision(env, saJson, { orgId, quoteId, stored, customerEmail, appBase });
  // D1 — terminal quote: locked. (The decidedAt guard above already covers the
  // common case; this backstops a finalised quote whose decidedAt is unset.)
  if (res.locked) return c.json({ error: 'This quote can no longer be changed.', code: 'QUOTE_LOCKED', stage: res.stage }, 409);
  // Accept auto-invoices at the locked price → surface the instant pay link.
  return c.json({ ok: true, status: 'accepted', ...(res.paymentUrl ? { paymentUrl: res.paymentUrl } : {}) });
});

export default quote;
