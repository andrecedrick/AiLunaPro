/**
 * Signup → CRM bridge (client half).
 *
 * A registered user never reached either CRM: `upsertLeadContact` and the Twenty
 * client had exactly one caller between them (the demo-request route), so an
 * account created through #/signup existed only as a Firebase user plus its
 * org/member documents.
 *
 * WHY THE CALL IS DEFERRED: signup does not create an organisation. It navigates
 * to #/org/create, and the org only exists after that step. The CRM route is
 * org-scoped and re-verifies membership, so it cannot run at signup time — there
 * is nothing to be a member of yet.
 *
 * So the phone and country collected on the signup form are stashed here and the
 * push fires once the workspace exists. sessionStorage, not localStorage: this is
 * in-flight signup state, and it must not outlive the tab.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

const KEY = 'ailunapro:signupCrm';

export interface SignupCrmDraft {
  name:    string;
  /** E.164, composed from the country selector + typed number. */
  phone:   string;
  company?: string;
}

/** Stash what signup collected until the workspace exists. */
export function stashSignupCrm(draft: SignupCrmDraft): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(draft)); } catch { /* private mode */ }
}

function readStash(): SignupCrmDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SignupCrmDraft) : null;
  } catch { return null; }
}

/**
 * Push the new account into the internal CRM and Twenty. Call once the org
 * exists.
 *
 * Best-effort by design: the account and workspace are already created, so a CRM
 * failure must never surface as a signup error. The worker raises a durable
 * alert on any failure, which is where an operator finds out — not here.
 *
 * The stash is cleared on a successful push only, so a transient network failure
 * leaves the data available for a later attempt rather than discarding it.
 */
export async function pushSignupToCrm(orgId: string): Promise<boolean> {
  if (!orgId) return false;
  // Gated on the stash: it is written only by the signup form, so this is the
  // signal that THIS session is a fresh signup rather than an ordinary login.
  // Without the gate, every session change would re-push existing accounts.
  const draft = readStash();
  if (!draft) return false;

  try {
    const token = await getIdToken();
    if (!token) return false;
    const res = await fetch(`${WORKER_BASE}/api/signup/crm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      // Name/phone come from the stash when present; the worker falls back to the
      // verified token email for identity either way, so a lost stash still
      // produces a contact rather than nothing.
      body: JSON.stringify({ orgId, name: draft.name, phone: draft.phone, company: draft.company ?? '' }),
    });
    if (!res.ok) return false;
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
    return true;
  } catch {
    return false;
  }
}
