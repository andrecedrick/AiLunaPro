import { describe, it, expect } from 'vitest';
import { routeFromHash, routeToHash } from '../../src/lib/routing/hashRoute';
import type { Route } from '../../src/types/audit';

/*
 * Deep-link parser.
 *
 * routeFromHash decides what a URL pasted in the address bar — or clicked in a
 * transactional email — actually opens. It used to live inline in an App.tsx
 * useEffect where no test could reach it, and two externally-linked routes had
 * silently never been given a branch:
 *
 *   #/signup   the demo-request confirmation CTA  → landed on the dashboard
 *   #/billing  the Stripe billing-portal return   → landed on the dashboard
 *
 * The link "worked" (200, page rendered) while opening the wrong page, which is
 * why neither showed up as a failure anywhere.
 *
 * Every pre-existing branch is asserted too: the chain was lifted verbatim, and
 * these cases are what prove the extraction changed no behaviour.
 */

const name = (h: string) => routeFromHash(h)?.name ?? null;

describe('routeFromHash — the two broken deep links', () => {
  it('#/signup opens the signup page (was: dashboard)', () => {
    expect(name('#/signup')).toBe('signup');
  });

  it('the exact CTA_URL the worker sends resolves to signup', () => {
    // Mirrors demo-request.ts: `${APP_BASE_URL}/#/signup`.
    const cta = 'https://audit.ailunapro.com/#/signup';
    expect(name(cta.slice(cta.indexOf('#')))).toBe('signup');
  });

  it('#/signup tolerates a trailing query (email trackers append one)', () => {
    expect(name('#/signup?utm_source=email')).toBe('signup');
  });

  it('bare #/billing opens billing (was: dashboard)', () => {
    expect(name('#/billing')).toBe('billing');
  });

  it('#/billing?status=cancel still opens billing', () => {
    expect(name('#/billing?status=cancel')).toBe('billing');
  });
});

describe('routeFromHash — Stripe paths stay owned by the redirect effect', () => {
  it('#/billing/success is NOT swallowed by the bare-billing prefix', () => {
    // Returning `billing` here would strand the subscription sync.
    expect(name('#/billing/success?session_id=cs_test_1')).not.toBe('billing');
    expect(name('#/billing/success?session_id=cs_test_1')).toBeNull();
  });

  it('#/billing/tokens is NOT swallowed either', () => {
    // A top-up routed to BillingSuccessPage produces a bogus "Sync failed".
    expect(name('#/billing/tokens?topup=success&session_id=cs_test_1')).toBeNull();
  });
});

describe('routeFromHash — pre-existing branches (extraction parity)', () => {
  it.each([
    ['#/invite/org1/inv1/tok',  'accept-invite'],
    ['#/diagnostic',            'diagnostic'],
    ['#/roi-calculator',        'roi-calculator'],
    ['#/quote/result?quoteId=1','quote/result'],
    ['#/quote/status?t=abc',    'quote/status'],
    ['#/quote',                 'quote'],
    ['#/invoices?quoteId=q1',   'invoices'],
    ['#/admin',                 'admin'],
    ['#/contacts',              'contacts'],
    ['#/my-quotes',             'my-quotes'],
    ['#/help?section=billing',  'help'],
    ['#/operator',              'operator'],
    ['#/system-builder',        'system-builder'],
    ['#/worksheet',             'worksheet'],
    ['#/visibility',            'visibility'],
    ['#/audit-express/saved',   'audit-express/saved'],
    ['#/audit-express/run',     'audit-express/run'],
    ['#/journey/start',         'journey/start'],
    ['#/audit/result',          'audit/result'],
    ['#/audit/assistance',      'audit/assistance'],
    ['#/audit/new',             'audit/new'],
    ['#/audit/history',         'audit/history'],
    ['#/reports',               'reports'],
  ])('%s → %s', (hash, expected) => {
    expect(name(hash)).toBe(expected);
  });

  it('specific paths win over their prefixes', () => {
    // #/quote/result must not be captured by #/quote.
    expect(name('#/quote/result')).toBe('quote/result');
    expect(name('#/audit/result')).toBe('audit/result');
  });
});

describe('routeFromHash — parametric routes', () => {
  it('extracts and decodes the report id', () => {
    expect(routeFromHash('#/reports/detail/abc%20123')).toEqual({ name: 'reports/detail', reportId: 'abc 123' });
    expect(routeFromHash('#/reports/share/r1')).toEqual({ name: 'reports/share', reportId: 'r1' });
  });

  it('extracts the audit-express id and strips a query', () => {
    expect(routeFromHash('#/audit-express/detail/a1?x=1')).toEqual({ name: 'audit-express/detail', auditId: 'a1' });
  });

  it('falls back to the list when the id is missing', () => {
    expect(name('#/reports/detail/')).toBe('reports');
    expect(name('#/reports/share/')).toBe('reports');
    expect(name('#/audit-express/detail/')).toBe('audit-express/saved');
  });
});

describe('routeFromHash — no match', () => {
  it.each(['', '#/', '#/nope', '#/does-not-exist', 'not-a-hash'])('%s → null (caller keeps its route)', h => {
    expect(routeFromHash(h)).toBeNull();
  });
});

describe('routeToHash → routeFromHash round trip', () => {
  it.each([
    'signup', 'billing', 'admin', 'contacts', 'my-quotes', 'reports',
    'worksheet', 'visibility', 'operator', 'system-builder', 'diagnostic',
    'roi-calculator', 'audit/new', 'audit/history', 'journey/start',
  ])('%s survives serialize → parse', n => {
    const hash = routeToHash({ name: n } as Route);
    expect(hash).not.toBeNull();
    expect(name(hash!)).toBe(n);
  });
});
