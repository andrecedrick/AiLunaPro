import { describe, it, expect } from 'vitest';

/**
 * §27 P1.2 — subscription period bounds across Stripe API versions.
 *
 * The live webhook destination renders at `2023-10-16` while the SDK sends
 * `dahlia` on outbound calls, so BOTH payload shapes can legitimately reach one
 * deployment. The old code read the item shape only, and on a pre-`basil`
 * payload produced `new Date(NaN).toISOString()` — a throw that the route
 * answered 2xx, so Stripe filed the delivery as successful and never retried.
 * Each case below is one way that silence could come back.
 */

import {
  periodBounds, epochSecondsToIso, type PeriodBounds,
} from '../../worker/src/lib/subscription-period';
import type Stripe from 'stripe';

const START = 1_767_225_600;                       // 2026-01-01T00:00:00Z
const END   = 1_769_904_000;                       // 2026-02-01T00:00:00Z
const START_ISO = '2026-01-01T00:00:00.000Z';
const END_ISO   = '2026-02-01T00:00:00.000Z';

/** basil / dahlia: bounds on the subscription ITEM. */
const dahlia = (start: unknown = START, end: unknown = END) => ({
  id: 'sub_1',
  items: { data: [{ id: 'si_1', current_period_start: start, current_period_end: end }] },
}) as unknown as Stripe.Subscription;

/** pre-basil (2023-10-16): bounds on the SUBSCRIPTION object. */
const preBasil = (start: unknown = START, end: unknown = END) => ({
  id: 'sub_1',
  current_period_start: start,
  current_period_end: end,
  items: { data: [{ id: 'si_1' }] },
}) as unknown as Stripe.Subscription;

const bothNull: PeriodBounds = { start: null, end: null };

describe('epochSecondsToIso', () => {
  it('converts unix seconds', () => {
    expect(epochSecondsToIso(START)).toBe(START_ISO);
  });

  it('returns null instead of throwing on anything unusable', () => {
    for (const bad of [undefined, null, NaN, Infinity, -Infinity, '1767225600', {}, [], true]) {
      expect(epochSecondsToIso(bad)).toBeNull();
    }
  });

  it('returns null for a value that overflows the Date range', () => {
    // new Date(1e20).toISOString() throws RangeError — the exact class of bug
    // this module exists to prevent.
    expect(epochSecondsToIso(1e18)).toBeNull();
  });
});

describe('periodBounds — payload shapes', () => {
  it('reads the item shape (basil / dahlia)', () => {
    expect(periodBounds(dahlia())).toEqual({ start: START_ISO, end: END_ISO });
  });

  it('reads the subscription shape (2023-10-16)', () => {
    expect(periodBounds(preBasil())).toEqual({ start: START_ISO, end: END_ISO });
  });

  it('prefers the item when BOTH shapes are present', () => {
    const both = {
      id: 'sub_1',
      current_period_start: 1, current_period_end: 2,
      items: { data: [{ current_period_start: START, current_period_end: END }] },
    } as unknown as Stripe.Subscription;
    expect(periodBounds(both)).toEqual({ start: START_ISO, end: END_ISO });
  });

  it('resolves each bound independently', () => {
    const half = {
      id: 'sub_1',
      current_period_end: END,
      items: { data: [{ current_period_start: START }] },
    } as unknown as Stripe.Subscription;
    expect(periodBounds(half)).toEqual({ start: START_ISO, end: END_ISO });
  });
});

describe('periodBounds — never throws, never invents a date', () => {
  it('returns nulls when neither shape carries the fields', () => {
    const bare = { id: 'sub_1', items: { data: [{ id: 'si_1' }] } } as unknown as Stripe.Subscription;
    expect(periodBounds(bare)).toEqual(bothNull);
  });

  it('returns nulls for a subscription with no items at all', () => {
    expect(periodBounds({ id: 'sub_1' } as unknown as Stripe.Subscription)).toEqual(bothNull);
  });

  it('returns nulls for null / undefined', () => {
    expect(periodBounds(null)).toEqual(bothNull);
    expect(periodBounds(undefined)).toEqual(bothNull);
  });

  it('does not throw on malformed values — the original failure mode', () => {
    // `undefined` is covered by the bare-item case above: passing it here would
    // hit the helper's default arguments and silently test the happy path.
    for (const bad of [null, NaN, Infinity, 'soon', {}]) {
      expect(() => periodBounds(dahlia(bad, bad))).not.toThrow();
      expect(periodBounds(dahlia(bad, bad))).toEqual(bothNull);
    }
  });

  it('falls back to the subscription when the item value is unusable', () => {
    const mixed = {
      id: 'sub_1',
      current_period_start: START, current_period_end: END,
      items: { data: [{ current_period_start: null, current_period_end: NaN }] },
    } as unknown as Stripe.Subscription;
    expect(periodBounds(mixed)).toEqual({ start: START_ISO, end: END_ISO });
  });
});
