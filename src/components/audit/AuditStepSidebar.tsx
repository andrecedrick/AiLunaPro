import { useAudit } from '../../context/AuditContext';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import { qSection } from '../../lib/locale/i18n/questionsAccess';
import { auditSections } from '../../data/mockAuditQuestions';

type StepStatus = 'done' | 'in-progress' | 'pending';

function getStatus(completion: number): StepStatus {
  if (completion >= 1) return 'done';
  if (completion > 0) return 'in-progress';
  return 'pending';
}

function StatusDot({ status, active }: { status: StepStatus; active: boolean }) {
  const size = 24;
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
  };

  if (status === 'done') {
    return (
      <span
        style={{
          ...baseStyle,
          background: 'var(--brand-gradient)',
          color: '#fff',
          border: 'none',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }

  if (active) {
    return (
      <span
        style={{
          ...baseStyle,
          background: 'var(--brand-soft-bg)',
          color: 'var(--violet-text)',
          border: '1.5px solid var(--violet)',
        }}
      >
        ●
      </span>
    );
  }

  return (
    <span
      style={{
        ...baseStyle,
        background: 'transparent',
        color: 'var(--text-muted)',
        border: `1.5px solid ${status === 'in-progress' ? 'var(--violet)' : 'var(--border)'}`,
      }}
    >
      {status === 'in-progress' ? '●' : ''}
    </span>
  );
}

export function AuditStepSidebar() {
  const { currentStep, completionByStep, goToStep } = useAudit();
  const T = useLocale();

  return (
    <aside
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        position: 'sticky',
        top: 92,
        alignSelf: 'flex-start',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          padding: '6px 10px 10px',
        }}
      >
        {T.questions.ui.sectionsNav}
      </div>

      {auditSections.map((section, idx) => {
        const active = idx === currentStep;
        const status = getStatus(completionByStep[idx] ?? 0);
        const visited = idx <= currentStep || status !== 'pending';

        return (
          <button
            key={section.key}
            type="button"
            onClick={() => visited && goToStep(idx)}
            disabled={!visited}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 10,
              border: 'none',
              background: active ? 'var(--brand-soft-bg)' : 'transparent',
              cursor: visited ? 'pointer' : 'not-allowed',
              opacity: visited ? 1 : 0.55,
              fontFamily: 'var(--font-body)',
              textAlign: 'left',
              position: 'relative',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              if (!active && visited) e.currentTarget.style.background = 'var(--surface-2)';
            }}
            onMouseLeave={e => {
              if (!active) e.currentTarget.style.background = 'transparent';
            }}
          >
            {active && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  height: '60%',
                  width: 3,
                  borderRadius: '0 3px 3px 0',
                  background: 'var(--brand-gradient)',
                }}
              />
            )}
            <StatusDot status={status} active={active} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--violet-text)' : 'var(--text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {qSection(T, section.key)?.title ?? section.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {format(T.questions.ui.questionCount, { n: section.questions.length })}
              </div>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
