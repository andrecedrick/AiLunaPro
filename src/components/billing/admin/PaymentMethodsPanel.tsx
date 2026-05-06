/**
 * Payment Methods panel — Phase J1.3B (owner-only).
 * Persists to Firestore billing_config.paymentSettings + .promotionSettings.
 * Read by /api/billing/checkout to apply at session creation.
 */

import { useEffect, useState } from 'react';
import { fetchPaymentSettings, savePaymentSettings } from '../../../lib/billing/adminClient';
import {
  DEFAULT_PAYMENT_SETTINGS,
  type PaymentSettings,
  type PromotionSettings,
} from '../../../types/billingAdmin';
import { panelCard, panelTitle, panelSubtitle, button, fieldLabel } from './panelStyles';

export function PaymentMethodsPanel({ orgId }: { orgId: string }) {
  const [ps, setPs] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [promo, setPromo] = useState<PromotionSettings>({ enabled: true });
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      const r = await fetchPaymentSettings(orgId, idToken);
      setPs(r.paymentSettings);
      setPromo(r.promotionSettings);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSavedMsg(null);
    setErr(null);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      await savePaymentSettings(orgId, { paymentSettings: ps, promotionSettings: promo }, idToken);
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(null), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    }
  };

  return (
    <section style={panelCard}>
      <h3 style={panelTitle}>Payment Methods & Checkout Behavior</h3>
      <p style={panelSubtitle}>Applied to the next Stripe Checkout Session.</p>

      {err && (
        <div style={{ padding: 10, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {err}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, opacity: loading ? 0.6 : 1 }}>
        <Toggle
          label="Allow Apple Pay / Google Pay (automatic payment methods)"
          value={ps.automaticPaymentMethods}
          onChange={v => setPs(s => ({ ...s, automaticPaymentMethods: v }))}
        />
        <Toggle
          label="Allow promotion codes at checkout"
          value={ps.allowPromotionCodes}
          onChange={v => setPs(s => ({ ...s, allowPromotionCodes: v }))}
        />
        <div>
          <label style={fieldLabel}>Billing address collection</label>
          <select
            value={ps.billingAddressCollection}
            onChange={e => setPs(s => ({ ...s, billingAddressCollection: e.target.value as 'auto' | 'required' }))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13 }}
          >
            <option value="auto">Auto (recommended)</option>
            <option value="required">Always required</option>
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Tax ID collection</label>
          <select
            value={ps.taxIdCollection}
            onChange={e => setPs(s => ({ ...s, taxIdCollection: e.target.value as 'off' | 'required' }))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13 }}
          >
            <option value="off">Off</option>
            <option value="required">Required</option>
          </select>
        </div>
        <Toggle
          label="Enable promo codes (admin)"
          value={promo.enabled}
          onChange={v => setPromo({ enabled: v })}
        />
      </div>

      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" style={button(true)} onClick={() => void save()}>Save changes</button>
        {savedMsg && <span style={{ color: 'var(--green-text)', fontSize: 13 }}>{savedMsg}</span>}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
        Note: Card payments are always enabled. Apple/Google Pay availability also depends on the
        Stripe account configuration in the Stripe Dashboard.
      </p>
    </section>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
      <span
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          flexShrink: 0,
          width: 36, height: 20,
          borderRadius: 999,
          background: value ? 'var(--violet)' : 'var(--surface-2)',
          border: '1px solid var(--border)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
          marginTop: 2,
        }}
      >
        <span style={{
          position: 'absolute', top: 1, left: value ? 17 : 1,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {label}
      </span>
    </label>
  );
}
