/**
 * Stripe catalog planning — PURE logic for the live-setup script (§27 P1.2 B).
 *
 * No network, no credentials, no I/O. Everything here is a function from
 * (desired catalog, what Stripe already has) to a PLAN of actions. That split is
 * what makes a dry run trustworthy: the same planner produces the preview and
 * the execution, so what you review is exactly what runs.
 *
 * IDEMPOTENCY IS BY METADATA, NOT BY NAME. Every object this script creates
 * carries `metadata.ailuna_key` — a stable slug like `plan:starter:usd:month`.
 * Re-running matches on that key and reuses what exists. Matching on display
 * name would be fragile (names are editable and duplicable); matching on amount
 * alone would silently adopt an unrelated object that happened to cost the same.
 *
 * PRICES ARE IMMUTABLE IN STRIPE. A price whose amount must change cannot be
 * updated — a new one must be created and the old archived. So when the desired
 * amount differs from an existing keyed price, this planner reports a CONFLICT
 * rather than quietly creating a second active price for the same slot, which is
 * how an account ends up billing two customers two different amounts for the
 * same plan.
 */

/** Metadata field that marks an object as managed by this script. */
export const MANAGED_KEY = 'ailuna_key';

export const PLANS = ['starter', 'professional', 'enterprise'];
export const PLAN_LABELS = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };

/** Token packs and the credits each grants. Mirrors worker/src/lib/token-costs.ts. */
export const TOKEN_PACKS = [
  { pack: 'overage', credits: 300 },
  { pack: 'starter', credits: 5_000 },
  { pack: 'pro', credits: 25_000 },
  { pack: 'max', credits: 100_000 },
];

/** Env var each created object must be recorded into, for Phase C. */
export const ENV_VAR = {
  'plan:starter': 'STRIPE_PRODUCT_STARTER',
  'plan:professional': 'STRIPE_PRODUCT_PROFESSIONAL',
  'plan:enterprise': 'STRIPE_PRODUCT_ENTERPRISE',
  'tokenpack:overage': 'STRIPE_TOKEN_PRICE_OVERAGE',
  'tokenpack:starter': 'STRIPE_TOKEN_PRICE_STARTER',
  'tokenpack:pro': 'STRIPE_TOKEN_PRICE_PRO',
  'tokenpack:max': 'STRIPE_TOKEN_PRICE_MAX',
};

/* ── Stable keys ──────────────────────────────────────────────────── */

export const productKey = (plan) => `plan:${plan}`;
export const priceKey = (plan, currency, interval) => `plan:${plan}:${currency}:${interval}`;
export const tokenPriceKey = (pack) => `tokenpack:${pack}`;
export const couponKey = (code) => `coupon:${code}`;

/**
 * Mode from the key PREFIX only.
 *
 * Never reads, stores or returns any part of the value beyond the prefix, so no
 * caller can accidentally log a secret by logging a mode.
 */
export function detectMode(secretKey) {
  const k = (secretKey ?? '').trim();
  if (!k) return 'unset';
  if (k.startsWith('sk_live_')) return 'live';
  if (k.startsWith('sk_test_')) return 'test';
  if (k.startsWith('rk_live_')) return 'live';
  if (k.startsWith('rk_test_')) return 'test';
  return 'unknown';
}

/* ── Catalog validation ───────────────────────────────────────────── */

const isPosInt = (n) => Number.isInteger(n) && n > 0;

/**
 * Validate a catalog before anything touches Stripe.
 *
 * Deliberately strict about amounts: an accidental `0`, a float, or a value in
 * major units instead of minor would create a real price object that cannot be
 * edited afterwards.
 */
