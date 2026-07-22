/**
 * Luna AI chat route — S3 Phase 2 + L2 (monetization).
 *
 *   POST /api/luna/chat   (requireAuth + requireRole — authenticated org members)
 *
 * The user's question is answered by Claude (claude-haiku-4-5) grounded strictly
 * in the curated KB. First 3 messages/day are FREE; after that each message costs
 * org tokens (luna.message = 50). Pricing/purchase questions short-circuit to
 * Billing WITHOUT a model call. On any LLM failure → { fallback: true } and the
 * client falls back to the deterministic answerLuna().
 *
 * Monetization invariants:
 *  - Charged / counted ONLY after a successful AI reply (charge-after-success).
 *  - Fallback + pricing-redirect replies are NEVER charged and NEVER counted.
 *  - Token charge is idempotent on the client-supplied eventId (safe retry).
 *  - Uses the org token system (consumeTokens, org-scoped via verified orgId).
 *
 * Privacy: message + reply CONTENT is never stored and never logged (dlog records
 * outcome flags only). The only Firestore writes are rate-limit / quota
 * bookkeeping (hashed-uid + counters) and the token-usage ledger — no content.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { checkCooldown, checkDailyCap, getDailyCount, incrDailyCount } from '../lib/rateLimit';
import { consumeTokens, ensureTokenCycleFresh, recordFreeUsage } from '../lib/tokens';
import { TOKEN_COSTS } from '../lib/token-costs';
import { dlog } from '../lib/log';
import {
  callLunaLLM, sanitizeInput, sanitizeRouteName, sanitizeLang, clampHistory, isPricingQuestion,
} from '../lib/luna-llm';
import type { AppEnv } from '../index';

const luna = new Hono<AppEnv>();

interface LunaBody { message?: unknown; routeName?: unknown; history?: unknown; lang?: unknown; eventId?: unknown }

// Per-user throttle (anti-burst) + a hard daily ceiling on model calls (backstop).
const THROTTLE_MS = 2500;
const DAILY_CAP = 100;
// Free Luna messages per user per day; after this each message costs tokens.
const FREE_PER_DAY = 3;
const LUNA_COST = TOKEN_COSTS['luna.message'];
const LUNA_ROLES = ['owner', 'admin', 'member', 'billing', 'client'] as const;

/**
 * Deterministic event id for a FREE Luna message when the client sends none.
 * Keyed by (uid, UTC day, index within the day's free allowance) — stable across
 * retries of the same message, distinct for the next one. Content is never part
 * of the key, so nothing about the message is derivable from the id.
 */
export function freeEventId(uid: string, freeIndex: number, now: Date = new Date()): string {
  return `luna_free_${uid}_${now.toISOString().slice(0, 10)}_${freeIndex}`;
}

