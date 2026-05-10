#!/usr/bin/env node
/**
 * Project Inspection Script — read-only audit.
 *
 * Run:
 *   node scripts/inspect-project.mjs
 *   node scripts/inspect-project.mjs --smoke-api
 *   node scripts/inspect-project.mjs --auth-smoke    (needs INSPECT_ORG_ID + INSPECT_ID_TOKEN)
 *   node scripts/inspect-project.mjs --json
 *
 * Exit codes:
 *   0 — all required checks pass
 *   1 — any FAIL
 *
 * Built-in Node modules only. No new npm deps. Never modifies source.
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = join(__dirname, '..');

// ── CLI flags ─────────────────────────────────────────────
const argv      = process.argv.slice(2);
const SMOKE_API = argv.includes('--smoke-api');
const AUTH_SMOKE = argv.includes('--auth-smoke');
const JSON_OUT  = argv.includes('--json');
const ALLOW_DEBUG = process.env.INSPECT_ALLOW_DEBUG === 'true';

// ── Report state ──────────────────────────────────────────
const findings = []; // { level, category, message, detail? }

function report(level, category, message, detail) {
  findings.push({ level, category, message, detail });
}
const pass = (cat, msg, detail) => report('PASS', cat, msg, detail);
const warn = (cat, msg, detail) => report('WARN', cat, msg, detail);
const fail = (cat, msg, detail) => report('FAIL', cat, msg, detail);

// ── Helpers ───────────────────────────────────────────────
function read(path) {
  try { return readFileSync(join(REPO_ROOT, path), 'utf8'); }
  catch { return null; }
}
function exists(path) {
  return existsSync(join(REPO_ROOT, path));
}
function execCapture(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts });
    return { ok: true, stdout: out, stderr: '' };
  } catch (e) {
    return {
      ok: false,
      stdout: (e.stdout ?? '').toString(),
      stderr: (e.stderr ?? '').toString(),
      status: e.status ?? -1,
    };
  }
}
function lastLines(s, n) {
  return (s ?? '').split(/\r?\n/).slice(-n).join('\n');
}

function walk(dir, exts, skipDirs = []) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try { entries = readdirSync(cur, { withFileTypes: true }); }
    catch { continue; }
    for (const e of entries) {
      const full = join(cur, e.name);
      if (e.isDirectory()) {
        if (skipDirs.some(d => full.includes(d))) continue;
        stack.push(full);
      } else if (e.isFile()) {
        if (!exts.length || exts.some(x => e.name.endsWith(x))) out.push(full);
      }
    }
  }
  return out;
}

function httpRequest({ host = '127.0.0.1', port, path, method = 'GET', headers = {}, body, timeoutMs = 5000 }) {
  return new Promise((resolve) => {
    const req = http.request({ host, port, path, method, headers, timeout: timeoutMs }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ ok: true, status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));
    });
    req.on('error', err => resolve({ ok: false, error: err.code ?? err.message }));
    req.on('timeout', () => { req.destroy(new Error('TIMEOUT')); });
    if (body) req.write(body);
    req.end();
  });
}

// ============================================================
// 1. Git cleanliness
// ============================================================
function checkGit() {
  const cat = 'git';
  const r = execCapture('git status --short');
  if (!r.ok) { fail(cat, 'git status failed', r.stderr); return; }

  const lines = r.stdout.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    pass(cat, 'Working tree clean');
  } else {
    for (const l of lines) {
      const path = l.slice(3);
      const flag = l.slice(0, 2);
      if (path.endsWith('.dev.vars'))         fail(cat, `.dev.vars in working tree: ${path}`);
      else if (path.endsWith('.env.local'))    fail(cat, `.env.local in working tree: ${path}`);
      else if (path.startsWith('.claude/worktrees/')) {
        // Should be ignored — flag if not.
        warn(cat, `.claude/worktrees/ untracked entry: ${path}`);
      } else if (path.startsWith('dist/'))     warn(cat, `dist/ artifact in tree: ${path}`);
      else if (path.startsWith('node_modules/')) fail(cat, `node_modules/ in tree: ${path}`);
      else                                      warn(cat, `Uncommitted change: ${flag} ${path}`);
    }
  }

  // Tracked sensitive files
  const tracked = execCapture('git ls-files');
  if (tracked.ok) {
    for (const f of tracked.stdout.split(/\r?\n/)) {
      if (f.endsWith('.dev.vars'))   fail(cat, `.dev.vars TRACKED: ${f}`);
      if (f.endsWith('.env.local'))  fail(cat, `.env.local TRACKED: ${f}`);
      if (f.startsWith('dist/'))     fail(cat, `dist/ artifact tracked: ${f}`);
      if (f.startsWith('node_modules/')) fail(cat, `node_modules tracked: ${f}`);
    }
  }

  // .gitignore expectations
  const gi = read('.gitignore') ?? '';
  if (!gi.includes('.dev.vars') && !gi.includes('*.local')) warn(cat, '.gitignore missing rule for .dev.vars/*.local');
  if (!gi.includes('.claude/worktrees/'))                    warn(cat, '.gitignore missing .claude/worktrees/');
  if (!gi.includes('.claude/settings.local.json'))           warn(cat, '.gitignore missing .claude/settings.local.json');
}

// ============================================================
// 2. Secrets scan (tracked files only)
// ============================================================
const SECRET_PATTERNS = [
  { name: 'STRIPE_LIVE_KEY',   re: /sk_live_[A-Za-z0-9]{8,}/g, level: 'FAIL' },
  { name: 'STRIPE_TEST_KEY',   re: /sk_test_[A-Za-z0-9]{8,}/g, level: 'WARN' },
  { name: 'STRIPE_WEBHOOK',    re: /whsec_[A-Za-z0-9]{8,}/g,    level: 'FAIL' },
  { name: 'BEARER_JWT',        re: /Bearer\s+eyJ[A-Za-z0-9_-]{40,}/g, level: 'FAIL' },
  // Real PEM blocks: require a base64 body of at least 200 chars between
  // BEGIN and END headers. Plain header literals used in code to strip the
  // header (e.g. .replace(/-----BEGIN PRIVATE KEY-----/, '')) do NOT match.
  { name: 'PRIVATE_KEY_BLOCK', re: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\r\n]+[A-Za-z0-9+/=\s]{200,}-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g, level: 'FAIL' },
  { name: 'FIREBASE_SA_JSON',  re: /"private_key"\s*:\s*"-----BEGIN[\s\S]{200,}/g, level: 'FAIL' },
  { name: 'STRIPE_TOKEN_PRICE', re: /STRIPE_TOKEN_PRICE_[A-Z]+\s*=\s*price_[A-Za-z0-9]{8,}/g, level: 'FAIL' },
];

function checkSecrets() {
  const cat = 'secrets';
  const tracked = execCapture('git ls-files');
  if (!tracked.ok) { fail(cat, 'git ls-files failed'); return; }
  const files = tracked.stdout.split(/\r?\n/).filter(Boolean);
  let hits = 0;
  for (const f of files) {
    if (f.endsWith('.lock') || f.endsWith('.lockb')) continue;
    if (f.startsWith('node_modules/'))               continue;
    let content;
    try { content = readFileSync(join(REPO_ROOT, f), 'utf8'); }
    catch { continue; }
    for (const p of SECRET_PATTERNS) {
      if (p.re.test(content)) {
        hits += 1;
        // Reset lastIndex for global regex
        p.re.lastIndex = 0;
        const lvl = p.level === 'FAIL' ? fail : warn;
        lvl(cat, `${p.name} pattern found in tracked file`, f);
      }
    }
  }
  if (hits === 0) pass(cat, 'No secret patterns in tracked files');
}

// ============================================================
// 3. Typecheck/build
// ============================================================
function checkBuild() {
  const cat = 'build';
  const cmds = [
    { name: 'frontend tsc',   cmd: 'npx tsc --noEmit -p tsconfig.app.json', cwd: REPO_ROOT },
    { name: 'worker tsc',     cmd: 'npx tsc --noEmit',                     cwd: join(REPO_ROOT, 'worker') },
    { name: 'vite build',     cmd: 'npx vite build',                       cwd: REPO_ROOT },
  ];
  for (const { name, cmd, cwd } of cmds) {
    const r = execCapture(cmd, { cwd });
    if (r.ok) pass(cat, `${name} clean`);
    else      fail(cat, `${name} failed`, lastLines(r.stdout + r.stderr, 40));
  }
}

// ============================================================
// 4. Worker env sanity (.dev.vars)
// ============================================================
const WORKER_ENV_REQUIRED = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_SERVICE_ACCOUNT_JSON',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'APP_BASE_URL',
];
const WORKER_ENV_TOKENS = [
  'STRIPE_TOKEN_PRICE_STARTER',
  'STRIPE_TOKEN_PRICE_PRO',
  'STRIPE_TOKEN_PRICE_MAX',
];
const WORKER_ENV_OPTIONAL = ['TOKEN_DEBUG', 'TURNSTILE_SECRET_KEY', 'APP_ENV'];

function parseDevVars(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^﻿/, '').trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    out[k] = v;
  }
  return out;
}

/**
 * Parse [vars] block (and any [env.<name>.vars] block) of wrangler.toml.
 * Minimal parser: matches `KEY = "value"` lines inside a [vars] section.
 */
