/**
 * Subscription period bounds, read across Stripe API versions (§27 P1.2).
 *
 * WHY THIS EXISTS. `current_period_start` / `current_period_end` moved from the
 * Subscription object onto its ITEMS in the `basil` generation. A webhook
 * destination renders its payload at ITS OWN pinned API version, which is not
 * necessarily the version the SDK sends on outbound calls — so one deployment
 * can legitimately receive both shapes. Reading only the item shape produced
 *
 *     undefined * 1000            -> NaN
 *     new Date(NaN).toISOString() -> RangeError: Invalid time value
 *
 * inside the webhook handler. That throw was caught and answered 2xx, so Stripe
 * recorded the delivery as SUCCESSFUL and never retried: the subscription was
 * silently never written, and every dashboard stayed green.
 *
 * The fix is to read whichever shape arrived and to return null — never an
 * invalid Date — when neither carries a usable timestamp. A missing renewal
 * date is a visible gap; a thrown handler is an invisible one.
 */

import type Stripe from 'stripe';

export interface PeriodBounds {
  /** ISO-8601, or null when the payload carries no usable value. */
  start: string | null;
  end:   string | null;
}

/**
 * Unix seconds -> ISO-8601, or null.
 *
 * Rejects non-numbers, NaN, Infinity AND values that overflow the Date range
 * (year > 275760). `new Date(x).toISOString()` throws on all of them, and this
 * function exists precisely so no caller has to remember that.
 */
export function epochSecondsToIso(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Period bounds from a subscription, whatever version rendered it.
 *
 * Item first (basil / dahlia), subscription object second (pre-basil). Each
 * bound resolves independently: a payload that carries one and not the other
 * yields one value and one null rather than discarding both.
 */
export function periodBounds(sub: Stripe.Subscription | null | undefined): PeriodBounds {
  const subFields  = (sub ?? {}) as unknown as Record<string, unknown>;
  const itemFields = (sub?.items?.data?.[0] ?? {}) as unknown as Record<string, unknown>;

  return {
    start: epochSecondsToIso(itemFields.current_period_start)
        ?? epochSecondsToIso(subFields.current_period_start),
    end:   epochSecondsToIso(itemFields.current_period_end)
        ?? epochSecondsToIso(subFields.current_period_end),
  };
}
