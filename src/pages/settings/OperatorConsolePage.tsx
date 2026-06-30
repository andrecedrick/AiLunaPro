/**
 * OperatorConsolePage — J7 (J7A read-only console + J7B guided setup).
 *
 * Platform-operator-only, READ-ONLY. Aggregates masked/boolean status from
 * /api/platform/ops-status + Stripe config-status, plus static posture notes
 * (App Check monitor, auth-email model, custom sender domain). Provides
 * copyable `wrangler secret put` commands — NO secret input, NO saving, NO
 * value display, NO Cloudflare API. Wrangler stays the secret-writing path.
 *
 * Gate: fetchPlatformMe → non-admins see the "Managed by platform operator"
 * notice (same as BillingSettings); admins see the console.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRoute } from '../../context/RouteContext';
import { useToast } from '../../hooks/useToast';
import { fetchPlatformMe } from '../../lib/platform/platformService';
import { fetchOpsStatus, type OpsStatus } from '../../lib/platform/opsStatusService';
import { fetchPlatformMetrics, type PlatformMetrics } from '../../lib/platform/metricsService';
import { fetchBillingConfigStatus } from '../../lib/billing/configService';
import type { BillingConfigStatus } from '../../types/billingConfig';

const WRANGLER_ENV = '--env production';

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 20,
        background: ok ? 'var(--green-soft-bg, #e8f6ee)' : 'var(--surface-2)',
        color: ok ? 'var(--green-text)' : 'var(--text-muted)',
      }}
    >
      {ok ? 'Configured' : 'Not set'}
    </span>
  );
}

function Row({
  label,
  ok,
  secretName,
  onCopy,
}: {
  label: string;
  ok: boolean;
  secretName?: string;
  onCopy?: (name: string) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 200, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
        {label}
        {secretName && (
          <code
            style={{
              marginLeft: 8,
              fontSize: 11,
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              background: 'var(--surface-2)',
              padding: '1px 6px',
              borderRadius: 4,
            }}
          >
            {secretName}
          </code>
        )}
      </div>
      <StatusPill ok={ok} />
      {secretName && !ok && onCopy && (
        <button
          type="button"
          onClick={() => onCopy(secretName)}
          title={`Copy: npx wrangler secret put ${secretName} ${WRANGLER_ENV}`}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--violet)',
            background: 'transparent',
            color: 'var(--violet-text)',
            cursor: 'pointer',
          }}
        >
          ⧉ Copy setup command
        </button>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          margin: '0 0 8px',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '4px 16px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function formatCents(cents: number): string {
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-2, var(--surface))',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

export function OperatorConsolePage() {
  const { navigate } = useRoute();
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [ops, setOps] = useState<OpsStatus | null>(null);
  const [stripe, setStripe] = useState<BillingConfigStatus | null>(null);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPlatformMe()
      .then(me => {
        if (!active) return;
        setIsAdmin(me.isPlatformAdmin);
        if (!me.isPlatformAdmin) {
          setLoading(false);
          return;
        }
        setMetricsLoading(true);
        return Promise.allSettled([
          fetchOpsStatus(),
          fetchBillingConfigStatus(),
          fetchPlatformMetrics(),
        ]).then(([o, s, m]) => {
          if (!active) return;
          if (o.status === 'fulfilled') setOps(o.value);
          if (s.status === 'fulfilled') setStripe(s.value);
          if (m.status === 'fulfilled') setMetrics(m.value);
          setLoading(false);
          setMetricsLoading(false);
        });
      })
      .catch(() => {
        if (!active) return;
        setIsAdmin(false);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const copyCmd = useCallback(
    (name: string) => {
      const cmd = `npx wrangler secret put ${name} ${WRANGLER_ENV}`;
      navigator.clipboard.writeText(cmd).then(
        () => showToast('Setup command copied.', 'success'),
        () => showToast('Could not copy. Command: ' + cmd, 'warning'),
      );
    },
    [showToast],
  );

  if (isAdmin === null || loading) {
    return <Notice title="Checking access…" body="Resolving operator status." />;
  }
  if (!isAdmin) {
    return (
      <Notice
        title="Managed by the platform operator"
        body="This area is restricted to AiLunaPro platform operators."
      />
    );
  }

  const s = ops?.secrets;

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '8px 4px 60px' }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 28,
            color: 'var(--text-primary)',
            letterSpacing: -0.5,
          }}
        >
          Operator Console
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 640 }}>
          Read-only operational status. Secrets are set via the Wrangler CLI — this page
          shows configuration status and copyable setup commands only. No secret values are
          ever displayed or editable here.
        </p>
        {ops && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            Environment: <strong style={{ color: 'var(--text-primary)' }}>{ops.appEnv}</strong>
            {' · '}Stripe mode: <strong style={{ color: 'var(--text-primary)' }}>{ops.stripeMode}</strong>
          </div>
        )}
      </div>

      {!ops && (
        <div
          style={{
            background: 'var(--yellow-soft-bg)',
            color: 'var(--yellow-text)',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          Ops status unavailable (request blocked or failed). Status booleans below may be incomplete.
        </div>
      )}

      {/* J8: Platform Metrics — aggregates only, no PII. */}
      <Section title="Platform metrics (aggregate)">
        {metricsLoading ? (
          <div style={{ padding: '14px 0', fontSize: 13, color: 'var(--text-muted)' }}>
            Loading metrics…
          </div>
        ) : !metrics ? (
          <div style={{ padding: '14px 0', fontSize: 13, color: 'var(--text-muted)' }}>
            Metrics unavailable (request failed or blocked). No customer data is fetched here.
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 14,
                padding: '12px 0',
              }}
            >
              <MetricCard label="MRR (test)" value={formatCents(metrics.mrrCents)} sub={`${metrics.activeSubscriptions} active subs`} />
              <MetricCard label="Active subs" value={String(metrics.activeSubscriptions)} sub="paying customers" />
              <MetricCard
                label="Recent invoices"
                value={String(metrics.recentInvoices.total)}
                sub={`paid ${metrics.recentInvoices.paid} · open ${metrics.recentInvoices.open}${metrics.recentInvoices.uncollectible ? ` · uncoll. ${metrics.recentInvoices.uncollectible}` : ''}${metrics.recentInvoices.void ? ` · void ${metrics.recentInvoices.void}` : ''}`}
              />
              <MetricCard
                label="Token-active orgs"
                value={String(metrics.tokenActiveOrgsCount)}
                sub="balance > 0"
              />
            </div>
            <div style={{ padding: '0 0 10px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {metrics.stripeUnavailable && (
                <div style={{ color: 'var(--yellow-text)' }}>
                  ⚠ Stripe API temporarily unavailable — Stripe-derived values may be partial.
                </div>
              )}
              <div>
                Last invoice event:{' '}
                {metrics.recentInvoices.lastEventAt
                  ? new Date(metrics.recentInvoices.lastEventAt).toLocaleString()
                  : '—'}
                {' · '}generated {new Date(metrics.generatedAt).toLocaleTimeString()} (60s cache)
              </div>
              <div style={{ fontStyle: 'italic' }}>
                Aggregates only — no customer IDs, emails, or per-tenant data.
              </div>
            </div>
          </>
        )}
      </Section>

      {s && (
        <>
          <Section title="Stripe — secrets (set via Wrangler)">
            <Row label="Secret key" secretName="STRIPE_SECRET_KEY" ok={s.stripeSecretKey} onCopy={copyCmd} />
            <Row label="Webhook secret" secretName="STRIPE_WEBHOOK_SECRET" ok={s.stripeWebhookSecret} onCopy={copyCmd} />
            <Row label="Token price — Overage" secretName="STRIPE_TOKEN_PRICE_OVERAGE" ok={s.tokenPriceOverage ?? false} onCopy={copyCmd} />
            <Row label="Token price — Starter" secretName="STRIPE_TOKEN_PRICE_STARTER" ok={s.tokenPriceStarter} onCopy={copyCmd} />
            <Row label="Token price — Pro" secretName="STRIPE_TOKEN_PRICE_PRO" ok={s.tokenPricePro} onCopy={copyCmd} />
            <Row label="Token price — Max" secretName="STRIPE_TOKEN_PRICE_MAX" ok={s.tokenPriceMax} onCopy={copyCmd} />
          </Section>

          <Section title="Platform & integrations">
            <Row label="Firebase service account" secretName="FIREBASE_SERVICE_ACCOUNT_JSON" ok={s.firebaseServiceAccount} onCopy={copyCmd} />
            <Row label="Turnstile secret" secretName="TURNSTILE_SECRET_KEY" ok={s.turnstileSecret} onCopy={copyCmd} />
            <Row label="Sequenzy API key (team invites)" secretName="SEQUENZY_API_KEY" ok={s.sequenzyApiKey} onCopy={copyCmd} />
            <Row label="Platform admin allowlist" secretName="PLATFORM_ADMIN_EMAILS" ok={s.platformAdminEmails} onCopy={copyCmd} />
            <Row label="App base URL" secretName="APP_BASE_URL" ok={s.appBaseUrl} onCopy={copyCmd} />
          </Section>
        </>
      )}

      {stripe && (
        <Section title="Stripe — public config (masked)">
          <Row label={`Publishable key${stripe.publishableKey.last4 ? ` ····${stripe.publishableKey.last4}` : ''}`} ok={stripe.publishableKey.configured} />
          <Row label="Price ID — Starter" ok={stripe.priceIds.starter.configured} />
          <Row label="Price ID — Professional" ok={stripe.priceIds.professional.configured} />
          <Row label="Price ID — Enterprise" ok={stripe.priceIds.enterprise.configured} />
          <div style={{ padding: '12px 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Webhook — last event: {stripe.webhook.lastEventId ?? '—'}
            {' · '}last verified:{' '}
            {stripe.webhook.lastVerified === null ? '—' : stripe.webhook.lastVerified ? '✓' : '✗'}
            {stripe.webhook.lastError ? ` · error: ${stripe.webhook.lastError}` : ''}
          </div>
        </Section>
      )}

      <Section title="Security posture (read-only notes)">
        <div style={{ padding: '12px 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div>• <strong>App Check</strong>: monitor mode, enforcement OFF (dedicated gate, §9.19).</div>
          <div>• <strong>Auth emails</strong>: Firebase Auth (verification + password reset); Sequenzy = team invites only (§9.20).</div>
          <div>• <strong>Custom sender domain</strong> <code style={{ fontFamily: 'monospace' }}>mail.ailunapro.com</code>: pending Firebase DNS verification — sender may still be the default Firebase address.</div>
          <div>• <strong>Secrets</strong>: written via <code style={{ fontFamily: 'monospace' }}>wrangler secret put … {WRANGLER_ENV}</code>. Never stored in Firestore, never editable from the UI.</div>
        </div>
      </Section>

      <button
        type="button"
        onClick={() => navigate({ name: 'settings/billing' })}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 13,
          color: 'var(--violet-text)',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          padding: 0,
        }}
      >
        ← Back to Billing settings
      </button>
    </div>
  );
}
