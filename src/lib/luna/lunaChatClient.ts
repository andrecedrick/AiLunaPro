/**
 * Luna AI chat client — S3 Phase 2.
 *
 * Calls the authed /api/luna/chat endpoint. On ANY failure (not authed, network
 * error, non-200, or a server-signalled fallback) it returns { fallback: true }
 * so the caller falls back to the deterministic answerLuna(). A throttle (429)
 * surfaces a short wait message instead of a fallback.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export type LunaHistoryTurn = { role: 'user' | 'assistant'; text: string };

export interface LunaAiReply {
  text?: string;
  action?: { label: string; route: string };
  fallback?: boolean;
}

export async function askLunaAI(
  message: string,
  routeName: string,
  history: LunaHistoryTurn[],
  lang: string,
): Promise<LunaAiReply> {
  let token: string;
  try { token = await getIdToken(); } catch { return { fallback: true }; }

  try {
    const res = await fetch(`${WORKER_BASE}/api/luna/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ message, routeName, history, lang }),
    });
    if (res.status === 429) return { text: 'Please wait a moment before sending another message.' };
    if (!res.ok) return { fallback: true };
    const j = await res.json().catch(() => null) as LunaAiReply | null;
    if (!j || j.fallback || typeof j.text !== 'string') return { fallback: true };
    return { text: j.text, action: j.action };
  } catch {
    return { fallback: true };
  }
}
