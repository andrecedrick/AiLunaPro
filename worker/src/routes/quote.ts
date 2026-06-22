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
  type QuoteInputs,
  type QuoteCategory,
  type QuoteTier,
} from '../lib/quote-shared';
import { consumeTokens } from '../lib/tokens';
import { firestoreGet, firestoreSet, firestoreDelete, firestoreRunQuery } from '../lib/firestoreAdmin';
import { buildQuotePdf, formatUsdRange, type QuotePdfInput } from '../lib/quote-pdf';
import { sendTransactional } from '../lib/sequenzy';
import { checkCooldown, checkDailyCap } from '../lib/rateLimit';
import { sanitizeText } from '../lib/support-shared';
import { signShareToken, verifyShareToken } from '../lib/audit-express-share';
import { adminRecipients, isSuperAdmin } from '../lib/platformAdmin';
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
const PRICING_ROLES: RoleList = ['owner', 'admin']; // pricing queue + finalise are admin-only
// Quote stages awaiting the admin's final amount (the pricing queue).
const PENDING_STAGES = ['client_responded', 'negotiation'];
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

interface EmailBody { orgId?: unknown; quoteId?: unknown; locale?: unknown; render?: unknown; sendAdminCopy?: unknown; clientEmail?: unknown; expectedBudgetUsd?: unknown }

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

  // Budget-first: the user's proposed budget (USD). Persisted now so the later
  // token-gated email accept can notify the admin with this amount even though the
  // public confirm carries no budget, and so the Accept/Discuss CTAs can deep-link it.
  const emailBudget = typeof body.expectedBudgetUsd === 'number' ? body.expectedBudgetUsd : NaN;
  const hasEmailBudget = Number.isFinite(emailBudget) && emailBudget >= 0 && emailBudget <= PRICE_MAX;

  const path = `${COLLECTION(orgId)}/${quoteId}`;
  const stored = await firestoreGet(saJson, path);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  // Persist the recipient so a later token-gated email accept addresses the draft
  // invoice + client invoice email to the right person (the unauthenticated email
  // caller's identity is never trusted — only this server-recorded value is used).
  // STEP 1 — the quote has been sent. A RE-SEND must NEVER regress the lifecycle: a
  // quote the client already responded to (or that's finalised) keeps its stage, so a
  // resend can't pull it out of the admin pricing queue. sentAt is set once.
  const REACHED = ['client_responded', 'negotiation', 'finalized', 'invoice_sent'];
  const curStage = typeof stored.stage === 'string' ? stored.stage : '';
  const nextStage = REACHED.includes(curStage) ? curStage : 'sent';
  try { await firestoreSet(saJson, path, { customerEmail: recipient, stage: nextStage, ...(typeof stored.sentAt === 'string' && stored.sentAt ? {} : { sentAt: new Date().toISOString() }), ...(hasEmailBudget ? { expectedBudgetUsd: Math.round(emailBudget) } : {}) }, { merge: true }); }
  catch (err) { console.error('[quote] recipient persist failed:', err instanceof Error ? err.message : ''); }

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
  // Budget-first email: BUDGET is the PRIMARY field (the user's proposed amount,
  // already localized in render.negBudget; USD fallback if missing). The Accept/
  // Discuss CTAs carry the budget so the in-app confirm page shows it too.
  const budgetSuffix = hasEmailBudget ? `&budgetUsd=${Math.round(emailBudget)}` : '';
  const budgetDisplay = (render.negBudget && render.negBudget.trim())
    ? render.negBudget
    : (hasEmailBudget ? `$${Math.round(emailBudget).toLocaleString('en-US')}` : '');
  const variables: Record<string, string> = {
    QUOTE_TITLE:  render.docTitle,
    ACCEPT_URL:   `${appBase}/#/quote/result?action=accept&src=email&t=${actionToken}&quoteId=${encodeURIComponent(quoteId)}${budgetSuffix}`,
    DISCUSS_URL:  `${appBase}/#/quote/result?action=discuss&src=email&t=${actionToken}&quoteId=${encodeURIComponent(quoteId)}${budgetSuffix}`,
    SOLUTION:     render.solutionLabel,
    BUDGET:       budgetDisplay,
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

/* ── GET /api/quote/pending — admin pricing queue ──────────────────────────
 *
 * Owner/admin only. Lists the org's quotes that a client has responded to
 * (stage 'client_responded' or 'negotiation') and that await the admin's final
 * amount — i.e. before any invoice exists. The admin sets the amount here, which
 * creates the invoice (POST /api/invoices/finalize). Single-field IN filter → no
 * composite index. Worker-only (quotes are not client-readable).
 */
quote.get('/api/quote/pending', requireAuth(), requireRole(PRICING_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string; // membership-verified by requireRole

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await firestoreRunQuery(saJson, {
      from:  [{ collectionId: 'quotes' }],
      where: { fieldFilter: { field: { fieldPath: 'stage' }, op: 'IN', value: { arrayValue: { values: PENDING_STAGES.map(s => ({ stringValue: s })) } } } },
      limit: 200,
    }, `organizations/${orgId}`);
  } catch (err) {
    console.error('[quote] pending query failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load pending quotes.', code: 'QUERY_FAILED' }, 500);
  }

  const quotes = rows.map(r => {
    const f = r.fields as Record<string, unknown>;
    const rangeMinUsd = typeof f.overrideMinUsd === 'number' ? f.overrideMinUsd : typeof f.priceMinUsd === 'number' ? f.priceMinUsd : null;
    const rangeMaxUsd = typeof f.overrideMaxUsd === 'number' ? f.overrideMaxUsd : typeof f.priceMaxUsd === 'number' ? f.priceMaxUsd : null;
    let quoteTitle = '';
    if (typeof f.renderJson === 'string') {
      try { const rj = JSON.parse(f.renderJson) as Record<string, unknown>; if (typeof rj.docTitle === 'string') quoteTitle = rj.docTitle; } catch { /* ignore */ }
    }
    return {
      quoteId:           r.name.split('/').pop() ?? '',
      quoteTitle,
      customerEmail:     typeof f.customerEmail === 'string' ? f.customerEmail : '',
      rangeMinUsd, rangeMaxUsd,
      expectedBudgetUsd: typeof f.expectedBudgetUsd === 'number' ? f.expectedBudgetUsd : null,
      message:           typeof f.discussionMessage === 'string' ? f.discussionMessage : '',
      stage:             typeof f.stage === 'string' ? f.stage : '',
      decision:          typeof f.decision === 'string' ? f.decision : '',
      decidedAt:         typeof f.decidedAt === 'string' ? f.decidedAt : '',
    };
  });
  // Newest response first.
  quotes.sort((a, b) => (a.decidedAt < b.decidedAt ? 1 : a.decidedAt > b.decidedAt ? -1 : 0));

  return c.json({ ok: true, quotes });
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
      const rangeMinUsd = typeof f.overrideMinUsd === 'number' ? f.overrideMinUsd : typeof f.priceMinUsd === 'number' ? f.priceMinUsd : null;
      const rangeMaxUsd = typeof f.overrideMaxUsd === 'number' ? f.overrideMaxUsd : typeof f.priceMaxUsd === 'number' ? f.priceMaxUsd : null;
      let quoteTitle = '';
      if (typeof f.renderJson === 'string') {
        try { const rj = JSON.parse(f.renderJson) as Record<string, unknown>; if (typeof rj.docTitle === 'string') quoteTitle = rj.docTitle; } catch { /* ignore */ }
      }
      return {
        quoteId:           r.name.split('/').pop() ?? '',
        quoteTitle,
        customerEmail:     typeof f.customerEmail === 'string' ? f.customerEmail : '',
        rangeMinUsd, rangeMaxUsd,
        expectedBudgetUsd: typeof f.expectedBudgetUsd === 'number' ? f.expectedBudgetUsd : null,
        message:           typeof f.discussionMessage === 'string' ? f.discussionMessage : '',
        stage:             typeof f.stage === 'string' ? f.stage : '',
        status:            typeof f.status === 'string' ? f.status : '',
        adminState:        typeof f.adminState === 'string' ? f.adminState : '',
        decision:          typeof f.decision === 'string' ? f.decision : '',
        createdAt:         typeof f.createdAt === 'string' ? f.createdAt : '',
        sentAt:            typeof f.sentAt === 'string' ? f.sentAt : '',
        decidedAt:         typeof f.decidedAt === 'string' ? f.decidedAt : '',
        updatedAt:         typeof f.updatedAt === 'string' ? f.updatedAt : '',
      };
    });
  // Newest activity first (decidedAt → sentAt → createdAt).
  const ts = (q: { decidedAt: string; sentAt: string; createdAt: string }) => q.decidedAt || q.sentAt || q.createdAt || '';
  quotes.sort((a, b) => (ts(a) < ts(b) ? 1 : ts(a) > ts(b) ? -1 : 0));

  return c.json({ ok: true, quotes });
});

