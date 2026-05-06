/**
 * Firestore REST API client for Cloudflare Workers.
 * Uses service account JSON (FIREBASE_SERVICE_ACCOUNT_JSON) to obtain
 * a short-lived OAuth2 access token, then writes/reads via REST.
 *
 * No firebase-admin — CF Workers are edge, not Node.js.
 */

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

interface FirestoreValue {
  stringValue?:    string;
  booleanValue?:   boolean;
  integerValue?:   string;
  doubleValue?:    number;
  timestampValue?: string;
  nullValue?:      null;
  mapValue?:       { fields?: FirestoreFields };
  arrayValue?:     { values?: FirestoreValue[] };
}

type FirestoreFields = Record<string, FirestoreValue>;

// Recursive scalar/nested type returned by fromFirestoreFields
export type FsValue = string | boolean | number | null | FsObject | FsValue[];
export interface FsObject { [k: string]: FsValue }

// ── JWT + token ───────────────────────────────────────────────

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  };

  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const unsigned = `${encode(header)}.${encode(payload)}`;

  // Import RSA private key
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signBytes = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsigned),
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signBytes)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${unsigned}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get access token: ${text}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// ── Firestore REST helpers ────────────────────────────────────

type WritableScalar = string | boolean | number | null | undefined;
type WritableValue  = WritableScalar | WritableValue[] | { [k: string]: WritableValue };

function encodeValue(v: WritableValue): FirestoreValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean')        return { booleanValue: v };
  if (typeof v === 'number')         return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string')         return { stringValue: v };
  if (Array.isArray(v))              return { arrayValue: { values: v.map(encodeValue) } };
  return { mapValue: { fields: toFirestoreFields(v as Record<string, WritableValue>) } };
}

function toFirestoreFields(obj: Record<string, WritableValue>): FirestoreFields {
  const fields: FirestoreFields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = encodeValue(v);
  return fields;
}

function decodeValue(v: FirestoreValue): FsValue {
  if (v.stringValue    !== undefined) return v.stringValue;
  if (v.booleanValue   !== undefined) return v.booleanValue;
  if (v.integerValue   !== undefined) return v.integerValue;
  if (v.doubleValue    !== undefined) return v.doubleValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.nullValue      !== undefined) return null;
  if (v.mapValue) {
    return v.mapValue.fields ? fromFirestoreFields(v.mapValue.fields) : {};
  }
  if (v.arrayValue) {
    return (v.arrayValue.values ?? []).map(decodeValue);
  }
  return null;
}

function fromFirestoreFields(fields: FirestoreFields): FsObject {
  const out: FsObject = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decodeValue(v);
  return out;
}

// ── Public API ────────────────────────────────────────────────

export interface FirestoreSetOptions {
  /**
   * If true, PATCH only the top-level fields present in `data` (Firestore REST
   * updateMask). Other fields in the doc are left untouched. Default: false
   * (PATCH without mask replaces the doc — current behavior preserved).
   */
  merge?: boolean;
}

export async function firestoreSet(
  saJson: string,
  path: string,
  data: Record<string, WritableValue>,
  options: FirestoreSetOptions = {},
): Promise<void> {
  const sa = JSON.parse(saJson) as ServiceAccount;
  const token = await getAccessToken(sa);

  let url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/${path}`;
  if (options.merge) {
    const mask = Object.keys(data)
      .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join('&');
    if (mask) url += `?${mask}`;
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore PATCH failed: ${text}`);
  }
}

export async function firestoreGet(
  saJson: string,
  path: string,
): Promise<FsObject | null> {
  const sa = JSON.parse(saJson) as ServiceAccount;
  const token = await getAccessToken(sa);
  const url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/${path}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore GET failed: ${text}`);
  }

  const doc = await res.json() as { fields?: FirestoreFields };
  if (!doc.fields) return null;
  return fromFirestoreFields(doc.fields);
}
