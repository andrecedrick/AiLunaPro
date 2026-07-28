/**
 * Route → hash-URL serializer (J5 Batch 4, hash-write-on-navigate, Phase 2).
 *
 * RouteContext writes the address bar on every navigate so that the URL
 * reflects the current in-app route and is directly shareable / reloadable.
 * This is the inverse of the on-mount hash parser in App.tsx.
 *
 * Returns `null` for routes that OWN their URL / query string — the caller
 * must then leave the current hash untouched. This protects:
 *   - accept-invite : carries #/invite/{orgId}/{inviteId}/{token} (token!)
 *   - billing/success : carries ?session_id (Stripe sync)
 *   - billing/tokens  : carries ?topup / ?session_id (top-up flow)
 * For `help`, the existing ?section query is preserved when already on /help.
 *
 * Scope: in-app routing only. No external/public endpoints.
 */

import type { Route } from '../../types/audit';

function currentHash(): string {
  return typeof window !== 'undefined' ? window.location.hash : '';
}

/**
 * Hash-URL → Route. The inverse of routeToHash, and the ONLY deep-link entry
 * point: it decides what a URL pasted into the address bar, or clicked in an
 * email, actually opens.
 *
 * Lifted verbatim out of an inline useEffect in App.tsx so it can be tested.
 * Living there, it was unreachable by any test, and two externally-linked routes
 * had silently never been given a branch:
 *   - `#/signup`  — the demo-request confirmation CTA
 *   - `#/billing` — the Stripe billing-portal return URL
 * Both fell through to the caller's default (dashboard), so the link "worked"
 * while landing on the wrong page.
 *
 * Returns `null` when no branch matches; the caller then leaves the current route
 * alone (preserving the previous fall-through behaviour exactly).
 *
 * ORDER IS SIGNIFICANT — every branch is a prefix match, so more specific paths
 * must precede their prefixes (`#/quote/result` before `#/quote`).
 */
export function routeFromHash(h: string): Route | null {
  if (h.startsWith('#/invite/'))                 return { name: 'accept-invite' };
  if (h.startsWith('#/signup'))                  return { name: 'signup' };
  if (h.startsWith('#/diagnostic'))              return { name: 'diagnostic' };
  if (h.startsWith('#/roi-calculator'))          return { name: 'roi-calculator' };
  if (h.startsWith('#/quote/result'))            return { name: 'quote/result' };
  if (h.startsWith('#/quote/status'))            return { name: 'quote/status' };
  if (h.startsWith('#/quote'))                   return { name: 'quote' };
  if (h.startsWith('#/invoices'))                return { name: 'invoices' };
  if (h.startsWith('#/admin'))                   return { name: 'admin' };
  if (h.startsWith('#/contacts'))                return { name: 'contacts' };
  if (h.startsWith('#/my-quotes'))               return { name: 'my-quotes' };
  if (h.startsWith('#/help'))                    return { name: 'help' };
  if (h.startsWith('#/operator'))                return { name: 'operator' };
  if (h.startsWith('#/system-builder'))          return { name: 'system-builder' };
  if (h.startsWith('#/worksheet'))               return { name: 'worksheet' };
  if (h.startsWith('#/visibility'))              return { name: 'visibility' };

  if (h.startsWith('#/audit-express/detail/')) {
    const id = decodeURIComponent(h.slice('#/audit-express/detail/'.length).split(/[?#]/)[0]);
    return id ? { name: 'audit-express/detail', auditId: id } : { name: 'audit-express/saved' };
  }
  if (h.startsWith('#/audit-express/saved'))     return { name: 'audit-express/saved' };
  if (h.startsWith('#/audit-express/run'))       return { name: 'audit-express/run' };
  if (h.startsWith('#/journey/start'))           return { name: 'journey/start' };
  if (h.startsWith('#/audit/result'))            return { name: 'audit/result' };
  if (h.startsWith('#/audit/assistance'))        return { name: 'audit/assistance' };
  if (h.startsWith('#/audit/new'))               return { name: 'audit/new' };
  if (h.startsWith('#/audit/history'))           return { name: 'audit/history' };

  if (h.startsWith('#/reports/share/')) {
    const id = decodeURIComponent(h.slice('#/reports/share/'.length).split(/[?#]/)[0]);
    return id ? { name: 'reports/share', reportId: id } : { name: 'reports' };
  }
  if (h.startsWith('#/reports/detail/')) {
    const id = decodeURIComponent(h.slice('#/reports/detail/'.length).split(/[?#]/)[0]);
    return id ? { name: 'reports/detail', reportId: id } : { name: 'reports' };
  }
  if (h.startsWith('#/reports'))                 return { name: 'reports' };

  // Bare `#/billing` ONLY. `#/billing/success` and `#/billing/tokens` carry Stripe
  // query params and are owned by the dedicated redirect effect in App.tsx — a
  // top-up routed to BillingSuccessPage produces a bogus "Sync failed", so they
  // must not be swallowed by this prefix.
  if (h.startsWith('#/billing')
      && !h.startsWith('#/billing/success')
      && !h.startsWith('#/billing/tokens'))      return { name: 'billing' };

  return null;
}

export function routeToHash(route: Route): string | null {
  switch (route.name) {
    // Routes that manage their own URL/query — never clobber.
    case 'accept-invite':
    case 'billing/success':
    case 'billing/tokens':
      return null;

    // Preserve the ?section deep-link when already on the Help page;
    // otherwise canonical #/help (HelpPage re-reads section from the hash).
    case 'help':
      return currentHash().startsWith('#/help') ? currentHash() : '#/help';

    // Public quote flow — the in-app submit carries quoteId (deep-link to the exact
    // quote) and the user's proposed budget (USD) so the confirmation / status pages
    // can show it. The email Accept/Discuss CTA lands here with ?action/?t, which the
    // preserve-currentHash branch keeps.
    case 'quote/result':
    case 'quote/status': {
      const base = `#/${route.name}`;
      const params: string[] = [];
      if (route.quoteId) params.push(`quoteId=${encodeURIComponent(route.quoteId)}`);
      if (typeof route.budgetUsd === 'number' && Number.isFinite(route.budgetUsd) && route.budgetUsd >= 0) {
        params.push(`budgetUsd=${Math.round(route.budgetUsd)}`);
      }
      if (params.length) return `${base}?${params.join('&')}`;
      return currentHash().startsWith(base) ? currentHash() : base;
    }

    // Invoices — email CTAs + the status page deep-link with ?quoteId / ?invoiceId.
    // Serialize an explicit quoteId; otherwise preserve the landing query so
    // InvoicesPage can focus + scroll to the exact card.
    case 'invoices':
      return route.quoteId ? `#/invoices?quoteId=${encodeURIComponent(route.quoteId)}`
        : currentHash().startsWith('#/invoices') ? currentHash() : '#/invoices';

    case 'dashboard':
      return '#/';

    // Parametric routes — mirror the App.tsx parser (encode the id).
    case 'reports/detail':
      return `#/reports/detail/${encodeURIComponent(route.reportId)}`;
    case 'reports/share':
      return `#/reports/share/${encodeURIComponent(route.reportId)}`;
    case 'agents/detail':
      return `#/agents/detail/${encodeURIComponent(route.agentId)}`;

    // All remaining routes are path-like names → #/<name>.
    default:
      return `#/${route.name}`;
  }
}
