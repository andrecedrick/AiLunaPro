/**
 * Server-side currency detection — Phase J1.3C.
 *
 * Resolution order:
 *   1. request.cf.country (Cloudflare geo)
 *   2. Accept-Language header
 *   3. billing_config.currencySettings.defaultCurrency
 *   4. 'usd'
 *
 * Customers do NOT pick currency manually. Admin override path (e.g.
 * test/internal) may pass body.currency explicitly.
 */

import type { Context } from 'hono';
import type { Currency } from './currency';
import { isSupportedCurrency } from './currency';

/* ── Region → currency map ─────────────────────────────
 * Mirrors src/lib/billing/currencyDetect.ts (frontend) for parity.
 */
const REGION_TO_CURRENCY: Record<string, Currency> = {
  US: 'usd',
  GB: 'gbp', UK: 'gbp',
  CA: 'cad',
  AU: 'aud',
  // Eurozone
  FR: 'eur', DE: 'eur', ES: 'eur', IT: 'eur', NL: 'eur',
  BE: 'eur', IE: 'eur', PT: 'eur', AT: 'eur', FI: 'eur',
  GR: 'eur', LU: 'eur', SK: 'eur', SI: 'eur', EE: 'eur',
  LV: 'eur', LT: 'eur', CY: 'eur', MT: 'eur', HR: 'eur',
};

interface CfRequestProps {
  cf?: { country?: string };
}

function regionFromCf(c: Context): string | null {
  const raw = (c.req.raw as Request & CfRequestProps).cf;
  return raw?.country ?? null;
}

function regionFromAcceptLanguage(c: Context): string | null {
  const al = c.req.header('accept-language') ?? '';
  // Take first locale, e.g. "fr-FR,fr;q=0.9" → "fr-FR" → "FR"
  const first = al.split(',')[0]?.trim();
  if (!first) return null;
  const parts = first.replace(/_/g, '-').split('-');
  for (const p of parts.slice(1)) {
    if (/^[A-Za-z]{2}$/.test(p)) return p.toUpperCase();
  }
  return null;
}

/**
 * Detect currency from request context.
 * Returns { currency, source } — source for logging/diagnostic.
 */
export function detectCurrencyFromRequest(
  c: Context,
  enabledCurrencies: readonly Currency[],
  defaultCurrency: Currency,
): { currency: Currency; source: 'cf' | 'accept-language' | 'default'; region: string | null } {
  const cfRegion = regionFromCf(c);
  if (cfRegion) {
    const cur = REGION_TO_CURRENCY[cfRegion];
    if (cur && enabledCurrencies.includes(cur)) {
      return { currency: cur, source: 'cf', region: cfRegion };
    }
  }
  const alRegion = regionFromAcceptLanguage(c);
  if (alRegion) {
    const cur = REGION_TO_CURRENCY[alRegion];
    if (cur && enabledCurrencies.includes(cur)) {
      return { currency: cur, source: 'accept-language', region: alRegion };
    }
  }
  return {
    currency: enabledCurrencies.includes(defaultCurrency) ? defaultCurrency : 'usd',
    source:   'default',
    region:   cfRegion ?? alRegion,
  };
}

export { isSupportedCurrency };
