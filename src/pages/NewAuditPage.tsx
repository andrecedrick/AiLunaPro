import { AuditShell } from '../components/audit/AuditShell';

export function NewAuditPage() {
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
          Walk through 8 sections to assess your AI compliance posture. Your draft is saved
          locally as you go — you can leave and come back anytime.
        </p>
      </div>

      <AuditShell />
    </div>
  );
}