/* ── PATCH /api/quote/:quoteId — admin edit + governance (ISSUE 3) ──────────
 *
 * Owner/admin only, org-scoped (membership-verified orgId — no cross-tenant). Lets an
 * admin correct a quote (proposed budget, client message) and govern it (block /
 * suspend / re-activate). `adminState` is a SEPARATE governance flag layered over the
 * lifecycle stage (no state-machine bypass). A blocked/suspended quote is excluded
 * from the pricing queue and cannot be finalised (enforced at /api/invoices/finalize).
 */
interface PatchBody { orgId?: unknown; adminState?: unknown; expectedBudgetUsd?: unknown; message?: unknown }
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
  // Edit the proposed budget (integer USD, bounded). Keep the persisted render in sync.
  if (body.expectedBudgetUsd !== undefined) {
    const b = typeof body.expectedBudgetUsd === 'number' ? body.expectedBudgetUsd : NaN;
    if (!Number.isFinite(b) || b < 0 || b > PRICE_MAX) return c.json({ error: 'Invalid budget.', code: 'INVALID_BUDGET' }, 400);
    patch.expectedBudgetUsd = Math.round(b);
    if (typeof stored.renderJson === 'string') {
      try { const r = JSON.parse(stored.renderJson) as Record<string, unknown>; r.negBudget = `$${Math.round(b).toLocaleString('en-US')}`; patch.renderJson = JSON.stringify(r); }
      catch { /* leave render as-is */ }
    }
    touched = true;
  }
  // Edit the client message (sanitized).
  if (body.message !== undefined) {
    patch.discussionMessage = typeof body.message === 'string' ? sanitizeText(body.message, 2000) : '';
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
 * confirm. Advances the quote state machine (accept → 'client_responded', discuss →
 * 'negotiation') and notifies the admin so they can set the final amount. NO invoice
 * is created here (FIX 1) — the invoice is born only at admin finalise (STEP 4).
 * Best-effort emails (non-fatal). Callers resolve orgId/quoteId/customerEmail + validate. */
async function applyQuoteDecision(env: AppEnv['Bindings'], saJson: string, a: {
  orgId: string; quoteId: string; stored: Record<string, unknown>;
  decision: 'accepted' | 'discussion'; hasBudget: boolean; budget: number;
  message: string | null; customerEmail: string | undefined; appBase: string;
}): Promise<void> {
  const { orgId, quoteId, stored, decision, hasBudget, budget, message, customerEmail, appBase } = a;

  // Budget-first: when the caller supplies no budget (the public email-accept path
  // carries none), fall back to the budget the user proposed when the quote was
  // emailed (persisted on the quote). Guarantees the admin always sees the amount.
  let effHasBudget = hasBudget;
  let effBudget = budget;
  if (!effHasBudget && typeof stored.expectedBudgetUsd === 'number' && Number.isFinite(stored.expectedBudgetUsd)) {
    effHasBudget = true; effBudget = stored.expectedBudgetUsd;
  }

  const stage = decision === 'accepted' ? 'client_responded' : 'negotiation';
  const patch: Record<string, string | number> = {
    decision, status: decision, stage,
    decidedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  if (message) patch.discussionMessage = message;
  if (effHasBudget) {
    patch.expectedBudgetUsd = Math.round(effBudget);
    // Keep the persisted render in sync so the email/shared PDF shows the budget row.
    if (typeof stored.renderJson === 'string') {
      try {
        const r = JSON.parse(stored.renderJson) as Record<string, unknown>;
        r.negBudget = `$${Math.round(effBudget).toLocaleString('en-US')}`;
        patch.renderJson = JSON.stringify(r);
      } catch { /* leave renderJson as-is */ }
    }
  }
  await firestoreSet(saJson, `${COLLECTION(orgId)}/${quoteId}`, patch, { merge: true });

  // Display fields for the admin notification (title · solution · range).
  let quoteTitle = `Quote ${quoteId.slice(0, 8)}`;
  const rangeMinUsd = typeof stored.overrideMinUsd === 'number' ? stored.overrideMinUsd
    : typeof stored.priceMinUsd === 'number' ? stored.priceMinUsd : null;
  const rangeMaxUsd = typeof stored.overrideMaxUsd === 'number' ? stored.overrideMaxUsd
    : typeof stored.priceMaxUsd === 'number' ? stored.priceMaxUsd : null;
  let rangeText = rangeMinUsd != null && rangeMaxUsd != null ? formatUsdRange(rangeMinUsd, rangeMaxUsd) : '';
  let solutionLabel = '';
  if (typeof stored.renderJson === 'string') {
    try {
      const r = JSON.parse(stored.renderJson) as Record<string, unknown>;
      if (typeof r.docTitle === 'string' && r.docTitle) quoteTitle = r.docTitle;
      if (typeof r.rangeText === 'string' && r.rangeText) rangeText = r.rangeText;
      if (typeof r.solutionLabel === 'string') solutionLabel = r.solutionLabel;
    } catch { /* keep defaults */ }
  }
  const budgetText = effHasBudget ? `$${Math.round(effBudget).toLocaleString('en-US')}` : '';

  // Notify EVERY admin (ADMIN_EMAILS + ADMIN_EMAIL, de-duped). Each send is
  // best-effort and independent — one failure never blocks the others (graceful).
  const admins = adminRecipients(env);

  // FIX 2 — notify the admins that the client RESPONDED so they can review + set the
  // final amount on the Invoices/pricing panel. No invoice exists yet (FIX 1).
  if (decision === 'accepted' && admins.length) {
    for (const to of admins) {
      const r = await sendTransactional(env.SEQUENZY_API_KEY, {
        to, slug: 'invoice-admin-pending', replyTo: customerEmail,
        variables: {
          QUOTE_TITLE: quoteTitle, CUSTOMER_EMAIL: customerEmail ?? '', RANGE: rangeText,
          // Deep-link to the exact quote in the pricing queue (highlights + scrolls to it).
          BUDGET: budgetText || 'Not specified', PANEL_URL: `${appBase}/#/invoices?quoteId=${encodeURIComponent(quoteId)}`,
        },
      });
      if (!r.ok) console.warn('[quote] accept admin-notify NOT sent to an admin (check SEQUENZY_API_KEY / invoice-admin-pending):', r.error ?? 'unknown');
    }
  } else if (decision === 'accepted') {
    console.warn('[quote] no admin recipients (ADMIN_EMAILS/ADMIN_EMAIL unset) — no notification for accepted quote', quoteId);
  }

  // Discuss/negotiation → admin notification carrying the client's budget + message.
  if (decision === 'discussion' && admins.length) {
    const context = [quoteTitle, solutionLabel, rangeText].filter(Boolean).join(' · ') || quoteId;
    for (const to of admins) {
      const r = await sendTransactional(env.SEQUENZY_API_KEY, {
        to, slug: 'quote-discussion-admin', replyTo: customerEmail,
        variables: {
          // CHANGE 4 — always show the budget (never a blank row) + the client message.
          TYPE: 'discussion', MESSAGE: message || 'No message provided', EMAIL: customerEmail ?? '',
          CONTEXT: context, BUDGET: budgetText || 'Not specified', QUOTE_ID: quoteId,
        },
      });
      if (!r.ok) console.warn('[quote] quote-discussion-admin NOT sent to an admin:', r.error ?? 'unknown');
    }
  } else if (decision === 'discussion') {
    console.warn('[quote] no admin recipients (ADMIN_EMAILS/ADMIN_EMAIL unset) — no discussion notification for', quoteId);
  }
}

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

  const stored = await firestoreGet(saJson, `${COLLECTION(orgId)}/${quoteId}`);
  if (!stored) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);

  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  await applyQuoteDecision(env, saJson, {
    orgId, quoteId, stored, decision, hasBudget, budget, message,
    customerEmail: c.get('email') as string | undefined, appBase,
  });
  return c.json({ ok: true, status: decision });
});

