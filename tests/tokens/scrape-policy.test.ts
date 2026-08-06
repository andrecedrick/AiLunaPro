import { describe, it, expect } from 'vitest';

/*
 * Scrape enforcement policy (P2.1a).
 *
 * `/api/enrichment/run` reaches Apify, and an Apify run costs real money. Before
 * this module the route checked auth and role only — any owner on a Free plan
 * could spend the platform's Apify budget without limit. Every case below is a
 * way that could happen, or a way an enforcement bug could let it happen again.
 */

import {
  SCRAPE_POLICY_DEFAULTS, resolveScrapePolicy, planKey, canScrape,
  decideScrape, dayKey, monthKey,
  type ScrapePolicy, type ScrapeRequest,
} from '../../worker/src/lib/scrape-policy';

const P = SCRAPE_POLICY_DEFAULTS;

const req = (over: Partial<ScrapeRequest> = {}): ScrapeRequest => ({
  plan: 'Starter', scrapeClass: 'website',
  usedToday: 0, usedThisMonth: 0, balance: 1000, ...over,
});

describe('plan normalisation', () => {
  it('accepts the capitalised form written to subscriptions/current.plan', () => {
    expect(planKey('Starter')).toBe('starter');
    expect(planKey('Professional')).toBe('professional');
    expect(planKey('Enterprise')).toBe('enterprise');
  });

  it('treats anything unrecognised as Free — the safe direction', () => {
    // An unknown plan must get NO scrapes, never unlimited ones.
    for (const bad of ['Free', '', null, undefined, 'ENTERPRISE_TRIAL', 'comped', '  ']) {
      expect(planKey(bad)).toBe('free');
    }
  });

  it('canScrape is false for Free and true for every paid plan', () => {
    expect(canScrape('Free', P)).toBe(false);
    expect(canScrape(null, P)).toBe(false);
    expect(canScrape('Starter', P)).toBe(true);
    expect(canScrape('Professional', P)).toBe(true);
    expect(canScrape('Enterprise', P)).toBe(true);
  });
});

describe('the Free plan cannot reach Apify', () => {
  it('denies with PLAN_REQUIRED, not with a token error', () => {
    // Sending a Free user to the token shop would be useless: buying tokens
    // does not grant them scraping.
    const d = decideScrape(req({ plan: 'Free', balance: 999_999 }), P);
    expect(d.allowed).toBe(false);
    expect(d.code).toBe('PLAN_REQUIRED');
    expect(d.status).toBe(402);
  });

  it('denies even with an unlimited balance and zero usage', () => {
    expect(decideScrape(req({ plan: null, balance: 1e9 }), P).code).toBe('PLAN_REQUIRED');
  });
});

describe('caps', () => {
  it('denies at the daily cap with 429, before touching the balance', () => {
    const d = decideScrape(req({ plan: 'Starter', usedToday: 2, balance: 1e6 }), P);
    expect(d.code).toBe('DAILY_CAP_REACHED');
    expect(d.status).toBe(429);
  });

  it('allows the run that sits exactly at the cap boundary', () => {
    expect(decideScrape(req({ plan: 'Starter', usedToday: 1 }), P).allowed).toBe(true);
  });

  it('denies at the monthly cap even when the day is clear', () => {
    const d = decideScrape(req({ plan: 'Starter', usedToday: 0, usedThisMonth: 20 }), P);
    expect(d.code).toBe('MONTHLY_CAP_REACHED');
  });

  it('checks the daily cap before the monthly one', () => {
    // Both exceeded: the daily message is the actionable one — wait a day.
    const d = decideScrape(req({ plan: 'Starter', usedToday: 9, usedThisMonth: 99 }), P);
    expect(d.code).toBe('DAILY_CAP_REACHED');
  });

  it('bounds every paid plan', () => {
    expect(decideScrape(req({ plan: 'Professional', usedThisMonth: 100 }), P).code).toBe('MONTHLY_CAP_REACHED');
    expect(decideScrape(req({ plan: 'Enterprise',   usedThisMonth: 300 }), P).code).toBe('MONTHLY_CAP_REACHED');
    expect(decideScrape(req({ plan: 'Enterprise',   usedToday: 30 }), P).code).toBe('DAILY_CAP_REACHED');
  });
});

