/**
 * Luna AI chat route — S3 Phase 2.
 *
 *   POST /api/luna/chat   (requireAuth — authenticated users only)
 *
 * Free, per-user rate-limited. The user's question is answered by Claude
 * (claude-haiku-4-5) grounded strictly in the curated knowledge base. Pricing /
 * purchase questions are short-circuited to Billing WITHOUT a model call. On any
 * failure (no key, API error, refusal) the response is { fallback: true } and the
 * frontend falls back to the deterministic answerLuna().
 *
 * Privacy: message + reply CONTENT is never stored and never logged (dlog
 * records outcome flags only). The only Firestore write is the rate-limit
 * bookkeeping — a one-way-hashed uid + a timestamp/daily-count, no content.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { checkCooldown, checkDailyCap } from '../lib/rateLimit';
import { dlog } from '../lib/log';
import {
  callLunaLLM, sanitizeInput, sanitizeRouteName, clampHistory, isPricingQuestion,
} from '../lib/luna-llm';
import type { AppEnv } from '../index';

const luna = new Hono<AppEnv>();

interface LunaBody { message?: unknown; routeName?: unknown; history?: unknown }

// Per-user throttle: one message per this window (anti-burst). Conversational
// pace is well within it; rapid-fire is blocked.
const THROTTLE_MS = 2500;
// Hard per-user daily ceiling on model calls — bounds worst-case cost.
const DAILY_CAP = 100;

luna.post('/api/luna/chat', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & { ANTHROPIC_API_KEY?: string; FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const uid = c.get('uid');

  let body: LunaBody;
  try { body = await c.req.json<LunaBody>(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const message = typeof body.message === 'string' ? sanitizeInput(body.message) : '';
  if (!message) return c.json({ error: 'message is required', code: 'INVALID_MESSAGE' }, 400);
  // routeName is interpolated into the system prompt — reduce to a safe route-id shape.
  const routeName = sanitizeRouteName(body.routeName);

  // Strict pricing guard — never calls the model.
  if (isPricingQuestion(message)) {
    return c.json({
      text: "I can't advise on pricing or what to buy — but the Billing page lays out the plans so you can decide what fits.",
      action: { label: 'Open Billing', route: 'billing' },
    });
  }

  // Per-user rate limit (keyed by uid): anti-burst cooldown + a hard daily cap
  // that bounds worst-case cost per user.
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const rl = await checkCooldown(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'luna', uid, THROTTLE_MS);
    if (!rl.ok) {
      return c.json({ error: 'Please wait a moment before sending another message.', code: 'RATE_LIMITED', retryAfterSec: rl.retryAfterSec }, 429);
    }
    const cap = await checkDailyCap(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'luna_day', uid, DAILY_CAP);
    if (!cap.ok) {
      return c.json({ error: 'Daily Luna limit reached. Please try again tomorrow.', code: 'DAILY_LIMIT' }, 429);
    }
  }

  // No key configured → graceful deterministic fallback on the client.
  if (!env.ANTHROPIC_API_KEY) {
    dlog(env, '[luna] no key — fallback');
    return c.json({ fallback: true });
  }

  try {
    const history = clampHistory(body.history);
    const reply = await callLunaLLM(env.ANTHROPIC_API_KEY, message, routeName, history);
    // PII: never log the message or the reply text — outcome only.
    dlog(env, '[luna] reply ok — route:', reply.action?.route ?? '-');
    return c.json(reply);
  } catch (err) {
    // Any failure (API error, refusal, empty) → client uses the deterministic responder.
    dlog(env, '[luna] llm failed — fallback:', err instanceof Error ? err.message : 'error');
    return c.json({ fallback: true });
  }
});

export default luna;
