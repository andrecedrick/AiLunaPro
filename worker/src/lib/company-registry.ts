/**
 * Company registry.
 *
 * Company was a free-text STRING on each contact and nothing else. Four flows
 * wrote it independently — signup, demo request, CSV import, manual creation —
 * so "Acme", "acme", "ACME Ltd." and "Acme  Ltd" were four unrelated values with
 * no way to count them, correct them, or reconcile them against Twenty. There was
 * no company record to attach a Twenty company id to either: the id lived on
 * whichever contact happened to create it first.
 *
 * This makes the company a first-class record at
 * `organizations/{orgId}/companies/{companyId}`, deduplicated on a normalised
 * key, and links every contact to it by `companyId`. The contact keeps its
 * `company` string: it is what the CRM table renders and what the CSV export
 * emits, and dropping it would break both for a lookup that saves nothing.
 *
 * DEDUP KEY: `nameKey` — case-folded, accent-stripped, punctuation-stripped,
 * whitespace-collapsed, with a trailing legal suffix removed. This is deliberately
 * aggressive, because the failure it prevents (two records for one company, each
 * holding half the contacts) is worse than the failure it risks (two genuinely
 * different companies colliding), and the merge tool can split nothing while the
 * rename tool can fix a bad label in one action.
 */

import { firestoreGet, firestoreSet, firestoreRunQuery } from './firestoreAdmin';

export const COMPANIES = (orgId: string) => `organizations/${orgId}/companies`;

const NAME_MAX = 120;

/**
 * Legal-form suffixes stripped before comparison. "Acme" and "Acme Ltd" are the
 * same company in every CRM anyone actually uses, and an operator typing one form
 * on Monday and the other on Tuesday is the single most common duplicate source.
 */
const SUFFIXES = [
  'ltd', 'limited', 'llc', 'inc', 'incorporated', 'corp', 'corporation', 'co',
  'plc', 'gmbh', 'ag', 'sa', 'sas', 'sarl', 'srl', 'spa', 'bv', 'nv', 'ab', 'as',
  'oy', 'pty', 'pte', 'kk', 'kg', 'ug', 'eurl', 'sci', 'scop',
];

/**
 * Normalise a company name into its dedup key.
 * Returns '' for a name that carries no letters or digits at all, which the
 * caller must treat as "no company" rather than as a company called nothing.
 */
export function companyNameKey(raw: string): string {
  let s = (raw ?? '')
    // Combining marks written as escapes, not as raw bytes: a literal combining
    // range in the source is invisible in a diff and mangled by most editors.
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')  // strip accents: Ste === Ste
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')                        // punctuation → space
    .trim()
    .replace(/\s+/g, ' ');
  // Strip trailing legal suffixes, repeatedly: "Acme Holdings Ltd Inc" happens.
  let changed = true;
  while (changed && s) {
    changed = false;
    for (const suffix of SUFFIXES) {
      if (s.endsWith(` ${suffix}`)) { s = s.slice(0, -suffix.length - 1).trim(); changed = true; }
    }
  }
  return s.slice(0, NAME_MAX);
}

/** Trim and cap a display name without altering its case or punctuation. */
export const cleanCompanyName = (raw: string): string => (raw ?? '').trim().replace(/\s+/g, ' ').slice(0, NAME_MAX);

export interface CompanyDoc {
  companyId:       string;
  orgId:           string;
  name:            string;
  nameKey:         string;
  source:          string;
  twentyCompanyId: string;
  createdByUid:    string;
  createdAt:       string;
  updatedAt:       string;
  /** Set when this company was merged INTO another; it is then a tombstone. */
  mergedIntoId?:   string;
}

function genId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Existing company for this key, or null. Tombstones are followed to their target. */
export async function findCompanyByKey(saJson: string, orgId: string, nameKey: string): Promise<CompanyDoc | null> {
  if (!nameKey) return null;
  const rows = await firestoreRunQuery(saJson, {
    from:  [{ collectionId: 'companies' }],
    where: { fieldFilter: { field: { fieldPath: 'nameKey' }, op: 'EQUAL', value: { stringValue: nameKey } } },
    limit: 1,
  }, `organizations/${orgId}`);
  const hit = rows[0];
  if (!hit) return null;
  const doc = hit.fields as unknown as CompanyDoc;
  // A merged company must never be handed back as a live target, or new contacts
  // would keep attaching to a record the operator already retired.
  if (doc.mergedIntoId) {
    const target = await firestoreGet(saJson, `${COMPANIES(orgId)}/${doc.mergedIntoId}`);
    return target ? (target as unknown as CompanyDoc) : null;
  }
  return doc;
}

export interface UpsertCompanyInput {
  orgId:  string;
  name:   string;
  source: string;
  uid:    string;
  /** Recorded when the caller has already created the Twenty company. */
  twentyCompanyId?: string;
}

export interface UpsertCompanyResult {
  companyId: string;
  /** The canonical display name — an existing record's name wins over a new spelling. */
  name:      string;
  created:   boolean;
  twentyCompanyId: string;
}

/**
 * Find or create the company for `name`.
 *
 * On a HIT the stored display name is NOT overwritten. An operator may have
 * corrected "acme ltd" to "Acme Ltd."; a later import carrying the sloppy
 * spelling must not undo that. Only genuinely absent facts are filled in.
 *
 * Returns `companyId: ''` for a blank/meaningless name so the caller can record
 * "no company" without inventing a registry entry.
 */
export async function upsertCompany(saJson: string, input: UpsertCompanyInput): Promise<UpsertCompanyResult> {
  const name = cleanCompanyName(input.name);
  const nameKey = companyNameKey(name);
  if (!nameKey) return { companyId: '', name: '', created: false, twentyCompanyId: '' };

  const now = new Date().toISOString();
  const existing = await findCompanyByKey(saJson, input.orgId, nameKey);

  if (existing) {
    const patch: Record<string, string> = { updatedAt: now };
    if (input.twentyCompanyId && !existing.twentyCompanyId) patch.twentyCompanyId = input.twentyCompanyId;
    await firestoreSet(saJson, `${COMPANIES(input.orgId)}/${existing.companyId}`, patch, { merge: true });
    return {
      companyId: existing.companyId,
      name:      existing.name || name,
      created:   false,
      twentyCompanyId: existing.twentyCompanyId || input.twentyCompanyId || '',
    };
  }

  const companyId = genId();
  await firestoreSet(saJson, `${COMPANIES(input.orgId)}/${companyId}`, {
    companyId, orgId: input.orgId,
    name, nameKey,
    source: input.source,
    twentyCompanyId: input.twentyCompanyId ?? '',
    createdByUid: input.uid,
    createdAt: now, updatedAt: now,
    mergedIntoId: '',
  });
  return { companyId, name, created: true, twentyCompanyId: input.twentyCompanyId ?? '' };
}

/**
 * Attach a Twenty company id to a registry entry after the fact.
 *
 * Fill-a-blank only: overwriting an existing id would orphan the Twenty record it
 * pointed at, and the id is the sole link back to it.
 */
export async function linkTwentyCompany(saJson: string, orgId: string, companyId: string, twentyCompanyId: string): Promise<void> {
  if (!companyId || !twentyCompanyId) return;
  const current = await firestoreGet(saJson, `${COMPANIES(orgId)}/${companyId}`);
  if (current && typeof current.twentyCompanyId === 'string' && current.twentyCompanyId) return;
  await firestoreSet(saJson, `${COMPANIES(orgId)}/${companyId}`,
    { twentyCompanyId, updatedAt: new Date().toISOString() }, { merge: true });
}