function parseWranglerVars(text) {
  const out = {};
  if (!text) return out;
  const lines = text.split(/\r?\n/);
  let inVarsBlock = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('#')) continue;
    if (/^\[(.*\.)?vars\]$/i.test(line)) { inVarsBlock = true; continue; }
    if (/^\[/.test(line))                 { inVarsBlock = false; continue; }
    if (!inVarsBlock) continue;
    const m = /^([A-Z_][A-Z0-9_]*)\s*=\s*"([^"]*)"/.exec(line);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function checkWorkerEnv() {
  const cat = 'worker-env';
  const dvPath = 'worker/.dev.vars';
  const tomlPath = 'worker/wrangler.toml';

  let env = {};
  let dvFound = false;
  if (exists(dvPath)) {
    const txt = read(dvPath);
    Object.assign(env, parseDevVars(txt ?? ''));
    dvFound = true;
  } else {
    warn(cat, 'worker/.dev.vars not found (acceptable in CI/prod, required for local dev)');
  }

  if (exists(tomlPath)) {
    const txt = read(tomlPath);
    // .dev.vars takes precedence — only fill keys not already set
    for (const [k, v] of Object.entries(parseWranglerVars(txt ?? ''))) {
      if (env[k] === undefined) env[k] = v;
    }
  } else {
    warn(cat, 'worker/wrangler.toml not found');
  }

  if (!dvFound && Object.keys(env).length === 0) return;

  for (const k of WORKER_ENV_REQUIRED) {
    if (env[k]) pass(cat, `${k} set`);
    else        fail(cat, `${k} missing in .dev.vars or wrangler.toml`);
  }

  let tokensConfigured = 0;
  for (const k of WORKER_ENV_TOKENS) {
    if (env[k]) tokensConfigured += 1;
    else        fail(cat, `${k} missing — tokens topup will 503`);
  }
  if (tokensConfigured === WORKER_ENV_TOKENS.length) pass(cat, 'All STRIPE_TOKEN_PRICE_* set');

  const appEnv = (env.APP_ENV ?? '').toLowerCase();
  if (!appEnv) warn(cat, 'APP_ENV not set — defaults to development');
  else         pass(cat, `APP_ENV=${appEnv}`);

  if (env.TOKEN_DEBUG === 'true' && !ALLOW_DEBUG) {
    warn(cat, 'TOKEN_DEBUG=true (debug routes exposed). Set INSPECT_ALLOW_DEBUG=true to silence.');
  } else if (env.TOKEN_DEBUG === 'true' && ALLOW_DEBUG) {
    pass(cat, 'TOKEN_DEBUG=true (allowed by INSPECT_ALLOW_DEBUG)');
  }

  if (appEnv === 'production') {
    if (env.TURNSTILE_SECRET_KEY) pass(cat, 'TURNSTILE_SECRET_KEY set in production');
    else                          fail(cat, 'APP_ENV=production but TURNSTILE_SECRET_KEY missing');
  } else {
    if (env.TURNSTILE_SECRET_KEY) pass(cat, 'TURNSTILE_SECRET_KEY set');
    else                          warn(cat, 'TURNSTILE_SECRET_KEY missing (dev bypass active)');
  }
  void WORKER_ENV_OPTIONAL;
}

