/**
 * Admin currency routes — Phase J1.3 (owner-only).
 *
 *   GET  /api/billing/admin/exchange-rates?orgId=...
 *   POST /api/billing/admin/currency-settings
 *
 * Live FX is for admin DISPLAY only — never used for billing.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { fetchExchangeRates, isSupportedCurrency, SUPPORTED_CURRENCIES } from '../lib/currency';
import { stripSecrets } from '../lib/billing-admin-shared';
import type { AppEnv } from '../index';
import type { Currency } from '../lib/currency';

const currency = new Hono<AppEnv>();

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// ── GET /api/billing/admin/exchange-rates ─────────────

currency.get('/api/billing/admin/exchange-rates', requireAuth(), requireOwner(), async c => {
  const env   = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId = c.get('orgId') as string;

  const config = await firestoreGet(
    env.FIREBASE_SERVICE_ACCOUNT_JSON!,
    `organizations/${orgId}/billing_config/current`,
  );

  type FsCurrencySettings = {
    exchangeRateProvider?:    'manual' | 'live';
    exchangeRates?:           Partial<Record<Currency, number>>;
    lastExchangeRateSyncAt?:  string;
  };
  const cfg = (config?.currencySettings as FsCurrencySettings | undefined) ?? {};

  const provider = cfg.exchangeRateProvider ?? 'live';
  const stored   = cfg.exchangeRates;
  const syncedAt = cfg.lastExchangeRateSyncAt ?? null;

  // If live + stale (>6h) or missing, fetch fresh rates
  let rates    = stored;
  let synced   = syncedAt;
  let fallback = false;

  if (provider === 'live') {
    const isStale = !syncedAt || (Date.now() - new Date(syncedAt).getTime() > SIX_HOURS_MS);
    if (isStale || !stored) {
      const fresh = await fetchExchangeRates();
      if (fresh) {
        rates  = fresh.rates;
        synced = fresh.syncedAt;
        try {
          const existingCfg = (config?.currencySettings as Record<string, unknown> | undefined) ?? {};
          const merged = {
            defaultCurrency:        (existingCfg.defaultCurrency as string | undefined) ?? 'usd',
            enabledCurrencies:      (existingCfg.enabledCurrencies as string[] | undefined) ?? ['usd'],
            exchangeRateProvider:   provider,
            exchangeRates:          fresh.rates,
            lastExchangeRateSyncAt: fresh.syncedAt,
          };
          await firestoreSet(
            env.FIREBASE_SERVICE_ACCOUNT_JSON!,
            `organizations/${orgId}/billing_config/current`,
            { currencySettings: merged },
            { merge: true },
          );
        } catch (err) {
          console.warn('[admin-currency] FX persist failed (non-fatal):', err);
        }
      } else {
        fallback = true;
      }
    }
  }

  // Coerce all rate values to numbers (Firestore round-trips floats as strings)
  const numericRates: Partial<Record<Currency, number>> = {};
  if (rates) {
    for (const [k, v] of Object.entries(rates)) {
      const n = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(n)) numericRates[k as Currency] = n;
    }
  }

  return c.json({
    rates:    numericRates,
    syncedAt: synced,
    provider,
    fallback,
  });
});

// ── POST /api/billing/admin/currency-settings ─────────

interface CurrencySettingsBody {
  orgId:                  string;
  currencySettings: {
    defaultCurrency:        Currency;
    enabledCurrencies:      Currency[];
    exchangeRateProvider:   'manual' | 'live';
    exchangeRates?:         Partial<Record<Currency, number>>;
  };
}

currency.post('/api/billing/admin/currency-settings', requireAuth(), requireOwner(), async c => {
  const env   = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid')   as string;

  let body: CurrencySettingsBody;
  try {
    body = stripSecrets(await c.req.json<CurrencySettingsBody>());
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  const cs = body.currencySettings;
  if (!cs) return c.json({ error: 'Missing currencySettings' }, 400);

  // Validate currencies
  for (const cur of cs.enabledCurrencies ?? []) {
    if (!isSupportedCurrency(cur)) {
      return c.json({ error: `Unsupported currency: ${cur}` }, 400);
    }
  }
  if (!isSupportedCurrency(cs.defaultCurrency)) {
    return c.json({ error: `Unsupported default currency: ${cs.defaultCurrency}` }, 400);
  }
  if (!cs.enabledCurrencies?.includes(cs.defaultCurrency)) {
    return c.json({ error: 'Default currency must be enabled' }, 400);
  }
  if (cs.exchangeRateProvider !== 'manual' && cs.exchangeRateProvider !== 'live') {
    return c.json({ error: 'Invalid exchangeRateProvider' }, 400);
  }

  const sanitizedSettings = {
    defaultCurrency:      cs.defaultCurrency,
    enabledCurrencies:    cs.enabledCurrencies.filter(c => SUPPORTED_CURRENCIES.includes(c)),
    exchangeRateProvider: cs.exchangeRateProvider,
    exchangeRates:        cs.exchangeRates ?? null,
  };

  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      `organizations/${orgId}/billing_config/current`,
      {
        currencySettings: sanitizedSettings,
        updatedAt: new Date().toISOString(),
        updatedBy: uid,
      },
      { merge: true },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Firestore write failed';
    return c.json({ error: msg }, 500);
  }

  return c.json({ ok: true, currencySettings: sanitizedSettings });
});

export default currency;
