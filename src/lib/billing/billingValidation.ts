/**
 * Validation + secret-stripping helpers for I.6 billing metadata.
 *
 * RULES:
 * - Price ID format:   `price_<alnum>` or empty/null (= clear)
 * - Return URL format: `https://...` OR `http://localhost(:port)?(/path)?`
 *                      (localhost http allowed for dev/test mode)
 * - Label length:      max 50 chars, may be empty/null
 * - Secret stripper:   removes any field whose name matches forbidden keys
 *                      so a UI bug or attacker payload cannot smuggle secrets.
 */

import type { BillingMetadata, PlanKey } from '../../types/billingMetadata';

/* ── Price ID ────────────────────────────────────────────── */

const PRICE_ID_RE = /^price_[a-zA-Z0-9]+$/;

export function isValidPriceId(s: string | null | undefined): boolean {
  if (s == null || s === '') return true; // empty = clear
  if (typeof s !== 'string') return false;
  return PRICE_ID_RE.test(s);
}

/* ── Return URL ──────────────────────────────────────────── */
/**
 * Allow:
 *   - https://anything
 *   - http://localhost OR http://localhost:port  (with optional path)
 *   - http://127.0.0.1 OR http://127.0.0.1:port (with optional path)
 * Deny:
 *   - http://anything-else
 *   - any non-http(s) scheme
 */
const HTTPS_RE     = /^https:\/\/[^\s]+$/i;
const LOCALHOST_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/[^\s]*)?$/i;

export function isValidReturnUrl(s: string | null | undefined): boolean {
  if (s == null || s === '') return true; // empty = use defaults
  if (typeof s !== 'string') return false;
  return HTTPS_RE.test(s) || LOCALHOST_RE.test(s);
}

/* ── Label ───────────────────────────────────────────────── */

export function isValidLabel(s: string | null | undefined): boolean {
  if (s == null || s === '') return true;
  if (typeof s !== 'string') return false;
  return s.length <= 50;
}

/* ── Secret-name guard ───────────────────────────────────── */
/**
 * Field names that MUST NEVER appear in BillingMetadata.
 * Defense-in-depth: even if the UI accidentally adds an input with one of
 * these names, the validator strips it before write.
 */
const FORBIDDEN_KEY_RE =
  /^(secret|webhook_secret|stripe_secret|stripe_secret_key|secret_key|api_key|apikey|password|token|auth|authorization|credential|private_key|publishable_key|stripe_publishable_key)$/i;

export function isForbiddenKey(name: string): boolean {
  return FORBIDDEN_KEY_RE.test(name);
}

/**
 * Recursively strip any object key whose name matches FORBIDDEN_KEY_RE.
 * Returns the count of stripped keys (for logging/telemetry).
 */
export function stripSecrets(obj: unknown): { cleaned: unknown; stripped: number } {
  let stripped = 0;
  function walk(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) {
        if (isForbiddenKey(k)) {
          stripped += 1;
          continue;
        }
        out[k] = walk(val);
      }
      return out;
    }
    return v;
  }
  return { cleaned: walk(obj), stripped };
}

/* ── Whole-payload validator ─────────────────────────────── */

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<string, string>>;
}

export function validateMetadata(input: BillingMetadata): ValidationResult {
  const errors: Partial<Record<string, string>> = {};

  (['starter', 'professional', 'enterprise'] as PlanKey[]).forEach(p => {
    if (!isValidPriceId(input.priceIds?.[p])) {
      errors[`priceIds.${p}`] = 'Must be empty or match price_<alnum>';
    }
    if (!isValidLabel(input.labels?.[p])) {
      errors[`labels.${p}`] = 'Max 50 characters';
    }
  });

  if (!isValidReturnUrl(input.returnUrls?.success)) {
    errors['returnUrls.success'] = 'Must be https:// or http://localhost';
  }
  if (!isValidReturnUrl(input.returnUrls?.cancel)) {
    errors['returnUrls.cancel'] = 'Must be https:// or http://localhost';
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

/* ── Whitelist sanitizer (final defense before write) ────── */
/**
 * Returns a shape-clean BillingMetadata derived only from whitelisted fields
 * of the input. Any extra top-level or nested keys are dropped.
 * Combine with stripSecrets() for double protection.
 */
export function sanitizeMetadata(input: unknown): BillingMetadata {
  const i = (input ?? {}) as Partial<BillingMetadata>;
  const pick = (v: unknown): string | null =>
    typeof v === 'string' && v.length > 0 ? v : null;

  return {
    priceIds: {
      starter:      pick(i.priceIds?.starter),
      professional: pick(i.priceIds?.professional),
      enterprise:   pick(i.priceIds?.enterprise),
    },
    returnUrls: {
      success: pick(i.returnUrls?.success),
      cancel:  pick(i.returnUrls?.cancel),
    },
    labels: {
      starter:      pick(i.labels?.starter),
      professional: pick(i.labels?.professional),
      enterprise:   pick(i.labels?.enterprise),
    },
  };
}