// ============================================================
// 5. Firestore rules static checks
// ============================================================
function checkFirestoreRules() {
  const cat = 'firestore-rules';
  const rules = read('firestore.rules');
  if (!rules) { fail(cat, 'firestore.rules not found'); return; }

  const expectations = [
    { name: '/agents read=false', re: /match\s+\/agents\/\{agentId\}\s*\{[\s\S]*?allow\s+read:\s*if\s+false/ },
    { name: '/agents write=false', re: /match\s+\/agents\/\{agentId\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false/ },
    { name: '/public_diagnostics read=false', re: /match\s+\/public_diagnostics\/\{id\}\s*\{[\s\S]*?allow\s+read:\s*if\s+false/ },
    { name: '/public_diagnostics write=false', re: /match\s+\/public_diagnostics\/\{id\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false/ },
    { name: '/public_roi_calculations read=false', re: /match\s+\/public_roi_calculations\/\{id\}\s*\{[\s\S]*?allow\s+read:\s*if\s+false/ },
    { name: '/public_roi_calculations write=false', re: /match\s+\/public_roi_calculations\/\{id\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false/ },
    { name: 'tokens/current write=false', re: /match\s+\/tokens\/current\s*\{[\s\S]*?allow\s+write:\s*if\s+false/ },
    { name: 'tokens/current/usage write=false', re: /match\s+\/tokens\/current\/usage\/\{eventId\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false/ },
    { name: 'tokens/current/topups write=false', re: /match\s+\/tokens\/current\/topups\/\{sessionId\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false/ },
  ];
  for (const { name, re } of expectations) {
    if (re.test(rules)) pass(cat, name);
    else                fail(cat, `Rule missing or weakened: ${name}`);
  }
}

// ============================================================
// 6. Route registry
// ============================================================
function checkRoutes() {
  const cat = 'routes';
  const idx = read('worker/src/index.ts') ?? '';
  const expectedMounts = [
    'tokensRoutes', 'agentsRoutes', 'diagnosticRoutes', 'roiRoutes', 'recommendRoutes',
    'teamInvitesRoutes', 'teamMembersRoutes',
    'billingCheckoutRoutes', 'billingPortalRoutes', 'billingSyncRoutes',
    'stripeRoutes',
  ];
  for (const r of expectedMounts) {
    if (idx.includes(r)) pass(cat, `worker mounts ${r}`);
    else                 fail(cat, `worker missing mount: ${r}`);
  }

  const audit = read('src/types/audit.ts') ?? '';
  const expectedRoutes = ['billing/tokens', 'agents', 'agents/detail', 'diagnostic', 'roi-calculator', 'help'];
  for (const r of expectedRoutes) {
    if (audit.includes(`'${r}'`)) pass(cat, `Route union includes '${r}'`);
    else                          fail(cat, `Route union missing '${r}'`);
  }

  const app = read('src/App.tsx') ?? '';
  if (/route\.name\s*===\s*'diagnostic'/.test(app)) pass(cat, 'App.tsx handles diagnostic public/chromeless');
  else                                              fail(cat, 'App.tsx missing diagnostic chromeless branch');
  if (/route\.name\s*===\s*'roi-calculator'/.test(app)) pass(cat, 'App.tsx handles roi-calculator public/chromeless');
  else                                                  fail(cat, 'App.tsx missing roi-calculator chromeless branch');
  if (/case\s+'help'\s*:/.test(app))                    pass(cat, 'App.tsx handles help route');
  else                                                   fail(cat, 'App.tsx missing help case');
  if (/case\s+'agents'\s*:/.test(app))               pass(cat, 'App.tsx handles agents route');
  else                                                fail(cat, 'App.tsx missing agents case');
  if (/case\s+'agents\/detail'/.test(app))           pass(cat, 'App.tsx handles agents/detail route');
  else                                                fail(cat, 'App.tsx missing agents/detail case');
  if (/case\s+'billing\/tokens'/.test(app))          pass(cat, 'App.tsx handles billing/tokens route');
  else                                                fail(cat, 'App.tsx missing billing/tokens case');

  // BillingSuccessPage should NOT eat token topups
  const sp = read('src/pages/BillingSuccessPage.tsx') ?? '';
  if (/topup=success|#\/billing\/tokens/.test(sp))   pass(cat, 'BillingSuccessPage guards against token topup redirect');
  else                                                fail(cat, 'BillingSuccessPage missing token-topup guard');
}

// ============================================================
// 7. API smoke checks (--smoke-api)
// ============================================================
async function checkApiSmoke() {
  const cat = 'api-smoke';
  const healthz = await httpRequest({ port: 8787, path: '/healthz' });
  if (!healthz.ok) {
    fail(cat, 'Worker is not running on 127.0.0.1:8787', healthz.error);
    return;
  }
  if (healthz.status !== 200) {
    fail(cat, `/healthz status ${healthz.status}`);
    return;
  }
  pass(cat, '/healthz 200');
  let h;
  try { h = JSON.parse(healthz.body); } catch { h = null; }
  if (h) {
    for (const k of ['firestoreConfigured', 'stripeConfigured', 'webhookConfigured']) {
      if (h[k] === true) pass(cat, `healthz.${k}=true`);
      else                warn(cat, `healthz.${k} not true`);
    }
  }

  // Unauth catalog should reject (401/403), not 502
  const ag = await httpRequest({ port: 8787, path: '/api/agents?orgId=dummy' });
  if (!ag.ok)               fail(cat, '/api/agents request failed', ag.error);
  else if (ag.status === 401 || ag.status === 403) pass(cat, `/api/agents unauth → ${ag.status}`);
  else if (ag.status === 502) fail(cat, '/api/agents 502 — worker proxy / handler crash');
  else                        warn(cat, `/api/agents unexpected status ${ag.status}`);

  // Public diagnostic GET should be 404/405 (POST only)
  const dg = await httpRequest({ port: 8787, path: '/api/public/diagnostic', method: 'GET' });
  if (!dg.ok)               fail(cat, '/api/public/diagnostic request failed', dg.error);
  else if (dg.status === 404 || dg.status === 405) pass(cat, `/api/public/diagnostic GET → ${dg.status}`);
  else                        warn(cat, `/api/public/diagnostic GET unexpected status ${dg.status}`);

  // Public ROI GET should be 404/405 (POST only)
  const rc = await httpRequest({ port: 8787, path: '/api/public/roi-calculation', method: 'GET' });
  if (!rc.ok)               fail(cat, '/api/public/roi-calculation request failed', rc.error);
  else if (rc.status === 404 || rc.status === 405) pass(cat, `/api/public/roi-calculation GET → ${rc.status}`);
  else                        warn(cat, `/api/public/roi-calculation GET unexpected status ${rc.status}`);

  // K3A: /api/recommend POST without auth must reject (401/403), not crash
  const rec = await httpRequest({
    port: 8787, path: '/api/recommend', method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  if (!rec.ok)               fail(cat, '/api/recommend request failed', rec.error);
  else if (rec.status === 401 || rec.status === 403) pass(cat, `/api/recommend unauth → ${rec.status}`);
  else if (rec.status === 502) fail(cat, '/api/recommend 502 — handler crash');
  else                          warn(cat, `/api/recommend POST unexpected status ${rec.status}`);
}

// ============================================================
// 8. Authenticated smoke (--auth-smoke)
// ============================================================
async function checkAuthSmoke() {
  const cat = 'auth-smoke';
  const orgId   = process.env.INSPECT_ORG_ID;
  const idToken = process.env.INSPECT_ID_TOKEN;
  if (!orgId || !idToken) {
    fail(cat, 'INSPECT_ORG_ID and INSPECT_ID_TOKEN required for --auth-smoke');
    return;
  }
  const auth = { Authorization: `Bearer ${idToken}` };

  // Tokens balance
  const bal = await httpRequest({ port: 8787, path: `/api/tokens/balance?orgId=${encodeURIComponent(orgId)}`, headers: auth });
  if (!bal.ok)              { fail(cat, '/api/tokens/balance request failed', bal.error); return; }
  if (bal.status !== 200)   { fail(cat, `/api/tokens/balance status ${bal.status}`, bal.body.slice(0, 200)); }
  else {
    let b;
    try { b = JSON.parse(bal.body); } catch { b = null; }
    if (b) {
      for (const k of ['balance', 'monthlyAllocation', 'consumed', 'rollover', 'topupTotal']) {
        if (typeof b[k] === 'number') pass(cat, `tokens.${k} numeric`);
        else                          fail(cat, `tokens.${k} not numeric (was ${typeof b[k]})`);
      }
    } else fail(cat, 'tokens balance JSON parse failed');
  }

  // Agents list + content audit
  const ag = await httpRequest({ port: 8787, path: `/api/agents?orgId=${encodeURIComponent(orgId)}`, headers: auth });
  if (!ag.ok || ag.status !== 200) {
    fail(cat, `/api/agents status ${ag.status ?? 'ERR'}`, ag.body?.slice(0, 200) ?? ag.error);
    return;
  }
  let data;
  try { data = JSON.parse(ag.body); } catch { data = null; }
  if (!data || !Array.isArray(data.agents)) { fail(cat, 'agents response shape invalid'); return; }
  if (data.agents.length === 10) pass(cat, '10 active agents returned');
  else                            warn(cat, `agents count = ${data.agents.length} (expected 10)`);

  const slugRe = /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/;
  for (const a of data.agents) {
    const id = a.agentId ?? 'unknown';
    if (!slugRe.test(id))                  fail(cat, `agent ${id}: invalid slug`);
    if (!a.source)                          fail(cat, `agent ${id}: source missing`);
    for (const f of ['name', 'tagline', 'description', 'problemSolved']) {
      if (typeof a[f] !== 'string' || a[f].length === 0) fail(cat, `agent ${id}: ${f} empty`);
    }
    if (!a.affiliateUrl?.includes('aff=P60NPGHAAFGD')) fail(cat, `agent ${id}: affiliateUrl missing aff=P60NPGHAAFGD`);
    if (a.status !== 'active')             fail(cat, `agent ${id}: status not active (${a.status})`);
    if (a.schemaVersion !== 1)             fail(cat, `agent ${id}: schemaVersion not 1`);
    if (!a.minPlan)                        fail(cat, `agent ${id}: minPlan missing`);
  }
  pass(cat, 'agent shape validation complete');
}

// ============================================================
// 9. Language sync — French detection in user-visible source
// ============================================================
// French detection — only words that are unambiguously French (not
// identical EN/FR cognates like "invitation", "format", "client").
const FRENCH_ACCENT_RE = /[éèàêôçûùîïœëâ]/;
const FRENCH_WORD_RE = /\b(gérer|relance|conformité|équipe|équipes|réponse|réponses|facture|factures|devis|paramètres|paiement|facturation|conçu|orienté|annulé|envoyé|sélection|retour|annuler|sauvegarder|connexion|déconnexion|veuillez|merci|bonjour|aujourd|aujourd'hui|langue|français|française)\b/i;

// Files where non-English locale labels are intentional (language picker,
// currency picker, locale constants).
const LANGUAGE_ALLOWLIST = new Set([
  'src/pages/settings/PreferencesPage.tsx',
  'src/components/layout/SidebarPreferences.tsx',
  'src/lib/preferences.ts',
]);

// Skip lines that are clearly not user-visible: imports, type/interface
// declarations, type-only references, identifier-only fragments.
function isNonVisibleLine(line) {
  const t = line.trim();
  if (t.startsWith('import '))                 return true;
  if (t.startsWith('export type'))             return true;
  if (t.startsWith('export interface'))        return true;
  if (t.startsWith('type '))                   return true;
  if (t.startsWith('interface '))              return true;
  if (/^export\s+(async\s+)?function/.test(t)) return true;
  // TypeScript pure type-cast lines: `as Invitation`, `: Invitation`, `<Invitation>`
  if (/^[}\)\]>]/.test(t)) return false;
  return false;
}

// Heuristic: only count hits that appear inside a string literal
// (single, double, or backtick) on the line. Comments stripped first.
function lineHasFrenchInString(line) {
  // Extract all quoted segments (handle \' and \" naively)
  const strings = [];
  const re = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    strings.push(m[1] ?? m[2] ?? m[3] ?? '');
  }
  for (const s of strings) {
    if (FRENCH_ACCENT_RE.test(s) || FRENCH_WORD_RE.test(s)) return s;
  }
  return null;
}

const SCAN_DIRS = [
  { dir: 'src',                 exts: ['.tsx', '.ts'] },
  { dir: 'worker/src/data',     exts: ['.ts'] },
  { dir: 'worker/src/routes',   exts: ['.ts'] },
  { dir: 'worker/src/lib',      exts: ['.ts'] },
];
const SCAN_SKIP_DIRS = ['node_modules', 'dist'];

function checkLanguage() {
  const cat = 'language';
  let frenchHitsCode = 0;
  let frenchHitsComments = 0;
  const examples = [];

  for (const { dir, exts } of SCAN_DIRS) {
    const root = join(REPO_ROOT, dir);
    if (!existsSync(root)) continue;
    const files = walk(root, exts, SCAN_SKIP_DIRS);
    for (const f of files) {
      const rel = relative(REPO_ROOT, f).replace(/\\/g, '/');
      if (LANGUAGE_ALLOWLIST.has(rel)) continue;
      let txt;
      try { txt = readFileSync(f, 'utf8'); }
      catch { continue; }
      const lines = txt.split(/\r?\n/);
      let inBlockComment = false;
      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const before = inBlockComment;
        if (inBlockComment) {
          if (raw.includes('*/')) inBlockComment = false;
        } else if (/\/\*/.test(raw) && !/\*\//.test(raw)) {
          inBlockComment = true;
        }
        const inCommentLine = before || raw.trimStart().startsWith('*') || raw.trimStart().startsWith('//');

        if (inCommentLine) {
          // Comments can contain French — count separately as WARN-level only.
          if (FRENCH_ACCENT_RE.test(raw) || FRENCH_WORD_RE.test(raw)) frenchHitsComments += 1;
          continue;
        }
        if (isNonVisibleLine(raw)) continue;

        // Only inspect quoted strings (user-visible UI text candidates).
        const offendingString = lineHasFrenchInString(raw);
        if (offendingString !== null) {
          frenchHitsCode += 1;
          if (examples.length < 25) {
            examples.push(`${rel}:${i + 1}: ${offendingString.slice(0, 140)}`);
          }
        }
      }
    }
  }

  if (frenchHitsCode === 0)   pass(cat, 'No French text in user-visible strings');
  else                         fail(cat, `French in user-visible strings: ${frenchHitsCode} occurrence(s)`, examples.join('\n'));

  if (frenchHitsComments > 0) warn(cat, `French in comments: ${frenchHitsComments} occurrences (acceptable if documenting historical context)`);

  // Targeted file checks (raw accent scan — these are seed/data files,
  // any accent there is a regression).
  const seedW = read('worker/src/data/agents-seed.ts') ?? '';
  if (FRENCH_ACCENT_RE.test(seedW)) fail(cat, 'agents-seed.ts contains French accents');
  else                              pass(cat, 'agents-seed.ts has no French accents');

  const seedQ = read('worker/src/data/diagnostic-questions.ts') ?? '';
  if (FRENCH_ACCENT_RE.test(seedQ)) fail(cat, 'diagnostic-questions.ts (worker) contains French accents');
  else                              pass(cat, 'diagnostic-questions.ts (worker) clean');

  const seedQF = read('src/data/diagnostic-questions.ts') ?? '';
  if (FRENCH_ACCENT_RE.test(seedQF)) fail(cat, 'diagnostic-questions.ts (frontend) contains French accents');
  else                                pass(cat, 'diagnostic-questions.ts (frontend) clean');
}

// ============================================================
// 10. Module regression checks
// ============================================================
function checkModules() {
  const cat = 'modules';

  // Tokens
  const badge = read('src/components/tokens/TokenBadge.tsx') ?? '';
  if (badge.includes('safeTokenNumber')) pass(cat, 'TokenBadge uses safeTokenNumber');
  else                                    fail(cat, 'TokenBadge missing safeTokenNumber');
  const tpage = read('src/pages/TokensPage.tsx') ?? '';
  if (tpage.includes('safeTokenNumber') || tpage.includes('safeBal')) pass(cat, 'TokensPage uses defensive numeric coercion');
  else                                                                  fail(cat, 'TokensPage missing safe numeric helper');

  const tokensRoute = read('worker/src/routes/tokens.ts') ?? '';
  if (/_debug\/repair[\s\S]*?TOKEN_DEBUG/.test(tokensRoute) || tokensRoute.includes("TOKEN_DEBUG !== 'true'")) {
    pass(cat, 'tokens repair route TOKEN_DEBUG-gated');
  } else {
    fail(cat, 'tokens repair route TOKEN_DEBUG gate not detected');
  }

  // Agents
  const agentsClient = read('src/lib/agents/agentsClient.ts') ?? '';
  if (agentsClient.includes('orgId') && agentsClient.includes("params.set('orgId'")) pass(cat, 'agentsClient passes orgId');
  else                                                                                fail(cat, 'agentsClient does not pass orgId');

  const agentsPage = read('src/pages/AgentsPage.tsx') ?? '';
  if (agentsPage.includes('session?.orgId') || agentsPage.includes('orgId')) pass(cat, 'AgentsPage gates on session.orgId');
  else                                                                          fail(cat, 'AgentsPage missing orgId gate');

  const agentDetail = read('src/pages/AgentDetailPage.tsx') ?? '';
  if (agentDetail.includes('orgId')) pass(cat, 'AgentDetailPage passes orgId');
  else                                fail(cat, 'AgentDetailPage missing orgId');

  // Sidebar hides agents for client
  const sidebar = read('src/components/layout/Sidebar.tsx') ?? '';
  if (/item\.id\s*===\s*'agents'\s*&&\s*role\s*===\s*'client'/.test(sidebar)) pass(cat, 'Sidebar hides Agents for client');
  else                                                                          fail(cat, 'Sidebar missing client gate for Agents');

  // Diagnostic — detect actual middleware invocation in the route
  // registration chain, not bare word in comments.
  const dRoute = read('worker/src/routes/diagnostic.ts') ?? '';
  const requireAuthCallInDiag = /\.(?:post|get|put|delete)\s*\([^)]*requireAuth\s*\(/m.test(dRoute);
  if (requireAuthCallInDiag) fail(cat, 'POST /api/public/diagnostic should NOT have requireAuth');
  else                        pass(cat, 'POST /api/public/diagnostic has no requireAuth call');

  // ROI — same public-route check
  const roiRoute = read('worker/src/routes/roi.ts') ?? '';
  if (!roiRoute) {
    fail(cat, 'worker/src/routes/roi.ts not found');
  } else if (!/\.post\s*\(\s*['"]\/api\/public\/roi-calculation['"]/.test(roiRoute)) {
    fail(cat, 'POST /api/public/roi-calculation route registration not found');
  } else {
    pass(cat, 'POST /api/public/roi-calculation registered');
    const requireAuthCallInRoi = /\.(?:post|get|put|delete)\s*\([^)]*requireAuth\s*\(/m.test(roiRoute);
    if (requireAuthCallInRoi) fail(cat, 'POST /api/public/roi-calculation should NOT have requireAuth');
    else                       pass(cat, 'POST /api/public/roi-calculation has no requireAuth call');
  }

  const turnstile = read('worker/src/lib/turnstile.ts') ?? '';
  if (turnstile.includes('isProduction(env)') && turnstile.includes('TURNSTILE_NOT_CONFIGURED')) {
    pass(cat, 'Turnstile production-strict gate present');
  } else {
    fail(cat, 'Turnstile production-strict gate not detected');
  }

  // Billing success guard for token topups
  const bsp = read('src/pages/BillingSuccessPage.tsx') ?? '';
  if (bsp.includes('topup=success') || bsp.includes('#/billing/tokens')) pass(cat, 'BillingSuccessPage redirects token topups');
  else                                                                     fail(cat, 'BillingSuccessPage missing token-topup redirect');

  // Team routes mounted
  const idx = read('worker/src/index.ts') ?? '';
  if (idx.includes('teamInvitesRoutes')) pass(cat, 'teamInvitesRoutes mounted');
  else                                     fail(cat, 'teamInvitesRoutes not mounted');
  if (idx.includes('teamMembersRoutes')) pass(cat, 'teamMembersRoutes mounted');
  else                                     fail(cat, 'teamMembersRoutes not mounted');

  // Stripe webhook
  if (idx.includes('stripeRoutes')) pass(cat, 'stripeRoutes mounted');
  else                                fail(cat, 'stripeRoutes not mounted');

  // K3A: Recommend route
  const recRoute = read('worker/src/routes/recommend.ts') ?? '';
  if (!recRoute) {
    fail(cat, 'worker/src/routes/recommend.ts not found');
  } else {
    if (/\.post\s*\(\s*['"]\/api\/recommend['"]/.test(recRoute)) pass(cat, 'POST /api/recommend registered');
    else                                                          fail(cat, 'POST /api/recommend route registration not found');

    const hasAuth = /\.post\s*\([^)]*requireAuth\s*\(/m.test(recRoute);
    const hasRole = /requireRole\s*\(/m.test(recRoute);
    if (hasAuth && hasRole) pass(cat, 'POST /api/recommend has auth + role gates');
    else                     fail(cat, 'POST /api/recommend missing auth or role gate');
  }

  // ── J1: Stripe subscription sync hardening checks ──────────
  const j1cat = 'billing/J1';
  const billingShared = read('worker/src/lib/billing-admin-shared.ts') ?? '';
  const stripeRoute   = read('worker/src/routes/stripe.ts') ?? '';
  const syncRoute     = read('worker/src/routes/billing-sync.ts') ?? '';
  const coRoute       = read('worker/src/routes/billing-checkout.ts') ?? '';
  const portalRoute   = read('worker/src/routes/billing-portal.ts') ?? '';

  // J1.0 — shared helpers exported from billing-admin-shared.ts
  if (/export\s+function\s+planLabelFromProductId\b/.test(billingShared)
      && /export\s+function\s+extractProductIdFromSubscription\b/.test(billingShared)
      && /export\s+const\s+PRODUCT_TO_PLAN_LABEL\b/.test(billingShared)) {
    pass(j1cat, 'billing-admin-shared exports planLabelFromProductId + extractProductIdFromSubscription');
  } else {
    fail(j1cat, 'billing-admin-shared missing J1 shared plan helpers');
  }

  // J1.1 — no hardcoded localhost in Stripe redirect URLs (fallback pattern is OK)
  // Match string literal 'http://localhost:5173' or "http://localhost:5173"
  // EXCEPT when preceded by `?? ` (nullish-coalescing fallback).
  const hardcodedLocalhostRe = /(?<!\?\?\s)['"]http:\/\/localhost:5173/;
  for (const [label, body] of [['billing-checkout.ts', coRoute], ['billing-portal.ts', portalRoute]]) {
    // strip all `?? 'http://localhost:5173'` fallback occurrences before scanning
    const stripped = body.replace(/\?\?\s*['"]http:\/\/localhost:5173[^'"]*['"]/g, '');
    if (/['"]http:\/\/localhost:5173/.test(stripped)) {
      fail(j1cat, `${label}: hardcoded localhost redirect URL detected (must use APP_BASE_URL fallback pattern)`);
    } else {
      pass(j1cat, `${label}: no hardcoded localhost redirect URL`);
    }
  }

  // J1.2 — stripe.ts uses shared plan mapping
  if (/from\s+['"]\.\.\/lib\/billing-admin-shared['"]/.test(stripeRoute)
      && /planLabelFromProductId\s*\(/.test(stripeRoute)
      && /extractProductIdFromSubscription\s*\(/.test(stripeRoute)) {
    pass(j1cat, 'stripe.ts imports shared plan helpers');
  } else {
    fail(j1cat, 'stripe.ts missing shared plan helper imports');
  }
  if (/const\s+PRODUCT_TO_PLAN\s*:\s*Record/.test(stripeRoute)) {
    fail(j1cat, 'stripe.ts still declares local PRODUCT_TO_PLAN');
  } else {
    pass(j1cat, 'stripe.ts has no local PRODUCT_TO_PLAN duplicate');
  }

  // J1.3 — billing-sync.ts uses shared plan mapping
  if (/from\s+['"]\.\.\/lib\/billing-admin-shared['"]/.test(syncRoute)
      && /planLabelFromProductId\s*\(/.test(syncRoute)
      && /extractProductIdFromSubscription\s*\(/.test(syncRoute)) {
    pass(j1cat, 'billing-sync.ts imports shared plan helpers');
  } else {
    fail(j1cat, 'billing-sync.ts missing shared plan helper imports');
  }
  if (/const\s+PRODUCT_TO_PLAN\s*:\s*Record/.test(syncRoute)) {
    fail(j1cat, 'billing-sync.ts still declares local PRODUCT_TO_PLAN');
  } else {
    pass(j1cat, 'billing-sync.ts has no local PRODUCT_TO_PLAN duplicate');
  }

  // J1.4 — stripe.ts checkout.session.completed subscription branch calls syncBalanceAllocation
  // Locate the subscription branch (after the tokens_topup `break;`) and search
  // for a syncBalanceAllocation call up to the next case label.
  const ccsMatch = stripeRoute.match(/case\s+'checkout\.session\.completed'\s*:[\s\S]*?case\s+'customer\.subscription\.(?:updated|created)'/);
  if (ccsMatch) {
    const ccsBlock = ccsMatch[0];
    // Drop the tokens_topup early-return sub-block so we only inspect the subscription branch
    const subBranch = ccsBlock.replace(/if\s*\(\s*session\.metadata\?\.type\s*===\s*'tokens_topup'\s*\)\s*\{[\s\S]*?\n\s{6}\}/, '');
    if (/syncBalanceAllocation\s*\(/.test(subBranch)) {
      pass(j1cat, 'stripe.ts checkout.completed subscription branch calls syncBalanceAllocation');
    } else {
      fail(j1cat, 'stripe.ts checkout.completed subscription branch missing syncBalanceAllocation');
    }
  } else {
    fail(j1cat, 'stripe.ts checkout.session.completed branch not found for J1 check');
  }

  // J1.5 — billing-sync.ts calls syncBalanceAllocation
  if (/syncBalanceAllocation\s*\(/.test(syncRoute)) {
    pass(j1cat, 'billing-sync.ts calls syncBalanceAllocation');
  } else {
    fail(j1cat, 'billing-sync.ts missing syncBalanceAllocation call');
  }
}

// ============================================================
// Main
// ============================================================
async function main() {
  const startTs = Date.now();

  // Phase: read-only static checks
  checkGit();
  checkSecrets();
  checkBuild();
  checkWorkerEnv();
  checkFirestoreRules();
  checkRoutes();
  checkLanguage();
  checkModules();

  if (SMOKE_API)  await checkApiSmoke();
  if (AUTH_SMOKE) await checkAuthSmoke();

  // Summary
  const counts = { PASS: 0, WARN: 0, FAIL: 0 };
  for (const f of findings) counts[f.level] = (counts[f.level] ?? 0) + 1;

  if (JSON_OUT) {
    process.stdout.write(JSON.stringify({ findings, counts, durationMs: Date.now() - startTs }, null, 2) + '\n');
  }

  // Human report
  console.log('');
  console.log('================================================');
  console.log(' Project Inspection Report');
  console.log('================================================');
  for (const f of findings) {
    const tag = f.level.padEnd(4);
    console.log(`[${tag}] [${f.category}] ${f.message}`);
    if (f.detail) {
      const lines = String(f.detail).split(/\r?\n/).slice(0, 6);
      for (const l of lines) console.log(`         ${l}`);
    }
  }
  console.log('');
  console.log('------------------------------------------------');
  console.log(` Summary: PASS=${counts.PASS}  WARN=${counts.WARN}  FAIL=${counts.FAIL}`);
  console.log(`          Duration: ${Date.now() - startTs} ms`);
  console.log('------------------------------------------------');

  if (counts.FAIL > 0) {
    console.log('');
    console.log('Critical failures:');
    for (const f of findings.filter(x => x.level === 'FAIL')) {
      console.log(`  - [${f.category}] ${f.message}`);
    }
  }
  if (counts.WARN > 0) {
    console.log('');
    console.log('Warnings:');
    for (const f of findings.filter(x => x.level === 'WARN')) {
      console.log(`  - [${f.category}] ${f.message}`);
    }
  }

  process.exit(counts.FAIL > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Inspection script crashed:', e);
  process.exit(2);
});
