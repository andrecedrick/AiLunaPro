/**
 * Frontend service for the platform-operator check (J5 Batch 3).
 *
 * Calls GET /api/platform/me and returns whether the current user is an
 * allowlisted platform operator. Fail-closed: mock auth, no API URL, no token,
 * or any error → false (operator surfaces stay hidden).
 *
 * Platform admins are NOT org members — this is independent of session.role.
 */

import { resolveLayer } from '../featureFlags';
import { WORKER_BASE } from '../billing/stripeClient';

async function getIdToken(): Promise<string | null> {
  try {
    const { auth } = await import('../firebase-auth');
    const user = auth.currentUser;
    if (!user) return null;
    // Force refresh: email_verified is baked into the ID token. After verifying
    // an email, the cached token still carries email_verified=false until it
    // expires (~1h). Force a refresh so the platform-admin check sees the
    // current claim without requiring a full sign-out/sign-in.
    return await user.getIdToken(true);
  } catch {
    return null;
  }
}

export interface PlatformMe {
  isPlatformAdmin: boolean;
  /** Super admin = platform operator OR a quote/invoice admin (ADMIN_EMAILS). Gates the Admin Center. */
  isSuperAdmin: boolean;
  /** Caller's own verified-email state. null when unknown (mock/no token/error). */
  emailVerified: boolean | null;
}

export async function fetchPlatformMe(): Promise<PlatformMe> {
  const authLayer = resolveLayer('auth');

  // Mock auth → no real Firebase token → not a platform admin (fail-closed).
  // NOTE: base URL is WORKER_BASE (VITE_WORKER_URL), same as stripeClient.
  // In DEV it is '' (relative, proxied by Vite); in PROD it is the API origin.
  // Do NOT gate on truthiness of the base — '' is a valid relative base.
  if (authLayer === 'mock') return { isPlatformAdmin: false, isSuperAdmin: false, emailVerified: null };

  const token = await getIdToken();
  if (!token) return { isPlatformAdmin: false, isSuperAdmin: false, emailVerified: null };

  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { isPlatformAdmin: false, isSuperAdmin: false, emailVerified: null };
    const data = (await res.json()) as { isPlatformAdmin?: boolean; isSuperAdmin?: boolean; emailVerified?: boolean };
    return {
      isPlatformAdmin: data.isPlatformAdmin === true,
      isSuperAdmin: data.isSuperAdmin === true,
      emailVerified: typeof data.emailVerified === 'boolean' ? data.emailVerified : null,
    };
  } catch {
    // Fail-closed (e.g. ERR_BLOCKED_BY_CLIENT from an ad-blocker/privacy ext).
    return { isPlatformAdmin: false, isSuperAdmin: false, emailVerified: null };
  }
}

/** Back-compat boolean helper. */
export async function fetchIsPlatformAdmin(): Promise<boolean> {
  return (await fetchPlatformMe()).isPlatformAdmin;
}

/* ── Platform token economy (Phase 4) ─────────────────── */

/** Per-action cross-org rollup. Organizations are COUNTED, never listed. */
export interface PlatformActionUsage {
  action:   string;
  count:    number;
  tokens:   number;
  free:     number;
  included: number;
  overflow: number;
  unknown:  number;
  orgs:     number;
}

export interface PlatformTokenUsage {
  byAction:    PlatformActionUsage[];
  totals:      { count: number; tokens: number; free: number; included: number; overflow: number; unknown: number; orgs: number };
  scanned:     number;
  capped:      boolean;
  generatedAt: number;
}

/**
 * Cross-org token aggregates for platform operators. Aggregates only — the
 * response carries no emails, names or uids. Returns null on any failure so the
 * operator surface degrades quietly instead of breaking the page.
 */