export function validateCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return ['catalog is not an object'];

  const plans = catalog.plans ?? {};
  for (const plan of PLANS) {
    const entry = plans[plan];
    if (!entry) { errors.push(`plans.${plan}: missing`); continue; }
    const prices = entry.prices ?? [];
    if (!Array.isArray(prices) || prices.length === 0) {
      errors.push(`plans.${plan}.prices: at least one price is required`);
      continue;
    }
    if (!prices.some(p => p.currency === 'usd')) {
      // usd is checkout's final fallback; without it a customer in an unpriced
      // currency has nothing left to fall back to.
      errors.push(`plans.${plan}.prices: a usd price is required (checkout's final fallback)`);
    }
    for (const p of prices) {
      if (!p.currency || typeof p.currency !== 'string') errors.push(`plans.${plan}: price missing currency`);
      if (!isPosInt(p.amountMinor)) errors.push(`plans.${plan}/${p.currency}: amountMinor must be a positive integer (minor units)`);
      if (p.interval !== 'month' && p.interval !== 'year') errors.push(`plans.${plan}/${p.currency}: interval must be month or year`);
    }
  }

  const packs = catalog.tokenPacks ?? {};
  for (const { pack } of TOKEN_PACKS) {
    const entry = packs[pack];
    if (!entry) { errors.push(`tokenPacks.${pack}: missing`); continue; }
    if (!entry.currency) errors.push(`tokenPacks.${pack}: missing currency`);
    if (!isPosInt(entry.amountMinor)) errors.push(`tokenPacks.${pack}: amountMinor must be a positive integer`);
  }

  for (const promo of catalog.promotions ?? []) {
    if (!promo.code || !/^[A-Z0-9_-]{3,40}$/.test(promo.code)) errors.push(`promotions: invalid code "${promo.code}"`);
    const pct = promo.percentOff;
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) errors.push(`promotions.${promo.code}: percentOff must be 1-100`);
    if (promo.appliesTo && promo.appliesTo !== 'all' && !PLANS.includes(promo.appliesTo)) {
      errors.push(`promotions.${promo.code}: appliesTo must be "all" or a plan`);
    }
  }

  return errors;
}

/* ── Planning ─────────────────────────────────────────────────────── */

const keyOf = (obj) => obj?.metadata?.[MANAGED_KEY] ?? '';
const indexByKey = (list) => {
  const m = new Map();
  for (const o of list ?? []) { const k = keyOf(o); if (k) m.set(k, o); }
  return m;
};

/**
 * Build the full action plan.
 *
 * Every action is one of:
 *   create   — nothing with this key exists
 *   reuse    — an identical object already exists (idempotent re-run)
 *   conflict — the key exists but is materially different; needs a human
 *
 * `conflict` never auto-resolves. Silently creating a second active price for a
 * slot that already has one is how an account starts charging two customers two
 * different amounts for the same plan.
 */
