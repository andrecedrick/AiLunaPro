/**
 * BillingSettingsPage — Phase I.5
 *
 * Read-only admin diagnostic for Stripe configuration health.
 * Shows booleans + masked metadata only. No secret values are ever displayed.
 * No edit/save controls. Owner-only access.
 *
 * Webhook health is ephemeral (in-memory worker state); resets on worker
 * restart. KV persistence deferred to J1.
 */

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchBillingConfigStatus } from '../../lib/billing/configService';
import type { BillingConfigStatus, KeyStatus, StripeMode } from '../../types/billingConfig';
import { SettingsLayout } from './SettingsLayout';
import { MetadataEditor } from '../../components/billing/MetadataEditor';
// Admin panels lazy-loaded — only owner sees them, splitting reduces initial bundle.
const StatusPanel         = lazy(() => import('../../components/billing/admin/StatusPanel').then(m => ({ default: m.StatusPanel })));
const CurrencyPanel       = lazy(() => import('../../components/billing/admin/CurrencyPanel').then(m => ({ default: m.CurrencyPanel })));
const ProductsPanel       = lazy(() => import('../../components/billing/admin/ProductsPanel').then(m => ({ default: m.ProductsPanel })));
const PromoCodesPanel     = lazy(() => import('../../components/billing/admin/PromoCodesPanel').then(m => ({ default: m.PromoCodesPanel })));
const PaymentMethodsPanel = lazy(() => import('../../components/billing/admin/PaymentMethodsPanel').then(m => ({ default: m.PaymentMethodsPanel })));
const PortalPanel         = lazy(() => import('../../components/billing/admin/PortalPanel').then(m => ({ default: m.PortalPanel })));
import type { CurrencySettings, Currency } from '../../types/billingAdmin';
import { DEFAULT_CURRENCY_SETTINGS } from '../../types/billingAdmin';
import { db } from '../../lib/firestore';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

/* ── Helpers ──────────────────────────────────────────────── */

function ModeBadge({ mode }: { mode: StripeMode }) {
  const colors = {
    test: { bg: 'var(--yellow-soft-bg)', fg: 'var(--yellow-text)', label: 'TEST' },
    live: { bg: 'var(--green-soft-bg)',  fg: 'var(--green-text)',  label: 'LIVE' },
    unset:{ bg: 'var(--surface-2)',      fg: 'var(--text-muted)',  label: 'UNSET' },
  }[mode];
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
      letterSpacing: 1, background: colors.bg, color: colors.fg,
    }}>
      {colors.label}
    </span>
  );
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={3} strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function StatusRow({
  label, status, masked, note,
}: {
  label: string;
  status: KeyStatus | { configured: boolean };
  masked?: string | null;
  note?: string;
}) {
  const ok = status.configured;
  const last4 = (status as KeyStatus).last4 ?? null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StatusIcon ok={ok} />
        <span style={{ fontSize: 13, color: ok ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {ok ? 'Configured' : 'Not configured'}
        </span>
        {ok && last4 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            ····{last4}
          </span>
        )}
        {ok && !last4 && masked && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{masked}</span>
        )}
        {note && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{note}</span>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 8px' }}>
        {title}
      </h3>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '4px 16px' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Locked view for non-owners ───────────────────────────── */
function Locked() {
  return (
    <SettingsLayout title="Billing">
      <div style={{ padding: 32, textAlign: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Owner-only</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Billing settings are restricted to workspace owners.
        </div>
      </div>
    </SettingsLayout>
  );
}

/* ── Operator-managed view (production) ───────────────────────
 * Stripe platform config (products, prices, promo codes, key health) is
 * operator-only — NOT per-tenant. In production we hide these admin panels
 * from tenant owners; the operator manages Stripe via the Stripe Dashboard +
 * `wrangler secret`. Tenant billing (plan, usage, invoices, manage
 * subscription/tokens) lives on the main Billing page (#/billing), untouched.
 */
function OperatorManaged() {
  return (
    <SettingsLayout title="Billing">
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          Managed by the platform operator
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.55, maxWidth: 460, margin: '6px auto 0' }}>
          Stripe configuration is managed centrally by AiLunaPro.
          For your plan, usage, invoices, and subscription, use the{' '}
          <strong>Billing</strong> page in the sidebar.
        </div>
      </div>
    </SettingsLayout>
  );
}

/* ── Main page ────────────────────────────────────────────── */
export function BillingSettingsPage() {
  const { session } = useAuth();
  const [status, setStatus]     = useState<BillingConfigStatus | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const role = session?.role ?? 'member';
  const canView = role === 'owner';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchBillingConfigStatus();
      setStatus(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (canView) load(); }, [canView, load]);

  if (!canView) return <Locked />;
  // Production: hide platform Stripe admin from tenant owners (operator-only).
  if (import.meta.env.PROD) return <OperatorManaged />;

  return (
    <SettingsLayout title="Billing">
      <div style={{ marginBottom: 18, fontSize: 13, color: 'var(--text-muted)' }}>
        Check Stripe readiness before enabling real billing. Read-only — secrets are never exposed.
        Set values via <code style={{ fontFamily: 'monospace', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>wrangler secret put</code>.
      </div>

      {/* Mode banner */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 12, marginBottom: 24,
        background: 'var(--surface)', border: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Stripe mode
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 4 }}>
            {status?.mode === 'live' && 'Production / real charges'}
            {status?.mode === 'test' && 'Test mode / no real charges'}
            {(!status || status.mode === 'unset') && 'Publishable key not configured'}
          </div>
        </div>
        {status && <ModeBadge mode={status.mode} />}
      </div>

      {loading && <div style={{ color: 'var(--text-muted)', padding: 12 }}>Loading…</div>}
      {error && <div style={{ color: 'var(--red-text)', padding: 12 }}>Error: {error}</div>}

      {status && !loading && (
        <>
          <Section title="Keys status">
            <StatusRow label="Publishable key" status={status.publishableKey} />
            <StatusRow label="Secret key"      status={status.secretKey}      note="server-side only" />
            <StatusRow label="Webhook secret"  status={status.webhookSecret}  note="server-side only" />
          </Section>

          <Section title="Price IDs">
            <StatusRow label="Starter"      status={status.priceIds.starter} />
            <StatusRow label="Professional" status={status.priceIds.professional} />
            <StatusRow label="Enterprise"   status={status.priceIds.enterprise} />
          </Section>

          <Section title="Webhook health (ephemeral)">
            <div style={{ padding: '8px 0', display: 'flex', gap: 12, flexDirection: 'column' }}>
              <Row label="Last event ID"  value={status.webhook.lastEventId ?? '—'} mono />
              <Row label="Last received"  value={
                status.webhook.lastEventTimestamp
                  ? new Date(status.webhook.lastEventTimestamp).toLocaleString()
                  : '—'
              } />
              <Row label="Last verified"
                value={
                  status.webhook.lastVerified === null ? '—'
                  : status.webhook.lastVerified ? '✓' : '✗'
                }
                color={
                  status.webhook.lastVerified === null ? 'var(--text-muted)'
                  : status.webhook.lastVerified ? 'var(--green-text)' : 'var(--red-text)'
                }
              />
              <Row label="Last error" value={status.webhook.lastError ?? '—'} color={status.webhook.lastError ? 'var(--red-text)' : undefined} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                Resets on worker restart. Persistent KV storage deferred to J1.
              </div>
            </div>
          </Section>

          <button
            type="button"
            onClick={load}
            style={{
              padding: '8px 18px', borderRadius: 8, border: '1px solid var(--violet)',
              background: 'transparent', color: 'var(--violet-text)', fontWeight: 600,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </>
      )}

      {/* J1.3 — Admin panels (primary admin surface) */}
      {session?.orgId && (
        <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 18px' }}>
            Stripe Admin
          </h3>
          <BillingAdminPanels orgId={session.orgId} />
        </div>
      )}

      {/* I.6 legacy MetadataEditor — collapsed by default */}
      {session?.orgId && session?.userId && (
        <details style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <summary style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 0.8,
            cursor: 'pointer', listStyle: 'revert',
          }}>
            Advanced legacy billing config
          </summary>
          <div style={{
            marginTop: 12, padding: 10,
            background: 'var(--yellow-soft-bg)', color: 'var(--yellow-text)',
            borderRadius: 8, fontSize: 12,
          }}>
            ⚠ This section is deprecated. Use Products &amp; Prices and Currency Settings panels above instead.
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginTop: 12 }}>
            <MetadataEditor orgId={session.orgId} uid={session.userId} />
          </div>
        </details>
      )}
    </SettingsLayout>
  );
}

