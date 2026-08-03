#!/usr/bin/env node
/**
 * Stripe catalog setup (§27 P1.2 Phase B).
 *
 *   node scripts/stripe-setup.mjs                 # DRY RUN (default) — writes nothing
 *   node scripts/stripe-setup.mjs --export        # read the account -> catalog file
 *   node scripts/stripe-setup.mjs --apply         # create missing objects (test mode)
 *   node scripts/stripe-setup.mjs --apply --allow-live   # ... in LIVE mode
 *   node scripts/stripe-setup.mjs --verify        # check + print the Phase C ids
 *
 * CREDENTIALS. `STRIPE_SECRET_KEY` is read from the environment and nowhere
 * else. It is never written to a file, never printed, never included in an error
 * message. Only its MODE (derived from the prefix) is ever displayed.
 *
 *   PowerShell:  $env:STRIPE_SECRET_KEY = "sk_test_..."; node scripts/stripe-setup.mjs
 *   bash:        STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
 *
 * WHY DRY RUN IS THE DEFAULT. This creates real, billable, largely irreversible
 * objects — a Stripe price cannot be edited once it exists, only archived. The
 * safe mode has to be the one you get by forgetting a flag.
 *
 * WHY LIVE NEEDS A SECOND FLAG. `--apply` alone will refuse an `sk_live_` key.
 * Creating a live catalog is the single most consequential action in this
 * repository; it should not be reachable by re-running a command from shell
 * history that was written for test mode.
 *
 * No dependencies: talks to the Stripe REST API with fetch.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  PLANS, PLAN_LABELS, TOKEN_PACKS, MANAGED_KEY, ENV_VAR,
  productKey, priceKey, tokenPriceKey, couponKey,
  detectMode, validateCatalog, planCatalog, hasConflicts, summarise,
  renderPhaseCBlock, missingPhaseCIds, redact,
} from './stripe-catalog.mjs';

const API = 'https://api.stripe.com/v1';
const CATALOG_PATH = path.join(process.cwd(), 'scripts', 'stripe-catalog.json');

const argv = new Set(process.argv.slice(2));
const MODE_FLAGS = {
  export: argv.has('--export'),
  apply: argv.has('--apply'),
  verify: argv.has('--verify'),
  allowLive: argv.has('--allow-live'),
};
const DRY_RUN = !MODE_FLAGS.apply && !MODE_FLAGS.export;

const c = {
  ok: s => `\x1b[32m${s}\x1b[0m`, warn: s => `\x1b[33m${s}\x1b[0m`,
  err: s => `\x1b[31m${s}\x1b[0m`, dim: s => `\x1b[2m${s}\x1b[0m`, b: s => `\x1b[1m${s}\x1b[0m`,
};

/** Thrown by die() so the process can unwind cleanly instead of hard-exiting. */
class ExitError extends Error {}

/**
 * Abort with a message.
 *
 * Sets `exitCode` and throws rather than calling `process.exit()`: exiting while
 * fetch still holds open sockets aborts the Node process on Windows with a libuv
 * assertion, turning a clean "invalid key" message into a crash dump.
 */
function die(msg) {
  console.error(c.err(`\n✖ ${redact(msg)}\n`));
  process.exitCode = 1;
  throw new ExitError();
}

/* ── Stripe REST ──────────────────────────────────────────────────── */

const SECRET = (process.env.STRIPE_SECRET_KEY ?? '').trim();
const MODE = detectMode(SECRET);

/** Form-encode, including Stripe's bracket syntax for nested fields. */
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object' && !Array.isArray(v)) form(v, key, out);
    else if (Array.isArray(v)) v.forEach((item, i) => out.append(`${key}[${i}]`, String(item)));
    else out.append(key, String(v));
  }
  return out;
}

