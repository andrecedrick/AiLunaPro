/**
 * Company registry API — SUPER ADMIN ONLY.
 *
 *   GET   /api/companies/all        cross-org registry with contact counts
 *   PATCH /api/companies/:id        rename / correct an imported name
 *   POST  /api/companies/merge      fold a duplicate into a survivor
 *   POST  /api/companies/reconcile  report + repair drift (dry run by default)
 *
 * Operator-gated rather than role-gated for the same reason assignment is: the
 * registry spans organisations (a lead lands in the PROSPECT's workspace), and a
 * platform operator is a non-member of every org, so requireRole would 403 them
 * by design.
 *
 * Renames and merges are TRACEABLE: every write stamps `updatedAt` and
 * `updatedByEmail`, a merge leaves a tombstone carrying `mergedIntoId` and
 * `mergedByEmail` rather than deleting the loser, and every contact moved by a
 * merge is rewritten to the survivor. Deleting the loser would destroy the only
 * evidence that the two names were ever the same company.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreGet, firestoreCommit, firestoreRunQuery, COMMIT_MAX_WRITES } from '../lib/firestoreAdmin';
import { COMPANIES, companyNameKey, cleanCompanyName, type CompanyDoc } from '../lib/company-registry';
import type { AppEnv } from '../index';

const companies = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const SCAN_CAP = 2000;
const safeId = (v: unknown): string => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');

interface ContactRow { path: string; orgId: string; companyId: string; company: string; assignedToEmail: string; twentyCompanyId: string }

/** Every contact in the platform, reduced to the fields the registry cares about. */
async function scanContacts(saJson: string): Promise<ContactRow[]> {
  const rows = await firestoreRunQuery(saJson, {
    from:   [{ collectionId: 'contacts', allDescendants: true }],
    select: { fields: [
      { fieldPath: 'companyId' }, { fieldPath: 'company' },
      { fieldPath: 'assignedToEmail' }, { fieldPath: 'twentyCompanyId' },
    ] },
    limit: SCAN_CAP,
  }, '');
  return rows.map(r => {
    const f = r.fields as Record<string, unknown>;
    const m = r.name.match(/organizations\/([^/]+)\/contacts\/[^/]+$/);
    const s = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
      path: r.name.replace(/^.*\/documents\//, ''),
      orgId: m ? m[1] : '',
      companyId: s(f.companyId), company: s(f.company),
      assignedToEmail: s(f.assignedToEmail), twentyCompanyId: s(f.twentyCompanyId),
    };
  }).filter(x => x.orgId);
}

async function scanCompanies(saJson: string): Promise<Array<CompanyDoc & { path: string }>> {
  const rows = await firestoreRunQuery(saJson, {
    from:  [{ collectionId: 'companies', allDescendants: true }],
    limit: SCAN_CAP,
  }, '');
  return rows.map(r => ({
    ...(r.fields as unknown as CompanyDoc),
    path: r.name.replace(/^.*\/documents\//, ''),
  }));
}

/* ── GET /api/companies/all ─────────────────────────────────────────────────── */
companies.get('/api/companies/all', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  let list: Array<CompanyDoc & { path: string }>, contacts: ContactRow[];
  try { [list, contacts] = await Promise.all([scanCompanies(saJson), scanContacts(saJson)]); }
  catch (err) {
    console.error('[companies] list failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load companies.', code: 'QUERY_FAILED' }, 500);
  }

  const counts = new Map<string, number>();
  for (const ct of contacts) if (ct.companyId) counts.set(ct.companyId, (counts.get(ct.companyId) ?? 0) + 1);

  const items = list
    .filter(x => !x.mergedIntoId)   // tombstones stay in Firestore, out of the UI
    .map(x => ({
      companyId: x.companyId, orgId: x.orgId, name: x.name, nameKey: x.nameKey,
      source: x.source, twentyCompanyId: x.twentyCompanyId,
      createdByUid: x.createdByUid, createdAt: x.createdAt, updatedAt: x.updatedAt,
      contactCount: counts.get(x.companyId) ?? 0,
    }))
    .sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));

  return c.json({ ok: true, companies: items, scanned: list.length });
});