/* ── J1.3 admin panels container — Phase J1.3A ──────────── */
function BillingAdminPanels({ orgId }: { orgId: string }) {
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings | null>(null);

  // Live listen to billing_config currencySettings
  useEffect(() => {
    const ref = doc(db, 'organizations', orgId, 'billing_config', 'current');
    // initial fetch
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as { currencySettings?: CurrencySettings };
        if (data.currencySettings) setCurrencySettings(data.currencySettings);
      }
    }).catch(err => console.warn('[BillingAdmin] initial fetch failed:', err));
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = snap.data() as { currencySettings?: CurrencySettings };
        if (data.currencySettings) setCurrencySettings(data.currencySettings);
      }
    });
    return unsub;
  }, [orgId]);

  const enabledCurrencies = (currencySettings?.enabledCurrencies ?? DEFAULT_CURRENCY_SETTINGS.enabledCurrencies) as Currency[];

  const panelFallback = (label: string) => (
    <div style={{
      background:    'var(--surface)',
      border:        '1px solid var(--border)',
      borderRadius:  14,
      padding:       16,
      marginBottom:  24,
      fontSize:      13,
      color:         'var(--text-muted)',
    }}>
      Loading {label}…
    </div>
  );

  // Per-panel Suspense — one slow panel doesn't block others.
  return (
    <>
      <Suspense fallback={panelFallback('Stripe status')}>
        <StatusPanel orgId={orgId} />
      </Suspense>
      <Suspense fallback={panelFallback('currency settings')}>
        <CurrencyPanel
          orgId={orgId}
          currentSettings={currencySettings}
          onSaved={cs => setCurrencySettings(cs)}
        />
      </Suspense>
      <Suspense fallback={panelFallback('products & prices')}>
        <ProductsPanel orgId={orgId} enabledCurrencies={enabledCurrencies} />
      </Suspense>
      <Suspense fallback={panelFallback('promotion codes')}>
        <PromoCodesPanel orgId={orgId} />
      </Suspense>
      <Suspense fallback={panelFallback('payment methods')}>
        <PaymentMethodsPanel orgId={orgId} />
      </Suspense>
      <Suspense fallback={panelFallback('portal diagnostic')}>
        <PortalPanel orgId={orgId} />
      </Suspense>
    </>
  );
}

function Row({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: '0 0 130px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{
        fontSize: 13,
        color: color ?? 'var(--text-primary)',
        fontFamily: mono ? 'monospace' : 'inherit',
        wordBreak: 'break-all',
      }}>
        {value}
      </div>
    </div>
  );
}
