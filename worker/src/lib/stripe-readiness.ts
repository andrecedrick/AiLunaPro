/**
 * Stripe live-activation readiness (§27 P1.2).
 *
 * PURE. Classifies the configured Stripe environment and reports what would
 * break, without calling Stripe and without ever reading a secret's value beyond
 * its prefix.
 *
 * WHY THIS EXISTS. Flipping to live is not one change, it is six: secret key,
 * publishable key, webhook signing secret, plan price ids, token price ids, and
 * the portal configuration. Miss one and the failure is silent in the worst way:
 *
 *   - test price id + live key   -> "No such price" at checkout. Nobody can buy.
 *   - test webhook secret        -> every signature check fails, so payments are
 *                                   taken and NO invoice is ever marked paid.
 *   - pk_test_ on the frontend   -> the customer's card is charged in test mode
 *                                   while the backend expects real money.
 *
 * Each of those is discovered by a paying customer rather than by us, which is
 * why readiness is computed and surfaced BEFORE the switch rather than inferred
 * from `stripeMode` alone.
 *
 * NO SECRET VALUE IS EVER RETURNED. Only mode classifications and the names of
 * the variables that are wrong.
 */

export type StripeMode = 'live' | 'test' | 'unset' | 'unknown';

/** Every Stripe-mode-sensitive variable, with how its mode is recognised. */
export const STRIPE_MODE_VARS = [
  { name: 'STRIPE_SECRET_KEY',          live: 'sk_live_',   test: 'sk_test_',   required: true },
  { name: 'STRIPE_PUBLISHABLE_KEY',     live: 'pk_live_',   test: 'pk_test_',   required: true },
  { name: 'STRIPE_WEBHOOK_SECRET',      live: 'whsec_',     test: 'whsec_',     required: true },
  { name: 'STRIPE_PRICE_STARTER',       live: 'price_',     test: 'price_',     required: true },
  { name: 'STRIPE_PRICE_PROFESSIONAL',  live: 'price_',     test: 'price_',     required: true },
  { name: 'STRIPE_PRICE_ENTERPRISE',    live: 'price_',     test: 'price_',     required: true },
  { name: 'STRIPE_TOKEN_PRICE_STARTER', live: 'price_',     test: 'price_',     required: false },
  { name: 'STRIPE_TOKEN_PRICE_PRO',     live: 'price_',     test: 'price_',     required: false },
  { name: 'STRIPE_TOKEN_PRICE_MAX',     live: 'price_',     test: 'price_',     required: false },
  { name: 'STRIPE_TOKEN_PRICE_OVERAGE', live: 'price_',     test: 'price_',     required: false },
] as const;

/** Variables whose mode is readable from the value's prefix. */
const PREFIX_MODE_VARS = new Set(['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY']);

/** Price ids look identical in both modes; only Stripe can say which is which. */
export const PRICE_VARS = STRIPE_MODE_VARS.filter(v => v.live === 'price_').map(v => v.name);

export function classifyKeyMode(value: string | undefined, livePrefix: string, testPrefix: string): StripeMode {
  const v = (value ?? '').trim();
  if (!v) return 'unset';
  if (v.startsWith(livePrefix)) return 'live';
  if (v.startsWith(testPrefix)) return 'test';
  return 'unknown';
}

export interface ReadinessFinding {
  /** Variable name only — never a value. */
  variable: string;
  code:
    | 'MISSING'
    | 'MODE_MISMATCH'
    | 'MALFORMED'
    | 'NOT_FOUND_IN_STRIPE'
    | 'WRONG_LIVEMODE'
    | 'INACTIVE'
    /** Two plans share one Stripe product — see checkProductUniqueness. */
    | 'DUPLICATE_PRODUCT';
  detail: string;
}

export interface StaticReadiness {
  /** Mode of the secret key — the environment everything else must match. */
  mode: StripeMode;
  findings: ReadinessFinding[];
  /** Price ids present, to be verified against Stripe by the caller. */
  priceIds: Array<{ variable: string; id: string }>;
}

type EnvLike = Record<string, string | undefined>;

/**
 * Static checks — prefixes, presence, and cross-variable mode agreement.
 *
 * The secret key defines the target mode; everything else is judged against it.
 * A publishable key in the other mode is reported as a mismatch rather than a
 * preference, because it means the browser and the server disagree about whether
 * money is real.
 */
