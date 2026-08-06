/**
 * Audit Enrichment API (cahier §26.10).
 *
 *   GET  /api/enrichment/snapshots  → recent snapshots for the workspace
 *   GET  /api/enrichment/report     → the assembled findings view for one snapshot
 *   POST /api/enrichment/run        → collect a new snapshot (owner/admin)
 *
 * The read routes serve STORED evidence only. No live web call happens on a
 * report view: the same snapshot always renders the same findings, which is the
 * whole reproducibility claim (§26.6).
 *
 * Tenant isolation: every route requires orgId and verifies
 * `organizations/{orgId}/members/{uid}`. Snapshots live under the org document,
 * so a member of one workspace cannot read another's evidence.
 */

import { Hono, type Context } from 'hono';
import type { AppEnv } from '../index';
import { verifyIdToken } from '../middleware/auth';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { consumeTokens, incrementBalance, ensureTokenCycleFresh } from '../lib/tokens';
import { allocationForPlan } from '../lib/token-costs';
import { recordBillingAlert } from '../lib/billing-alerts';
import {
  resolveScrapePolicy, decideScrape,
  type ScrapeClass, type ScrapeDenialCode,
} from '../lib/scrape-policy';
import { countScrapeUsage, SCRAPE_ACTION } from '../lib/scrape-quota';
import { listSnapshots } from '../lib/enrichment-store';
import { loadEnrichmentReport } from '../lib/enrichment-report';
import { runEnrichment } from '../lib/enrichment-pipeline';
import { ApifyCollector, buildApifyConfig } from '../lib/apify-collector';
import { AgentReachCollector } from '../lib/agent-reach-collector';
import { buildBridgeConfig } from '../lib/agent-reach-client';
import type { EnrichmentCollector } from '../lib/enrichment-collector';
import { dlog } from '../lib/log';

const enrichment = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const SURFACES = new Set(['audit_express', 'full_audit', 'diagnostic']);

const safeId = (raw: unknown): string => {
  const s = typeof raw === 'string' ? raw : '';
  return /^[A-Za-z0-9._-]{1,128}$/.test(s) ? s : '';
};

/**
 * Accept a domain the customer asserts. Ownership is NOT verified (§26.15) —
 * that was an explicit product decision to avoid onboarding friction — but the
 * value still has to be a plausible hostname before it reaches a collector.
 */
export function normaliseDomain(raw: unknown): string {
  let s = (typeof raw === 'string' ? raw : '').trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split(':')[0];
  if (s.length > 253) return '';
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(s) ? s : '';
}

