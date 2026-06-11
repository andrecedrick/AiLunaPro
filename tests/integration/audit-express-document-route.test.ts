import { describe, it, expect, vi, beforeEach } from 'vitest';

/* B5 — document analysis route: authed + org-gated, deterministic signal
 * derivation via the EXISTING extract pipeline, strict PII scrub, and
 * analyze→derive→DISCARD (no persistence whatsoever). */

const state = vi.hoisted(() => ({
  members: new Map<string, string>(),
  setCalls: 0,
}));

vi.mock('../../worker/src/middleware/auth', async (orig) => {
  const actual = await orig<typeof import('../../worker/src/middleware/auth')>();
  return {
    ...actual,
    verifyIdToken: vi.fn(async (token?: string) => (token === 'member-token' ? 'uid-1' : token === 'outsider-token' ? 'uid-9' : null)),
  };
});

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    const m = path.match(/^organizations\/([^/]+)\/members\/([^/]+)$/);
    if (m) { const role = state.members.get(`${m[1]}/${m[2]}`); return role ? { role } : null; }
    return null;
  }),
  firestoreSet: vi.fn(async () => { state.setCalls++; }),
}));

import docRoute from '../../worker/src/routes/audit-express-document';

const ENV = { FIREBASE_PROJECT_ID: 'audit-ai', FIREBASE_SERVICE_ACCOUNT_JSON: '{}' } as unknown as Record<string, unknown>;

function post(body: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return docRoute.request('/api/audit-express/analyze-document', { method: 'POST', headers, body: JSON.stringify(body) }, ENV);
}

const DOC_TEXT = `# Acme Logistics Operations Handbook

## Customer support workflow
Our support team handles invoices, shipping documents and customer onboarding.
Contact: jane.doe@acme-logistics.example — phone +1 555 0100.

## Automation
We use spreadsheets for reporting and manual data entry for compliance records.`;

beforeEach(() => {
  state.members.clear();
  state.setCalls = 0;
  state.members.set('orgA/uid-1', 'member');
  vi.clearAllMocks();
});

describe('POST /api/audit-express/analyze-document (B5)', () => {
  it('requires auth and org membership (no cross-tenant access)', async () => {
    expect((await post({ orgId: 'orgA', text: DOC_TEXT })).status).toBe(401);
    expect((await post({ orgId: 'orgA', text: DOC_TEXT }, 'outsider-token')).status).toBe(403);
  });

  it('rejects empty text', async () => {
    expect((await post({ orgId: 'orgA', text: '   ' }, 'member-token')).status).toBe(400);
  });

  it('derives a deterministic snapshot from the SAME pipeline — and persists NOTHING', async () => {
    const res = await post({ orgId: 'orgA', name: 'handbook.md', text: DOC_TEXT }, 'member-token');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const j = await res.json() as Record<string, unknown>;

    expect(j.canonicalUrl).toBe('document://handbook.md');
    expect(j.modelId).toBe('rules:none');                       // explicit no-LLM stamp
    expect(j.understanding).toBeTruthy();                       // feeds existing pipeline
    const identity = j.identity as { title: string | null };
    expect(identity.title).toContain('Acme Logistics');         // first line → title

    // determinism: same input → identical inputsHash
    const res2 = await post({ orgId: 'orgA', name: 'handbook.md', text: DOC_TEXT }, 'member-token');
    const j2 = await res2.json() as Record<string, unknown>;
    expect(j2.inputsHash).toBe(j.inputsHash);

    // analyze → derive → DISCARD: zero writes
    expect(state.setCalls).toBe(0);
  });

  it('scrubs PII — the email never appears anywhere in the response', async () => {
    const res = await post({ orgId: 'orgA', name: 'handbook.md', text: DOC_TEXT }, 'member-token');
    const raw = JSON.stringify(await res.json());
    expect(raw).not.toContain('jane.doe@acme-logistics.example');
    expect(raw).not.toContain('jane.doe');
  });

  it('caps oversized text instead of failing', async () => {
    const huge = 'compliance reporting automation '.repeat(20000); // ~640 KB
    const res = await post({ orgId: 'orgA', name: 'big.txt', text: huge }, 'member-token');
    expect(res.status).toBe(200);
    const j = await res.json() as { pages: Array<{ truncated?: boolean }> };
    expect(j.pages[0].truncated).toBe(true);
  });

  it('sanitizes hostile filenames (no paths, bounded)', async () => {
    const res = await post({ orgId: 'orgA', name: '../../etc/passwd<script>', text: DOC_TEXT }, 'member-token');
    const j = await res.json() as { canonicalUrl: string };
    expect(j.canonicalUrl).toBe('document://passwdscript');
  });
});