export function checkStaticReadiness(env: EnvLike): StaticReadiness {
  const findings: ReadinessFinding[] = [];
  const mode = classifyKeyMode(env.STRIPE_SECRET_KEY, 'sk_live_', 'sk_test_');

  if (mode === 'unset') {
    findings.push({ variable: 'STRIPE_SECRET_KEY', code: 'MISSING', detail: 'No Stripe secret key is configured.' });
  } else if (mode === 'unknown') {
    findings.push({ variable: 'STRIPE_SECRET_KEY', code: 'MALFORMED', detail: 'Value is neither sk_live_ nor sk_test_.' });
  }

  const priceIds: Array<{ variable: string; id: string }> = [];

  for (const v of STRIPE_MODE_VARS) {
    if (v.name === 'STRIPE_SECRET_KEY') continue;
    const raw = (env[v.name] ?? '').trim();

    if (!raw) {
      if (v.required) findings.push({ variable: v.name, code: 'MISSING', detail: 'Required for checkout to work.' });
      continue;
    }

    if (PREFIX_MODE_VARS.has(v.name)) {
      const varMode = classifyKeyMode(raw, v.live, v.test);
      if (varMode === 'unknown') {
        findings.push({ variable: v.name, code: 'MALFORMED', detail: `Expected ${v.live} or ${v.test}.` });
      } else if (mode !== 'unset' && mode !== 'unknown' && varMode !== mode) {
        findings.push({
          variable: v.name, code: 'MODE_MISMATCH',
          detail: `Secret key is ${mode} but this is ${varMode}. The browser and the server would disagree about whether the charge is real.`,
        });
      }
      continue;
    }

    if (v.name === 'STRIPE_WEBHOOK_SECRET') {
      // Both modes use whsec_, so a stale TEST secret is indistinguishable here.
      // It is verified for real by an actual signed event, not by its shape.
      if (!raw.startsWith('whsec_')) {
        findings.push({ variable: v.name, code: 'MALFORMED', detail: 'Expected a whsec_ signing secret.' });
      }
      continue;
    }

    if (!raw.startsWith('price_')) {
      findings.push({ variable: v.name, code: 'MALFORMED', detail: 'Expected a price_ id.' });
      continue;
    }
    priceIds.push({ variable: v.name, id: raw });
  }

  return { mode, findings, priceIds };
}

export interface PriceProbe {
  variable: string;
  id:       string;
  found:    boolean;
  livemode: boolean | null;
  active:   boolean | null;
  currency: string;
}

/**
 * Turn price probes into findings.
 *
 * A price id carries no visible mode, so this is the ONLY way to catch the most
 * common live-activation mistake: keeping test price ids after switching the
 * key. Stripe answers "no such price", and without this check the first symptom
 * is a customer who cannot check out.
 */
export function checkPriceProbes(mode: StripeMode, probes: readonly PriceProbe[]): ReadinessFinding[] {
  const findings: ReadinessFinding[] = [];
  for (const p of probes) {
    if (!p.found) {
      findings.push({
        variable: p.variable, code: 'NOT_FOUND_IN_STRIPE',
        detail: `Stripe does not recognise this price in ${mode} mode. Checkout would fail for every customer.`,
      });
      continue;
    }
    if (mode === 'live' && p.livemode === false) {
      findings.push({
        variable: p.variable, code: 'WRONG_LIVEMODE',
        detail: 'This is a TEST price but the account is running live.',
      });
    }
    if (mode === 'test' && p.livemode === true) {
      findings.push({
        variable: p.variable, code: 'WRONG_LIVEMODE',
        detail: 'This is a LIVE price but the account is running in test mode.',
      });
    }
    if (p.active === false) {
      findings.push({ variable: p.variable, code: 'INACTIVE', detail: 'This price is archived in Stripe.' });
    }
  }
  return findings;
}

/** What Stripe reports about one plan product and its prices. */
export interface ProductProbe {
  plan:      string;
  /** The env variable that supplies it, for a fixable finding. */
  variable:  string;
  productId: string;
  found:     boolean;
  livemode:  boolean | null;
  active:    boolean | null;
  /** Currencies with an active recurring price, exactly as checkout resolves them. */
  currencies: string[];
}

/**
 * Turn product probes into findings.
 *
 * THIS IS THE CHECK THAT PREVENTS A FALSE PASS. Plan checkout does not use the
 * `STRIPE_PRICE_*` variables at all — it resolves a price from the plan's
 * PRODUCT. Validating only the price variables therefore reports ready while
 * every plan purchase fails with "No active Stripe price found".
 *
 * `requiredCurrencies` mirrors checkout's own fallback chain: it tries the
 * detected currency, then the org default, then `usd`. A plan missing `usd` has
 * no final fallback, so that is treated as fatal rather than cosmetic.
 */
