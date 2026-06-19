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

export default quote;
