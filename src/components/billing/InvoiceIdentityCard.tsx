/**
 * InvoiceIdentityCard — issuer identity and tax configuration (Settings → Organization).
 *
 * Owner/admin only. These fields are what turns a payment record into a legal
 * invoice: who issued it, from where, under which VAT number and at which rate.
 * Stored alongside the bank details at organizations/{orgId}/settings/billing.
 *
 * SNAPSHOT WARNING IS DELIBERATE. Each invoice copies these values at the moment
 * it is issued and never re-reads them, so editing here changes FUTURE invoices
 * only. Saying so on the form prevents the reasonable but wrong assumption that
 * fixing a typo here corrects documents already sent.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useLocale } from '../../context/LocaleContext';
import { Button } from '../ui/Button';
import {
  getInvoiceSettings, saveInvoiceSettings,
  SUPPLIER_REQUIRED, type InvoiceSettingsPayload,
} from '../../lib/billing/invoiceSettings';

const CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud'] as const;

const EMPTY: InvoiceSettingsPayload = {
  legalName: '', addressLine1: '', addressLine2: '', postalCode: '', city: '',
  country: '', vatNumber: '', registrationNumber: '', email: '',
  taxRatePercent: '0', taxLabel: 'VAT', currency: 'usd',
  paymentTermsDays: '14', invoiceFooter: '',
};

export function InvoiceIdentityCard() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const T = useLocale().invoiceIdentity;
  const orgId = session?.orgId ?? '';
  const isAdmin = session?.role === 'owner' || session?.role === 'admin';

  const [v, setV] = useState<InvoiceSettingsPayload>(EMPTY);
  const [missing, setMissing] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    let alive = true;
    getInvoiceSettings(orgId)
      .then(r => { if (alive && r) { setV(r.values); setMissing(r.missingSupplier); } })
      .catch(() => { /* nothing saved yet */ });
    return () => { alive = false; };
  }, [orgId]);

  const set = (k: keyof InvoiceSettingsPayload, value: string) => setV(prev => ({ ...prev, [k]: value }));

  const onSave = async () => {
    if (!isAdmin || saving) return;
    setSaving(true);
    try {
      const res = await saveInvoiceSettings(orgId, v);
      setMissing(res.missingSupplier);
      // A malformed VAT number is saved but reported: silently dropping it would
      // let an invoice go out claiming a tax status it cannot support.
      if (res.warnings.supplierVatNumber) showToast(T.vatMalformed, 'error');
      else showToast(T.saved, 'success');
    } catch {
      showToast(T.saveError, 'error');
    } finally {
      setSaving(false);
    }
  };

  const input = (bad: boolean) => ({
    width: '100%', boxSizing: 'border-box' as const, padding: '9px 11px', fontSize: 13,
    border: `1px solid ${bad ? 'var(--red-text, #DC2626)' : 'var(--border)'}`, borderRadius: 8,
    background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)',
  });

  const Field = ({ k, label, required = false, maxLength }: { k: keyof InvoiceSettingsPayload; label: string; required?: boolean; maxLength?: number }) => (
    <label style={{ display: 'grid', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label}{required ? ' *' : ''}
      </span>
      <input
        value={v[k]} maxLength={maxLength}
        onChange={e => set(k, e.target.value)}
        style={input(required && !v[k].trim())}
      />
    </label>
  );

  return (
    <div style={{ marginTop: 22, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>{T.heading}</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>{T.subtitle}</p>

      {!isAdmin ? (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>{T.ownerOnly}</div>
      ) : (
        <div style={{ display: 'grid', gap: 14, maxWidth: 460 }}>
          {missing.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--amber-text, #92400E)', background: 'var(--amber-bg, #FEF3C7)', border: '1px solid var(--amber-border, #FDE68A)', borderRadius: 8, padding: '9px 12px' }}>
              {T.incomplete}
            </div>
          )}

          <Field k="legalName"    label={T.fLegalName} required />
          <Field k="addressLine1" label={T.fAddress1} required />
          <Field k="addressLine2" label={T.fAddress2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <Field k="postalCode" label={T.fPostalCode} maxLength={20} />
            <Field k="city"       label={T.fCity} required />
          </div>
          <label style={{ display: 'grid', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{T.fCountry} *</span>
            <input
              value={v.country} maxLength={2}
              onChange={e => set('country', e.target.value.toUpperCase().slice(0, 2))}
              style={{ ...input(!v.country.trim()), width: 90 }}
            />
          </label>
          <Field k="vatNumber"          label={T.fVatNumber} maxLength={20} />
          <Field k="registrationNumber" label={T.fRegistration} maxLength={40} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{T.fTaxRate}</span>
              <input
                value={v.taxRatePercent} inputMode="decimal"
                onChange={e => set('taxRatePercent', e.target.value.replace(/[^0-9.]/g, '').slice(0, 5))}
                style={input(false)}
              />
            </label>
            <Field k="taxLabel" label={T.fTaxLabel} maxLength={16} />
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{T.fCurrency}</span>
              <select value={v.currency} onChange={e => set('currency', e.target.value)} style={input(false)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </label>
          </div>

          <label style={{ display: 'grid', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{T.fPaymentTerms}</span>
            <input
              value={v.paymentTermsDays} inputMode="numeric"
              onChange={e => set('paymentTermsDays', e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              style={{ ...input(false), width: 110 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{T.fFooter}</span>
            <textarea
              value={v.invoiceFooter} rows={2} maxLength={400}
              onChange={e => set('invoiceFooter', e.target.value)}
              style={{ ...input(false), resize: 'vertical' as const }}
            />
          </label>

          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>{T.snapshotNote}</p>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" size="md" onClick={onSave} disabled={saving} style={saving ? { opacity: 0.6 } : undefined}>
              {saving ? T.save + '…' : T.save}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { SUPPLIER_REQUIRED };
