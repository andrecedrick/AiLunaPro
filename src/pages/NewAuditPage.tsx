import { AuditShell } from '../components/audit/AuditShell';
import { useAudit } from '../context/AuditContext';

export function NewAuditPage() {
  const { status } = useAudit();

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
