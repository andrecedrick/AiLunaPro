/**
 * Modal — create new Stripe Price for a (plan, currency, interval).
 */

import { useState } from 'react';
import { createPrice } from '../../../lib/billing/adminClient';
import {
  CURRENCY_SYMBOLS,
  type Currency,
  type Interval,
  type Plan,
} from '../../../types/billingAdmin';
import { button, fieldLabel, input } from './panelStyles';

interface Props {
  orgId:              string;
  plan:               Plan;
  enabledCurrencies:  Currency[];
  initialCurrency?:   Currency;
  onClose:            () => void;
  onCreated:          () => void;
}

export function PriceUpdateModal({ orgId, plan, enabledCurrencies, initialCurrency, onClose, onCreated }: Props) {
  const [amount,   setAmount]   = useState('');           // major units (e.g. 49.99)
  const [currency, setCurrency] = useState<Currency>(initialCurrency ?? enabledCurrencies[0] ?? 'usd');
  const [interval, setInterval] = useState<Interval>('month');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const major = parseFloat(amount);
    if (!Number.isFinite(major) || major <= 0) {
      setErr('Enter a valid amount > 0');
      return;
    }
    const cents = Math.round(major * 100);
    setBusy(true);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      await createPrice({ orgId, plan, amountCents: cents, currency, interval }, idToken);
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to create price');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        padding: 28, maxWidth: 440, width: '92%', boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          Update {plan} price
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Creates a new Stripe Price. Existing subscribers keep their current price.
        </p>

        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Amount ({CURRENCY_SYMBOLS[currency]})</label>
          <input
            type="number"
            step="0.01"
            min="0.50"
            placeholder="49.99"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={input}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={fieldLabel}>Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as Currency)}
              style={input}
            >
              {enabledCurrencies.map(c => (
                <option key={c} value={c}>{c.toUpperCase()} {CURRENCY_SYMBOLS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={fieldLabel}>Interval</label>
            <select
              value={interval}
              onChange={e => setInterval(e.target.value as Interval)}
              style={input}
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
        </div>

        {err && (
          <div style={{ padding: 10, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
            {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" style={button(false)} onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" style={button(true)}  onClick={() => void submit()} disabled={busy}>
            {busy ? 'Creating…' : 'Create price'}
          </button>
        </div>
      </div>
    </div>
  );
}
