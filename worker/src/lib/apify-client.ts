/**
 * Apify REST client (cahier §26.3).
 *
 * Network I/O only. No evidence mapping, no scoring — apify-signals.ts is the
 * pure half.
 *
 * Endpoints (confirmed against docs.apify.com/api/v2):
 *   POST /v2/actors/{actorId}/run-sync-get-dataset-items   run + items in one call
 *   POST /v2/actors/{actorId}/runs                         start async
 *   GET  /v2/actor-runs/{runId}                            run status
 *   GET  /v2/datasets/{datasetId}/items                    items
 *
 * Auth is `Authorization: Bearer <token>` — never the `?token=` query form, which
 * would put the secret in URLs and therefore in logs.
 *
 * The sync endpoint returns 408 past 300s, so `timeout` is always sent and is
 * always below the caller's own budget.
 */

const API = 'https://api.apify.com/v2';

/** Hard ceiling on a response body. An actor can emit far more than a Worker can hold. */
export const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
/** Apify's own synchronous ceiling. */
export const APIFY_SYNC_MAX_SECONDS = 300;

export interface ApifyResult<T> {
  ok:     boolean;
  data?:  T;
  /** HTTP status, or 0 for a transport failure. Drives coverage classification. */
  status: number;
  error?: string;
}

/** Terminal Apify run states. Anything else means still running. */
const TERMINAL_FAILED = ['FAILED', 'ABORTED', 'TIMED-OUT', 'TIMING-OUT', 'ABORTING'];

export const isRunSucceeded = (status: string): boolean => status === 'SUCCEEDED';
export const isRunFailed = (status: string): boolean => TERMINAL_FAILED.includes(status);
export const isRunTerminal = (status: string): boolean => isRunSucceeded(status) || isRunFailed(status);

/**
 * Read a response body under a byte ceiling.
 *
 * Streamed rather than `.text()`: a runaway actor could otherwise exhaust the
 * isolate before any cap is applied. Truncation is reported so the caller can
 * mark coverage partial rather than pretending it read everything.
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

async function request<T>(
  token: string, path: string, init: RequestInit, timeoutMs: number,
): Promise<ApifyResult<T> & { truncated?: boolean }> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      signal: ctl.signal,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
  } catch (err) {
    // AbortError included: a timeout is a transport failure, status 0.
    return { ok: false, status: 0, error: err instanceof Error ? err.message.slice(0, 200) : 'network error' };
  } finally {
    clearTimeout(timer);
  }

  const { text, truncated } = await readCapped(res);
  if (!res.ok) {
    // Apify errors are {error:{type,message}}; fall back to raw text.
    let message = text.slice(0, 200);
    try {
      const j = JSON.parse(text) as { error?: { message?: string; type?: string } };
      if (j.error?.message) message = `${j.error.type ?? 'error'}: ${j.error.message}`;
    } catch { /* non-JSON body */ }
    return { ok: false, status: res.status, error: message };
  }

  try {
    return { ok: true, status: res.status, data: JSON.parse(text) as T, truncated };
  } catch {
    return { ok: false, status: res.status, error: 'unparseable Apify response' };
  }
}

export interface RunSyncOptions {
  /** Actor wall-clock ceiling in seconds. Clamped to Apify's 300s sync limit. */
  timeoutSeconds: number;
  memoryMb?:      number;
  /** Client-side abort, normally a little above timeoutSeconds. */
  requestTimeoutMs: number;
}

/**
 * Run an actor and get its dataset items in one call.
 *
 * Returns the items array directly — this endpoint does NOT use the `{data:…}`
 * envelope that the run endpoints do.
 */
export async function runActorSync<T = Record<string, unknown>>(
  token: string, actorId: string, input: Record<string, unknown>, opts: RunSyncOptions,
): Promise<ApifyResult<T[]> & { truncated?: boolean }> {
  const timeout = Math.min(Math.max(1, Math.floor(opts.timeoutSeconds)), APIFY_SYNC_MAX_SECONDS);
  const q = new URLSearchParams({ timeout: String(timeout), format: 'json' });
  if (opts.memoryMb) q.set('memory', String(opts.memoryMb));

  const r = await request<T[]>(
    token,
    `/actors/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?${q.toString()}`,
    { method: 'POST', body: JSON.stringify(input) },
    opts.requestTimeoutMs,
  );
  if (!r.ok) return r;
  // A non-array body from this endpoint means the contract changed; treat as a
  // failure rather than silently collecting nothing.
  if (!Array.isArray(r.data)) return { ok: false, status: r.status, error: 'Apify returned a non-array dataset' };
  return r;
}

export interface ApifyRun { id: string; status: string; defaultDatasetId?: string }

/** Start an actor asynchronously. For runs that will not fit the sync ceiling. */
export async function startActorRun(
  token: string, actorId: string, input: Record<string, unknown>, requestTimeoutMs = 15000,
): Promise<ApifyResult<ApifyRun>> {
  const r = await request<{ data?: ApifyRun }>(
    token, `/actors/${encodeURIComponent(actorId)}/runs`,
    { method: 'POST', body: JSON.stringify(input) }, requestTimeoutMs,
  );
  if (!r.ok) return { ok: false, status: r.status, error: r.error };
  const run = r.data?.data;
  if (!run?.id) return { ok: false, status: r.status, error: 'Apify run response carried no id' };
  return { ok: true, status: r.status, data: run };
}

export async function getActorRun(token: string, runId: string, requestTimeoutMs = 15000): Promise<ApifyResult<ApifyRun>> {
  const r = await request<{ data?: ApifyRun }>(token, `/actor-runs/${encodeURIComponent(runId)}`, {}, requestTimeoutMs);
  if (!r.ok) return { ok: false, status: r.status, error: r.error };
  const run = r.data?.data;
  if (!run?.id) return { ok: false, status: r.status, error: 'Apify run response carried no id' };
  return { ok: true, status: r.status, data: run };
}

/** Fetch dataset items. `limit` is always sent so a huge dataset cannot be pulled whole. */
export async function getDatasetItems<T = Record<string, unknown>>(
  token: string, datasetId: string, limit: number, requestTimeoutMs = 30000,
): Promise<ApifyResult<T[]> & { truncated?: boolean }> {
  const q = new URLSearchParams({ format: 'json', clean: 'true', limit: String(Math.max(1, limit)) });
  const r = await request<T[]>(token, `/datasets/${encodeURIComponent(datasetId)}/items?${q.toString()}`, {}, requestTimeoutMs);
  if (!r.ok) return r;
  if (!Array.isArray(r.data)) return { ok: false, status: r.status, error: 'Apify returned a non-array dataset' };
  return r;
}
