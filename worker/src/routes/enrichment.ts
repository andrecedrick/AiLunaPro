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
import { firestoreGet } from '../lib/firestoreAdmin';
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

  const collectors = configuredCollectors(env);
  if (collectors.length === 0) {
    // No silent no-op: a run that could never read anything is refused with the
    // reason, not recorded as an empty but successful audit.
    return c.json({
      error: 'No enrichment collector is configured for this environment.',
      code: 'NO_COLLECTOR_CONFIGURED',
    }, 503);
  }

  let result;
  try {
    result = await runEnrichment({
      saJson: env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      orgId, subjectDomain, surface, collectors, now: new Date(),
    });
  } catch (err) {
    dlog(env as Record<string, unknown>, '[enrichment] RUN_FAILED', orgId, err instanceof Error ? err.message : '');
    return c.json({ error: 'Enrichment could not be completed.', code: 'RUN_FAILED' }, 500);
  }

  return c.json({
    snapshotId: result.snapshot.snapshotId,
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
