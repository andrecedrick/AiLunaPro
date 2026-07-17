/**
 * Sequenzy transactional email — worker-side REST client.
 *
 * Production runtime integration (NOT the dev MCP). Sends via the saved
 * template slug; the worker only passes variables. Key is server-side only
 * (SEQUENZY_API_KEY secret) — never in the frontend / never VITE_.
 *
 * Sends are best-effort and non-fatal: callers must not let a failed email
 * block the underlying action (e.g. invite creation).
 */
const SEND_URL = 'https://api.sequenzy.com/api/v1/transactional/send';

export interface SequenzySendResult {
  ok:     boolean;
  error?: string;
}

export async function sendTransactional(
  apiKey: string | undefined,
  params: {
    to:        string;
    slug:      string;
    variables: Record<string, string>;
    replyTo?:  string;
  },
): Promise<SequenzySendResult> {
  if (!apiKey) return { ok: false, error: 'SEQUENZY_API_KEY not configured' };

  let res: Response;
  try {
    res = await fetch(SEND_URL, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to:        params.to,
        slug:      params.slug,
        variables: params.variables,
        ...(params.replyTo ? { replyTo: params.replyTo } : {}),
      }),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' };
  }

  if (!res.ok) {
    // Surface the provider's REASON, not just the status. Status-only made live send
    // failures undiagnosable (a 401 bad key and a 404 unknown slug looked identical).
    // The body is PII-scrubbed before it can reach a log or the admin UI: only the
    // provider's error/message/code is taken, any email address is redacted, and the
    // result is truncated — so a recipient address can never leak.
    let detail = '';
    try {
      const body = await res.text();
      let raw = body;
      try {
        const j = JSON.parse(body) as Record<string, unknown>;
        raw = String(j.error ?? j.message ?? j.code ?? body);
      } catch { /* non-JSON body → use the raw text */ }
      detail = raw.replace(/[\w.+-]+@[\w.-]+\.\w+/g, '<email>').replace(/\s+/g, ' ').trim().slice(0, 140);
    } catch { /* body unreadable → status only */ }
    return { ok: false, error: `Sequenzy send failed (HTTP ${res.status})${detail ? `: ${detail}` : ''}` };
  }
  return { ok: true };
}
