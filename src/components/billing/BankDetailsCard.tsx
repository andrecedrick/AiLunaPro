/**
 * BankDetailsCard — region-aware bank-transfer details (Settings → Organization).
 *
 * Owner/admin only. The admin enters their country; the field set switches by
 * banking region (EU → IBAN/BIC, US → account/routing, Asia/Global → account/
 * SWIFT). Stored at organizations/{orgId}/settings/billing and shown on invoices
 * as a transfer option. No payment, no Stripe.
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useLocale } from '../../context/LocaleContext';
import { Button } from '../ui/Button';
import { REGION_FIELDS, countryToRegion, isFieldValid, getBankSettings, saveBankSettings } from '../../lib/billing/bankSettings';

export function BankDetailsCard() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const B = useLocale().bankSettings;
  const orgId = session?.orgId ?? '';
  const isAdmin = session?.role === 'owner' || session?.role === 'admin';

  const [country, setCountry] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const region = useMemo(() => countryToRegion(country), [country]);
  const fields = REGION_FIELDS[region];

  const fieldLabel = (f: string): string => {
    switch (f) {
      case 'iban': return 'IBAN';
      case 'bic': return 'BIC';
      case 'swiftCode': return 'SWIFT / BIC';
      case 'accountName': return B.fAccountName;
      case 'accountNumber': return B.fAccountNumber;
      case 'routingNumber': return B.fRoutingNumber;
      case 'bankName': return B.fBankName;
      case 'accountHolder': return B.fAccountHolder;
      default: return f;
    }
  };
  const regionLabel = region === 'eu' ? B.regionEu : region === 'us' ? B.regionUs : B.regionGlobal;

  useEffect(() => {
    if (!orgId) return;
    let alive = true;
    getBankSettings(orgId).then(s => {
      if (!alive || !s) return;
      setCountry(typeof s.country === 'string' ? s.country : '');
      setValues(s as Record<string, string>);
    }).catch(() => { /* no settings yet */ });
    return () => { alive = false; };
  }, [orgId]);

  const setField = (f: string, v: string) => {
    setValues(prev => ({ ...prev, [f]: v }));
    if (errors[f]) setErrors(prev => ({ ...prev, [f]: false }));
  };

  const onSave = async () => {
    if (!isAdmin || saving) return;
    const errs: Record<string, boolean> = {};
    for (const f of fields) if (!isFieldValid(f, values[f] ?? '')) errs[f] = true;
    if (Object.keys(errs).length) { setErrors(errs); showToast(B.validationError, 'error'); return; }
    setSaving(true);
    try {
      const payload: Record<string, string> = { country, region };
      for (const f of fields) payload[f] = (values[f] ?? '').trim();
      await saveBankSettings(orgId, payload);
      showToast(B.saved, 'success');
    } catch (e) {
      const fe = (e as { fieldErrors?: Record<string, string> }).fieldErrors;
      if (fe) setErrors(Object.fromEntries(Object.keys(fe).map(k => [k, true])));
      showToast(B.saveError, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (bad: boolean) => ({
    width: '100%', boxSizing: 'border-box' as const, padding: '9px 11px', fontSize: 13,
    border: `1px solid ${bad ? 'var(--red-text, #DC2626)' : 'var(--border)'}`, borderRadius: 8,
    background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)',
  });

  return (
    <div style={{ marginTop: 22, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>{B.heading}</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>{B.subtitle}</p>

      {!isAdmin ? (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>{B.ownerOnly}</div>
      ) : (
        <div style={{ display: 'grid', gap: 14, maxWidth: 420 }}>
          <label style={{ display: 'grid', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{B.countryLabel}</span>
            <input value={country} onChange={e => setCountry(e.target.value.toUpperCase().slice(0, 2))} placeholder={B.countryPlaceholder} maxLength={2} style={{ ...inputStyle(false), width: 90 }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{B.regionLabel}: <strong>{regionLabel}</strong></span>
          </label>

          {fields.map(f => (
            <label key={f} style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{fieldLabel(f)}</span>
              <input value={values[f] ?? ''} onChange={e => setField(f, e.target.value)} style={inputStyle(!!errors[f])} />
              {errors[f] && <span style={{ fontSize: 11, color: 'var(--red-text, #DC2626)' }}>{B.validationError}</span>}
            </label>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" size="md" onClick={onSave} disabled={saving} style={saving ? { opacity: 0.6 } : undefined}>
              {saving ? B.save + '…' : B.save}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
