/**
 * BillingPage — Phase J1.2
 *
 * Single custom 4-column pricing grid (Free / Starter / Professional / Enterprise).
 * Stripe Pricing Table embed retained as component (fallback), not rendered here.
 *
 * Active subscription:
 *   - Hide pricing grid
 *   - Show current plan card + Manage subscription portal button
 *
 * No active subscription:
 *   - Show Free state + custom 4-column grid
 *   - Click Subscribe → POST /api/billing/checkout → redirect Stripe Checkout
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import type { Dict } from '../lib/locale/i18n/en';
import { dlog } from '../lib/log';
import { useBilling } from '../context/BillingContext';
import { useRoute } from '../context/RouteContext';
import { useToast } from '../hooks/useToast';
import { useTokens } from '../context/TokensContext';
import { PLAN_CONFIGS, type PlanTier } from '../types/billing';
import { createCheckoutSession, createPortalSession, CheckoutError, PortalError, WORKER_BASE, fetchInvoices, type StripeInvoice } from '../lib/billing/stripeClient';
import { CURRENCY_SYMBOLS, type Currency, type CurrencySettings, DEFAULT_CURRENCY_SETTINGS } from '../lib/billing/currencyConstants';
import { usePreferences } from '../context/PreferencesContext';
import { useMoney } from '../lib/currency/useMoney';
import { formatMoney } from '../lib/billing/currencyFormat';
import { resolveBillingCurrency } from '../lib/billing/currencyDetect';
import { db } from '../lib/firestore';
import { doc, onSnapshot } from 'firebase/firestore';
import { resolveLayer } from '../lib/featureFlags';

/* ── Helpers ──────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function pct(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/* ── Atoms ─────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
      {children}
    </h2>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background:    'var(--surface)',
      border:        '1px solid var(--border)',
      borderRadius:  14,
      padding:       24,
      ...style,
    }}>
      {children}
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const T = useLocale();
  const unlimited = limit === -1;
  const percent   = unlimited ? 0 : pct(used, limit);
  const barColor  = percent > 85 ? 'var(--red)' : percent > 60 ? 'var(--yellow)' : 'var(--violet)';

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {unlimited
            ? format(T.billingPage.usage.unlimitedValue, { used })
            : format(T.billingPage.usage.boundedValue, { used, limit })}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height:        '100%',
          width:         unlimited ? '0%' : `${percent}%`,
          background:    barColor,
          borderRadius:  4,
          transition:    'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}

/* ── Custom 4-column pricing grid (J1.2) ─────────────────── */

interface PricingPlan {
  key:          'free' | 'starter' | 'professional' | 'enterprise';
  name:         PlanTier;
  price:        string;
  priceSuffix?: string;
  description:  string;
  features:     string[];
  ctaLabel:     string;
  bestValue?:   boolean;
}

function buildPricingPlans(t: Dict['billingPage']): PricingPlan[] {
  return [
    {
      key:         'free',
      name:        'Free',
      price:       '$0',
      priceSuffix: '/mo',
      description: t.plans.free.description,
      features: [
        t.plans.free.features.limitedAuditAccess,
        t.plans.free.features.basicDashboard,
        t.plans.free.features.demoReports,
        t.plans.free.features.communitySupport,
      ],
      ctaLabel: t.plans.cta.startForFree,
    },
    {
      key:         'starter',
      name:        'Starter',
      price:       '$49.99',
      priceSuffix: '/mo',
      description: t.plans.starter.description,
      features: [
        t.plans.starter.features.coreAuditWorkflow,
        t.plans.starter.features.basicComplianceReports,
        t.plans.starter.features.starterAuditVolume,
        t.plans.starter.features.essentialAiRecommendations,
        t.plans.starter.features.emailSupport,
      ],
      ctaLabel: t.plans.cta.subscribe,
    },
    {
      key:         'professional',
      name:        'Professional',
      price:       '$149.99',
      priceSuffix: '/mo',
      description: t.plans.professional.description,
      bestValue:   true,
      features: [
        t.plans.professional.features.higherAuditVolume,
        t.plans.professional.features.advancedReports,
        t.plans.professional.features.teamCollaboration,
        t.plans.professional.features.priorityAiRecommendations,
        t.plans.professional.features.prioritySupport,
      ],
      ctaLabel: t.plans.cta.subscribe,
    },
    {
      key:         'enterprise',
      name:        'Enterprise',
      price:       '$499.99',
      priceSuffix: '/mo',
      description: t.plans.enterprise.description,
      features: [
        t.plans.enterprise.features.highestAuditVolume,
        t.plans.enterprise.features.advancedTeamManagement,
        t.plans.enterprise.features.organizationControls,
        t.plans.enterprise.features.customBranding,
        t.plans.enterprise.features.dedicatedSupport,
        t.plans.enterprise.features.enterpriseReadyGovernance,
      ],
      ctaLabel: t.plans.cta.subscribe,
    },
  ];
}

