import { useEffect } from 'react';
import { AuditShell } from '../components/audit/AuditShell';
import { useAudit } from '../context/AuditContext';
import { advanceJourney } from '../lib/journey/journeyState';

export function NewAuditPage() {
  const { status } = useAudit();

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
          New Audit
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}
        >
          Walk through 8 sections to assess your AI compliance posture. Your progress is saved
          as you go — you can leave and come back anytime.
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
          Loading audit…
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
            Your role doesn't allow creating audits
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.55 }}>
            Audits are available to Owner, Admin, and Member roles. Ask a workspace
            owner or admin if you need audit access.
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
          Failed to load audit. Refresh to retry.
        </div>
      ) : (
        <AuditShell />
      )}
    </div>
  );
}