interface Gate { uid: string; role: string }
async function gate(c: Context<AppEnv>, orgId: string): Promise<Gate | Response> {
  const env = c.env as Bindings;
  c.header('Cache-Control', 'no-store');
  const authHeader = c.req.header('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const uid = await verifyIdToken(bearer, env.FIREBASE_PROJECT_ID);
  if (!uid) return c.json({ error: 'Sign in required.', code: 'AUTH_REQUIRED' }, 401);
  if (!orgId) return c.json({ error: 'orgId required.', code: 'ORG_REQUIRED' }, 400);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 500);
  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/members/${uid}`);
  if (!member) return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
  return { uid, role: String(member.role ?? 'member') };
}

const isPrivileged = (role: string) => role === 'owner' || role === 'admin';

/**
 * Why each denial reads differently: the customer's next action differs. Sending
 * a Free user to the token shop would be useless — buying tokens does not grant
 * them scraping — and telling a capped Enterprise customer to buy tokens would
 * be wrong for the same reason.
 */
const DENIAL_MESSAGE: Record<ScrapeDenialCode, string> = {
  PLAN_REQUIRED:
    'Advanced website and social analysis requires a paid subscription. Upgrade your plan or purchase credits to continue.',
  DAILY_CAP_REACHED:
    'You have reached the daily analysis limit for your plan. Try again tomorrow, or upgrade for a higher limit.',
  MONTHLY_CAP_REACHED:
    'You have reached the monthly analysis limit for your plan. Upgrade for a higher limit.',
  INSUFFICIENT_TOKENS:
    'This analysis requires additional audit credits. Purchase credits to continue.',
};

/**
 * Live scrape pricing. Read straight from `platform_config/billing` — the same
 * document that already holds billing scope — so a price change is a Firestore
 * edit, never a deploy. An unreadable document falls back to the committed
 * defaults inside `resolveScrapePolicy`, so a config outage cannot make scraping
 * free or block every customer.
 */
async function readPlatformBilling(saJson: string): Promise<Record<string, unknown> | null> {
  return firestoreGet(saJson, 'platform_config/billing').catch(() => null) as Promise<Record<string, unknown> | null>;
}

/**
 * Which collectors are configured.
 *
 * An unconfigured collector is simply absent, and the pipeline then records its
 * sources as `not_attempted` with a reason. That is deliberate: a report must
 * say which surfaces were never looked at rather than imply full coverage
 * (§26.12). Returning an error instead would make the feature unusable for
 * workspaces that only have one provider configured.
 */
export function configuredCollectors(env: Bindings): EnrichmentCollector[] {
  const collectors: EnrichmentCollector[] = [];
  const apify = buildApifyConfig(env);
  if (apify) collectors.push(new ApifyCollector(apify));
  const bridge = buildBridgeConfig(env);
  if (bridge) collectors.push(new AgentReachCollector(bridge));
  return collectors;
}

enrichment.get('/api/enrichment/snapshots', async c => {
  const env = c.env as Bindings;
  const orgId = safeId(c.req.query('orgId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const limit = Math.min(Math.max(Number.parseInt(c.req.query('limit') ?? '20', 10) || 20, 1), 50);
  const snapshots = await listSnapshots(env.FIREBASE_SERVICE_ACCOUNT_JSON!, orgId, limit);
  return c.json({ snapshots });
});

enrichment.get('/api/enrichment/report', async c => {
  const env = c.env as Bindings;
  const orgId = safeId(c.req.query('orgId'));
  const snapshotId = safeId(c.req.query('snapshotId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;
  if (!snapshotId) return c.json({ error: 'snapshotId required.', code: 'SNAPSHOT_REQUIRED' }, 400);

  const loaded = await loadEnrichmentReport(env.FIREBASE_SERVICE_ACCOUNT_JSON!, orgId, snapshotId);
  if (!loaded.ok) {
    // Altered evidence is reported as such, never rendered as a clean audit.
    if (loaded.reason === 'INTEGRITY_FAILED') {
      dlog(env as Record<string, unknown>, '[enrichment] INTEGRITY_FAILED', orgId, snapshotId);
      return c.json({
        error: 'This evidence snapshot no longer matches its recorded fingerprint and cannot be used.',
        code: 'INTEGRITY_FAILED',
      }, 409);
    }
    return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);
  }
  return c.json(loaded.view);
});

enrichment.post('/api/enrichment/run', async c => {
  const env = c.env as Bindings;
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const orgId = safeId(body.orgId);
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;
  // Collection costs money at the provider, so it is a privileged action.
  if (!isPrivileged(g.role)) return c.json({ error: 'Only owners or admins can run enrichment.', code: 'FORBIDDEN' }, 403);

  const subjectDomain = normaliseDomain(body.subjectDomain);
  if (!subjectDomain) return c.json({ error: 'A valid domain is required.', code: 'DOMAIN_REQUIRED' }, 400);

  const surface = typeof body.surface === 'string' && SURFACES.has(body.surface) ? body.surface : 'audit_express';
  const scrapeClass: ScrapeClass = body.scrapeClass === 'social' ? 'social' : 'website';

  // Cheapest gate first: no I/O, no money, and an unconfigured environment must
  // say so plainly rather than after a round of quota and balance reads.
  const collectors = configuredCollectors(env);
  if (collectors.length === 0) {
    // No silent no-op: a run that could never read anything is refused with the
    // reason, not recorded as an empty but successful audit. In production this
    // also fires when APIFY_ACTORS or APIFY_MEMORY_MB are missing — an
    // incomplete collector config is a refusal, not a partial run.
    return c.json({
      error: 'No enrichment collector is configured for this environment.',
      code: 'NO_COLLECTOR_CONFIGURED',
    }, 503);
  }

  /* ── Billing enforcement ────────────────────────────────────────────────
   * An Apify run costs real money at the provider. Until P2.1a this route
   * checked auth and the org role and nothing else — privilege was the only
   * control, and privilege is not a budget.
   *
   * ORDER IS DELIBERATE. Every gate below runs BEFORE the pipeline starts, so a
   * denied request never reaches the provider. The debit is the reservation:
   * checking the balance and then calling Apify is a race, and two concurrent
   * requests would both pass the check and both spend. consumeTokens is atomic
   * (optimistic concurrency), so winning the debit IS the reservation.
   */
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON!;
  const policy = resolveScrapePolicy(await readPlatformBilling(saJson));

  const sub  = await firestoreGet(saJson, `organizations/${orgId}/subscriptions/current`).catch(() => null);
  const plan = (sub?.plan as string | undefined) ?? null;

  // Fail-CLOSED: if the counters cannot be read we refuse rather than assume
  // zero, because assuming zero would uncap Apify spend during an outage.
  let usage;
  try {
    usage = await countScrapeUsage(saJson, orgId, new Date());
  } catch (err) {
    dlog(env as Record<string, unknown>, '[enrichment] QUOTA_READ_FAILED', orgId, err instanceof Error ? err.message : '');
    return c.json({ error: 'Usage quota could not be verified. Please try again.', code: 'QUOTA_UNAVAILABLE' }, 503);
  }

  const balance  = await ensureTokenCycleFresh(saJson, orgId, allocationForPlan(plan));
  const decision = decideScrape({
    plan, scrapeClass,
    usedToday: usage.usedToday, usedThisMonth: usage.usedThisMonth,
    balance: balance.balance,
  }, policy);

  if (!decision.allowed) {
    return c.json({
      error: DENIAL_MESSAGE[decision.code!],
      code:  decision.code,
      ...decision.detail,
    }, decision.status!);
  }

  // RESERVE. Nothing below may reach Apify unless this debit committed.
  const runId  = crypto.randomUUID();
  const charge = await consumeTokens(
    saJson, orgId, SCRAPE_ACTION, g.uid, runId,
    { subjectDomain, surface, scrapeClass, maxPages: policy.maxPages },
    'included', decision.cost,
  );
  if (!charge.ok) {
    // Lost a race against a concurrent run, or the balance moved between the
    // check and the debit. Either way no money was spent at the provider.
    return c.json({
      error: DENIAL_MESSAGE.INSUFFICIENT_TOKENS, code: 'INSUFFICIENT_TOKENS',
      ...decision.detail, balance: charge.balance ?? decision.detail.balance,
    }, 402);
  }

  /** Give the tokens back. Only ever called when the run produced nothing. */
  const refund = async (reason: string): Promise<void> => {
    try {
      await incrementBalance(saJson, orgId, decision.cost);
      await firestoreSet(saJson, `organizations/${orgId}/tokens/current/usage/${runId}`, {
        status: 'refunded', refundedAt: new Date().toISOString(), refundReason: reason,
      }, { merge: true });
    } catch (err) {
      // A swallowed money error is the failure mode this codebase exists to
      // avoid: surface it durably so it can be reconciled by hand.
      await recordBillingAlert(saJson, {
        kind: 'scrape_refund_failed', severity: 'critical', orgId, refId: runId,
        message: `Scrape charged ${decision.cost} tokens but the refund failed; org is owed credits.`,
        context: { scrapeClass, cost: decision.cost, reason, error: err instanceof Error ? err.message : 'unknown' },
      });
    }
  };

  let result;
  try {
    result = await runEnrichment({
      saJson,
      orgId, subjectDomain, surface, collectors, now: new Date(),
    });
  } catch (err) {
    dlog(env as Record<string, unknown>, '[enrichment] RUN_FAILED', orgId, err instanceof Error ? err.message : '');
    await refund('RUN_FAILED');
    return c.json({ error: 'Enrichment could not be completed.', code: 'RUN_FAILED' }, 500);
  }

  // Refund ONLY when nothing of value was produced. Partial coverage is a valid
  // audit result under §26.15 — a blocked source is evidence, not a failure —
  // so it is charged.
  if (result.snapshot.evidence.length === 0) await refund('NO_EVIDENCE');

  return c.json({
    snapshotId: result.snapshot.snapshotId,
    scrapeClass,
    tokensCharged: result.snapshot.evidence.length === 0 ? 0 : decision.cost,
    balanceAfter:  charge.balanceAfter,
    warnLowBalance: decision.warnLowBalance,
    minBalance:     policy.minBalance,
    subjectDomain, surface,
    createdAt:     result.snapshot.createdAt,
    evidenceCount: result.snapshot.evidence.length,
    rejected:      result.rejected,
    droppedCount:  result.snapshot.droppedCount,
    coverage:      result.coverage,
    stored:        result.stored,
    // Surfaced, not swallowed: a snapshot that failed to persist cannot be
    // reopened later, and the customer needs to know that before relying on it.
    storeError:    result.storeError ?? '',
    // Only the collectors that actually ran. Listing an unconfigured provider's
    // version would imply it was consulted.
    collectorVersions: Object.fromEntries(collectors.map(col => [col.id, col.version])),
  });
});

export default enrichment;
