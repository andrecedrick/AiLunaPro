/**
 * Currency Settings panel — Phase J1.3 (owner-only).
 * Default currency, enabled currencies, FX rates display.
 */

import { useEffect, useState } from 'react';
import {
  fetchExchangeRatesAdmin,
  saveCurrencySettings,
} from '../../../lib/billing/adminClient';
import {
  CURRENCY_SYMBOLS,
  SUPPORTED_CURRENCIES,
  type Currency,
  type CurrencySettings,
  type ExchangeRatesResponse,
  DEFAULT_CURRENCY_SETTINGS,
} from '../../../types/billingAdmin';
import { panelCard, panelTitle, panelSubtitle, fieldLabel, button, pill } from './panelStyles';

interface Props {
  orgId:           string;
  currentSettings: CurrencySettings | null;
  onSaved:         (cs: CurrencySettings) => void;
}

export function CurrencyPanel({ orgId, currentSettings, onSaved }: Props) {
  const [settings, setSettings] = useState<CurrencySettings>(
    currentSettings ?? DEFAULT_CURRENCY_SETTINGS,
  );
  const [rates, setRates]       = useState<ExchangeRatesResponse | null>(null);
  const [savingMsg, setSavingMsg] = useState<string | null>(null);
  const [err, setErr]             = useState<string | null>(null);

  useEffect(() => { if (currentSettings) setSettings(currentSettings); }, [currentSettings]);

  useEffect(() => {
    (async () => {
      try {
        const { auth } = await import('../../../lib/firebase-auth');
        const idToken  = await auth.currentUser?.getIdToken();
        if (!idToken) return;
        setRates(await fetchExchangeRatesAdmin(orgId, idToken));
      } catch (e) {
        console.warn('[CurrencyPanel] FX fetch failed:', e);
      }
    })();
  }, [orgId]);

  const toggleCurrency = (cur: Currency) => {
    setSettings(s => {
      const enabled = s.enabledCurrencies.includes(cur)
        ? s.enabledCurrencies.filter(c => c !== cur)
        : [...s.enabledCurrencies, cur];
      const enabledSafe = enabled.length === 0 ? ['usd' as Currency] : enabled;
      const def = enabledSafe.includes(s.defaultCurrency) ? s.defaultCurrency : enabledSafe[0];
      return { ...s, enabledCurrencies: enabledSafe, defaultCurrency: def };
    });
  };

  const save = async () => {
    setSavingMsg(null);
    setErr(null);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      const r = await saveCurrencySettings(orgId, settings, idToken);
      onSaved(r.currencySettings);
      setSavingMsg('Saved');
      setTimeout(() => setSavingMsg(null), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    }
  };

  return (
    <section style={panelCard}>
      <h3 style={panelTitle}>Currency Settings</h3>
      <p style={panelSubtitle}>Choose enabled currencies and default. Billing always uses real Stripe Prices.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        <div>
          <label style={fieldLabel}>Default currency</label>
          <select
            value={settings.defaultCurrency}
            onChange={e => setSettings(s => ({ ...s, defaultCurrency: e.target.value as Currency }))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13 }}
          >
            {settings.enabledCurrencies.map(c => (
              <option key={c} value={c}>{c.toUpperCase()} {CURRENCY_SYMBOLS[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={fieldLabel}>Enabled currencies</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUPPORTED_CURRENCIES.map(c => {
              const on = settings.enabledCurrencies.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCurrency(c)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    border: on ? '2px solid var(--violet)' : '1px solid var(--border)',
                    background: on ? 'rgba(124, 58, 237, 0.08)' : 'var(--surface)',
                    color: on ? 'var(--violet-text)' : 'var(--text-muted)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {c.toUpperCase()} {CURRENCY_SYMBOLS[c]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={fieldLabel}>Exchange rate provider</label>
          <select
            value={settings.exchangeRateProvider}
            onChange={e => setSettings(s => ({ ...s, exchangeRateProvider: e.target.value as 'manual' | 'live' }))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13 }}
          >
            <option value="live">Live (display only)</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 22, padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface-2, transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Live exchange rates today</strong>
          <span style={pill(rates?.fallback ? 'warn' : 'muted')}>
            {rates?.fallback ? 'Live rates unavailable' : `base USD · ${rates?.provider ?? 'live'}`}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {(['eur', 'gbp', 'cad', 'aud'] as Currency[]).map(c => (
            <div key={c} style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.toUpperCase()}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {(() => {
                  const r = rates?.rates?.[c];
                  if (r == null) return '—';
                  const n = typeof r === 'number' ? r : Number(r);
                  return Number.isFinite(n) ? n.toFixed(4) : '—';
                })()}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Last updated: {rates?.syncedAt ? new Date(rates.syncedAt).toLocaleString() : '—'}.
          Used for admin display only. Billing uses real Stripe Prices.
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button type="button" style={button(true)} onClick={() => void save()}>Save changes</button>
        {savingMsg && <span style={{ color: 'var(--green-text)', fontSize: 13 }}>{savingMsg}</span>}
        {err       && <span style={{ color: 'var(--red-text)',   fontSize: 13 }}>{err}</span>}
      </div>
    </section>
  );
}
