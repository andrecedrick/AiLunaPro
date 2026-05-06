/**
 * Stripe Status panel — Phase J1.3 (owner-only).
 */

import { useEffect, useState } from 'react';
import { fetchAdminStatus } from '../../../lib/billing/adminClient';
import type { AdminStatus } from '../../../types/billingAdmin';
import { panelCard, panelTitle, panelSubtitle, button, pill } from './panelStyles';

export function StatusPanel({ orgId }: { orgId: string }) {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      setStatus(await fetchAdminStatus(orgId, idToken));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section style={panelCard}>
      <h3 style={panelTitle}>Stripe Status</h3>
      <p style={panelSubtitle}>Diagnostic flags. Secrets are never exposed.</p>

      {err && (
        <div style={{ padding: 10, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {!status ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{loading ? 'Loading…' : '—'}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Row label="Mode"                value={status.stripeMode}                  variant={status.stripeMode === 'test' ? 'ok' : status.stripeMode === 'live' ? 'err' : 'warn'} />
          <Row label="Secret key"          value={status.stripeConfigured    ? 'configured' : 'missing'} variant={status.stripeConfigured    ? 'ok' : 'err'} />
          <Row label="Webhook secret"      value={status.webhookConfigured   ? 'configured' : 'missing'} variant={status.webhookConfigured   ? 'ok' : 'err'} />
          <Row label="Service account"     value={status.firestoreConfigured ? 'configured' : 'missing'} variant={status.firestoreConfigured ? 'ok' : 'err'} />
          <Row label="Default currency"    value={status.currencyDefault.toUpperCase()} variant="muted" />
          <Row label="Recent invoices"     value={String(status.lastInvoiceCount)}      variant="muted" />
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Last webhook</div>
            {status.lastWebhookEvent ? (
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {status.lastWebhookEvent.id} · <span style={pill(status.lastWebhookEvent.ok ? 'ok' : 'err')}>{status.lastWebhookEvent.ok ? 'verified' : 'failed'}</span> · {new Date(status.lastWebhookEvent.at).toLocaleString()}
                {status.lastWebhookEvent.error && (
                  <div style={{ color: 'var(--red-text)', marginTop: 4 }}>{status.lastWebhookEvent.error}</div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No webhook events yet.</div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <button type="button" style={button(false)} onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </section>
  );
}

function Row({ label, value, variant }: { label: string; value: string; variant: 'ok' | 'warn' | 'err' | 'muted' }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <span style={pill(variant)}>{value}</span>
    </div>
  );
}