export function planCatalog(catalog, actual) {
  const actions = [];
  const products = indexByKey(actual.products);
  const prices = indexByKey(actual.prices);
  const coupons = indexByKey(actual.coupons);
  const promoCodes = new Map((actual.promotionCodes ?? []).map(p => [p.code, p]));

  /* Products */
  for (const plan of PLANS) {
    const key = productKey(plan);
    const found = products.get(key);
    if (!found) {
      actions.push({ type: 'product', op: 'create', key, name: PLAN_LABELS[plan], plan });
    } else if (found.active === false) {
      actions.push({ type: 'product', op: 'conflict', key, id: found.id, reason: 'product exists but is archived' });
    } else {
      actions.push({ type: 'product', op: 'reuse', key, id: found.id, name: found.name });
    }
  }

  /* Subscription prices — one per plan per currency */
  for (const plan of PLANS) {
    const entry = catalog.plans?.[plan];
    for (const p of entry?.prices ?? []) {
      const key = priceKey(plan, p.currency, p.interval);
      const found = prices.get(key);
      if (!found) {
        actions.push({ type: 'price', op: 'create', key, plan, currency: p.currency, interval: p.interval, amountMinor: p.amountMinor });
      } else if (found.unit_amount !== p.amountMinor || found.currency !== p.currency) {
        actions.push({
          type: 'price', op: 'conflict', key, id: found.id,
          reason: `price exists at ${found.unit_amount} ${found.currency}, catalog wants ${p.amountMinor} ${p.currency}. Stripe prices are immutable — archive the old one and change the key, or align the catalog.`,
        });
      } else if (found.active === false) {
        actions.push({ type: 'price', op: 'conflict', key, id: found.id, reason: 'price exists but is archived' });
      } else {
        actions.push({ type: 'price', op: 'reuse', key, id: found.id });
      }
    }
  }

  /* Token packs — ONE-OFF prices. A recurring price here would create a
     subscription instead of a top-up. */
  for (const { pack, credits } of TOKEN_PACKS) {
    const entry = catalog.tokenPacks?.[pack];
    if (!entry) continue;
    const key = tokenPriceKey(pack);
    const found = prices.get(key);
    if (!found) {
      actions.push({ type: 'token_price', op: 'create', key, pack, credits, currency: entry.currency, amountMinor: entry.amountMinor });
    } else if (found.recurring) {
      actions.push({ type: 'token_price', op: 'conflict', key, id: found.id, reason: 'existing price is RECURRING; token packs must be one-off' });
    } else if (found.unit_amount !== entry.amountMinor || found.currency !== entry.currency) {
      actions.push({ type: 'token_price', op: 'conflict', key, id: found.id, reason: `price exists at ${found.unit_amount} ${found.currency}, catalog wants ${entry.amountMinor} ${entry.currency}` });
    } else {
      actions.push({ type: 'token_price', op: 'reuse', key, id: found.id });
    }
  }

  /* Coupons + promotion codes */
  for (const promo of catalog.promotions ?? []) {
    const key = couponKey(promo.code);
    const foundCoupon = coupons.get(key);
    if (!foundCoupon) {
      actions.push({ type: 'coupon', op: 'create', key, code: promo.code, percentOff: promo.percentOff, appliesTo: promo.appliesTo ?? 'all' });
    } else {
      actions.push({ type: 'coupon', op: 'reuse', key, id: foundCoupon.id });
    }
    if (!promoCodes.has(promo.code)) {
      actions.push({ type: 'promotion_code', op: 'create', key, code: promo.code });
    } else {
      actions.push({ type: 'promotion_code', op: 'reuse', key, code: promo.code, id: promoCodes.get(promo.code).id });
    }
  }

  return actions;
}

/** Does this plan require a human before anything is written? */
export const hasConflicts = (actions) => actions.some(a => a.op === 'conflict');

export function summarise(actions) {
  const s = { create: 0, reuse: 0, conflict: 0 };
  for (const a of actions) s[a.op] = (s[a.op] ?? 0) + 1;
  return s;
}

/* ── Output ───────────────────────────────────────────────────────── */

/**
 * The Phase C transcription block.
 *
 * Emits `wrangler secret put` COMMANDS, not values: the ids are printed for the
 * operator to paste interactively. Nothing secret is ever produced here — a
 * product id and a price id are not credentials — but keys and signing secrets
 * are deliberately NOT part of this output, because those must never transit a
 * script's stdout.
 */
export function renderPhaseCBlock(resolved) {
  const lines = ['# Phase C — run each, paste the id shown when prompted:'];
  for (const [key, envVar] of Object.entries(ENV_VAR)) {
    const id = resolved[key];
    lines.push(`${envVar.padEnd(30)} ${id ?? '(MISSING — object was not created)'}`);
  }
  lines.push('');
  lines.push('# Not produced by this script — collect from the Stripe dashboard:');
  lines.push('STRIPE_SECRET_KEY              (API keys page)');
  lines.push('STRIPE_PUBLISHABLE_KEY         (API keys page)');
  lines.push('STRIPE_WEBHOOK_SECRET          (LIVE webhook endpoint signing secret)');
  return lines.join('\n');
}

/** Ids that must exist before Phase C can proceed. */
export function missingPhaseCIds(resolved) {
  return Object.keys(ENV_VAR).filter(k => !resolved[k]);
}
