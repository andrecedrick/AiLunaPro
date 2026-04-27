import { useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { useAudit } from '../context/AuditContext';
import { useRoute } from '../context/RouteContext';
import { auditSections } from '../data/mockAuditQuestions';

/**
 * Audit Result — UI shell only.
 * Score and recommendations are derived from a placeholder formula
 * (overall completion %), NOT real compliance scoring.
 * Phase 3+ will replace with real evaluation logic.
 */
export function AuditResultPage() {
  const { draft, completionByStep, overallCompletion, resetDraft } = useAudit();
  const { navigate } = useRoute();

  // Mock score: scaled completion (40 + 60 × completion). UI placeholder only.
  const score = useMemo(() => Math.round(40 + overallCompletion * 60), [overallCompletion]);
  const riskLabel = score >= 80 ? 'Low risk' : score >= 60 ? 'Medium risk' : 'High risk';
  const riskColor =
    score >= 80 ? 'var(--green-text)' : score >= 60 ? 'var(--amber-text)' : 'var(--red-text)';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-block',
            background: 'var(--green-bg)',
            color: 'var(--green-text)',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          ✓ Audit submitted
        </div>
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
          Audit Result
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: 'var(--text-muted)',
          }}
        >
          Submission ID&nbsp;
          <code style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
            {draft.id}
          </code>
        </p>
      </div>

      {/* Hero score card */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          padding: 28,
          boxShadow: 'var(--card-shadow)',
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: 28,
          alignItems: 'center',
          marginBottom: 20,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        {/* Big score */}
        <div
          style={{
            background: 'var(--brand-gradient)',
            borderRadius: 16,
            padding: '24px 12px',
            color: '#fff',
            textAlign: 'center',
            boxShadow: 'var(--card-shadow-glow)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              opacity: 0.85,
              fontWeight: 600,
            }}
          >
            Overall score
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 56,
              lineHeight: 1,
              marginTop: 6,
            }}
          >
            {score}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>out of 100</div>
        </div>

        {/* Risk + summary */}
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            Risk classification
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 700,
              color: riskColor,
              marginTop: 4,
            }}
          >
            {riskLabel}
          </div>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
            }}
          >
            This is a <strong>UI shell preview</strong>. Real scoring, recommendations and
            evidence-linked findings will be wired up in the next phase. The number above is
            derived from your overall completion rate as a placeholder.
          </p>
        </div>
      </div>

      {/* Section breakdown */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          padding: 24,
          boxShadow: 'var(--card-shadow)',
          marginBottom: 20,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--text-primary)',
          }}
        >
          Section breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {auditSections.map((section, idx) => {
            const pct = Math.round((completionByStep[idx] ?? 0) * 100);
            return (
              <div key={section.key}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {section.title}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: 'var(--bar-track)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'var(--brand-gradient)',
                      borderRadius: 999,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Button variant="primary" size="lg" onClick={() => navigate({ name: 'dashboard' })}>
          View on Dashboard →
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            resetDraft();
            navigate({ name: 'audit/new' });
          }}
        >
          Start a new audit
        </Button>
        <Button variant="ghost" size="lg" onClick={() => navigate({ name: 'dashboard' })}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
