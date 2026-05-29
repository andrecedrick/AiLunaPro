/**
 * GET /api/public/fx — J12 Batch B (live reference FX, display-only).
 *
 * Returns approximate USD→{eur,gbp,cad,aud} rates derived from the European
 * Central Bank daily reference feed (free, no API key). Display-only — Stripe
 * bills in USD. No auth, no PII, no IP read/stored.
 *
 * Caching: 6h in the worker isolate (module-level) to avoid hammering ECB;
 * Cache-Control max-age=21600 so the browser/CDN can reuse too. On feed
 * failure → returns the bundled static fallback with source:'fallback'.
 */

import { Hono } from 'hono';
import type { AppEnv } from '../index';

const fx = new Hono<AppEnv>();

type Rates = { eur: number; gbp: number; cad: number; aud: number };

// Display-only static fallback (approximate). Used if ECB is unreachable.
const STATIC_USD_TO: Rates = { eur: 0.92, gbp: 0.79, cad: 1.37, aud: 1.52 };

const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
const TTL_MS = 6 * 60 * 60 * 1000; // 6h

interface CacheEntry { rates: Rates; source: 'ecb' | 'fallback'; at: number }
let cache: CacheEntry | null = null;

/** Parse `currency='X' rate='Y'` pairs from the ECB daily XML. */
function parseEcb(xml: string): Record<string, number> {
  const out: Record<string, number> = {};
  const re = /currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    out[m[1]] = parseFloat(m[2]);
  }
  return out;
}

/** ECB is EUR-based. Convert to USD-based: usd→X = (eur→X) / (eur→USD). */
function computeUsdRates(eurBased: Record<string, number>): Rates | null {
  const eurUsd = eurBased.USD;
  if (!eurUsd || eurUsd <= 0) return null;
  const usdEur = 1 / eurUsd;
  const r = (code: string): number | null => {
    if (code === 'EUR') return usdEur;
    const eurX = eurBased[code];
    return eurX ? eurX / eurUsd : null;
  };
  const eur = r('EUR'), gbp = r('GBP'), cad = r('CAD'), aud = r('AUD');
  if (eur == null || gbp == null || cad == null || aud == null) return null;
  return { eur, gbp, cad, aud };
}

async function getRates(): Promise<CacheEntry> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache;
  try {
    const res = await fetch(ECB_URL, { cf: { cacheTtl: 21600, cacheEverything: true } } as RequestInit);
    if (!res.ok) throw new Error(`ECB HTTP ${res.status}`);
    const xml = await res.text();
    const usd = computeUsdRates(parseEcb(xml));
    if (!usd) throw new Error('ECB parse/USD missing');
    cache = { rates: usd, source: 'ecb', at: now };
    return cache;
  } catch (err) {
    console.warn('[fx] ECB fetch failed, using static fallback:', (err as Error)?.message ?? err);
    cache = { rates: STATIC_USD_TO, source: 'fallback', at: now };
    return cache;
  }
}

fx.get('/api/public/fx', async c => {
  const { rates, source, at } = await getRates();
  c.header('Cache-Control', 'public, max-age=21600'); // 6h
  return c.json({
    base: 'usd',
    rates,           // usd → eur/gbp/cad/aud (approximate, display-only)
    source,          // 'ecb' | 'fallback'
    asOf: new Date(at).toISOString(),
  });
});

export default fx;