luna.post('/api/luna/chat', requireAuth(), requireRole(LUNA_ROLES), async c => {
  const env = c.env as AppEnv['Bindings'] & { ANTHROPIC_API_KEY?: string; FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const uid   = c.get('uid')   as string;
  const orgId = c.get('orgId') as string;  // verified by requireRole
  const sa    = env.FIREBASE_SERVICE_ACCOUNT_JSON;

  let body: LunaBody;
  try { body = await c.req.json<LunaBody>(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const message = typeof body.message === 'string' ? sanitizeInput(body.message) : '';
  if (!message) return c.json({ error: 'message is required', code: 'INVALID_MESSAGE' }, 400);
  // routeName is interpolated into the system prompt — reduce to a safe route-id shape.
  const routeName = sanitizeRouteName(body.routeName);
  const lang = sanitizeLang(body.lang);
  const eventId = typeof body.eventId === 'string' && body.eventId ? body.eventId.slice(0, 80) : null;

  // Strict pricing guard — never calls the model, never counted/charged.
  if (isPricingQuestion(message)) {
    return c.json({
      text: "I can't advise on pricing or what to buy — but the Billing page lays out the plans so you can decide what fits.",
      action: { label: 'Open Billing', route: 'billing' },
    });
  }

  // Anti-burst cooldown + hard daily backstop (both keyed by uid).
  if (sa) {
    const rl = await checkCooldown(sa, 'luna', uid, THROTTLE_MS);
    if (!rl.ok) {
      return c.json({ error: 'Please wait a moment before sending another message.', code: 'RATE_LIMITED', retryAfterSec: rl.retryAfterSec }, 429);
    }
    const cap = await checkDailyCap(sa, 'luna_day', uid, DAILY_CAP);
    if (!cap.ok) {
      return c.json({ error: 'Daily Luna limit reached. Please try again tomorrow.', code: 'DAILY_LIMIT' }, 429);
    }
  }

  // Quota: first FREE_PER_DAY/day are free; after that the message costs tokens.
  // We only PEEK here; the free count is incremented (or tokens consumed) only
  // after a successful reply, so failed/fallback calls never consume quota.
  let freePath = true;
  // Index of THIS free message within the user's daily allowance (0-based),
  // captured BEFORE the post-success increment. Used to build a deterministic
  // event id when the client sends none — see the free branch below.
  let freeIndex = 0;
  if (sa) {
    const used = await getDailyCount(sa, 'luna_free', uid);
    freeIndex = used;
    freePath = used < FREE_PER_DAY;
    if (!freePath) {
      if (!eventId) return c.json({ error: 'missing eventId', code: 'INVALID_BODY' }, 400);
      // Pre-check balance so we can return 402 WITHOUT wasting a model call.
      try {
        const bal = await ensureTokenCycleFresh(sa, orgId);
        if (bal.balance < LUNA_COST) {
          return c.json({ code: 'INSUFFICIENT_TOKENS', balance: bal.balance, required: LUNA_COST, freeExhausted: true }, 402);
        }
      } catch { /* balance read hiccup — skip pre-check; consumeTokens enforces below */ }
    }
  }

  // No key configured → graceful deterministic fallback on the client (no charge).
  if (!env.ANTHROPIC_API_KEY) {
    dlog(env, '[luna] no key — fallback');
    return c.json({ fallback: true });
  }

  let reply;
  try {
    const history = clampHistory(body.history);
    reply = await callLunaLLM(env.ANTHROPIC_API_KEY, message, routeName, history, lang);
  } catch (err) {
    // Any LLM failure → deterministic responder client-side. NO charge, NO count.
    dlog(env, '[luna] llm failed — fallback:', err instanceof Error ? err.message : 'error');
    return c.json({ fallback: true });
  }

  // Success → commit usage (free count, or token charge). Best-effort: a billing
  // hiccup must not deny the reply the model already produced.
  if (sa) {
    if (freePath) {
      await incrDailyCount(sa, 'luna_free', uid);
      // Observability: free messages used to leave NO ledger trace, so Luna usage
      // was unmeasurable. Zero-cost record — balance untouched, pricing unchanged.
      //
      // Idempotency: the client always sends an eventId, but the free path does
      // not REQUIRE one (only the paid path 400s without it), so a client that
      // omits it must still get exactly one event per request. A random id made
      // every retry write a NEW free event, inflating usage counts. The fallback
      // id is now deterministic — (user, UTC day, nth free message of that day).
      // A retry of the SAME message reuses it (the counter only increments after
      // success, so freeIndex is unchanged) and dedupes via createIfNotExists;
      // a genuinely NEXT message has a higher freeIndex and gets its own event.
      try {
        await recordFreeUsage(sa, orgId, 'luna.message', uid,
          eventId ?? freeEventId(uid, freeIndex), { source: 'luna' });
      } catch (err) {
        dlog(env, '[luna] free-usage record failed:', err instanceof Error ? err.message : 'error');
      }
    } else if (eventId) {
      const charge = await consumeTokens(sa, orgId, 'luna.message', uid, eventId, { source: 'luna' });
      if (!charge.ok) dlog(env, '[luna] charge race — reply returned unbilled');
    }
  }

  // PII: never log message or reply text — outcome flags only.
  dlog(env, '[luna] reply ok — route:', reply.action?.route ?? '-', 'free:', freePath);
  return c.json(reply);
});

export default luna;
