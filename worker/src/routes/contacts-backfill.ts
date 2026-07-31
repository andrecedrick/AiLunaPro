/**
 * Company backfill — POST /api/contacts/backfill-company. SUPER ADMIN ONLY.
 *
 * Company capture at signup shipped AFTER the signup → CRM pipeline did, so every
 * account created in that window reached the CRM with `company: ''` and renders as
 * "—" in the contacts table. The capture fix repairs new signups; it cannot repair
 * the records already written, and nothing else ever will: `upsertLeadContact`
 * only fills a blank company when the SAME prospect submits again, which for a
 * completed signup never happens.
 *
 * The workspace name is the right source. It is what the account holder typed to
 * describe their own organisation on the very next screen after signup, so it is
 * self-reported company data — not a guess this route invents.
 *
 * FILL-A-BLANK ONLY: a contact that already has a company is never touched, so
 * running this twice is a no-op and it can never overwrite an operator's
 * correction. `dryRun` (the default) reports what WOULD change and writes nothing.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreGet, firestoreSet, firestoreRunQuery } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const backfill = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

/** Bounded so one call cannot walk an unbounded collection group. */
const SCAN_CAP = 2000;

backfill.post('/api/contacts/backfill-company', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  let body: Record<string, unknown> = {};
  try { body = (await c.req.json()) as Record<string, unknown>; } catch { /* empty body = dry run */ }
  // Writing is opt-IN. An operator running this to see the damage must not cause a
  // cross-org write by forgetting a flag.
  const dryRun = body.dryRun !== false;

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await firestoreRunQuery(saJson, { from: [{ collectionId: 'contacts', allDescendants: true }], limit: SCAN_CAP }, '');
  } catch (err) {
    console.error('[contacts-backfill] scan failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not read contacts.', code: 'QUERY_FAILED' }, 500);
  }

  const blanks = rows
    .map(r => {
      const f = r.fields as Record<string, unknown>;
      const m = r.name.match(/organizations\/([^/]+)\/contacts\/([^/]+)$/);
      return {
        orgId:     m ? m[1] : '',
        contactId: m ? m[2] : '',
        name:      typeof f.name === 'string' ? f.name : '',
        company:   typeof f.company === 'string' ? f.company : '',
      };
    })
    .filter(x => x.orgId && x.contactId && !x.company.trim());

  // One org read per DISTINCT org, not per contact — a workspace with 300 blank
  // contacts must not cost 300 identical reads of the same org document.
  const orgNames = new Map<string, string>();
  for (const orgId of new Set(blanks.map(b => b.orgId))) {
    const org = await firestoreGet(saJson, `organizations/${orgId}`).catch(() => null);
    orgNames.set(orgId, typeof org?.name === 'string' ? org.name.trim().slice(0, 120) : '');
  }

  const now = new Date().toISOString();
  const planned: { orgId: string; contactId: string; name: string; company: string }[] = [];
  let written = 0;

  for (const b of blanks) {
    const company = orgNames.get(b.orgId) ?? '';
    if (!company) continue; // no workspace name → nothing truthful to write
    planned.push({ ...b, company });
    if (dryRun) continue;
    try {
      await firestoreSet(saJson, `organizations/${b.orgId}/contacts/${b.contactId}`,
        { company, updatedAt: now }, { merge: true });
      written++;
    } catch (err) {
      console.error('[contacts-backfill] write failed:', err instanceof Error ? err.message : '');
    }
  }

  console.log(`[contacts-backfill] scanned=${rows.length} blank=${blanks.length} fillable=${planned.length} written=${written} dryRun=${dryRun}`);
  return c.json({
    ok: true, dryRun,
    scanned: rows.length, blank: blanks.length, fillable: planned.length, written,
    // Name + company only. Emails and phones stay out of an operator response body.
    sample: planned.slice(0, 25).map(p => ({ orgId: p.orgId, name: p.name, company: p.company })),
  });
});

export default backfill;
