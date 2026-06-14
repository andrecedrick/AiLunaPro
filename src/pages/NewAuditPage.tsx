import { useEffect } from 'react';
import { AuditShell } from '../components/audit/AuditShell';
import { useAudit } from '../context/AuditContext';
import { useLocale } from '../context/LocaleContext';
import { advanceJourney } from '../lib/journey/journeyState';

export function NewAuditPage() {
  const { status } = useAudit();
  const F = useLocale().auditForm;

  // B8.3: entering the New Audit flow = the "Audit" journey step (monotonic).
  useEffect(() => { advanceJourney('audit'); }, []);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 8 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 26,
            color: 'var(--text-primary)',
            letterSpacing: -0.5,
          }}
        >
          {F.pageTitle}
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}
        >
          {F.pageIntro}
        </p>
      </div>

      {status === 'loading' ? (
        <div
          style={{
            padding: '48px 0',
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--text-muted)',
          }}
        >
          {F.loading}
        </div>
      ) : status === 'forbidden' ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: 460,
            margin: '0 auto',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            {F.forbiddenTitle}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.55 }}>
            {F.forbiddenBody}
          </div>
        </div>
      ) : status === 'error' ? (
        <div
          style={{
            padding: '48px 0',
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--red-text)',
          }}
        >
          {F.errorLoad}
        </div>
      ) : (
        <AuditShell />
      )}
    </div>
  );
}
