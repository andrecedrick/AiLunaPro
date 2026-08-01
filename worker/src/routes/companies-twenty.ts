/**
 * Twenty company repair — POST /api/companies/twenty-sync. SUPER ADMIN ONLY.
 *
 * Repairs the mismatch the push path used to create: a Person sent to Twenty
 * WITHOUT a companyId does not stay company-less — Twenty attaches a company
 * derived from the email address, so a prospect stored internally as "Greyvoid"
 * appeared in Twenty under "inboxbear.com". Nothing in this codebase derives a
 * domain, so that name can only have come from Twenty itself.
 *
 * The push path no longer creates unlinked people. This route fixes the records
 * created before it did:
 *
 *   for every contact that already has a twentyPersonId
 *     resolve its registry company
 *     ensure that company exists in Twenty (create it if the registry has no id)
 *     read the person's ACTUAL company in Twenty
 *     if it differs, point the person at the right one
 *
 * DRY RUN BY DEFAULT. It writes to an external system, so an operator running it
 * to see the damage must not cause a Twenty write by forgetting a flag.
 *
 * The company NAME always comes from the internal registry. That is the whole
 * contract: the internal CRM is the source of truth and Twenty is a projection of
 * it, never the other way round.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreGet, firestoreCommit, firestoreRunQuery } from '../lib/firestoreAdmin';
import { createCompany, getPersonCompanyId, setPersonCompany, type TwentyLead } from '../lib/twenty';
import type { AppEnv } from '../index';

const twentySync = new Hono<AppEnv>();

interface Bindings {
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  TWENTY_API_KEY?: string;
  TWENTY_BASE_URL?: string;
}

const SCAN_CAP = 2000;

/** Minimal lead shape — only `company` is read by companyPayload. */
const leadFor = (company: string): TwentyLead => ({
  name: '', contactEmail: '', identityEmail: '', phone: '',
  countryCode: '', phoneCountry: '', company,
  message: '', source: 'repair', createdAt: '', leadId: '',
});

twentySync.post('/api/companies/twenty-sync', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  if (!env.TWENTY_API_KEY || !env.TWENTY_BASE_URL) {
    return c.json({ error: 'Twenty is not configured.', code: 'TWENTY_NOT_CONFIGURED' }, 503);
  }
  const key = env.TWENTY_API_KEY, url = env.TWENTY_BASE_URL;

  let body: Record<string, unknown> = {};
  try { body = (await c.req.json()) as Record<string, unknown>; } catch { /* empty body = dry run */ }
  const dryRun = body.dryRun !== false;

  let contacts: Array<{ path: string; orgId: string; companyId: string; company: string; twentyPersonId: string }>;
  try {
    const rows = await firestoreRunQuery(saJson, {
      from:   [{ collectionId: 'contacts', allDescendants: true }],
      select: { fields: [{ fieldPath: 'companyId' }, { fieldPath: 'company' }, { fieldPath: 'twentyPersonId' }] },
      limit:  SCAN_CAP,
    }, '');
    const s = (v: unknown) => (typeof v === 'string' ? v : '');
    contacts = rows.map(r => {
      const f = r.fields as Record<string, unknown>;
      const m = r.name.match(/organizations\/([^/]+)\/contacts\/[^/]+$/);
      return {
        path: r.name.replace(/^.*\/documents\//, ''),
        orgId: m ? m[1] : '',
        companyId: s(f.companyId), company: s(f.company), twentyPersonId: s(f.twentyPersonId),
      };
    }).filter(x => x.orgId && x.twentyPersonId);
  } catch (err) {
    console.error('[twenty-sync] scan failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not read contacts.', code: 'QUERY_FAILED' }, 500);
  }

  // One Twenty company per REGISTRY company, resolved once and reused. Resolving
  // per contact would create a duplicate Twenty company for every colleague.
  const resolved = new Map<string, string>();
  const writes: Array<{ path: string; data: Record<string, string> }> = [];
  const mismatched: Array<{ orgId: string; company: string }> = [];
  const failures: Array<{ orgId: string; reason: string }> = [];
  let checked = 0, corrected = 0, companiesCreated = 0, skipped = 0;

  for (const ct of contacts) {
    // No registry company means nothing authoritative to point Twenty at. Counted
    // and reported rather than guessed — run /api/companies/reconcile first.
    if (!ct.companyId || !ct.company) { skipped++; continue; }
    checked++;

    let twentyCompanyId = resolved.get(ct.companyId) ?? '';
    if (!twentyCompanyId) {
      const reg = await firestoreGet(saJson, `organizations/${ct.orgId}/companies/${ct.companyId}`).catch(() => null);
      const regName = typeof reg?.name === 'string' ? reg.name : ct.company;
      twentyCompanyId = typeof reg?.twentyCompanyId === 'string' ? reg.twentyCompanyId : '';

      if (!twentyCompanyId) {
        if (dryRun) { resolved.set(ct.companyId, 'DRY_RUN'); companiesCreated++; continue; }
        const co = await createCompany(key, url, leadFor(regName));
        if (!co.ok || !co.id) { failures.push({ orgId: ct.orgId, reason: (co.error ?? 'company create failed').slice(0, 140) }); continue; }
        twentyCompanyId = co.id;
        companiesCreated++;
        writes.push({
          path: `organizations/${ct.orgId}/companies/${ct.companyId}`,
          data: { twentyCompanyId, updatedAt: new Date().toISOString() },
        });
      }
      resolved.set(ct.companyId, twentyCompanyId);
    }
    if (twentyCompanyId === 'DRY_RUN') continue;

    const actual = await getPersonCompanyId(key, url, ct.twentyPersonId);
    if (!actual.ok) { failures.push({ orgId: ct.orgId, reason: (actual.error ?? 'read failed').slice(0, 140) }); continue; }
    if (actual.id === twentyCompanyId) continue;

    mismatched.push({ orgId: ct.orgId, company: ct.company });
    if (dryRun) continue;

    const fixed = await setPersonCompany(key, url, ct.twentyPersonId, twentyCompanyId);
    if (!fixed.ok) { failures.push({ orgId: ct.orgId, reason: (fixed.error ?? 'patch failed').slice(0, 140) }); continue; }
    corrected++;
    writes.push({ path: ct.path, data: { twentyCompanyId, updatedAt: new Date().toISOString() } });
  }

  if (!dryRun && writes.length) {
    try { await firestoreCommit(saJson, writes); }
    catch (err) { console.error('[twenty-sync] commit failed:', err instanceof Error ? err.message : ''); }
  }

  console.log(`[twenty-sync] people=${contacts.length} checked=${checked} skipped=${skipped} mismatched=${mismatched.length} corrected=${corrected} companiesCreated=${companiesCreated} failures=${failures.length} dryRun=${dryRun}`);
  return c.json({
    ok: true, dryRun,
    people: contacts.length, checked, skipped,
    mismatched: mismatched.length, corrected, companiesCreated,
    failures: failures.length,
    // Company names only — no emails or phone numbers in an operator response.
    sample: { mismatched: mismatched.slice(0, 25), failures: failures.slice(0, 10) },
  });
});

export default twentySync;
