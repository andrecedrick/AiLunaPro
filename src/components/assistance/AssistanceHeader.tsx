import { Button } from '../ui/Button';
import { useRoute } from '../../context/RouteContext';
import type { AuditResult, RiskLevel } from '../../types/scoring';
import { formatRiskLevel } from '@/utils/formatters';

const RISK_BADGE: Record<RiskLevel, { bg: string; fg: string }> = {
  low: { bg: 'var(--green-bg)', fg: 'var(--green-text)' },
  medium: { bg: 'var(--amber-bg)', fg: 'var(--amber-text)' },
  high: { bg: 'var(--red-bg)', fg: 'var(--red-text)' },
  critical: { bg: 'var(--critical-bg)', fg: 'var(--critical-text)' },
};

export function AssistanceHeader({ result }: { result: AuditResult }) {
  const { navigate } = useRoute();

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--brand-tint-bg)',
          color: 'var(--violet-text)',
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        ✨ Guided action plan
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
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
            Your Action Plan
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              maxWidth: 640,
            }}
          >
            We translated your audit answers into a sequenced, contextual plan. Read through each section below — every claim links back to your data.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Score {result.globalScore} / 100
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: RISK_BADGE[result.riskLevel].bg,
              color: RISK_BADGE[result.riskLevel].fg,
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {formatRiskLevel(result.riskLevel)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ name: 'audit/result' })}
          >
            ← Back to result
          </Button>
        </div>
      </div>
    </div>
  );
}
