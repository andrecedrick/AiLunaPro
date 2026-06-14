import { Button } from '../ui/Button';
import { useRoute } from '../../context/RouteContext';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
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
  const T = useLocale();

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
        {T.assistancePage.header.badge}
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
            {T.assistancePage.header.title}
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
            {T.assistancePage.header.intro}
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
            {format(T.assistancePage.header.score, { globalScore: result.globalScore })}
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
            {T.assistancePage.header.backToResult}
          </Button>
        </div>
      </div>
    </div>
  );
}
