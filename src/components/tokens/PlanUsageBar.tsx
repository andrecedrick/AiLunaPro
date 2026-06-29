/**
 * PlanUsageBar — Phase 3 (Part 3): shows this month's audit usage vs the plan's
 * included allowance ("X / Y audits this month"), a progress bar, and a limit-
 * reached message (Free → upgrade CTA; paid → "extra audits use tokens").
 *
 * Read-only — reads GET /api/usage/current. When ENABLE_PLAN_LIMITS is OFF the
 * endpoint reports enforced:false and used:0, so this just shows the allowance
 * ("15 audits/month included") with no misleading "0/15".
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRoute } from '../../context/RouteContext';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import { fetchCurrentUsage, type PlanUsage } from '../../lib/tokens/tokensClient';

export function PlanUsageBar() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const T = useLocale();
  const P = T.tokensPage.planUsage;
  const orgId = session?.orgId ?? null;
  const [usage, setUsage] = useState<PlanUsage | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const { auth } = await import('../../lib/firebase-auth');
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) return;
        const u = await fetchCurrentUsage(orgId, idToken);
        if (!cancelled) setUsage(u);
      } catch { /* non-critical — silently skip the usage panel */ }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  if (!usage) return null;
  const { audits, enforced, plan } = usage;
  const unlimited = audits.limit === -1;
  const reached   = enforced && !unlimited && audits.used >= audits.limit;
  const isFree    = plan === 'free';
  const pct       = unlimited || audits.limit <= 0 ? 0 : Math.min(100, Math.round((audits.used / audits.limit) * 100));

  const main = unlimited
    ? P.unlimited
    : enforced
      ? format(P.thisMonth, { used: audits.used, limit: audits.limit })
      : format(P.included,  { limit: audits.limit });

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        {P.title}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: enforced && !unlimited ? 10 : 0, fontVariantNumeric: 'tabular-nums' }}>
        {main}
      </div>
      {enforced && !unlimited && (
        <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: reached ? 'var(--red-text)' : 'var(--brand-gradient)', transition: 'width 0.3s ease' }} />
        </div>
      )}
      {reached && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: isFree ? 'var(--red-text)' : 'var(--text-secondary)' }}>
            {isFree ? format(P.limitFree, { limit: audits.limit }) : format(P.limitPaid, { used: audits.used, limit: audits.limit })}
          </span>
          {isFree && (
            <button
              type="button"
              onClick={() => navigate({ name: 'billing' })}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              {P.upgradeCta}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