export async function fetchPlatformTokenUsage(): Promise<PlatformTokenUsage | null> {
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/token-usage`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as PlatformTokenUsage;
  } catch {
    return null;
  }
}

/* ── Production alerts (read-only) ─────────────────────── */

/** A persisted billing/production alert. Operational ids only — no PII. */
export interface ProductionAlert {
  id:        string;
  kind:      string;
  severity:  string;   // 'critical' | 'warning'
  status:    string;   // 'open' | 'resolved'
  orgId:     string;
  sessionId: string;
  invoiceId: string;
  message:   string;
  context:   Record<string, unknown>;
  at:        string;
}

export interface ProductionAlerts {
  alerts:       ProductionAlert[];
  total:        number;
  openCritical: number;
  capped:       boolean;
  generatedAt:  number;
}

/**
 * Durable production alerts for platform operators (token-credit failures,
 * invoice mismatches, and any future billing-alert kind). Read-only. Returns
 * null on any failure so the operator surface degrades quietly.
 */
export async function fetchPlatformAlerts(): Promise<ProductionAlerts | null> {
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as ProductionAlerts;
  } catch {
    return null;
  }
}

/* ── Customer Feedback Center + Support Inbox (read-only) ── */

/** One anonymous feedback entry. No uid/email/orgId is ever captured. */
export interface FeedbackItem {
  id: string; source: string; satisfaction: string; difficulty: string;
  blocker: string; suggestion: string; country: string; createdAt: string;
}

/** Deterministic signal bucket — an exact-count tally, never an AI summary. */
export interface SignalCount { value: string; count: number }

export interface PlatformFeedback {
  items: FeedbackItem[];
  total: number; rated: number;
  positive: number; negative: number;
  positivePct: number; negativePct: number;
  avgDifficulty: number | null;
  topBlockers: SignalCount[];
  topSuggestions: SignalCount[];
  topSources: SignalCount[];
  capped: boolean;
}

/** One operator reply in a ticket's conversation history. */
export interface TicketReply { message: string; repliedAt: string; repliedBy: string }

/** A support ticket. Carries submitter contact details — operators only. */
export interface SupportTicketItem {
  id: string; type: string; status: string; email: string; phone: string;
  page: string; description: string; priority: string; country: string; createdAt: string;
  replies: TicketReply[]; closedAt: string; closedBy: string;
}

export interface PlatformSupport {
  items: SupportTicketItem[];
  total: number; open: number; awaiting: number;
  byType: SignalCount[];
  topPages: SignalCount[];
  capped: boolean;
}

/** Anonymous product feedback + deterministic Customer Signals. Operators only. */
export async function fetchPlatformFeedback(): Promise<PlatformFeedback | null> {
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/feedback`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return (await res.json()) as PlatformFeedback;
  } catch { return null; }
}

/** Support tickets (incl. email + phone — operator-gated). */
export async function fetchPlatformSupport(): Promise<PlatformSupport | null> {
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/support`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return (await res.json()) as PlatformSupport;
  } catch { return null; }
}

/** Reply to a ticket (appends to history, flips to answered, emails the contact). */
export async function replyToTicket(ticketId: string, message: string): Promise<{ ok: boolean; emailed: boolean }> {
  const token = await getIdToken();
  if (!token) return { ok: false, emailed: false };
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/support/reply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, message }),
    });
    if (!res.ok) return { ok: false, emailed: false };
    const j = await res.json() as { ok?: boolean; emailed?: boolean };
    return { ok: j.ok === true, emailed: j.emailed === true };
  } catch { return { ok: false, emailed: false }; }
}

/** Set a ticket status (open | answered | closed). */
export async function setTicketStatus(ticketId: string, status: 'open' | 'answered' | 'closed'): Promise<boolean> {
  const token = await getIdToken();
  if (!token) return false;
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/support/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status }),
    });
    return res.ok;
  } catch { return false; }
}

/** A durable, actionable notification (bell + panel). No PII. */
export interface NotificationItem {
  id: string; audience: string; type: string;
  targetType: string; targetId: string; route: string;
  title: string; severity: string; read: boolean; readAt: string; at: string;
}
export interface NotificationsResult {
  items: NotificationItem[];
  unreadCount: number;
  total: number;
}

/**
 * The caller's notifications (durable, read/unread). Every authed user gets their
 * own user notifications; platform admins additionally get operator ones. Filter:
 * 'all' | 'unread' | 'read'.
 */
export async function fetchNotifications(filter: 'all' | 'unread' | 'read' = 'all'): Promise<NotificationsResult | null> {
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/notifications?filter=${filter}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return (await res.json()) as NotificationsResult;
  } catch { return null; }
}

/** Mark one notification read (caller-owned only). */
export async function markNotificationRead(id: string): Promise<boolean> {
  const token = await getIdToken();
  if (!token) return false;
  try {
    const res = await fetch(`${WORKER_BASE}/api/notifications/read`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.ok;
  } catch { return false; }
}

/** Mark all the caller's notifications read. */
export async function markAllNotificationsRead(): Promise<boolean> {
  const token = await getIdToken();
  if (!token) return false;
  try {
    const res = await fetch(`${WORKER_BASE}/api/notifications/read-all`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch { return false; }
}

/** Lightweight open-critical alert signal for a proactive badge. No PII. */
export interface AlertNotify {
  openCritical: number;
  latestKind:   string;
  latestAt:     string;
}

/**
 * Cheap notification signal — the count of open critical alerts (+ newest kind).
 * Returns null on failure so the badge simply doesn't show.
 */
export async function fetchAlertNotify(): Promise<AlertNotify | null> {
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/platform/alerts/notify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as AlertNotify;
  } catch {
    return null;
  }
}
