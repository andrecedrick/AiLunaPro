/**
 * Declared AI inventory — the DECLARED half of Observed vs Declared (§26.5, D2).
 *
 * Source of truth: `/organizations/{orgId}/registry/{systemId}` (AISystem).
 * The AI Registry is the primary structured declaration source; nothing else
 * feeds the comparison.
 *
 * ONLY STRUCTURED FIELDS ARE COMPARABLE (cahier §26.15 D2). `vendor` and `name`
 * are enumerable identifiers a rule can match. `purpose` and `mitigations` are
 * free text and are deliberately NOT read here: a declaration reading "we use
 * some AI for support" must never be able to suppress a Shadow AI gap, because
 * matching prose against observations is guesswork and a wrong suppression hides
 * exactly what the audit exists to find.
 *
 * The I/O is one collection read. Everything else in this module is pure so the
 * comparison engine stays deterministic.
 */

import { firestoreRunQuery } from './firestoreAdmin';

/** Bound on registry entries read per comparison. */
const MAX_REGISTRY_ENTRIES = 500;

/**
 * One declared system, reduced to what can be compared.
 *
 * `vendorKey` and `nameKey` are the match keys; the display fields are carried so
 * a gap can name the entry without a second read.
 */
export interface DeclaredSystem {
  systemId:    string;
  name:        string;
  vendor:      string;
  /** Normalised match keys. Empty when the field was absent. */
  vendorKey:   string;
  nameKey:     string;
  riskLevel:   string;
  status:      string;
  department:  string;
  /** True when neither vendor nor name normalises to anything matchable. */
  unmatchable: boolean;
}

/**
 * Vendor aliases.
 *
 * Observation and declaration rarely use the same words for the same vendor: a
 * page says "ChatGPT", the registry says "OpenAI". Without aliasing, every such
 * pair becomes a false Shadow AI gap — an accusation that a customer failed to
 * declare something they did declare. The table is intentionally one-directional
 * and explicit rather than fuzzy: a wrong merge hides a real gap.
 */
const VENDOR_ALIASES: Record<string, string> = {
  chatgpt: 'openai',
  gpt: 'openai',
  gpt3: 'openai',
  gpt4: 'openai',
  gpt5: 'openai',
  claude: 'anthropic',
  azureopenai: 'microsoftazureopenai',
  azure: 'microsoftazureopenai',
  openaiazure: 'microsoftazureopenai',
  vertexai: 'googlecloudai',
  gemini: 'googlecloudai',
  googleai: 'googlecloudai',
  bedrock: 'awsbedrock',
  huggingface: 'huggingface',
  hf: 'huggingface',
  einstein: 'salesforceeinstein',
  watson: 'ibmwatson',
};

/** Legal suffixes stripped before comparison — "OpenAI, L.L.C." is "OpenAI". */
const LEGAL_SUFFIXES = ['llc', 'lc', 'inc', 'incorporated', 'ltd', 'limited', 'corp', 'corporation',
  'plc', 'gmbh', 'ag', 'sa', 'sas', 'sarl', 'bv', 'nv', 'ab', 'oy', 'pbc'];

/**
 * Normalise a vendor or system name to a match key.
 *
 * Aggressive on formatting, conservative on meaning: case, accents, punctuation
 * and legal suffixes are removed, then a known alias is applied. Returns '' when
 * nothing matchable remains, which the caller treats as "cannot be compared"
 * rather than as a match against everything.
 */
export function normaliseVendorKey(raw: string): string {
  let s = (raw ?? '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  if (!s) return '';

  let parts = s.split(' ').filter(Boolean);

  // Rejoin dotted abbreviations. "OpenAI, L.L.C." tokenises to
  // ['openai','l','l','c'], so the suffix table never saw 'llc' — the key became
  // 'openaillc' and the customer was accused of not declaring a vendor they had
  // declared. A RUN of single-character tokens is one abbreviation.
  const merged: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length > 1) { merged.push(parts[i]); continue; }
    let run = '';
    while (i < parts.length && parts[i].length === 1) { run += parts[i]; i++; }
    i--;
    merged.push(run);
  }
  parts = merged;

  // Drop trailing legal suffixes, repeatedly.
  while (parts.length > 1 && LEGAL_SUFFIXES.includes(parts[parts.length - 1])) parts = parts.slice(0, -1);
  s = parts.join('');

  return VENDOR_ALIASES[s] ?? s;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Reduce a stored registry document to its comparable form. Pure. */
export function toDeclaredSystem(systemId: string, f: Record<string, unknown>): DeclaredSystem {
  const name = str(f.name).trim();
  const vendor = str(f.vendor).trim();
  const vendorKey = normaliseVendorKey(vendor);
  const nameKey = normaliseVendorKey(name);
  return {
    systemId,
    name, vendor,
    vendorKey, nameKey,
    riskLevel:  str(f.riskLevel),
    status:     str(f.status),
    department: str(f.department),
    // An entry with no vendor AND no usable name cannot participate in the
    // comparison at all. Surfaced so the registry gap is visible rather than the
    // entry silently matching nothing.
    unmatchable: !vendorKey && !nameKey,
  };
}

/**
 * Every match key a declared system answers to.
 *
 * Both vendor and name are indexed because customers populate the registry
 * inconsistently — some write "OpenAI" as the vendor and "Support bot" as the
 * name, others put "ChatGPT" in the name and leave vendor empty.
 */
export function declaredKeys(sys: DeclaredSystem): string[] {
  return [sys.vendorKey, sys.nameKey].filter(Boolean);
}

export interface DeclaredInventory {
  systems: DeclaredSystem[];
  /** Key → systems answering to it. Built once, used for every observation. */
  index:   Map<string, DeclaredSystem[]>;
  /** Entries that carry neither a usable vendor nor a usable name. */
  unmatchable: DeclaredSystem[];
}

/** Build the lookup index. Pure, so the comparison stays testable without I/O. */
export function buildDeclaredInventory(systems: readonly DeclaredSystem[]): DeclaredInventory {
  const index = new Map<string, DeclaredSystem[]>();
  for (const sys of systems) {
    for (const key of declaredKeys(sys)) {
      const list = index.get(key);
      if (list) list.push(sys); else index.set(key, [sys]);
    }
  }
  return {
    // Ordered so downstream output is stable regardless of Firestore's ordering.
    systems: [...systems].sort((a, b) => a.systemId.localeCompare(b.systemId)),
    index,
    unmatchable: systems.filter(s => s.unmatchable),
  };
}

/**
 * Load the org's declared AI inventory.
 *
 * Archived entries are EXCLUDED: a system the customer retired is not a current
 * declaration, and counting it would let a decommissioned entry mask a live
 * undeclared system.
 */
export async function loadDeclaredInventory(saJson: string, orgId: string): Promise<DeclaredInventory> {
  const rows = await firestoreRunQuery(saJson, {
    from:  [{ collectionId: 'registry' }],
    limit: MAX_REGISTRY_ENTRIES,
  }, `organizations/${orgId}`);

  const systems = rows
    .map(r => toDeclaredSystem(r.name.split('/').pop() ?? '', r.fields as Record<string, unknown>))
    .filter(s => s.status !== 'archived');

  return buildDeclaredInventory(systems);
}
