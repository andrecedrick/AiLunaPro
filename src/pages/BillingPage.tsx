/**
 * BillingPage — Phase I (mock-only).
 * Displays plan, usage, invoices, upgrade/downgrade CTAs.
 * Role-gated: owner = full access, billing = read-only, admin/member = locked.
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBilling } from '../context/BillingContext';
import { PLAN_CONFIGS, type PlanTier } from '../types/billing';

/* ── Helpers ──────────────────────────────────────────────── */

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function pct(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/* ── Sub-components ───────────────────────────────────────── */

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
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 24,
      ...style,
    }}>
      {children}
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit === -1;
  const percent = unlimited ? 0 : pct(used, limit);
  const barColor = percent > 85 ? 'var(--red)' : percent > 60 ? 'var(--yellow)' : 'var(--violet)';

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {unlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: unlimited ? '0%' : `${percent}%`,
          background: barColor,
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}

function PlanCard({
  tier,
  current,
  canUpgrade,
  onSelect,
}: {
  tier: PlanTier;
  current: boolean;
  canUpgrade: boolean;
  onSelect: () => void;
}) {
  const config = PLAN_CONFIGS[tier];
  const tiers: PlanTier[] = ['Free', 'Starter', 'Professional', 'Enterprise'];
  // Not used currently, reserved for downgrade detection

  return (
    <div style={{
      border: current ? '2px solid var(--violet)' : '1px solid var(--border)',
      borderRadius: 12,
      padding: 20,
      background: current ? 'var(--brand-soft-bg)' : 'var(--surface)',
      position: 'relative',
      flex: 1,
      minWidth: 160,
    }}>
      {current && (
        <div style={{
          position: 'absolute', top: -1, right: 12,
          background: 'var(--violet)', color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '2px 8px',
          borderRadius: '0 0 6px 6px', letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>
          Current
        </div>
      )}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{tier}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: current ? 'var(--violet-text)' : 'var(--text-primary)', marginBottom: 12 }}>
        {config.monthlyPrice === 0 ? 'Free' : `$${config.monthlyPrice}`}
        {config.monthlyPrice > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>}
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
            width: '100%',
            padding: '8px 0',
            borderRadius: 8,
            border: 'none',
            background: 'var(--violet)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {tiers.indexOf(tier) > tiers.indexOf(PLAN_CONFIGS[tier].tier) ? 'Upgrade' : 'Switch'}
        </button>
      )}
      {!current && !canUpgrade && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 8 }}>
          Contact owner to change plan
        </div>
      )}
    </div>
  );
}

/* ── Locked view ──────────────────────────────────────────── */
function LockedView() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Billing access restricted
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        Contact your workspace owner to view or manage billing.
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────── */
export function BillingPage() {
  const { session } = useAuth();
  const { subscription, invoices, usage, upgradePlan, cancelPlan, resumePlan } = useBilling();
  const [confirmPlan, setConfirmPlan] = useState<PlanTier | null>(null);

  const role = session?.role ?? 'member';
  const canManage = role === 'owner';
  const canView = role === 'owner' || role === 'billing';

  if (!canView) return <LockedView />;

  const config = PLAN_CONFIGS[subscription.plan];

  const handleSelectPlan = (tier: PlanTier) => {
    if (!canManage) return;
    setConfirmPlan(tier);
  };

  const handleConfirmUpgrade = () => {
    if (!confirmPlan) return;
    upgradePlan(confirmPlan);
    setConfirmPlan(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Billing
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          Manage your plan, usage, and invoices.
          {!canManage && <span style={{ color: 'var(--yellow-text)', marginLeft: 6 }}>Read-only view.</span>}
        </p>
      </div>

      {/* Current plan summary */}
      <Card style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
              Current plan
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                {subscription.plan}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                background: subscription.status === 'active' ? 'var(--green-soft-bg)' : 'var(--red-soft-bg)',
                color: subscription.status === 'active' ? 'var(--green-text)' : 'var(--red-text)',
              }}>
                {subscription.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {config.monthlyPrice === 0
                ? 'Free plan'
                : `$${subscription.billingCycle === 'annual' ? config.annualPrice : config.monthlyPrice}/mo · billed ${subscription.billingCycle}`
              }
              {' · '}
              Renews {formatDate(subscription.currentPeriodEnd)}
            </div>
            {subscription.cancelAtPeriodEnd && (
              <div style={{ fontSize: 13, color: 'var(--yellow-text)', marginTop: 6, fontWeight: 600 }}>
                ⚠ Cancels at period end ({formatDate(subscription.currentPeriodEnd)})
              </div>
            )}
          </div>
          {canManage && (
            <div style={{ display: 'flex', gap: 8 }}>
              {subscription.cancelAtPeriodEnd ? (
                <button
                  type="button"
                  onClick={resumePlan}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--violet)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  Resume plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={cancelPlan}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel plan
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Usage */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Usage this period</SectionTitle>
        <Card>
          <UsageBar label="Audits" used={usage.auditsUsed} limit={usage.auditsLimit} />
          <UsageBar label="Seats" used={usage.seatsUsed} limit={usage.seatsLimit} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Period: {formatDate(usage.periodStart)} – {formatDate(usage.periodEnd)}
          </div>
        </Card>
      </div>

      {/* Plan selector */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Plans</SectionTitle>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(['Free', 'Starter', 'Professional', 'Enterprise'] as PlanTier[]).map(tier => (
            <PlanCard
              key={tier}
              tier={tier}
              current={subscription.plan === tier}
              canUpgrade={canManage}
              onSelect={() => handleSelectPlan(tier)}
            />
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Invoices</SectionTitle>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {invoices.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>No invoices yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'Description', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                      {formatDate(inv.date)}
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-primary)' }}>
                      {inv.description}
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatAmount(inv.amount)}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                        background: inv.status === 'paid' ? 'var(--green-soft-bg)' : 'var(--yellow-soft-bg)',
                        color: inv.status === 'paid' ? 'var(--green-text)' : 'var(--yellow-text)',
                      }}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Confirm plan change modal (simple inline) */}
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
              Switch to {confirmPlan}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>
              This is a mock action — no real charge will occur.
              In production, this will redirect to Stripe Checkout.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmPlan(null)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Confirm (mock)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
