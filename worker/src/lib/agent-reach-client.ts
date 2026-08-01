/**
 * Agent-Reach bridge client (cahier §26.3).
 *
 * Network I/O only.
 *
 * WHY A BRIDGE AND NOT A DIRECT INTEGRATION. Agent-Reach (Panniantong/Agent-Reach)
 * is a Python CLI: it shells out to yt-dlp, feedparser, twitter-cli and friends,
 * and it reads credentials off disk. A Cloudflare Worker is a V8 isolate with no
 * Python runtime, no filesystem and no subprocess. Agent-Reach therefore CANNOT
 * run inside this worker, and no amount of wrapping changes that.
 *
 * The integration is consequently an HTTP contract that the operator satisfies by
 * hosting Agent-Reach behind a small service. The contract below is OURS, not
 * upstream's — Agent-Reach ships no HTTP API — so it is documented here in full
 * rather than assumed:
 *
 *   POST {AGENT_REACH_URL}/collect
 *   Authorization: Bearer {AGENT_REACH_TOKEN}
 *   { "platform": "github", "target": "acme.example", "maxItems": 25, "timeoutMs": 30000 }
 *   → 200 { "items": [ { "url": "...", "text": "...", "title": "..." } ], "truncated": false }
 *
 * Until that service exists the collector is not constructed and every source it
 * would have read is reported `not_attempted` — visible in coverage, never
 * silent (§26.12).
 */

const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

export interface AgentReachDoc {
  url?:   unknown;
  text?:  unknown;
  title?: unknown;
  /** Transcript for a video/presentation, when the platform supplies one. */
  transcript?: unknown;
}

export interface AgentReachResponse {
  items?:     AgentReachDoc[];
  truncated?: boolean;
  /** Bridge-side note, surfaced into coverage when present. */
  note?:      string;
}

export interface BridgeResult {
  ok:        boolean;
  status:    number;
  items:     AgentReachDoc[];
  truncated: boolean;
  note:      string;
  error?:    string;
}

/** Platforms the bridge is asked for. Mirrors what Agent-Reach can actually read. */
export const AGENT_REACH_PLATFORMS = [
  'github', 'youtube', 'linkedin', 'instagram', 'facebook',
  'twitter', 'reddit', 'rss', 'web',
] as const;
export type AgentReachPlatform = (typeof AGENT_REACH_PLATFORMS)[number];

export interface BridgeConfig {
  /** Base URL of the operator-hosted Agent-Reach service. */
  url:   string;
  token: string;
}

/** Absent config means the collector is never constructed. */
export function buildBridgeConfig(env: { AGENT_REACH_URL?: string; AGENT_REACH_TOKEN?: string }): BridgeConfig | null {
  const url = (env.AGENT_REACH_URL ?? '').trim().replace(/\/+$/, '');
  const token = (env.AGENT_REACH_TOKEN ?? '').trim();
  if (!url || !token) return null;
  // https only: the bridge carries platform credentials and returns customer
  // evidence, so a plaintext hop is not acceptable even inside a private network.
  if (!/^https:\/\//i.test(url)) return null;
  return { url, token };
}

/**
 * Read a response body under a byte ceiling.
 *
 * Streamed rather than `.text()`: a transcript-heavy reply can be very large, and
 * a Worker that buffers it whole dies before any cap applies. Truncation is
 * reported so coverage can be marked partial rather than passed off as complete.
 */
async function readCapped(res: Response): Promise<{ text: string; truncated: boolean }> {
  const body = res.body;
  if (!body) return { text: '', truncated: false };
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0, truncated = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      if (total + value.byteLength > MAX_RESPONSE_BYTES) {
        chunks.push(value.slice(0, MAX_RESPONSE_BYTES - total));
        truncated = true;
        break;
      }
      chunks.push(value);
      total += value.byteLength;
    }
  } finally {
    await reader.cancel().catch(() => { /* already closed */ });
  }
  const merged = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
  let at = 0;
  for (const c of chunks) { merged.set(c, at); at += c.byteLength; }
  return { text: new TextDecoder().decode(merged), truncated };
}

/**
 * Ask the bridge to read one platform for one target.
 *
 * Never throws: a transport failure returns status 0 so the caller classifies it
 * as coverage rather than losing the audit.
 */
export async function collectFromBridge(
  cfg: BridgeConfig,
  req: { platform: AgentReachPlatform; target: string; maxItems: number; timeoutMs: number },
): Promise<BridgeResult> {
  const empty = { items: [] as AgentReachDoc[], truncated: false, note: '' };
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), req.timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${cfg.url}/collect`, {
      method: 'POST',
      signal: ctl.signal,
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: req.platform, target: req.target,
        maxItems: req.maxItems, timeoutMs: req.timeoutMs,
      }),
    });
  } catch (err) {
    return { ok: false, status: 0, ...empty, error: err instanceof Error ? err.message.slice(0, 200) : 'network error' };
  } finally {
    clearTimeout(timer);
  }

  const { text, truncated } = await readCapped(res);
  if (!res.ok) {
    let message = text.slice(0, 200);
    try {
      const j = JSON.parse(text) as { error?: string; message?: string };
      message = (j.error ?? j.message ?? message).slice(0, 200);
    } catch { /* non-JSON body */ }
    return { ok: false, status: res.status, ...empty, error: message };
  }

  let parsed: AgentReachResponse;
  try { parsed = JSON.parse(text) as AgentReachResponse; }
  catch { return { ok: false, status: res.status, ...empty, error: 'unparseable bridge response' }; }

  // A malformed 200 is a failure, not an empty read. Reporting "nothing found"
  // for a broken contract is exactly the silent failure §26.12 forbids.
  if (!Array.isArray(parsed.items)) {
    return { ok: false, status: res.status, ...empty, error: 'bridge returned no items array' };
  }

  return {
    ok: true, status: res.status,
    items: parsed.items,
    truncated: truncated || parsed.truncated === true,
    note: typeof parsed.note === 'string' ? parsed.note.slice(0, 140) : '',
  };
}
