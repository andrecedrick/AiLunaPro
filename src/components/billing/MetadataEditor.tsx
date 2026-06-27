/**
 * MetadataEditor — Phase I.6
 *
 * Owner-only form for editing non-secret Stripe metadata.
 * NO field for any secret (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 * STRIPE_PUBLISHABLE_KEY). Those live exclusively in worker env via
 * `wrangler secret put`.
 */

import { useEffect, useState } from 'react';
import {
  readBillingMetadata,
  writeBillingMetadata,
} from '../../lib/billing/metadataService';
import { EMPTY_METADATA, type BillingMetadata } from '../../types/billingMetadata';

interface Props {
  orgId: string;
  uid: string;
}

type FormState = BillingMetadata;

function field<T extends 'priceIds' | 'returnUrls' | 'labels'>(
  state: FormState,
  group: T,
  key: keyof FormState[T],
): string {
  const v = (state[group] as Record<string, string | null>)[key as string];
  return v ?? '';
}

function setField<T extends 'priceIds' | 'returnUrls' | 'labels'>(
  setter: React.Dispatch<React.SetStateAction<FormState>>,
  group: T,
  key: keyof FormState[T],
  value: string,
): void {
  setter(prev => ({
    ...prev,
    [group]: { ...(prev[group] as object), [key]: value === '' ? null : value },
  }));
}

/* ── Sub-components ───────────────────────────────────────── */

function Row({
  label, name, value, onChange, error, placeholder, help,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  help?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        htmlFor={name}
        style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          fontSize: 13,
          fontFamily: 'monospace',
          outline: 'none',
        }}
      />
      {help && !error && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{help}</div>
      )}
      {error && (
        <div style={{ fontSize: 11, color: 'var(--red-text)', marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

/* ── Main editor ──────────────────────────────────────────── */

export function MetadataEditor({ orgId, uid }: Props) {
  const [state, setState]       = useState<FormState>(EMPTY_METADATA);
  const [errors, setErrors]     = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving]     = useState(false);
  const [savedAt, setSavedAt]   = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);

  // Load on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await readBillingMetadata(orgId);
      if (!cancelled) {
        setState(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  const handleSave = async () => {
    setSaving(true);
    setGlobalError(null);
    setErrors({});
    const res = await writeBillingMetadata(orgId, uid, state);
    setSaving(false);
    if (res.success) {
      setSavedAt(new Date().toISOString());
    } else {
      if (res.validationErrors) setErrors(res.validationErrors);
      setGlobalError(res.error ?? 'Save failed');
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setErrors({});
    setGlobalError(null);
    setSavedAt(null);
    const data = await readBillingMetadata(orgId);
    setState(data);
    setLoading(false);
  };

  if (loading) {
    return <div style={{ padding: 12, color: 'var(--text-muted)' }}>Loading…</div>;
  }

  return (
    <div data-testid="metadata-editor">
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Edit non-secret Stripe configuration. Stored at{' '}
        <code style={{ fontFamily: 'monospace', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>
          organizations/{orgId}/billing_config/current
        </code>.
      </div>

      {/* Price IDs */}
      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px' }}>
        Price IDs
      </h4>
      <Row
        label="Starter" name="priceId.starter"
        value={field(state, 'priceIds', 'starter')}
        onChange={v => setField(setState, 'priceIds', 'starter', v)}
        error={errors['priceIds.starter']}
        placeholder="price_..." help="Stripe price ID. Format: price_<alnum>"
      />
      <Row
        label="Professional" name="priceId.professional"
        value={field(state, 'priceIds', 'professional')}
        onChange={v => setField(setState, 'priceIds', 'professional', v)}
        error={errors['priceIds.professional']}
        placeholder="price_..."
      />
      <Row
        label="Enterprise" name="priceId.enterprise"
        value={field(state, 'priceIds', 'enterprise')}
        onChange={v => setField(setState, 'priceIds', 'enterprise', v)}
        error={errors['priceIds.enterprise']}
        placeholder="price_..."
      />

      {/* Return URLs */}
      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '20px 0 10px' }}>
        Return URLs
      </h4>
      <Row
        label="Success URL" name="returnUrl.success"
        value={field(state, 'returnUrls', 'success')}
        onChange={v => setField(setState, 'returnUrls', 'success', v)}
        error={errors['returnUrls.success']}
        placeholder="https://app.example.com/billing?status=success"
        help="https:// or http://localhost for dev"
      />
      <Row
        label="Cancel URL" name="returnUrl.cancel"
        value={field(state, 'returnUrls', 'cancel')}
        onChange={v => setField(setState, 'returnUrls', 'cancel', v)}
        error={errors['returnUrls.cancel']}
        placeholder="https://app.example.com/billing?status=cancel"
      />

      {/* Labels */}
      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '20px 0 10px' }}>
        Plan labels (optional)
      </h4>
      <Row
        label="Starter label" name="label.starter"
        value={field(state, 'labels', 'starter')}
        onChange={v => setField(setState, 'labels', 'starter', v)}
        error={errors['labels.starter']}
      />
      <Row
        label="Professional label" name="label.professional"
        value={field(state, 'labels', 'professional')}
        onChange={v => setField(setState, 'labels', 'professional', v)}
        error={errors['labels.professional']}
      />
      <Row
        label="Enterprise label" name="label.enterprise"
        value={field(state, 'labels', 'enterprise')}
        onChange={v => setField(setState, 'labels', 'enterprise', v)}
        error={errors['labels.enterprise']}
      />

      {/* Action bar */}
      <div style={{ marginTop: 22, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '9px 18px', borderRadius: 8, border: 'none',
            background: 'var(--brand-gradient)', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          style={{
            padding: '9px 18px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          Reset
        </button>
        {savedAt && (
          <span style={{ fontSize: 12, color: 'var(--green-text)', fontWeight: 500 }}>
            ✓ Saved
          </span>
        )}
        {globalError && (
          <span style={{ fontSize: 12, color: 'var(--red-text)', fontWeight: 500 }}>
            {globalError}
          </span>
        )}
      </div>

      <div style={{
        marginTop: 22, padding: 12, borderRadius: 8,
        background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-muted)',
      }}>
        ℹ Stripe secret keys must be set via <code>wrangler secret put</code> and cannot be edited here.
      </div>
    </div>
  );
}
