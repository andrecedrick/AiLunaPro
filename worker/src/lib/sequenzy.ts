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
    const text = await res.text().catch(() => res.statusText);
    return { ok: false, error: `Sequenzy ${res.status}: ${text}` };
  }
  return { ok: true };
}