/* ── POST /api/quote/decision/confirm — PUBLIC, token-gated email accept/discuss ──
 *
 * The quote email's Accept/Discuss CTAs carry an HMAC action token (shareVersion 2,
 * distinct from the v1 PDF-link token so a forwarded PDF URL can't accept). The
 * unauthenticated recipient lands on #/quote/result and clicks Confirm, which POSTs
 * here — POST-only by design, so an email scanner prefetching the GET link can never
 * accept. The token binds {orgId, quoteId}; the action records a NON-BINDING decision,
 * advances the quote stage (client_responded / negotiation), and notifies the admin so
 * they can set the final amount later on the Invoices panel. NO invoice is created here
 * (FIX 1 — the invoice is born only at admin finalise). Idempotent (single-effect). */
interface TokenDecisionBody { token?: unknown; decision?: unknown; expectedBudgetUsd?: unknown; message?: unknown }

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

  const decision = body.decision === 'accepted' ? 'accepted'
    : body.decision === 'discussion' ? 'discussion' : null;
  if (!decision) return c.json({ error: 'Invalid decision.', code: 'INVALID_DECISION' }, 400);
  // Budget carried in the (unsigned) confirm body — only a FALLBACK; the server-
  // recorded budget on the quote (set by the authed sender at email time) wins.
  const urlBudget = typeof body.expectedBudgetUsd === 'number' ? body.expectedBudgetUsd : NaN;
  const message = typeof body.message === 'string' ? sanitizeText(body.message, 2000) : null;

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
    return c.json({ ok: true, status: typeof stored.decision === 'string' ? stored.decision : decision, alreadyRecorded: true });
  }

  // Address the invoice + client email to the recipient persisted when the quote
  // was emailed (the unauthenticated caller's identity is never trusted).
  const customerEmail = typeof stored.customerEmail === 'string' && stored.customerEmail ? stored.customerEmail : undefined;
  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  // FIX 1 — guarantee a budget on the admin notification. Prefer the server-recorded
  // value (applyQuoteDecision falls back to it when hasBudget is false); use the
  // confirm-body value only when the quote has none persisted (legacy quotes).
  const storedHasBudget = typeof stored.expectedBudgetUsd === 'number' && Number.isFinite(stored.expectedBudgetUsd);
  const useUrlBudget = !storedHasBudget && Number.isFinite(urlBudget) && urlBudget >= 0 && urlBudget <= PRICE_MAX;
  await applyQuoteDecision(env, saJson, { orgId, quoteId, stored, decision, hasBudget: useUrlBudget, budget: useUrlBudget ? urlBudget : NaN, message, customerEmail, appBase });
  return c.json({ ok: true, status: decision });
});

export default quote;