/* ── PATCH /api/companies/:id — rename ──────────────────────────────────────── */
companies.patch('/api/companies/:id', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId = safeId(body.orgId), companyId = safeId(c.req.param('id'));
  const name = cleanCompanyName(typeof body.name === 'string' ? body.name : '');
  const nameKey = companyNameKey(name);
  if (!orgId || !companyId) return c.json({ error: 'orgId and company id are required.', code: 'INVALID_INPUT' }, 400);
  // A name that normalises to nothing ("---") would produce an unfindable record.
  if (!nameKey) return c.json({ error: 'A company name is required.', code: 'INVALID_NAME' }, 400);

  const path = `${COMPANIES(orgId)}/${companyId}`;
  const existing = await firestoreGet(saJson, path);
  if (!existing) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);

  // Renaming ONTO an existing company is a merge, not a rename. Refusing here
  // keeps two records from sharing a nameKey, which would make findCompanyByKey
  // return whichever Firestore happened to order first.
  if (nameKey !== existing.nameKey) {
    const clash = await firestoreRunQuery(saJson, {
      from:  [{ collectionId: 'companies' }],
      where: { fieldFilter: { field: { fieldPath: 'nameKey' }, op: 'EQUAL', value: { stringValue: nameKey } } },
      limit: 2,
    }, `organizations/${orgId}`);
    if (clash.some(r => (r.fields as Record<string, unknown>).companyId !== companyId)) {
      return c.json({ error: 'Another company already uses that name. Merge them instead.', code: 'DUPLICATE_COMPANY' }, 409);
    }
  }

  const now = new Date().toISOString();
  const actor = c.get('email') ?? '';
  const writes: Array<{ path: string; data: Record<string, string> }> = [
    { path, data: { name, nameKey, updatedAt: now, updatedByEmail: actor } },
  ];

  // The contact's `company` string is what the table and the CSV export render,
  // so a rename that left it stale would show the old name everywhere it matters.
  const contacts = await scanContacts(saJson);
  for (const ct of contacts) {
    if (ct.companyId === companyId) writes.push({ path: ct.path, data: { company: name, updatedAt: now } });
  }

  for (let i = 0; i < writes.length; i += COMMIT_MAX_WRITES) {
    await firestoreCommit(saJson, writes.slice(i, i + COMMIT_MAX_WRITES));
  }
  console.log(`[companies] renamed org=${orgId} company=${companyId} contacts=${writes.length - 1}`);
  return c.json({ ok: true, companyId, name, contactsUpdated: writes.length - 1 });
});

/* ── POST /api/companies/merge ──────────────────────────────────────────────── */
companies.post('/api/companies/merge', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId = safeId(body.orgId);
  const keepId = safeId(body.keepId), mergeId = safeId(body.mergeId);
  if (!orgId || !keepId || !mergeId) return c.json({ error: 'orgId, keepId and mergeId are required.', code: 'INVALID_INPUT' }, 400);
  if (keepId === mergeId) return c.json({ error: 'A company cannot be merged into itself.', code: 'SAME_COMPANY' }, 400);

  const [keep, merge] = await Promise.all([
    firestoreGet(saJson, `${COMPANIES(orgId)}/${keepId}`),
    firestoreGet(saJson, `${COMPANIES(orgId)}/${mergeId}`),
  ]);
  if (!keep || !merge) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);
  if (merge.mergedIntoId) return c.json({ error: 'That company was already merged.', code: 'ALREADY_MERGED' }, 409);

  const now = new Date().toISOString();
  const actor = c.get('email') ?? '';
  const keepName = typeof keep.name === 'string' ? keep.name : '';
  const writes: Array<{ path: string; data: Record<string, string> }> = [];

  // The loser becomes a TOMBSTONE, not a deletion: it is the only record that the
  // two names were ever the same company, and findCompanyByKey follows it so a
  // late import carrying the old spelling lands on the survivor.
  writes.push({
    path: `${COMPANIES(orgId)}/${mergeId}`,
    data: { mergedIntoId: keepId, mergedByEmail: actor, updatedAt: now, updatedByEmail: actor },
  });
  // Carry the Twenty id up only if the survivor has none — never overwrite a live link.
  const mergeTwenty = typeof merge.twentyCompanyId === 'string' ? merge.twentyCompanyId : '';
  const keepTwenty = typeof keep.twentyCompanyId === 'string' ? keep.twentyCompanyId : '';
  writes.push({
    path: `${COMPANIES(orgId)}/${keepId}`,
    data: { updatedAt: now, updatedByEmail: actor, ...(!keepTwenty && mergeTwenty ? { twentyCompanyId: mergeTwenty } : {}) },
  });

  const contacts = await scanContacts(saJson);
  let moved = 0;
  for (const ct of contacts) {
    if (ct.companyId !== mergeId) continue;
    writes.push({ path: ct.path, data: { companyId: keepId, company: keepName, updatedAt: now } });
    moved++;
  }

  for (let i = 0; i < writes.length; i += COMMIT_MAX_WRITES) {
    await firestoreCommit(saJson, writes.slice(i, i + COMMIT_MAX_WRITES));
  }
  console.log(`[companies] merged org=${orgId} ${mergeId} -> ${keepId} contacts=${moved}`);
  return c.json({ ok: true, keepId, mergeId, contactsMoved: moved });
});

