/**
 * Frontend client for Stripe worker endpoints — Phase J1.2 (final).
 *
 * Strategy:
 *   - DEV: WORKER_BASE = '' → calls relative /api/... routed by Vite proxy
 *     (vite.config.ts proxy entries). Avoids CORS preflight + IPv6/IPv4
 *     localhost ambiguity.
 *   - PROD: WORKER_BASE = VITE_WORKER_URL (https://api.ailunapro.com or similar)
 *
 * Override either via VITE_WORKER_URL in .env.local.
 *
 * No Stripe SDK on the frontend. No secret keys here.
 */

const RAW_BASE = (import.meta.env.VITE_WORKER_URL as string | undefined) ?? '';
// Strip trailing slash for clean concat.
export const WORKER_BASE = RAW_BASE.replace(/\/+$/, '');

export class CheckoutError extends Error {
  url: string;
  cause: unknown;
  constructor(url: string, cause: unknown, message: string) {
    super(message);
    this.name  = 'CheckoutError';
    this.url   = url;
    this.cause = cause;
  }
}

export class PortalError extends Error {
  url: string;
  cause: unknown;
  constructor(url: string, cause: unknown, message: string) {
    super(message);
    this.name  = 'PortalError';
    this.url   = url;
    this.cause = cause;
  }
}

export class WorkerFetchError extends Error {
  url: string;
  cause: unknown;
  constructor(url: string, cause: unknown, message: string) {
    super(message);
    this.name  = 'WorkerFetchError';
    this.url   = url;
    this.cause = cause;
  }
}

interface PostOptions {
  errorClass?: 'checkout' | 'portal' | 'generic';
  logTag?:     string;
}

async function workerPost<T>(
  path: string,
  body: unknown,
  idToken: string,
  opts: PostOptions = {},
): Promise<T> {
  const url = `${WORKER_BASE}${path}`;
  console.log(`[${opts.logTag ?? 'worker'}] POST`, url, 'body=', body);

  let res: Response;
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    console.error(`[${opts.logTag ?? 'worker'}] fetch failed:`, err, '→', url);
    const cls = opts.errorClass ?? 'generic';
    if (cls === 'checkout') throw new CheckoutError(url, err, `${msg} (${url})`);
    if (cls === 'portal')   throw new PortalError(url, err, `${msg} (${url})`);
    throw new WorkerFetchError(url, err, `${msg} (${url})`);
  }

  if (!res.ok) {
    const e = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(e.error ?? `Worker error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function workerGet<T>(
  path: string,
  idToken: string,
  logTag: string,
): Promise<T> {
  const url = `${WORKER_BASE}${path}`;
  console.log(`[${logTag}] GET`, url);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    console.error(`[${logTag}] fetch failed:`, err, '→', url);
    throw new WorkerFetchError(url, err, `${msg} (${url})`);
  }

  if (!res.ok) {
    const e = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(e.error ?? `Worker error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Checkout ──────────────────────────────────────────────

export async function createCheckoutSession(
  orgId: string,
  plan: 'starter' | 'professional' | 'enterprise',
  idToken: string,
  productId?: string,
  currency?: string,
): Promise<string> {
  const { url } = await workerPost<{ url: string }>(
    '/api/billing/checkout',
    {
      orgId,
      plan,
      ...(productId ? { productId } : {}),
      ...(currency  ? { currency  } : {}),
    },
    idToken,
    { errorClass: 'checkout', logTag: 'billing checkout' },
  );
  return url;
}

// ── Portal ────────────────────────────────────────────────

export async function createPortalSession(
  orgId: string,
  idToken: string,
): Promise<string> {
  const { url } = await workerPost<{ url: string }>(
    '/api/billing/portal',
    { orgId },
    idToken,
    { errorClass: 'portal', logTag: 'billing portal' },
  );
  return url;
}

// ── Sync session ──────────────────────────────────────────

export interface SyncedSubscription {
  stripeCustomerId:     string;
  stripeSubscriptionId: string;
  stripeProductId:      string | null;
  plan:                 'Starter' | 'Professional' | 'Enterprise';
  status:               string;
  currentPeriodStart:   string | null;
  currentPeriodEnd:     string | null;
  cancelAtPeriodEnd:    boolean;
  updatedAt:            string;
}

export async function syncSession(
  sessionId: string,
  idToken:   string,
  orgId?:    string,
): Promise<{ orgId: string; subscription: SyncedSubscription }> {
  const res = await workerPost<{ ok: true; orgId: string; subscription: SyncedSubscription }>(
    '/api/billing/sync-session',
    { sessionId, ...(orgId ? { orgId } : {}) },
    idToken,
    { logTag: 'billing sync' },
  );
  return { orgId: res.orgId, subscription: res.subscription };
}

// ── Invoices ──────────────────────────────────────────────

export interface StripeInvoice {
  id:               string;
  number:           string | null;
  status:           string | null;
  amountPaid:       number;
  amountDue:        number;
  currency:         string;
  created:          number;
  hostedInvoiceUrl: string | null;
  invoicePdf:       string | null;
  periodStart:      number | null;
  periodEnd:        number | null;
}

export async function fetchInvoices(orgId: string, idToken: string): Promise<StripeInvoice[]> {
  const res = await workerGet<{ invoices: StripeInvoice[] }>(
    `/api/billing/invoices?orgId=${encodeURIComponent(orgId)}`,
    idToken,
    'billing invoices',
  );
  return res.invoices;
}