describe('cost by class', () => {
  it('prices a website run at 50 and a social run at 4200', () => {
    expect(decideScrape(req({ scrapeClass: 'website' }), P).cost).toBe(50);
    expect(decideScrape(req({ scrapeClass: 'social' }), P).cost).toBe(4200);
  });

  it('a Starter allocation covers exactly the monthly website cap', () => {
    // 20 runs x 50 tokens = 1000 = the Starter monthly allocation. The cap and
    // the ledger agree by construction, so the plan card cannot overstate.
    expect(P.monthlyCaps.starter * P.costs.website).toBe(1000);
  });

  it('a Starter allocation cannot fund one social run — the upsell, by design', () => {
    const d = decideScrape(req({ plan: 'Starter', scrapeClass: 'social', balance: 1000 }), P);
    expect(d.allowed).toBe(false);
    expect(d.code).toBe('INSUFFICIENT_TOKENS');
  });
});

describe('balance', () => {
  it('denies when the balance is below the cost', () => {
    const d = decideScrape(req({ balance: 49 }), P);
    expect(d.code).toBe('INSUFFICIENT_TOKENS');
    expect(d.status).toBe(402);
  });

  it('allows a balance exactly equal to the cost', () => {
    expect(decideScrape(req({ balance: 50 }), P).allowed).toBe(true);
  });

  it('warns, but NEVER blocks, when the run drops the balance under the floor', () => {
    // Blocking a purchase the customer can afford is a stronger action than the
    // goal ("never left near zero") requires.
    const d = decideScrape(req({ balance: 80 }), P);   // 80 - 50 = 30 < 60
    expect(d.allowed).toBe(true);
    expect(d.warnLowBalance).toBe(true);
  });

  it('does not warn when enough remains', () => {
    expect(decideScrape(req({ balance: 200 }), P).warnLowBalance).toBe(false);
  });

  it('minBalance = 0 disables the warning entirely', () => {
    const off: ScrapePolicy = { ...P, minBalance: 0 };
    expect(decideScrape(req({ balance: 51 }), off).warnLowBalance).toBe(false);
  });
});

describe('denial detail carries what the UI needs', () => {
  it('quotes the price even when denied, so the caller can render it', () => {
    const d = decideScrape(req({ plan: 'Free', scrapeClass: 'social' }), P);
    expect(d.cost).toBe(4200);
    expect(d.detail).toMatchObject({ plan: 'free', cost: 4200, monthlyCap: 0 });
  });
});

describe('configuration overrides code', () => {
  it('takes live values from the stored document', () => {
    const p = resolveScrapePolicy({
      scrapeCosts:       { website: 75, social: 5000 },
      scrapeDailyCaps:   { starter: 5 },
      scrapeMonthlyCaps: { starter: 50 },
      scrapeMinBalance:  100,
      scrapeMaxPages:    120,
    });
    expect(p.costs).toEqual({ website: 75, social: 5000 });
    expect(p.dailyCaps.starter).toBe(5);
    expect(p.monthlyCaps.starter).toBe(50);
    expect(p.minBalance).toBe(100);
    expect(p.maxPages).toBe(120);
  });

  it('keeps defaults for plans the document does not mention', () => {
    const p = resolveScrapePolicy({ scrapeDailyCaps: { starter: 5 } });
    expect(p.dailyCaps.enterprise).toBe(P.dailyCaps.enterprise);
    expect(p.dailyCaps.free).toBe(0);
  });

  it('falls back to defaults on a malformed value — never to zero', () => {
    // A config typo must not silently make every scrape free, nor silently
    // block every customer.
    const p = resolveScrapePolicy({
      scrapeCosts:      { website: 'oops', social: null },
      scrapeMinBalance: 'nope',
      scrapeMaxPages:   -5,
    });
    expect(p.costs).toEqual(P.costs);
    expect(p.minBalance).toBe(P.minBalance);
    expect(p.maxPages).toBeGreaterThanOrEqual(1);
  });

  it('an absent or empty document yields the committed defaults', () => {
    expect(resolveScrapePolicy(null)).toEqual(P);
    expect(resolveScrapePolicy({})).toEqual(P);
  });

  it('a config setting Free above zero would enable Free scraping — so it is honoured, and visible', () => {
    // Not a safety hole: it is an explicit operator action on a queryable doc,
    // and the test exists so the behaviour is deliberate rather than discovered.
    const p = resolveScrapePolicy({ scrapeMonthlyCaps: { free: 3 } });
    expect(canScrape('Free', p)).toBe(true);
  });
});

describe('counter windows are UTC', () => {
  it('keys the day and month in UTC, so a timezone change cannot reset a cap', () => {
    const at = new Date('2026-08-06T23:30:00.000Z');
    expect(dayKey(at)).toBe('2026-08-06');
    expect(monthKey(at)).toBe('2026-08');
  });

  it('rolls over at UTC midnight', () => {
    expect(dayKey(new Date('2026-08-06T23:59:59.999Z'))).toBe('2026-08-06');
    expect(dayKey(new Date('2026-08-07T00:00:00.000Z'))).toBe('2026-08-07');
  });
});
