/**
 * Portal & Invoices diagnostic panel — Phase J1.3B (READ-ONLY).
 * Displays Stripe Customer Portal config + invoice route health.
 */

import { useEffect, useState } from 'react';
import { fetchPortalDiagnostic, type PortalDiagnosticResponse } from '../../../lib/billing/adminClient';
import { panelCard, panelTitle, panelSubtitle, button, pill } from './panelStyles';

export function PortalPanel({ orgId }: { orgId: string }) {
  const [diag, setDiag] = useState<PortalDiagnosticResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { auth } = await import('../../../lib/firebase-auth');
      const idToken  = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      setDiag(await fetchPortalDiagnostic(orgId, idToken));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section style={panelCard}>
      <h3 style={panelTitle}>Portal & Invoices</h3>
      <p style={panelSubtitle}>Stripe Customer Portal configuration. Read-only diagnostic.</p>

      {err && (
        <div style={{ padding: 10, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {!diag ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{loading ? 'Loading…' : '—'}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Row label="Portal configured"     value={diag.portal.configured          ? 'yes' : 'no'} variant={diag.portal.configured          ? 'ok' : 'err'} />
          <Row label="Portal enabled"        value={diag.portal.enabled             ? 'yes' : 'no'} variant={diag.portal.enabled             ? 'ok' : 'err'} />
          <Row label="Manage payment method" value={diag.portal.managePaymentMethod ? 'yes' : 'no'} variant={diag.portal.managePaymentMethod ? 'ok' : 'warn'} />
          <Row label="Cancel subscription"   value={diag.portal.cancelSubscription  ? 'yes' : 'no'} variant={diag.portal.cancelSubscription  ? 'ok' : 'warn'} />
          <Row label="Invoice history"       value={diag.portal.invoiceHistory      ? 'yes' : 'no'} variant={diag.portal.invoiceHistory      ? 'ok' : 'warn'} />
          <Row label="Customer linked"       value={diag.invoices.customerLinked    ? 'yes' : 'no'} variant={diag.invoices.customerLinked    ? 'ok' : 'muted'} />
          <Row label="Recent invoices"       value={String(diag.invoices.lastInvoiceCount)}        variant="muted" />
          <Row label="Invoice PDFs"          value={diag.invoices.lastInvoicePdfAvailable ? 'available' : '—'} variant={diag.invoices.lastInvoicePdfAvailable ? 'ok' : 'muted'} />
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, fontStyle: 'italic' }}>
        {diag?.note ?? 'Portal flow is configured in Stripe Dashboard → Settings → Customer Portal. This panel is read-only.'}
      </p>

      <div style={{ marginTop: 12 }}>
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
