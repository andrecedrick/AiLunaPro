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

    // Public quote flow — the in-app submit carries quoteId so the confirmation /
    // status pages can deep-link to the exact quote; the email Accept/Discuss CTA
    // lands here with ?action/?t, which the preserve-currentHash branch keeps.
    case 'quote/result':
      return route.quoteId ? `#/quote/result?quoteId=${encodeURIComponent(route.quoteId)}`
        : currentHash().startsWith('#/quote/result') ? currentHash() : '#/quote/result';
    case 'quote/status':
      return route.quoteId ? `#/quote/status?quoteId=${encodeURIComponent(route.quoteId)}`
        : currentHash().startsWith('#/quote/status') ? currentHash() : '#/quote/status';

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
