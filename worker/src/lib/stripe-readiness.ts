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
    | 'INACTIVE';
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

export interface ReadinessReport {
  mode:     StripeMode;
  /** True only when nothing would break. Deliberately strict. */
  ready:    boolean;
  findings: ReadinessFinding[];
  checked:  { staticChecks: boolean; pricesVerified: boolean; portalVerified: boolean; webhookObserved: boolean };
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
    ready: findings.length === 0 && mode === 'live' && checked.pricesVerified && checked.webhookObserved,
    findings: [...findings],
    checked,
    webhookNote: WEBHOOK_NOTE,
  };
}
