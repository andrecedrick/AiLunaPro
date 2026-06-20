/**
 * Luna AI chat client — S3 Phase 2 + L2.
 *
 * Calls the authed /api/luna/chat. On ANY failure (not authed, network, non-200
 * other than 402/429, or a server-signalled fallback) returns { fallback: true }
 * so the caller falls back to the deterministic answerLuna(). A 402 (free quota
 * exhausted + insufficient tokens) returns { needTokens } so the caller can show
 * the InsufficientTokensModal; a 429 surfaces a short wait message.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export type LunaHistoryTurn = { role: 'user' | 'assistant'; text: string };

export interface AskLunaInput {
  message:   string;
  routeName: string;
  history:   LunaHistoryTurn[];
  lang:      string;
  orgId:     string;
  eventId:   string;   // idempotency key for the token charge (safe retry)
}

export interface LunaAiReply {
  text?:       string;
  action?:     { label: string; route: string };
  fallback?:   boolean;
  needTokens?: { balance: number; required: number };
}

export async function askLunaAI(input: AskLunaInput): Promise<LunaAiReply> {
  let token: string;
  try { token = await getIdToken(); } catch { return { fallback: true }; }

  try {
    const res = await fetch(`${WORKER_BASE}/api/luna/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify(input),
    });
    if (res.status === 429) return { text: 'Please wait a moment before sending another message.' };
    if (res.status === 402) {
      const j = await res.json().catch(() => null) as { balance?: number; required?: number } | null;
      return { needTokens: { balance: j?.balance ?? 0, required: j?.required ?? 0 } };
    }
    if (!res.ok) return { fallback: true };
    const j = await res.json().catch(() => null) as LunaAiReply | null;
    if (!j || j.fallback || typeof j.text !== 'string') return { fallback: true };
    return { text: j.text, action: j.action };
  } catch {
    return { fallback: true };
  }
}