interface PricingCardProps {
  plan:        PricingPlan;
  isCurrent:   boolean;
  loading:     boolean;
  disabled:    boolean;
  onSubscribe: () => void;
}

function PricingCard({ plan, isCurrent, loading, disabled, onSubscribe }: PricingCardProps) {
  const T = useLocale();
  const isFree = plan.key === 'free';
  const accent = plan.bestValue;
  // B6.7 display-only: approximate local-currency hint via the deterministic FX
  // snapshot (money.format adds the "≈"). Shown only for non-USD; Stripe bills in USD.
  const { displayCurrency } = usePreferences();
  const money = useMoney();
  const priceUsd = parseFloat(plan.price.replace(/[^0-9.]/g, '')) || 0;
  const approx = priceUsd > 0 && displayCurrency !== 'usd' ? money.format(priceUsd) : null;

  return (
    <div style={{
      flex:           '1 1 240px',
      minWidth:       240,
      maxWidth:       320,
      background:     'var(--surface)',
      border:         accent ? '2px solid var(--violet)' : '1px solid var(--border)',
      borderRadius:   16,
      padding:        '28px 22px 24px',
      position:       'relative',
      display:        'flex',
      flexDirection:  'column',
      boxShadow:      accent
        ? '0 12px 30px rgba(124, 58, 237, 0.12)'
        : '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Best value badge */}
      {accent && (
        <div style={{
          position:        'absolute',
          top:             -12,
          left:            '50%',
          transform:       'translateX(-50%)',
          background:      'var(--violet)',
          color:           '#fff',
          fontSize:        11,
          fontWeight:      700,
          padding:         '4px 12px',
          borderRadius:    999,
          letterSpacing:   0.6,
          textTransform:   'uppercase',
          whiteSpace:      'nowrap',
        }}>
          {T.billingPage.plans.bestValueBadge}
        </div>
      )}

      {/* Plan name */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        {plan.name}
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, minHeight: 32, lineHeight: 1.4 }}>
        {plan.description}
      </div>

      {/* Price */}
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: accent ? 'var(--violet-text)' : 'var(--text-primary)' }}>
          {plan.price}
        </span>
        {plan.priceSuffix && (
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
            {plan.priceSuffix}
          </span>
        )}
        {approx && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
            {format(T.billingPage.plans.priceApprox, { approx, suffix: plan.priceSuffix ?? '' })}
          </div>
        )}
      </div>

      {/* Features */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: 24, flex: 1 }}>
        {plan.features.map(f => (
          <li key={f} style={{
            fontSize:     13,
            color:        'var(--text-secondary)',
            marginBottom: 10,
            display:      'flex',
            alignItems:   'flex-start',
            gap:          8,
            lineHeight:   1.45,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA — anchored to bottom via flex */}
      <button
        type="button"
        onClick={onSubscribe}
        disabled={disabled || loading || isCurrent || isFree}
        style={{
          width:        '100%',
          padding:      '11px 0',
          borderRadius: 10,
          border:       isCurrent || isFree ? '1px solid var(--border)' : 'none',
          background:   isCurrent || isFree
            ? 'transparent'
            : (accent ? 'var(--violet)' : 'var(--text-primary)'),
          color:        isCurrent || isFree ? 'var(--text-muted)' : '#fff',
          fontWeight:   600,
          fontSize:     13,
          cursor:       (disabled || loading || isCurrent || isFree) ? 'default' : 'pointer',
          opacity:      loading ? 0.6 : 1,
          transition:   'all 0.15s ease',
        }}
      >
        {loading ? T.billingPage.plans.cta.redirecting
          : isCurrent ? T.billingPage.plans.cta.currentPlan
          : isFree    ? T.billingPage.plans.cta.freeCurrent
          : plan.ctaLabel}
      </button>
    </div>
  );
}

/* ── Invoices view (J1.2) ──────────────────────────────── */

interface InvoicesViewProps {
  isFirebaseLayer:       boolean;
  hasActiveSubscription: boolean;
  stripeInvoices:        StripeInvoice[] | null;
  invoicesLoading:       boolean;
  mockInvoices:          { id: string; date: string; amount: number; status: string; description: string }[];
}

function InvoicesView({
  isFirebaseLayer,
  hasActiveSubscription,
  stripeInvoices,
  invoicesLoading,
  mockInvoices,
}: InvoicesViewProps) {
  const T = useLocale();
  // Mock layer → existing local data
  if (!isFirebaseLayer) {
    if (mockInvoices.length === 0) {
      return <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>{T.billingPage.invoices.empty}</div>;
    }
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {[
              { key: 'Date', label: T.billingPage.invoices.tableHeaders.date },
              { key: 'Description', label: T.billingPage.invoices.tableHeaders.description },
              { key: 'Amount', label: T.billingPage.invoices.tableHeaders.amount },
              { key: 'Status', label: T.billingPage.invoices.tableHeaders.status },
            ].map(h => (
              <th key={h.key} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockInvoices.map((inv, i) => (
            <tr key={inv.id} style={{ borderBottom: i < mockInvoices.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{new Date(inv.date).toLocaleDateString()}</td>
              <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-primary)' }}>{inv.description}</td>
              <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${(inv.amount / 100).toFixed(2)}</td>
              <td style={{ padding: '13px 20px' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  background: inv.status === 'paid' ? 'var(--green-soft-bg)' : 'var(--yellow-soft-bg)',
                  color:      inv.status === 'paid' ? 'var(--green-text)'    : 'var(--yellow-text)',
                }}>
                  {inv.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Firebase layer
  if (!hasActiveSubscription) {
    return <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>{T.billingPage.invoices.empty}</div>;
  }
  if (invoicesLoading || stripeInvoices === null) {
    return <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>{T.billingPage.invoices.loading}</div>;
  }
  if (stripeInvoices.length === 0) {
    return (
      <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>
        {T.billingPage.invoices.emptyAfterFirstCycle}
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'Date', label: T.billingPage.invoices.tableHeaders.date },
            { key: 'Invoice number', label: T.billingPage.invoices.tableHeaders.invoiceNumber },
            { key: 'Amount', label: T.billingPage.invoices.tableHeaders.amount },
            { key: 'Status', label: T.billingPage.invoices.tableHeaders.status },
            { key: 'Actions', label: T.billingPage.invoices.tableHeaders.actions },
          ].map(h => (
            <th key={h.key} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {stripeInvoices.map((inv, i) => {
          const date = new Date(inv.created * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          const amt = (inv.amountPaid > 0 ? inv.amountPaid : inv.amountDue) / 100;
          const cur = inv.currency.toUpperCase();
          const isPaid = inv.status === 'paid';
          return (
            <tr key={inv.id} style={{ borderBottom: i < stripeInvoices.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{date}</td>
              <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{inv.number ?? inv.id.slice(0, 14)}</td>
              <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cur} {amt.toFixed(2)}</td>
              <td style={{ padding: '13px 20px' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  background: isPaid ? 'var(--green-soft-bg)' : 'var(--yellow-soft-bg)',
                  color:      isPaid ? 'var(--green-text)'    : 'var(--yellow-text)',
                }}>
                  {inv.status ?? T.billingPage.invoices.statusUnknown}
                </span>
              </td>
              <td style={{ padding: '13px 20px', display: 'flex', gap: 10, fontSize: 13 }}>
                {inv.hostedInvoiceUrl && (
                  <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--violet-text)', textDecoration: 'none', fontWeight: 600 }}>
                    {T.billingPage.invoices.actionView}
                  </a>
                )}
                {inv.invoicePdf && (
                  <a href={inv.invoicePdf} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--violet-text)', textDecoration: 'none', fontWeight: 600 }}>
                    {T.billingPage.invoices.actionPdf}
                  </a>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ── Locked view ──────────────────────────────────────────── */

function LockedView() {
  const { showToast } = useToast();
  const T = useLocale();
  // navigate via window hash to avoid extra hook here
  const goDashboard = () => { window.location.hash = '#/'; window.location.reload(); };
  const contactOwner = () => {
    // Best-effort: try mailto with placeholder; otherwise hint
    const mailto = 'mailto:?subject=Request%20billing%20access&body=Hi%2C%20I%20need%20billing%20access%20for%20our%20workspace.';
    try { window.open(mailto, '_self'); }
    catch { showToast(T.billingPage.locked.askOwnerToast, 'info'); }
  };
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        {T.billingPage.locked.title}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
        {T.billingPage.locked.subtitle}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={goDashboard} style={{
          padding: '10px 18px', borderRadius: 10, border: 'none',
          background: 'var(--violet)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          {T.billingPage.locked.backToDashboard}
        </button>
        <button type="button" onClick={contactOwner} style={{
          padding: '10px 18px', borderRadius: 10, border: '1px solid var(--violet)',
          background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          {T.billingPage.locked.contactWorkspaceOwner}
        </button>
      </div>
    </div>
  );
}

/* ── Mock-only PlanCard kept for mock layer ─────────────── */

function MockPlanCard({
  tier, current, canUpgrade, onSelect,
}: {
  tier:       PlanTier;
  current:    boolean;
  canUpgrade: boolean;
  onSelect:   () => void;
}) {
  const T = useLocale();
  const config = PLAN_CONFIGS[tier];
  return (
    <div style={{
      border:       current ? '2px solid var(--violet)' : '1px solid var(--border)',
      borderRadius: 12,
      padding:      20,
      background:   current ? 'var(--brand-soft-bg)' : 'var(--surface)',
      position:     'relative',
      flex:         1,
      minWidth:     160,
    }}>
      {current && (
        <div style={{
          position: 'absolute', top: -1, right: 12,
          background: 'var(--violet)', color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '2px 8px',
          borderRadius: '0 0 6px 6px', letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>
          {T.billingPage.mockPlans.currentBadge}
        </div>
      )}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{tier}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: current ? 'var(--violet-text)' : 'var(--text-primary)', marginBottom: 12 }}>
        {config.monthlyPrice === 0 ? T.billingPage.mockPlans.free : `$${config.monthlyPrice}`}
        {config.monthlyPrice > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{T.billingPage.mockPlans.priceSuffix}</span>}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: 16 }}>
        {config.features.map(f => (
          <li key={f} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      {!current && canUpgrade && (
        <button
          type="button"
          onClick={onSelect}
          style={{
            width: '100%', padding: '8px 0', borderRadius: 8, border: 'none',
            background: 'var(--violet)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          {T.billingPage.mockPlans.switch}
        </button>
      )}
      {!current && !canUpgrade && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 8 }}>
          {T.billingPage.mockPlans.contactOwnerToChange}
        </div>
      )}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────── */

export function BillingPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const tokens = useTokens();

  // B6.7: the display currency comes from PreferencesContext (browser-language at
  // boot + the user's explicit selection) — no IP/geo detection here — and the ≈
  // hints use the deterministic FX snapshot, so there is no live FX fetch. Stripe
  // billing currency + amounts are unaffected (resolved separately, below).
  const {
    subscription, invoices, usage,
    hasActiveSubscription,
    stripeCustomerId,
    upgradePlan, cancelPlan, resumePlan,
  } = useBilling();
  const T = useLocale();
  const PRICING_PLANS = useMemo(() => buildPricingPlans(T.billingPage), [T]);

  const [confirmPlan,     setConfirmPlan]     = useState<PlanTier | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loadingPlan,     setLoadingPlan]     = useState<string | null>(null);
  const [checkoutError,   setCheckoutError]   = useState<string | null>(null);
  const [stripeInvoices,  setStripeInvoices]  = useState<StripeInvoice[] | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY_SETTINGS);
  const [displayPricesByCurrency, setDisplayPricesByCurrency] = useState<Record<string, Record<string, { amount: number; currency: string; interval: string }>>>({});
  const [selectedCurrency, setSelectedCurrency]   = useState<Currency>('usd');
  const [currencySource,   setCurrencySource]     = useState<'stored' | 'detected' | 'default' | 'fallback'>('default');
  const [, setDetectedDisabled]                   = useState(false);
  const [detectedCurrency, setDetectedCurrency]   = useState<Currency | null>(null);

  const role              = session?.role ?? 'member';
  // Locked rule: Owner ⊇ Billing. Billing role is a manage delegate (pay,
  // manage subscription, buy tokens). Admin / member / client: no billing.
  const canManage         = role === 'owner' || role === 'billing';
  const canView           = role === 'owner' || role === 'billing';
  const isFirebaseLayer   = resolveLayer('auth') === 'firebase';
  const isBillingFirebase = resolveLayer('billing') === 'firebase';

  // Show custom pricing grid only when no real Stripe subscription is linked.
  const showPricingGrid =
    isFirebaseLayer &&
    isBillingFirebase &&
    canManage &&
    !hasActiveSubscription;

  if (!canView) return <LockedView />;

  const config = PLAN_CONFIGS[subscription.plan];

  // Subscribe to billing_config (currency settings + display prices)
  useEffect(() => {
    if (!isFirebaseLayer || !session?.orgId) return;
    const ref = doc(db, 'organizations', session.orgId, 'billing_config', 'current');
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const data = snap.data() as {
        currencySettings?:        CurrencySettings;
        displayPricesByCurrency?: Record<string, Record<string, { amount: number; currency: string; interval: string }>>;
      };
      if (data.currencySettings) {
        setCurrencySettings(data.currencySettings);
        const r = resolveBillingCurrency({
          enabledCurrencies: data.currencySettings.enabledCurrencies,
          defaultCurrency:   data.currencySettings.defaultCurrency,
        });
        setSelectedCurrency(r.currency);
        setCurrencySource(r.source);
        setDetectedDisabled(r.detectedDisabled);
        setDetectedCurrency(r.detected);
      }
      if (data.displayPricesByCurrency) {
        setDisplayPricesByCurrency(data.displayPricesByCurrency);
      }
    });
    return unsub;
  }, [isFirebaseLayer, session?.orgId]);

  // Load real Stripe invoices when subscription is active (firebase layer only)
  useEffect(() => {
    if (!isFirebaseLayer || !hasActiveSubscription || !session?.orgId) {
      setStripeInvoices(null);
      return;
    }
    let cancelled = false;
    setInvoicesLoading(true);
    (async () => {
      try {
        const { auth } = await import('../lib/firebase-auth');
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Not authenticated');
        const list = await fetchInvoices(session.orgId, idToken);
        if (!cancelled) setStripeInvoices(list);
      } catch (err) {
        console.warn('[BillingPage] fetchInvoices failed:', err);
        if (!cancelled) setStripeInvoices([]);
      } finally {
        if (!cancelled) setInvoicesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isFirebaseLayer, hasActiveSubscription, session?.orgId]);

  // ── Direct Stripe checkout (firebase + paid plan) ──────
  const handleSubscribe = async (planKey: 'starter' | 'professional' | 'enterprise') => {
    if (!session?.orgId) return;
    dlog('[billing checkout] starting', { plan: planKey, orgId: session.orgId, workerBase: WORKER_BASE });
    setLoadingPlan(planKey);
    setCheckoutError(null);
    try {
      const { auth } = await import('../lib/firebase-auth');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      // J1.3C: do NOT pass currency from client. Worker detects from request
      // headers (cf.country / Accept-Language) and applies admin defaults.
      const url = await createCheckoutSession(session.orgId, planKey, idToken);
      window.location.href = url;
    } catch (err) {
      console.error('[BillingPage] checkout failed:', err);
      const raw = err instanceof Error ? err.message : 'Checkout failed';
      let msg = raw;
      if (err instanceof CheckoutError) {
        msg = `Cannot reach Worker at ${err.url}. Verify Worker is running (curl ${WORKER_BASE}/healthz). Cause: ${err.message}`;
      } else if (/no active price configured/i.test(raw)) {
        // Worker 400 — strict no-fallback. Append actionable hint.
        msg = `${raw}. Please choose another currency or contact admin.`;
      }
      setCheckoutError(msg);
      setLoadingPlan(null);
    }
  };

  // ── Mock layer plan switch (legacy) ────────────────────
  const handleMockSelectPlan = (tier: PlanTier) => {
    if (!canManage) return;
    setConfirmPlan(tier);
  };

  const handleMockConfirmUpgrade = () => {
    if (!confirmPlan) return;
    upgradePlan(confirmPlan);
    setConfirmPlan(null);
  };

  // ── Manage portal (active sub) ─────────────────────────
  // J10: optional `flow` deep-links into the Stripe payment-methods section.
  const handleManagePortal = async (flow?: 'payment_method_update') => {
    if (!session?.orgId) return;
    if (!isFirebaseLayer) return;
    dlog('[billing portal] starting', { orgId: session.orgId, flow: flow ?? 'home', workerBase: WORKER_BASE || '(proxy)' });
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const { auth } = await import('../lib/firebase-auth');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      const url = await createPortalSession(session.orgId, idToken, flow);
      window.location.href = url;
    } catch (err) {
      console.error('[BillingPage] portal failed:', err);
      const friendly =
        err instanceof PortalError
          ? T.billingPage.billingActions.portalError
          : err instanceof Error ? err.message : 'Portal failed';
      setCheckoutError(friendly);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth:    showPricingGrid ? 1200 : 900,
      margin:      '0 auto',
      padding:     '32px 24px',
      transition:  'max-width 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          {T.billingPage.header.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          {T.billingPage.header.subtitle}
          {!canManage && <span style={{ color: 'var(--yellow-text)', marginLeft: 6 }}>{T.billingPage.header.readOnlyBadge}</span>}
        </p>
      </div>

      {/* Current plan summary */}
      <Card style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
              {T.billingPage.currentPlan.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                {subscription.plan}
              </span>
              {hasActiveSubscription ? (
                <>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                    background: subscription.status === 'active' || subscription.status === 'trialing'
                      ? 'var(--green-soft-bg)' : 'var(--yellow-soft-bg)',
                    color: subscription.status === 'active' || subscription.status === 'trialing'
                      ? 'var(--green-text)' : 'var(--yellow-text)',
                  }}>
                    {subscription.status}
                  </span>
                  {subscription.currency && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      letterSpacing: 0.5,
                      background: 'var(--surface-2)', color: 'var(--text-muted)',
                    }}>
                      {CURRENCY_SYMBOLS[subscription.currency.toLowerCase() as Currency] ?? subscription.currency.toUpperCase()} {subscription.currency.toUpperCase()}
                    </span>
                  )}
                </>
              ) : (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  background: 'var(--surface-2)',
                  color:      'var(--text-muted)',
                }}>
                  {T.billingPage.currentPlan.statusNoSubscription}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {config.monthlyPrice === 0
                ? T.billingPage.currentPlan.freePlanNote
                : (
                    <>
                      {format(T.billingPage.currentPlan.paidPlanSummary, {
                        price:        subscription.billingCycle === 'annual' ? config.annualPrice : config.monthlyPrice,
                        billingCycle: subscription.billingCycle,
                      })}
                      {hasActiveSubscription && format(T.billingPage.currentPlan.renews, { date: formatDate(subscription.currentPeriodEnd) })}
                    </>
                  )
              }
            </div>
            {subscription.cancelAtPeriodEnd && (
              <div style={{ fontSize: 13, color: 'var(--yellow-text)', marginTop: 6, fontWeight: 600 }}>
                {format(T.billingPage.currentPlan.cancelsAtPeriodEnd, { date: formatDate(subscription.currentPeriodEnd) })}
              </div>
            )}
            {hasActiveSubscription && subscription.currency && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {format(T.billingPage.currentPlan.billedInCurrency, { currency: subscription.currency.toUpperCase() })}
              </div>
            )}
          </div>
          {/* Mock-layer plan controls stay in the header; Firebase billing
              actions move to the dedicated "Billing actions" row below. */}
          {canManage && !isFirebaseLayer && (
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
              {subscription.cancelAtPeriodEnd ? (
                <button type="button" onClick={resumePlan} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--violet)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {T.billingPage.currentPlan.resumePlan}
                </button>
              ) : (
                <button type="button" onClick={cancelPlan} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {T.billingPage.currentPlan.cancelPlan}
                </button>
              )}
            </div>
          )}
        </div>

        {/* J10 polish: dedicated "Billing actions" row (Firebase layer).
            Full-width, clear hierarchy, equal-width CTAs. UI-only. */}
        {canManage && isFirebaseLayer && (
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
              {T.billingPage.billingActions.title}
            </div>
            {stripeCustomerId ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'stretch' }}>
                {hasActiveSubscription && (
                  <button
                    type="button"
                    onClick={() => handleManagePortal()}
                    disabled={checkoutLoading}
                    style={{ flex: '1 1 220px', maxWidth: 320, padding: '12px 18px', borderRadius: 10, border: '1.5px solid var(--violet)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 700, fontSize: 14, cursor: checkoutLoading ? 'wait' : 'pointer', opacity: checkoutLoading ? 0.6 : 1, fontFamily: 'var(--font-body)' }}
                  >
                    {checkoutLoading ? T.billingPage.billingActions.loading : T.billingPage.billingActions.manageSubscription}
                  </button>
                )}
                <div style={{ flex: '1 1 220px', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <button
                    type="button"
                    onClick={() => handleManagePortal('payment_method_update')}
                    disabled={checkoutLoading}
                    style={{ width: '100%', padding: '12px 18px', borderRadius: 10, border: '1.5px solid var(--border-strong, var(--border))', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, cursor: checkoutLoading ? 'wait' : 'pointer', opacity: checkoutLoading ? 0.6 : 1, fontFamily: 'var(--font-body)' }}
                  >
                    {checkoutLoading ? T.billingPage.billingActions.loading : T.billingPage.billingActions.managePaymentMethods}
                  </button>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {T.billingPage.billingActions.paymentMethodsHint}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 520 }}>
                {T.billingPage.billingActions.noCustomerYet}
              </div>
            )}
            {checkoutError && (
              <div style={{ fontSize: 12, color: 'var(--red-text)', marginTop: 10 }}>{checkoutError}</div>
            )}
          </div>
        )}
      </Card>

      {/* Tokens — J1.4A. Hidden for client/unauth via TokensProvider gate. */}
      {tokens.enabled && (
        <Card style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 240 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(124,58,237,0.10)', color: 'var(--violet-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" /><path d="M8 12h8 M12 8v8" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {T.billingPage.tokens.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {tokens.balance
                    ? format(T.billingPage.tokens.balance, {
                        balance:    tokens.balance.balance.toLocaleString(),
                        allocation: tokens.balance.monthlyAllocation.toLocaleString(),
                      })
                    : T.billingPage.tokens.balanceLoading}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate({ name: 'billing/tokens' })}
              style={{
                padding: '9px 18px', borderRadius: 10, border: '1px solid var(--violet)',
                background: 'transparent', color: 'var(--violet-text)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              {T.billingPage.tokens.manageTokens}
            </button>
          </div>
        </Card>
      )}

      {/* Usage */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>{T.billingPage.usage.sectionTitle}</SectionTitle>
        <Card>
          <UsageBar label={T.billingPage.usage.auditsLabel} used={usage.auditsUsed} limit={usage.auditsLimit} />
          <UsageBar label={T.billingPage.usage.seatsLabel}  used={usage.seatsUsed}  limit={usage.seatsLimit} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {format(T.billingPage.usage.periodRange, { start: formatDate(usage.periodStart), end: formatDate(usage.periodEnd) })}
          </div>
        </Card>
      </div>

      {/* Pricing grid — firebase: custom 4-col with direct Subscribe buttons */}
      {showPricingGrid && (
        <section style={{ marginBottom: 40 }}>
          {/* J1.3C — Read-only currency badge. Worker detects from request. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 20 }}>
            <span style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              padding:        '6px 14px',
              borderRadius:   999,
              background:     'rgba(124, 58, 237, 0.08)',
              color:          'var(--violet-text)',
              fontSize:       12,
              fontWeight:     600,
            }}>
              {currencySource === 'detected' && detectedCurrency
                ? format(T.billingPage.pricingSection.currencyBadge.detected, { currency: detectedCurrency.toUpperCase(), symbol: CURRENCY_SYMBOLS[detectedCurrency] })
                : format(T.billingPage.pricingSection.currencyBadge.default, { currency: selectedCurrency.toUpperCase(), symbol: CURRENCY_SYMBOLS[selectedCurrency] })
              }
            </span>
          </div>
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 999,
              background: 'rgba(124, 58, 237, 0.08)', color: 'var(--violet-text)',
              letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 14,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {T.billingPage.pricingSection.secureCheckoutBadge}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: 1.2 }}>
              {T.billingPage.pricingSection.heading}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, maxWidth: 560, marginInline: 'auto', lineHeight: 1.55 }}>
              {T.billingPage.pricingSection.subheadingPrefix}{' '}
              <code style={{ background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>
                4242 4242 4242 4242
              </code>
              {T.billingPage.pricingSection.subheadingSuffix}
            </p>
          </div>

          {/* 4-column responsive grid */}
          <div style={{
            display:        'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap:            18,
            alignItems:     'stretch',
            justifyContent: 'center',
          }}>
            {PRICING_PLANS.map(p => {
              // Dynamic price from Firestore admin config (multi-currency)
              const dyn = p.key !== 'free' ? displayPricesByCurrency[p.key]?.[selectedCurrency] : undefined;
              const dynPlan: PricingPlan = dyn
                ? {
                    ...p,
                    price:       formatMoney(dyn.amount, dyn.currency),
                    priceSuffix: `/${dyn.interval}`,
                  }
                : p;
              return (
                <PricingCard
                  key={p.key}
                  plan={dynPlan}
                  isCurrent={subscription.plan === p.name && hasActiveSubscription}
                  loading={loadingPlan === p.key}
                  disabled={loadingPlan !== null && loadingPlan !== p.key}
                  onSubscribe={() => {
                    if (p.key === 'free') return;
                    void handleSubscribe(p.key);
                  }}
                />
              );
            })}
          </div>

          {checkoutError && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 8, fontSize: 13, textAlign: 'center' }}>
              {checkoutError}
            </div>
          )}
        </section>
      )}

      {/* Mock layer — legacy plan grid */}
      {!isBillingFirebase && (
        <div style={{ marginBottom: 28 }}>
          <SectionTitle>{T.billingPage.mockPlans.sectionTitle}</SectionTitle>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(['Free', 'Starter', 'Professional', 'Enterprise'] as PlanTier[]).map(tier => (
              <MockPlanCard
                key={tier}
                tier={tier}
                current={subscription.plan === tier}
                canUpgrade={canManage}
                onSelect={() => handleMockSelectPlan(tier)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>{T.billingPage.invoices.sectionTitle}</SectionTitle>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <InvoicesView
            isFirebaseLayer={isFirebaseLayer}
            hasActiveSubscription={hasActiveSubscription}
            stripeInvoices={stripeInvoices}
            invoicesLoading={invoicesLoading}
            mockInvoices={invoices}
          />
        </Card>
        {isFirebaseLayer && hasActiveSubscription && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            {T.billingPage.invoices.managedInStripeNote}
          </p>
        )}
      </div>

      {/* Mock layer confirm modal */}
      {confirmPlan && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500,
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 32, maxWidth: 380, width: '90%', boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              {format(T.billingPage.mockConfirm.title, { plan: confirmPlan })}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>
              {T.billingPage.mockConfirm.body}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmPlan(null)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {T.billingPage.mockConfirm.cancel}
              </button>
              <button
                type="button"
                onClick={handleMockConfirmUpgrade}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                {T.billingPage.mockConfirm.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