export function checkProductProbes(
  mode: StripeMode,
  probes: readonly ProductProbe[],
  requiredCurrencies: readonly string[],
): ReadinessFinding[] {
  const findings: ReadinessFinding[] = [];

  for (const p of probes) {
    if (!p.found) {
      findings.push({
        variable: p.variable, code: 'NOT_FOUND_IN_STRIPE',
        detail: `Stripe does not recognise product ${p.productId} in ${mode} mode. Checkout for the ${p.plan} plan would fail for every customer.`,
      });
      continue;
    }
    if (mode === 'live' && p.livemode === false) {
      findings.push({
        variable: p.variable, code: 'WRONG_LIVEMODE',
        detail: `The ${p.plan} product is a TEST product but the account is running live.`,
      });
    }
    if (mode === 'test' && p.livemode === true) {
      findings.push({
        variable: p.variable, code: 'WRONG_LIVEMODE',
        detail: `The ${p.plan} product is a LIVE product but the account is running in test mode.`,
      });
    }
    if (p.active === false) {
      findings.push({
        variable: p.variable, code: 'INACTIVE',
        detail: `The ${p.plan} product is archived in Stripe.`,
      });
    }

    const missing = requiredCurrencies.filter(c => !p.currencies.includes(c));
    if (missing.length > 0) {
      findings.push({
        variable: p.variable, code: 'MISSING',
        detail: `The ${p.plan} product has no active recurring price in: ${missing.join(', ')}. `
          + (missing.includes('usd')
            ? 'usd is the final fallback in checkout, so there is nothing left to fall back to.'
            : 'Checkout falls back to another currency, so customers would be billed in the wrong one.'),
      });
    }
  }
  return findings;
}

/**
 * Two plans sharing one product id.
 *
 * P1.2 LIVE INCIDENT, 2026-08-05. Twelve secrets were installed by sequential
 * paste and two landed shifted by one: PROFESSIONAL held Starter's product and
 * ENTERPRISE held Professional's. Every id was individually real, live and
 * active, so `productsVerified` was true and the report read `ready: true` —
 * while a Professional subscriber would have been charged 49.99 instead of
 * 149.99 and labelled Starter by the webhook.
 *
 * Validating each id in isolation cannot catch this. Only the SET can.
 */
export function checkProductUniqueness(probes: readonly ProductProbe[]): ReadinessFinding[] {
  const byId = new Map<string, string[]>();
  for (const p of probes) {
    byId.set(p.productId, [...(byId.get(p.productId) ?? []), p.plan]);
  }
  const findings: ReadinessFinding[] = [];
  for (const [productId, plans] of byId) {
    if (plans.length < 2) continue;
    findings.push({
      variable: 'STRIPE_PRODUCT_*', code: 'DUPLICATE_PRODUCT',
      detail: `Product ${productId} is mapped to more than one plan: ${plans.join(', ')}. `
        + 'Checkout resolves the price from the product, so those plans would charge the same amount '
        + 'and the webhook would label them identically.',
    });
  }
  return findings;
}

/**
 * A plan whose product id came from the committed TEST defaults.
 *
 * `resolvePlanProducts` falls back to `DEFAULT_PLAN_PRODUCTS` when a
 * `STRIPE_PRODUCT_*` variable is unset or malformed. Those defaults are
 * TEST-mode product ids, so in production the fallback silently swaps a real
 * product for one that cannot exist — and readiness then validates the
 * fallback rather than the missing configuration.
 */
export function checkProductFallback(
  mode: StripeMode,
  resolved: Readonly<Record<string, string>>,
  defaults: Readonly<Record<string, string>>,
): ReadinessFinding[] {
  if (mode !== 'live') return [];
  const findings: ReadinessFinding[] = [];
  for (const [plan, productId] of Object.entries(resolved)) {
    const variable = `STRIPE_PRODUCT_${plan.toUpperCase()}`;
    // Empty: resolvePlanProducts refused to fall back because APP_ENV is
    // production. The secret is unset or malformed.
    if (!productId) {
      findings.push({
        variable, code: 'MISSING',
        detail: `The ${plan} plan has no product id. The variable is unset or does not start with prod_, `
          + 'and production does not fall back to the committed test defaults.',
      });
      continue;
    }
    // Explicitly set to a known test default — the fallback did not fire, but
    // the value is still a test product.
    if (productId === defaults[plan]) {
      findings.push({
        variable, code: 'WRONG_LIVEMODE',
        detail: `The ${plan} plan points at the committed TEST default product (${productId}). `
          + 'Checkout would ask a live account for a test product.',
      });
    }
  }
  return findings;
}

/** What Stripe reports about one org-level price override. */
export interface OverrideProbe {
  plan:     string;
  currency: string;
  priceId:  string;
  found:    boolean;
  livemode: boolean | null;
  active:   boolean | null;
}

