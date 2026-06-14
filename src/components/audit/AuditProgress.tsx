import { useAudit } from '../../context/AuditContext';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import { qSection } from '../../lib/locale/i18n/questionsAccess';
import { auditSections } from '../../data/mockAuditQuestions';

export function AuditProgress() {
  const { currentStep, totalSteps, overallCompletion } = useAudit();
  const T = useLocale();
  const section = auditSections[currentStep];
  const sec = qSection(T, section.key);
  const pct = Math.round(overallCompletion * 100);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        padding: '18px 24px',
        boxShadow: 'var(--card-shadow)',
        marginBottom: 20,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Title row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'var(--violet-text)',
              marginBottom: 4,
            }}
          >
            {format(T.auditForm.stepOf, { current: currentStep + 1, total: totalSteps })}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: -0.3,
            }}
          >
            {sec?.title ?? section.title}
          </h2>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              marginTop: 4,
            }}
          >
            {sec?.subtitle ?? section.subtitle}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: 600,
            }}
          >
            {T.auditForm.overallProgress}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--text-primary)',
              marginTop: 2,
            }}
          >
            {pct}%
          </div>
        </div>
      </div>

      {/* Bar */}
      <div
        style={{
          height: 8,
          background: 'var(--track-bg)',
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
}