/* ── POST /api/companies/reconcile ──────────────────────────────────────────── */
/**
 * Report — and optionally repair — drift between contacts, the registry and Twenty.
 *
 * Dry run by default, like the contacts backfill: an operator running this to see
 * the damage must not cause a cross-org write by forgetting a flag.
 *
 * Reports four distinct conditions, because they have four different causes:
 *   missing      contact has a company STRING but no registry entry (pre-registry data)
 *   unlinked     contact has a registry-resolvable company but no companyId
 *   duplicates   two live registry entries sharing a nameKey (a merge is needed)
 *   orphans      registry entries with zero contacts (a rename or merge left them)
 *   noTwentyId   live companies with contacts but no Twenty company id
 */
companies.post('/api/companies/reconcile', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  let body: Record<string, unknown> = {};
  try { body = (await c.req.json()) as Record<string, unknown>; } catch { /* empty body = dry run */ }
  const dryRun = body.dryRun !== false;
  const actor = c.get('email') ?? '';
  const uid = c.get('uid') as string;

  let registry: Array<CompanyDoc & { path: string }>, contacts: ContactRow[];
  try { [registry, contacts] = await Promise.all([scanCompanies(saJson), scanContacts(saJson)]); }
  catch (err) {
    console.error('[companies] reconcile scan failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not read the registry.', code: 'QUERY_FAILED' }, 500);
  }

  const live = registry.filter(x => !x.mergedIntoId);
  const byOrgKey = new Map<string, CompanyDoc>();
  const dupes: Array<{ orgId: string; name: string }> = [];
  for (const co of live) {
    const k = `${co.orgId}::${co.nameKey}`;
    if (byOrgKey.has(k)) dupes.push({ orgId: co.orgId, name: co.name });
    else byOrgKey.set(k, co);
  }

  const counts = new Map<string, number>();
  for (const ct of contacts) if (ct.companyId) counts.set(ct.companyId, (counts.get(ct.companyId) ?? 0) + 1);
  const orphans = live.filter(co => (counts.get(co.companyId) ?? 0) === 0).map(co => ({ orgId: co.orgId, name: co.name }));
  const noTwentyId = live.filter(co => !co.twentyCompanyId && (counts.get(co.companyId) ?? 0) > 0)
    .map(co => ({ orgId: co.orgId, name: co.name }));

  const now = new Date().toISOString();
  const writes: Array<{ path: string; data: Record<string, string> }> = [];
  const created: Array<{ orgId: string; name: string }> = [];
  let unlinked = 0;

  // Pass 1 — a contact carrying a company string but no companyId. Entries are
  // created in-memory first so several contacts of the SAME new company share one
  // registry row instead of racing to create one each.
  const pending = new Map<string, { companyId: string; name: string; orgId: string }>();
  for (const ct of contacts) {
    if (ct.companyId) continue;
    const key = companyNameKey(ct.company);
    if (!key) continue;                       // genuinely no company — not drift
    unlinked++;
    const mapKey = `${ct.orgId}::${key}`;
    let target = byOrgKey.get(mapKey) as { companyId: string; name: string } | undefined;
    if (!target) {
      const pend = pending.get(mapKey);
      if (pend) target = pend;
      else {
        const buf = new Uint8Array(16); crypto.getRandomValues(buf);
        const companyId = btoa(String.fromCharCode(...buf)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const name = cleanCompanyName(ct.company);
        pending.set(mapKey, { companyId, name, orgId: ct.orgId });
        created.push({ orgId: ct.orgId, name });
        writes.push({
          path: `${COMPANIES(ct.orgId)}/${companyId}`,
          data: {
            companyId, orgId: ct.orgId, name, nameKey: key,
            source: 'reconcile', twentyCompanyId: ct.twentyCompanyId || '',
            createdByUid: uid, createdAt: now, updatedAt: now,
            updatedByEmail: actor, mergedIntoId: '',
          },
        });
        target = { companyId, name };
      }
    }
    writes.push({ path: ct.path, data: { companyId: target.companyId, updatedAt: now } });
  }

  let written = 0;
  if (!dryRun) {
    for (let i = 0; i < writes.length; i += COMMIT_MAX_WRITES) {
      const chunk = writes.slice(i, i + COMMIT_MAX_WRITES);
      try { await firestoreCommit(saJson, chunk); written += chunk.length; }
      catch (err) { console.error('[companies] reconcile commit failed:', err instanceof Error ? err.message : ''); }
    }
  }

  console.log(`[companies] reconcile contacts=${contacts.length} registry=${live.length} unlinked=${unlinked} created=${created.length} duplicates=${dupes.length} orphans=${orphans.length} noTwentyId=${noTwentyId.length} written=${written} dryRun=${dryRun}`);
  return c.json({
    ok: true, dryRun,
    contacts: contacts.length, registry: live.length,
    unlinked, createdCount: created.length,
    duplicates: dupes.length, orphans: orphans.length, noTwentyId: noTwentyId.length,
    written,
    // Names only — no emails or phone numbers in an operator response body.
    sample: { created: created.slice(0, 25), duplicates: dupes.slice(0, 25), orphans: orphans.slice(0, 25) },
  });
});

export default companies;
