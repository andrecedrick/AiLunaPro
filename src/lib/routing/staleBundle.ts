/**
 * Stale-bundle detection + deterministic auto-recovery (deploy integrity).
 *
 * Mechanism this defends against (verified in production): Cloudflare Pages
 * serves ONLY the current deployment's assets. After a redeploy, an open tab
 * (hash routing — never reloads) that navigates to a not-yet-loaded lazy page
 * requests an OLD chunk URL; the SPA fallback answers 200 index.html AS the
 * chunk → "Failed to fetch dynamically imported module".
 *
 * Recovery: compare the build id BAKED INTO the running bundle (__BUILD_ID__)
 * with the server's current /version.json. Mismatch ⇒ this tab is stale ⇒
 * force ONE reload (index.html is no-cache ⇒ the reload loads the new bundle,
 * after which the ids match — provably convergent, no reload loop). A
 * sessionStorage marker per (old→new) pair guards re-entry races.
 * If the ids MATCH, the failure is NOT staleness — return false and let the
 * caller surface the truthful error UI.
 */

const MARKER = 'ailunapro-stale-reload';

function runningBuildId(): string | null {
  // Production: `__BUILD_ID__` is replaced at compile time by vite `define`.
  // Dev/tests (no define): fall back to a globalThis lookup (stub-friendly).
  if (typeof __BUILD_ID__ === 'string') return __BUILD_ID__;
  const g = (globalThis as { __BUILD_ID__?: unknown }).__BUILD_ID__;
  return typeof g === 'string' ? g : null;
}

/** Fetch the server's current build id (no-store + cache-buster). */
async function serverBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const j = (await res.json()) as { buildId?: unknown };
    return typeof j.buildId === 'string' ? j.buildId : null;
  } catch {
    return null;
  }
}

/**
 * If the running bundle is provably stale, trigger a one-shot reload and
 * resolve true (callers should suspend — the page is about to navigate).
 * Resolves false when staleness can't be proven (same build / fetch failed):
 * the caller must handle the failure normally.
 */
export async function recoverIfStaleBundle(): Promise<boolean> {
  const running = runningBuildId();
  if (!running) return false;
  const server = await serverBuildId();
  if (!server || server === running) return false;

  const pair = `${running}->${server}`;
  try {
    if (sessionStorage.getItem(MARKER) === pair) return false; // already tried this exact upgrade
    sessionStorage.setItem(MARKER, pair);
  } catch { /* storage unavailable — still reload; convergence holds without the marker */ }

  window.location.reload();
  return true;
}