/**
 * Per-org price overrides — `billing_config/current.activePriceIdsByCurrency`.
 *
 * Checkout returns this value BEFORE consulting Stripe, so an override written
 * during the test era permanently overrides a correct live catalog. It is
 * per-org, and readiness is otherwise global: nothing else in this file would
 * ever look at it.
 */
export function checkOverrideProbes(mode: StripeMode, probes: readonly OverrideProbe[]): ReadinessFinding[] {
  const findings: ReadinessFinding[] = [];
  for (const p of probes) {
    const where = `activePriceIdsByCurrency.${p.plan}.${p.currency}`;
    if (!p.found) {
      findings.push({
        variable: where, code: 'NOT_FOUND_IN_STRIPE',
        detail: `Override ${p.priceId} does not exist in ${mode} mode. Checkout uses this value before `
          + 'consulting Stripe, so the plan is unbuyable for this organization.',
      });
      continue;
    }
    if ((mode === 'live' && p.livemode === false) || (mode === 'test' && p.livemode === true)) {
      findings.push({
        variable: where, code: 'WRONG_LIVEMODE',
        detail: `Override ${p.priceId} belongs to the other mode.`,
      });
    }
    if (p.active === false) {
      findings.push({ variable: where, code: 'INACTIVE', detail: `Override ${p.priceId} is archived in Stripe.` });
    }
  }
  return findings;
}

/** What Stripe reports about the org's stored customer. */
export interface CustomerProbe {
  customerId: string;
  found:      boolean;
  livemode:   boolean | null;
}

/**
 * The org's stored Stripe customer.
 *
 * `stripeCustomerId` survives a mode switch, and a customer created in test is
 * invisible to a live key. The symptom is not a failed payment — it is the
 * billing portal and the invoice list 404-ing for a customer who has already
 * paid, which is exactly the moment they need them.
 */
export function checkCustomerProbe(mode: StripeMode, probe: CustomerProbe | null): ReadinessFinding[] {
  if (!probe) return [];              // no customer yet is a valid state
  if (!probe.found) {
    return [{
      variable: 'subscriptions/current.stripeCustomerId', code: 'NOT_FOUND_IN_STRIPE',
      detail: `Customer ${probe.customerId} does not exist in ${mode} mode. The billing portal and the `
        + 'invoice list would fail for this organization.',
    }];
  }
  if ((mode === 'live' && probe.livemode === false) || (mode === 'test' && probe.livemode === true)) {
    return [{
      variable: 'subscriptions/current.stripeCustomerId', code: 'WRONG_LIVEMODE',
      detail: `Customer ${probe.customerId} belongs to the other mode.`,
    }];
  }
  return [];
}

export interface ReadinessReport {
  mode:     StripeMode;
  /** True only when nothing would break. Deliberately strict. */
  ready:    boolean;
  findings: ReadinessFinding[];
  checked:  {
    staticChecks: boolean;
    pricesVerified: boolean;
    /** Plan products retrieved from Stripe with a resolvable price per currency. */
    productsVerified: boolean;
    portalVerified: boolean;
    webhookObserved: boolean;
  };
  /**
   * The one thing no preflight can prove. Both modes use `whsec_`, so a stale
   * test signing secret looks perfectly valid until a real event arrives and
   * fails its signature — at which point payments succeed and no invoice is ever
   * marked paid. Only an observed, verified live event settles it.
   */
  webhookNote: string;
}

export const WEBHOOK_NOTE =
  'A webhook signing secret cannot be validated by inspection: test and live secrets are '
  + 'both whsec_ and look identical. Confirmed only when a live event has been received AND '
  + 'its signature verified — until then, a stale test secret would let payments succeed '
  + 'while no invoice is ever marked paid.';

export function buildReport(
  mode: StripeMode,
  findings: readonly ReadinessFinding[],
  checked: ReadinessReport['checked'],
): ReadinessReport {
  return {
    mode,
    // Deliberately conjunctive: every gate must hold. `productsVerified` is the
    // one that closes the false pass — without it a configuration whose plan
    // products are absent from the target mode reported ready while no customer
    // could subscribe.
    // Boolean(): a missing gate must read as NOT ready. Without the coercion an
    // absent field makes the whole conjunction `undefined`, and `undefined` is
    // not `true` — but a caller checking `if (report.ready === false)` would
    // miss it. A safety verdict has to be a real boolean.
    ready: Boolean(
      findings.length === 0
      && mode === 'live'
      && checked.pricesVerified
      && checked.productsVerified
      && checked.portalVerified
      && checked.webhookObserved,
    ),
    findings: [...findings],
    checked,
    webhookNote: WEBHOOK_NOTE,
  };
}
