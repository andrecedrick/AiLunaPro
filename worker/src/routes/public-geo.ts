/**
 * GET /api/public/geo — J12 (smart locale / currency detection).
 *
 * No auth. Returns a best-effort country + suggested DISPLAY currency derived
 * from Cloudflare geo (CF-IPCountry / request.cf.country). Display/detection
 * only — NOT billing currency (Stripe stays source of truth).
 *
 * Privacy: returns the 2-letter country code only. NO IP is read, returned, or
 * stored. No PII. Fail-safe: unknown/missing country → suggestedCurrency 'usd'.
 */

import { Hono } from 'hono';
import { detectCurrencyFromRequest } from '../lib/geo-currency';
import { SUPPORTED_CURRENCIES } from '../lib/currency';
import type { AppEnv } from '../index';

const publicGeo = new Hono<AppEnv>();

publicGeo.get('/api/public/geo', c => {
  // All supported currencies enabled for a pure display suggestion; USD default.
  const { currency, region } = detectCurrencyFromRequest(c, SUPPORTED_CURRENCIES, 'usd');
  // No-cache: geo varies per request origin; never let a browser/CDN reuse a
  // response across countries. Vary on CF-IPCountry for any intermediate cache.
  c.header('Cache-Control', 'no-store, max-age=0, must-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
  c.header('Vary', 'CF-IPCountry');
  return c.json({
    country: region,                 // 2-letter code or null; never an IP
    suggestedCurrency: currency,     // display-only suggestion
  });
});

export default publicGeo;
