import { Button } from '../ui/Button';
import { useRoute } from '../../context/RouteContext';

export function EmptyReportsState() {
  const { navigate } = useRoute();
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--card-radius)',
        padding: '40px 28px',
        textAlign: 'center',
        boxShadow: 'var(--card-shadow)',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--brand-tint-bg)',
          color: 'var(--violet-text)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
        }}
        aria-hidden
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--text-primary)',
          letterSpacing: -0.2,
        }}
      >
        No reports yet
      </h3>
      <p
        style={{
          margin: '6px auto 18px',
          fontSize: 13,
          color: 'var(--text-muted)',
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        Generate a report from any submitted audit. Reports are snapshotted, exportable, and
        shareable — and they stay stable even if you start a new audit.
      </p>
      <Button variant="primary" size="md" onClick={() => navigate({ name: 'audit/new' })}>
        + Start an audit
      </Button>
    </div>
  );
}