async function api(method, endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      // Stripe echoes this in the dashboard's request log, so an operator can
      // see which objects this script created and which were made by hand.
      'User-Agent': 'ailunapro-stripe-setup',
    },
    body: body ? form(body).toString() : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Deliberately reports Stripe's own message and NEVER the request headers,
    // so a failure can be diagnosed without a key reaching a log.
    const m = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Stripe ${method} ${endpoint}: ${m}`);
  }
  return json;
}

/** Page through a list endpoint. */
async function listAll(endpoint, params = {}) {
  const out = [];
  let startingAfter;
  for (let page = 0; page < 20; page++) {
    const q = new URLSearchParams({ limit: '100', ...params });
    if (startingAfter) q.set('starting_after', startingAfter);
    const r = await api('GET', `${endpoint}?${q}`);
    out.push(...(r.data ?? []));
    if (!r.has_more || r.data.length === 0) break;
    startingAfter = r.data[r.data.length - 1].id;
  }
  return out;
}

async function readAccount() {
  const [products, prices, coupons, promotionCodes] = await Promise.all([
    listAll('/products', { active: 'true' }),
    listAll('/prices', { active: 'true' }),
    listAll('/coupons'),
    listAll('/promotion_codes'),
  ]);
  return { products, prices, coupons, promotionCodes };
}

/* ── Catalog file ─────────────────────────────────────────────────── */

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    die(`No catalog at scripts/stripe-catalog.json.\n  Create it from your CURRENT account with:\n    node scripts/stripe-setup.mjs --export`);
  }
  try { return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8')); }
  catch (e) { die(`Catalog is not valid JSON: ${e.message}`); }
}

/**
 * Export the current account's catalog to a file.
 *
 * This is what removes guesswork from the migration: run it against TEST to
 * capture the amounts you already charge, then apply that same file to LIVE.
 * Nobody has to retype a price, and no amount is invented.
 */
async function doExport() {
  const actual = await readAccount();
  const byKey = new Map(actual.prices.filter(p => p.metadata?.[MANAGED_KEY]).map(p => [p.metadata[MANAGED_KEY], p]));
  const productByKey = new Map(actual.products.filter(p => p.metadata?.[MANAGED_KEY]).map(p => [p.metadata[MANAGED_KEY], p]));

  const catalog = { plans: {}, tokenPacks: {}, promotions: [] };

  for (const plan of PLANS) {
    // Unmanaged accounts (the current test account) have no ailuna_key, so fall
    // back to grouping by the product the price points at.
    const product = productByKey.get(productKey(plan))
      ?? actual.products.find(p => p.name?.toLowerCase() === plan);
    const prices = actual.prices.filter(p => p.recurring && product && p.product === product.id);
    catalog.plans[plan] = {
      prices: prices.map(p => ({ currency: p.currency, amountMinor: p.unit_amount, interval: p.recurring.interval })),
    };
  }

  for (const { pack } of TOKEN_PACKS) {
    const p = byKey.get(tokenPriceKey(pack));
    catalog.tokenPacks[pack] = p
      ? { currency: p.currency, amountMinor: p.unit_amount }
      : { currency: 'usd', amountMinor: null };
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n');
  console.log(c.ok(`\n✔ Wrote scripts/stripe-catalog.json from the ${MODE} account.`));
  console.log(c.dim('  Review it — any null amountMinor must be filled in before --apply.\n'));
}

/* ── Execution ────────────────────────────────────────────────────── */

async function execute(actions, resolved) {
  for (const a of actions) {
    if (a.op !== 'create') continue;

    if (a.type === 'product') {
      const p = await api('POST', '/products', {
        name: a.name, metadata: { [MANAGED_KEY]: a.key },
      });
      resolved[a.key] = p.id;
      console.log(c.ok(`  created product  ${a.key.padEnd(28)} ${p.id}`));
    }

    if (a.type === 'price') {
      const productId = resolved[productKey(a.plan)];
      if (!productId) throw new Error(`cannot create ${a.key}: product for ${a.plan} is unknown`);
      const p = await api('POST', '/prices', {
        product: productId, unit_amount: a.amountMinor, currency: a.currency,
        recurring: { interval: a.interval }, metadata: { [MANAGED_KEY]: a.key },
      });
      resolved[a.key] = p.id;
      console.log(c.ok(`  created price    ${a.key.padEnd(28)} ${p.id}`));
    }

    if (a.type === 'token_price') {
      // One-off by construction: no `recurring` field. A recurring token price
      // would start a subscription instead of granting a top-up.
      const p = await api('POST', '/prices', {
        currency: a.currency, unit_amount: a.amountMinor,
        product_data: { name: `AI credits — ${a.pack} (${a.credits.toLocaleString('en-US')})` },
        metadata: { [MANAGED_KEY]: a.key, credits: String(a.credits) },
      });
      resolved[a.key] = p.id;
      console.log(c.ok(`  created pack     ${a.key.padEnd(28)} ${p.id}`));
    }

    if (a.type === 'coupon') {
      const body = {
        percent_off: a.percentOff, duration: 'once', name: a.code,
        metadata: { [MANAGED_KEY]: a.key },
      };
      if (a.appliesTo !== 'all') {
        const productId = resolved[productKey(a.appliesTo)];
        if (!productId) throw new Error(`coupon ${a.code}: product for ${a.appliesTo} is unknown`);
        body.applies_to = { products: [productId] };
      }
      const coupon = await api('POST', '/coupons', body);
      resolved[a.key] = coupon.id;
      console.log(c.ok(`  created coupon   ${a.key.padEnd(28)} ${coupon.id}`));
    }

    if (a.type === 'promotion_code') {
      const couponId = resolved[couponKey(a.code)];
      if (!couponId) throw new Error(`promotion code ${a.code}: coupon is unknown`);
      const pc = await api('POST', '/promotion_codes', {
        coupon: couponId, code: a.code, metadata: { [MANAGED_KEY]: a.key },
      });
      console.log(c.ok(`  created promo    ${a.code.padEnd(28)} ${pc.id}`));
    }
  }
}

/* ── Main ─────────────────────────────────────────────────────────── */

async function main() {
  console.log(c.b('\nStripe catalog setup — AiLunaPro\n'));

  if (MODE === 'unset') die('STRIPE_SECRET_KEY is not set in this shell.');
  if (MODE === 'unknown') die('STRIPE_SECRET_KEY does not look like a Stripe secret key.');
  console.log(`  account mode : ${MODE === 'live' ? c.err('LIVE — real money') : c.ok('test')}`);
  console.log(`  action       : ${DRY_RUN ? c.ok('DRY RUN (nothing will be written)') : c.warn('APPLY — will create objects')}`);
  console.log('');

  if (MODE_FLAGS.apply && MODE === 'live' && !MODE_FLAGS.allowLive) {
    die('Refusing to write to a LIVE account without --allow-live.\n  Rehearse in test mode first, then re-run with:\n    node scripts/stripe-setup.mjs --apply --allow-live');
  }

  if (MODE_FLAGS.export) return doExport();

  const catalog = loadCatalog();
  const errors = validateCatalog(catalog);
  if (errors.length) {
    console.error(c.err('Catalog is not valid:'));
    for (const e of errors) console.error('  - ' + e);
    process.exitCode = 1;
    return;
  }

  const actual = await readAccount();
  const actions = planCatalog(catalog, actual);

  // Pre-seed ids for everything that already exists, so a partial re-run can
  // create only what is missing and still resolve references.
  const resolved = {};
  for (const a of actions) if (a.op === 'reuse' && a.id) resolved[a.key] = a.id;

  console.log(c.b('Plan:'));
  for (const a of actions) {
    const tag = a.op === 'create' ? c.warn('CREATE ') : a.op === 'reuse' ? c.dim('reuse  ') : c.err('CONFLICT');
    const detail = a.op === 'conflict' ? `  ${c.err(a.reason)}` : a.id ? c.dim(`  ${a.id}`) : '';
    console.log(`  ${tag} ${a.type.padEnd(15)} ${a.key.padEnd(30)}${detail}`);
  }
  const s = summarise(actions);
  console.log(`\n  ${s.create} to create · ${s.reuse} already correct · ${s.conflict} conflict\n`);

  if (hasConflicts(actions)) {
    die('Conflicts must be resolved by a human before anything is written.\n  Stripe prices are immutable — review each conflict above.');
  }

  if (DRY_RUN) {
    console.log(c.dim('Dry run — nothing was written. Re-run with --apply to create the objects above.\n'));
    if (MODE_FLAGS.verify) printPhaseC(resolved);
    return;
  }

  console.log(c.b('Creating:'));
  await execute(actions, resolved);
  console.log('');
  printPhaseC(resolved);
}

function printPhaseC(resolved) {
  const missing = missingPhaseCIds(resolved);
  console.log(c.b('Phase C values:\n'));
  console.log(renderPhaseCBlock(resolved));
  console.log('');
  if (missing.length) {
    console.log(c.warn(`  ${missing.length} id(s) still missing — run with --apply to create them.\n`));
  } else {
    console.log(c.ok('  All Phase C object ids are present.\n'));
  }
}

main().catch(err => {
  // die() already reported and set the exit code; nothing more to say.
  if (err instanceof ExitError) return;
  // Never print the error object wholesale: a thrown fetch error can carry
  // request headers, and those carry the key.
  console.error(c.err(`\n✖ ${redact(err instanceof Error ? err.message : 'unexpected failure')}\n`));
  process.exitCode = 1;
});
